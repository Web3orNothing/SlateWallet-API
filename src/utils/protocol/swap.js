import { ethers } from "ethers";
import {
  getChainIdFromName,
  getFeeDataWithDynamicMaxPriorityFeePerGas,
  getFunctionData,
  getFunctionName,
  getRpcUrlForChain,
  getProtocolAddressForChain,
  getABIForProtocol,
  getTokenAddressForChain,
  getApproveData,
  getTokenAmount,
} from "../index.js";
import {
  getQuoteFromParaSwap,
  getQuoteFrom0x,
  getQuoteFrom1inch,
  getQuoteFromOpenOcean,
  getQuoteFromKyber,
  getQuoteFromLiFi,
  getQuoteFromSynapse,
} from "../swap.js";
import yieldYakRouterAbi from "../../abis/yield-yak-router.abi.js";

import { NATIVE_TOKEN } from "../../constants.js";

export const getSwapData = async (
  accountAddress,
  protocolName,
  chainName,
  _poolName,
  inputToken,
  inputAmount,
  outputToken
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

  const { amount: _amount, decimals } = await getTokenAmount(
    _inputToken.address,
    provider,
    accountAddress,
    inputAmount
  );

  const params = [];
  switch (_protocolName) {
    case "sushiswap":
    case "uniswap":
    case "llamazip":
    case "curve":
    case "camelot":
    case "balancer": {
      let dexList;
      if (_protocolName === "sushiswap") {
        dexList = ["SushiSwap"];
      } else if (_protocolName === "uniswap") {
        dexList = ["UniswapV2", "UniswapV3"];
      } else if (_protocolName === "llamazip") {
        dexList = ["Llamazip"];
      } else if (_protocolName === "curve") {
        dexList = ["Curve"];
      } else if (_protocolName === "camelot") {
        dexList = ["Camelot"];
      } else if (_protocolName === "balancer") {
        dexList = ["Balancer"];
      }
      const data = await getQuoteFromParaSwap(
        chainId,
        accountAddress,
        {
          address: _inputToken.address,
          symbol: inputToken,
          decimals,
        },
        {
          address: _outputToken.address,
          symbol: outputToken,
        },
        _amount,
        gasPrice,
        1,
        dexList
      );
      if (data) {
        const { tx } = data;
        const transactions = [];
        if (_inputToken.address !== NATIVE_TOKEN) {
          const approveTxs = await getApproveData(
            provider,
            _inputToken.address,
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
    case "matcha":
    case "synapse":
    case "1inch":
    case "paraswap":
    case "kyberswap":
    case "lifi":
    case "jumper":
    case "openocean": {
      let swapFunc;
      if (_protocolName === "matcha") swapFunc = getQuoteFrom0x;
      else if (_protocolName === "synapse") swapFunc = getQuoteFromSynapse;
      else if (_protocolName === "1inch") swapFunc = getQuoteFrom1inch;
      else if (_protocolName === "paraswap") swapFunc = getQuoteFromParaSwap;
      else if (_protocolName === "kyberswap") swapFunc = getQuoteFromKyber;
      else if (_protocolName === "lifi" || _protocolName === "jumper") swapFunc = getQuoteFromLiFi;
      else if (_protocolName === "openocean") swapFunc = getQuoteFromOpenOcean;
      const data = await swapFunc(
        chainId,
        accountAddress,
        {
          address: _inputToken.address,
          symbol: inputToken,
          decimals,
        },
        {
          address: _outputToken.address,
          symbol: outputToken,
        },
        _amount,
        gasPrice
      );
      if (data) {
        const { tx } = data;
        const transactions = [];
        if (_inputToken.address !== NATIVE_TOKEN) {
          const approveTxs = await getApproveData(
            provider,
            _inputToken.address,
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
        return {
          error: "No swap route found",
        };
      }
    }
    case "yieldyak": {
      const address = getProtocolAddressForChain(_protocolName, chainId);
      if (!address) {
        return {
          error: "Protocol address not found on the specified chain.",
        };
      }
      const abi = getABIForProtocol(_protocolName);
      const yieldYakRouter = new ethers.Contract(
        address,
        yieldYakRouterAbi,
        provider
      );
      const queryRes = await yieldYakRouter.findBestPath(
        _amount,
        _inputToken.address,
        _outputToken.address,
        2
      );
      params.push({
        amountIn: queryRes.amounts[0],
        amountOut: queryRes.amounts[queryRes.amounts.length - 1]
          .mul(99)
          .div(100),
        path: queryRes.path,
        adapters: queryRes.adapters,
      });
      params.push(accountAddress);
      params.push(0);

      let approveTxs;
      let value = ethers.constants.Zero;
      if (_inputToken.address !== NATIVE_TOKEN) {
        approveTxs = await getApproveData(
          provider,
          _inputToken.address,
          _amount,
          accountAddress,
          address
        );
      } else {
        value = _amount;
      }

      const data = await getFunctionData(
        address,
        abi,
        provider,
        getFunctionName(_protocolName, "swap"),
        params,
        value
      );
      return { transactions: [...approveTxs, data] };
    }
    default: {
      return { error: "Protocol not supported" };
    }
  }
};
