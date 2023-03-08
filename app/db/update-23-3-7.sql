create table ton_collection_metadata
(
    is_mainnet   bool          not null default false,
    name         varchar(64)   not null default '',
    description  varchar(1024) not null default '',
    image        varchar(256)  not null default '',
    cover_image  varchar(256)  not null default '',
    social_links varchar(1024) not null default '',
    PRIMARY KEY (is_mainnet, name)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

create table ton_collection_item_metadata
(
    is_mainnet      bool          not null default false,
    collection_name varchar(64)   not null default '',
    token_id        varchar(64)   not null default '',
    name            varchar(64)   not null default '',
    image           varchar(256)  not null default '',
    description     varchar(1024) not null default '',
    attrs           varchar(1024) not null default '',
    PRIMARY KEY (is_mainnet, collection_name, token_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
