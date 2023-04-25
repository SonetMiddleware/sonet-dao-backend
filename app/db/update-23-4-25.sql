create table ton_launchpad
(
    group_id      varchar(32) not null,
    is_mainnet    bool        not null,
    address       varchar(66) not null,
    start_time    bigint      not null,
    duration      bigint      not null,
    ex_rate       bigint      not null,
    source_jetton varchar(66) not null default '',
    sold_jetton   varchar(66) not null,
    cap           bigint      not null,
    owner         varchar(66) not null,
    primary key (is_mainnet, address)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
