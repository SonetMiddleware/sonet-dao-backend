const Controller = require('egg').Controller;
const data = require('./data');
const Web3 = require('web3');
const web3 = new Web3();
const constant = require('../utils/constant');
const utils = require("../utils/utils");
const {isFlowNetwork, verifyFlowSig, isTONNetwork, verifyTonSig, verifyTGRobot} = require("../utils/utils");
const {checkMsgAction, RESP_CODE_ILLEGAL_PARAM, RESP_CODE_ILLEGAL_SIG} = require("../utils/constant");

class SocialMediaController extends Controller {
    async bindAddr() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            addr: 'address'
        }, param);
        let valid = false;
        for (let i = 0; i < constant.SOCIAL_MEDIAS.length; i++) {
            if (constant.SOCIAL_MEDIAS[i] === param.platform) {
                valid = true;
                break;
            }
        }
        if (!valid) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'illegal param: platform', {});
            return;
        }
        let message = param.platform + param.tid;
        if (isFlowNetwork(param.chain_name)) {
            valid = await verifyFlowSig(param.chain_name, param.addr, message, param.sig);
        } else if (isTONNetwork(param.chain_name)) {
            valid = verifyTGRobot(ctx.request);
            if (param.sig && param.pubkey) {
                let sigValid = utils.verifyTonSig(param.addr, 'Bind your address with Telegram',
                    message, param.sig, Buffer.from(param.pubkey, 'hex'));
                valid = valid && sigValid;
            }
        } else {
            let signer = web3.eth.accounts.recover(message, param.sig);
            valid = signer === param.addr;
        }
        if (valid) {
            await this.ctx.service.socialMediaService.addBind(param.addr, param.platform, param.tid);
            ctx.body = data.newNormalResp({});
        } else {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_SIG, 'illegal sig', {});
        }
    }

    async recordContentId() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            addr: 'address'
        }, param);
        let valid = false;
        for (let i = 0; i < constant.SOCIAL_MEDIAS.length; i++) {
            if (constant.SOCIAL_MEDIAS[i] === param.platform) {
                valid = true;
                break;
            }
        }
        if (!valid) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'illegal param: platform', {});
            return;
        }
        try {
            await this.ctx.service.socialMediaService.recordContentId(param.addr, param.platform, param.tid, param.content_id);
            this.ctx.body = data.newNormalResp({})
        } catch (e) {
            this.ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString(), {});
        }
    }

    async unbind() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            addr: 'address'
        }, param);
        let valid = false;
        for (let i = 0; i < constant.SOCIAL_MEDIAS.length; i++) {
            if (constant.SOCIAL_MEDIAS[i] === param.platform) {
                valid = true;
                break;
            }
        }
        if (!valid) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'illegal param: platform', {});
            return;
        }
        let message = param.platform + param.tid;
        if (isFlowNetwork(param.chain_name)) {
            valid = await verifyFlowSig(param.chain_name, param.addr, message, param.sig);
        } else if (isTONNetwork(param.chain_name)) {
            valid = verifyTGRobot(ctx.request);
            if (param.sig && param.pubkey) {
                let sigValid = utils.verifyTonSig(param.addr, 'Unbind your address with Telegram',
                    message, param.sig, Buffer.from(param.pubkey, 'hex'));
                valid = valid && sigValid;
            }
        } else {
            let signer = web3.eth.accounts.recover(message, param.sig);
            valid = signer === param.addr;
        }
        if (valid) {
            await this.ctx.service.socialMediaService.unbind(param.addr, param.platform, param.tid);
            ctx.body = data.newNormalResp({});
        } else {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_SIG, 'illegal sig', {});
        }
    }

    async bindAttr() {
        const {ctx} = this;
        let param = ctx.request.query;
        if (param.addr || param.tid) {
            this.ctx.body = data.newNormalResp(await this.ctx.service.socialMediaService.queryBind(param.addr, param.tid));
        } else {
            this.ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'empty param', {});
        }
    }

    async acceptReferral() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            addr: 'address'
        }, param);
        let valid = false;
        if (isFlowNetwork(param.chain_name)) {
            valid = await verifyFlowSig(param.chain_name, param.addr, param.referral, param.sig);
        } else if (isTONNetwork(param.chain_name)) {
            valid = verifyTGRobot(ctx.request);
        } else {
            let signer = web3.eth.accounts.recover(param.referral, param.sig);
            valid = signer === param.addr;
        }
        if (valid) {
            try {
                await this.ctx.service.socialMediaService.acceptReferral(param.addr, param.referral);
                this.ctx.body = data.newNormalResp({})
            } catch (e) {
                this.ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString(), {});
            }
        } else {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_SIG, 'illegal sig', {});
        }
    }

    async generateReferralCode() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            addr: 'address'
        }, param);
        if (param.addr && param.platform && param.tid) {
            try {
                const code = await this.ctx.service.socialMediaService.generateReferralCode(param.addr, param.platform, param.tid);
                this.ctx.body = data.newNormalResp(code)
            } catch (e) {
                this.ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString(), {});
            }
        } else {
            this.ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'empty param', {});
        }
    }

    async getSelfReferralCode() {
        const {ctx} = this;
        let param = ctx.request.query;
        ctx.validate({
            addr: 'address'
        }, param);
        if (param.addr && param.platform && param.tid) {
            this.ctx.body = data.newNormalResp(await this.ctx.service.socialMediaService.getSelfReferralCode(
                param.addr, param.platform, param.tid));
        } else {
            this.ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'empty param', {});
        }
    }

    async getBindCode() {
        const {ctx} = this;
        let param = ctx.request.query;
        ctx.validate({
            addr: 'address'
        }, param);
        if (param.addr) {
            this.ctx.body = data.newNormalResp(await this.ctx.service.socialMediaService.getBindCode(param.addr));
        } else {
            this.ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'empty param', {});
        }
    }

    async getReferralCodeCount() {
        const {ctx} = this;
        let param = ctx.request.query;
        if (param.code) {
            this.ctx.body = data.newNormalResp(await this.ctx.service.socialMediaService.getReferralCodeCount(
                param.code));
        } else {
            this.ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'empty param', {});
        }
    }

    async getNFTTwitterCounts() {
        let nftParam = this.parseAndCheckNFTParam();
        if (nftParam) {
            this.ctx.body = data.newNormalResp(await this.ctx.service.socialMediaService.getNFTTwitterCounts(
                nftParam.chain_name, nftParam.contract, nftParam.tokenId));
        } else {
            this.ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'illegal param', {});
        }
    }

    async getNFTTwitterSnapshot() {
        const {ctx} = this;
        let param = ctx.request.query;
        let nftParam = this.parseAndCheckNFTParam();
        if (nftParam && param.start) {
            this.ctx.body = data.newNormalResp(await this.ctx.service.socialMediaService.getNFTTwitterSnapshot(
                nftParam.chain_name, nftParam.contract, nftParam.tokenId, param.start, param.count));
        } else {
            this.ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'illegal param', {});
        }
    }

    async addTwitterNFT() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        ctx.validate({
            contract: 'address'
        }, param);
        if (param.token_id && param.tid && param.user_id && param.user_name) {
            try {
                await this.ctx.service.socialMediaService.addTwitterNFT(param.chain_name, param.contract,
                    param.token_id, param.tid, param.user_img, param.user_id, param.user_name, param.t_content);
                this.ctx.body = data.newNormalResp({});
            } catch (e) {
                this.ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString(), {});
            }
        } else {
            this.ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'empty param', {});
        }
    }

    async getTwitterNFT() {
        const {ctx} = this;
        let param = ctx.request.query;
        let nftParam = this.parseAndCheckNFTParam();
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        if (nftParam) {
            this.ctx.body = data.newNormalResp(await this.ctx.service.socialMediaService.getTwitterNFT(
                nftParam.chain_name, nftParam.contract, nftParam.tokenId, param.tid, limit, offset));
        } else if (param.tid) {
            this.ctx.body = data.newNormalResp(await this.ctx.service.socialMediaService.getTwitterNFT(
                undefined, undefined, undefined, param.tid, limit, offset));
        } else {
            this.ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'illegal param', {});
        }
    }

    parseAndCheckNFTParam() {
        const {ctx} = this;
        let param = ctx.request.query;
        if (!param.nft) {
            return
        }
        let nftParams = param.nft.split(",");
        if (nftParams.length !== 3) {
            this.ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'illegal param: nft', {});
            return;
        }
        let nftParam = {};
        nftParam.chain_name = nftParams[0];
        nftParam.contract = nftParams[1];
        nftParam.tokenId = nftParams[2];
        ctx.validate({
            chain_name: 'chainName'
        }, nftParam);
        ctx.validate({
            contract: 'address'
        }, nftParam);
        return nftParam;
    }

    async recordTGMsg() {
        const {ctx} = this;
        if (!verifyTGRobot(ctx.request)) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: sig");
            return;
        }
        let params = ctx.request.body;
        ctx.body = data.newNormalResp(await this.ctx.service.socialMediaService.recordTGMsg(params));
    }

    async actionOnTGMsg() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            nft_contract: 'address'
        }, param);
        if (!verifyTGRobot(ctx.request)) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: sig");
            return;
        }
        if (!checkMsgAction(param.action)) {
            ctx.body = data.newResp(RESP_CODE_ILLEGAL_PARAM, "ill param: action", {})
            return;
        }
        ctx.body = data.newNormalResp(await this.ctx.service.socialMediaService.actionOnTGMsg(param))
    }

    async queryTGGroupMsgStatus() {
        const {ctx} = this;
        let group_id = ctx.params.group_id;
        let param = ctx.request.query;
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        if (!group_id) {
            ctx.body = data.newResp(RESP_CODE_ILLEGAL_PARAM, "ill param: group_id", {})
            return;
        }
        ctx.body = data.newNormalResp(await this.ctx.service.socialMediaService.queryTGGroupMsgStatus(group_id,
            param.order_by, param.origin_msg, limit, offset))
    }

    async queryTGStatus() {
        const {ctx} = this;
        let group_id = ctx.params.group_id;
        let message_id = ctx.params.message_id;
        if (group_id === undefined || message_id === undefined || group_id === "" || message_id === "") {
            ctx.body = data.newResp(RESP_CODE_ILLEGAL_PARAM, "ill param", {})
            return;
        }
        let param = ctx.request.query;
        ctx.body = data.newNormalResp(await this.ctx.service.socialMediaService.queryTGMsgStatus(group_id, message_id,
            param.origin_msg))
    }

    async queryTGRawMsg() {
        const {ctx} = this;
        let param = ctx.request.query;
        if (!param.group_id) {
            ctx.body = data.newResp(RESP_CODE_ILLEGAL_PARAM, "ill param: group_id", {})
            return;
        }
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(await this.ctx.service.socialMediaService.queryTGRawMsg(param.group_id,
            param.message_id, param.type, param.data, limit, offset))
    }

    async recordLaunchpad() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            address: 'tonAddress',
            sold_jetton: 'tonAddress',
            owner: 'tonAddress',
        }, param);
        if (param.source_jetton) {
            ctx.validate({
                source_jetton: 'tonAddress'
            }, param);
        }
        if (!verifyTGRobot(ctx.request)) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: sig");
            return;
        }
        try {
            await this.ctx.service.socialMediaService.recordLaunchpad(param);
            this.ctx.body = data.newNormalResp({})
        } catch (e) {
            this.ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString(), {});
        }
    }

    async queryLaunchpad() {
        const {ctx} = this;
        let param = ctx.request.query;
        if (!param.group_id || !param.is_mainnet) {
            ctx.body = data.newResp(RESP_CODE_ILLEGAL_PARAM, "ill param: group_id or is_mainnet", {})
            return;
        }
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(await this.ctx.service.socialMediaService.queryLaunchpad(param.group_id,
            !param.is_mainnet, param.order_mode, limit, offset))
    }

    async queryTonCampaign() {
        const {ctx} = this;
        let param = ctx.request.query;
        if (!param.collection_id) {
            ctx.body = data.newResp(RESP_CODE_ILLEGAL_PARAM, "ill param: collection_id", {})
            return;
        }
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(await this.ctx.service.socialMediaService.queryTonCampaign(param.collection_id,
            param.is_mainnet, limit, offset))
    }

    async queryTonCampaignTasks() {
        const {ctx} = this;
        let param = ctx.request.query;
        if (!param.campaign_id) {
            ctx.body = data.newResp(RESP_CODE_ILLEGAL_PARAM, "ill param: campaign_id", {})
            return;
        }
        if (param.address) {
            ctx.validate({
                address: 'tonAddress',
            }, param);
        }
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(await this.ctx.service.socialMediaService.queryTonCampaignTasks(param.campaign_id,
            param.address, limit, offset))
    }

    async queryTonUserCampaignTasks() {
        const {ctx} = this;
        let param = ctx.request.query;
        if (!param.campaign_id) {
            ctx.body = data.newResp(RESP_CODE_ILLEGAL_PARAM, "ill param: campaign_id", {})
            return;
        }
        ctx.validate({
            address: 'tonAddress',
        }, param);
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(await this.ctx.service.socialMediaService.queryTonUserCampaignTasks(
            param.address, param.campaign_id, limit, offset))
    }

    async recordUserTaskAtCampaign() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            address: 'tonAddress',
        }, param);
        if (!param.campaign_id) {
            ctx.body = data.newResp(RESP_CODE_ILLEGAL_PARAM, "ill param: campaign_id", {})
            return;
        }
        if (!verifyTGRobot(ctx.request)) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: sig");
            return;
        }
        try {
            await this.ctx.service.socialMediaService.recordUserTaskAtCampaign(param.address, param.campaign_id, param.task_id);
            this.ctx.body = data.newNormalResp({})
        } catch (e) {
            this.ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString(), {});
        }
    }
}

module.exports = SocialMediaController;
