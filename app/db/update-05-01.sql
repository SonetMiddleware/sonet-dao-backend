create table if not exists `proposal`
(
    collection_id    varchar(42)    not null,
    id               varchar(66)    not null,
    creator          varchar(42)    not null,
    snapshot_block   bigint         not null,
    title            varchar(64)    not null,
    description      varchar(10240) not null,
    start_time       bigint         not null,
    end_time         bigint         not null,
    ballot_threshold bigint         not null,
    items            varchar(100)   not null,
    voter_type       tinyint        not null,
    primary key (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

create table if not exists `voter`
(
    collection_id varchar(42)  not null,
    id            varchar(66)  not null,
    voter         varchar(42)  not null,
    item          varchar(100) not null,
    votes         varchar(64)  not null,
    primary key (collection_id, id, voter)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;


