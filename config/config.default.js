const env = require('./env.json');

exports.keys = 'my-cookie-secret-key';
exports.security = {
    csrf: {
        enable: false,
    },
};

exports.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
};

exports.mysql = {
    clients: {
        app: {
            host: 'localhost',
            port: '3306',
            user: env.MYSQL_USER,
            password: env.MYSQL_PASSWORD,
            database: 'platwin',
        },
        chainData: {
            host: 'localhost',
            port: '3306',
            user: env.MYSQL_USER,
            password: env.MYSQL_PASSWORD,
            database: 'blockchain_data',
        },
    },
    app: true,
    agent: true,
};

exports.assets = './assets/'

exports.logger = {
    dir: './logs',
};

exports.customLogger = {
    scheduleLogger: {
        consoleLevel: 'NONE',
        file: './logs/egg-schedule.log',
    },
};

exports.schedule = {
    directory: [],
};

exports.updateProposalNum = true;

exports.uriPrefix = "https://apiv2-test.platwin.io/assets/ton-collection/"
