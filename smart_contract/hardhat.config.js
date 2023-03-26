// https://eth-ropsten.alchemyapi.io/v2/7mZySz8gpK4dgIJhkvyHw3nqCoNM7hv6
require('dotenv').config();
// require('@nomiclabs/hardhat-waffle');
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
module.exports = {
  defaultNetwork: "matic",
  networks: {
    matic: {
      url: 'https://rpc-mumbai.maticvigil.com',
      accounts: [ process.env.PRIVATE_KEY ]
    }
  },
  etherscan: {
    apiKey: process.env.API_KEY
  },
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}