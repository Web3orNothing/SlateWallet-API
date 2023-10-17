import { ethers } from "ethers";
import {
  getChainIdFromName,
  getRpcUrlForChain,
  getTokenAddressForChain,
  getApproveData,
  getProtocolAddressForChain,
  getFunctionData,
  getABIForProtocol,
  getFunctionName,
  getTokenAmount,
} from "../index.js";

import { NATIVE_TOKEN } from "../../constants.js";

export const getLockData = async (
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

  let approveTxs = [];
  let address = null;
  let abi = [];
  const params = [];

  switch (_protocolName) {
    case "pendle": {
      address = getProtocolAddressForChain(_protocolName, chainId, "ve");
      abi = getABIForProtocol(_protocolName, "ve");
      params.push(_amount);
      params.push(
        Math.floor(Date.now() / 1000) + 86400 /* uint128 newExpiry */
      );

      if (_token.address !== NATIVE_TOKEN) {
        approveTxs = await getApproveData(
          provider,
          _token.address,
          _amount,
          spender,
          address
        );
      }
      break;
    }
    case "plutus": {
      address = getProtocolAddressForChain(_protocolName, chainId, "vester");
      abi = getABIForProtocol(_protocolName, "vester");
      params.push(_amount);

      if (_token.address !== NATIVE_TOKEN) {
        approveTxs = await getApproveData(
          provider,
          _token.address,
          _amount,
          spender,
          address
        );
      }
      break;
    }
    case "thena": {
      address = getProtocolAddressForChain(_protocolName, chainId, "ve");
      abi = getABIForProtocol(_protocolName, "ve");
      params.push(_amount);
      params.push(86400 /* uint _lock_duration */);

      if (_token.address !== NATIVE_TOKEN) {
        approveTxs = await getApproveData(
          provider,
          _token.address,
          _amount,
          spender,
          address
        );
      }
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
    getFunctionName(_protocolName, "lock"),
    params,
    "0"
  );
  return { transactions: [...approveTxs, ...data] };
};
