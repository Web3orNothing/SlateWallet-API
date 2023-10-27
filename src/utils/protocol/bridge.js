import { ethers } from "ethers";
import {
  getChainIdFromName,
  getRpcUrlForChain,
  getTokenAddressForChain,
  getApproveData,
  getTokenAmount,
} from "../index.js";
import {
  getQuoteFromBungee,
  getQuoteFromHop,
  getQuoteFromLiFi,
  getQuoteFromSynapse,
} from "../bridge.js";

import { NATIVE_TOKEN } from "../../constants.js";

export const getBridgeData = async (
  accountAddress,
  protocolName,
  sourceChainName,
  destinationChainName,
  token,
  amount
) => {
  const _protocolName = protocolName.toLowerCase();

  const sourceChainId = getChainIdFromName(sourceChainName);
  if (!sourceChainId) {
    throw new Error("Invalid scource chain name");
  }
  const destinationChainId = getChainIdFromName(destinationChainName);
  if (!destinationChainId) {
    throw new Error("Invalid destination chain name");
  }

  const _sourceToken = await getTokenAddressForChain(token, sourceChainName);
  if (!_sourceToken) {
    return { error: "Token not found on the specified source chain." };
  }
  const _destinationToken = await getTokenAddressForChain(
    token,
    destinationChainName
  );
  if (!_destinationToken) {
    return { error: "Token not found on the specified destination chain." };
  }

  const rpcUrl = getRpcUrlForChain(sourceChainId);
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, sourceChainId);

  const { amount: _amount, decimals } = await getTokenAmount(
    _sourceToken.address,
    provider,
    accountAddress,
    amount
  );

  let getQuoteFunc;
  switch (_protocolName) {
    case "bungee": {
      getQuoteFunc = getQuoteFromBungee;
      break;
    }
    case "hop": {
      getQuoteFunc = getQuoteFromHop;
      break;
    }
    case "jumper": {
      getQuoteFunc = getQuoteFromLiFi;
      break;
    }
    case "synapse": {
      getQuoteFunc = getQuoteFromSynapse;
      break;
    }
    default: {
      return { error: "Protocol not supported" };
    }
  }

  const data = await getQuoteFunc(
    sourceChainId,
    destinationChainId,
    accountAddress,
    {
      address: _sourceToken.address,
      symbol: token,
      decimals,
    },
    {
      address: _destinationToken.address,
      symbol: token,
    },
    _amount
  );
  if (data) {
    const { tx } = data;
    const transactions = [];
    if (_sourceToken.address !== NATIVE_TOKEN) {
      const approveTxs = await getApproveData(
        provider,
        _sourceToken.address,
        _amount,
        accountAddress,
        tx.to
      );
      transactions.push(...approveTxs);
    }
    transactions.push({
      to: tx.to,
      value: tx.value,
      data: tx.data,
    });
    return { transactions };
  } else {
    return {
      error: "No bridge route found",
    };
  }
};
