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

const VOTER_TYPE_PER_ADDR = 1; // one ballot per address(owned NFT)
const VOTER_TYPE_PER_NFT = 2; // one ballot per NFT
const VOTER_TYPE_SON = 3; // one ballot per SON
const VOTER_TYPE_OTHER_TOKEN = 4; // ballot for other tokens
const VOTER_TYPE_TONCOIN = 5; // ballot per TON
const VOTER_TYPE_PER_OPEN_ADDR = 6; // one ballot per address(anyone)
const VOTER_TYPE_PER_NFT_HOLDER_IN_TG_GROUP = 7; // one ballot per NFT in TG group

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

const MSG_ACTION_LIKE = 'like';
const MSG_ACTION_UNLIKE = 'unlike';
const MSG_ACTION_FOLLOW = 'follow';

const CFG_HIDDEN_0_PROPOSAL_DAO = 'hidden_0_proposal_dao';

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
        return "https://mainnet.infura.io/v3/" + env.INFURA_KEY;
    } else if (chainName === CHAIN_NAME_POLYGON) {
        return "https://polygon-mainnet.infura.io/v3/" + env.INFURA_KEY;
    } else if (chainName === CHAIN_NAME_MUMBAI) {
        return "https://polygon-mumbai.infura.io/v3/" + env.INFURA_KEY;
    } else if (chainName === CHAIN_NAME_TON_TESTNET) {
        return "https://testnet.toncenter.com/api/v2/jsonRPC"
    } else if (chainName === CHAIN_NAME_TON_MAINNET) {
        return "https://toncenter.com/api/v2/jsonRPC"
    } else {
        return ""
    }
}

const TON_CENTER_API_KEY = env.TON_CENTER_API;

function checkMsgAction(action) {
    return action === MSG_ACTION_LIKE || action === MSG_ACTION_UNLIKE || action === MSG_ACTION_FOLLOW;
}

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
    VOTER_TYPE_PER_OPEN_ADDR,
    VOTER_TYPE_PER_NFT_HOLDER_IN_TG_GROUP,

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
    ERC1155,

    MSG_ACTION_LIKE, MSG_ACTION_UNLIKE, MSG_ACTION_FOLLOW, checkMsgAction,
    CFG_HIDDEN_0_PROPOSAL_DAO
}
