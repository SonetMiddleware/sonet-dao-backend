const env = require('../../config/env.json');
const {urlSource} = require("ipfs-http-client");

async function uploadFileToIPFS(imgUrl) {
    const ipfsClient = await import('ipfs-http-client');
    const auth =
        'Basic ' + Buffer.from(env.INFURA_IPFS_KEY).toString('base64');
    const client = ipfsClient.create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
            authorization: auth,
        },
    });
    let file = await client.add(urlSource(imgUrl));
    return `ipfs://${file.cid.toString()}`;
}

module.exports = {
    uploadFileToIPFS
}
