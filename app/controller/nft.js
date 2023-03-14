const Controller = require('egg').Controller;
const data = require('./data');
const Web3 = require('web3');
const web3 = new Web3();
const constant = require('../utils/constant');
const utils = require("../utils/utils");
const {isFlowContract, isFlowAddr} = require("../utils/utils");
const {sha256} = require("js-sha256");

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
        ctx.body = await ctx.service.nftService.queryCreatedCollection(param.chain_name, param.creator);
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
        // try {
        ctx.body = data.newNormalResp(await ctx.service.nftService.genTONNFTItemMintTx(param));
        // } catch (e) {
        //     ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString())
        // }
    }
}

module.exports = NFTController;
