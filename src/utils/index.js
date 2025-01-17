import axios from "axios";
import { BigNumber, Contract, ethers, utils } from "ethers";
import Sequelize from "sequelize";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";
import { NATIVE_TOKEN, NATIVE_TOKEN2 } from "../constants.js";
import ERC20_ABI from "../abis/erc20.abi.js";
import ProtocolAddresses from "./address.js";
import { getBestSwapRoute } from "./swap.js";
import { getBestBridgeRoute } from "./bridge.js";
import { getSwapData } from "./protocol/swap.js";
import { getBridgeData } from "./protocol/bridge.js";
import { getDepositData } from "./protocol/deposit.js";
import { getWithdrawData } from "./protocol/withdraw.js";
import { getClaimData } from "./protocol/claim.js";
import { getBorrowData } from "./protocol/borrow.js";
import { getLendData } from "./protocol/lend.js";
import { getRepayData } from "./protocol/repay.js";
import { getStakeData } from "./protocol/stake.js";
import { getUnstakeData } from "./protocol/unstake.js";
import { getLongData } from "./protocol/long.js";
import { getShortData } from "./protocol/short.js";
import { getLockData } from "./protocol/lock.js";
import { getUnlockData } from "./protocol/unlock.js";
import { getVoteData } from "./protocol/vote.js";
import { abis } from "../abis/index.js";
import { sequelize } from "../db/index.js";
import tokenModel from "../db/token.model.js";

export const metamaskApiHeaders = {
  Referrer: "https://portfolio.metamask.io/",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
};

export const getChainNameForCMC = (chainName) => {
  const chainNamesForCMC = {
    ethereum: "Ethereum",
    optimism: "Optimism",
    binancesmartchain: "BNB Smart Chain (BEP20)",
    gnosis: "Gnosis Chain",
    polygon: "Polygon",
    fantom: "Fantom",
    filecoin: "Filecoin",
    moonbeam: "Moonbeam",
    moonriver: "Moonriver",
    kava: "Kava",
    canto: "Canto",
    base: "Base",
    arbitrum: "Arbitrum",
    celo: "Celo",
    avalanche: "Avalanche C-Chain",
    zksync: "zkSync Era",
    // Add more chainName-platform on CMC mappings here as needed
  };

  return chainNamesForCMC[chainName.toLowerCase()] || null;
};

const chainNamesForCGC = {
  ethereum: "ethereum",
  optimism: "optimistic-ethereum",
  cronos: "cronos",
  binancesmartchain: "binance-smart-chain",
  gnosis: "gnosis",
  polygon: "polygon-pos",
  fantom: "fantom",
  filecoin: "filecoin",
  moonbeam: "moonbeam",
  moonriver: "Moonriver",
  kava: "kava",
  base: "base",
  arbitrum: "arbitrum-one",
  avalanche: "avalanche",
  harmony: "harmony-shard-0",
  aurora: "aurora",
  metis: "metis-andromeda",
  sora: "sora",
  syscoin: "syscoin",
  cardano: "milkomeda-cardano",
  energi: "energi",
  cosmos: "cosmos",
  astar: "astar",
  velas: "velas",
  hydra: "hydra",
  near: "near-protocol",
  zksync: "zksync",
  mantle: "mantle",
  celo: "celo",
  canto: "canto",
  linea: "linea",
  // Add more chainName-platform on CGC mappings here as needed
};

export const getChainNameForCGC = (chainName) => {
  return chainNamesForCGC[chainName.toLowerCase()] || null;
};

export const getChainNameFromCGC = (cgcChainName) => {
  const chainNames = Object.keys(chainNamesForCGC);
  for (let i = 0; i < chainNames.length; i++) {
    if (chainNamesForCGC[chainNames[i]] === cgcChainName) return chainNames[i];
  }
  return null;
};

// TODO: Need to handle lower vs upper case and slightly different names (ex. ethereum vs Ethereum, BSC vs BinanceSmartChain, Binance vs BinanceSmartChain)
// Mapping of chain names to their respective chain IDs
const chainNamesToIds = {
  ethereum: 1,
  mainnet: 1,
  homestead: 1,
  optimism: 10,
  cronos: 25,
  binancesmartchain: 56,
  bsc: 56,
  bnb: 56,
  binance: 56,
  ethclassic: 61,
  classic: 61,
  gnosis: 100,
  polygon: 137,
  matic: 137,
  fantom: 250,
  filecoin: 314,
  "filecoin-mainnet": 314,
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
  "linea-mainnet": 59144,
  // Add more chainName-chainId mappings here as needed
};

// Helper function to convert chainName to chainId
export const getChainIdFromName = (chainName) => {
  return chainNamesToIds[chainName.toLowerCase()] || null;
};

// Helper function to convert chainId to chainName
export const getChainNameFromId = (chainId) => {
  const chainNames = Object.keys(chainNamesToIds);
  for (let i = 0; i < chainNames.length; i++) {
    if (chainNamesToIds[chainNames[i]] === chainId) return chainNames[i];
  }
  return null;
};

export const getRpcUrlForChain = (chainId) => {
  const chainIdsToRpcUrls = {
    1: "https://rpc.mevblocker.io",
    10: "https://optimism.llamarpc.com",
    25: "https://cronos-evm.publicnode.com",
    56: "https://binance.llamarpc.com",
    61: "https://etc.rivet.link",
    100: "https://gnosis.publicnode.com",
    137: "https://polygon.llamarpc.com",
    250: "https://fantom.publicnode.com",
    314: "https://rpc.ankr.com/filecoin",
    1284: "https://rpc.api.moonbeam.network",
    1285: "https://moonriver.publicnode.com",
    2222: "https://kava-evm.publicnode.com",
    5000: "https://rpc.mantle.xyz",
    7700: "https://canto.slingshot.finance",
    8453: "https://base.llamarpc.com",
    42161: "https://arbitrum.llamarpc.com",
    42220: "https://1rpc.io/celo",
    43114: "https://avalanche-c-chain.publicnode.com",
    59144: "https://rpc.linea.build",
    // Add more chainId-rpcUrl mappings here as needed
  };

  return chainIdsToRpcUrls[chainId] || null;
};

export const getNativeTokenSymbolForChain = (chainId) => {
  const chainIdsToNativeTokenSymbols = {
    1: "ETH",
    10: "ETH",
    25: "CRO",
    56: "BNB",
    61: "ETH",
    100: "xDAI",
    137: "MATIC",
    250: "FTM",
    314: "FIL",
    1284: "GLMR",
    1285: "MOVR",
    2222: "KAVA",
    5000: "MNT",
    7700: "CANTO",
    8453: "ETH",
    42161: "ETH",
    42220: "CELO",
    43114: "AVAX",
    59144: "ETH",
    // Add more chainId-rpcUrl mappings here as needed
  };

  return chainIdsToNativeTokenSymbols[chainId] || null;
};

export const getEthBalanceForUser = async (chainId, user) => {
  const rpcUrl = getRpcUrlForChain(chainId);
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);
  return await provider.getBalance(user);
};

export const getProtocolAddressForChain = (
  protocol,
  chainId,
  key = "default"
) => {
  if (ProtocolAddresses[protocol]) {
    if (ProtocolAddresses[protocol][chainId]) {
      return ProtocolAddresses[protocol][chainId][key] || null;
    }
  }
  return null;
};

function onlyUnique(value, index, array) {
  return array.indexOf(value) === index;
}

export const getProtocolAddresses = (protocol) => {
  const key = protocol.toLowerCase();
  const chains = Object.keys(ProtocolAddresses[key] || {});
  const addresses = {};
  chains.map((chain) => {
    addresses[chain] = Object.values(ProtocolAddresses[key][chain]).filter(
      onlyUnique
    );
  });
  return addresses;
};

export const getProtocolEntities = (protocol) => {
  let poolNames;
  switch (protocol.toLowerCase()) {
    case "curve":
      poolNames = {
        1: ["3pool", "steth", "fraxusdc", "tricrypto2", "fraxusdp"],
      };
      break;
    case "dopex":
      poolNames = {
        42161: [
          "arb-monthly-ssov",
          "rpdx-monthly-ssov",
          "dpx-monthly-ssov",
          "steth-monthly-ssov",
          "steth-weekly-ssov",
        ],
      };
      break;
    default:
      poolNames = {};
  }
  let reference;
  let addresses;
  switch (protocol.toLowerCase()) {
    case "0x":
    case "matcha":
      addresses = {
        1: ["0xDef1C0ded9bec7F1a1670819833240f027b25EfF"],
        10: ["0xdef1abe32c034e558cdd535791643c58a13acc10"],
        56: ["0xDef1C0ded9bec7F1a1670819833240f027b25EfF"],
        137: ["0xDef1C0ded9bec7F1a1670819833240f027b25EfF"],
        250: ["0xdef189deaef76e379df891899eb5a00a94cbc250"],
        43114: ["0xDef1C0ded9bec7F1a1670819833240f027b25EfF"],
        42220: ["0xDef1C0ded9bec7F1a1670819833240f027b25EfF"],
        42161: ["0xDef1C0ded9bec7F1a1670819833240f027b25EfF"],
      };
      break;
    case "1inch":
      addresses = {
        1: [
          "0x1111111254EEB25477B68fb85Ed929f73A960582",
          "0x1111111254fb6c44bAC0beD2854e76F90643097d",
        ],
        56: [
          "0x1111111254EEB25477B68fb85Ed929f73A960582",
          "0x1111111254fb6c44bAC0beD2854e76F90643097d",
        ],
        137: [
          "0x1111111254EEB25477B68fb85Ed929f73A960582",
          "0x1111111254fb6c44bAC0beD2854e76F90643097d",
        ],
        250: [
          "0x1111111254EEB25477B68fb85Ed929f73A960582",
          "0x1111111254fb6c44bAC0beD2854e76F90643097d",
        ],
        10: [
          "0x1111111254EEB25477B68fb85Ed929f73A960582",
          "0x1111111254fb6c44bAC0beD2854e76F90643097d",
        ],
        100: [
          "0x1111111254EEB25477B68fb85Ed929f73A960582",
          "0x1111111254fb6c44bAC0beD2854e76F90643097d",
        ],
        42161: [
          "0x1111111254EEB25477B68fb85Ed929f73A960582",
          "0x1111111254fb6c44bAC0beD2854e76F90643097d",
        ],
        43114: [
          "0x1111111254EEB25477B68fb85Ed929f73A960582",
          "0x1111111254fb6c44bAC0beD2854e76F90643097d",
        ],
      };
      break;
    case "paraswap":
      addresses = {
        1: ["0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57"],
        56: ["0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57"],
        137: ["0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57"],
        250: ["0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57"],
        10: ["0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57"],
        42161: ["0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57"],
        43114: ["0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57"],
      };
      break;
    case "lifi":
      addresses = {
        1: ["0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE"],
        10: ["0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE"],
        25: ["0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE"],
        56: ["0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE"],
        100: ["0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE"],
        137: ["0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE"],
        250: ["0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE"],
        42161: ["0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE"],
        43114: ["0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE"],
      };
      break;
    case "openocean":
      addresses = {
        1: ["0x6352a56caadC4F1E25CD6c75970Fa768A3304e64"],
        10: ["0x6352a56caadC4F1E25CD6c75970Fa768A3304e64"],
        25: ["0x6352a56caadC4F1E25CD6c75970Fa768A3304e64"],
        56: ["0x6352a56caadC4F1E25CD6c75970Fa768A3304e64"],
        100: ["0x6352a56caadC4F1E25CD6c75970Fa768A3304e64"],
        137: ["0x6352a56caadC4F1E25CD6c75970Fa768A3304e64"],
        250: ["0x6352a56caadC4F1E25CD6c75970Fa768A3304e64"],
        42161: ["0x6352a56caadC4F1E25CD6c75970Fa768A3304e64"],
        43114: ["0x6352a56caadC4F1E25CD6c75970Fa768A3304e64"],
      };
      break;
    case "kyberswap":
      addresses = {
        1: ["0x6131B5fae19EA4f9D964eAc0408E4408b66337b5"],
        56: ["0x6131B5fae19EA4f9D964eAc0408E4408b66337b5"],
        137: ["0x6131B5fae19EA4f9D964eAc0408E4408b66337b5"],
        250: ["0x6131B5fae19EA4f9D964eAc0408E4408b66337b5"],
        10: ["0x6131B5fae19EA4f9D964eAc0408E4408b66337b5"],
        42161: ["0x6131B5fae19EA4f9D964eAc0408E4408b66337b5"],
        43114: ["0x6131B5fae19EA4f9D964eAc0408E4408b66337b5"],
        25: ["0x6131B5fae19EA4f9D964eAc0408E4408b66337b5"],
      };
      break;
    case "bungee":
      addresses = {
        1: ["0x3a23F943181408EAC424116Af7b7790c94Cb97a5"],
        56: ["0x3a23F943181408EAC424116Af7b7790c94Cb97a5"],
        137: ["0x3a23F943181408EAC424116Af7b7790c94Cb97a5"],
        250: ["0x3a23F943181408EAC424116Af7b7790c94Cb97a5"],
        10: ["0x3a23F943181408EAC424116Af7b7790c94Cb97a5"],
        100: ["0x3a23F943181408EAC424116Af7b7790c94Cb97a5"],
        42161: ["0x3a23F943181408EAC424116Af7b7790c94Cb97a5"],
        43114: ["0x3a23F943181408EAC424116Af7b7790c94Cb97a5"],
      };
      break;
    case "balancer":
    case "sushiswap":
    case "uniswap":
    case "llamazip":
    case "curve":
    case "camelot":
      reference = "ParaSwap";
      break;
    case "matcha":
      reference = "0x";
      break;
    case "jumper":
      reference = "LiFi";
      break;
  }
  const pools = {};
  const poolChains = Object.keys(poolNames);
  poolChains.map((chain) => {
    poolNames[chain].map((poolName) => {
      pools[chain] = pools[chain] || {};
      pools[chain][poolName] =
        ProtocolAddresses[protocol.toLowerCase()][chain][poolName];
    });
  });
  const protocolEntities = {
    name: protocol,
    addresses: addresses || getProtocolAddresses(protocol),
    pools,
  };
  if (reference) {
    protocolEntities["reference"] = reference;
  }
  return protocolEntities;
};

export const getChainEntities = async (chainName) => {
  return {
    name: chainName,
    tokens: await getTokensForChain(getChainIdFromName(chainName)),
  };
};

export const getABIForProtocol = (protocol, key) =>
  abis[`${protocol}${!key ? "" : `-${key}`}`];

export const getFunctionName = (protocol, action) => {
  switch (protocol) {
    case "aave":
      if (action === "deposit" || action === "lend") return "supply";
      return action;
    case "compound":
      if (action === "deposit") return "supply";
      return action;
    case "curve":
      if (action === "deposit") return "add_liquidity";
      if (action === "withdraw") return "remove_liquidity_one_coin";
      return action;
    case "hop":
      if (action === "claim") return "getReward";
      if (action === "deposit") return "stake";
      return action;
    case "lido":
      if (action === "stake") return "deposit";
      return action;
    case "rocketpool":
      if (action === "withdraw") return "withdrawExcessBalance";
      return action;
    case "pendle":
      if (action === "deposit") return "mint";
      if (action === "withdraw") return "burn";
      if (action === "lock") return "increaseLockPosition";
      if (action === "unlock") return "withdraw";
      return action;
    case "jonesdao":
      if (action === "claim") return "harvest";
      return action;
    case "lodestar":
      if (action === "stake") return "stakeLODE";
      if (action === "unstake") return "unstakeLODE";
      if (action === "claim") return "claimRewards";
      if (action === "lend") return "mintAllowed";
      if (action === "borrow") return "borrowAllowed";
      if (action === "repay") return "repayBorrowAllowed";
      return action;
    case "plutus":
      if (action === "lock") return "deposit";
      if (action === "unlock") return "claim";
      return action;
    case "rodeo":
      if (action === "lend") return "mint";
      if (action === "deposit") return "mint";
      if (action === "withdraw") return "burn";
      return action;
    case "kwenta":
      if (action === "long" || action === "short" || action === "close")
        return "execute";
      return action;
    case "stargate":
      if (action === "deposit") return "addLiquidity";
      if (action === "withdraw") return "redeemLocal";
      if (action === "stake") return "deposit";
      if (action === "unstake") return "withdraw";
      if (action === "claim") return "emergencyWithdraw";
      return action;
    case "thena":
      if (action === "lock") return "create_lock";
      if (action === "unlock") return "withdraw";
      return action;
    case "yieldyak":
      if (action === "swap") return "swapNoSplit";
      return action;
    default:
      return action;
  }
};

// Helper function to get tokens on a chain
export const getTokensForChain = async (chainId) => {
  const Token = await tokenModel(sequelize, Sequelize);
  const tokens = await Token.findAll({
    where: {
      chainId,
    },
    raw: true,
  });
  return tokens.map(({ name, symbol, address }) => ({ name, symbol, address }));
};

const getBalanceSlotForToken = (chainId, token) => {
  const tokenToBalanceSlot = {
    1: {
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": 3, // WETH
      "0xdac17f958d2ee523a2206206994597c13d831ec7": 0, // USDT
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": 9, // USDC
      "0x6b175474e89094c44da98b954eedeac495271d0f": 2, // DAI
    },
    10: {
      "0x4200000000000000000000000000000000000006": 3, // WETH
      "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58": 0, // USDT
      "0x0b2c639c533813f4aa9d7837caf62653d097ff85": 9, // USDC
      "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1": 2, // DAI
    },
    25: {
      "0xe44fd7fcb2b1581822d0c862b68222998a0c299a": 2, // WETH
      "0x66e428c3f67a68878562e79a0234c1f83c208770": 2, // USDT
      "0xc21223249ca28397b4b6541dffaecc539bff0c59": 2, // USDC
      "0xf2001b145b43032aaf5ee2884e456ccd805f677d": 2, // DAI
    },
    137: {
      "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619": 0, // WETH
      "0xc2132d05d31c914a87c6611c10748aeb04b58e8f": 0, // USDT
      "0x2791bca1f2de4661ed88a30c99a7a9449aa84174": 0, // USDC
      "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063": 0, // DAI
    },
    42161: {
      "0x82af49447d8a07e3bd95bd0d56f35241523fbab1": 0, // WETH
      "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9": 1, // USDT
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8": 1, // USDC
      "0xaf88d065e77c8cc2239327c5edb3a432268e5831": 9, // USDC
      "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1": 2, // DAI
    },
    43114: {
      "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab": 0, // WETH
      "0xc7198437980c041c805a1edcba50c1ce5db95118": 0, // USDT
      "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664": 0, // USDC
      "0xd586e7f844cea2f87f50152665bcbc2c279d8d70": 0, // DAI
    },
  };

  return tokenToBalanceSlot[chainId][token.toLowerCase()] || null;
};

export const getDebankChainId = (chainId) => {
  const chainIdsToDebankChainIds = {
    1: "eth",
    10: "op",
    25: "cro",
    56: "bsc",
    // 61: "ETH",
    100: "xdai",
    137: "matic",
    250: "ftm",
    314: "FIL",
    1284: "mobm",
    1285: "movr",
    2222: "kava",
    // 5000: "MNT",
    7700: "canto",
    // 8453: "ETH",
    42161: "arb",
    42220: "celo",
    43114: "avax",
    // 59144: "ETH",
    // Add more chainId-rpcUrl mappings here as needed
  };

  return chainIdsToDebankChainIds[chainId] || null;
};

export const getZapperNetwork = (chainId) => {
  const chainIdsToZapperNetworks = {
    1: "ethereum",
    10: "optimism",
    // 25: "cro",
    56: "binance-smart-chain",
    // 61: "ETH",
    // 100: "xdai",
    137: "polygon",
    250: "fantom",
    // 314: "FIL",
    // 1284: "mobm",
    1285: "moonriver",
    // 2222: "kava",
    // 5000: "MNT",
    // 7700: "canto",
    // 8453: "ETH",
    42161: "arbitrum",
    42220: "celo",
    43114: "avalanche",
    // 59144: "ETH",
    // Add more chainId-rpcUrl mappings here as needed
  };

  return chainIdsToZapperNetworks[chainId] || null;
};

export const getMoralisChainId = (chainId) => {
  const chainIdsToMoralisChainId = {
    1: EvmChain.ETHEREUM,
    10: EvmChain.OPTIMISM,
    25: EvmChain.CRONOS,
    56: EvmChain.BSC,
    // 61: "ETH",
    // 100: "xdai",
    137: EvmChain.POLYGON,
    250: EvmChain.FANTOM,
    // 314: "FIL",
    // 1284: "mobm",
    // 1285: "moonriver",
    // 2222: "kava",
    // 5000: "MNT",
    // 7700: "canto",
    // 8453: "ETH",
    42161: EvmChain.ARBITRUM,
    // 42220: "celo",
    43114: EvmChain.AVALANCHE,
    // 59144: "ETH",
    // Add more chainId-rpcUrl mappings here as needed
  };

  return chainIdsToMoralisChainId[chainId] || null;
};

export const getUserOwnedTokens = async (chainId, account) => {
  const ownedTokens = [];
  try {
    const queryParams = new URLSearchParams({
      id: account,
      chain_id: getDebankChainId(chainId),
      is_all: false,
    });
    const { data } = await axios.get(
      `https://pro-openapi.debank.com/v1/user/token_list?${queryParams}`,
      {
        headers: { AccessKey: process.env.DEBANK_ACCESS_KEY },
      }
    );
    ownedTokens.push(...data.map((token) => token.symbol));
  } catch {
    console.log("Failed to get user's token list from Debank");
  }

  try {
    const headers = {
      accept: "*/*",
      Authorization: `Basic ${Buffer.from(
        `${process.env.ZAPPER_API_KEY}:`,
        "binary"
      ).toString("base64")}`,
    };
    const queryParams = new URLSearchParams({
      "addresses[]": [account],
      network: getZapperNetwork(chainId),
    });
    const { data } = await axios.get(
      `https://api.zapper.xyz/v2/balances/tokens?${queryParams}`,
      { headers }
    );
    const newTokens = (data[account.toLowerCase()] || []).map(
      ({ token }) => token.symbol
    );
    newTokens.map((token) => {
      if (!ownedTokens.includes(token)) {
        ownedTokens.push(token);
      }
    });
  } catch (err) {
    console.log("Failed to get user's token list from Zapper");
    console.log(err);
  }

  if (chainId === 1) {
    try {
      const newTokens = [];
      let page = 1;
      while (true) {
        try {
          let queryParams = new URLSearchParams({
            module: "account",
            action: "addresstokenbalance",
            address: account,
            page,
            offset: 500,
            apikey: process.env.ETHERSCAN_API_KEY,
          });
          const { data } = await axios.get(
            `https://api.etherscan.io/api?${queryParams}`
          );
          const tokens = data.result.map(({ TokenSymbol }) => TokenSymbol);
          newTokens.push(...tokens);
          page++;
          if (tokens.length < 500) break;
        } catch {
          break;
        }
      }
      newTokens.map((token) => {
        if (!ownedTokens.includes(token)) {
          ownedTokens.push(token);
        }
      });
    } catch (err) {
      console.log("Failed to get user's token list from Etherscan");
      console.log(err);
    }
  }

  try {
    const moralisChainId = getMoralisChainId(chainId);
    if (moralisChainId) {
      const response = await Moralis.EvmApi.token.getWalletTokenBalances({
        address: account,
        chain: getMoralisChainId(chainId),
      });
      const newTokens = response.toJSON().map(({ symbol }) => symbol);
      newTokens.map((token) => {
        if (!ownedTokens.includes(token)) {
          ownedTokens.push(token);
        }
      });
    }
  } catch (err) {
    console.log("Failed to get user's token list from Moralis");
    console.log(err);
  }

  const nativeTokenSymbol = getNativeTokenSymbolForChain(chainId);
  if (!ownedTokens.includes(nativeTokenSymbol)) {
    const rpcUrl = getRpcUrlForChain(chainId);
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);
    const balance = await provider.getBalance(account);
    if (balance.gt(0)) {
      ownedTokens.push(nativeTokenSymbol);
    }
  }

  return ownedTokens;
};

export const getApproveData = async (
  provider,
  tokenAddress,
  amount,
  owner,
  spender
) => {
  try {
    const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const allowance = await token.allowance(owner, spender);
    const txs = [];
    if (allowance.lt(amount)) {
      const symbol = await token.symbol();
      if (symbol === "USDT" && !allowance.eq(0)) {
        const data = token.interface.encodeFunctionData("approve", [
          spender,
          0,
        ]);
        txs.push({
          to: tokenAddress,
          value: "0",
          data,
        });
      }
      const data = token.interface.encodeFunctionData("approve", [
        spender,
        amount,
      ]);
      txs.push({
        to: tokenAddress,
        value: "0",
        data,
      });
    }
    return txs;
  } catch (err) {
    console.log("Approve failed", err);
    return [];
  }
};

export const getTokenAddressForChain = async (symbol, chainName) => {
  if (typeof symbol !== "string" || symbol.trim() === "") {
    console.error("Invalid token symbol");
    throw new Error("Invalid token symbol");
  }
  if (typeof chainName !== "string" || chainName.trim() === "") {
    console.error("Invalid chain name");
    throw new Error("Invalid chain name");
  }

  const symbolUp = symbol.toUpperCase();

  let data;

  // find most similar token address via cmc
  const chainNameForCMC =
    chainName === "" ? null : getChainNameForCMC(chainName);
  if (chainNameForCMC) {
    const CMC_API_ENDPOINT =
      "https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?symbol=";
    const headers = { "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY };
    let response;
    let price;
    try {
      response = await axios.get(CMC_API_ENDPOINT + symbolUp, { headers });
      price = (await getCoinData(symbol)).price;
    } catch (_) {}

    if (response && response.data.data[symbolUp].length > 0) {
      const target = response.data.data[symbolUp][0].contract_address.find(
        (x) => x.platform?.name === chainNameForCMC
      );
      if (target) {
        data = {
          name: target.platform.name,
          address: target.contract_address,
          price,
        };
      } else if (!response.data.data[symbolUp][0].platform) {
        data = {
          name: response.data.data[symbolUp][0].name,
          address: NATIVE_TOKEN,
          price,
        };
      }
    }
    if (data && data.address.toLowerCase() === NATIVE_TOKEN2.toLowerCase())
      data.address = NATIVE_TOKEN;
  }

  // find most similar token address via cgc
  const chainNameForCGC =
    chainName === "" ? null : getChainNameForCGC(chainName);
  if (chainNameForCGC) {
    let response;
    const CGC_API_ENDPOINT = "https://api.coingecko.com/api/v3/coins/";
    try {
      response = await axios.get(CGC_API_ENDPOINT + "list");
    } catch (_) {}
    const tokens = (response?.data || []).filter(
      (x) => x.symbol.toLowerCase() === symbol.toLowerCase()
    );
    const token = tokens.find(
      (x) => x.id.replace("-", " ").toLowerCase() === x.name.toLowerCase()
    );
    if (token) {
      try {
        response = await axios.get(CGC_API_ENDPOINT + token.id);
      } catch (_) {
        response = undefined;
      }
      if (response && response.data) {
        if (response.data.asset_platform_id) {
          const address = response.data.platforms[chainNameForCGC];
          if (
            address &&
            data &&
            data.address.toLowerCase() === address.toLowerCase()
          ) {
            // matches cmc with cgc
          } else data = undefined;
        } else if (!data) {
          data = { name: response.data.name, address: NATIVE_TOKEN };
        }
      }
    }
  }
  return data;
};

export const getFunctionData = async (
  address,
  abi,
  provider,
  funcName,
  params,
  value
) => {
  const contract = new ethers.Contract(address, abi);
  const data = contract.interface.encodeFunctionData(funcName, params);
  const transactionDetails = {
    to: address,
    value,
    data,
  };
  return transactionDetails;
};

/**
 *
 * @param address token address
 * @param user account address
 * @param amount token amount string
 *        - if undefined, return token balance of account address
 *        - if non-zero value, return token amount string in type of bignumber
 *        - in else cases (e.g. 0 or '' or 'all', etc.) return token balance of account address
 * @returns
 */
export const getTokenAmount = async (address, provider, user, amount) => {
  let token;
  let decimals = 18;
  let _amount;
  if (address !== NATIVE_TOKEN) {
    token = new ethers.Contract(address, ERC20_ABI, provider);
    decimals = await token.decimals();
  }

  if (
    amount === undefined ||
    parseFloat(amount) === 0 ||
    isNaN(parseFloat(amount))
  ) {
    if (address === NATIVE_TOKEN) {
      _amount = await provider.getBalance(user);
      if (amount !== undefined) _amount = _amount.sub(utils.parseEther("0.02"));
    } else _amount = await token.balanceOf(user);
  } else {
    if (address === NATIVE_TOKEN) _amount = utils.parseEther(amount);
    else _amount = utils.parseUnits(amount, decimals);
  }
  return { amount: _amount, decimals };
};

export const simulateActions = async (
  actions,
  conditions,
  address,
  connectedChainName
) => {
  let prevChainName = connectedChainName;

  // fill protocol name
  const nonProtocolNames = ["swap", "bridge", "transfer"];
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    if (nonProtocolNames.includes(action.name)) continue;

    if ((action.args["protocolName"] || "") === "") {
      if (i > 0)
        actions[i].args["protocolName"] = actions[i - 1].args["protocolName"];
      else actions[i].args["protocolName"] = "all";
    }
  }

  // fill amount properly
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const chainName = (
      action.args["chainName"] ||
      action.args["sourceChainName"] ||
      prevChainName
    ).toLowerCase();
    prevChainName = chainName;
    const chainId = getChainIdFromName(chainName);

    let token = action.args["token"] || action.args["inputToken"];
    if (((token || "") === "" && i === 0) || token === "all") {
      const tokens = await getUserOwnedTokens(chainId, address);
      actions.splice(
        i,
        1,
        ...tokens.map((token) => ({
          ...action,
          args: { ...action.args, token, inputToken: token },
        }))
      );
      i--;
      continue;
    }
    if (token === "LP") {
      const outputToken = i > 0 && actions[i - 1].args["outputToken"];
      if (outputToken) {
        actions.splice(i, 1, {
          ...action,
          args: {
            ...action.args,
            token: outputToken,
            inputToken: outputToken,
          },
        });
        i--;
        continue;
      }
      token = "";
    }
    if ((token || "") === "" || token === "outputToken") {
      if (action.args["poolName"]) {
        token = action.args["poolName"].split("-")[0];
      } else {
        if (conditions[i - 1] && conditions[i - 1].name === "condition")
          token = conditions[i - 1].body.subject
            .replace("price", "")
            .replace("market", "")
            .replace("cap", "")
            .replace("balance", "")
            .replace(" ", "")
            .replace("_", "");
        else
          token =
            actions[i - 1].args["token"] || actions[i - 1].args["outputToken"];
      }
      actions.splice(i, 1, {
        ...action,
        args: { ...action.args, token, inputToken: token },
      });
      i--;
      continue;
    }

    const amount = action.args["amount"] || action.args["inputAmount"];
    if (
      ((amount === "" || !amount) && i === 0) ||
      amount === "all" ||
      amount === "half"
    ) {
      let newAmount;
      const tokenInfo = await getTokenAddressForChain(token, chainName);
      if (
        tokenInfo.address === NATIVE_TOKEN ||
        tokenInfo.address === NATIVE_TOKEN2
      ) {
        let ethBalance = await getEthBalanceForUser(chainId, address);
        const gasAmount = chainId === 1 ? "0.01" : "0.005";
        ethBalance = ethBalance.sub(utils.parseEther(gasAmount));
        newAmount = utils.formatEther(
          amount === "half" ? ethBalance.div(2) : ethBalance
        );
      } else {
        const rpcUrl = getRpcUrlForChain(chainId);
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);
        const contract = new ethers.Contract(
          tokenInfo.address,
          ERC20_ABI,
          provider
        );
        const tokenBalance = await contract.balanceOf(address);
        const decimals = await contract.decimals();
        newAmount = utils.formatUnits(
          amount === "half" ? tokenBalance.div(2) : tokenBalance,
          decimals
        );
      }
      if (action.args["amount"]) action.args["amount"] = newAmount;
      else action.args["inputAmount"] = newAmount;
    }
  }

  const tempActions = JSON.parse(JSON.stringify(actions));
  const transactionsList = [];

  // Check for gas
  let prevAction = tempActions[0];
  prevChainName = (
    prevAction.args["chainName"] ||
    prevAction.args["sourceChainName"] ||
    prevChainName
  ).toLowerCase();
  let prevChainId = getChainIdFromName(prevChainName);
  let i = 1;
  while (i < tempActions.length) {
    const curAction = tempActions[i];
    const curChainName = (
      curAction.args["chainName"] ||
      curAction.args["sourceChainName"] ||
      prevChainName
    ).toLowerCase();
    const curChainId = getChainIdFromName(curChainName);
    if (prevChainId === curChainId) {
      prevAction = curAction;
      i++;
      continue;
    }

    const token = (
      curAction.args["token"] || curAction.args["inputToken"]
    ).toLowerCase();
    const amount = curAction.args["amount"] || curAction.args["inputAmount"];
    const ethBalance = await getEthBalanceForUser(curChainId, address);
    if (ethBalance.eq(0)) {
      let gasAmount = curChainId === 1 ? "0.2" : "0.1";
      if (
        prevAction.name === "bridge" &&
        prevAction.args["destinationChainName"].toLowerCase() ===
          curChainName &&
        prevAction.args["token"].toLowerCase() === "eth"
      ) {
        tempActions[i - 1].args["amount"] = (
          parseFloat(tempActions[i - 1].args["amount"]) + parseFloat(gasAmount)
        ).toString();
      } else {
        tempActions.splice(i, 0, {
          name: "bridge",
          args: {
            accountAddress: address,
            sourceChainName: prevChainName,
            destinationChainName: curChainName,
            token: getNativeTokenSymbolForChain(prevChainName),
            amount: gasAmount,
          },
        });
        i++;
      }
    }
    if (token !== "eth") {
      const rpcUrl = getRpcUrlForChain(curChainId);
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl, curChainId);
      const tokenInfo = await getTokenAddressForChain(token, curChainName);
      const contract = new ethers.Contract(
        tokenInfo.address,
        ERC20_ABI,
        provider
      );
      const decimals = await contract.decimals();
      const balance = await contract.balanceOf(address);
      if (amount && balance.lt(utils.parseUnits(amount, decimals))) {
        if (
          prevAction.name === "bridge" &&
          prevAction.args["destinationChainName"].toLowerCase() ===
            curChainName &&
          prevAction.args["token"].toLowerCase() === token
        ) {
          if (
            parseFloat(tempActions[i - 1].args["amount"]) +
              parseFloat(utils.formatUnits(balance, decimals)) <
            parseFloat(amount)
          ) {
            tempActions[i - 1].args["amount"] = Math.max(
              parseFloat(tempActions[i - 1].args["amount"]),
              parseFloat(amount) -
                parseFloat(utils.formatUnits(balance, decimals))
            ).toString();
          }
        } else {
          tempActions.splice(i, 0, {
            name: "bridge",
            args: {
              accountAddress: address,
              sourceChainName: prevChainName,
              destinationChainName: curChainName,
              token: token,
              amount: amount,
            },
          });
          i++;
        }
      }
    }

    prevAction = curAction;
    prevChainName = curChainName;
    prevChainId = curChainId;
    i++;
  }

  prevChainName = (
    prevAction.args["chainName"] ||
    prevAction.args["sourceChainName"] ||
    connectedChainName
  ).toLowerCase();
  const state_objects = {};
  for (let i = 0; i < tempActions.length; i++) {
    const action = tempActions[i];
    let token;
    let chainName;

    try {
      const body = fillBody(action.args, address, prevChainName);
      const sourceChainName =
        action.args["sourceChainName"] ||
        action.args["chainName"] ||
        prevChainName;
      const chainId = getChainIdFromName(sourceChainName);
      if (action.name === "swap" || action.name === "bridge") {
        if (i < tempActions.length - 1) {
          token = action.args["outputToken"] || action.args["token"];
          chainName =
            action.args["destinationChainName"] ||
            action.args["chainName"] ||
            prevChainName;
        }
      }
      prevChainName = sourceChainName;

      let txs;
      switch (action.name) {
        case "swap": {
          const { message, transactions } = await getSwapTx(body, true);
          if (message) return { success: false, message };
          txs = transactions;
          break;
        }
        case "bridge": {
          const { message, transactions } = await getBridgeTx(body, true);
          if (message) return { success: false, message };
          txs = transactions;
          break;
        }
        case "transfer": {
          const { message, transactions } = await getTransferTx(body, true);
          if (message) return { success: false, message };
          txs = transactions;
          break;
        }
        case "deposit": {
          const { message, transactions } = await getDepositTx(body);
          if (message) return { success: false, message };
          txs = transactions;
          break;
        }
        case "withdraw": {
          const { message, transactions } = await getWithdrawTx(body);
          if (message) return { success: false, message };
          txs = transactions;
          break;
        }
        case "claim": {
          const { message, transactions } = await getClaimTx(body);
          if (message) return { success: false, message };
          txs = transactions;
          break;
        }
        case "borrow": {
          const { message, transactions } = await getBorrowTx(body);
          if (message) return { success: false, message };
          txs = transactions;
          break;
        }
        case "lend": {
          const { message, transactions } = await getLendTx(body);
          if (message) return { success: false, message };
          txs = transactions;
          break;
        }
        case "repay": {
          const { message, transactions } = await getRepayTx(body);
          if (message) return { success: false, message };
          txs = transactions;
          break;
        }
        case "stake": {
          const { message, transactions } = await getStakeTx(body);
          if (message) return { success: false, message };
          txs = transactions;
          break;
        }
        case "unstake": {
          const { message, transactions } = await getUnstakeTx(body);
          if (message) return { success: false, message };
          txs = transactions;
          break;
        }
        case "long": {
          const { message, transactions } = await getLongTx(body);
          if (message) return { success: false, message };
          txs = transactions;
          break;
        }
        case "short": {
          const { message, transactions } = await getShortTx(body);
          if (message) return { success: false, message };
          txs = transactions;
          break;
        }
        case "lock": {
          const { message, transactions } = await getLockTx(body);
          if (message) return { success: false, message };
          txs = transactions;
          break;
        }
        case "unlock": {
          const { message, transactions } = await getUnlockTx(body);
          if (message) return { success: false, message };
          txs = transactions;
          break;
        }
        case "vote": {
          const { message, transactions } = await getVoteTx(body);
          if (message) return { success: false, message };
          txs = transactions;
          break;
        }
      }

      transactionsList.push(txs);

      const rpcUrl = getRpcUrlForChain(chainId);
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);
      const { data: res } = await axios.post(
        `https://api.tenderly.co/api/v1/account/${process.env.TENDERLY_USER}/project/${process.env.TENDERLY_PROJECT}/simulate-bundle`,
        {
          simulations: txs.map(({ to, value, data }) => ({
            network_id: chainId,
            block_number: -1,
            save: true,
            save_if_fails: true,
            simulation_type: "full",
            from: address,
            to,
            value,
            input: data,
            state_objects: state_objects[chainId],
          })),
        },
        { headers: { "X-Access-Key": process.env.TENDERLY_ACCESS_KEY } }
      );
      const length = res.simulation_results.length;
      for (let j = 0; j < length; j++) {
        if (!res.simulation_results[j].transaction.status) {
          return {
            success: false,
            message: res.simulation_results[j].transaction.error_message,
          };
        }
      }

      if (!token) continue;

      let amount;
      if (token && chainName) {
        let _token = await getTokenAddressForChain(token, chainName);
        if (!_token)
          return { success: false, message: "Token not found on given chain" };
        _token = _token.address.toLowerCase();
        const tokenContract = new Contract(_token, ERC20_ABI, provider);

        const nextAction = tempActions[i + 1];
        if (!nextAction) continue;

        if (action.name === "swap") {
          const { logs } =
            res.simulation_results[length - 1].transaction.transaction_info;
          for (let k = 0; k < logs.length; k++) {
            const { raw: log } = logs[k];
            if (
              log.topics[0] ===
                "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef" &&
              log.address.toLowerCase() === _token
            ) {
              const [to] = utils.defaultAbiCoder.decode(
                ["address"],
                log.topics[2]
              );
              if (to.toLowerCase() === address?.toLowerCase()) {
                const [value] = utils.defaultAbiCoder.decode(
                  ["uint256"],
                  log.data
                );
                const decimals = await tokenContract.decimals();
                const amt = utils.formatUnits(value, decimals);
                amount = amt.toString();
                break;
              }
            }
          }
        } else if (
          action.name === "bridge" &&
          (
            nextAction.args["sourceChainName"] || nextAction.args["chainName"]
          ).toLowerCase() === chainName.toLowerCase() &&
          (action.args["token"].toLowerCase() ===
            nextAction.args["token"].toLowerCase() ||
            action.args["token"].toLowerCase() ===
              nextAction.args["inputToken"].toLowerCase())
        ) {
          amount = body["amount"];
        }

        if (action.name === "bridge") {
          const destChainId = getChainIdFromName(
            action.args["destinationChainName"]
          );

          const destToken = await getTokenAddressForChain(
            action.args["token"],
            action.args["destinationChainName"]
          );
          const destRpcUrl = getRpcUrlForChain(destChainId);
          const destProvider = new ethers.providers.JsonRpcProvider(
            destRpcUrl,
            destChainId
          );
          const destTokenContract = new Contract(
            destToken.address,
            ERC20_ABI,
            destProvider
          );
          const curBalance = await destTokenContract.balanceOf(address);
          const decimals = await destTokenContract.decimals();
          const newBalance = curBalance.add(utils.parseUnits(amount, decimals));
          const balanceSlot = getBalanceSlotForToken(
            destChainId,
            destToken.address
          );
          const slot = utils.keccak256(
            utils.concat([
              utils.hexZeroPad(address, 32),
              utils.hexZeroPad(BigNumber.from(balanceSlot).toHexString(), 32),
            ])
          );
          if (!state_objects[destChainId]) {
            state_objects[destChainId] = {};
          }
          state_objects[destChainId] = Object.assign(
            state_objects[destChainId],
            {
              [destToken.address.toLowerCase()]: {
                storage: {
                  [slot]: utils.hexZeroPad(newBalance.toHexString(), 32),
                },
              },
            }
          );
        }
      }

      if (isNaN(parseFloat(nextAction.args["inputAmount"] || "")))
        tempActions[i + 1].args["inputAmount"] = amount;
      if (isNaN(parseFloat(nextAction.args["amount"] || "")))
        tempActions[i + 1].args["amount"] = amount;
    } catch (err) {
      console.log("Simulate error:", err.message, err.response.data);
      return { success: false, message: err.message };
    }
  }
  return { success: true, transactionsList, actions };
};

export const fillBody = (body, address, chainName = "Ethereum") => {
  const result = { ...body };
  if (address) {
    result["accountAddress"] = address;
  }
  if ((result["chainName"] || "") === "") {
    result["chainName"] = chainName.toLowerCase();
  }
  if ((result["sourceChainName"] || "") === "") {
    result["sourceChainName"] = chainName.toLowerCase();
  }
  if ((result["destinationChainName"] || "") === "") {
    result["destinationChainName"] = chainName.toLowerCase();
  }
  if (result["action"]) {
    result["action"] = result["action"].toLowerCase();
  }
  return result;
};

const getTokenProxy = (chainId) => {
  const chainIdsToParaswapTokenProxy = {
    1: "0x216b4b4ba9f3e719726886d34a177484278bfcae",
    137: "0x216b4b4ba9f3e719726886d34a177484278bfcae",
    56: "0x216b4b4ba9f3e719726886d34a177484278bfcae",
    43114: "0x216b4b4ba9f3e719726886d34a177484278bfcae",
    42161: "0x216b4b4ba9f3e719726886d34a177484278bfcae",
    10: "0x216b4b4ba9f3e719726886d34a177484278bfcae",
    1101: "0xc8a21fcd5a100c3ecc037c97e2f9c53a8d3a02a1",
  };

  return chainIdsToParaswapTokenProxy[chainId] || null;
};

export const getSwapTx = async (data, ignoreBalanceCheck = false) => {
  try {
    const {
      accountAddress,
      protocolName,
      poolName,
      chainName,
      inputAmount,
      inputToken,
      outputToken,
      slippage,
    } = data;
    if (protocolName) {
      const { transactions, error } = await getSwapData(
        accountAddress,
        protocolName,
        chainName,
        poolName,
        inputToken,
        inputAmount,
        outputToken,
        slippage
      );
      if (error) {
        return { status: "error", message: error };
      } else {
        return { status: "success", transactions };
      }
    }
    const chainId = getChainIdFromName(chainName);
    if (!chainId) {
      throw new Error("Invalid chain name: " + chainName);
    }

    const _inputToken = await getTokenAddressForChain(inputToken, chainName);
    if (!_inputToken) {
      return {
        status: "error",
        message: "Token not found on the specified chain.",
      };
    }
    const _outputToken = await getTokenAddressForChain(outputToken, chainName);
    if (!_outputToken) {
      return {
        status: "error",
        message: "Token not found on the specified chain.",
      };
    }

    // Step 1: Check user balance on the given chain (Web3.js required)
    const rpcUrl = getRpcUrlForChain(chainId);
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);
    const { amount: balance, decimals } = await getTokenAmount(
      _inputToken.address,
      provider,
      accountAddress
    );
    const { amount: _inputAmount } = await getTokenAmount(
      _inputToken.address,
      provider,
      accountAddress,
      inputAmount
    );
    const { decimals: outDecimals } = await getTokenAmount(
      _outputToken.address,
      provider,
      accountAddress
    );
    if (!ignoreBalanceCheck && balance.lt(_inputAmount)) {
      throw new Error("Insufficient balance");
    }

    // Step 2: Get best swap route
    // might need to multiply gasPrice by 1.1 or something to avoid failure due to gas spike later
    const gasPrice = await provider.getGasPrice();
    const { tx, source } = await getBestSwapRoute(
      chainId,
      accountAddress,
      {
        address: _inputToken.address,
        symbol: inputToken,
        decimals,
        price: _inputToken.price,
      },
      {
        address: _outputToken.address,
        symbol: outputToken,
        decimals: outDecimals,
        price: _outputToken.price,
      },
      _inputAmount,
      gasPrice,
      slippage
    );

    // Step 3: Parse the response and extract relevant information for the transaction
    if (!tx) {
      throw new Error("No swap route found");
    }

    // Step 4: Check user allowance and approve if necessary (Web3.js required)
    const transactions = [];
    if (_inputToken.address != NATIVE_TOKEN) {
      const tokenProxy = getTokenProxy(chainId);
      if (source === "paraswap" && !tokenProxy)
        throw new Error("No token proxy for the specified chain.");
      const approveTxs = await getApproveData(
        provider,
        _inputToken.address,
        _inputAmount,
        accountAddress,
        source !== "paraswap" ? tx.to : tokenProxy
      );
      transactions.push(...approveTxs);
    }

    // Step 5: Return the transaction details to the client
    transactions.push(tx);
    return { status: "success", transactions };
  } catch (err) {
    console.log("Swap error:", err);
    return { status: "error", message: "Bad request" };
  }
};

export const getBridgeTx = async (data, ignoreBalanceCheck = false) => {
  try {
    const {
      accountAddress,
      protocolName,
      sourceChainName,
      destinationChainName,
      token,
      amount,
    } = data;
    if (protocolName) {
      const { transactions, error } = await getBridgeData(
        accountAddress,
        protocolName,
        sourceChainName,
        destinationChainName,
        token,
        amount
      );
      if (error) {
        return { status: "error", message: error };
      } else {
        return { status: "success", transactions };
      }
    }
    const sourceChainId = getChainIdFromName(sourceChainName);
    if (!sourceChainId) {
      throw new Error("Invalid chain name: " + sourceChainName);
    }
    const destinationChainId = getChainIdFromName(destinationChainName);
    if (!destinationChainId) {
      throw new Error("Invalid chain name: " + destinationChainName);
    }

    const _token = await getTokenAddressForChain(token, sourceChainName);
    if (!_token) {
      return {
        status: "error",
        message: "Token not found on the specified chain.",
      };
    }
    let _outputToken = await getTokenAddressForChain(
      token,
      destinationChainName
    );
    if (!_outputToken) {
      return {
        status: "error",
        message: "Token not found on the specified chain.",
      };
    }

    // Step 1: Check user balance on the source chain (Web3.js required)
    const rpcUrl = getRpcUrlForChain(sourceChainId);
    const provider = new ethers.providers.JsonRpcProvider(
      rpcUrl,
      sourceChainId
    );
    const { amount: balance, decimals } = await getTokenAmount(
      _token.address,
      provider,
      accountAddress
    );
    const { amount: _amount } = await getTokenAmount(
      _token.address,
      provider,
      accountAddress,
      amount
    );
    if (!ignoreBalanceCheck && balance.lt(_amount)) {
      throw new Error("Insufficient balance");
    }

    // Step 2: Make an HTTP request to Metamask Bridge API
    const result = await getBestBridgeRoute(
      sourceChainId,
      destinationChainId,
      accountAddress,
      {
        address: _token.address,
        symbol: token,
        decimals,
      },
      {
        address: _outputToken.address,
        symbol: token,
      },
      _amount
    );

    // Step 3: Parse the response and extract relevant information for the bridge transaction
    if (!result) {
      throw new Error("No bridge route found");
    }

    let transactions = [];

    // Step 4: Check user allowance and approve if necessary (Web3.js required)
    if (_token.address != NATIVE_TOKEN) {
      const approveTxs = await getApproveData(
        provider,
        _token.address,
        _amount,
        accountAddress,
        result.to
      );
      transactions.push(...approveTxs);
    }

    // Step 5: Return the transaction details to the client
    transactions.push({
      to: result.to,
      value: result.value,
      data: result.data,
    });

    return { status: "success", transactions };
  } catch (err) {
    console.log("Bridge error:", err);
    return { status: "error", message: "Bad request" };
  }
};

export const getDepositTx = async (data) => {
  try {
    const { accountAddress, protocolName, chainName, poolName, token, amount } =
      data;
    const { transactions, error } = await getDepositData(
      accountAddress,
      protocolName,
      chainName,
      poolName,
      token,
      amount
    );
    if (error) {
      return { status: "error", message: error };
    } else {
      return { status: "success", transactions };
    }
  } catch (err) {
    console.log("Protocol error:", err);
    return { status: "error", message: "Bad request" };
  }
};

export const getWithdrawTx = async (data) => {
  try {
    const { accountAddress, protocolName, chainName, poolName, token, amount } =
      data;
    const { transactions, error } = await getWithdrawData(
      accountAddress,
      protocolName,
      chainName,
      poolName,
      token,
      amount
    );
    if (error) {
      return { status: "error", message: error };
    } else {
      return { status: "success", transactions };
    }
  } catch (err) {
    console.log("Protocol error:", err);
    return { status: "error", message: "Bad request" };
  }
};

export const getClaimTx = async (data) => {
  try {
    const { accountAddress, protocolName, chainName, poolName } = data;
    const { transactions, error } = await getClaimData(
      accountAddress,
      protocolName,
      chainName,
      poolName
    );
    if (error) {
      return { status: "error", message: error };
    } else {
      return { status: "success", transactions };
    }
  } catch (err) {
    console.log("Protocol error:", err);
    return { status: "error", message: "Bad request" };
  }
};

export const getBorrowTx = async (data) => {
  try {
    const { accountAddress, protocolName, chainName, poolName, token, amount } =
      data;
    const { transactions, error } = await getBorrowData(
      accountAddress,
      protocolName,
      chainName,
      poolName,
      token,
      amount
    );
    if (error) {
      return { status: "error", message: error };
    } else {
      return { status: "success", transactions };
    }
  } catch (err) {
    console.log("Protocol error:", err);
    return { status: "error", message: "Bad request" };
  }
};

export const getLendTx = async (data) => {
  try {
    const { accountAddress, protocolName, chainName, poolName, token, amount } =
      data;
    const { transactions, error } = await getLendData(
      accountAddress,
      protocolName,
      chainName,
      poolName,
      token,
      amount
    );
    if (error) {
      return { status: "error", message: error };
    } else {
      return { status: "success", transactions };
    }
  } catch (err) {
    console.log("Protocol error:", err);
    return { status: "error", message: "Bad request" };
  }
};

export const getRepayTx = async (data) => {
  try {
    const { accountAddress, protocolName, chainName, poolName, token, amount } =
      data;
    const { transactions, error } = await getRepayData(
      accountAddress,
      protocolName,
      chainName,
      poolName,
      token,
      amount
    );
    if (error) {
      return { status: "error", message: error };
    } else {
      return { status: "success", transactions };
    }
  } catch (err) {
    console.log("Protocol error:", err);
    return { status: "error", message: "Bad request" };
  }
};

export const getStakeTx = async (data) => {
  try {
    const { accountAddress, protocolName, chainName, token, amount } = data;
    const { transactions, error } = await getStakeData(
      accountAddress,
      protocolName,
      chainName,
      token,
      amount
    );
    if (error) {
      return { status: "error", message: error };
    } else {
      return { status: "success", transactions };
    }
  } catch (err) {
    console.log("Protocol error:", err);
    return { status: "error", message: "Bad request" };
  }
};

export const getUnstakeTx = async (data) => {
  try {
    const { accountAddress, protocolName, chainName, token, amount } = data;
    const { transactions, error } = await getUnstakeData(
      accountAddress,
      protocolName,
      chainName,
      token,
      amount
    );
    if (error) {
      return { status: "error", message: error };
    } else {
      return { status: "success", transactions };
    }
  } catch (err) {
    console.log("Protocol error:", err);
    return { status: "error", message: "Bad request" };
  }
};

export const getLongTx = async (data) => {
  try {
    const {
      accountAddress,
      protocolName,
      chainName,
      inputToken,
      inputAmount,
      outputToken,
      leverageMultiplier,
    } = data;
    const { transactions, error } = await getLongData(
      accountAddress,
      protocolName,
      chainName,
      inputToken,
      inputAmount,
      outputToken,
      leverageMultiplier
    );
    if (error) {
      return { status: "error", message: error };
    } else {
      return { status: "success", transactions };
    }
  } catch (err) {
    console.log("Protocol error:", err);
    return { status: "error", message: "Bad request" };
  }
};

export const getShortTx = async (data) => {
  try {
    const {
      accountAddress,
      protocolName,
      chainName,
      inputToken,
      inputAmount,
      outputToken,
      leverageMultiplier,
    } = data;
    const { transactions, error } = await getShortData(
      accountAddress,
      protocolName,
      chainName,
      inputToken,
      inputAmount,
      outputToken,
      leverageMultiplier
    );
    if (error) {
      return { status: "error", message: error };
    } else {
      return { status: "success", transactions };
    }
  } catch (err) {
    console.log("Protocol error:", err);
    return { status: "error", message: "Bad request" };
  }
};

export const getLockTx = async (data) => {
  try {
    const { accountAddress, protocolName, chainName, token, amount } = data;
    const { transactions, error } = await getLockData(
      accountAddress,
      protocolName,
      chainName,
      token,
      amount
    );
    if (error) {
      return { status: "error", message: error };
    } else {
      return { status: "success", transactions };
    }
  } catch (err) {
    console.log("Protocol error:", err);
    return { status: "error", message: "Bad request" };
  }
};

export const getUnlockTx = async (data) => {
  try {
    const { accountAddress, protocolName, chainName, token, amount } = data;
    const { transactions, error } = await getUnlockData(
      accountAddress,
      protocolName,
      chainName,
      token,
      amount
    );
    if (error) {
      return { status: "error", message: error };
    } else {
      return { status: "success", transactions };
    }
  } catch (err) {
    console.log("Protocol error:", err);
    return { status: "error", message: "Bad request" };
  }
};

export const getVoteTx = async (data) => {
  try {
    const { accountAddress, protocolName, chainName, poolName } = data;
    const { transactions, error } = await getVoteData(
      accountAddress,
      protocolName,
      chainName,
      poolName
    );
    if (error) {
      return { status: "error", message: error };
    } else {
      return { status: "success", transactions };
    }
  } catch (err) {
    console.log("Protocol error:", err);
    return { status: "error", message: "Bad request" };
  }
};

export const getTransferTx = async (data, ignoreBalanceCheck = false) => {
  try {
    const { accountAddress, token, amount, recipient, chainName } = data;

    const chainId = getChainIdFromName(chainName);
    if (!chainId) {
      throw new Error("Invalid chain name: " + chainName);
    }

    const tokenInfo = await getTokenAddressForChain(token, chainName);
    if (!tokenInfo) {
      return {
        status: "error",
        message: "Token not found on the specified chain.",
      };
    }

    let _recipient = recipient;
    if (!ethers.utils.isAddress(recipient)) {
      // Retrieve the recipient address
      const rpcUrl = getRpcUrlForChain(1);
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl, 1);
      try {
        _recipient = await provider.resolveName(recipient);
      } catch {
        return {
          status: "error",
          message: "Invalid recipient provided.",
        };
      }
    }

    // Step 1: Check user balance on the chain (Web3.js required)
    const rpcUrl = getRpcUrlForChain(chainId);
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);
    const { amount: balance } = await getTokenAmount(
      tokenInfo.address,
      provider,
      accountAddress
    );
    const { amount: _amount } = await getTokenAmount(
      tokenInfo.address,
      provider,
      accountAddress,
      amount
    );
    if (!ignoreBalanceCheck && balance.lt(_amount)) {
      throw new Error("Insufficient balance");
    }

    // Step 2: Return the transaction details to the client
    let to = _recipient;
    let txData = "0x";
    let value = _amount;
    if (tokenInfo.address != NATIVE_TOKEN) {
      const _token = new ethers.Contract(
        tokenInfo.address,
        ERC20_ABI,
        provider
      );
      to = tokenInfo.address;
      txData = _token.interface.encodeFunctionData("transfer", [
        _recipient,
        _amount,
      ]);
      value = 0;
    }
    const transactionDetails = {
      to,
      value: value.toString(),
      data: txData,
    };

    return { status: "success", transactions: [transactionDetails] };
  } catch (err) {
    console.log("Transfer error:", err);
    return { status: "error", message: "Bad request" };
  }
};

export const getTokenBalance = async (address, chainName, tokenName) => {
  try {
    const chainId = getChainIdFromName(chainName);
    if (!chainId) {
      throw new Error("Invalid chain name: " + chainName);
    }

    const token = await getTokenAddressForChain(tokenName, chainName);
    if (!token) return BigNumber.from("0");

    const rpcUrl = getRpcUrlForChain(chainId);
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);

    const { amount: balance } = await getTokenAmount(
      token.address,
      provider,
      accountAddress
    );
    return balance;
  } catch (err) {
    console.log("Balance error:", err);
    return BigNumber.from("0");
  }
};

export const getCoinData = async (symbol) => {
  const symbolUp = symbol.toUpperCase();
  try {
    const headers = { "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY };
    const { data } = await axios.get(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=${symbolUp}`,
      { headers }
    );
    return data.data[symbolUp][0].quote["USD"];
  } catch (e) {
    console.log("Error fetching price:", e?.response?.data || e);
    return {};
  }
};

export const findIntersection = async (arr1, arr2) => {
  const set1 = new Set(arr1.map((item) => item.toLowerCase()));
  const set2 = new Set(arr2.map((item) => item.toLowerCase()));
  const intersection = [...set1].filter((item) => set2.has(item));
  return intersection.map(
    (item) => arr1[arr1.findIndex((val) => val.toLowerCase() === item)]
  );
};
