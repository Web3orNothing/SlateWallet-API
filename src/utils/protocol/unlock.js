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

export const getUnlockData = async (
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
    case "pendle": {
      address = getProtocolAddressForChain(_protocolName, chainId, "ve");
      abi = getABIForProtocol(_protocolName, "ve");
      break;
    }
    case "plutus": {
      address = getProtocolAddressForChain(_protocolName, chainId, "vester");
      abi = getABIForProtocol(_protocolName, "vester");
      break;
    }
    case "thena": {
      address = getProtocolAddressForChain(_protocolName, chainId, "ve");
      abi = getABIForProtocol(_protocolName, "ve");
      params.push(0 /* uint _tokenId */);
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
    getFunctionName(_protocolName, "unlock"),
    params,
    "0"
  );
  return { transactions: [data] };
};
