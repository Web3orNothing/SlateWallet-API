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

export const getBorrowData = async (
  accountAddress,
  protocolName,
  chainName,
  _poolName,
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
    case "aave": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      params.push(_token.address);
      params.push(_amount);
      params.push(2); // interest rate mode
      params.push(0);
      params.push(accountAddress);
      break;
    }
    case "lodestar": {
      address = getProtocolAddressForChain(
        _protocolName,
        chainId,
        "unitroller"
      );
      abi = getABIForProtocol(_protocolName, "unitroller");
      params.push(_token.address);
      params.push(accountAddress);
      params.push(_amount);
      break;
    }
    case "rodeo": {
      address = getProtocolAddressForChain(_protocolName, chainId, "pool");
      abi = getABIForProtocol(_protocolName, "pool");
      params.push(_amount);
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
    getFunctionName(_protocolName, "borrow"),
    params,
    "0"
  );
  return { transactions: [...approveTxs, data] };
};
