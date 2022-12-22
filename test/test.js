const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTCollection", function () {
  let contract;
  let user, signer;

  before("NFT Collection Deploy", async function() {
    
    [signer, user] = await ethers.getSigners();

    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    contract = await NFTCollection.deploy("TestNFT", "TNFT", "This is Tesora NFT contract");
    await contract.deployed();

    console.log("NFTCollection deployed:", contract.address);
  });

  it("NFT Collection name is correct", async function () {
    expect(await contract.name()).to.equal("TestNFT");
  });
  
  it("NFT Collection symbol is correct", async function () {
    expect(await contract.symbol()).to.equal("TNFT");
  });

  it("NFT Collection contractURI is correct", async function () {
    expect(await contract.contractURI()).to.equal("This is Tesora NFT contract");
  });

  it("check failed when mint NFT without owner", async function() {
    await expect(contract.connect(user).mint(user.address, "1.jpg", user.address, 100)).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("check tokenURI and token owner are correct after mint NFT", async function () {
    await contract.mint(signer.address, "1.jpg", user.address, 100);
    expect(await contract.tokenURI("1")).to.equal("1.jpg");
    expect(await contract.ownerOf("1")).to.be.equal(signer.address);
  });
  
  it("check tokenURI is unique when mint NFT", async function () {
    await expect(contract.mint(signer.address, "1.jpg", user.address, 100))
    .to.be.revertedWith("The token URI should be unique");
  });

  it("fail buy NFT because not approve NFT before buy", async function () {
    await expect(contract.connect(user).buyNFT("1", { value: ethers.utils.parseEther("1")}))
      .to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
  });
  
  it("fail buy NFT because not exist token", async function () {
    await expect(contract.connect(user).buyNFT("2", { value: ethers.utils.parseEther("1")}))
      .to.be.revertedWith("The token not exist");
  });

  it("success buy NFT", async function () {
    await contract.approve(user.address, "1");
    await expect(contract.connect(user).buyNFT("1", { value: ethers.utils.parseEther("1")}))
      .to.emit(contract, "BuyNFT")
      .withArgs("1", signer.address, user.address, ethers.utils.parseEther("1"));
    expect(await contract.ownerOf("1")).to.be.equal(user.address);
  });
});
