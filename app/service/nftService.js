const {getFlowNFTs, isFlowNetwork, createTONNFTItemMintBody} = require("../utils/utils");
const Service = require('egg').Service;
const {sha256} = require('js-sha256');
const {CHAIN_NAME_TON_MAINNET, getNodeUrl, TON_CENTER_API_KEY} = require("../utils/constant");
const TonWeb = require("tonweb");
const {NftItem, NftCollection} = TonWeb.token.nft
const {Address, beginCell, Cell} = require("ton-core");
const {SmartContract} = require("ton-contract-executor");
const {TonClient} = require("ton");
const BN = require("bn.js");
const {uploadFileToIPFS} = require("../utils/ipfs");

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

    // TODO: support TON
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

    async genTONCollectionDeployTx(params) {
        const createCollectionParams = {
            ownerAddress: new TonWeb.Address(params.owner),
            royalty: params.royalty,
            royaltyAddress: new TonWeb.Address(params.royalty_address),
            collectionContentUri: `${this.app.config.uriPrefix}${params.chain_name}/${params.metadata.name}`,
            nftItemContentBaseUri: `${this.app.config.uriPrefix}${params.chain_name}/${params.metadata.name}/`,
            nftItemCodeHex: NftItem.codeHex,
        }
        const tonWebProvider = new TonWeb.HttpProvider(getNodeUrl(params.chain_name), {apiKey: TON_CENTER_API_KEY});
        let tonWebCollection = new NftCollection(tonWebProvider, createCollectionParams);
        const nftCollectionAddress = (await tonWebCollection.getAddress()).toString(true, true)
        let existed = await this.app.mysql.get('app').select('ton_collection_metadata', {
            where: {
                is_mainnet: params.chain_name === CHAIN_NAME_TON_MAINNET,
                name: params.metadata.name,
            }
        });
        if (existed === undefined || existed.length === 0) {
            // upload image to ipfs
            try {
                params.metadata.image = await uploadFileToIPFS(params.metadata.image);
                params.metadata.cover_image = await uploadFileToIPFS(params.metadata.cover_image);
            } catch (e) {
                this.app.logger.error("genTONCollectionDeployTx: upload image failed, ", e);
            }

            await this.app.mysql.get('app').insert('ton_collection_metadata', {
                is_mainnet: params.chain_name === CHAIN_NAME_TON_MAINNET,
                name: params.metadata.name,
                image: params.metadata.image,
                cover_image: params.metadata.cover_image,
                description: params.metadata.description,
                social_links: params.metadata.social_links.join(","),
                creator: params.owner,
                addr: nftCollectionAddress,
            });
        }
        const stateInit = await tonWebCollection.createStateInit();
        const stateInitBoc = await stateInit.stateInit.toBoc(false);
        const stateInitBase64 = TonWeb.utils.bytesToBase64(stateInitBoc);
        return {
            value: "0.1",
            to: nftCollectionAddress,
            state_init: stateInitBase64
        }
    }

    async genTONNFTItemMintTx(params) {
        let client = new TonClient({
            endpoint: getNodeUrl(params.chain_name),
            apiKey: TON_CENTER_API_KEY,
        })

        let address = Address.parse(params.collection.addr);
        let res = await client.getContractState(address)
        if (!res || res.state !== "active") {
            throw new Error(`ill contract ${res.state}`,)
        }

        let code = Cell.fromBoc(res.code)[0]
        let data = Cell.fromBoc(res.data)[0]
        const contract = await SmartContract.fromCell(code, data)
        let collectionData = await contract.invokeGetMethod('get_collection_data', [])
        if (collectionData.exit_code !== 0 || collectionData.type !== 'success') {
            throw new Error("query collection failed")
        }
        let [index] = collectionData.result
        try {
            index = new BN(index);
        } catch (e) {
            throw new Error(`ill collection next item index, ${index}, err ${e}`)
        }

        let existed = await this.app.mysql.get('app').select('ton_collection_item_metadata', {
            where: {
                is_mainnet: params.chain_name === CHAIN_NAME_TON_MAINNET,
                name: params.metadata.name,
                collection_name: params.collection.name
            }
        });
        if (existed === undefined || existed.length === 0) {
            // upload image to ipfs
            try {
                params.metadata.image = await uploadFileToIPFS(params.metadata.image);
            } catch (e) {
                this.app.logger.error("genTONNFTItemMintTx: upload image failed, ", e);
            }
            await this.app.mysql.get('app').insert('ton_collection_item_metadata', {
                is_mainnet: params.chain_name === CHAIN_NAME_TON_MAINNET,
                collection_name: params.collection.name,
                token_id: `${index.toNumber()}`,
                name: params.metadata.name,
                image: params.metadata.image,
                description: params.metadata.description,
                attrs: JSON.stringify(params.metadata.attributes)
            });
        }
        const mintParams = {
            amount: TonWeb.utils.toNano("0.05"),
            itemContentUri: `${index.toNumber()}`,
            itemIndex: index.toNumber(),
            itemOwnerAddress: params.owner
        }
        return {value: "0.08", token_id: index.toNumber(), payload: createTONNFTItemMintBody(mintParams)}
    }

    async getTONCollectionMetadata(chainName, collectionName) {
        const res = await this.app.mysql.get('app').get('ton_collection_metadata', {
            name: collectionName, is_mainnet: chainName === CHAIN_NAME_TON_MAINNET,
        });
        if (!res) {
            return {}
        }
        return {
            name: res.name,
            image: res.image,
            cover_image: res.cover_image,
            description: res.description,
            social_links: res.social_links.split(",")
        }
    }

    async getTONCollectionItemMetadata(chainName, collectionName, tokenId) {
        const res = await this.app.mysql.get('app').get('ton_collection_item_metadata', {
            collection_name: collectionName, is_mainnet: chainName === CHAIN_NAME_TON_MAINNET, token_id: `${tokenId}`,
        });
        if (!res) {
            return {}
        }
        return {
            name: res.name,
            image: res.image,
            description: res.description,
            attributes: JSON.parse(res.attrs)
        }
    }

    async queryCreatedCollection(chainName, creator) {
        const total = await this.app.mysql.get('app').query(
            "select count(*) as count from ton_collection_metadata where creator=? and is_mainnet=?",
            [chainName === CHAIN_NAME_TON_MAINNET, creator]);
        if (!total) {
            return {total: 0, data: []};
        }
        const res = await this.app.mysql.get('app').select('ton_collection_metadata', {
            where: {
                is_mainnet: chainName === CHAIN_NAME_TON_MAINNET,
                creator: creator
            },
        });
        if (!res) {
            return {total: 0, data: []};
        }
        const data = [];
        for (const item of res) {
            data.push({
                name: item.name,
                addr: item.addr,
            })
        }
        return {total: total[0].count, data: data};
    }
}

module.exports = NFTService;
