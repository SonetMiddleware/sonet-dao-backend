const Controller = require('egg').Controller;
const data = require('./data');
const Web3 = require('web3');
const web3 = new Web3();
const constant = require('../utils/constant');
const utils = require("../utils/utils");
const {isFlowContract, isFlowAddr} = require("../utils/utils");
const {sha256} = require("js-sha256");
const {uploadStreamToIPFS} = require("../utils/ipfs");
const {v4: uuidv4} = require('uuid');
const path = require('path');
const fs = require('fs');
const {pipeline} = require('stream/promises');
const {RESP_CODE_ILLEGAL_PARAM} = require("../utils/constant");

class NFTController extends Controller {
    async queryNFTById() {
        const {ctx} = this;
        let nftId = ctx.params.nft_id;
        ctx.body = data.newNormalResp(await ctx.service.nftService.queryNFTById(nftId));
    }

    async regNFT() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            contract: 'address'
        }, param);
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        if (!param.token_id && +param.token_id !== 0) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'illegal param: token_id', {});
            return;
        }
        ctx.body = data.newNormalResp(await ctx.service.nftService.regNFT(param.chain_name, param.contract, param.token_id));
    }

    async favoriteNFT() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            contract: 'address'
        }, param);
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        if (!param.token_id && +param.token_id !== 0) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'illegal param: token_id', {});
            return;
        }
        if (param.fav === 1 || param.fav === '1') {
            await ctx.service.nftService.favorite(param.chain_name, param.addr, param.contract, param.token_id, param.uri);
        } else if (param.fav === 0 || param.fav === '0') {
            await ctx.service.nftService.notFavorite(param.chain_name, param.addr, param.contract, param.token_id);
        }
        ctx.body = data.newNormalResp({});
    }

    async queryFavorite() {
        const {ctx} = this;
        let param = ctx.query;
        ctx.validate({
            addr: 'address'
        }, param);
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        if (!web3.utils.isAddress(param.contract) && !isFlowContract(param.contract)) {
            param.contract = undefined;
        }
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(await ctx.service.nftService.queryFavorite(param.chain_name, param.addr,
            param.contract, limit, offset));
    }

    async queryNFT() {
        const {ctx} = this;
        let param = ctx.query;
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        if (!web3.utils.isAddress(param.contract) && !isFlowContract(param.contract)) {
            param.contract = undefined;
        }
        if (!web3.utils.isAddress(param.addr) && !isFlowAddr(param.addr)) {
            param.addr = undefined;
        }
        if (!param.addr && !param.contract) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'illegal user addr and contract addr', {});
        }
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(await ctx.service.nftService.queryNFT(param.chain_name, param.addr,
            param.contract, param.token_id, limit, offset));
    }

    async getTONCollectionMetadata() {
        const {ctx} = this;
        let collectionName = ctx.params.collection_name;
        let chain_name = ctx.params.chain_name;
        ctx.body = await ctx.service.nftService.getTONCollectionMetadata(chain_name, collectionName);
    }

    async getTONCollectionItemMetadata() {
        const {ctx} = this;
        let collectionName = ctx.params.collection_name;
        let chain_name = ctx.params.chain_name;
        let token_id = ctx.params.token_id;
        ctx.body = await ctx.service.nftService.getTONCollectionItemMetadata(chain_name, collectionName, token_id);
    }

    async queryCreatedCollection() {
        const {ctx} = this;
        let param = ctx.query;
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        ctx.validate({
            creator: 'address'
        }, param);
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = await ctx.service.nftService.queryCreatedCollection(param.chain_name, param.name, param.creator, limit, offset);
    }

    async uploadFileToIPFS() {
        const {ctx} = this;
        const files = ctx.request.files;
        if (!files || files.length > 9) {
            ctx.body = data.newResp(RESP_CODE_ILLEGAL_PARAM, 'too many files', {})
            return
        }
        const res = [];
        const uuid = uuidv4();
        const dir = path.join(this.config.baseDir, `app/public/${uuid}`);
        fs.mkdirSync(dir);
        try {
            let index = 1;
            for (const file of files) {
                const filename = index + file.filename;
                index++
                const targetPath = path.join(dir, index + filename);
                const source = fs.createReadStream(file.filepath);
                const target = fs.createWriteStream(targetPath);
                await pipeline(source, target);
            }
            let ipfsFiles = await uploadStreamToIPFS(dir);
            for await (const file of ipfsFiles) {
                res.push('ipfs://' + file.cid.toString());
            }
            ctx.body = data.newNormalResp(res)
        } catch (e) {
            ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString())
        } finally {
            // delete those request tmp files
            await ctx.cleanupRequestFiles();
            fs.rmdirSync(dir, {recursive: true});
        }
    }

    async genTONCollectionDeployTx() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        ctx.validate({
            owner: 'address'
        }, param);
        ctx.validate({
            royalty_address: 'address'
        }, param);
        try {
            ctx.body = data.newNormalResp(await ctx.service.nftService.genTONCollectionDeployTx(param));
        } catch (e) {
            ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString())
        }
    }

    async genTONNFTItemMintTx() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        ctx.validate({
            owner: 'address'
        }, param);
        ctx.validate({
            addr: 'address'
        }, param.collection);
        try {
            ctx.body = data.newNormalResp(await ctx.service.nftService.genTONNFTItemMintTx(param));
        } catch (e) {
            ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString())
        }
    }
}

module.exports = NFTController;
