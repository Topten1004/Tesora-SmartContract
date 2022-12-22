// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import './ERC2981PerTokenRoyalties.sol';

contract NFTCollection is ERC721, Ownable, ERC2981PerTokenRoyalties {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    mapping(string => bool) _tokenURIExists;
    mapping(uint => string) _tokenIdToTokenURI;
    string _contractURI;

    constructor(string memory name_, string memory symbol_, string memory contractURI_)
        ERC721(name_, symbol_) {
        _contractURI = contractURI_;
    }

    event BuyNFT(uint256 tokenId, address from, address to, uint256 price);

    function tokenURI(uint256 tokenId) public override view returns (string memory) {
        require(_exists(tokenId), 'ERC721Metadata: URI query for nonexistent token');
        return _tokenIdToTokenURI[tokenId];
    }

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    function mint(address to, string memory tokenURI_, address royaltyRecipient, uint256 royaltyValue) public onlyOwner {
        require(!_tokenURIExists[tokenURI_], 'The token URI should be unique');
        _tokenIdCounter.increment();
        uint256 id = _tokenIdCounter.current();
        _tokenIdToTokenURI[id] = tokenURI_;
        _tokenURIExists[tokenURI_] = true;
        _safeMint(to, id);
        
        if (royaltyValue > 0) {
            _setTokenRoyalty(id, royaltyRecipient, royaltyValue);
        }
    }

    function buyNFT(uint256 tokenId) public payable {
        require(tokenId <= _tokenIdCounter.current(), 'The token not exist');
        address NFT_owner = ownerOf(tokenId);
        safeTransferFrom(NFT_owner, msg.sender, tokenId);
        payable(NFT_owner).transfer(msg.value);
        emit BuyNFT(tokenId, NFT_owner, msg.sender, msg.value);
    }
}