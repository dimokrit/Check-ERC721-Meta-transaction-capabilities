require("dotenv").config();
const { ethers } = require("ethers");
const axios = require("axios");
const { sleep } = require("./utils.js")
const apiKey = process.env.ALCHEMY_API_KEY;

const ERC721_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
];

// Сигнатуры функций для проверки
const FUNCTION_SIGNATURES = {
    "ERC-2771": "0d95b4a3", // isTrustedForwarder(address)
    "ERC-2612": "d505accf", // permit(address,address,uint256,uint256,uint8,bytes32,bytes32)
    "ERC-3009": "7a9e5e4b", // transferWithAuthorization(address,address,uint256,uint256,uint8,bytes32,bytes32,bytes32)
};


async function getNFTContractsForAddress(address) {
    try {
        const url = `https://eth-mainnet.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner/?owner=${address}`;
        const response = await axios.get(url);

        const nftsData = response.data.ownedNfts;

        const nfts = {};
        const ids = {};

        for (const nft of nftsData) {
            const contractAddress = nft.contract.address;
            const tokenId = nft.tokenId;

            if (!nfts[contractAddress]) {
                nfts[contractAddress] = { balance: 0 };
                ids[contractAddress] = []
            }
            ids[contractAddress].push(tokenId);
            nfts[contractAddress].balance++ 
        }
        return { nfts, ids };
    } catch (error) {
        console.error(`Ошибка при получении NFT для адреса ${address}: ${error.message}`);
        return [];
    }
}

async function checkNFTBalanceAndMetaTransactions(provider, address) {

    try {
        const { nfts, ids } = await getNFTContractsForAddress(address);

        for (const contractAddress of Object.keys(nfts)) {
            if (nfts[contractAddress].balance > 0) {
                const supportedStandards = [];
                const contractCode = await provider.getCode(contractAddress);
                for (const [standard, signature] of Object.entries(FUNCTION_SIGNATURES)) {
                    if (contractCode.includes(signature)) {
                        supportedStandards.push(standard);
                    }
                }
                
                nfts[contractAddress].supportedStandards = supportedStandards
            }
            await sleep(1000)
        }
        console.log(nfts)
        return { nfts, ids };
    } catch (error) {
        console.error(`Ошибка при проверке адреса ${address}: ${error.message}`);
    }
}

module.exports = { checkNFTBalanceAndMetaTransactions };
