const Controller = require('egg').Controller;
const fs = require('fs');

class AssetsERC1155 extends Controller {
    async getURIAssets() {
        const {ctx} = this;
        let contracts = ctx.params.contracts;
        let tokenId = ctx.params.token_id;
        const fileContent = await fs.readFileSync(this.config.assets + 'erc-1155/' + contracts + '/' + tokenId);
        ctx.body = fileContent.toString();
    }
}

module.exports = AssetsERC1155;
