import axios from "axios";
import { BigNumber, ethers } from "ethers";
import ERC20_ABI from "../abis/erc20.abi.js";
import * as ProtocolAddresses from "./address.json" assert { type: "json" };
import * as aaveAbi from "../abis/aave.json" assert { type: "json" };
import * as compoundRewardsAbi from "../abis/compound-rewards.json" assert { type: "json" };
import * as compoundUSDCAbi from "../abis/compound-usdc.json" assert { type: "json" };
import * as compoundWETHAbi from "../abis/compound-weth.json" assert { type: "json" };
import * as hopAbi from "../abis/hop.json" assert { type: "json" };

const abis = {
  aave: aaveAbi,
  "compound-rewards": compoundRewardsAbi,
  "compound-usdc": compoundUSDCAbi,
  "compound-weth": compoundWETHAbi,
  hop: hopAbi,
};

export const metamaskApiHeaders = {
  Referrer: "https://portfolio.metamask.io/",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
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

export const getProtocolAddressForChain = (
  protocol,
  chainId,
  key = "default"
) => ProtocolAddresses[protocol][chainId][key] || null;

export const getABIForProtocol = (protocol, key) =>
  abis[`${protocol}${!key ? "" : `-${key}`}`];

export const getFunctionName = (protocol, action) => {
  switch (protocol) {
    case "aave":
      if (action === "deposit") return "stake";
      if (action === "withdraw") return "redeem";
      return "claimRewards";
    case "compound":
      if (action === "deposit") return "supply";
      return action;
    default:
      return action;
  }
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
  spender,
  nonce
) => {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const allowance = await token.allowance(owner, spender);
  if (allowance.lt(amount)) {
    const approveData = token.interface.encodeFunctionData("approve", [
      spender,
      amount,
    ]);
    const transactionDetails = {
      from: owner,
      to: tokenAddress,
      value: "0x0",
      data: approveData,
      nonce,
      ...(await getFeeDataWithDynamicMaxPriorityFeePerGas(provider)),
    };
    return transactionDetails;
  }
};

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
