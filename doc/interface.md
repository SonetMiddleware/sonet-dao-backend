# Interface

## Chain Names

The value of the `chain_name` parameter can be one of the following options (currently only supporting the following
chains):

* Polygon
* Mainnet
* Mumbai
* Rinkeby
* Flowtest
* Flowmain
* TONmain
* TONtest

> Note: For the FLOW network, the format of the `contract` parameter should be `${contract_addr}.${contract_name}`. For
> example, `0x8b148183c28ff88f.Gaia`.
>
> Note: FLOW network only supports mainnet and testnet contracts on the
> NFT-catalog. [https://www.flow-nft-catalog.com/catalog/mainnet](https://www.flow-nft-catalog.com/catalog/mainnet)
>
> Note: The CollectionId on the database for a Collection on FLOW must match the ID on the FLOW Catalog, otherwise it
> cannot be queried.

### Authentication

#### Signature Authentication

Most chains can use signature authentication. Refer to each API for specific details.

#### Header Authentication

TON cannot sign offline, so header authentication is used:

* Add the `authorization: "TG Robot"` field to the header

> bind and unbind address required user's signature

## Response Format

The response format is standardized as follows:

```json
{
  "code": "",
  "error": "",
  "data": {}
}
```

### code

`code=1` indicates a successful request, while any other code indicates a failure.

### error

When `code!=1`, related error information will be included.

### data

The results of the request will be included in this field.

## Social Media-Related APIs

Twitter, Facebook, Telegram...

### Bind Social Media Account and User Address

Method: POST

URL: api/v1/bind-addr

Params:

```json
{
  "addr": "",
  "pubkey": "hex encoded public key, required only for TON",
  "tid": "",
  "platform": "",
  "chain_name": "",
  "sig": ""
}
```

> Note: The `sig` is the signature of `platform` and `tid`. Refer to [example.js](./example.js) for signature generation
> method. The `platform` should be one of {Twitter, Facebook, Instagram, Telegram}, and it is case-sensitive.
>
> Note: If `chain_name` is not passed, it will default to `mainnet`.
>
> note: ton sig payload should be platform+tid, text should be 'please sign message'

Return:

```json
{
  "code": "",
  "error": "",
  "data": {}
}
```

> Note: An address can bind no more than ten social media accounts.

### Record Binding Tweet

Method: POST

URL: api/v1/bind-addr/record

Params:

```json
{
  "addr": "",
  "tid": "",
  "platform": "",
  "content_id": ""
}
```

Return:

```json
{
  "code": "",
  "error": "",
  "data": {}
}
```

> Note: Field `addr`, `platform`, and `tid` are required.
>
> Note: If this API is called without a bound address, it will return normally, but there will be no record in the
> database.
>
> Note: Duplicate bindings will not return an error and will update the bound `content_id`.

### Unbind

Method: POST

URL: /api/v1/unbind-addr

Parameters:

```json
{
  "addr": "",
  "pubkey": "hex encoded public key, required only for TON",
  "tid": "",
  "platform": "",
  "chain_name": "",
  "sig": ""
}
```

Return:

```json
{
  "code": "",
  "error": "",
  "data": {}
}
```

> Note: Field `addr`, `platform`, `tid`, `sig` are required.
>
> Note: `sig` is the signature of `platform`+`tid`, the method for generating the signature can be found
> in [example.js](./example.js).
>
> Note: If `chain_name` is not passed, it defaults to mainnet.
>
> note: ton sig payload should be platform+tid, text should be 'please sign message'

### Query Binding Relationship

Method: GET

URL: /api/v1/bind-attr?addr=xxx&tid=xxx

> Note: Both `addr` and `tid` are optional, but at least one is required.

Return:

```json
{
  "code": "",
  "error": "",
  "data": [
    {
      "addr": "",
      "tid": "",
      "platform": ""
    }
  ]
}
```

### Query Twitter Data Related to NFT

Method: GET

URL: /api/v1/twitter-nft/counts?nft=chain_name,contract,token_id

> Note: `nft` is a comma-separated string that contains the three values, and the three fields are required.

Return:

```json
{
  "code": "",
  "error": "",
  "data": {
    "retweet_count": 7,
    "reply_count": 3,
    "like_count": 38,
    "quote_count": 1
  }
}
```

### Query Daily Snapshot of Twitter Data Related to NFT

This API is used to draw a curve chart on the front end. It returns data from the specified date.

Method: GET

URL: /api/v1/twitter-nft/snapshots?nft=chain_name,contract,token_id&start=xxx&count=xxx

> Note: `nft` is a comma-separated string that contains the three values, and the three fields are required.
>
> Note: `nft` and `start` are required, `count` is optional and has a maximum value of 100 and a default value of 50.
>
> Note: `start` is in date format, do not pass a timestamp.
>
> Note: The last item returned is the latest data, with the time being the current time, not to the exact hour.

Return:

```json
{
  "code": "",
  "error": "",
  "data": {
    "start": "2022-07-15 16:51:00",
    "data": [
      {
        "snapshot_time": "2022-07-15T10:40:27.000Z",
        "retweet_count": 7,
        "reply_count": 3,
        "like_count": 38,
        "quote_count": 1
      }
    ]
  }
}
```

### Associate NFT with Tweets

Method: POST

url: api/v1/twitter-nft/add

> note: An NFT can be associated with multiple tweets, and a tweet can be associated with multiple NFTs
>
> note: Does not check if the NFT is one that we support

params:

```json
{
  "chain_name": "",
  "contract": "",
  "token_id": "",
  "tid": "",
  "user_img": "",
  "user_id": "",
  "user_name": "",
  "t_content": ""
}
```

return:

```json
{
  "code": "",
  "error": "",
  "data": ""
}
```

### Query associated NFTs and tweets

Method: GET

URL: api/v1/twitter-nft?tid=xxx&nft=chain_name,contract,token_id&page=xxx&gap=xxx

> note: There are two parameters, `tid` and `nft`, at least one of which must be passed. If passed at the same time, it
> returns the tweets associated with nft
>
> note: The nft parameter is a comma-separated string, with all three values required. If the parameter is passed but
> the format is incorrect, an error will be returned.

return:

```json
{
  "code": "",
  "error": "",
  "data": [
    {
      "chain_name": "",
      "contract": "",
      "token_id": "",
      "tid": "",
      "user_img": "",
      "user_id": "",
      "user_name": "",
      "t_content": ""
    }
  ]
}
```

### Record TG Message Data

method: POST

URL: /api/v1/tg/message

Parameters:

```json
{
  "group_id": "",
  "message_id": "",
  "type": "",
  "data": ""
}
```

Returns:

```json
{
  "code": "",
  "error": "",
  "data": null
}
```

### Like&Unlike&Follow Telegram Message

method: POST

URL: /api/v1/tg/message/act

Parameters:

```json
{
  "action": "like | unlike | follow",
  "undo": false,
  "group_id": "",
  "message_id": "",
  "sender": "",
  "nft_contract": "",
  "nft_token_id": ""
}
```

> if `undo`, revert users' action
>
> `like` and `unlike` is mutually exclusive

Returns:

```json
{
  "code": "",
  "error": "",
  "data": true
}
```

### Query Telegram Group Message Status

method: get

URL: /api/v1/tg/message/:group_id?order_by=xxx&origin_msg=1&page=xxx&gap=xxx

> order by `like | unlike | follow`, if not defined, order by `like`
>
> if origin_msg owned any value(for example, origin_msg=true/false/0/1), return msg type and data

returns:

```json
{
  "code": "",
  "error": "",
  "data": {
    "total": 1000,
    "data": [
      {
        "message_id": "",
        "type": "",
        "data": "",
        "nft_contract": "",
        "nft_token_id": "",
        "like": 10,
        "unlike": 19,
        "follow": 1
      }
    ]
  }
}
```

### Query Telegram Message Status

method: get

URL: /api/v1/tg/message/:group_id/:message_id?origin_msg=true

> if origin_msg owned any value(for example, origin_msg=true/false/0/1), return msg type and data

returns:

```json
{
  "code": "",
  "error": "",
  "data": [
    {
      "type": "",
      "data": "",
      "nft_contract": "",
      "nft_token_id": "",
      "like": 10,
      "unlike": 19,
      "follow": 1
    }
  ]
}
```

### Query Telegram Raw Message

method: get

URL: /api/v1/tg/raw-message?group_id=xxx&message_id=xxx&type=xxx&data=xxx&page=xxx&gap=xxx

> if `message_id` is not defined, return all raw message of `group_id`
>
> message_id,type,data is optional

returns:

```json
{
  "code": "",
  "error": "",
  "data": {
    "total": 1000,
    "data": [
      {
        "group_id": "",
        "message_id": "",
        "type": "",
        "data": ""
      }
    ]
  }
}
```

### Record Launchpad Info

method: POST

URL: /api/v1/ton/launchpad/create

Parameters:

```json
{
  "group_id": "tg group id",
  "is_mainnet": false,
  "address": "deployed launchpad address",
  "start_time": 1681973200,
  "duration": 86400,
  "ex_rate": 2000000,
  "source_jetton": "Jetton Address or empty",
  "sold_jetton": "Sold Jetton Address",
  "cap": 1000000000,
  "owner": "launchpad owner address"
}
```

returns:

```json
{
  "code": "",
  "error": "",
  "data": null
}
```

### Query Launchpad Info List

method: GET

URL: /api/v1/ton/launchpad/list?group_id=xxx&is_mainnet=xxx&order_mode=xxx&page=xxx&gap=xxx

> group_id and is_mainnet are required, `is_mainnet` is defined as TRUE as long as it has a value
>
> order_mode must be 1 or 2, default mode is 1
>
> order mode 1: order by start_time desc
>
> order mode 2: order by start_time desc, start_time+duration<now() desc, early start time first, not ended first

Parameters:

```json
{
  "code": "",
  "error": "",
  "data": {
    "total": 1000,
    "data": [
      {
        "address": "deployed launchpad address",
        "start_time": 1681973200,
        "duration": 86400,
        "ex_rate": 2000000,
        "source_jetton": "Jetton Address or empty",
        "sold_jetton": "Sold Jetton Address",
        "cap": 1000000000,
        "owner": "launchpad owner address",
        "ended": 1
      }
    ]
  }
}
```

### Query TG Campaign Info List

method: GET

URL: /api/v1/ton/campaigns?collection_id=xxx&is_mainnet=xxx&page=xxx&gap=xxx

> collection_id is required, `is_mainnet` is defined as TRUE as long as it has a value

Parameters:

```json
{
  "code": "",
  "error": "",
  "data": {
    "total": 1000,
    "data": [
      {
        "campaign_id": "campaign id",
        "title": "campaign title",
        "description": "campaign description",
        "image_url": "url of campaign image",
        "rewards": "rewards text",
        "rewards_url": "rewards url, maybe empty",
        "start_time": 1111111,
        "end_time": 2222222
      }
    ]
  }
}
```

### Query TG Group Task List

method: GET

URL: /api/v1/ton/campaign/tasks?campaign_id=xxx&address=xxx&page=xxx&gap=xxx

> campaign_id is required, address is optional

Parameters:

```json
{
  "code": "",
  "error": "",
  "data": {
    "total": 1000,
    "data": [
      {
        "task_id": 123,
        "task": "task text",
        "task_type": 1,
        "target": "target tg or collection_id",
        "score": 100,
        "completed_by_addr": false
      }
    ]
  }
}
```

> task_type 1: open tg group, 2: open dao page, 3: join tg group, or other defined type

### Query User Completed Tasks

method: GET

URL: /api/v1/ton/campaign/completed-tasks?campaign_id=xxx&address=xxx&page=xxx&gap=xxx

> campaign_id and address are required

Parameters:

```json
{
  "code": "",
  "error": "",
  "data": [
    123,
    124,
    126
  ]
}
```

> return completed task ids by user

### Record User Completed Task

method: POST

URL: /api/v1/ton/campaign/complete-task

> require TG Robot Auth Header

Parameters:

```json
{
  "address": "user address",
  "campaign_id": "xxxxx",
  "task_id": 123
}
```

returns:

```json
{
  "code": "",
  "error": "",
  "data": {}
}
```

## TG Queue Interface

> note: these interface requires `TG ROBOT` head verification

### Queue Info

Method: POST

URL: /api/v1/queue

Parameters:

```json
{
  "gid": "",
  "uid": "",
  "info": ""
}
```

Returns:

```json
{
  "code": "",
  "error": "",
  "data": {}
}
```

### Dequeue Info

Remove info.

Method: POST

URL: /api/v1/dequeue

Parameters:

```json
{
  "gid": "",
  "uid": "",
  "count": 10
}
```

Returns:

```json
{
  "code": "",
  "error": "",
  "data": [
    "",
    ""
  ]
}
```

> return 100 data at most, require param.count <= 100 and param.count > 0

> result is ordered by create time

### Query Info

Method: GET

URL: /api/v1/queue?gid=xxx&uid=xxx&page=xxx&gap=xxx

Returns:

```json
{
  "code": "",
  "error": "",
  "data": {
    "total": 1000,
    "data": [
    ]
  }
}
```

### Count

URL: /api/v1/queue/count?gid=xxx&uid=xxx

Returns:

```json
{
  "code": "",
  "error": "",
  "data": 10000
}
```

## Invitation code

### Generate invitation code

Method: POST

URL: /api/v1/referral/gen

Parameters:

```json
{
  "addr": "",
  "platform": "",
  "tid": ""
}
```

Returns:

```json
{
  "code": "",
  "error": "",
  "data": ""
}
```

Note: The address and platform must be bound before an invitation code can be generated.

### Accept invitation

Method: POST

URL: /api/v1/referral/accept

Parameters:

```json
{
  "addr": "",
  "chain_name": "",
  "referral": "",
  "sig": ""
}
```

Returns:

```json
{
  "code": "",
  "error": "",
  "data": {}
}
```

Note: `sig` is the signature of `referral`.

Note: If `chain_name` is not passed, it defaults to Ethereum mainnet.

### Get personal invitation code

Method: GET

URL: api/v1/referral?addr=xxx&platform=xxx&tid=xxx

Returns:

```json
{
  "code": "",
  "error": "",
  "data": "xxxxxx"
}
```

### Get invitation code by address

Method: GET

URL: /api/v1/referral/code?addr=xxx

Returns:

```json
{
  "code": "",
  "error": "",
  "data": ""
}
```

### Get invitation accept count

Method: GET

URL: /api/v1/referral/count?code=xxx

Returns:

```json
{
  "code": "",
  "error": "",
  "data": 10
}
```

## NFT series

### Retrieve NFT information based on Hash

Each NFT has a unique identification that can be used to retrieve its information.

Method: GET

URL: api/v1/nft/:nft_id

Return:

```json
{
  "code": "",
  "error": "",
  "data": {
    "chain_name": "",
    "contract": "",
    "token_id": "",
    "uri": ""
  }
}
```

> Note: The calculation of nft_id is as follows:

```js
const {sha256} = require('js-sha256');
let nft_id = sha256(chain_name + contract + token_id); // Please note that it is string concatenation, e.g.: sha.sha256("polygon"+'0xB01767bf57145D4762bd011366A877c8eB91c835'+'1')='bf92906fbebff13adda636d6a126d71746852d69ad4816f357b49f6476146811'
```

### Register a unique identifier for NFT

Add an identification for NFT in the system.

Method: POST

URL: api/v1/nft/register

Parameters:

```json
{
  "chain_name": "",
  "contract": "",
  "token_id": ""
}
```

Return:

```json
{
  "code": "",
  "error": "",
  "data": "b47bd1225b53cef83f96813e1627ae45dbcece67fc15ffed70176ceb2f48eea3"
}
```

> Note: Return a unique identification. If it returns empty, it means the NFT does not exist in the backend system (
> possibly because the backend has not been synchronized, or the NFT does not belong to this owner).

### Add NFT to the favorites list

Method: POST

URL: api/v1/favorite-nft

Parameters:

```json
{
  "chain_name": "",
  "addr": "",
  "contract": "",
  "token_id": "",
  "uri": "",
  "fav": 0
}
```

> Note: "fav" equals 0 means to cancel the collection, while 1 means to collect it. "chain_name", "contract", and "
> token_id" must be passed in.

Return:

```json
{
  "code": "",
  "error": "",
  "data": {}
}
```

### Get NFT favorites list

Method: GET

URL: api/v1/favorite?chain_name=xxx&addr=xxx&contract=xxx&page=xxx&gap=xxx

Return:

```
{
  "code": "",
  "error": "",
  "data": {
    "total": 10000, // Total number of records in the database, for pagination purpose
    "data": [
      {
        "chain_name": "",
        "addr": "",
        "contract": "",
        "token_id": "",
        "uri": "" // Uniform Resource Identifier, IPFS index or other server resource
      }
    ]
  }
}
```

### Get NFT HODL list

Method: GET

URL: api/v1/nfts?chain_name=xxx&addr=xxx&contract=xxx&token_id=xxx&page=xxx&gap=xxx

> Note: chain_name is required, addr and contract are required, token_id is optional. Note: If it is the FLOW network,
> addr must be passed, contract can be omitted, and no results will be returned if contract is not passed.

Return:

```
{
  "code": "",
  "error": "",
  "data": {
      "total": 10000, // Total number of records in the database, for pagination purpose
      "data": [
        {
          "contract": "", // Contract address
          "erc": "", // Protocol standard, 1155 or 721
          "token_id": "", // 
          "amount": "", // Quantity, 1155 NFTs with the same ID have more than one, while 721 only has one
          "uri": "", // Uniform Resource Identifier, IPFS index or other server resource
          "owner": "", // Owner, equal to the addr parameter passed
          "update_block": "" // The block number where the NFT status was updated
        }
      ]
  }
}
```

### Query orders

Method: GET

URL:api/v1/orders?chain_name=xxx&order_id=xxx&status=xxx&contract=xxx&seller=xxx&buyer=xxx&token_id=xxx&page=xxx&gap=xxx

> Note: chain_name is required. If none of the other parameters are passed, the latest unfulfilled orders will be
> returned by default.

Return:

```
{
  "code": "",
  "error": "",
  "data": {
      "total": 10000, // Total number of records in the database, for pagination purpose
      "data": [
        {
          "order_id": "", // Order ID
          "status": "", // Order status
          "contract": "", // NFT contract address
          "erc": "", // 721 or 1155
          "token_id": "", // 
          "uri": "",
          "seller": "", // Order placing user's address
          "sell_token": "", // ERC20 token address that the seller wants to receive for selling the NFT, if 0, it represents ETH
          "init_amount": "", // Initial selling quantity
          "min_price": "", // Minimum selling price
          "max_price": "", // Maximum selling price
          "start_block": "", // Block where the order price starts to decline
          "duration": "", // Duration of the order price decline
          "amount": "", // Remaining unsold NFT quantity
          "final_price": "", // The price at the last transaction when the order is completely executed, 0 if not completely executed
          "buyers": "", // All buyers
          "update_block": "" // The block number where the order status was updated
        }
      ]
  }
}
```

> Note: Order status are:
> 0 - newly created
> 1 - partially filled
> 2 - completely filled
> 3 - partially filled and then cancelled
> 4 - cancelled before being filled

### Get NFT transaction records

Method: GET

URL: /api/v1/records?chain_name=xxx&contract=xxx&token_id=xxx&page=xxx&gap=xxx

> Note: chain_name and contract parameters are required.

Response:

```
{
  "code": "",
  "error": "",
  "data": {
      "total": 10000, // Total number of records in the database, for pagination
      "data": [
        {
          "order_id": "", // Order ID
          "contract": "", // NFT contract address
          "token_id": "", // Token ID
          "seller": "",
          "buyer": "",
          "sell_token": "", // ERC20 token address received from selling NFT, if 0 then it represents ETH
          "amount": "", // Transaction volume
          "cash_amount": "", // Transaction amount
          "deal_block": "", // Block number of the transaction
          "tx_index":"", // Transaction sequence within the block
          "log_index":"" // Position of the transaction event in the same transaction (not currently used in frontend)
        }
      ]
  }
}
```

### Get ERC-1155 URI resources

Method: GET

URL: /assets/erc-1155/:contracts/:token_id

For example: http://localhost:7001/assets/erc-1155/0x7c19f2eb9e4524D5Ef5114Eb646583bB0Bb6C8F8/0.json

> Note: token_id parameter must include the string ".json"

Response:

```json
{
  "name": "Sonet Airdrop NFT - 0",
  "description": "This NFT is used to support Sonet Airdrop at testnet(mumbai)",
  "decimals": "0",
  "image": ""
}
```

> Note: Since a JSON file is being queried, the response is returned directly as a JSON file without being wrapped in a
> common response format. Note: The image URL is returned in the "image" attribute of the response.

### Gen NFT Collection Deployment Transaction for TON

Method: POST

URL: /api/v1/nft/collection/gen

params:

```json
{
  "chain_name": "TONtest",
  "enable_other_mint": true,
  "owner": "ownerAddr",
  "royalty": 0.1,
  "royalty_address": "royaltyAddress",
  "metadata": {
    "name": "collection name",
    "image": "image url",
    "cover_image": "cover image url",
    "description": "collection description",
    "social_links": [
      "",
      "",
      "",
      "no more than 10 links"
    ]
  }
}
```

> note: metadata.name should be same as dao collection name, and should be unique

returns:

```json
{
  "code": "",
  "error": "",
  "data": {
    "value": "0.1",
    "to": "collectionAddress",
    "state_init": ""
  }
}
```

> note: `to` is collection address, stateInit is base64 serialized stateInit

### Gen NFT Item Mint Transaction for TON

Method: POST

URL: /api/v1/nft/item/gen

params:

```json
 {
  "chain_name": "TONtest",
  "owner": "ownerAddr",
  "collection": {
    "name": "collection name",
    "addr": "collection address"
  },
  "metadata": {
    "name": "collection name",
    "image": "image url",
    "description": "collection description",
    "content_type": "",
    "content_url": "",
    "attributes": [
      {
        "trait_type": "Material",
        "value": "Wool fabric"
      },
      {
        "trait_type": "Hat",
        "value": "Top hat"
      }
    ]
  }
}

```

> note: collection.name should be same as collection name
>
> note: should be invoked after collection contract deployed

returns:

```json
{
  "code": "",
  "error": "",
  "data": {
    "value": "0.1",
    "token_id": 10,
    "payload": ""
  }
}
```

> note: `payload` is base64 serialized message payload

### TON NFT Collection URI

return the metadata for [getgems specified](https://github.com/getgems-io/nft-contracts/blob/main/docs/metadata.md)

Method: GET

collection URI: /assets/ton-collection/:chain_name/:collection_name

item URI: /assets/ton-collection/:chain_name/:collection_name/:token_id

### Get TON NFT Collection Created by User

Method: GET

URL: /api/v1/collection/created-by?chain_name=xxx&creator=xxx&name=xxx&page=xxx&gap=xxx

Response:

```json
{
  "code": "",
  "error": "",
  "data": {
    "total": 1,
    "data": [
      {
        "name": "So Cat Test",
        "addr": "EQCkeUfuGycIp6EJN3LdqhdlOd7aNdLEqxk5LnQYij1Q6PpT",
        "image": "image url",
        "cover_image": "cover image url",
        "enable_other_mint": false,
        "deployed": false
      }
    ]
  }
}
```

## DAO series

### Get user collection list

NFTs owned by the user are displayed based on their collections. This endpoint returns information about all collections
owned by the user.

Method: GET

URL: /api/v1/collection-list?chain_name=xxx&collection_name=xxx&addr=xxx&page=xxx&gap=xxx

> Note: addr and chain_name parameters are required.

Response:

```json
{
  "code": "",
  "error": "",
  "data": {
    "total": 10000,
    "data": [
      {
        "chain_name": [
          "mainnet"
        ],
        "id": "aaaa",
        "name": "collection 1",
        "img": "",
        "dao": {
          "name": "",
          "start_date": "timestamp",
          "total_member": "2/200",
          "facebook": "",
          "twitter": ""
        }
      },
      {
        "chain_name": [
          "mainnet",
          "polygon"
        ],
        "id": "aaaa",
        "name": "collection 2",
        "img": "",
        "dao": {
          "name": "",
          "start_date": "timestamp",
          "total_member": "2/200",
          "facebook": "",
          "twitter": ""
        }
      }
    ]
  }
}
```

### Query NFTs in a Collection

Method: GET

URL: /api/v1/collection/nfts?chain_name=xxx&collection_id=xxx&addr=xxx&page=xxx&gap=xxx

> Note: The `collection_id` parameter is required. The `addr` parameter specifies the user address. If passed, it
> indicates that all NFTs from this collection owned by the user will be returned. If not passed, it indicates that all
> NFTs from this collection will be returned. If the network is Flow, the `addr` parameter must be passed.

Returns:

```
{
  "code": "",
  "error": "",
  "data": {
      "collection_id": "", // Collection ID
      "collection_name": "", // Collection name
      "collection_img": "", // Collection image
      "total": 10000, // Total number of records in the database, used for pagination
      "data": [
        {
          "contract": "", // Contract address
          "erc": "", // Protocol standard, 1155 or 721
          "token_id": "", // 
          "amount": "", // Quantity, 1155 NFTs with the same ID have more than one quantity, while 721 NFTs only have one quantity
          "uri": "", // Resource locator, IPFS index or other server resources
          "owner": "", // Owner, equals to the `addr` parameter passed
          "update_block": "" // The block number where the NFT status was updated
        }
      ]
  }
}
```

### Query Collection by NFT Contract

Method: GET

URL: /api/v1/collection?contract=xxx

Returns:

```json
{
  "code": "",
  "error": "",
  "data": {
    "id": "aaaa",
    "name": "collection 1",
    "img": "",
    "dao": {
      "name": "",
      "start_date": "timestamp",
      "total_member": "2/200",
      "facebook": "",
      "twitter": ""
    }
  }
}
```

### Query Collection Detail

Method: GET

URL: /api/v1/collection/:collection_id

Returns:

```json
{
  "code": "",
  "error": "",
  "data": {
    "id": "aaaa",
    "name": "collection 1",
    "img": "",
    "dao": {
      "chain_name": "",
      "name": "",
      "start_date": "timestamp",
      "total_member": "2/200",
      "facebook": "",
      "twitter": ""
    },
    "contract": "contract address",
    "enable_other_mint": "bool value, anyone could mint nft item, only active at TON"
  }
}
```

> Note: `collection_id` is the contract address. If the DAO does not exist, it will be null.

### Get List of DAOs

To retrieve a list of DAOs, use the following method:

Method: GET

URL: /api/v1/dao?chain_name=xxx&addr=xxx&name=xxx&page=xxx&gap=xxx

> The "chain_name" parameter is required.
>
> If the "addr" parameter is not passed, it returns all DAOs on that chain.
>
> The "name" parameter is used to search for DAOs by name. If not passed, it will not filter by name.

Response:

```json
{
  "code": "",
  "error": "",
  "data": {
    "total": 10000,
    "data": [
      {
        "chain_name": [
          "mainnet"
        ],
        "id": "bbbbb",
        "name": "",
        "img": "",
        "start_date": "timestamp",
        "total_member": "2/200",
        "facebook": "",
        "twitter": "",
        "centralized": 0,
        "types": [
          "Investment"
        ],
        "tags": [
          "Decentralized Venture Fund",
          "AAA"
        ],
        "status": "open",
        "proposal_num": 2
      },
      {
        "chain_name": [
          "mainnet",
          "polygon"
        ],
        "id": "ccccc",
        "name": "",
        "img": "",
        "start_date": "timestamp",
        "total_member": "2/200",
        "facebook": "",
        "twitter": "",
        "centralized": 1,
        "types": [
          "Investment"
        ],
        "tags": [
          "Decentralized Venture Fund",
          "AAA"
        ],
        "status": "",
        "proposal_num": 1
      }
    ]
  }
}
```

> Note: If the "addr" parameter is passed, no centralized DAOs will be returned. To query centralized DAOs, "addr"should
> not be passed.

### Checking access for proposal creation

To check whether the user has the permission to create a proposal, use the following method:

Method: GET

URL: /api/v1/proposal/permission?chain_name=xxx&dao=xxx&addr=xxx

Response:

```json
{
  "code": "",
  "error": "",
  "data": true
}
```

> Note: Pass the DAO ID and the proposer's address.
>
> Note: If it is a centralized DAO, it will check whether the proposer is on the whitelist. If it is a decentralized
> DAO, it will check whether the proposer holds at least one NFT.

### Get proposal list

Version 1: To retrieve the proposal list for a given DAO ID, use the following method and URL:

Method: GET URL: /api/v1/proposal?dao=xxx&page=xxx&gap=xxx

Response:

```
{
  "code": "",
  "error": "",
  "data": {
    "total": 10000,
    "data": [
      {
            "id": "aaaa",
            "title": "bbbbb",
            "description" : "",
            "start_time": "timestamp",
            "end_time": "timestamp",
            "update_time": 0, // Time of the last vote
            "actived": 1, // Whether the proposal is still open for voting
            "pending": 0, // Whether the proposal has not yet started
            "ballot_threshold": "xxxxx",
            "items": "10%,20%,30%", // Various options for the proposal
            "results": "1,23,33", // Number of votes for each option
            "voter_type": 1 // 1: one address(owned NFT), one vote; 2: one NFT, one vote; 3: one SON, one vote; 5: one TON, one vote; 6: one address, one vote
      }
    ]
  }
}
```

Version 2: To retrieve the proposal list for a given DAO ID, use the following URL:

URL: /api/v2/proposal?dao=xxx&page=xxx&gap=xxx

Response: Items and results in the response are now arrays. Other than that, the response format is the same as
version-1.

Version 3: To retrieve the proposal list for a given DAO ID, use the following method and URL:

Method: GET URL: /api/v3/proposal?dao=xxx&page=xxx&gap=xxx

Response:

```
{
  "code": "",
  "error": "",
  "data": {
    "total": 10000, // Total number of records in the database, for pagination
    "passed":3, // Number of proposals that have passed
    "failed":4, // Number of proposals that have failed
    "actived": 4, // Number of proposals that are currently open for voting
    "pending": 4, // Number of proposals that have not yet started
    "data": [
      {
            "id": "aaaa",
            "title": "bbbbb",
            "description" : "",
            "start_time": "timestamp",
            "end_time": "timestamp",
            "actived": 1, // Whether the proposal is still open for voting
            "pending": 0, // Whether the proposal has not yet started
            "update_time": 0, // Time of the last vote
            "ballot_threshold": "xxxxx",
            "items": ["10%","20%","30%"], // Various options for the proposal
            "results": ["1","23","33"], // Number of votes for each option
            "voter_type": 1 // 1: one address(owned NFT), one vote; 2: one NFT, one vote; 3: one SON, one vote; 5: one TON, one vote; 6: one address, one vote
      }
    ]
  }
}
```

### Get Votes list

Method: GET

URL: /api/v1/votes?proposal_id=xxxx&collection_id=xxx&page=xxx&gap=xxx

returns:

```json
{
  "code": "",
  "error": "",
  "data": {
    "total": 10000,
    "data": [
      {
        "voter": "voter address",
        "item": "proposal item",
        "num": "num of votes",
        "comment": "",
        "vote_time": 1231231231313
      }
    ]
  }
}
```

> comment maybe empty
>
> order by vote time desc

### Get Votes Comments List

Method: GET

URL: /api/v1/votes/comments?proposal_id=xxxx&collection_id=xxx&page=xxx&gap=xxx

returns:

```json
{
  "code": "",
  "error": "",
  "data": {
    "total": 10000,
    "data": [
      {
        "comment": "",
        "vote_time": 1231231231313
      }
    ]
  }
}
```

> order by vote time desc

### Check if a user has voted for a proposal

Method: GET

URL: /api/v1/proposal/votes?collection_id=xxx&proposal_id=xxx&addr=xxxx

Return:

```json
{
  "code": "",
  "error": "",
  "data": {
    "collection_id": "0x917be393EeF337f280eF2000430F16c1340CAcAd",
    "id": "0xbe48e948a48eafbdddcf6b1cd2d546cfbeb1d6325238050f263fc0e1b309332c",
    "voter": "0xBdfc41e26FfcAa992790D321639008f3740Bd951",
    "item": "20%",
    "votes": "98000000000"
  }
}
```

Note: If the user has not voted, the "data" field will be null.

### Create a proposal

Create a proposal

Method: POST

URL: /api/v1/proposal/create

Parameters:

```
{
  "chain_name": "mumbai", // Chain name
  "creator": "", // Creator address
  "snapshot_block": 777777, // Snapshot block of the proposal area
  "collection_id": "",
  "title": "", // Maximum 64 characters
  "description": "0", // Maximum 10240 characters
  "start_time": 123211232113, // Millisecond timestamp
  "end_time": 123211232113, // Millisecond timestamp
  "ballot_threshold": 0,
  "items": ["10%","20%","30%"], // Voting options
  "voter_type": 1,
  "sig": "xxxxxxx"
}
```

> Note: sig = web3.eth.sign(web3.utils.soliditySha3("" + snapshot_block, collection_id, title, description, "" +
>
> start_time, "" + end_time, "" + ballot_threshold, items.join('|'),"" + voter_type), accountAddr)
>
> The signature is calculated by signing the soliditySha3 hash of all creation parameters. Make sure that the parameters
> are in the correct order. When calling the soliditySha3 method, if the parameter is an integer, it needs to be
> converted
> to a string.
>
> If it's a Flow signature, just sign the result of the soliditySha3 directly. For example: let msg = Buffer.from("
> 0x9ce6944ad37aa3650fd401ad5215dbbc4df37195fa15559ec976b86f4810f744").toString('hex'); fcl.currentUser()
> .signUserMessage(
> msg).then(res=>{ console.log(JSON.stringify(res)); })
>
> The result of the sig is like: "\[{"f_type":"CompositeSignature","f_vsn":"1.0.0","addr":"0x5f27f57d592aa038","keyId":
> 1,"signature":"xxxxxxxxxxxxxxxxxxxxxxxxx"}\]"

Return:

```json
{
  "code": "",
  "error": "",
  "data": {
    "id": "0x1213213213"
  }
}
```

### Vote

Vote for a proposal

Method: POST

URL: /api/v1/proposal/vote

Params:

```
{
  "chain_name": "", // chain name
  "voter": "", // voter address
  "collection_id": "",
  "proposal_id": "",
  "item": "approve", // select an item from the items array
  "comment": "xxxxx",
  "sig": "xxxxxxx" // sign web3.utils.soliditySha3(proposal_id + item)
}
```

> Note: The signature is the same as in `createProposal`.

Return:

```json
{
  "code": "",
  "error": "",
  "data": {}
}
```

### Create TG Group DAO

Create a DAO for a Telegram group.

Method: POST

URL: /api/v1/dao/tg/create

Params:

```
{
  "chain_name": "", // Chain name, allows users to choose whether to create on the TON test network or mainnet
  "creator":"", // TON address of the creator
  "contract": "", // NFT contract address
  "collection_name": "",
  "collection_id": "", // Primary key, ensures each DAO is unique, use the group account name
  "collection_image": "",
  "dao_name":"", // Use the group name
  "start_date": 12112121, // Timestamp in milliseconds
  "total_member": 121212, // Number of members in the DAO, pass the current number of group members
  "facebook":"", // DAO's Facebook account, if applicable
  "twitter":"", // DAO's Twitter account, if applicable
}
```

### Check available ballot number

To determine whether a user can vote on a proposal, follow the process below:

* Check if the user has already voted using the `check if a user has voted for a proposal` API.
* Call this API to check the number of votes the user has available:

#### For DAOs based on smartcontracts

Method: GET

URL: /api/v1/proposal/votes/num?chain_name=xxx&&collection_id=xxx&voter=xxx&voter_typer=xxx&snapshot_block=xxx

Returns:

```json
{
  "code": "",
  "error": "",
  "data": 100
}
```

> `voter_typer` can only be 1 (one ballot per address owned NFT) or 2 (one ballot per NFT) or 6 (one ballot per address)
>
> If it is a 1155 NFT, the number of votes will be based on the number of 1155 NFTs owned by that address.
>
> Other vote counting methods are not currently supported by this API.

#### For DAOs stored in Sonet servers

Other chains have one address, one vote. Only for the Flow chain, use this API to retrieve the number of votes available
to the user.

Method: GET

URL: /api/v1/proposal/votes/num?chain_name=xxx&&collection_id=xxx&voter_typer=xxx&proposal_id=xxx&voter=xxx

Returns:

```
{
  "code": "",
  "error": "",
  "data": {
    "votes": 10, // Number of votes
    "tokenIds": [ // NFTs that have not yet been voted on by the user
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10
    ]
  }
}
```

> If it is one address, one vote, the value of `votes` will be 1 (as long as the user has at least one unvoted NFT).
>
> An NFT can only be voted on once. If NFT A has been voted on by user A and then transferred to user B, user B cannot
> vote on NFT A.
>
> For the Flow chain, `snapshot_block` is not required but `proposal_id` must be provided.
>
> Although an address may receive new NFTs after voting, it cannot vote again after receiving new NFTs.

## Web2 statistics

### Querying Statistical Data

Method: GET

URL: /api/v1/statistic

Return:

```json
{
  "code": "",
  "error": "",
  "data": {
    "time": "Milliseconds timestamp, this field can be ignored",
    "total_daos": 10,
    "total_proposals": 100,
    "total_audiences": 9999999
  }
}
```

## IPFS

### Upload Image

Method: POST

URL: /api/v1/nft/upload-img

params: upload img throw form-data

> note: upload at most 9 img at same time

Return:

```json
{
  "code": 0,
  "error": "",
  "data": [
    "ipfs://QmYd8U86TXwwSCL855D5USUqrSRzEDcbMQZqUXwhnMJURw",
    "ipfs://QmUkEQKPDH4tfFN69bHhimAi1RzYFENWSBsmRg6zdmboHy",
    "ipfs://QmZeb1WShrL7YnWBs4yXnR4TG5hB7DUpj2qqhkCkiBJdTj"
  ]
}
```
