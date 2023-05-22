const Service = require('egg').Service;
const constant = require('../utils/constant');
const ERC20 = require('../../contracts/ERC20.json');
const ERC721 = require('../../contracts/ERC721.json');
const ERC1155 = require('../../contracts/ERC1155.json');
const Web3 = require('web3');
const {
    getNodeUrl,
    VOTER_TYPE_PER_ADDR,
    VOTER_TYPE_PER_NFT,
    VOTER_TYPE_TONCOIN, CHAIN_NAME_TON_TESTNET, CHAIN_NAME_TON_MAINNET, VOTER_TYPE_PER_OPEN_ADDR
} = require("../utils/constant");
const {
    getFlowNFTs, isFlowNetwork, getFlowNFTIdsOfAccount, getNFTKinds, isTONNetwork,
    getTONNFTs, getTonBalance, getTonCollectionNFTs, tonUserOwnedCollectionNFT, createDaoAtTon,
    tonUserOwnedCollectionsNFT
} = require("../utils/utils");
const {sha256} = require("js-sha256");
const {uploadFileToIPFS} = require("../utils/ipfs");
const crypto = require('crypto');
const {Address} = require("tonweb");

class DAOService extends Service {

    async createTGDao(param) {
        if (!await tonUserOwnedCollectionNFT(param.chain_name, param.creator, param.contract)) {
            throw new Error("creator doesn't own NFT");
        }
        // create dao
        if (param.chain_name === CHAIN_NAME_TON_TESTNET) {
            try {
                const daoAddr = await createDaoAtTon(param.chain_name, param.creator, param.collection_id, param.collection_name,
                    param.dao_name, param.twitter);
                this.app.logger.info("createTGDao: user: %s, dao: %s, dao contract: %s", param.creator, param.collection_name, daoAddr);
            } catch (e) {
                this.app.logger.error("createTGDao: createDaoAtTon, ", e);
            }
        }
        // upload image to ipfs
        try {
            param.collection_image = await uploadFileToIPFS(param.collection_image);
        } catch (e) {
            this.app.logger.error("createTGDao: upload image failed, ", e);
        }
        const mysql = await this.app.mysql.get('chainData');
        const conn = await mysql.beginTransaction();
        try {
            await conn.insert('collection_map', {
                collection_id: param.collection_id,
                contract: param.contract,
                chain_name: param.chain_name,
                deploy_height: 100000,
                erc: 721
            });
            await conn.insert('collection', {
                chain_name: param.chain_name,
                collection_name: param.collection_name,
                collection_id: param.collection_id,
                collection_img: param.collection_image,
                dao_name: param.dao_name,
                start_date: param.start_date,
                total_member: param.total_member,
                facebook: param.facebook,
                twitter: param.twitter,
                dao_create_block: 10,
                centralized: true
            });
            await this.app.mysql.get('app').query('replace into proposer_white_list values (?,?)',
                [param.collection_id, param.creator]);
            await conn.commit();
        } catch (err) {
            await conn.rollback();
            throw err;
        }
    }

    async queryCollectionList(chainName, collectionName, addr, limit, offset) {
        const mysql = this.app.mysql.get('chainData');
        let total, result;
        if (isFlowNetwork(chainName) || isTONNetwork(chainName)) {
            let collectionIds = await this.getTONAndFlowUserAllCollectionIds(chainName, addr);
            if (collectionIds.length === 0) {
                return {total: 0, data: []}
            }
            let params = [chainName, collectionIds];
            let sql = ` from collection
                       where chain_name = ?
                         and collection_id in (?) `;
            if (collectionName) {
                sql += `and collection_name like ?`;
                params.push(`%${collectionName}%`);
            }
            let totalRes = await mysql.query('select count(*) as total ' + sql, params);
            total = totalRes[0].total;
            if (offset && limit) {
                sql += ' limit ' + offset + ', ' + limit
            } else if (limit) {
                sql += ' limit ' + limit;
            }
            result = await mysql.query('select *' + sql, params);
        } else {
            let sql = ` from collection
                       where collection.collection_id
                                 in (select collection_id
                                     from collection_map
                                     where contract in
                                           (select distinct contract from nft_${chainName} where owner = ?))`;
            let params = [addr];
            if (collectionName) {
                sql += `and collection_name like ?`;
                params.push(`%${collectionName}%`);
            }
            total = await mysql.query('select count(*) as total' + sql, params);
            total = total[0].total;
            if (offset && limit) {
                sql += ' limit ' + offset + ', ' + limit
            } else if (limit) {
                sql += ' limit ' + limit;
            }
            result = await mysql.query('select * ' + sql, params);
        }
        const data = result.map(item => {
            return {
                chain_name: this.split(item.chain_name, ","),
                id: item.collection_id,
                name: item.collection_name,
                img: item.collection_img,
                dao: item.dao_name ? {
                    name: item.dao_name,
                    start_date: item.start_date,
                    total_member: item.total_member,
                    facebook: item.facebook,
                    twitter: item.twitter,
                    centralized: item.centralized,
                } : null
            };
        });
        return {"total": total, data: data};
    }

    async queryCollection(collectionId) {
        const collection = await this.app.mysql.get('chainData').get('collection', {collection_id: collectionId});
        if (!collection) {
            return {};
        }
        const contractMap = await this.app.mysql.get('chainData').get('collection_map', {collection_id: collectionId});
        const data = {
            chain_name: this.split(collection.chain_name, ","),
            id: collection.collection_id,
            name: collection.collection_name,
            img: collection.collection_img,
            dao: collection.dao_name ? {
                name: collection.dao_name,
                start_date: collection.start_date,
                total_member: collection.total_member,
                facebook: collection.facebook,
                twitter: collection.twitter,
                centralized: collection.centralized,
            } : null,
            contract: !contractMap ? "" : contractMap.contract
        };
        if (contractMap && isTONNetwork(contractMap.chain_name)) {
            const createdCollection = await this.app.mysql.get('app').get('ton_collection_metadata',
                {
                    is_mainnet: contractMap.chain_name === CHAIN_NAME_TON_MAINNET,
                    addr: new Address(contractMap.contract).toString(true, true, false)
                });
            if (createdCollection) {
                data.enable_other_mint = createdCollection.enable_other_mint;
            } else {
                data.enable_other_mint = false;
            }
        }
        return data;
    }

    async queryCollectionByNFT(contract) {
        const item = await this.app.mysql.get('chainData').get('collection_map', {contract});
        if (!item || item.length === 0) {
            return {};
        }
        const collection = await this.app.mysql.get('chainData').get('collection', {collection_id: item.collection_id});
        return {
            id: collection.collection_id,
            name: collection.collection_name,
            img: collection.collection_img,
            dao: collection.dao_name ? {
                name: collection.dao_name,
                start_date: collection.start_date,
                total_member: collection.total_member,
                facebook: collection.facebook,
                twitter: collection.twitter,
                centralized: collection.centralized,
            } : null
        };
    }

    async queryCollectionNFTs(chain_name, collectionId, addr, limit, offset) {
        const mysql = this.app.mysql.get('chainData');
        const collectionInfo = await mysql.get('collection', {collection_id: collectionId});
        if (!collectionInfo) {
            return {total: 0, data: {}};
        }
        const items = await mysql.select('collection_map', {where: {collection_id: collectionId}});
        if (items.length === 0) {
            return {
                total: 0,
                collection_id: collectionInfo.collection_id,
                collection_name: collectionInfo.collection_name,
                collection_img: collectionInfo.collection_img,
                data: null,
            }
        }
        let result = {total: 0, data: []};
        if (isFlowNetwork(chain_name) || isTONNetwork(chain_name)) {
            if (isFlowNetwork(chain_name)) {
                const catalogToContractMap = {};
                for (const item of items) {
                    catalogToContractMap[item.collection_id] = item.contract;
                }
                result = await getFlowNFTs(chain_name, addr, catalogToContractMap, limit, offset);
            } else if (isTONNetwork(chain_name)) {
                for (const item of items) {
                    // TODO: optimize this: query collection next tokenIndex as total, search collection with limit&offset straightly
                    let nfts = addr !== undefined ? await getTONNFTs(chain_name, addr, item.contract, limit, offset) :
                        await getTonCollectionNFTs(chain_name, item.contract, limit, offset);
                    result.total += nfts.total;
                    result.data.push(...nfts.data);
                }
            }
            for (const nft of result.data) {
                let nft_id = sha256(chain_name + nft.contract + nft.token_id);
                await this.app.mysql.get('app').query(
                    `replace
                         into nft_reg
                     values (?, ?, ?, ?, ?)`, [nft_id, chain_name, nft.contract, nft.token_id, nft.uri]);
            }
        } else {
            const contracts = items.map((item) => item.contract);
            let sql = `select *
                       from nft_${chain_name}
                       where `;
            let queryTotalSql = `select count(*)
                                 from nft_${chain_name}
                                 where `;
            const whereClause = ['contract in (?)'];
            const param = [contracts];
            if (addr) {
                whereClause.push('owner=?');
                param.push(addr);
            }
            sql += whereClause.join(' and ') + ' order by contract, token_id';
            queryTotalSql += whereClause.join(' and ');
            if (offset && limit) {
                sql += ' limit ' + offset + ', ' + limit
            } else if (limit) {
                sql += ' limit ' + limit;
            }
            let total = await mysql.query(queryTotalSql, param);
            result.total = total[0]['count(*)'];
            result.data = await mysql.query(sql, param);
        }
        return {
            total: result.total,
            collection_id: collectionInfo.collection_id,
            collection_name: collectionInfo.collection_name,
            collection_img: collectionInfo.collection_img,
            data: result.data
        };
    }

    async queryDAOList(chainName, addr, name, limit, offset) {
        const mysql = this.app.mysql.get('chainData');
        let total, result;
        if (addr) {
            if (isFlowNetwork(chainName) || isTONNetwork(chainName)) {
                [total, result] = await this.queryFlowAndTonDaoList(chainName, addr, name, limit, offset);
            } else {
                let sql = `from collection
                       where dao_create_block > 0
                         and hidden = false
                         and chain_name like '%${chainName}%'
                         and collection.collection_id in (select collection_id
                                                          from collection_map
                                                          where contract in
                                                                (select distinct contract from nft_${chainName} where owner = ?))`;
                let params = [addr];
                if (name) {
                    sql += ` and dao_name like ?`;
                    params.push(`%${name}%`);
                }
                total = await mysql.query('select count(*) ' + sql, params);
                total = total[0]['count(*)'];
                sql += ' order by weight desc, proposal_num desc, collection_id';
                if (offset && limit) {
                    sql += ' limit ' + offset + ', ' + limit
                } else if (limit) {
                    sql += ' limit ' + limit;
                }
                result = await mysql.query('select * ' + sql, params);
            }
        } else {
            let sql = `from collection
                       where dao_create_block > 0
                         and hidden = false
                         and chain_name like '%${chainName}%'`
            let params = [];
            if (name) {
                sql += ` and dao_name like ?`;
                params.push(`%${name}%`);
            }
            total = await mysql.query('select count(*) ' + sql, params);
            total = total[0]['count(*)'];
            sql += ' order by weight desc, proposal_num desc, collection_id';
            if (offset && limit) {
                sql += ' limit ' + offset + ', ' + limit
            } else if (limit) {
                sql += ' limit ' + limit;
            }
            result = await mysql.query('select * ' + sql, params);
        }
        const data = [];
        for (const item of result) {
            const hasOpenProposal = await this.hasOpenProposals(item.collection_id);
            data.push({
                chain_name: this.split(item.chain_name, ","),
                id: item.collection_id,
                name: item.dao_name,
                img: item.collection_img,
                start_date: item.start_date,
                total_member: item.total_member,
                facebook: item.facebook,
                twitter: item.twitter,
                centralized: item.centralized,
                types: this.split(item.types, '/'),
                tags: this.split(item.tags, '/'),
                status: hasOpenProposal ? 'open' : "",
                proposal_num: item.proposal_num,
            });
        }
        return {"total": total, data: data};
    }

    async queryFlowAndTonDaoList(chainName, addr, name, limit, offset) {
        let total = 0, result = [];
        let collections = await this.getTONAndFlowUserAllCollectionIds(chainName, addr);
        if (collections.length === 0) {
            return [total, result];
        }
        let sql = `from collection
                       where dao_create_block > 0
                         and hidden = false
                         and chain_name like '%${chainName}%'
                         and collection_id in (?)`;
        let params = [collections];
        if (name) {
            sql += ` and dao_name like ?`;
            params.push(`%${name}%`);
        }
        const mysql = this.app.mysql.get('chainData');
        let totalQuery = await mysql.query('select count(*) as total ' + sql, params);
        total = totalQuery[0].total;
        sql += ' order by weight desc, proposal_num desc, collection_id';
        if (offset && limit) {
            sql += ' limit ' + offset + ', ' + limit
        } else if (limit) {
            sql += ' limit ' + limit;
        }
        result = await mysql.query('select * ' + sql, params);
        return [total, result];
    }

    async getTONAndFlowUserAllCollectionIds(chainName, addr) {
        const mysql = this.app.mysql.get('chainData');
        const items = await mysql.select('collection_map', {where: {chain_name: chainName}});
        const collectionIdToContractMap = {};
        for (const item of items) {
            collectionIdToContractMap[item.collection_id] = item.contract;
        }
        if (isFlowNetwork(chainName)) {
            return await getNFTKinds(chainName, addr, collectionIdToContractMap);
        } else if (isTONNetwork(chainName)) {
            return await tonUserOwnedCollectionsNFT(chainName, addr, collectionIdToContractMap);
        }
    }

    async queryProposalList(collection_id, limit, offset) {
        let result = await this.queryProposalListV2(collection_id, limit, offset);
        result.data = result.data.map(item => {
            item.items = item.items.map(str => str.replaceAll(',', '.')).join(',');
            item.results = item.results.join(',');
            return item;
        })
        return result;
    }

    async queryProposalListV2(collection_id, limit, offset) {
        const mysql = this.app.mysql.get('app');
        let totalSql = `select count(*)
                        from proposal`;
        let sql = `select *
                        , (start_time / 1000 <= UNIX_TIMESTAMP() and end_time / 1000 > UNIX_TIMESTAMP()) actived
                        , (start_time / 1000 > UNIX_TIMESTAMP())                                         pending
                   from proposal`;
        let params = [];
        if (collection_id) {
            sql += ` where collection_id=?`;
            totalSql += ` where collection_id=?`;
            params.push(collection_id);
        }
        sql += ' order by update_time desc, actived desc, pending desc, end_time asc';
        if (offset && limit) {
            sql += ' limit ' + offset + ', ' + limit
        } else if (limit) {
            sql += ' limit ' + limit;
        }
        const temp = await mysql.query(sql, params);
        let total = await mysql.query(totalSql, params);
        total = total[0]['count(*)'];
        const results = [];
        for (const r of temp) {
            // TODO: if votes is too big, there will lost some decimals
            const sql = 'select item,sum(votes) as total_votes from voter where collection_id=? and id=? group by item';
            const voteNumResult = await mysql.query(sql, [collection_id ? collection_id : "", r.id]);
            const items = this.split(r.items, '|');
            if (voteNumResult.length === 0) {
                r.results = items.map((item) => 0);
            } else {
                r.results = items.map((item) => {
                    const vote = voteNumResult.find((vote) => vote.item.indexOf(item) >= 0);
                    if (vote) {
                        return vote.total_votes;
                    } else {
                        return 0;
                    }
                });
            }
            r.items = items;
            results.push(r);
        }
        return {total: total, data: results};
    }

    async queryProposalListV3(collection_id, limit, offset) {
        const mysql = this.app.mysql.get('app');
        let totalSql = `select count(*)
                        from proposal
                        where collection_id = ?`;
        let sql = `select *
                        , (start_time / 1000 <= UNIX_TIMESTAMP() and end_time / 1000 > UNIX_TIMESTAMP()) actived
                        , (start_time / 1000 > UNIX_TIMESTAMP())                                         pending
                   from proposal
                   where collection_id = ?
                   order by update_time desc, actived desc, pending desc, end_time`;
        if (offset && limit) {
            sql += ' limit ' + offset + ', ' + limit
        } else if (limit) {
            sql += ' limit ' + limit;
        }
        const temp = await mysql.query(sql, [collection_id]);
        let total = await mysql.query(totalSql, [collection_id]);
        total = total[0]['count(*)'];
        const results = [];
        for (const r of temp) {
            // TODO: if votes is too big, there will lost some decimals
            const sql = 'select item,sum(votes) as total_votes from voter where collection_id=? and id=? group by item';
            const voteNumResult = await mysql.query(sql, [collection_id, r.id]);
            const items = this.split(r.items, '|');
            if (voteNumResult.length === 0) {
                r.results = items.map((item) => 0);
            } else {
                r.results = items.map((item) => {
                    const vote = voteNumResult.find((vote) => vote.item.indexOf(item) >= 0);
                    if (vote) {
                        return vote.total_votes;
                    } else {
                        return 0;
                    }
                });
            }
            r.items = items;
            results.push(r);
        }
        let passedSql = `select count(*) as passed
                         from proposal
                                  left join (select id, count(*) as num from voter group by id) as voters
                                            on proposal.id = voters.id
                         where collection_id = ?
                           and end_time / 1000 < unix_timestamp()
                           and ballot_threshold <= voters.num;`
        let passedRes = await mysql.query(passedSql, [collection_id]);
        let failedSql = `select count(*) as failed
                         from proposal
                                  left join (select id, count(*) as num from voter group by id) as voters
                                            on proposal.id = voters.id
                         where collection_id = ?
                           and end_time / 1000 < unix_timestamp()
                           and ballot_threshold > voters.num;`
        let failedRes = await mysql.query(failedSql, [collection_id]);
        let activedSql = `select count(*) as actived
                          from proposal
                                   left join (select id, count(*) as num from voter group by id) as voters
                                             on proposal.id = voters.id
                          where collection_id = ?
                            and proposal.start_time / 1000 <= unix_timestamp()
                            and unix_timestamp() <= proposal.end_time / 1000;`
        let activedRes = await mysql.query(activedSql, [collection_id]);
        let pendingSql = `select count(*) as pending
                          from proposal
                                   left join (select id, count(*) as num from voter group by id) as voters
                                             on proposal.id = voters.id
                          where collection_id = ?
                            and proposal.start_time / 1000 > unix_timestamp();`
        let pendingRes = await mysql.query(pendingSql, [collection_id]);
        return {
            total: total, passed: passedRes[0].passed, failed: failedRes[0].failed, actived: activedRes[0].actived,
            pending: pendingRes[0].pending, data: results
        };
    }

    async hasOpenProposals(collection_id) {
        const mysql = this.app.mysql.get('app');
        let totalSql = `select count(*)
                        from proposal
                        where end_time / 1000 > UNIX_TIMESTAMP()
                          and collection_id = ? `;
        let total = await mysql.query(totalSql, collection_id);
        total = total[0]['count(*)'];
        return +total > 0;
    }

    async queryVotes(collectionId, proposalId, voter) {
        return await this.app.mysql.get('app').get('voter', {collection_id: collectionId, id: proposalId, voter});
    }

    async queryVotesList(collectionId, proposalId) {
        const totalRes = await this.app.mysql.get('app').query(
            'select count(*) as total from voter where collection_id=? and id=?', [collectionId, proposalId]);
        const total = totalRes[0]["total"]
        const dataRes = await this.app.mysql.get('app').query(
            'select voter, item, votes as num, comment, vote_time from voter where collection_id=? and id=? order by vote_time desc',
            [collectionId, proposalId]);
        return {total: total, data: dataRes};
    }

    async queryVoteCommentsList(collectionId, proposalId) {
        const totalRes = await this.app.mysql.get('app').query(
            'select count(*) as total from voter where collection_id=? and id=? and comment is not null ', [collectionId, proposalId]);
        const total = totalRes[0]["total"]
        const dataRes = await this.app.mysql.get('app').query(
            'select comment, vote_time from voter where collection_id=? and id=? and comment is not null order by vote_time desc',
            [collectionId, proposalId]);
        return {total: total, data: dataRes};
    }

    async queryProposalPermission(chainName, collection_id, creatorAddr) {
        // query dao
        const dao = await this.app.mysql.get('chainData').get('collection', {collection_id: collection_id});
        if (!dao || !dao.dao_create_block) {
            throw new Error("dao doesn't exist");
        }
        if (dao.centralized) {
            const proposerWhiteList = await this.app.mysql.get('app').get('proposer_white_list', {
                collection_id: collection_id, proposer: creatorAddr
            });
            if (!proposerWhiteList || proposerWhiteList.proposer !== creatorAddr) {
                return false;
            }
        } else { // TODO: support FLOW and TON decentralized DAO
            const totalBalance = await this.nftBalance(chainName, creatorAddr, collection_id);
            if (totalBalance === 0) {
                return false;
            }
        }
        return true;
    }

    async createProposal(chainName, creatorAddr, snapshot_block, collection_id, title, description, start_time,
                         end_time, ballot_threshold, items, voter_type) {
        // query dao
        if (!await this.queryProposalPermission(chainName, collection_id, creatorAddr)) {
            throw new Error("illegal proposer");
        }
        const hash = crypto.createHash('md5');
        hash.update(collection_id + title + description);
        const proposalId = hash.digest('hex');
        await this.app.mysql.get('app').insert('proposal', {
            collection_id,
            id: proposalId,
            creator: creatorAddr,
            snapshot_block,
            title,
            description,
            start_time,
            end_time,
            ballot_threshold,
            items: items.join('|'),
            voter_type
        });
        if (!this.app.config.updateProposalNum) {
            return proposalId;
        }
        try {
            let appDataDBName = this.app.config.mysql.clients.app.database;
            // update proposal num
            await this.app.mysql.get('chainData').query(
                `update collection c left join (select collection_id, count(*) as proposal_num
                                                from ${appDataDBName}.proposal
                                                group by collection_id) p
                    on c.collection_id = p.collection_id
                 set c.proposal_num=p.proposal_num
                 where c.collection_id = p.collection_id;`);
        } catch (e) {
            this.app.logger.error('update proposal num, %s', e);
        }
        return proposalId;
    }

    async vote(chainName, voter, collectionId, proposalId, item, comment) {
        // check item
        const dbQuery = await this.app.mysql.get('app').select('proposal', {
            where: {collection_id: collectionId, id: proposalId},
            columns: ['items', 'start_time', 'end_time', 'voter_type', 'snapshot_block'],
        })
        if (dbQuery.length === 0) {
            throw new Error('illegal proposal');
        }
        const proposal = dbQuery[0];
        const items = this.split(proposal.items, '|');
        const index = items.indexOf(item);
        if (index < 0) {
            throw new Error('illegal item');
        }
        // check time
        const now = Date.now();
        if (now < proposal.start_time || now > proposal.end_time) {
            throw new Error('illegal time');
        }
        // if dao is centralized, vote 1
        const dao = await this.app.mysql.get('chainData').get('collection', {collection_id: collectionId});
        let votes = 1;
        let shouldRecordNFTs = [];
        if (!dao.centralized) { // TODO: support FLOW and TON decentralized DAO
            votes = await this.getVotes(voter, chainName, collectionId, proposal.voter_type, proposal.snapshot_block);
        } else if (isFlowNetwork(chainName) || isTONNetwork(chainName)) {
            let usedVotes = await this.getFlowAndTonVotes(chainName, voter, proposal.voter_type, collectionId, proposalId);
            votes = usedVotes.votes;
            shouldRecordNFTs = usedVotes.tokenIds;
        }
        if (votes === 0) {
            throw new Error('no voting power');
        }
        const mysql = await this.app.mysql.get('app');
        const conn = await mysql.beginTransaction();
        try {
            // record vote
            await conn.insert('voter', {
                collection_id: collectionId,
                id: proposalId,
                voter,
                item,
                votes,
                comment,
                vote_time: Date.now()
            });
            // update proposal update time
            await conn.update('proposal', {
                update_time: Date.now()
            }, {where: {collection_id: collectionId, id: proposalId}});
            // record used nft
            for (const voteId of shouldRecordNFTs) {
                let tableName = isFlowNetwork(chainName) ? "flow_voter_records" : "ton_voter_records";
                await conn.insert(tableName, {
                    proposal_id: proposalId, token_id: voteId
                });
            }
            await conn.commit();
        } catch (e) {
            await conn.rollback();
            this.logger.error(e);
            throw e;
        }
    }

    async getFlowAndTonVotes(chainName, voter, voter_type, collectionId, proposal_id) {
        if (!proposal_id) {
            return {votes: 0, tokenIds: []};
        }
        voter_type = +voter_type;
        if (voter_type === VOTER_TYPE_PER_OPEN_ADDR) {
            return {votes: 1, tokenIds: []};
        }
        if (voter_type === VOTER_TYPE_TONCOIN && isTONNetwork(chainName)) {
            return {votes: await getTonBalance(chainName, voter), tokenIds: []}
        }
        if (voter_type !== VOTER_TYPE_PER_ADDR && voter_type !== VOTER_TYPE_PER_NFT) {
            return {votes: 0, tokenIds: []};
        }
        let collectionNFTIds = [];
        let tableName;
        if (isFlowNetwork(chainName)) {
            let nftIds = await getFlowNFTIdsOfAccount(chainName, voter);
            if (!nftIds) {
                return {votes: 0, tokenIds: []};
            }
            collectionNFTIds = nftIds[collectionId];
            tableName = "flow_voter_records";
        } else {
            const items = await this.app.mysql.get('chainData').select('collection_map', {where: {collection_id: collectionId}});
            for (const item of items) {
                // TODO: optimize this: query collection next tokenIndex as total, search collection with limit&offset straightly
                let nfts = await getTONNFTs(chainName, voter, item.contract);
                collectionNFTIds.push(...nfts.data.map(item => item.token_id));
            }
            tableName = "ton_voter_records";
        }
        if (!Array.isArray(collectionNFTIds) || collectionNFTIds.length === 0) {
            return {votes: 0, tokenIds: []};
        }
        let usedTokenIds = await this.app.mysql.get('app').query(`select token_id
                                                                  from ${tableName}
                                                                  where token_id in (?)
                                                                    and proposal_id = ?`, [collectionNFTIds, proposal_id]);
        const remainedTokenIds = [];
        for (const nftId of collectionNFTIds) {
            let existed = false;
            for (const usedId of usedTokenIds) {
                if (usedId.token_id === '' + nftId) {
                    existed = true;
                    break;
                }
            }
            if (!existed) {
                remainedTokenIds.push(nftId);
            }
        }
        let result = {votes: remainedTokenIds.length, tokenIds: remainedTokenIds};
        if (voter_type === VOTER_TYPE_PER_ADDR && result.tokenIds.length > 0) {
            result.votes = 1;
        }
        return result;
    }

    async getVotes(voter, chainName, collectionId, voter_type, snapshot_block) {
        voter_type = +voter_type;
        let votes;
        const web3 = new Web3(getNodeUrl(chainName));
        if (voter_type === constant.VOTER_TYPE_SON) {
            // TODO: change to SON address
            const SON = new web3.eth.Contract(ERC20.abi, this.config.contracts.TestERC20);
            SON.defaultBlock = snapshot_block;
            const balance = await SON.methods.balanceOf(voter).call();
            if ('' + balance === '0') {
                return 0;
            }
            votes = web3.utils.fromWei(balance, 'ether');
        } else if (voter_type === constant.VOTER_TYPE_PER_OPEN_ADDR) {
            return 1;
        } else {
            const balance = await this.nftBalance(chainName, voter, collectionId, snapshot_block);
            if ('' + balance === '0') {
                return 0;
            }
            if (voter_type === constant.VOTER_TYPE_PER_ADDR) {
                votes = 1;
            } else if (voter_type === constant.VOTER_TYPE_PER_NFT) {
                votes = balance;
            } else {
                throw new Error('unsupported voter type');
            }
        }
        return votes;
    }

    async nftBalance(chainName, owner, collectionId, defaultBlock) {
        const mysql = await this.app.mysql.get('chainData');
        const contracts = await mysql.select('collection_map', {
            where: {
                collection_id: collectionId,
            }
        });
        const web3 = new Web3(getNodeUrl(chainName));
        let total = 0;
        for (const contract of contracts) {
            if (contract.chain_name !== chainName) {
                continue
            }
            if (contract.erc === constant.ERC721) {
                const collection = new web3.eth.Contract(ERC721.abi, contract.contract);
                if (defaultBlock !== undefined) {
                    collection.defaultBlock = defaultBlock;
                }
                let balance = await collection.methods.balanceOf(owner).call();
                total += +balance;
            } else {
                // select all tokenIds from db
                const tokenIds = await mysql.query(`select distinct token_id
                                                    from nft_${chainName}
                                                    where contract = ?`, [contract.contract]);
                const collection = new web3.eth.Contract(ERC1155.abi, contract.contract);
                if (defaultBlock !== undefined) {
                    collection.defaultBlock = defaultBlock;
                }
                const ids = [];
                const addrs = [];
                for (const id of tokenIds) {
                    ids.push(id.token_id);
                    addrs.push(owner);
                }
                let balance = await collection.methods.balanceOfBatch(addrs, ids).call();
                for (const b of balance) {
                    total += +b;
                }
            }
        }
        return total;
    }

    split(str, split) {
        const splited = str.split(split);
        const res = [];
        for (const s of splited) {
            if (s) {
                res.push(s);
            }
        }
        return res;
    }
}

module.exports = DAOService;
