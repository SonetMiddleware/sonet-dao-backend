// const flowCatalog = require("flow-catalog");
// const flowCADUT = require("@onflow/flow-cadut");
//
// const main = async () => {
//     const addressMap = await flowCatalog.getAddressMaps();
//     // fcl.config()
//     //     .put("flow.network", "mainnet")
//     //     .put("accessNode.api", "https://rest-mainnet.onflow.org")
//     //     .put("discovery.wallet", "https://fcl-discovery.onflow.org/authn")
//     await flowCADUT.setEnvironment("mainnet");
//     // const env = await flowCADUT.getEnvironment()
//     let collectionId = 'MetaPanda';
//     let addr = "0x08c19ddf8c610d87";
//     const nftIds = await flowCatalog.scripts.getNftIdsInAccount({addressMap, args: [addr]});
//     console.log(nftIds,Object.keys(nftIds[0]));
//     const nfts = await flowCatalog.scripts.getNftsInAccount({addressMap, args: [addr, [collectionId]]})
//     console.log(nfts);
//     const counts = await flowCatalog.scripts.getNftsCountInAccount({addressMap, args: [addr]});
//     for (const count of counts) {
//         if (count && count[collectionId]) {
//             console.log('collection: %s', count[collectionId]);
//         }
//     }
// };
//
// main().then();
