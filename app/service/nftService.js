const {getFlowNFTs, isFlowNetwork} = require("../utils/utils");
const Service = require('egg').Service;
const {sha256} = require('js-sha256');

class NFTService extends Service {

    async queryNFTById(nftId) {
        const mysql = this.app.mysql.get('app');
        return await mysql.get('nft_reg', {
            nft_id: nftId
        })
    }

    async regNFT(chain_name, contract, token_id) {
        let nft_id = sha256(chain_name + contract + token_id);
        await this.app.mysql.get('app').query(`replace into nft_reg
                                               values (?, ?, ?, ?, ?)`, [nft_id, chain_name, contract, token_id, '']);
        return nft_id;
    }

    async queryNFT(chainName, addr, contract, tokenId, limit, offset) {
        const mysql = this.app.mysql.get('chainData');
        if (isFlowNetwork(chainName)) {
            let items;
            if (contract) {
                items = await mysql.select('collection_map', {where: {contract: contract, chain_name: chainName}});
            } else {
                items = await mysql.select('collection_map', {where: {chain_name: chainName}});
            }
            const catalogToContractMap = {};
            for (const item of items) {
                catalogToContractMap[item.collection_id] = item.contract;
            }
            let nfts = await getFlowNFTs(chainName, addr, catalogToContractMap, limit, offset);
            for (const nft of nfts.data) {
                let nft_id = sha256(chainName + nft.contract + nft.token_id);
                await this.app.mysql.get('app').query(
                    `replace into nft_reg
                     values (?, ?, ?, ?, ?)`, [nft_id, chainName, nft.contract, nft.token_id, nft.uri]);
            }
            if (tokenId) {
                let data = nfts.data.find(r => r.token_id === tokenId);
                if (data) {
                    return {total: 1, data: [data]};
                } else {
                    return {total: 0, data: []};
                }
            } else {
                return nfts;
            }
        }
        let where = [];
        let param = [];
        if (addr) {
            where.push('owner=?');
            param.push(addr);
        }
        if (contract) {
            where.push('contract=?');
            param.push(contract);
            if (tokenId) {
                where.push('token_id=?');
                param.push(tokenId);
            }
        }
        let whereClause = where.join(' and ');
        let total = await mysql.query(`select count(*)
                                       from nft_${chainName}
                                       where ` + whereClause, param);
        total = total[0]['count(*)'];
        let sql = `select *
                   from nft_${chainName}
                   where ` + whereClause + ' order by contract, token_id';
        if (offset && limit) {
            sql += ' limit ' + offset + ', ' + limit
        } else if (limit) {
            sql += ' limit ' + limit;
        }
        return {"total": total, data: await mysql.query(sql, param)};
    }

    async queryFavorite(chainName, addr, contract, limit, offset) {
        let where = ['addr=?'];
        let param = [addr];
        if (chainName) {
            where.push('chain_name=?');
            param.push(chainName);
        }
        if (contract) {
            where.push('contract=?');
            param.push(contract);
        }
        let whereClause = where.join(' and ');
        const mysql = this.app.mysql.get('app');
        let total = await mysql.query('select count(*) from favorite where ' + whereClause, param);
        total = total[0]['count(*)'];
        let sql = 'select * from favorite where ' + whereClause + ' order by contract, token_id';
        if (offset && limit) {
            sql += ' limit ' + offset + ', ' + limit
        } else if (limit) {
            sql += ' limit ' + limit;
        }
        return {"total": total, data: await mysql.query(sql, param)};
    }

    async favorite(chainName, addr, contract, token_id, uriParam) {
        if (isFlowNetwork(chainName)) {
            await this.app.mysql.get('app').insert('favorite', {
                chain_name: chainName, addr: addr, contract: contract,
                token_id: token_id, uri: uriParam
            });
            return
        }
        let uri = await this.app.mysql.get('chainData').select('nft' + "_" + chainName, {
            where: {contract: contract, token_id: token_id},
            columns: ['uri'],
            distinct: true
        });
        if (uri === undefined || uri.length === 0) {
            uri = uriParam;
        } else {
            uri = uri[0].uri;
        }
        await this.app.mysql.get('app').insert('favorite', {
            chain_name: chainName, addr: addr, contract: contract,
            token_id: token_id, uri: uri
        });
    }

    async notFavorite(chainName, addr, contract, token_id) {
        await this.app.mysql.get('app').delete('favorite', {
            chain_name: chainName,
            addr: addr,
            contract: contract,
            token_id: token_id
        });
    }
}

module.exports = NFTService;
