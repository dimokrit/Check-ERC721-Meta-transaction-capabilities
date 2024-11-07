const fs = require("fs");
const csv = require("csv-parser");
const ethers = require("ethers");

async function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv({ headers: ["address", "privateKey"] }))
            .on("data", (data) => results.push(data))
            .on("end", () => resolve(results))
            .on("error", (error) => reject(error));
    });
}

function saveToJsonFile(network, name, data) {
    const filePath = `./output/${network}/${name}.json`;
    fs.mkdirSync(`./output/${network}`, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function getFunctionSignature(signature) {
    const hash = ethers.keccak256(ethers.toUtf8Bytes(signature));
    return hash.slice(2, 10);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = { readCSV, saveToJsonFile, getFunctionSignature, sleep };
