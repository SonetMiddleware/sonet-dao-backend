const Controller = require('egg').Controller;

class IndexController extends Controller {
    async index() {
        const {ctx} = this;
        ctx.body = 'The Res Publica of the Internet';
    }
}

module.exports = IndexController;
