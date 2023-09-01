import { ethers, utils } from "ethers";
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
} from "../utils/index.js";

import ERC20_ABI from "../abis/erc20.abi.js";
import { getQuoteFromParaSwap } from "../utils/swap.js";
import { NATIVE_TOKEN } from "../constants.js";

export const getProtocolData = async (
  accountAddress,
  chainName,
  protocolName,
  action,
  token0,
  token1,
  amount
) => {
  console.log(
    "===>",
    accountAddress,
    chainName,
    protocolName,
    action,
    token0,
    token1,
    amount
  );
  const _protocolName = protocolName.toLowerCase();

  const chainId = getChainIdFromName(chainName);
  if (!chainId) {
    throw new Error("Invalid chain name");
  }

  const _token0 = await getTokenAddressForChain(token0, chainName);
  if (!["aave", "compound"].includes(protocolName) && !_token0) {
    return {
      error: "Token not found on the specified chain.",
    };
  }
  let _token1;
  if (!["aave", "compound", "hop"].includes(protocolName)) {
    _token1 = await getTokenAddressForChain(token1, chainName);
    if (!_token1) {
      return {
        error: "Token not found on the specified chain.",
      };
    }
  }

  const rpcUrl = getRpcUrlForChain(chainId);
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);
  const gasPrice = await provider.getGasPrice();

  let address = null;
  let abi = [];
  const params = [];
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
          let decimals = 18;
          let _amount;
          if (_token0.address === NATIVE_TOKEN) {
            _amount = utils.parseEther(amount);
          } else {
            let token = new ethers.Contract(
              _token0.address,
              ERC20_ABI,
              provider
            );
            decimals = await token.decimals();
            _amount = utils.parseUnits(amount, decimals);
          }
          const data = await getQuoteFromParaSwap(
            chainId,
            accountAddress,
            {
              address: _token0.address,
              symbol: token0,
              decimals,
            },
            {
              address: _token1.address,
              symbol: token1,
            },
            amount,
            gasPrice,
            1,
            dexList
          );
          if (data) {
            const { tx } = data;
            const transactions = [];
            if (_token0.address !== NATIVE_TOKEN) {
              const approveData = await getApproveData(
                provider,
                _token0.address,
                _amount,
                accountAddress,
                tx.to
              );
              if (approveData) {
                transactions.push(approveData);
              }
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
      address = getProtocolAddressForChain(_protocolName, chainId, "stkAAVE"); // TODO: change key based request
      abi = getABIForProtocol(_protocolName);
      params.push(accountAddress);
      params.push(amount);
      break;
    }
    case "compound": {
      const funcName = getFunctionName(_protocolName, action);
      address = getProtocolAddressForChain(
        _protocolName,
        chainId,
        funcName === "claim" ? "rewards" : token0.toLowerCase() // TODO: change key based on request
      );
      abi = getABIForProtocol(
        _protocolName,
        funcName === "claim" ? "rewards" : token0.toLowerCase() // TODO: change key based on request
      );
      if (funcName === "claim") {
        const comet = getProtocolAddressForChain(_protocolName, chainId, token0.toLowerCase());
        params.push(comet);
        params.push(accountAddress);
        params.push(true);
      } else {
        params.push(_token0.address);
        params.push(amount);
      }
      break;
    }
    case "hop": {
      address = getProtocolAddressForChain(
        _protocolName,
        chainId,
        `${token0.toLowerCase()}${
          token1.toLowerCase() === "hop" ? "" : `-${token1.toLowerCase()}`
        }`
      );
      abi = getABIForProtocol(_protocolName);
      if (action !== "claim") params.push(amount);
      break;
    }
    default: {
      return { error: "Protocol not supported" };
    }
  }

  if (!address) {
    return {
      error: "Protocol address not found on the specified chain.",
    };
  }
  if (!abi || abi.length === 0) {
    return {
      error: "Protocol ABI not found for the specified action.",
    };
  }

  const data = await getFunctionData(
    address,
    abi,
    provider,
    getFunctionName(_protocolName, action),
    params,
    "0"
  );
  return { transactions: [data] };
};
