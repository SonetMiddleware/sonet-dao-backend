const Controller = require('egg').Controller;
const {parsePageParamToDBParam, verifyTGRobot} = require("../utils/utils");
const data = require("./data");
const constant = require("../utils/constant");

class QueueController extends Controller {
    async queue() {
        const {ctx} = this;
        let param = ctx.request.body;
        if (!verifyTGRobot(ctx.request)) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: sig");
            return;
        }
        try {
            await ctx.service.queueService.queue(param.gid, param.uid, param.info);
            ctx.body = data.newNormalResp({});
        } catch (e) {
            ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString());
        }
    }

    async dequeue() {
        const {ctx} = this;
        let param = ctx.request.body;
        if (!verifyTGRobot(ctx.request)) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: sig");
            return;
        }
        if (param.count > 100 || param.count <= 0) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: count");
            return;
        }
        try {
            const res = await ctx.service.queueService.dequeue(param.gid, param.uid, param.count);
            ctx.body = data.newNormalResp(res);
        } catch (e) {
            ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString());
        }
    }

    async fetch() {
        const {ctx} = this;
        let param = ctx.query;
        if (!verifyTGRobot(ctx.request)) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: sig");
            return;
        }
        const [limit, offset] = parsePageParamToDBParam(param.page, param.gap);
        try {
            const res = await ctx.service.queueService.fetch(param.gid, param.uid, limit, offset);
            ctx.body = data.newNormalResp(res);
        } catch (e) {
            ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString());
        }
    }

    async count() {
        const {ctx} = this;
        let param = ctx.query;
        if (!verifyTGRobot(ctx.request)) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: sig");
            return;
        }
        try {
            const count = await ctx.service.queueService.count(param.gid, param.uid);
            ctx.body = data.newNormalResp(count);
        } catch (e) {
            ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString());
        }
    }
}

module.exports = QueueController;