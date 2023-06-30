const Controller = require('egg').Controller;
const request = require('request');
const data = require('./data');
const utils = require("../utils/utils");
const constant = require("../utils/constant");
const Web3 = require('web3');
const {
    estimateSnapshotTime,
    isFlowNetwork,
    verifyFlowSig,
    isTONNetwork,
    verifyTonSig,
    verifyTGRobot
} = require("../utils/utils");
const {
    VOTER_TYPE_PER_NFT,
    VOTER_TYPE_PER_ADDR,
    VOTER_TYPE_TONCOIN, VOTER_TYPE_PER_OPEN_ADDR
} = require("../utils/constant");
const web3 = new Web3();

class DAOController extends Controller {
    async queryCollectionList() {
        const {ctx} = this;
        let param = ctx.query;
        ctx.validate({
            addr: 'address'
        }, param);
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(await ctx.service.daoService.queryCollectionList(param.chain_name,
            param.collection_name, param.addr, limit, offset));
    }

    async queryCollection() {
        const {ctx} = this;
        let collection_id = ctx.params.collection_id;
        ctx.body = data.newNormalResp(await ctx.service.daoService.queryCollection(collection_id));
    }

    async queryDAO() {
        const {ctx} = this;
        let daoId = ctx.params.dao_id;
        ctx.body = data.newNormalResp(await ctx.service.daoService.queryDAO(daoId));
    }

    async queryCollectionByNFT() {
        const {ctx} = this;
        ctx.validate({
            contract: 'address'
        }, ctx.query);
        let contract = ctx.query.contract;
        ctx.body = data.newNormalResp(await ctx.service.daoService.queryCollectionByNFT(contract));
    }

    async queryCollectionNFTs() {
        const {ctx} = this;
        let param = ctx.query;
        if (param.addr) {
            ctx.validate({
                addr: 'address'
            }, param);
        }
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        let collectionId = param.collection_id;
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(
            await ctx.service.daoService.queryCollectionNFTs(param.chain_name, collectionId, param.addr, limit, offset));
    }

    async queryDAOList() {
        const {ctx} = this;
        let param = ctx.query;
        if (param.addr) {
            ctx.validate({
                addr: 'address'
            }, param);
        }
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(await ctx.service.daoService.queryDAOList(param.chain_name, param.addr, param.name,
            limit, offset));
    }

    async queryProposalList() {
        const {ctx} = this;
        let param = ctx.query;
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(await ctx.service.daoService.queryProposalList(param.dao, limit, offset));
    }

    async queryProposalListV2() {
        const {ctx} = this;
        let param = ctx.query;
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(await ctx.service.daoService.queryProposalListV2(param.dao, limit, offset));
    }

    async queryVotes() {
        const {ctx} = this;
        let param = ctx.query;
        if (param.addr) {
            ctx.validate({
                addr: 'address'
            }, param);
        }
        ctx.body = data.newNormalResp(await ctx.service.daoService.queryVotes(param.collection_id, param.proposal_id,
            param.addr));
    }

    async queryVotesList() {
        const {ctx} = this;
        let param = ctx.query;
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(await ctx.service.daoService.queryVotesList(param.collection_id, param.proposal_id,
            limit, offset));
    }

    async queryVoteCommentsList() {
        const {ctx} = this;
        let param = ctx.query;
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(await ctx.service.daoService.queryVoteCommentsList(param.collection_id,
            param.proposal_id, limit, offset));
    }

    async queryProposalPermission() {
        const {ctx} = this;
        let param = ctx.query;
        if (param.addr) {
            ctx.validate({
                addr: 'address'
            }, param);
        }
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        ctx.body = data.newNormalResp(await ctx.service.daoService.queryProposalPermission(param.chain_name, param.dao,
            param.addr));
    }

    async createProposal() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            creator: 'address'
        }, param);
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        // check time
        const now = Date.now();
        if (now > +param.start_time || now > +param.end_time || +param.start_time > +param.end_time) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: start and end time");
            return;
        }
        // check items
        if (!Array.isArray(param.items) || param.items.length <= 1) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: items");
            return;
        }
        // check voter type
        const voterType = +param.voter_type;
        if (voterType !== constant.VOTER_TYPE_PER_ADDR && voterType !== constant.VOTER_TYPE_PER_NFT
            && voterType !== constant.VOTER_TYPE_SON && voterType !== constant.VOTER_TYPE_TONCOIN
            && voterType !== constant.VOTER_TYPE_PER_OPEN_ADDR && voterType !== constant.VOTER_TYPE_PER_NFT_HOLDER_IN_TG_GROUP) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: voter_type");
            return;
        }
        // check description and title
        if (!param.title || !param.description) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: title|description");
            return;
        }
        // check sig
        const collectionId = param.dao_id ? param.dao_id : param.collection_id;
        let message = web3.utils.soliditySha3("" + param.snapshot_block, collectionId, param.title,
            param.description, "" + param.start_time, "" + param.end_time, "" + param.ballot_threshold,
            param.items.join("|"), "" + param.voter_type);
        let valid = false;
        if (isFlowNetwork(param.chain_name)) {
            valid = await verifyFlowSig(param.chain_name, param.creator, message, param.sig);
        } else if (isTONNetwork(param.chain_name)) {
            valid = verifyTGRobot(ctx.request);
        } else {
            let signer = web3.eth.accounts.recover(message, param.sig);
            valid = signer === param.creator;
        }
        if (!valid) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: sig");
            return;
        }
        // check snapshot block
        if (!isFlowNetwork(param.chain_name) && !isTONNetwork(param.chain_name)) {
            let snapshotTime = await estimateSnapshotTime(param.chain_name, param.snapshot_block);
            if (snapshotTime > +param.end_time) {
                ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: snapshot_block");
                return;
            }
        }
        try {
            const id = await ctx.service.daoService.createProposal(param.chain_name, param.creator, param.snapshot_block,
                collectionId, param.title, param.description, param.start_time, param.end_time,
                param.ballot_threshold, param.items, param.voter_type);
            ctx.body = data.newNormalResp({id: id});
        } catch (e) {
            ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString());
        }
    }

    async vote() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            voter: 'address'
        }, param);
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        // check sig
        let message = web3.utils.soliditySha3(param.proposal_id + '', param.item + '');
        let valid = false;
        if (isFlowNetwork(param.chain_name)) {
            valid = await verifyFlowSig(param.chain_name, param.voter, message, param.sig);
        } else if (isTONNetwork(param.chain_name)) {
            valid = verifyTGRobot(ctx.request);
        } else {
            let signer = web3.eth.accounts.recover(message, param.sig);
            valid = signer === param.voter;
        }
        if (!valid) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: sig");
            return;
        }
        try {
            await ctx.service.daoService.vote(param.chain_name, param.voter, param.collection_id, param.proposal_id,
                param.item, param.comment);
            ctx.body = data.newNormalResp({});
        } catch (e) {
            ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString());
        }
    }

    async getVotes() {
        const {ctx} = this;
        let param = ctx.query;
        ctx.validate({
            voter: 'address'
        }, param);
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        if (+param.voter_type !== VOTER_TYPE_PER_NFT && +param.voter_type !== VOTER_TYPE_PER_ADDR
            && +param.voter_type !== VOTER_TYPE_TONCOIN && +param.voter_type !== VOTER_TYPE_PER_OPEN_ADDR
            && +param.voter_type !== constant.VOTER_TYPE_PER_NFT_HOLDER_IN_TG_GROUP) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "ill voter type");
            return;
        }
        try {
            if (isFlowNetwork(param.chain_name) || isTONNetwork(param.chain_name)) {
                ctx.body = data.newNormalResp(await ctx.service.daoService.getFlowAndTonVotes(param.chain_name, param.voter,
                    param.voter_type, param.collection_id, param.proposal_id));
            } else {
                let power = await ctx.service.daoService.getVotes(param.voter, param.chain_name, param.collection_id,
                    param.voter_type, param.snapshot_block)
                ctx.body = data.newNormalResp(power);
            }
        } catch (e) {
            ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString());
        }
    }

    async createTGDao() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            contract: 'address'
        }, param);
        // check sig
        if (!isTONNetwork(param.chain_name)) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal chain name");
            return;

        } else if (!verifyTGRobot(ctx.request)) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: sig");
            return;
        }
        try {
            await ctx.service.daoService.createTGDao(param);
            ctx.body = data.newNormalResp({});
        } catch (e) {
            ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString());
        }
    }

    async queryProposalListV3() {
        const {ctx} = this;
        let param = ctx.query;
        if (param.dao === undefined) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: dao");
            return
        }
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(await ctx.service.daoService.queryProposalListV3(param.dao, limit, offset));
    }

}

module.exports = DAOController;
