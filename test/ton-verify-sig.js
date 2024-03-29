const {safeSignVerify, WalletContractV4, WalletContractV3R2} = require("ton");
const {Cell, beginCell, Address} = require("ton-core");
const utils = require('../app/utils/utils');


async function verifyTonSig() {
    let text = 'Please sign message';
    // Package
    let textCell = beginCell().storeUint(0, 32).storeStringTail(text);
    const payloadToSign = Buffer.concat([
        Buffer.from([0, 0, 0, 0]),
        Buffer.from("Telegram1842871751"),
    ]);
    const payload = beginCell()
        .storeBuffer(payloadToSign)
        .endCell()
        .toBoc({idx: false})
        .toString("base64");
    let payloadCell = Cell.fromBase64(payload);

    // Check signature
    const data = beginCell()
        .storeRef(textCell)
        .storeRef(payloadCell)
        .endCell();
    const signature = '3f8T2rkS3X+qoMajJMJ9Yc/f/Ex/xXp7A19ShbkH3Sy6k7qP9glA4W4v+9lHNvVRNwi9IJIYKFxLKg328Gs6AA==';
    const publicKey = Buffer.from('dc18e74b21d9beb632ef4ba671db00f522da9716ddde223775a5b160f7baba72', 'hex');
    const signed = safeSignVerify(data, Buffer.from(signature, 'base64'), publicKey);
    console.log(signed);
}

verifyTonSig().then(() => process.exit(0)).catch(e => console.log(e));

const addr = 'kQCkeUfuGycIp6EJN3LdqhdlOd7aNdLEqxk5LnQYij1Q6EHZ';
const msg = 'Telegram1842871751';
const pubkey = Buffer.from('dc18e74b21d9beb632ef4ba671db00f522da9716ddde223775a5b160f7baba72', 'hex');
let walletV4 = WalletContractV4.create({workchain: 0, publicKey: pubkey});
let walletV3R2 = WalletContractV3R2.create({workchain: 0, publicKey: pubkey});
console.log(walletV4.address.equals(Address.parse(addr)));
console.log(walletV3R2.address.equals(Address.parse(addr)));
let text = 'Bind your address with Telegram';
let signature = 'lcdLfMbaMK99d43efOxr8sAoW0BdcSQzFzPT9V+3iPpk7wSpTZBJ8+ZnHiFT6zWCuwj/xI3I/uxz0fI+lgR8Dg==';
console.log(utils.verifyTonSig(addr, text, msg, signature, pubkey))
text = 'Unbind your address with Telegram';
signature = 'BsMx6tIu/I5AzZ7v6rLWIs4oFwzl0o2Q06dx2PjqIWZGQqFX94znB+Hc4mnx7dUyzoXrVkytH+HU7djy9MZ3AQ==';
console.log(utils.verifyTonSig(addr, text, msg, signature, pubkey))
