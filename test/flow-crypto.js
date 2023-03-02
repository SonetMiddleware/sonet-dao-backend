// const {sha3_256} = require("js-sha3");
// const {sha256} = require("js-sha256");
// var BN = require('bn.js');
// const fcl = require("@onflow/fcl");
//
// let addr = '0xf8d6e0586b0a20c7',
//     keyId = 0,
//     privateKey = '69d4e9e3c811a394aa2ecd6c30a96a54e20efe797475d7589c72caeb0b93c262',
//     // hashAlgorithm = flowTest.HashAlgorithm.SHA3_256,
//     signatureAlgorithm = "ECDSA_P256";
//
// const elliptic = require("elliptic");
//
// const ec = {
//     ECDSA_P256: new elliptic.ec("p256"),
//     ECDSA_secp256k1: new elliptic.ec("secp256k1"),
// }
//
// const HashFunction = {
//     SHA2_256: sha256,
//     SHA3_256: sha3_256,
// }
//
// const hashMsgHex = (msgHex, hashAlgorithm = HashAlgorithm.SHA3_256) => {
//     const hashFn = HashFunction[hashAlgorithm]
//
//     const hash = hashFn.create()
//     hash.update(Buffer.from(msgHex, "hex"))
//     return Buffer.from(hash.arrayBuffer())
// }
//
// let msgHex = Buffer.from('aaaaaaaaaaaxxxxxxx').toString('hex');
// const key = ec[signatureAlgorithm].keyFromPrivate(Buffer.from(privateKey, "hex"))
// const sig = key.sign(hashMsgHex(msgHex, "SHA3_256"))
// const n = 32 // half of signature length?
// const r = sig.r.toArrayLike(Buffer, "be", n)
// const s = sig.s.toArrayLike(Buffer, "be", n)
// const signature = Buffer.concat([r, s]).toString("hex")
// let p256EC = new elliptic.ec("p256");
// console.log(key.getPublic(false, 'hex'));
// const pubKey = p256EC.recoverPubKey(hashMsgHex(msgHex, "SHA3_256"), sig, sig.recoveryParam);
// console.log(pubKey.encode('hex', false));
//
//
// const secp256k1 = new elliptic.ec("secp256k1");
// const testPubKey1 = secp256k1
//     .keyFromPublic('04' + '10a1f75d1d363ca970dec8181e3510ccb579f7ce014f4490fde7ca83ba509a60b45d8746e2dfdd2da8b9b0ece951d62a6dc85cba111b5712efb5ba4609a7be73', 'hex');
// console.log(testPubKey1.getPublic(false, 'hex'));
// const testPubKey2 = secp256k1
//     .keyFromPublic('04' + '34cc0503d4741584294165d85ed16d04e167ddf9fec421d2ccdbc9850a826c6b65674ad36e50b5d5894d8534f03aea102d1b2ec726d79700c084bced6ddcc19e', 'hex');
// console.log(testPubKey2.getPublic(false, 'hex'));
// const testPubKey3 = secp256k1
//     .keyFromPublic('04' + '0b99876d1e2734e7493d41a40c4895eb6048fafbca2cb6987ef5caec61fb77f181d7755496b026a68c8639ea37eb85c0caa87bb9456cd5f0da5c59a74047da63', 'hex');
// console.log(testPubKey3.getPublic(false, 'hex'));
// const rawSig = Buffer.from('bc274bbf6718a697cad927036874ab71de285eb7c8f293b729886967964b62baa2a0aea4e791993974637db6ac5e7e49d2c2b4fd690a9aa7b68171e8ccd7c25e', 'hex');
//
// const testR = new BN(rawSig.slice(0, 32));
// const testS = new BN(rawSig.slice(32, 64));
// let testSig = {r: testR, s: testS};
// let testMsg = Buffer.from('hello world').toString('hex');
// for (let i = 0; i < 4; i++) {
//     try {
//         const pubKey = secp256k1.recoverPubKey(hashMsgHex(testMsg, "SHA3_256"), testSig, i);
//         console.log(pubKey.encode('hex', false));
//     } catch (e) {
//         console.log(e.toString(), i);
//     }
// }
