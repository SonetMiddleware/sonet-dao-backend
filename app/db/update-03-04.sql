alter table bind_addr
    add status tinyint default 1 not null;

alter table bind_addr
    add bind_time bigint default 1646006400000 not null;

alter table bind_addr
    add self_referral_code varchar(64) null;

alter table bind_addr
    add accept_referral_code varchar(64) null;

alter table bind_addr
    add accept_referral_time bigint null;

create table accept_referral
(
    addr      varchar(42) not null
        primary key,
    code      varchar(64) not null,
    timestamp bigint      not null
);

alter table `order`
    modify init_amount varchar(40) not null;
