const zeroAddr = '0x0000000000000000000000000000000000000000';
const env = require("../../config/env.json");

const BIND_STATUS_ACCEPT_REF = 0;
const BIND_STATUS_ACTIVE = 1;
const BIND_STATUS_DEACTIVE = 2;

const OrderStatusInit = 0;

const RESP_CODE_NORMAL_ERROR = 50000;

const RESP_CODE_ILLEGAL_PARAM = 40000;
const RESP_CODE_ILLEGAL_SIG = 40001;

const SOCIAL_MEDIAS = ["Twitter", "Facebook", "Instagram", "Telegram"];

const VOTER_TYPE_PER_ADDR = 1; // one ballot per address
const VOTER_TYPE_PER_NFT = 2; // one ballot per NFT
const VOTER_TYPE_SON = 3; // one ballot per SON
const VOTER_TYPE_OTHER_TOKEN = 4; // ballot for other tokens
const VOTER_TYPE_TONCOIN = 5; // ballot per TON

const CHAIN_NAME_MAINNET = "mainnet";
const CHAIN_NAME_POLYGON = "polygon";
const CHAIN_NAME_RINKEBY = "rinkeby";
const CHAIN_NAME_MUMBAI = "mumbai";
const CHAIN_NAME_FLOW_TESTNET = "flowtest";
const CHAIN_NAME_FLOW_MAINNET = "flowmain";
const CHAIN_NAME_TON_MAINNET = "TONmain"
const CHAIN_NAME_TON_TESTNET = "TONtest"

const ERC721 = '721';
const ERC1155 = '1155';

function getExplorer(chainName) {
    if (chainName === CHAIN_NAME_MAINNET) {
        return "https://api.etherscan.io/api";
    } else if (chainName === CHAIN_NAME_POLYGON) {
        return 'https://api.polygonscan.com/api';
    } else if (chainName === CHAIN_NAME_RINKEBY) {
        return 'https://api-rinkeby.etherscan.io/api';
    } else if (chainName === CHAIN_NAME_MUMBAI) {
        return 'https://api-testnet.polygonscan.com/api';
    } else {
        return "";
    }
}

function getNodeUrl(chainName) {
    if (chainName === CHAIN_NAME_MAINNET) {
        return "https://eth-mainnet.g.alchemy.com/v2/" + env.ALCHEMY_MAINNET;
    } else if (chainName === CHAIN_NAME_POLYGON) {
        return 'https://polygon-mainnet.g.alchemy.com/v2/' + env.ALCHEMY_POLYGON;
    } else if (chainName === CHAIN_NAME_RINKEBY) {
        return 'https://eth-rinkeby.g.alchemy.com/v2/' + env.ALCHEMY_RINKEBY;
    } else if (chainName === CHAIN_NAME_MUMBAI) {
        return 'https://polygon-mumbai.g.alchemy.com/v2/' + env.ALCHEMY_MUMBAI;
    } else if (chainName === CHAIN_NAME_TON_TESTNET) {
        return "https://testnet.toncenter.com/api/v2/jsonRPC"
    } else if (chainName === CHAIN_NAME_TON_MAINNET) {
        return "https://toncenter.com/api/v2/jsonRPC"
    } else {
        return ""
    }
}

const TON_CENTER_API_KEY = env.TON_CENTER_API;

module.exports = {
    zeroAddr,
    OrderStatusInit,
    RESP_CODE_NORMAL_ERROR,
    RESP_CODE_ILLEGAL_PARAM,
    RESP_CODE_ILLEGAL_SIG,

    SOCIAL_MEDIAS,

    BIND_STATUS_ACCEPT_REF,
    BIND_STATUS_ACTIVE,
    BIND_STATUS_DEACTIVE,
    VOTER_TYPE_PER_ADDR,
    VOTER_TYPE_PER_NFT,
    VOTER_TYPE_SON,
    VOTER_TYPE_OTHER_TOKEN,
    VOTER_TYPE_TONCOIN,

    CHAIN_NAME_MAINNET,
    CHAIN_NAME_POLYGON,
    CHAIN_NAME_RINKEBY,
    CHAIN_NAME_MUMBAI,
    CHAIN_NAME_FLOW_TESTNET,
    CHAIN_NAME_FLOW_MAINNET,
    CHAIN_NAME_TON_MAINNET,
    CHAIN_NAME_TON_TESTNET,

    getExplorer,
    getNodeUrl,

    TON_CENTER_API_KEY,

    ERC721,
    ERC1155
}
