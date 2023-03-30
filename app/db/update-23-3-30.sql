alter table ton_collection_item_metadata
    add content_type varchar(16) default '' not null after description;

alter table ton_collection_item_metadata
    add content_url varchar(1024) default '' not null after content_type;

