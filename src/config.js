require("dotenv").config()

const alchemyNetwoks = {
    ethereum: "eth-mainnet",
    polygon: "polygon-mainnet",
    zksync: "zksync-mainnet",
    optimism: "opt-mainnet",
    shape: "shape-mainnet",
    arbitrum: 'arb-mainnet',
    arbitrum_nova: "arbnova-mainnet",
    zetaChain: "zetaChain-mainnet",
    blast: "blast-mainnet",
    linea: "linea-mainnet",
    base: "base-mainnet",
    scroll: "scroll-mainnet",
}
const availableNetworks = [
    "ethereum",
    "polygon",
    "zksync",
    "optimism",
    "shape",
    "arbitrum",
    "arbitrum_nova",
    "zetaChain",
    "blast",
    "linea",
    "base",
    "scroll",
    "tron"
]
module.exports = {
    infuraProjectId: process.env.INFURA_PROJECT_ID,
    network: process.env.NETWORK || "mainnet",
    alchemyNetwoks,
    availableNetworks
};
