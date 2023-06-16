update collection
set dao_name=''
where dao_name is null;

alter table collection
    drop primary key;

alter table collection
    add constraint collection_pk
        primary key (dao_name, collection_id);


create table queue
(
    queue_id bigint auto_increment not null,
    gid      varchar(32)           not null,
    uid      varchar(32)           not null,
    info     mediumtext            not null,
    primary key (queue_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

alter table collection
    add dao_id varchar(100) default '' not null after collection_img;

update collection
set dao_id=collection_id
where dao_create_block > 0;

alter table collection
    drop primary key;

alter table collection
    add primary key (dao_id, collection_id);

alter table collection
    modify collection_id varchar(100) not null;
alter table collection_map
    modify collection_id varchar(100) not null;
alter table proposal
    modify collection_id varchar(100) not null;

alter table proposer_white_list
    modify collection_id varchar(100) not null;
alter table voter
    modify collection_id varchar(100) not null;

