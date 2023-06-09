const Service = require('egg').Service;

class QueueService extends Service {
    async queue(gid, uid, info) {
        await this.app.mysql.get('app').insert('queue', {
            queue_id: 0, gid: gid, uid: uid, info: info
        });
    }

    async dequeue(gid, uid, count) {
        const mysql = await this.app.mysql.get('app');
        const res = await mysql.select('queue', {
            columns: ['info', 'queue_id'],
            where: {gid: gid, uid: uid},
            limit: count, orders: ['queue_id']
        });
        if (!res || res.length === 0) {
            return [];
        }
        const lastId = res[res.length - 1].queue_id;
        await mysql.query(`delete
                           from queue
                           where gid = ?
                             and uid = ?
                             and queue_id <= ?`, [gid, uid, lastId]);
        return res.map(item => item.info);
    }

    async fetch(gid, uid, limit, offset) {
        const res = await this.app.mysql.get('app').select('queue', {
            columns: ['info'],
            where: {gid: gid, uid: uid},
            limit: limit,
            offset: offset,
            orders: ['queue_id']
        });
        return res.map(item => item.info);
    }

    async count(gid, uid) {
        const res = await this.app.mysql.get('app').query('select count(*) as total from queue where gid=? and uid=?', [gid, uid]);
        if (!res || res.length === 0) {
            return 0;
        }
        return res[0].total
    }
}

module.exports = QueueService;