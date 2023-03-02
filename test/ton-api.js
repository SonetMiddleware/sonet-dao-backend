// const {CHAIN_NAME_TON_TESTNET,} = require("../app/utils/constant");
// const env = require("../config/env.json");
// const request = require('request');
//
// async function searchNFTItems() {
//     let queryParams = {
//         limit: 1000,
//         offset: 0,
//         owner: "EQCWsaU-piIXzA4MlbcRabYfWJXrjcq-9e9gnwB7pfSz8ozM",
//         collection: "EQAczbPLonyfai7iD4t7VO0rRB8lzEyMsOQm2uJVkXs0EOLv",
//         include_on_sale: true,
//     }
//     let params = [];
//     params.push(`owner=${queryParams.owner}`);
//     params.push(`collection=${queryParams.collection}`);
//     params.push(`limit=${queryParams.limit}`);
//     params.push(`offset=${queryParams.offset}`);
//     params.push(`include_on_sale=${queryParams.include_on_sale}`);
//     let config = {
//         'method': 'GET',
//         'url': `https://testnet.tonapi.io/v1/nft/searchItems?${params.join('&')}`,
//         'headers': {Authorization: `Bearer ${env.TON_API_KEY}`}
//     };
//     return new Promise((resolve, reject) => {
//         request(config, async (error, resp) => {
//             if (error) {
//                 reject(error);
//             } else {
//                 const body = JSON.parse(resp.body);
//                 resolve(body);
//             }
//         })
//     });
// }
//
// searchNFTItems().then((res) => console.log(res)).catch(e => console.log(e));
