create table deal_flow
(
    order_id    bigint      not null,
    contract    varchar(42) not null,
    token_id    varchar(40) not null,
    seller      varchar(42) not null,
    buyer       varchar(42) not null,
    sell_token  varchar(42) not null,
    amount      varchar(40) not null,
    cash_amount varchar(40) not null,
    deal_block  bigint      not null,
    tx_index    int         not null,
    log_index   int         not null,
    primary key (tx_index, log_index, deal_block)
)
    charset = utf8mb3;

create table height_flow
(
    height bigint not null
)
    charset = utf8mb3;

create table nft_flow
(
    contract     varchar(42)   not null,
    erc          varchar(5)    not null,
    token_id     varchar(256)  not null,
    amount       varchar(40)   not null,
    uri          varchar(1000) not null,
    owner        varchar(42)   not null,
    update_block bigint        not null,
    primary key (contract, token_id, owner)
)
    charset = utf8mb3;

create table order_flow
(
    order_id     bigint         not null
        primary key,
    status       tinyint        not null,
    contract     varchar(42)    not null,
    erc          varchar(5)     not null,
    token_id     varchar(40)    not null,
    uri          varchar(1000)  not null,
    seller       varchar(42)    not null,
    sell_token   varchar(42)    not null,
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

create table deal_flowtest
(
    order_id    bigint      not null,
    contract    varchar(42) not null,
    token_id    varchar(40) not null,
    seller      varchar(42) not null,
    buyer       varchar(42) not null,
    sell_token  varchar(42) not null,
    amount      varchar(40) not null,
    cash_amount varchar(40) not null,
    deal_block  bigint      not null,
    tx_index    int         not null,
    log_index   int         not null,
    primary key (tx_index, log_index, deal_block)
)
    charset = utf8mb3;

create table height_flowtest
(
    height bigint not null
)
    charset = utf8mb3;

create table nft_flowtest
(
    contract     varchar(42)   not null,
    erc          varchar(5)    not null,
    token_id     varchar(256)  not null,
    amount       varchar(40)   not null,
    uri          varchar(1000) not null,
    owner        varchar(42)   not null,
    update_block bigint        not null,
    primary key (contract, token_id, owner)
)
    charset = utf8mb3;

create table order_flowtest
(
    order_id     bigint         not null
        primary key,
    status       tinyint        not null,
    contract     varchar(42)    not null,
    erc          varchar(5)     not null,
    token_id     varchar(40)    not null,
    uri          varchar(1000)  not null,
    seller       varchar(42)    not null,
    sell_token   varchar(42)    not null,
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

