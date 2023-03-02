const Web3 = require('web3');
const constant = require('./app/utils/constant')
const {isTONAddr} = require("./app/utils/utils");

module.exports = app => {
    app.validator.addRule('address', (rule, value) => {
        if (isTONAddr(value)) {
            return;
        }
        if (Web3.utils.isAddress(value)) {
            value = Web3.utils.toChecksumAddress(value);
        }
        // check is ETH addr
        if (!Web3.utils.checkAddressChecksum(value)) {
            // check is FLOW contract or FLOW addr
            let splits = value.split(".");
            if (!Web3.utils.isAddress(splits[0] + "000000000000000000000000")) {
                if (splits.length === 1) {
                    return 'illegal addr';
                } else {
                    return 'illegal contract';
                }
            }
        }
    })
    app.validator.addRule('chainName', (rule, value) => {
        if (value !== constant.CHAIN_NAME_MUMBAI && value !== constant.CHAIN_NAME_POLYGON &&
            value !== constant.CHAIN_NAME_RINKEBY && value !== constant.CHAIN_NAME_MAINNET &&
            value !== constant.CHAIN_NAME_FLOW_MAINNET && value !== constant.CHAIN_NAME_FLOW_TESTNET
            && value !== constant.CHAIN_NAME_TON_MAINNET && value !== constant.CHAIN_NAME_TON_TESTNET) {
            return 'illegal chain name';
        }
    })
};
