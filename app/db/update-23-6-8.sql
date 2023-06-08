update collection
set dao_name=''
where dao_name is null;

alter table collection
    drop primary key;

alter table collection
    add constraint collection_pk
        primary key (dao_name, collection_id);



