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
