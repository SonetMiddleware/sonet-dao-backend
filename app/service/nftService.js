const {getFlowNFTs, isFlowNetwork, createTONNFTItemMintBody, isCollectionDeployed} = require("../utils/utils");
const Service = require('egg').Service;
const {sha256} = require('js-sha256');
const {CHAIN_NAME_TON_MAINNET, getNodeUrl, TON_CENTER_API_KEY} = require("../utils/constant");
const TonWeb = require("tonweb");
const {NftItem, NftCollection} = TonWeb.token.nft
const {Address, beginCell, Cell} = require("ton-core");
const {SmartContract} = require("ton-contract-executor");
const {TonClient} = require("ton");
const BN = require("bn.js");
const collectionCodeWithoutMintPermit = 'B5EE9C724102140100021F000114FF00F4A413F4BCF2C80B0102016202030202CD04050201200E0F04E7D10638048ADF000E8698180B8D848ADF07D201800E98FE99FF6A2687D20699FEA6A6A184108349E9CA829405D47141BAF8280E8410854658056B84008646582A802E78B127D010A65B509E58FE59F80E78B64C0207D80701B136000F181136001718128B9E382F970C892E001F181181981E0024060708090201200A0B0062363602D33F5313BBF2E1925313BA01FA00D43027103459F0068E1201A45521C85005CF1613CB3FCCCCCCC9ED54925F05E200A436367003D4308E378040F4966FA5208E2906A4208100FABE93F2C18FDE81019321A05325BBF2F402FA00D43022544A30F00623BA9302A402DE04926C21E2B3E630324434C85005CF1613CB3FCCCCCCC9ED54002C323401FA40304144C85005CF1613CB3FCCCCCCC9ED54003C8E15D4D43010344130C85005CF1613CB3FCCCCCCC9ED54E05F04840FF2F00201200C0D003D45AF0047021F005778018C8CB0558CF165004FA0213CB6B12CCCCC971FB008002D007232CFFE0A33C5B25C083232C044FD003D0032C03260001B3E401D3232C084B281F2FFF2742002012010110025BC82DF6A2687D20699FEA6A6A182DE86A182C40043B8B5D31ED44D0FA40D33FD4D4D43010245F04D0D431D430D071C8CB0701CF16CCC980201201213002FB5DAFDA89A1F481A67FA9A9A860D883A1A61FA61FF480610002DB4F47DA89A1F481A67FA9A9A86028BE09E008E003E00B01EBC6C49';

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
        if (params.enable_other_mint) {
            createCollectionParams.code = TonWeb.boc.Cell.fromBoc(collectionCodeWithoutMintPermit)[0];
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
                token_id: `${index.toNumber()}`,
                collection_name: params.collection.name
            }
        });
        if (existed === undefined || existed.length === 0) {
            await this.app.mysql.get('app').insert('ton_collection_item_metadata', {
                is_mainnet: params.chain_name === CHAIN_NAME_TON_MAINNET,
                collection_name: params.collection.name,
                token_id: `${index.toNumber()}`,
                name: params.metadata.name,
                image: params.metadata.image,
                description: params.metadata.description,
                content_type: params.metadata.content_type,
                content_url: params.metadata.content_url,
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
            content_type: res.content_type,
            content_url: res.content_url,
            attributes: JSON.parse(res.attrs)
        }
    }

    async queryCreatedCollection(chainName, name, creator, limit, offset) {
        let sql = 'from ton_collection_metadata where creator=? and is_mainnet=? ';
        if (name) {
            sql += `and name like '%${name}%'`;
        }
        const total = await this.app.mysql.get('app').query("select count(*) as count " + sql,
            [creator, chainName === CHAIN_NAME_TON_MAINNET]);
        if (!total || total[0].count === 0) {
            return {total: 0, data: []};
        }
        if (offset && limit) {
            sql += ' limit ' + offset + ', ' + limit
        } else if (limit) {
            sql += ' limit ' + limit;
        }
        const res = await this.app.mysql.get('app').query("select * " + sql,
            [creator, chainName === CHAIN_NAME_TON_MAINNET]);
        if (!res) {
            return {total: 0, data: []};
        }
        const data = [];
        const deployedName = []
        for (const item of res) {
            if (!item.deployed) {
                item.deployed = await isCollectionDeployed(chainName, item.addr);
                if (item.deployed) {
                    deployedName.push(item.name);
                }
            }
            data.push({
                name: item.name,
                addr: item.addr,
                image: item.image,
                cover_image: item.cover_image,
                deployed: item.deployed,
            })
        }
        if (deployedName.length > 0) {
            await this.app.mysql.get('app').update('ton_collection_metadata', {deployed: true}, {
                where: {
                    is_mainnet: chainName === CHAIN_NAME_TON_MAINNET,
                    name: deployedName,
                }
            });
        }
        return {total: total[0].count, data: data};
    }
}

module.exports = NFTService;
