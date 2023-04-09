create table configure
(
    cfg_name  varchar(32) not null,
    cfg_value varchar(32) not null,
    primary key (cfg_name)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

alter table collection
    add hidden bool default false not null;
