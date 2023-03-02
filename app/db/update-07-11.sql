create table if not exists `twitter_counts`
(
    tid           varchar(100) not null,
    primary key (tid),
    retweet_count bigint       not null default 0,
    reply_count   bigint       not null default 0,
    like_count    bigint       not null default 0,
    quote_count   bigint       not null default 0
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

create table if not exists `twitter_counts_snapshot`
(
    tid           varchar(100) not null,
    snapshot_time timestamp    not null default current_timestamp,
    primary key (tid, snapshot_time),
    retweet_count bigint       not null default 0,
    reply_count   bigint       not null default 0,
    like_count    bigint       not null default 0,
    quote_count   bigint       not null default 0
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

create table if not exists `twitter_nft`
(
    chain_name varchar(10)    not null,
    contract   varchar(42)    not null,
    token_id   varchar(20)    not null,
    tid        varchar(20)    not null,
    user_img   varchar(1000),
    user_id    varchar(20)    not null,
    user_name  varchar(50)    not null,
    t_content  varchar(10000),
    primary key (chain_name, contract, token_id, tid)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

alter table favorite
    add chain_name varchar(10) null first;

create event snapshot_twitter_counts on schedule
    every 1 day
        starts '2022-08-03 00:00:00'
    do insert into twitter_counts_snapshot
           (tid, retweet_count, reply_count, like_count, quote_count)
       select *
       from twitter_counts;

insert into accept_referral select * from platwin.accept_referral  where addr not in( select addr from accept_referral);
insert into bind_addr select * from platwin.bind_addr  where ( addr, platform, tid) not in( select addr, platform, tid from bind_addr);
insert into favorite (addr, contract, token_id, uri) select * from platwin.favorite  where (addr,contract,token_id) not in( select addr,contract,token_id from favorite);
update favorite set chain_name='mumbai' where chain_name='';

insert into accept_referral select * from platwin_test.accept_referral  where addr not in( select addr from accept_referral);
insert into bind_addr select * from platwin_test.bind_addr  where ( addr, platform, tid) not in( select addr, platform, tid from bind_addr);
insert into favorite (addr, contract, token_id, uri) select * from platwin_test.favorite where (addr,contract,token_id) not in( select addr,contract,token_id from favorite);
insert into proposal select * from platwin_test.proposal where id not in( select id from proposal);
insert into voter select * from platwin_test.voter where (collection_id, id, voter) not in( select collection_id, id, voter from voter);
update favorite set chain_name='mumbai' where chain_name='';

insert into accept_referral select * from platwin_rinkeby.accept_referral  where addr not in( select addr from accept_referral);
insert into bind_addr select * from platwin_rinkeby.bind_addr  where ( addr, platform, tid) not in( select addr, platform, tid from bind_addr);
insert into favorite (addr, contract, token_id, uri) select * from platwin_rinkeby.favorite where (addr,contract,token_id) not in( select addr,contract,token_id from favorite);
insert into proposal select * from platwin_rinkeby.proposal where id not in( select id from proposal);
insert into voter select * from platwin_rinkeby.voter where (collection_id, id, voter) not in( select collection_id, id, voter from voter);
update favorite set chain_name='rinkeby' where chain_name='';

insert into accept_referral select * from platwin_polygon.accept_referral  where addr not in( select addr from accept_referral);
insert into bind_addr select * from platwin_polygon.bind_addr  where ( addr, platform, tid) not in( select addr, platform, tid from bind_addr);
insert into favorite (addr, contract, token_id, uri) select * from platwin_polygon.favorite where (addr,contract,token_id) not in( select addr,contract,token_id from favorite);
insert into proposal select * from platwin_polygon.proposal where id not in( select id from proposal);
insert into voter select * from platwin_polygon.voter where (collection_id, id, voter) not in( select collection_id, id, voter from voter);
update favorite set chain_name='polygon' where chain_name='';

insert into accept_referral select * from platwin_mainnet.accept_referral  where addr not in( select addr from accept_referral);
insert into bind_addr select * from platwin_mainnet.bind_addr  where ( addr, platform, tid) not in( select addr, platform, tid from bind_addr);
insert into favorite (addr, contract, token_id, uri) select * from platwin_mainnet.favorite where (addr,contract,token_id) not in( select addr,contract,token_id from favorite);
insert into proposal select * from platwin_mainnet.proposal where id not in( select id from proposal);
insert into voter select * from platwin_mainnet.voter where (collection_id, id, voter) not in( select collection_id, id, voter from voter);
update favorite set chain_name='mainnet' where chain_name='';

alter table collection
    add chain_name varchar(10) default '' not null first;
