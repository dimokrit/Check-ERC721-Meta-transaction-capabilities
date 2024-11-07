require("dotenv").config();
const axios = require("axios");
const { sleep, getFunctionSignature } = require("./utils.js")
const apiKey = process.env.ALCHEMY_API_KEY;

const FUNCTION_SIGNATURES = {
    "ERC-2771": "isTrustedForwarder(address)",
    "ERC-2612": "permit(address,address,uint256,uint256,uint8,bytes32,bytes32)",
    "ERC-3009": "transferWithAuthorization(address,address,uint256,uint256,uint8,bytes32,bytes32,bytes32)",
    "ERC-3009_new": "transferWithAuthorization(address,address,uint256,uint256,uint256,bytes32,uint8,bytes32,bytes32)"
};


async function getNFTContractsForAddress(address, network) {
    try {
        const url = `https://${network}.g.alchemy.com/nft/v3/${apiKey}/getNFTsForOwner/?owner=${address}`;
        await sleep(1000)
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

async function checkNFTBalanceAndMetaTransactions(provider, address, network) {

    try {
        const { nfts, ids } = await getNFTContractsForAddress(address, network);

        for (const contractAddress of Object.keys(nfts)) {
            if (nfts[contractAddress].balance > 0) {
                const supportedStandards = [];
                await sleep(750)
                const contractCode = await provider.getCode(contractAddress);
                for (const [standard, signature] of Object.entries(FUNCTION_SIGNATURES)) {
                    const signatureHash = getFunctionSignature(signature)
                    if (contractCode.includes(signatureHash)) {
                        supportedStandards.push(standard);
                    }
                }
                nfts[contractAddress].supportedStandards = supportedStandards
            }
        }
        console.log(nfts)
        return { nfts, ids };
    } catch (error) {
        console.error(`Ошибка при проверке адреса ${address}: ${error.message}`);
    }
}

async function checkNFTBalanceAndMetaTransactionsTRON(address) {
    try {
        const response = await axios.get(`https://api.trongrid.io/v1/accounts/${address}/transactions/trc20`, {
            headers: {
                'TRON-PRO-API-KEY': process.env.TRON_GRID_API_KEY,
                'Content-Type': 'application/json'
            },
            body: {
                address: address,
                only_confirmed: true,
                limit: 200,
                only_to: true
            }
        });
        const transactions = response.data.data
        const nfts = {}
        const nftTransactions = transactions.filter(tx => tx.type === 'Transfer' && tx.token_info.decimals == 0);
        for (const tx of nftTransactions) {
            const contractAddress = tx.token_info.address;
            if (!nfts[contractAddress])
                nfts[contractAddress] = { balance: 0 };
            nfts[contractAddress].balance++
        }
        console.log(nfts)
        return nfts;
    } catch (error) {
        console.error(`Ошибка при получении NFT для адреса ${address}: ${error.message}`);
        return [];
    }
}

module.exports = { checkNFTBalanceAndMetaTransactions, checkNFTBalanceAndMetaTransactionsTRON };
