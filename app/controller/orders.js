const Controller = require('egg').Controller;
const data = require('./data');
const utils = require("../utils/utils");

class OrderController extends Controller {
    async queryOrder() {
        const {ctx} = this;
        let param = ctx.query;
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(await ctx.service.ordersService.queryOrder(param.chain_name, param.order_id,
            param.token_id, param.status, param.contract, param.seller, param.buyer, limit, offset));
    }
}

module.exports = OrderController;
