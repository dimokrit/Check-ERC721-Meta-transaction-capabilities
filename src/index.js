const { ethers } = require("ethers");
const config = require("./config");
const { readCSV, saveToJsonFile, sleep } = require("./utils");
const { checkNFTBalanceAndMetaTransactions, checkNFTBalanceAndMetaTransactionsTRON } = require("./nftChecker");

(async () => {
    try {
        if (config.network == "all")
            for (const network of config.availableNetworks)
                await checkForNetwork(network)
        else
            await checkForNetwork(config.network)
        await sleep(3000)
    } catch (error) {
        console.error("Ошибка выполнения:", error.message);
    }
})();

async function checkForNetwork(network) {
    console.log(`Проверка в сети: ${network}`);
    if (network == "tron") {
        const accounts = await readCSV("./dataTron.csv");
        const results = [];
        for (const { address, privateKey } of accounts) {
            try {
                console.log(`Проверка адреса: ${address}`);
                const nfts = await checkNFTBalanceAndMetaTransactionsTRON(address);
                results.push({ address, privateKey, nfts });
                saveToJsonFile(network, network, results);
            } catch (error) {
                console.log(error)
            }
        }
    } else {
        const provider = new ethers.JsonRpcProvider(`https://${config.alchemyNetwoks[network]}.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);
        const accounts = await readCSV("./data.csv");
        const results = [];
        const resultsIds = [];
        for (const { address, privateKey } of accounts) {
            try {
                console.log(`Проверка адреса: ${address}`);
                const { nfts, ids } = await checkNFTBalanceAndMetaTransactions(provider, address, config.alchemyNetwoks[network]);
                results.push({ address, privateKey, nfts });
                console.log(results)
                resultsIds.push({ address, privateKey, ids });
                saveToJsonFile(network, network, results);
                saveToJsonFile(network, `${network}_Ids`, resultsIds)
            } catch (error) {
                console.log(error)
            }
        }
    }
    console.log(`Данные сохранены в ./output/${network}.json`);
}