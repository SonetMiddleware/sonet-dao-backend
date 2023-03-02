alter table collection
    add types varchar(30) default '' not null;

alter table collection
    add tags varchar(100) default '' not null;
alter table collection
    modify chain_name varchar (50) default 'mumbai' not null;
alter table proposal
    add update_time bigint default 0 not null;