create table if not exists `flow_voter_records`
(
    proposal_id varchar(66) not null, # proposal id
    token_id    varchar(42) not null,
    primary key (proposal_id, token_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
