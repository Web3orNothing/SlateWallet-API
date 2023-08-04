const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;
require("dotenv").config();

// Middleware to parse JSON requests
app.use(express.json());

// Helper function to get token balances for a user on a chain
async function getTokenBalancesForUser(accountAddress, chainId) {
  try {
    // const queryURL = `https://account.metafi.codefi.network/accounts/${accountAddress}?chainId=${chainId}&includePrices=true`;
    // const response = await axios.get(queryURL);
    // return response.data;
    return { "accountAddress": "0xc5a05570da594f8edcc9beaa2385c69411c28cbe", "chainId": 1, "object": "account", "updatedAt": "2023-08-03T14:59:44.551Z", "nativeBalance": { "symbol": "ETH", "object": "token", "address": "0x0000000000000000000000000000000000000000", "name": "Ethereum", "chainId": 1, "occurrences": 100, "balance": 2.569267747538962, "accountAddress": "0xc5a05570da594f8edcc9beaa2385c69411c28cbe", "decimals": 18, "iconUrl": "https://token.metaswap.codefi.network/assets/nativeCurrencyLogos/ethereum.svg", "coingeckoId": "ethereum", "type": "native", "indexed": true, "value": { "currency": "usd", "marketValue": 4720.130242391204, "price": 1837.15, "marketCap": 220595866853, "allTimeHigh": 4878.26, "allTimeLow": 0.432979, "totalVolume": 7016767733, "high1d": 1851.19, "low1d": 1827, "circulatingSupply": 120170968.103039, "dilutedMarketCap": 220595866853, "marketCapPercentChange1d": -1.73181, "priceChange1d": -14.036367375380223, "pricePercentChange1h": 0.2418753102026933, "pricePercentChange1d": -0.7582354375220632, "pricePercentChange7d": "-2.12423841311519", "pricePercentChange14d": "-4.183322194557782", "pricePercentChange30d": "-6.177843887590929", "pricePercentChange200d": "19.926280933237862", "pricePercentChange1y": "10.65741323246003" } }, "tokenBalances": [{ "symbol": "WETH", "object": "token", "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "name": "Wrapped Ether", "chainId": 1, "occurrences": 13, "balance": 0.3532034378048887, "accountAddress": "0xc5a05570da594f8edcc9beaa2385c69411c28cbe", "decimals": 18, "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/weth.svg", "coingeckoId": "weth", "indexed": true, "value": { "currency": "usd", "marketValue": 650.5406878521782, "price": 1841.83, "marketCap": 0, "allTimeHigh": 4863.7, "allTimeLow": 3.95e-16, "totalVolume": 1442380352, "high1d": 1844.98, "low1d": 1825.91, "circulatingSupply": 0, "dilutedMarketCap": 6144862833, "marketCapPercentChange1d": 0, "priceChange1d": -0.21211679847851883, "pricePercentChange1h": 0.26160490937491415, "pricePercentChange1d": -0.011515329518332307, "pricePercentChange7d": -1.7273005426374124, "pricePercentChange14d": -4.030935206715614, "pricePercentChange30d": -5.898859984474668, "pricePercentChange200d": 19.93703152379733, "pricePercentChange1y": 10.940477598615137 } }], "value": { "currency": "usd", "marketValue": 5370.670930243382 } }
  } catch (error) {
    console.error('Error fetching token balances:', error);
    throw new Error('Failed to fetch token balances for the given user and chain.');
  }
}

// Helper function to get tokens on a chain
async function getTokensForChain(chainId) {
  try {
    // const queryURL = `https://account.metafi.codefi.network/networks/${chainId}/tokens`;
    // const response = await axios.get(queryURL);
    return [{ "name": "Ethereum", "symbol": "ETH", "decimals": 18, "address": "0x0000000000000000000000000000000000000000", "iconUrl": "https://token.metaswap.codefi.network/assets/nativeCurrencyLogos/ethereum.svg", "occurrences": 100, "sources": [], "chainId": 1, "coingeckoId": "ethereum" }, { "name": "Curve DAO Token", "symbol": "CRV", "decimals": 18, "address": "0xd533a949740bb3306d119cc777fa900ba034cd52", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/crv.svg", "occurrences": 13, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "curve-dao-token" }, { "name": "Balancer (BAL)", "symbol": "BAL", "decimals": 18, "address": "0xba100000625a3754423978a60c9317c58a424e3d", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/balancer.svg", "occurrences": 13, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "balancer" }, { "name": "Uniswap", "symbol": "UNI", "decimals": 18, "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/uni.svg", "occurrences": 13, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "uniswap" }, { "name": "Enjin Coin", "symbol": "ENJ", "decimals": 18, "address": "0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/enj.svg", "occurrences": 13, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "enjincoin" }, { "name": "USD Coin", "symbol": "USDC", "decimals": 6, "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/usdc.svg", "occurrences": 13, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "usd-coin" }, { "name": "Compound", "symbol": "COMP", "decimals": 18, "address": "0xc00e94cb662c3520282e6f5717214004a7f26888", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/comp.svg", "occurrences": 13, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "compound-governance-token" }, { "name": "Chainlink Token", "symbol": "LINK", "decimals": 18, "address": "0x514910771af9ca656af840dff83e8264ecf986ca", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/chainlink.svg", "occurrences": 13, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "chainlink" }, { "name": "Dai Stablecoin", "symbol": "DAI", "decimals": 18, "address": "0x6b175474e89094c44da98b954eedeac495271d0f", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/dai.svg", "occurrences": 13, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "dai" }, { "name": "Maker", "symbol": "MKR", "decimals": 18, "address": "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/mkr.svg", "occurrences": 13, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "maker" }, { "name": "Synthetix Network Token", "symbol": "SNX", "decimals": 18, "address": "0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/synthetix.svg", "occurrences": 13, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "havven" }, { "name": "Wrapped BTC", "symbol": "WBTC", "decimals": 8, "address": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/wbtc.svg", "occurrences": 13, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "wrapped-bitcoin" }, { "name": "yearn.finance", "symbol": "YFI", "decimals": 18, "address": "0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/yfi.svg", "occurrences": 13, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "yearn-finance" }, { "name": "Aave", "symbol": "AAVE", "decimals": 18, "address": "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/AAVE.svg", "occurrences": 13, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "aave" }, { "name": "Loopring", "symbol": "LRC", "decimals": 18, "address": "0xbbbbca6a901c926f240b89eacb641d8aec7aeafd", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/LRC.svg", "occurrences": 12, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "loopring" }, { "name": "Republic Token", "symbol": "REN", "decimals": 18, "address": "0x408e41876cccdc0f92210600ef50372656052a38", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/ren.svg", "occurrences": 12, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "republic-protocol" }, { "name": "Decentraland", "symbol": "MANA", "decimals": 18, "address": "0x0f5d2fb29fb7d3cfee444a200298f468908cc942", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/mana.svg", "occurrences": 12, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "decentraland" }, { "name": "OmiseGO", "symbol": "OMG", "decimals": 18, "address": "0xd26114cd6ee289accf82350c8d8487fedb8a0c07", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/omg.svg", "occurrences": 12, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "omisego" }, { "name": "Tether USD", "symbol": "USDT", "decimals": 6, "address": "0xdac17f958d2ee523a2206206994597c13d831ec7", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/usdt.svg", "occurrences": 12, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs"], "chainId": 1, "coingeckoId": "tether" }, { "name": "Axie Infinity Shard", "symbol": "AXS", "decimals": 18, "address": "0xbb0e17ef65f82ab018d8edd776e8dd940327b28b", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/AXS.svg", "occurrences": 12, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "axie-infinity" }, { "name": "SushiSwap", "symbol": "SUSHI", "decimals": 18, "address": "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/sushi.svg", "occurrences": 12, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "sushi" }, { "name": "Spell Token", "symbol": "SPELL", "decimals": 18, "address": "0x090185f2135308bad17527004364ebcc2d37e5f6", "iconUrl": "https://assets.coingecko.com/coins/images/15861/thumb/abracadabra-3.png?1622544862", "occurrences": 11, "sources": ["bancor", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "spell-token" }, { "name": "FARM Reward Token", "symbol": "FARM", "decimals": 18, "address": "0xa0246c9032bc3a600820415ae600c6388619a14d", "iconUrl": "https://images.prismic.io/token-price-prod/7025845c-661e-455d-9a05-e23060c6ccf7_FARM-xxxhdpi.png", "occurrences": 11, "sources": ["bancor", "cryptocom", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "harvest-finance" }, { "name": "SHIBA INU", "symbol": "SHIB", "decimals": 18, "address": "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/shib.svg", "occurrences": 11, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "pmm", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "shiba-inu" }, { "name": "ApeCoin", "symbol": "APE", "decimals": 18, "address": "0x4d224452801aced8b2f0aebe155379bb5d594381", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/APE.svg", "occurrences": 11, "sources": ["metamask", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "apecoin" }, { "name": "BADGER", "symbol": "BADGER", "decimals": 18, "address": "0x3472a5a71965499acd81997a54bba8d852c6e53d", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/badger.svg", "occurrences": 11, "sources": ["metamask", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "badger-dao" }, { "name": "1INCH Token", "symbol": "1INCH", "decimals": 18, "address": "0x111111111117dc0aa78b770fa6a738034120c302", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/1inch.svg", "occurrences": 11, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "1inch" }, { "name": "Graph Token", "symbol": "GRT", "decimals": 18, "address": "0xc944e90c64b2c07662a292be6244bdf05cda44a7", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/graphToken.svg", "occurrences": 11, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "the-graph" }, { "name": "Matic Network Token", "symbol": "MATIC", "decimals": 18, "address": "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/matic.svg", "occurrences": 11, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "pmm", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "matic-network" }, { "name": "Request", "symbol": "REQ", "decimals": 18, "address": "0x8f8221afbb33998d8584a2b05749ba73c37a938a", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/request.svg", "occurrences": 11, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "pmm", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "request-network" }, { "name": "Wrapped Ether", "symbol": "WETH", "decimals": 18, "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/weth.svg", "occurrences": 11, "sources": ["metamask", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "weth" }, { "name": "Ethereum Name Service", "symbol": "ENS", "decimals": 18, "address": "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/ens.svg", "occurrences": 11, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "ethereum-name-service" }, { "name": "Basic Attention Token", "symbol": "BAT", "decimals": 18, "address": "0x0d8775f648430679a709e98d2b0cb6250d2887ef", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/bat.svg", "occurrences": 11, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "basic-attention-token" }, { "name": "iExec RLC Token", "symbol": "RLC", "decimals": 9, "address": "0x607f4c5bb672230e8672085532f7e901544a7375", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/rlc.svg", "occurrences": 11, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "iexec-rlc" }, { "name": "Bancor Network Token", "symbol": "BNT", "decimals": 18, "address": "0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/bnt.svg", "occurrences": 11, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "bancor" }, { "name": "Enzyme Finance", "symbol": "MLN", "decimals": 18, "address": "0xec67005c4e498ec7f55e092bd1d35cbc47c91892", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/mln.svg", "occurrences": 11, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "melon" }, { "name": "Synth sUSD", "symbol": "SUSD", "decimals": 18, "address": "0x57ab1ec28d129707052df4df418d58a2d46d5f51", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/synthetix_susd.svg", "occurrences": 11, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "nusd" }, { "name": "0x", "symbol": "ZRX", "decimals": 18, "address": "0xe41d2489571d322189246dafa5ebde1f4699f498", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/zrx.svg", "occurrences": 11, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "0x" }, { "name": "UMA", "symbol": "UMA", "decimals": 18, "address": "0x04fa0d235c4abf4bcf4787af4cf447de572ef828", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/uma.svg", "occurrences": 11, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "uma" }, { "name": "Perpetual", "symbol": "PERP", "decimals": 18, "address": "0xbc396689893d065f41bc2c6ecbee5e0085233447", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/PERP.svg", "occurrences": 11, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "perpetual-protocol" }, { "name": "Lido DAO Token", "symbol": "LDO", "decimals": 18, "address": "0x5a98fcbea516cf06857215779fd812ca3bef1b32", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/LDO.svg", "occurrences": 11, "sources": ["metamask", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "lido-dao" }, { "name": "Frax Share", "symbol": "FXS", "decimals": 18, "address": "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/fxs.svg", "occurrences": 11, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "frax-share" }, { "name": "Convex Finance", "symbol": "CVX", "decimals": 18, "address": "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b", "iconUrl": "https://assets.coingecko.com/coins/images/15585/thumb/convex.png?1621256328", "occurrences": 10, "sources": ["coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "convex-finance" }, { "name": "DefiPulse Index", "symbol": "DPI", "decimals": 18, "address": "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b", "iconUrl": "https://assets.coingecko.com/coins/images/12465/large/defi_pulse_index_set.png", "occurrences": 10, "sources": ["cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "defipulse-index" }, { "name": "Alchemix", "symbol": "ALCX", "decimals": 18, "address": "0xdbdb4d16eda451d0503b854cf79d55697f90c8df", "iconUrl": "https://assets.coingecko.com/coins/images/14113/thumb/Alchemix.png?1614409874", "occurrences": 10, "sources": ["bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "alchemix" }, { "name": "TrueFi", "symbol": "TRU", "decimals": 8, "address": "0x4c19596f5aaff459fa38b0f7ed92f11ae6543784", "iconUrl": "https://assets.coingecko.com/coins/images/13180/large/trust-token.png", "occurrences": 10, "sources": ["bancor", "cryptocom", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "truefi" }, { "name": "Ankr Network", "symbol": "ANKR", "decimals": 18, "address": "0x8290333cef9e6d528dd5618fb97a76f268f3edd4", "iconUrl": "https://assets.coingecko.com/coins/images/4324/thumb/U85xTl2.png?1608111978", "occurrences": 10, "sources": ["bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "ankr" }, { "name": "Rari Governance Token", "symbol": "RGT", "decimals": 18, "address": "0xd291e7a03283640fdc51b121ac401383a46cc623", "iconUrl": "https://assets.coingecko.com/coins/images/12900/thumb/Rari_Logo_Transparent.png?1613978014", "occurrences": 10, "sources": ["bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "rari-governance-token" }, { "name": "BarnBridge Governance Token", "symbol": "BOND", "decimals": 18, "address": "0x0391d2021f89dc339f60fff84546ea23e337750f", "iconUrl": "https://assets.coingecko.com/coins/images/12811/thumb/barnbridge.jpg?1602728853", "occurrences": 10, "sources": ["bancor", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "barnbridge" }, { "name": "Amp", "symbol": "AMP", "decimals": 18, "address": "0xff20817765cb7f73d4bde2e66e067e58d11095c2", "iconUrl": "https://assets.coingecko.com/coins/images/12409/thumb/amp-200x200.png?1599625397", "occurrences": 10, "sources": ["bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "amp-token" }, { "name": "Keep3rV1", "symbol": "KP3R", "decimals": 18, "address": "0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44", "iconUrl": "https://assets.coingecko.com/coins/images/12966/thumb/kp3r_logo.jpg?1607057458", "occurrences": 10, "sources": ["bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "keep3rv1" }, { "name": "Ocean Token", "symbol": "OCEAN", "decimals": 18, "address": "0x967da4048cd07ab37855c090aaf366e4ce1b9f48", "iconUrl": "https://assets.coingecko.com/coins/images/3687/thumb/ocean-protocol-logo.jpg?1547038686", "occurrences": 10, "sources": ["bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "ocean-protocol" }, { "name": "BandToken", "symbol": "BAND", "decimals": 18, "address": "0xba11d00c5f74255f56a5e366f4f77f5a186d7f55", "iconUrl": "https://assets.coingecko.com/coins/images/9545/thumb/Band_token_blue_violet_token.png?1625881431", "occurrences": 10, "sources": ["bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "band-protocol" }, { "name": "dYdX", "symbol": "DYDX", "decimals": 18, "address": "0x92d6c1e31e14520e676a687f0a93788b716beff5", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/dydx.svg", "occurrences": 10, "sources": ["metamask", "bancor", "coinGecko", "pmm", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "dydx" }, { "name": "SAND", "symbol": "SAND", "decimals": 18, "address": "0x3845badade8e6dff049820680d1f14bd3903a5d0", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/SAND.svg", "occurrences": 10, "sources": ["metamask", "coinGecko", "oneInch", "pmm", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "the-sandbox" }, { "name": "Gitcoin", "symbol": "GTC", "decimals": 18, "address": "0xde30da39c46104798bb5aa3fe8b9e0e1f348163f", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/gtc.svg", "occurrences": 10, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "pmm", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "gitcoin" }, { "name": "Origin Protocol", "symbol": "OGN", "decimals": 18, "address": "0x8207c1ffc5b6804f6024322ccf34f29c3541ae26", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/ogn.svg", "occurrences": 10, "sources": ["metamask", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "origin-protocol" }, { "name": "Cronos", "symbol": "CRO", "decimals": 8, "address": "0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/cro.svg", "occurrences": 10, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs"], "chainId": 1, "coingeckoId": "crypto-com-chain" }, { "name": "Binance USD", "symbol": "BUSD", "decimals": 18, "address": "0x4fabb145d64652a948d72533023f6e7a623c7c53", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/busd.svg", "occurrences": 10, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "binance-usd" }, { "name": "Gnosis Token", "symbol": "GNO", "decimals": 18, "address": "0x6810e776880c02933d47db1b9fc05908e5386b96", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/gnosis.svg", "occurrences": 10, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "gnosis" }, { "name": "Quant Network", "symbol": "QNT", "decimals": 18, "address": "0x4a220e6096b25eadb88358cb44068a3248254675", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/quant-network.svg", "occurrences": 10, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "pmm", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "quant-network" }, { "name": "Rarible", "symbol": "RARI", "decimals": 18, "address": "0xfca59cd816ab1ead66534d82bc21e7515ce441cf", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/rari.svg", "occurrences": 10, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "rarible" }, { "name": "DIAdata", "symbol": "DIA", "decimals": 18, "address": "0x84ca8bc7997272c7cfb4d0cd3d55cd942b3c9419", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/dia.svg", "occurrences": 10, "sources": ["metamask", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "dia-data" }, { "name": "DerivaDAO", "symbol": "DDX", "decimals": 18, "address": "0x3a880652f47bfaa771908c07dd8673a787daed3a", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/DDX.svg", "occurrences": 10, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "derivadao" }, { "name": "Wootrade Network", "symbol": "WOO", "decimals": 18, "address": "0x4691937a7508860f876c9c0a2a617e7d9e945d4b", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/wootrade.svg", "occurrences": 10, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "woo-network" }, { "name": "Rai Reflex Index", "symbol": "RAI", "decimals": 18, "address": "0x03ab458634910aad20ef5f1c8ee96f1d6ac54919", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/rai.svg", "occurrences": 10, "sources": ["metamask", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "rai" }, { "name": "NuCypher", "symbol": "NU", "decimals": 18, "address": "0x4fe83213d56308330ec302a8bd641f1d0113a4cc", "iconUrl": "https://assets.coingecko.com/coins/images/3318/thumb/photo1198982838879365035.jpg?1547037916", "occurrences": 9, "sources": ["coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "nucypher" }, { "name": "Inverse Finance", "symbol": "INV", "decimals": 18, "address": "0x41d5d79431a913c4ae7d69a668ecdfe5ff9dfb68", "iconUrl": "https://assets.coingecko.com/coins/images/14205/thumb/inverse_finance.jpg?1614921871", "occurrences": 9, "sources": ["coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "inverse-finance" }, { "name": "Multichain", "symbol": "MULTI", "decimals": 18, "address": "0x65ef703f5594d2573eb71aaf55bc0cb548492df4", "iconUrl": "https://assets.coingecko.com/coins/images/22087/thumb/1_Wyot-SDGZuxbjdkaOeT2-A.png?1640764238", "occurrences": 9, "sources": ["coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "multichain" }, { "name": "Cartesi Token", "symbol": "CTSI", "decimals": 18, "address": "0x491604c0fdf08347dd1fa4ee062a822a5dd06b5d", "iconUrl": "https://assets.coingecko.com/coins/images/11038/thumb/Cartesi_Logo.png?1689603517", "occurrences": 9, "sources": ["bancor", "coinGecko", "oneInch", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "cartesi" }, { "name": "AlphaToken", "symbol": "ALPHA", "decimals": 18, "address": "0xa1faa113cbe53436df28ff0aee54275c13b40975", "iconUrl": "https://assets.coingecko.com/coins/images/12738/thumb/Stella200x200-06.png?1684988292", "occurrences": 9, "sources": ["bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "alpha-finance" }, { "name": "API3", "symbol": "API3", "decimals": 18, "address": "0x0b38210ea11411557c13457d4da7dc6ea731b88a", "iconUrl": "https://assets.coingecko.com/coins/images/13256/thumb/api3.jpg?1606751424", "occurrences": 9, "sources": ["bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "api3" }, { "name": "Mask Network", "symbol": "MASK", "decimals": 18, "address": "0x69af81e73a73b40adf4f3d4223cd9b1ece623074", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/mask.svg", "occurrences": 9, "sources": ["metamask", "bancor", "coinGecko", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "mask-network" }, { "name": "chiliZ", "symbol": "CHZ", "decimals": 18, "address": "0x3506424f91fd33084466f402d5d97f05f8e3b4af", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/chz.svg", "occurrences": 9, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "chiliz" }, { "name": "BitDAO", "symbol": "BIT", "decimals": 18, "address": "0x1a4b46696b2bb4794eb3d4c26f1c55f9170fa4c5", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/BitDAO.svg", "occurrences": 9, "sources": ["metamask", "coinGecko", "oneInch", "sushiswap", "lifi", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "bitdao" }, { "name": "Tellor Tributes", "symbol": "TRB", "decimals": 18, "address": "0x88df592f8eb5d7bd38bfef7deb0fbc02cf3778a0", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/TRB.svg", "occurrences": 9, "sources": ["metamask", "coinGecko", "oneInch", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "tellor" }, { "name": "Injective", "symbol": "INJ", "decimals": 18, "address": "0xe28b3b32b6c345a34ff64674606124dd5aceca30", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/inj.svg", "occurrences": 9, "sources": ["metamask", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "injective-protocol" }, { "name": "Cream", "symbol": "CREAM", "decimals": 18, "address": "0x2ba592f78db6436527729929aaf6c908497cb200", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/cream.svg", "occurrences": 9, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "multichain", "sonarwatch", "coinmarketcap"], "chainId": 1, "coingeckoId": "cream-2" }, { "name": "Aleph.im Token", "symbol": "ALEPH", "decimals": 18, "address": "0x27702a26126e0b3702af63ee09ac4d1a084ef628", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/aleph.svg", "occurrences": 9, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "aleph" }, { "name": "NEXO", "symbol": "NEXO", "decimals": 18, "address": "0xb62132e35a6c13ee1ee0f84dc5d40bad8d815206", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/NEXO.svg", "occurrences": 9, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "multichain", "sonarwatch", "coinmarketcap"], "chainId": 1, "coingeckoId": "nexo" }, { "name": "Meta", "symbol": "MTA", "decimals": 18, "address": "0xa3bed4e1c75d00fa6f4e5e6922db7261b5e9acd2", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/MTA.svg", "occurrences": 9, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "pmm", "sushiswap", "lifi", "sonarwatch"], "chainId": 1, "coingeckoId": "meta" }, { "name": "STAKE Token", "symbol": "STAKE", "decimals": 18, "address": "0x0ae055097c6d159879521c384f1d2123d1f195e6", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/stake.svg", "occurrences": 9, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "multichain", "sonarwatch", "coinmarketcap"], "chainId": 1, "coingeckoId": "xdai-stake" }, { "name": "Polymath", "symbol": "POLY", "decimals": 18, "address": "0x9992ec3cf6a55b00978cddf2b27bc6882d88d1ec", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/polymath_logo.svg", "occurrences": 9, "sources": ["metamask", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "polymath" }, { "name": "ROOK", "symbol": "ROOK", "decimals": 18, "address": "0xfa5047c9c78b8877af97bdcb85db743fd7313d4a", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/Rook.svg", "occurrences": 9, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "rook" }, { "name": "district0x", "symbol": "DNT", "decimals": 18, "address": "0x0abdace70d3790235af448c88547603b945604ea", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/district0x.svg", "occurrences": 9, "sources": ["metamask", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "district0x" }, { "name": "Maple Finance", "symbol": "MPL", "decimals": 18, "address": "0x33349b282065b0284d756f0577fb39c158f935e6", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/maple-finance.svg", "occurrences": 9, "sources": ["metamask", "coinGecko", "oneInch", "pmm", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "maple" }, { "name": "Livepeer", "symbol": "LPT", "decimals": 18, "address": "0x58b6a8a3302369daec383334672404ee733ab239", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/lpt.svg", "occurrences": 9, "sources": ["metamask", "coinGecko", "oneInch", "pmm", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "livepeer" }, { "name": "PAX Gold", "symbol": "PAXG", "decimals": 18, "address": "0x45804880de22913dafe09f4980848ece6ecbaf78", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/paxg.svg", "occurrences": 9, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "sushiswap", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "pax-gold" }, { "name": "Gemini Dollar", "symbol": "GUSD", "decimals": 2, "address": "0x056fd409e1d7a124bd7017459dfea2f387b6d5cd", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/gusd.svg", "occurrences": 9, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "lifi", "openswap", "multichain", "sonarwatch", "uniswapLabs"], "chainId": 1, "coingeckoId": "gemini-dollar" }, { "name": "Numeraire", "symbol": "NMR", "decimals": 18, "address": "0x1776e1f26f98b1a5df9cd347953a26dd3cb46671", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/nmr.png", "occurrences": 9, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "numeraire" }, { "name": "Status Network Token", "symbol": "SNT", "decimals": 18, "address": "0x744d70fdbe2ba4cf95131626614a1763df805b9e", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/snt.svg", "occurrences": 9, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "status" }, { "name": "SuperRare Token", "symbol": "RARE", "decimals": 18, "address": "0xba5bde662c17e2adff1075610382b9b691296350", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/rare.svg", "occurrences": 9, "sources": ["metamask", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "superrare" }, { "name": "renBTC", "symbol": "RENBTC", "decimals": 8, "address": "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/renBTC.svg", "occurrences": 9, "sources": ["metamask", "bancor", "cryptocom", "coinGecko", "oneInch", "sushiswap", "lifi", "sonarwatch", "coinmarketcap"], "chainId": 1, "coingeckoId": "renbtc" }, { "name": "AirSwap Token", "symbol": "AST", "decimals": 4, "address": "0x27054b13b1b798b345b591a4d22e6562d47ea75a", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/AirSwapLogo.svg", "occurrences": 9, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "lifi", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "airswap" }, { "name": "Celsius", "symbol": "CEL", "decimals": 4, "address": "0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/celsius.svg", "occurrences": 9, "sources": ["metamask", "bancor", "coinGecko", "oneInch", "sushiswap", "lifi", "multichain", "sonarwatch", "coinmarketcap"], "chainId": 1, "coingeckoId": "celsius-degree-token" }, { "name": "Golem Network Token", "symbol": "GLM", "decimals": 18, "address": "0x7dd9c5cba05e151c895fde1cf355c9a1d5da6429", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/glm.svg", "occurrences": 9, "sources": ["metamask", "coinGecko", "oneInch", "sushiswap", "lifi", "openswap", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "golem" }, { "name": "REVV", "symbol": "REVV", "decimals": 18, "address": "0x557b933a7c2c45672b610f8954a3deb39a51a8ca", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/revv.svg", "occurrences": 9, "sources": ["metamask", "coinGecko", "oneInch", "sushiswap", "lifi", "multichain", "sonarwatch", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "revv" }, { "name": "Fantom", "symbol": "FTM", "decimals": 18, "address": "0x4e15361fd6b4bb609fa63c81a2be19d873717870", "iconUrl": "https://raw.githubusercontent.com/MetaMask/contract-metadata/master/images/ftm.svg", "occurrences": 9, "sources": ["metamask", "oneInch", "pmm", "sushiswap", "lifi", "openswap", "multichain", "uniswapLabs", "coinmarketcap"], "chainId": 1, "coingeckoId": "wrapped-fantom" }];
  } catch (error) {
    console.error('Error fetching tokens:', error);
    throw new Error('Failed to fetch tokens for the given chainId.');
  }
}

// Helper function to convert chainName to chainId
function getChainIdFromName(chainName) {
  const lowercaseName = chainName.toLowerCase();
  // TODO: Need to handle slightly different names (ex. ethereum vs Ethereum, BSC vs BinanceSmartChain, Binance vs BinanceSmartChain)
  // Mapping of chain names to their respective chain IDs
  const chainNamesToIds = {
    ethereum: 1,
    optimism: 10,
    cronos: 25,
    binancesmartchain: 56,
    ethclassic: 61,
    gnosis: 100,
    polygon: 137,
    fantom: 250,
    filecoin: 314,
    moonbeam: 1284,
    moonriver: 1285,
    kava: 2222,
    mantle: 5000,
    canto: 7700,
    base: 8453,
    arbitrum: 42161,
    celo: 42220,
    avalanche: 43114,
    linea: 59144,
    // Add more chainName-chainId mappings here as needed
  };

  return chainNamesToIds[lowercaseName] || null;
}

// Helper function to convert protocolName to protocolAddress
// Can then get the function signatures and inputs of the protocol using functions below
function getProtocolAddressFromName(protocolName) {
  const lowercaseName = protocolName.toLowerCase();
  // TODO Add more protocols and confirm these addresses are correct
  // Mapping of protocol names to their respective addresses
  const protocolNamesToAddresses = {
    uniswap: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
    sushiswap: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
    balancer: '0xba100000625a3754423978a60c9317c58a424e3d',
    compound: '0xc00e94cb662c3520282e6f5717214004a7f26888',
    aave: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    maker: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    yearnfinance: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
    synthetix: '0xC011A72400E58ecD99Ee497CF89E3775d4bd732F',
    curvefinance: '0xD533a949740bb3306d119CC777fa900bA034cd52',
    '1inch': '0x111111111117dC0aa78b770fA6A738034120C302',
    pancakeSwap: '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F',
    quickswap: '0x6c28aE28Ad99c6C7b015c9D810B9BfcE6D9E2Ba0',
    sushi: '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
    cream: '0x2ba592F78dB6436527729929AAf6c908497cB200',
    badger: '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
    curve_susd: '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD',
    iron_finance: '0x7b65B489fE53fCE1F6548Db886C08aD73111DDd8',
    sushi_ftm: '0x2168A177864D3a3513328b28b205A13eA00D4dBF',
    dodo: '0x67ee3Cb086F8a16f34beE3ca72FAD36F7Db929e2',
    bancor: '0x2B31b3D71f8A7E8970eF76a6E8365eCB6B5793dB',
    sfinance: '0x49e833337ece7afe375e44f4e3e8481029218e5c',
    nftx: '0xAf93fCce0548D3124A5fC3045adAf1ddE4e8Bf7e',
    ren: '0x408e41876cCCDC0F92210600ef50372656052a38',
    alpha_finance: '0xa1faa113cbE53436Df28FF0aEe54275c13B40975',
    yearn_iron_bank: '0xA625AB01B08ce023B2a342Dbb12a16f2C8489A8F',
    siren: '0xD23Ac27148aF6A2f339BD82D0e3CFF380b5093de',
    mstable: '0xa3BeD4E1c75D00fa6f4E5E6922DB7261B5E9AcD2',
    uniswap_v3: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
    yearn_v2: '0x18aAA7115705e8be94bfFEBDE57Af9BFc265B998',
    cream_v2: '0xEdB61f74B2162F48Fd09D9779fF10a43C2B446b8',
    alpha_homora: '0x7a9f28eb62c791422aa23ceae1da9c847cbec9b0',
    sushiswap_ftm: '0x4965f6fa20fe9728decf5165016fc338a5a85abf',
    quickswap_matic: '0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3',
    sushi_eth: '0xff6a0ea7b75cd4bddc0d14095712e0d47b349c4d',
    curve_eth: '0xc5424b857f758e906013f3555dad202e4bdb4567',
    renbtc: '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d',
    weth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    usdc: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    usdt: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    dai: '0x6b175474e89094c44da98b954eedeac495271d0f',
    sushi_avax: '0xd9fff7987d8b43dd0965aethfedcbd3da40ce6c7',
    link: '0x514910771af9ca656af840dff83e8264ecf986ca',
    usdt_tron: '0xa614f803b6fd780986a42c78ec9c7f77e6ded13c',
    sushi_matic: '0xaba8cac6866b83ae4eec97dd07ed254282f6ad8a',
    curve_susdv2: '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD',
    curve_y: '0x45f783cce6b7ff23b2ab2d70e416cdb7d6055f51',
    aave_v2: '0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5',
    quickswap_poly: '0x831753dd7087cac61ab5644b308642cc1c33dc13',
    iron_lend: '0x657A1861c15A3deD9AF0B6799a195a249ebdCbc6',
    sushi_iohk: '0x1B75B90E6a680SDFEa3d1061b199a29fBAb6f725',
    sushi_evm: '0xfCEAAf9792139BF714a694f868A215493461446D',
    frax: '0x853d955acef822db058eb8505911ed77f175b99e',
    bancor_v2: '0x2A8e1E676Ec238d8A992307B495b45B3fEAa5e86',
    yearn: '0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c',
    aavegotchi: '0x86935F11C86623deC8a25696E1C19a8659CbF95d',
    pooltogether: '0x0cec1a9154ff802e7934fc916ed7ca50bde6844e',
    celsius: '0xaaaebe6fe48e54f431b0c390cfaf0b017d09d42d',
    opensea: '0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b',
    rarible: '0xFc1E690f61EFd961294b3e1Ce3313fBD8aa4f85d',
    superRare: '0x41a322b28d0f447e5e7dbd4d942f4a8a73a2cabd',
    decentraland: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
    cryptovoxels: '0x79986af15539de2db9a5086382daeda917a9cf0c',
    artblocks: '0xa7d8d9ef8D8Ce8992Df33D8b8CF4Aebabd5bD270',
    binance_nft: '0x4e7bf3694962fc482a16d60fd78f99db9c4c52b0',
    // Add more protocolName-protocolAddress mappings here as needed
  };

  return protocolNamesToAddresses[lowercaseName] || null;
}

async function fetch_contract_abi(contract, api_key) {
  const url = "https://api.etherscan.io/api";
  const parameters = {
    module: "contract",
    action: "getabi",
    address: contract,
    apikey: api_key
  };

  try {
    const response = await axios.get(url, { params: parameters });
    return response.data;
  } catch (e) {
    console.error("Error occurred during API call:", e);
    return null;
  }
}

async function get_contract_data(contract) {
  const api_key = process.env.ETHERSCAN_API_KEY;
  const response_data = await fetch_contract_abi(contract, api_key);

  //if not verified on etherscan, should not interact with it
  if (response_data && response_data.status === '1') {
    const abi = JSON.parse(response_data.result);
    const signatures = {};

    for (const func of abi) {
      if (func.type !== 'function') {
        continue;
      }

      const name = func.name;
      const types = func.inputs.map(inp => inp.type);
      const functionSignature = web3.utils.sha3(`${name}(${types.join(',')})`).slice(0, 8);
      signatures[name] = [functionSignature, func.inputs];
    }

    return signatures;
  } else {
    console.error("Error fetching contract ABI or contract not found.");
    return {};
  }
}

// Swap endpoint
app.post('/swap', async (req, res) => {
  try {
    const { chainName, sourceAmount, sourceToken, destinationToken } = req.body;
    const chainId = getChainIdFromName(chainName);
    // Step 1: Check user balance on the given chain (Web3.js required)

    // Step 2: Check user allowance and approve if necessary (Web3.js required)

    // Step 3: Make an HTTP request to Metamask Swap API
    const queryURL = `https://swap.metaswap.codefi.network/networks/${chainId}/trades`;
    const queryParams = new URLSearchParams({
      sourceAmount,
      sourceToken,
      destinationToken,
      slippage: 2,
      walletAddress: 'wallet_address', // Replace with the actual wallet address
      timeout: 10000,
      enableDirectWrapping: true,
      includeRoute: true,
    });
    // const response = await axios.get(`${queryURL}?${queryParams}`);
    // const response = await axios.get('https://swap.metaswap.codefi.network/networks/1/trades?sourceAmount=2000000000000000000&sourceToken=0x0000000000000000000000000000000000000000&destinationToken=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&slippage=2&walletAddress=0xc5a05570da594f8edcc9beaa2385c69411c28cbe&timeout=10000&enableDirectWrapping=true&includeRoute=true');
    // console.log(response);

    // Step 4: Parse the response and extract relevant information for the transaction
    // if (!response) {
    // throw new Error('No trades found in the response.');
    // }

    // For this example, we will use the first trade in the response
    // var i = 0;
    // var trade = null;
    // while (!trade) {
    // trade = response['data'][i]['trade'];
    // i += 1;
    // }

    // Step 5: Return the transaction details to the client
    const transactionDetails = {
      from: '0xc5a05570da594f8edcc9beaa2385c69411c28cbe', // trade.from,
      to: '0x82E0b8cDD80Af5930c4452c684E71c861148Ec8A', // trade.to,
      gas: 355250,
      maxFeePerGas: 355250,
      maxPriorityFeePerGas: 355250,
      gasPrice: 355250,
      value: '0x1', // trade.value,
      data: '0x01', // trade.data,
      nonce: 101,
    };

    res.status(200).json({ status: 'success', transaction: transactionDetails });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Bridge endpoint
app.post('/bridge', async (req, res) => {
  try {
    const { sourceChainName, destinationChainName, token, amount } = req.body;
    const sourceChainId = getChainIdFromName(sourceChainName);
    const destinationChainId = getChainIdFromName(destinationChainName);
    // Step 1: Check user balance and allowance on the source chain (Web3.js required)

    // Step 2: Make an HTTP request to Metamask Bridge API
    const queryURL = 'https://bridge.metaswap.codefi.network/getQuote';
    const queryParams = new URLSearchParams({
      walletAddress: '0xc5a05570da594f8edcc9beaa2385c69411c28cbe',
      srcChainId: sourceChainId,
      destChainId: destinationChainId,
      srcTokenAddress: token, // need to get token address on source chain
      destTokenAddress: token, // need to get token address on destination chain
      srcTokenAmount: amount,
      slippage: 0.5,
      aggIds: 'socket,lifi',
      insufficientBal: false,
    });
    // const response = await axios.get(`${queryURL}?${queryParams}`);
    // const response = await axios.get('https://bridge.metaswap.codefi.network/getQuote?walletAddress=0xc5a05570da594f8edcc9beaa2385c69411c28cbe&srcChainId=1&destChainId=10&srcTokenAddress=0x0000000000000000000000000000000000000000&destTokenAddress=0x0000000000000000000000000000000000000000&srcTokenAmount=1500000000000000000&slippage=0.5&aggIds=socket,lifi&insufficientBal=false');
    // console.log(response);
    // 
    // // Step 3: Parse the response and extract relevant information for the bridge transaction
    // const { data: quoteData } = response;
    // const { chainId, to, from, value, data } = quoteData;
    // 
    // // For this example, we will use the first trade in the response
    // var i = 0;
    // var trade = null;
    // while (!trade) {
    // trade = response['data'][i]['trade'];
    // i += 1;
    // }


    // Step 4: Return the transaction details to the client
    const transactionDetails = {
      from: '0xc5a05570da594f8edcc9beaa2385c69411c28cbe', // trade.from,
      to: '0x82E0b8cDD80Af5930c4452c684E71c861148Ec8A', // trade.to,
      gas: 355250,
      maxFeePerGas: 355250,
      maxPriorityFeePerGas: 355250,
      gasPrice: 355250,
      value: '0x1', // trade.value,
      data: 0x001,
      nonce: 101,
    };

    res.status(200).json({ status: 'success', transaction: transactionDetails });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Transfer endpoint
app.post('/transfer', async (req, res) => {
  try {
    const { token, amount, recipient, chainName } = req.body;

    // Step 1: Check user balance on the chain (Web3.js required)

    // Step 2: Return the transaction details to the client
    const transactionDetails = {
      from: '0xc5a05570da594f8edcc9beaa2385c69411c28cbe',
      to: recipient,
      gas: 355250,
      maxFeePerGas: 355250,
      maxPriorityFeePerGas: 355250,
      gasPrice: 355250,
      value: amount,
      data: 'transaction_data', // For ERC20 token transfers, this field may contain the encoded transfer function call.
      nonce: 'nonce',
    };

    res.status(200).json({ status: 'success', transaction: transactionDetails });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

app.get('/token-balance', async (req, res) => {
  res.status(200).json({ status: 'success', balance: 1 });
  // try {
  // const { accountAddress, chainName, tokenName } = req.query;
  // const chainId = getChainIdFromName(chainName);
  // 
  // // Step 1: Fetch the token address for the given tokenName on the specified chain
  // const tokens = await getTokensForChain(chainId);
  // const token = tokens.find((t) => t.symbol.toLowerCase() === tokenName.toLowerCase());
  // if (!token) {
  // return res.status(400).json({ status: 'error', message: 'Token not found on the specified chain.' });
  // }
  // 
  // // Step 2: Fetch the user's token balance using the MetaFi API
  // const response = await getTokenBalancesForUser(accountAddress, chainId);
  // const nativeBalances = [response.nativeBalance]
  // const nativeBalance = nativeBalances.find((b) => b.address === token.address);
  // const tokenBalance = response.tokenBalances.find((b) => b.address === token.address);
  // 
  // if (!tokenBalance && !nativeBalance) {
  // return res.status(200).json({ status: 'success', balance: '0' });
  // }
  // 
  // res.status(200).json({ status: 'success', balance: tokenBalance.balance });
  // } catch (error) {
  // console.error('Error:', error);
  // res.status(500).json({ status: 'error', message: 'Internal server error' });
  // }
});

// Status endpoint
app.get('/status', async (req, res) => {
  res.status(200).json({ status: 'success' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://127.0.0.1:${port}`);
});
