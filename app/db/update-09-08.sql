create table if not exists `proposer_white_list`
(
    collection_id varchar(42) not null,
    proposer      varchar(42) not null,
    primary key (collection_id, proposer)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
