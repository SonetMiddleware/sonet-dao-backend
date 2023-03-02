const Service = require('egg').Service;
const constant = require('../utils/constant');

class OrdersService extends Service {
    async queryOrder(chainName, order_id, token_id, status, contract, seller, buyer, limit, offset) {
        const mysql = this.app.mysql.get('chainData');
        if (!order_id && !token_id && !status && !contract && !seller && !buyer) {
            return mysql.select('order'+"_"+chainName, {where: {status: constant.OrderStatusInit}});
        }
        let sql = `select count(*) from order_${chainName}`;
        let condition = [];
        let param = [];
        if (order_id) {
            condition.push('order_id=?');
            param.push(order_id);
        }
        if (token_id) {
            condition.push('token_id=?');
            param.push(token_id);
        }
        if (status) {
            condition.push('status=?');
            param.push(status);
        }
        if (contract) {
            condition.push('contract=?');
            param.push(contract);
        }
        if (seller) {
            condition.push('seller=?');
            param.push(seller);
        }
        if (buyer) {
            condition.push('buyers LIKE ?');
            param.push("%" + buyer + "%");
        }
        let whereClause = condition.join(' and ');
        sql += ' where ' + whereClause + ' order by order_id';
        if (offset && limit) {
            sql += ' limit ' + offset + ', ' + limit
        } else if (limit) {
            sql += ' limit ' + limit;
        }
        let total = await mysql.query(`select count(*) from order_${chainName} where ` + whereClause, param);
        total = total[0]['count(*)'];
        return {"total": total, data: await mysql.query(sql, param)};
    }
}

module.exports = OrdersService;
