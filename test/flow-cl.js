// const fcl = require("@onflow/fcl");
// const {config} = require("@onflow/fcl");
//
// config({
//     "accessNode.api": "https://rest-testnet.onflow.org", // Mainnet: "https://rest-mainnet.onflow.org"
//     "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn" // Mainnet: "https://fcl-discovery.onflow.org/authn"
// })
// fcl.config().put('flow.network', 'testnet')
// const getAccount = async (address) => {
//     return await fcl.send([fcl.getAccount(address)]).then(fcl.decode);
// };
// getAccount('0xb939cb091d85d0ad').then(res => console.log(res));
//
// fcl.AppUtils.verifyUserSignatures(Buffer.from("hello world").toString('hex'), [{
//     f_type: "CompositeSignature",
//     f_vsn: "1.0.0",
//     addr: "0xb939cb091d85d0ad",
//     keyId: 1,
//     signature: "b0e256cfa8201c9723dab0769904bd6c85b74f436415890a56e8a583410c95604e19064440c0dfbb0599d06953688e5da3effbb5ef07e3233c2edeccf5ad591c"
// }], {}).then(valid => console.log(valid));
