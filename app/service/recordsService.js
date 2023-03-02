const Service = require('egg').Service;

class RecordsService extends Service {
    async queryRecord(chainName, contract, tokenId, limit, offset) {
        let condition = {
            where: {
                contract: contract
            },
            orders: [['deal_block', 'desc'], ['tx_index', 'desc'], ['log_index', 'desc']]
        };
        if (limit && offset) {
            condition.limit = limit;
            condition.offset = offset;
        } else if (limit) {
            condition.limit = limit;
        }
        let where = [];
        let param = [];
        where.push('contract=?');
        param.push(contract);
        if (tokenId) {
            where.push('token_id=?');
            param.push(tokenId);
            condition.where.token_id = tokenId;
        }
        const mysql = this.app.mysql.get('chainData');
        let whereClause = where.join(' and ');
        let total = await mysql.query(`select count(*)
                                       from deal_${chainName}
                                       where ` + whereClause, param);
        total = total[0]['count(*)'];
        return {"total": total, data: await mysql.select(`deal_${chainName}`, condition)};
    }
}

module.exports = RecordsService;
