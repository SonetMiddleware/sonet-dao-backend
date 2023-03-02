const Controller = require('egg').Controller;
const data = require('./data');
const constant = require('../utils/constant');

class Statistic extends Controller {
    async getData() {
        const {ctx} = this;
        try {
            let stat = await ctx.service.statisticService.getData();
            ctx.body = data.newNormalResp(stat)
        } catch (e) {
            ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString(), {});
        }
    }
}

module.exports = Statistic;
