create table tg_msg_status
(
    group_id     varchar(32) not null,
    message_id   varchar(32) not null,
    sender       varchar(32) not null,
    nft_contract varchar(64) not null,
    nft_token_id varchar(32) not null,
    `like`       bool        not null default false,
    unlike       bool        not null default false,
    follow       bool        not null default false,
    primary key (group_id, message_id, sender)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

alter table ton_collection_metadata
    add enable_other_mint bool default false not null after creator;

