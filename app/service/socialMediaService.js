const Service = require('egg').Service;
const utils = require('web3').utils;
const constant = require('../utils/constant');
const {BIND_STATUS_ACTIVE, MSG_ACTION_FOLLOW, MSG_ACTION_LIKE, MSG_ACTION_UNLIKE} = require("../utils/constant");
const {getTwitterCounts} = require("../utils/utils");

class SocialMediaService extends Service {
    async addBind(addr, platform, tid) {
        const mysql = this.app.mysql.get('app');
        const isExisted = await mysql.select('bind_addr', {where: {addr: addr, platform: platform, tid: tid}});
        if (isExisted.length === 0) {
            // the new bind
            const bind = {
                addr: addr,
                platform: platform,
                tid: tid,
                content_id: "",
                status: constant.BIND_STATUS_ACTIVE,
                bind_time: Date.now()
            };
            const referralCode = await mysql.select('accept_referral', {where: {addr: addr}});
            if (referralCode.length !== 0) {
                bind.accept_referral_code = referralCode[0].code;
                bind.accept_referral_time = referralCode[0].timestamp;
            }
            await mysql.insert('bind_addr', bind);
        } else {
            await mysql.update('bind_addr', {status: constant.BIND_STATUS_ACTIVE}, {
                where: {
                    addr: addr,
                    platform: platform,
                    tid: tid
                }
            });
        }
    }

    async recordContentId(addr, platform, tid, contentId) {
        const mysql = this.app.mysql.get('app');
        const result = await mysql.update('bind_addr', {content_id: contentId}, {
            where: {
                addr: addr,
                platform: platform,
                tid: tid,
                status: BIND_STATUS_ACTIVE,
                content_id: ''
            }
        });
        if (result.affectedRows !== 1) {
            throw new Error('No bind');
        }
    }

    async unbind(addr, platform, tid) {
        const mysql = this.app.mysql.get('app');
        await mysql.update('bind_addr', {status: constant.BIND_STATUS_DEACTIVE, content_id: ""}, {
            where: {
                addr: addr,
                platform: platform,
                tid: tid
            }
        });
    }

    async queryBind(addr, tid) {
        let condition = [];
        let param = [];
        if (addr) {
            condition.push('addr=?');
            param.push(addr);
        }
        if (tid) {
            condition.push('tid=?');
            param.push(tid);
        }
        condition.push('status=?');
        param.push(constant.BIND_STATUS_ACTIVE);
        let sql = 'select * from bind_addr where ' + condition.join(' and ');
        return this.app.mysql.get('app').query(sql, param);
    }

    async acceptReferral(addr, code) {
        const mysql = this.app.mysql.get('app');
        const result = await mysql.select('bind_addr', {where: {self_referral_code: code}});
        if (result.length === 0) {
            throw new Error('Nonexistent Ref Code');
        }
        if (result[0].addr === addr) {
            throw new Error('Cannot Ref Self');
        }
        try {
            const now = Date.now();
            /// @notice: use insert, not replace
            await mysql.insert('accept_referral', {
                addr: addr, code: code, timestamp: now
            });
            // update bind_addr, so user could bind first and then accept referral
            // don't worry about accept different referral code, because table`accept_referral` has guaranteed that one
            // addr could only accept one referral
            await mysql.update('bind_addr', {accept_referral_code: code, accept_referral_time: now},
                {where: {addr: addr}});
        } catch (e) {
            throw new Error("Internal Error");
        }
    }

    /// @notice: should bind addr firstly
    async generateReferralCode(addr, platform, tid) {
        const code = utils.keccak256(addr + platform + tid).slice(2);
        const result = await this.app.mysql.get('app').update('bind_addr', {self_referral_code: code}, {
            where: {
                addr: addr,
                platform: platform,
                tid: tid,
                self_referral_code: null
            }
        });
        if (result.affectedRows === 1) {
            return code;
        } else {
            throw new Error('Nonexistent Bind Attr | Already Generated');
        }
    }

    async getBindCode(addr) {
        const result = await this.app.mysql.get('app').select('accept_referral', {
            where: {
                addr: addr
            }
        });
        if (result.length === 0) {
            return "";
        }
        return result[0].code;
    }

    async getSelfReferralCode(addr, platform, tid) {
        const results = await this.app.mysql.get('app').select('bind_addr', {
            where: {
                addr: addr,
                platform: platform,
                tid: tid,
            },
            columns: ['self_referral_code']
        });
        if (results.length === 0) {
            return "";
        }
        return results[0].self_referral_code;
    }

    async getReferralCodeCount(code) {
        const result = await this.app.mysql.get('app').query(
            'select count(distinct addr) as refCount from bind_addr where accept_referral_code=? and' +
            ' `status`=? and (ISNULL(self_referral_code) or accept_referral_code!=self_referral_code)',
            [code, constant.BIND_STATUS_ACTIVE]);
        return result[0]['refCount'];
    }

    async getNFTTwitterCounts(chainName, contract, tokenId) {
        let result = await this.app.mysql.get('app')
            .query(`select sum(retweet_count) as retweet_count,
                           sum(reply_count)   as reply_count,
                           sum(like_count)    as like_count,
                           sum(quote_count)   as quote_count
                    from twitter_counts
                    where tid in (select tid
                                  from twitter_nft
                                  where chain_name = ?
                                    and contract = ?
                                    and token_id = ?)
            `, [chainName, contract, tokenId]);
        return result[0];
    }

    async getNFTTwitterSnapshot(chainName, contract, tokenId, start, count) {
        if (!count) {
            count = 49;
        } else if (count > 99) {
            count = 99
        }
        const mysql = this.app.mysql.get('app');
        let sql = `select sum(retweet_count) as retweet_count,
                          sum(reply_count)   as reply_count,
                          sum(like_count)    as like_count,
                          sum(quote_count)   as quote_count,
                          snapshot_time
                   from twitter_counts_snapshot
                   where tid in (select tid
                                 from twitter_nft
                                 where chain_name = ?
                                   and contract = ?
                                   and token_id = ?)
                     and snapshot_time >= ?
                   group by snapshot_time
                   order by snapshot_time
                   limit ?`;
        let results = await mysql.query(sql, [chainName, contract, tokenId, start, count]);
        let latest = await this.getNFTTwitterCounts(chainName, contract, tokenId);
        latest.snapshot_time = new Date().toISOString();
        results.push(latest);
        return {
            start: start,
            data: results
        }
    }

    async addTwitterNFT(chainName, contract, tokenId, tid, userImg, userId, userName, tContent) {
        const mysql = this.app.mysql.get('app');
        let counts = await getTwitterCounts([tid]);
        counts = counts.get(tid);
        counts.tid = tid;
        await mysql.query(`replace into twitter_counts
                           values (${tid}, ${counts.retweet_count}, ${counts.reply_count}, ${counts.like_count},
                                   ${counts.quote_count})`);
        await mysql.insert('twitter_nft', {
            chain_name: chainName,
            contract: contract,
            token_id: tokenId,
            tid: tid,
            user_img: userImg,
            user_id: userId,
            user_name: userName,
            t_content: tContent
        });
    }

    async getTwitterNFT(chainName, contract, tokenId, tid, limit, offset) {
        const mysql = this.app.mysql.get('app');
        if (chainName && contract && tokenId) {
            return mysql.select('twitter_nft', {
                where: {
                    chain_name: chainName,
                    contract: contract,
                    token_id: tokenId
                },
                orders: [['tid', 'desc']],
                limit: limit,
                offset: offset,
            });
        } else {
            return mysql.select('twitter_nft', {
                where: {tid: tid},
                orders: [['tid', 'desc']],
                limit: limit,
                offset: offset,
            });
        }
    }

    async recordTGMsg(params) {
        await this.app.mysql.get('app').query(`replace into tg_msg
                                               values (?, ?, ?, ?)`,
            [params.group_id, params.message_id, params.type, params.data]);
    }

    async actionOnTGMsg(params) {
        const mysql = await this.app.mysql.get('app');
        const where = {
            group_id: params.group_id,
            message_id: params.message_id,
            sender: params.sender,
        };
        if (params.undo) {
            const field = {};
            field[params.action] = false;
            const result = await mysql.update(`tg_msg_status`, field, {
                where: where
            })
            return result.affectedRows === 1;
        } else {
            const existed = await mysql.get(`tg_msg_status`, where);
            if (existed) {
                existed[params.action] = true;
                if (params.action === MSG_ACTION_LIKE) {
                    existed.unlike = false;
                } else if (params.action === MSG_ACTION_UNLIKE) {
                    existed.like = false;
                }
                const res = await mysql.update(`tg_msg_status`, existed, {where: where})
                return res.affectedRows === 1;
            } else {
                const field = {
                    group_id: params.group_id,
                    message_id: params.message_id,
                    sender: params.sender,
                    nft_contract: params.nft_contract,
                    nft_token_id: params.nft_token_id,
                };
                field[params.action] = true;
                const res = await mysql.insert(`tg_msg_status`, field);
                return res.affectedRows === 1;
            }
        }
    }

    async queryTGGroupMsgStatus(group_id, order_by, query_origin_msg, limit, offset) {
        if (!order_by) {
            order_by = 'like';
        }
        const mysql = await this.app.mysql.get('app');
        let total = await mysql.query(`select count(distinct (message_id)) as total
                                       from tg_msg_status
                                       where group_id = ?`, [group_id]);
        if (!total || total.length === 0) {
            return {total: 0, data: {}}
        }
        total = total[0].total;
        let sql = `select message_id,
                          nft_contract,
                          nft_token_id,
                          sum(\`like\`) as 'like',
                          sum(unlike)   as unlike,
                          sum(follow)   as follow
                   from tg_msg_status
                   where group_id = ?
                   group by message_id, nft_contract, nft_token_id
                   order by \`${order_by}\` desc`;
        if (offset && limit) {
            sql += ' limit ' + offset + ', ' + limit
        } else if (limit) {
            sql += ' limit ' + limit;
        }
        let data = await mysql.query(sql, [group_id]);
        if (query_origin_msg) {
            let msgIds = data.map(item => item.message_id);
            let msgRaw = await mysql.select(`tg_msg`, {where: {group_id: group_id, message_id: msgIds}});
            for (const msg of data) {
                let raw = msgRaw.find(item => item.message_id === msg.message_id);
                if (raw) {
                    msg.type = raw.type;
                    msg.data = raw.data;
                }
            }
        }
        return {total: total, data: data};
    }

    async queryTGMsgStatus(group_id, message_id, query_origin_msg) {
        let sql = `select nft_contract,
                          nft_token_id,
                          sum(\`like\`) as 'like',
                          sum(unlike)   as unlike,
                          sum(follow)   as follow
                   from tg_msg_status
                   where group_id = ?
                     and message_id = ?
                   group by nft_contract, nft_token_id`;
        let data = await this.app.mysql.get('app').query(sql, [group_id, message_id]);
        if (!data || data.length === 0) {
            return [];
        }
        if (query_origin_msg) {
            let msgRaw = await this.app.mysql.get('app').get(`tg_msg`, {group_id: group_id, message_id: message_id});
            if (msgRaw !== undefined) {
                for (const d of data) {
                    d.type = msgRaw.type;
                    d.data = msgRaw.data;
                }
            }
        }
        return data;
    }

    async queryTGRawMsg(group_id, message_id, type, data, limit, offset) {
        let sql = `select count(*) as total
                   from tg_msg
                   where group_id = ?`;
        let params = [group_id];
        let condition = {
            where: {group_id: group_id},
        }
        if (message_id !== undefined) {
            condition.where.message_id = message_id;
            sql += ` and message_id=?`
            params.push(message_id);
        }
        if (type !== undefined) {
            condition.where.type = type;
            sql += ` and type=?`
            params.push(type);
        }
        if (data !== undefined) {
            condition.where.data = data;
            sql += ` and data=?`
            params.push(data);
        }
        let total = await this.app.mysql.get('app').query(sql, params);
        if (!total || total.length === 0 || total[0].total === 0) {
            return {total: 0, data: []};
        }
        if (limit) {
            condition.limit = limit
        }
        if (offset) {
            condition.offset = offset;
        }
        return {total: total[0].total, data: await this.app.mysql.get('app').select(`tg_msg`, condition)};
    }

    async recordLaunchpad(params) {
        try {
            await this.app.mysql.get('app').insert(`ton_launchpad`, params);
        } catch (e) {
            this.app.logger.error('insert new launchpad, ', e);
            throw new Error('insert failed');
        }
    }

    async queryLaunchpad(groupId, isMainnet, orderMode, limit, offset) {
        let total = await this.app.mysql.get('app').query(`select count(*) as total
                                                           from ton_launchpad
                                                           where group_id = ?
                                                             and is_mainnet = ?`, [groupId, isMainnet]);
        if (!total || total[0].total === 0) {
            return {total: 0, data: []};
        }
        total = total[0].total;
        let sql = `select *, start_time + ton_launchpad.duration < UNIX_TIMESTAMP() as ended
                   from ton_launchpad
                   where group_id = ?
                     and is_mainnet = ?
                   order by start_time desc `;
        if (orderMode === "2") {
            sql += ', ended';
        }
        if (offset && limit) {
            sql += ' limit ' + offset + ', ' + limit
        } else if (limit) {
            sql += ' limit ' + limit;
        }
        let res = await this.app.mysql.get('app').query(sql, [groupId, isMainnet]);
        return {total: total, data: res};
    }

    async queryTonCampaign(collection_id, is_mainnet, limit, offset) {
        let isMainnet = !is_mainnet ? 0 : 1;
        const total = await this.app.mysql.get('app').query(`select count(*) as total
                                                             from ton_campaign
                                                             where collection_id = ?
                                                               and is_mainnet = ?`, [collection_id, isMainnet]);
        if (!total || total.length === 0 || total[0].total === 0) {
            return {total: 0, data: []};
        }
        const data = await this.app.mysql.get('app').select(`ton_campaign`, {
            where: {collection_id: collection_id, is_mainnet: isMainnet},
            columns: ['campaign_id', 'title', 'description', 'image_url', 'rewards', 'rewards_url', 'start_time', 'end_time'],
            limit: limit,
            offset: offset,
            orders: [['start_time', 'asc'], ['end_time', 'desc']],
        });
        return {total: total[0].total, data: data};
    }

    async queryTonCampaignTasks(campaign_id, address, limit, offset) {
        const total = await this.app.mysql.get('app').query(`select count(*) as total
                                                             from ton_campaign_tasks
                                                             where campaign_id = ?`, [campaign_id]);
        if (!total || total.length === 0 || total[0].total === 0) {
            return {total: 0, data: []};
        }
        const data = await this.app.mysql.get('app').select(`ton_campaign_tasks`, {
            where: {campaign_id: campaign_id},
            columns: ['task_id', 'task', 'task_type', 'target', 'score'],
            limit: limit,
            offset: offset,
        });
        if (address) {
            const userCompleted = await this.queryTonUserCampaignTasks(address, campaign_id);
            for (const completedId of userCompleted) {
                for (const item of data) {
                    if (item.task_id === completedId) {
                        item.completed_by_addr = true;
                        break;
                    }
                }
            }
        }
        return {total: total[0].total, data: data};
    }

    async queryTonUserCampaignTasks(address, campaign_id) {
        const tasks = await this.app.mysql.get('app').select(`ton_user_completed_tasks`, {
            where: {
                address: address,
                campaign_id: campaign_id,
            }
        })
        if (!tasks) {
            return [];
        }
        return tasks.map(item => item.task_id);
    }

    async recordUserTaskAtCampaign(address, campaign_id, task_id) {
        await this.app.mysql.get('app').query(`replace into ton_user_completed_tasks
                                               values (?, ?, ?)`, [address, campaign_id, task_id]);
    }
}

module.exports = SocialMediaService;
