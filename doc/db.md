# Marketplace DB

## Twitter & Address

Used to link Twitter accounts with user addresses.

| Key | Type | Description | Note |
| --- | --- | --- | --- |
| addr | varchar | User address | Primary key along with Twitter ID |
| tid | string | User's social media platform ID | Primary key along with addr |
| platform | string | User's social media platform | Primary key along with addr |
| content_id | string | Tweet content ID used when linking |  |

## Twitter Data

Name: twitter_counts

Used to record data about tweets.

| Key | Type | Description | Note |
| --- | --- | --- | --- |
| tid | varchar | Tweet ID | Primary key |
| retweet_count | bigint | Number of retweets |  |
| reply_count | bigint | Number of replies |  |
| like_count | bigint | Number of likes |  |
| quote_count | bigint | Number of quotes |  |

### Twitter Snapshot

Name: twitter_counts_snapshot

Takes a daily snapshot of twitter_counts.

| Key | Type | Description | Note |
| --- | --- | --- | --- |
| tid | varchar | Tweet ID | Primary key |
| snapshot_time | timestamp | Snapshot time | Primary key, default value is the current timestamp |
| retweet_count | bigint | Number of retweets |  |
| reply_count | bigint | Number of replies |  |
| like_count | bigint | Number of likes |  |
| quote_count | bigint | Number of quotes |  |

```mysql
INSERT INTO twitter_counts_snapshot (tid, retweet_count, reply_count, like_count, quote_count)
SELECT *
FROM twitter_counts;
```

Favorite
--------

Records which NFTs a user has favorited.

| Key | Type | Description | Note |
| --- | --- | --- | --- |
| addr | varchar | User address |  |
| contract | varchar | NFT contract address |  |
| token_id | bigint | NFT token ID |  |
| uri | string | Token URI |  |

> (addr, contract, token_id) form a unique constraint.

## Proposal

DAO proposal.

| Key | Type | Description | Note |
| --- | --- | --- | --- |
| collection_id | varchar | Indicates which DAO the proposal belongs to |  |
| id | varchar | Proposal ID, soliditySha3(title+description) | Primary key |
| creator | varchar(42) | Address of the proposal creator |  |
| snapshot_block | bigint | Block number used for snapshot | Snapshot time must be greater than start_time |
| title | varchar(64) | Proposal title | Maximum length of 64 characters |
| description | varchar(10240) | Proposal content | Maximum length of 10,240 characters |
| start_time | timestamp | Proposal start time |  |
| end_time | timestamp | Proposal end time |  |
| ballot_threshold | bigint | Number of votes required for proposal to pass |  |
| items | varchar(100) | Proposal options | String array \["", "", ""\] with a maximum length of 100 characters |
| voter_type | tinyint | Voting type | 1: One vote per address, 2: One vote per NFT, 3: One vote per SON |

> id is the primary key.

## Proposer White List

Centralized DAOs only allow whitelisted users to create proposals.

```
| Key | Type | Description | Note |
| --- | --- | --- | --- |
| collection_id | varchar | Indicates which DAO the whitelist belongs to | Primary key |
| proposer | varchar(42) | Address of the proposal creator | Primary key |

## Voter

Records which users have voted in a proposal.

| Key | Type | Desc | Note |
| --- | --- | --- | --- |
| collection_id | varchar | DAO ID |  |
| proposal_id | varchar | Proposal ID |  |
| voter_addr | varchar(42) | Voter address |  |
| item | varchar | Voted option |  |
| votes | varchar(64) | Number of votes |  |

> (collection_id, proposal_id, voter_addr) is the primary key.

## NFT & Twitter Map

| Key | Type | Desc | Note |
| --- | --- | --- | --- |
| chain_name | varchar | Chain name |  |
| contract | varchar(42) | NFT contract address |  |
| token_id | varchar | NFT token ID |  |
| tid | varchar | Twitter tweet ID |  |
| user_img | varchar | User profile picture |  |
| user_id | varchar | Twitter user ID |  |
| user_name | varchar | Twitter username |  |
| t_content | varchar | Twitter tweet content |  |
