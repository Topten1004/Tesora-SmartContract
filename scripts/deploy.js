// ethereum/scripts/deploy.js

async function main() {
    const NFTCollection = await ethers.getContractFactory("NFTCollection");
    const NFTCollectionDeployed = await NFTCollection.deploy("TestNFT", "TNFT");

    console.log("NFTCollection deployed:", NFTCollectionDeployed.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });