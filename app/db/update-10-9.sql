create table statistics
(
    time            bigint       not null,
    total_daos      varchar(10)  not null,
    total_proposals varchar(100) not null,
    total_audiences varchar(100) not null,
    primary key (time)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
