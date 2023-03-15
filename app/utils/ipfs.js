const env = require('../../config/env.json');
const {urlSource, globSource} = require("ipfs-http-client");
const fs = require('fs');
const {pipeline} = require('stream/promises');

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

async function uploadStreamToIPFS(dir) {
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

    return client.addAll(globSource(dir, '**/*'));
}

module.exports = {
    uploadFileToIPFS, uploadStreamToIPFS
}
