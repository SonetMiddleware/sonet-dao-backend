const Service = require('egg').Service;

class StatisticService extends Service {
    async getData() {
        const mysql = this.app.mysql.get('app');
        const results = await mysql.select('statistics', {
            orders: [['time', 'desc']],
            limit: 1
        });
        return results[0];
    }
}

module.exports = StatisticService;
