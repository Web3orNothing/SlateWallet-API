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

export const getUnstakeData = async (
  accountAddress,
  protocolName,
  chainName,
  token,
  amount
) => {
  const _protocolName = protocolName.toLowerCase();

  const chainId = getChainIdFromName(chainName);
  if (!chainId) {
    throw new Error("Invalid chain name");
  }

  const _token = await getTokenAddressForChain(token, chainName);
  if (!_token) {
    return { error: "Token not found on the specified chain." };
  }

  const rpcUrl = getRpcUrlForChain(chainId);
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);

  const { amount: _amount } = await getTokenAmount(
    _token.address,
    provider,
    accountAddress,
    amount
  );

  let address = null;
  let abi = [];
  const params = [];

  switch (_protocolName) {
    case "lodestar":
    case "kwenta": {
      address = getProtocolAddressForChain(_protocolName, chainId, "staking");
      abi = getABIForProtocol(_protocolName, "staking");
      params.push(_amount);
      break;
    }
    case "stargate": {
      const key = true /* based on param */ ? "staking" : "staking-time";
      address = getProtocolAddressForChain(_protocolName, chainId, key);
      abi = getABIForProtocol(_protocolName, key);

      params.push(accountAddress);
      params.push(0 /* uint256 _pid */);
      params.push(_amount);
      break;
    }
    case "plutus": {
      address = getProtocolAddressForChain(_protocolName, chainId, "staking");
      abi = getABIForProtocol(_protocolName);
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
    getFunctionName(_protocolName, "unstake"),
    params,
    "0"
  );
  return { transactions: [data] };
};
