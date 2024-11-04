require("dotenv").config();

module.exports = {
    infuraProjectId: process.env.INFURA_PROJECT_ID,
    network: process.env.NETWORK || "mainnet",
};
