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

export const getDepositData = async (
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
  const gasPrice = await provider.getGasPrice();

  const { amount: _amount, decimals } = await getTokenAmount(
    _token.address,
    provider,
    spender,
    amount
  );

  let approveTxs = [];
  let address = null;
  let abi = [];
  const params = [];

  /* 
  switch (_protocolName) {
    case "sushiswap":
    case "uniswap":
    case "curve": {
      switch (action) {
        case "swap": {
          let dexList;
          if (_protocolName === "sushiswap") {
            dexList = ["SushiSwap"];
          } else if (_protocolName === "uniswap") {
            dexList = ["UniswapV2", "UniswapV3"];
          } else if (_protocolName === "curve") {
            dexList = ["Curve"];
          }
          const data = await getQuoteFromParaSwap(
            chainId,
            spender,
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
                spender,
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
        default: {
          return {
            error: "Protocol action not supported",
          };
        }
      }
    }
    case "aave": {
      address = getProtocolAddressForChain(_protocolName, chainId, "stkAAVE");
      abi = getABIForProtocol(_protocolName);
      params.push(spender);
      params.push(_amount);

      if (_token.address !== NATIVE_TOKEN && action === "deposit") {
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
    case "compound": {
      const funcName = getFunctionName(_protocolName, action);
      address = getProtocolAddressForChain(
        _protocolName,
        chainId,
        funcName === "claim" ? "rewards" : token.toLowerCase()
      );
      abi = getABIForProtocol(
        _protocolName,
        funcName === "claim" ? "rewards" : token.toLowerCase()
      );
      if (funcName === "claim") {
        const comet = getProtocolAddressForChain(
          _protocolName,
          chainId,
          token.toLowerCase()
        );
        params.push(comet);
        params.push(spender);
        params.push(true);
      } else {
        params.push(_token.address);
        params.push(_amount);

        if (_token.address !== NATIVE_TOKEN && action === "deposit") {
          approveTxs = await getApproveData(
            provider,
            _token.address,
            _amount,
            spender,
            address
          );
        }
      }
      break;
    }
    case "hop": {
      address = getProtocolAddressForChain(
        _protocolName,
        chainId,
        `${token.toLowerCase()}${
          outputToken.toLowerCase() === "hop"
            ? ""
            : `-${outputToken.toLowerCase()}`
        }`
      );
      abi = getABIForProtocol(_protocolName);
      if (action !== "claim") {
        params.push(_amount);

        if (_token.address !== NATIVE_TOKEN && action === "deposit") {
          approveTxs = await getApproveData(
            provider,
            _token.address,
            _amount,
            spender,
            address
          );
        }
      }
      break;
    }
    default: {
      return { error: "Protocol not supported" };
    }
  } */

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
    getFunctionName(_protocolName, "deposit"),
    params,
    "0"
  );
  return { transactions: [...approveTxs, ...data] };
};
