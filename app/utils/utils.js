const env = require("../../config/env.json");
const request = require('request');
const {
    ERC721, CHAIN_NAME_FLOW_MAINNET, CHAIN_NAME_FLOW_TESTNET, getExplorer, CHAIN_NAME_TON_MAINNET,
    CHAIN_NAME_TON_TESTNET
} = require("./constant");
const Web3 = require("web3");
const fcl = require("@onflow/fcl");
const {config} = require("@onflow/fcl");
const flowCatalog = require("flow-catalog");
const flowCADUT = require("@onflow/flow-cadut");
const {Address, beginCell} = require("ton-core");
const {WalletContractV4, WalletContractV3R2, safeSignVerify} = require("ton");

function parsePageParamToDBParam(page, gap) {
    if (!page) {
        page = 1;
    }
    if (!gap) {
        gap = 10;
    }
    if (+page < 1) {
        return [+gap, 0];
    }
    let offset = (+page - 1) * gap;
    return [+gap, offset];
}

async function estimateSnapshotTime(chain_name, snapshot_block) {
    let config = {
        'method': 'GET',
        'url': getExplorer(chain_name) + '?module=block&action=getblockcountdown&blockno=' + snapshot_block,
    };
    let call = new Promise((resolve, reject) => {
        request(config, async (error, resp) => {
            if (error) {
                reject(error);
            } else {
                const body = JSON.parse(resp.body);
                resolve(body.result);
            }
        })
    })
    return call.then(async resp => {
        if (resp.EstimateTimeInSec !== undefined) {
            return (+resp.EstimateTimeInSec) * 1000 + Date.now();
        }
        return 0;
    })
}

async function getTwitterCounts(tIds) {
    if (tIds.length > 100) {
        throw new Error("too many tIds");
    }
    let config = {
        'method': 'GET',
        'url': `https://api.twitter.com/2/tweets?ids=${tIds.join(",")}&tweet.fields=public_metrics`,
        'headers': {Authorization: `Bearer ${env.Twitter_Token}`}
    };
    let call = new Promise((resolve, reject) => {
        request(config, async (error, resp) => {
            if (error) {
                reject(error);
            } else {
                const body = JSON.parse(resp.body);
                resolve(body);
            }
        })
    })
    return call.then(async resp => {
        const data = resp.data;
        if (!data || data.length === 0) {
            throw new Error(`cannot get tid info, resp is ${JSON.stringify(resp)}`)
        }
        const result = new Map();
        for (const twitter of data) {
            result.set(twitter.id, twitter.public_metrics);
        }
        return result;
    });
}

async function getTwitterUserFollowers(userNames) {
    if (userNames.length > 100) {
        throw new Error("too many users");
    }
    let config = {
        'method': 'GET',
        'url': `https://api.twitter.com/2/users/by?usernames=${userNames.join(",")}&user.fields=public_metrics`,
        'headers': {Authorization: `Bearer ${env.Twitter_Token}`}
    };
    let call = new Promise((resolve, reject) => {
        request(config, async (error, resp) => {
            if (error) {
                reject(error);
            } else {
                const body = JSON.parse(resp.body);
                resolve(body);
            }
        })
    })
    return call.then(async resp => {
        const data = resp.data;
        if (!data || data.length === 0) {
            throw new Error(`cannot get user info, resp is ${JSON.stringify(resp)}`)
        }
        let result = 0;
        for (const user of data) {
            result += user.public_metrics.followers_count;
        }
        return result;
    });
}

/// @notice catalogId should be same with collection id
async function getFlowNFTs(chainName, owner, catalogToContractMap, limit, offset) {
    if (!owner) {
        throw new Error("owner is required");
    }
    const catalogIds = [];
    for (const catalogId in catalogToContractMap) {
        catalogIds.push(catalogId);
    }
    const addressMap = await flowCatalog.getAddressMaps();
    if (chainName === CHAIN_NAME_FLOW_TESTNET) {
        await flowCADUT.setEnvironment("testnet");
    } else {
        await flowCADUT.setEnvironment("mainnet");
    }
    const nfts = await flowCatalog.scripts.getNftsInAccount(
        {addressMap, args: [owner, catalogIds]})
    if (!limit || !offset) { // return all results
        let total = 0;
        const data = [];
        for (const catalogNFT of nfts) {
            if (!catalogNFT) {
                continue
            }
            for (const catalogId in catalogNFT) {
                if (!Array.isArray(catalogNFT[catalogId])) {
                    continue
                }
                total += catalogNFT[catalogId].length;
                for (const item of catalogNFT[catalogId]) {
                    data.push({
                        contract: catalogToContractMap[catalogId],
                        erc: ERC721,
                        token_id: item.id,
                        amount: "1",
                        uri: item.thumbnail,
                        owner: owner,
                    });
                }
            }
        }
        return {"total": total, data: data};
    } else {
        return limitAndOffset(nfts, limit, offset)
    }
}

function limitAndOffset(nfts, limit, offset) {
    let total = 0;
    let skip = 0;
    let count = 0;
    const data = [];
    for (const catalogNFT of nfts) {
        if (!catalogNFT) {
            continue
        }
        for (const catalogId in catalogNFT) {
            total += catalogNFT[catalogId].length;
            for (const item of catalogNFT[catalogId]) {
                if (skip === offset) {
                    if (count < limit) {
                        data.push({
                            contract: catalogToContractMap[catalogId],
                            erc: ERC721,
                            token_id: item.id,
                            amount: "1",
                            uri: item.thumbnail,
                            owner: owner,
                        });
                        count++
                    }
                } else {
                    skip++;
                }
            }
        }
    }
    return {"total": total, data: data};
}

async function getFlowNFTIdsOfAccount(chainName, addr) {
    if (!addr) {
        throw new Error("addr is required");
    }
    const addressMap = await flowCatalog.getAddressMaps();
    if (chainName === CHAIN_NAME_FLOW_TESTNET) {
        await flowCADUT.setEnvironment("testnet");
    } else {
        await flowCADUT.setEnvironment("mainnet");
    }
    let nftIds = await flowCatalog.scripts.getNftIdsInAccount({addressMap, args: [addr]})
    return nftIds[0];
}

// return nft collectionIds
async function getNFTKinds(chainName, owner, catalogToContractMap) {
    if (!owner) {
        throw new Error("owner is required");
    }
    const catalogIds = [];
    for (const catalogId in catalogToContractMap) {
        catalogIds.push(catalogId);
    }
    const addressMap = await flowCatalog.getAddressMaps();
    if (chainName === CHAIN_NAME_FLOW_TESTNET) {
        await flowCADUT.setEnvironment("testnet");
    } else {
        await flowCADUT.setEnvironment("mainnet");
    }
    const nfts = await flowCatalog.scripts.getNftsInAccount(
        {addressMap, args: [owner, catalogIds]})
    const data = [];
    for (const catalogNFT of nfts) {
        if (!catalogNFT) {
            continue
        }
        for (const catalogId in catalogNFT) {
            if (!Array.isArray(catalogNFT[catalogId])) {
                continue
            }
            if (catalogNFT[catalogId].length > 0) {
                data.push(catalogId);
            }
        }
    }
    return data;
}

function isFlowAddr(addr) {
    return Web3.utils.isAddress(addr + "000000000000000000000000");
}

function isFlowContract(contract) {
    if (!contract) {
        return false;
    }
    let splits = contract.split(".");
    return Web3.utils.isAddress(splits[0] + "000000000000000000000000");
}

function isFlowNetwork(chaiName) {
    return chaiName === CHAIN_NAME_FLOW_MAINNET || chaiName === CHAIN_NAME_FLOW_TESTNET;
}

async function verifyFlowSig(chainName, addr, msg, rawSignature) {
    if (chainName === CHAIN_NAME_FLOW_TESTNET) {
        config({
            "accessNode.api": "https://rest-testnet.onflow.org",
            "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn"
        })
        fcl.config().put('flow.network', 'testnet')
    } else if (chainName === CHAIN_NAME_FLOW_MAINNET) {
        config({
            "accessNode.api": "https://rest-mainnet.onflow.org",
            "discovery.wallet": "https://fcl-discovery.onflow.org/authn"
        })
        fcl.config().put('flow.network', 'mainnet')
    } else {
        throw new Error('illegal chain name when check flow sig');
    }
    let compositeSig = JSON.parse(rawSignature);
    let addrValid = false;
    for (const sig of compositeSig) {
        if (addr === sig.addr) {
            addrValid = true;
            break;
        }
    }
    if (!addrValid) {
        throw new Error('illegal signer');
    }
    let hexMsg = Buffer.from(msg).toString('hex');
    return await fcl.AppUtils.verifyUserSignatures(hexMsg, compositeSig, {});
}

async function searchTonNFT(chainName, queryParams) {
    let params = [];
    if (queryParams.owner !== undefined) {
        params.push(`owner=${queryParams.owner}`);
    }
    if (queryParams.collection !== undefined) {
        params.push(`collection=${queryParams.collection}`);
    }
    if (queryParams.limit !== undefined) {
        params.push(`limit=${queryParams.limit}`);
    }
    if (queryParams.offset !== undefined) {
        params.push(`offset=${queryParams.offset}`);
    }
    if (queryParams.include_on_sale !== undefined) {
        params.push(`include_on_sale=${queryParams.include_on_sale}`);
    }
    let config = {
        'method': 'GET',
        'url': `${getTonApiUrl(chainName)}/v1/nft/searchItems?${params.join('&')}`,
        'headers': {Authorization: `Bearer ${env.TON_API_KEY}`}
    };
    return new Promise((resolve, reject) => {
        request(config, async (error, resp) => {
            if (error) {
                reject(error);
            } else if (resp.statusCode !== 200) {
                reject(new Error(`${resp.statusCode} ${resp.statusMessage}`));
            } else {
                const body = JSON.parse(resp.body);
                resolve(body.nft_items);
            }
        })
    });
}

async function getTonCollection(chainName, collectionAddr) {
    let config = {
        'method': 'GET',
        'url': `${getTonApiUrl(chainName)}/v1/nft/getCollection?account=${collectionAddr}`,
        'headers': {Authorization: `Bearer ${env.TON_API_KEY}`}
    };
    return new Promise((resolve, reject) => {
        request(config, async (error, resp) => {
            if (error) {
                reject(error);
            } else if (resp.statusCode !== 200) {
                reject(new Error(`${resp.statusCode} ${resp.statusMessage}`));
            } else {
                const body = JSON.parse(resp.body);
                resolve(body);
            }
        })
    });
}

async function getTonBalance(chainName, account) {
    let config = {
        'method': 'GET',
        'url': `${getTonApiUrl(chainName)}/v1/account/getInfo?account=${account}`,
        'headers': {Authorization: `Bearer ${env.TON_API_KEY}`}
    };
    return new Promise((resolve, reject) => {
        request(config, async (error, resp) => {
            if (error) {
                reject(error);
            } else if (resp.statusCode !== 200) {
                reject(new Error(`${resp.statusCode} ${resp.statusMessage}`));
            } else {
                const body = JSON.parse(resp.body);
                resolve(body.balance / 1000000000);
            }
        })
    });
}

async function getTonCollectionNFTs(chainName, collectionAddr, limit, offset) {
    const collection = await getTonCollection(chainName, collectionAddr);
    let total = collection.next_item_index;
    const nftItems = await searchTonNFT(chainName, {
        collection: collectionAddr,
        limit: limit,
        offset: offset,
    })
    return {
        total: total, data: nftItems.map(item => {
            return {
                contract: Address.parse(item.address).toString(),
                erc: ERC721,
                token_id: item.index,
                amount: "1",
                uri: item.metadata.image,
                owner: Address.parse(item.owner.address).toString(),
            }
        })
    }
}

async function tonUserOwnedCollectionNFT(chainName, owner, collectionAddr) {
    const nftItems = await searchTonNFT(chainName, {
        limit: 1,
        offset: 0,
        owner: owner,
        collection: collectionAddr,
        include_on_sale: true,
    })
    return Array.isArray(nftItems) && nftItems.length > 0;
}

async function getTONNFTs(chainName, owner, collectionAddr, limit, offset) {
    // show 10000000 NFTs maximum
    const nftItems = await searchTonNFT(chainName, {
        limit: 10000000,
        offset: 0,
        owner: owner,
        collection: collectionAddr,
        include_on_sale: true,
    })
    return {
        total: nftItems.length, data: limitAndOffsetArray(nftItems, limit, offset).map(item => {
            return {
                contract: Address.parse(item.address).toString(),
                erc: ERC721,
                token_id: item.index,
                amount: "1",
                uri: item.metadata.image,
                owner: Address.parse(item.owner.address).toString(),
            }
        })
    };
}

function limitAndOffsetArray(nfts, limit, offset) {
    if (!limit || !offset) {
        return nfts;
    }
    let skip = 0;
    let count = 0;
    const data = [];
    for (const nft of nfts) {
        if (skip === offset) {
            if (count < limit) {
                data.push(nft);
                count++
            }
        } else {
            skip++;
        }
        if (count === limit) {
            break
        }
    }
    return data;
}

function getTonApiUrl(chainName) {
    return chainName === CHAIN_NAME_TON_TESTNET ? "https://testnet.tonapi.io" : "https://tonapi.io";
}

function isTONAddr(addr) {
    try {
        Address.parse(addr);
        return true;
    } catch (e) {
        return false;
    }
}

function isTONNetwork(chainName) {
    return chainName === CHAIN_NAME_TON_TESTNET || chainName === CHAIN_NAME_TON_MAINNET;
}

function verifyTonSig(addr, msg, rawSignature, publicKey) {
    let walletV4 = WalletContractV4.create({workchain: 0, publicKey: publicKey});
    let walletV3R2 = WalletContractV3R2.create({workchain: 0, publicKey: publicKey});
    let payloadCell = beginCell().storeBuffer(Buffer.concat([
        Buffer.from([0, 0, 0, 0]),
        Buffer.from(msg),
    ])).endCell();
    let textCell = beginCell().storeUint(0, 32).storeStringTail("Please sign message").endCell();
    let data = beginCell().storeRef(textCell)
        .storeRef(payloadCell).endCell();
    const signed = safeSignVerify(data, Buffer.from(rawSignature, 'base64'), publicKey);
    let parsedAddr = Address.parse(addr);
    return signed && (walletV4.address.equals(parsedAddr) || walletV3R2.address.equals(parsedAddr));
}

function verifyTGRobot(req) {
    return req.headers.authorization === env.TG_ROBOT_HEADER
}

function createTONNFTItemMintBody(params) {
    let uri = Buffer.from(new TextEncoder().encode(encodeURI(params.itemContentUri)));
    console.log(uri.toString());
    return beginCell().storeUint(1, 32)
        .storeUint(params.queryId || 0, 64)
        .storeUint(params.itemIndex, 64)
        .storeCoins(params.amount)
        .storeRef(
            beginCell()
                .storeAddress(Address.parse(params.itemOwnerAddress))
                .storeRef(
                    beginCell().storeBuffer(uri).endCell()
                ).endCell()
        ).endCell().toBoc().toString("base64");
}

module.exports = {
    parsePageParamToDBParam,

    estimateSnapshotTime,

    getTwitterCounts,
    getTwitterUserFollowers,

    getFlowNFTs,
    getFlowNFTIdsOfAccount,
    getNFTKinds,
    isFlowAddr,
    isFlowContract,
    isFlowNetwork,
    verifyFlowSig,

    getTONNFTs, getTonBalance, getTonCollectionNFTs, tonUserOwnedCollectionNFT,
    isTONAddr, isTONNetwork, verifyTonSig, verifyTGRobot, createTONNFTItemMintBody
}
