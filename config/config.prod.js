const path = require('path');
// HTTPS
exports.cluster = {
    https: {
        key: path.join(__dirname, './ca/server.key'),
        cert: path.join(__dirname, './ca/server.crt')
    }
};

