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
}

module.exports = NFTController;
