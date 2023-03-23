alter table ton_collection_metadata
    add creator varchar(64) not null default '';

alter table ton_collection_metadata
    add addr varchar(64) not null default '';

alter table ton_collection_metadata
    add deployed bool default false not null;

alter table accept_referral
    modify addr varchar(64) not null;
alter table bind_addr
    modify addr varchar(64) not null;

alter table favorite
    modify addr varchar(64) not null;
alter table favorite
    modify contract varchar(64) not null;
alter table nft_reg
    modify contract varchar(64) not null;

alter table proposal
    modify creator varchar(64) not null;

alter table proposer_white_list
    modify proposer varchar(64) not null;
alter table voter
    modify voter varchar(64) not null;
