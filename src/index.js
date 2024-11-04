const { ethers } = require("ethers");
const config = require("./config");
const { readCSV, saveToJsonFile } = require("./utils");
const { checkNFTBalanceAndMetaTransactions } = require("./nftChecker");

(async () => {
    try {
        const provider = new ethers.AlchemyProvider(process.env.NETWORK, process.env.ALCHEMY_API_KEY);
        const accounts = await readCSV("./data.csv");
        const results = [];
        const resultsIds = [];
        for (const { address, privateKey } of accounts) {
            console.log(`Проверка адреса: ${address}`);
            const { nfts, ids } = await checkNFTBalanceAndMetaTransactions(provider, address);
            results.push({ address, privateKey, nfts });
            resultsIds.push({ address, privateKey, ids });
        }

        saveToJsonFile(config.network, results);
        saveToJsonFile(`${config.network}_Ids`, resultsIds);
        console.log(`Данные сохранены в ./output/${config.network}.json`);
    } catch (error) {
        console.error("Ошибка выполнения:", error.message);
    }
})();
