create table blockchain_data.deal_TONmain
(
    order_id    bigint      not null,
    contract    varchar(62) not null,
    token_id    varchar(40) not null,
    seller      varchar(62) not null,
    buyer       varchar(62) not null,
    sell_token  varchar(62) not null,
    amount      varchar(40) not null,
    cash_amount varchar(40) not null,
    deal_block  bigint      not null,
    tx_index    int         not null,
    log_index   int         not null,
    primary key (tx_index, log_index, deal_block)
)
    charset = utf8mb3;

create table blockchain_data.height_TONmain
(
    height bigint not null
)
    charset = utf8mb3;

create table blockchain_data.nft_TONmain
(
    contract     varchar(62)   not null,
    erc          varchar(5)    not null,
    token_id     varchar(40)   not null,
    amount       varchar(40)   not null,
    uri          varchar(1000) not null,
    owner        varchar(62)   not null,
    update_block bigint        not null,
    primary key (contract, token_id, owner)
)
    charset = utf8mb3;

create table blockchain_data.order_TONmain
(
    order_id     bigint         not null
        primary key,
    status       tinyint        not null,
    contract     varchar(62)    not null,
    erc          varchar(5)     not null,
    token_id     varchar(40)    not null,
    uri          varchar(1000)  not null,
    seller       varchar(62)    not null,
    sell_token   varchar(62)    not null,
    init_amount  varchar(40)    not null,
    min_price    varchar(60)    not null,
    max_price    varchar(60)    not null,
    start_block  varchar(40)    not null,
    duration     varchar(60)    not null,
    amount       varchar(40)    not null,
    final_price  varchar(40)    not null,
    buyers       varchar(10240) not null,
    update_block bigint         not null
)
    charset = utf8mb3;
create table blockchain_data.deal_TONtest
(
    order_id    bigint      not null,
    contract    varchar(62) not null,
    token_id    varchar(40) not null,
    seller      varchar(62) not null,
    buyer       varchar(62) not null,
    sell_token  varchar(62) not null,
    amount      varchar(40) not null,
    cash_amount varchar(40) not null,
    deal_block  bigint      not null,
    tx_index    int         not null,
    log_index   int         not null,
    primary key (tx_index, log_index, deal_block)
)
    charset = utf8mb3;

create table blockchain_data.height_TONtest
(
    height bigint not null
)
    charset = utf8mb3;

create table blockchain_data.nft_TONtest
(
    contract     varchar(62)   not null,
    erc          varchar(5)    not null,
    token_id     varchar(40)   not null,
    amount       varchar(40)   not null,
    uri          varchar(1000) not null,
    owner        varchar(62)   not null,
    update_block bigint        not null,
    primary key (contract, token_id, owner)
)
    charset = utf8mb3;

create table blockchain_data.order_TONtest
(
    order_id     bigint         not null
        primary key,
    status       tinyint        not null,
    contract     varchar(62)    not null,
    erc          varchar(5)     not null,
    token_id     varchar(40)    not null,
    uri          varchar(1000)  not null,
    seller       varchar(62)    not null,
    sell_token   varchar(62)    not null,
    init_amount  varchar(40)    not null,
    min_price    varchar(60)    not null,
    max_price    varchar(60)    not null,
    start_block  varchar(40)    not null,
    duration     varchar(60)    not null,
    amount       varchar(40)    not null,
    final_price  varchar(40)    not null,
    buyers       varchar(10240) not null,
    update_block bigint         not null
)
    charset = utf8mb3;

create table if not exists `ton_voter_records`
(
    proposal_id varchar(66) not null, # proposal id
    token_id    varchar(42) not null,
    primary key (proposal_id, token_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

alter table blockchain_data.collection_map
    modify contract varchar(62) not null;
alter table accept_referral
    modify addr varchar(62) not null;

alter table bind_addr
    modify addr varchar(62) not null;
alter table favorite
    modify addr varchar(62) not null;

alter table favorite
    modify contract varchar(62) not null;

alter table proposal
    modify creator varchar(62) not null;

alter table proposer_white_list
    modify proposer varchar(62) not null;

alter table twitter_nft
    modify contract varchar(62) not null;

alter table voter
    modify voter varchar(62) not null;


