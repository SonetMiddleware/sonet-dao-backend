# Contract Interface

## Contract ABI

[Contract ABI](../contracts)

## Contract Address

[Contract Address](../config/config.default.js)

## RPCRouter

RPCRouter is mainly used to collect transaction fees. Users need to pay transaction fees when minting or trading NFTs. The amount of the minting fee and the transaction fee rate for trading NFTs can be queried from the RPCRouter contract.

## Minting NFTs

The minting process is as follows:

*   Call RPCRouter to check the NFT minting fee;
*   If the NFT minting fee is greater than zero, check if the user has authorized rpc for RPCRouter
*   If not authorized, the user needs to approve
*   After the authorization is completed, start minting NFTs
    *   Upload the image to IPFS and get the URI
    *   Call the contract's minting interface

Refer to the [example](./example.js) for specific process.

### Minting MEME

The URI (links to images or other resources) of MEME is predefined, so users do not need to pass URI as a parameter when minting MEME.

```
function mint(address to) public
```

### Minting MEME2

The URI of MEME2 is customizable, so users need to pass URI as a parameter when minting MEME2.

```
function mint(address to, string memory uri) public
```

## Creating DAO

```
function createDao(IERC721 nft, string memory name, string memory facebook, string memory twitter)
```

## Batch Minting

The caller is required to be in the whitelist set in the contract.

### Minting multiple NFTs to the same address

```
function batchMintToSameAddr(address to, string[] memory uris) public
```

### Minting multiple NFTs to multiple addresses

```
function batchMint(address[] memory tos, string[] memory uris) public
```

