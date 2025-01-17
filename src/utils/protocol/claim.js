import { ethers } from "ethers";
import {
  getChainIdFromName,
  getRpcUrlForChain,
  getTokenAddressForChain,
  getProtocolAddressForChain,
  getFunctionData,
  getABIForProtocol,
  getFunctionName,
  getTokenAmount,
} from "../index.js";

export const getClaimData = async (
  accountAddress,
  protocolName,
  chainName,
  poolName
) => {
  const _protocolName = protocolName.toLowerCase();

  const chainId = getChainIdFromName(chainName);
  if (!chainId) {
    throw new Error("Invalid chain name");
  }

  const rpcUrl = getRpcUrlForChain(chainId);
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);

  let address = null;
  let abi = [];
  const params = [];

  switch (_protocolName) {
    case "compound": {
      address = getProtocolAddressForChain(_protocolName, chainId, "rewards");
      abi = getABIForProtocol(_protocolName, "rewards");
      const comet = getProtocolAddressForChain(
        _protocolName,
        chainId,
        poolName
      );
      params.push(comet);
      params.push(accountAddress);
      params.push(true);
      break;
    }
    case "hop": {
      address = getProtocolAddressForChain(_protocolName, chainId, poolName);
      abi = getABIForProtocol(_protocolName);
      break;
    }
    case "gmx": {
      address = getProtocolAddressForChain(
        _protocolName,
        chainId,
        "staked" + token.toUpperCase() + "Tracker"
      );
      abi = getABIForProtocol(_protocolName, "reward-tracker");
      break;
    }
    case "jonesdao": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      params.push(0 /* uint256 _pid */);
      break;
    }
    case "lodestar": {
      address = getProtocolAddressForChain(_protocolName, chainId, "staking");
      abi = getABIForProtocol(_protocolName, "staking");
      break;
    }
    case "plutus": {
      address = getProtocolAddressForChain(_protocolName, chainId, "staking");
      abi = getABIForProtocol(_protocolName, "staking");
      params.push(_amount);
      break;
    }
    case "stargate": {
      const key = true /* based on param */ ? "staking" : "staking-time";
      address = getProtocolAddressForChain(_protocolName, chainId, key);
      abi = getABIForProtocol(_protocolName, key);
      params.push(0 /* uint256 _pid */);
      break;
    }
    default: {
      return { error: "Protocol not supported" };
    }
  }

  if (!address) {
    return { error: "Protocol address not found on the specified chain." };
  }
  if (!abi || abi.length === 0) {
    return { error: "Protocol ABI not found for the specified action." };
  }

  const data = await getFunctionData(
    address,
    abi,
    provider,
    getFunctionName(_protocolName, "claim"),
    params,
    "0"
  );
  return { transactions: [data] };
};
