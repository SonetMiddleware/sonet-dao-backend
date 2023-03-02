create table if not exists `bind_addr`
(
    addr       varchar(42)  not null,
    platform   varchar(10)  not null,
    tid        varchar(100) not null,
    content_id varchar(100) not null,
    primary key (addr, platform, tid)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

create table if not exists `favorite`
(
    addr     varchar(42)   not null,
    contract varchar(42)   not null,
    token_id BIGINT        not null,
    uri      varchar(1000) not null,
    primary key (addr, contract, token_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

create table if not exists `referral`
(
    code  varchar(64)      not null,
    count bigint default 0 not null,
    primary key (code)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

create table if not exists `accept_referral`
(
    addr varchar(42) not null,
    code varchar(64) not null,
    primary key (addr)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
