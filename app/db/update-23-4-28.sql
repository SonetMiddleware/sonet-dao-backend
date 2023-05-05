create table ton_campaign
(
    collection_id varchar(64) not null,
    campaign_id   varchar(64) not null,
    is_mainnet    bool        not null,
    title         tinytext    not null,
    description   text        not null,
    image_url     tinytext    not null,
    rewards       varchar(64) not null,
    rewards_url   tinytext    not null,
    create_time   bigint      not null,
    primary key (collection_id, campaign_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

create table ton_campaign_tasks
(
    campaign_id varchar(64) not null,
    task_id     bigint      not null,
    task        varchar(64) not null,
    task_type   int         not null,
    target      varchar(64) not null,
    score       int         not null,
    primary key (campaign_id, task_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

create table ton_user_completed_tasks
(
    address     varchar(64) not null,
    campaign_id varchar(64) not null,
    task_id     bigint      not null,
    primary key (address, campaign_id, task_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
