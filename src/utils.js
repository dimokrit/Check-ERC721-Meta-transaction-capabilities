const fs = require("fs");
const csv = require("csv-parser");

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

function saveToJsonFile(network, data) {
    const filePath = `./output/${network}.json`;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = { readCSV, saveToJsonFile, sleep };
