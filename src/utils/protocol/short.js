import { ethers } from "ethers";
import {
  getChainIdFromName,
  getRpcUrlForChain,
  getFeeDataWithDynamicMaxPriorityFeePerGas,
  getTokenAddressForChain,
  getApproveData,
  getProtocolAddressForChain,
  getFunctionData,
  getABIForProtocol,
  getFunctionName,
  getTokenAmount,
} from "../index.js";

import { getQuoteFromParaSwap } from "../swap.js";
import { NATIVE_TOKEN } from "../../constants.js";

export const getShortData = async (
  protocolName,
  chainName,
  inputToken,
  inputAmount,
  outputToken,
  leverageMultiplier
) => {
  const _protocolName = protocolName.toLowerCase();

  const chainId = getChainIdFromName(chainName);
  if (!chainId) {
    throw new Error("Invalid chain name");
  }

  const _inputToken = await getTokenAddressForChain(inputToken, chainName);
  if (!_inputToken) {
    return { error: "Token not found on the specified chain." };
  }

  const _outputToken = await getTokenAddressForChain(outputToken, chainName);
  if (!_outputToken) {
    return { error: "Token not found on the specified chain." };
  }

  const rpcUrl = getRpcUrlForChain(chainId);
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);
  const gasPrice = await provider.getGasPrice();

  const { amount: _inputAmount, decimals } = await getTokenAmount(
    _inputToken.address,
    provider,
    spender,
    inputAmount
  );

  let approveTxs = [];
  let address = null;
  let abi = [];
  const params = [];

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
    getFunctionName(_protocolName, "short"),
    params,
    "0"
  );
  return { transactions: [...approveTxs, ...data] };
};
