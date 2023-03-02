create table accept_referral
(
    addr      varchar(42) not null
        primary key,
    code      varchar(64) not null,
    timestamp bigint      not null
)
    engine = InnoDB;

create table bind_addr
(
    addr                 varchar(42)                   not null,
    platform             varchar(10)                   not null,
    tid                  varchar(100)                  not null,
    content_id           varchar(100)                  null,
    status               tinyint default 1             null,
    bind_time            bigint  default 1646006400000 not null,
    self_referral_code   varchar(64)                   null,
    accept_referral_code varchar(64)                   null,
    accept_referral_time bigint                        null,
    primary key (addr, platform, tid)
)
    engine = InnoDB
    charset = utf8mb3;

create table favorite
(
    chain_name varchar(10) default '' null,
    addr       varchar(42)            not null,
    contract   varchar(42)            not null,
    token_id   bigint                 not null,
    uri        varchar(1000)          not null
)
    engine = InnoDB
    charset = utf8mb3;

create table proposal
(
    collection_id    varchar(42)    not null,
    id               varchar(66)    not null
        primary key,
    creator          varchar(42)    not null,
    snapshot_block   bigint         not null,
    title            varchar(64)    not null,
    description      varchar(10240) not null,
    start_time       bigint         not null,
    end_time         bigint         not null,
    ballot_threshold bigint         not null,
    items            varchar(100)   not null,
    voter_type       tinyint        not null
)
    engine = InnoDB
    charset = utf8mb3;

create table twitter_counts
(
    tid           varchar(100)     not null
        primary key,
    retweet_count bigint default 0 not null,
    reply_count   bigint default 0 not null,
    like_count    bigint default 0 not null,
    quote_count   bigint default 0 not null
)
    engine = InnoDB
    charset = utf8mb3;

create table twitter_counts_snapshot
(
    tid           varchar(100)                        not null,
    snapshot_time timestamp default CURRENT_TIMESTAMP not null,
    retweet_count bigint    default 0                 not null,
    reply_count   bigint    default 0                 not null,
    like_count    bigint    default 0                 not null,
    quote_count   bigint    default 0                 not null,
    primary key (tid, snapshot_time)
)
    engine = InnoDB
    charset = utf8mb3;

create table twitter_nft
(
    chain_name varchar(10)    not null,
    contract   varchar(42)    not null,
    token_id   varchar(20)    not null,
    tid        varchar(20)    not null,
    user_img   varchar(1000)  null,
    user_id    varchar(20)    not null,
    user_name  varchar(50)    not null,
    t_content  varchar(10000) null,
    primary key (chain_name, contract, token_id, tid)
)
    engine = InnoDB
    charset = utf8mb3;

create table voter
(
    collection_id varchar(42)  not null,
    id            varchar(66)  not null,
    voter         varchar(42)  not null,
    item          varchar(100) not null,
    votes         varchar(64)  not null,
    primary key (collection_id, id, voter)
)
    engine = InnoDB
    charset = utf8mb3;

