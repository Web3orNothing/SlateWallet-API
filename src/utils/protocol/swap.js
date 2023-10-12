import { ethers } from "ethers";
import {
  getChainIdFromName,
  getFeeDataWithDynamicMaxPriorityFeePerGas,
  getRpcUrlForChain,
  getTokenAddressForChain,
  getApproveData,
  getTokenAmount,
} from "../index.js";

import { NATIVE_TOKEN } from "../../constants.js";

export const getDepositData = async (
  accountAddress,
  protocolName,
  chainName,
  poolName,
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

  switch (_protocolName) {
    case "sushiswap":
    case "uniswap":
    case "curve":
    case "balancer": {
      let dexList;
      if (_protocolName === "sushiswap") {
        dexList = ["SushiSwap"];
      } else if (_protocolName === "uniswap") {
        dexList = ["UniswapV2", "UniswapV3"];
      } else if (_protocolName === "curve") {
        dexList = ["Curve"];
      } else if (_protocolName === "balancer") {
        dexList = ["Balancer"];
      }
      const data = await getQuoteFromParaSwap(
        chainId,
        accountAddress,
        {
          address: _token.address,
          symbol: token,
          decimals,
        },
        {
          address: _outputToken.address,
          symbol: outputToken,
        },
        amount,
        gasPrice,
        1,
        dexList
      );
      if (data) {
        const { tx } = data;
        const transactions = [];
        if (_token.address !== NATIVE_TOKEN) {
          const approveTxs = await getApproveData(
            provider,
            _token.address,
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
          ...(await getFeeDataWithDynamicMaxPriorityFeePerGas(provider)),
        });
        return { transactions };
      } else {
        return { error: "No swap route found" };
      }
    }
    default: {
      return { error: "Protocol not supported" };
    }
  }
};
