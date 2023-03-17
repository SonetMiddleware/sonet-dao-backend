alter table ton_collection_metadata
    add creator varchar(64) not null default '';

alter table ton_collection_metadata
    add addr varchar(64) not null default '';

alter table ton_collection_metadata
    add deployed bool default false not null;

