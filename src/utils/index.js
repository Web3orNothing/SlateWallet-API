import axios from "axios";
import { BigNumber, ethers } from "ethers";
import { NATIVE_TOKEN, NATIVE_TOKEN2 } from "../constants.js";
import ERC20_ABI from "../abis/erc20.abi.js";

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
    // Add more chainName-platform on CMC mappings here as needed
  };

  return chainNamesForCMC[chainName.toLowerCase()] || null;
};

export const getChainNameForCGC = (chainName) => {
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
    // Add more chainName-platform on CGC mappings here as needed
  };

  return chainNamesForCGC[chainName.toLowerCase()] || null;
};

// Helper function to convert chainName to chainId
export const getChainIdFromName = (chainName) => {
  // TODO: Need to handle lower vs upper case and slightly different names (ex. ethereum vs Ethereum, BSC vs BinanceSmartChain, Binance vs BinanceSmartChain)
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

  return chainNamesToIds[chainName.toLowerCase()] || null;
};

export const getRpcUrlForChain = (chainId) => {
  const chainIdsToRpcUrls = {
    1: "https://rpc.mevblocker.io",
    10: "https://endpoints.omniatech.io/v1/op/mainnet/public",
    25: "https://cronos-evm.publicnode.com",
    56: "https://bsc-rpc.gateway.pokt.network",
    61: "https://etc.rivet.link",
    100: "https://rpc.gnosischain.com",
    137: "https://polygon-rpc.com",
    250: "https://rpc.fantom.network",
    314: "https://rpc.ankr.com/filecoin",
    1284: "https://rpc.api.moonbeam.network",
    1285: "https://rpc.api.moonriver.moonbeam.network",
    2222: "https://kava-evm.publicnode.com",
    5000: "https://rpc.mantle.xyz",
    7700: "https://canto.slingshot.finance",
    8453: "https://mainnet.base.org",
    42161: "https://endpoints.omniatech.io/v1/arbitrum/one/public",
    42220: "https://1rpc.io/celo",
    43114: "https://endpoints.omniatech.io/v1/avax/mainnet/public",
    59144: "https://rpc.linea.build",
    // Add more chainId-rpcUrl mappings here as needed
  };

  return chainIdsToRpcUrls[chainId] || null;
};

export const getFeeDataWithDynamicMaxPriorityFeePerGas = async (provider) => {
  let maxFeePerGas = null;
  let maxPriorityFeePerGas = null;
  let gasPrice = await provider.getGasPrice();

  const [block, eth_maxPriorityFeePerGas] = await Promise.all([
    await provider.getBlock("latest"),
    await provider.send("eth_maxPriorityFeePerGas", []),
  ]);

  if (block && block.baseFeePerGas) {
    maxPriorityFeePerGas = BigNumber.from(eth_maxPriorityFeePerGas);
    if (maxPriorityFeePerGas) {
      maxFeePerGas = block.baseFeePerGas.mul(2).add(maxPriorityFeePerGas);
    }
  }
  maxFeePerGas = parseInt(maxFeePerGas.toString());
  maxPriorityFeePerGas = parseInt(maxPriorityFeePerGas.toString());
  gasPrice = parseInt(gasPrice.toString());

  return { maxFeePerGas, maxPriorityFeePerGas, gasPrice };
};

// Helper function to get tokens on a chain
export const getTokensForChain = async (chainId) => {
  try {
    const response = await axios.get(
      `https://account.metafi.codefi.network/networks/${chainId}/tokens`,
      {
        headers: metamaskApiHeaders,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching tokens:", error);
    throw new Error("Failed to fetch tokens for the given chainId.");
  }
};

export const getApproveData = async (
  provider,
  tokenAddress,
  amount,
  owner,
  spender
) => {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const allowance = await token.allowance(owner, spender);
  if (allowance.lt(amount)) {
    const approveData = token.interface.encodeFunctionData("approve", [
      spender,
      amount,
    ]);
    const transactionDetails = {
      to: tokenAddress,
      value: "0",
      data: approveData,
      ...(await getFeeDataWithDynamicMaxPriorityFeePerGas(provider)),
    };
    return transactionDetails;
  }
};

export const getTokenAddressForChain = async (symbol, chainName) => {
  if (typeof symbol !== "string" || symbol.trim() === "") return undefined;
  if (typeof chainName !== "string" || chainName.trim() === "")
    return undefined;

  const symbolUp = symbol.toUpperCase();

  // find most similar token address via cmc
  const chainNameForCMC =
    chainName === "" ? null : getChainNameForCMC(chainName);
  const CMC_API_ENDPOINT =
    "https://pro-api.coinmarketcap.com/v2/cryptocurrency/info?symbol=";
  const headers = { "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY };
  let response;
  try {
    response = await axios.get(CMC_API_ENDPOINT + symbolUp, { headers });
  } catch (_) {}

  let data;
  if (response && response.data.data[symbolUp].length > 0) {
    if (chainNameForCMC) {
      const target = response.data.data[symbolUp][0].contract_address.find(
        (x) => x.platform?.name === chainNameForCMC
      );
      if (target)
        data = { name: target.platform.name, address: target.contract_address };
    } else {
      const addresses = response.data.data[symbolUp][0].contract_address || [];
      for (let i = 0; i < Math.min(address.length, 1); i++)
        data = {
          name: addresses[0].platform.name,
          address: addresses[0].contract_address,
        };
    }
  }
  if (data && data.address.toLowerCase() === NATIVE_TOKEN2.toLowerCase())
    data.address = NATIVE_TOKEN;

  // find most similar token address via cgc

  const CGC_API_ENDPOINT = "https://api.coingecko.com/api/v3/coins/";
  try {
    response = await axios.get(CGC_API_ENDPOINT + "list");
  } catch (_) {
    response = undefined;
  }
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
    if (response && response.data.asset_platform_id) {
      const address = response.data.platforms[getChainNameForCGC(chainName)];
      if (
        address &&
        data &&
        data.address.toLowerCase() === address.toLowerCase()
      ) {
        // matches cmc with cgc
      } else data = undefined;
    }
  }
  return data;
export const getFunctionData = async (
  address,
  abi,
  provider,
  funcName,
  params,
  value
) => {
  const contract = new ethers.Contract(address, abi, provider);
  const data = contract.interface.encodeFunctionData(funcName, params);
  const transactionDetails = {
    to: address,
    value,
    data,
    ...(await getFeeDataWithDynamicMaxPriorityFeePerGas(provider)),
  };
  return transactionDetails;
};
