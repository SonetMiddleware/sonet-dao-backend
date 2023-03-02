create table if not exists `nft_reg`
(
    nft_id     varchar(64)   not null,
    chain_name varchar(10)   not null,
    contract   varchar(100)  not null,
    toke_id    varchar(66)   not null,
    uri        varchar(1024) not null default '',
    primary key (nft_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;