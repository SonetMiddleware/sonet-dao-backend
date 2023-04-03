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

    async queryTGMsgStatus(group_id, order_by, limit, offset) {
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
        return {total: total, data: data};
    }
}

module.exports = SocialMediaService;
