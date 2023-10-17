import { ethers } from "ethers";
import {
  getChainIdFromName,
  getRpcUrlForChain,
  getProtocolAddressForChain,
  getFunctionData,
  getABIForProtocol,
  getFunctionName,
} from "../index.js";

export const getVoteData = async (
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
    case "pendle": {
      address = getProtocolAddressForChain(_protocolName, chainId, "voting");
      abi = getABIForProtocol(_protocolName, "voting");
      params.push([] /* address[] pools */);
      params.push([] /* uint64[] weights */);
    }
    case "lodestar": {
      address = getProtocolAddressForChain(_protocolName, chainId, "voting");
      abi = getABIForProtocol(_protocolName, "voting");
      params.push([] /* string[] tokens */);
      params.push([] /* VotingConstants.OperationType[] operations */);
      params.push([] /* uint256[] shares */);
      break;
    }
    case "thena": {
      address = getProtocolAddressForChain(_protocolName, chainId, "voting");
      abi = getABIForProtocol(_protocolName, "voting");
      params.push(0 /* uint256 _tokenId */);
      params.push([] /* address[] _poolVote */);
      params.push([] /* uint256[] _weights */);
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
    getFunctionName(_protocolName, "vote"),
    params,
    "0"
  );
  return { transactions: data };
};
