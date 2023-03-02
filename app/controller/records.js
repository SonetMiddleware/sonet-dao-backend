const Controller = require('egg').Controller;
const data = require('./data');
const utils = require('../utils/utils');

class RecordController extends Controller {
    async queryRecord() {
        const {ctx} = this;
        let param = ctx.query;
        ctx.validate({
            contract: 'address'
        }, param);
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(await ctx.service.recordsService.queryRecord(param.chain_name, param.contract,
            param.tokenId, limit, offset));
    }
}

module.exports = RecordController;
