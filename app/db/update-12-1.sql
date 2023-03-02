alter table collection
    add outsider bool default false not null;

alter table collection
    modify `types` varchar(300) default '' not null;

