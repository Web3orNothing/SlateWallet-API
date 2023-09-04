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
  spender,
  chainName,
  protocolName,
  action,
  inputToken,
  outputToken,
  inputAmount
) => {
  const _protocolName = protocolName.toLowerCase();

  const chainId = getChainIdFromName(chainName);
  if (!chainId) {
    throw new Error("Invalid chain name");
  }

  const _inputToken = await getTokenAddressForChain(inputToken, chainName);
  if (!["aave", "compound"].includes(protocolName) && !_inputToken) {
    return {
      error: "Token not found on the specified chain.",
    };
  }
  let _outputToken;
  if (!["aave", "compound", "hop"].includes(protocolName)) {
    _outputToken = await getTokenAddressForChain(outputToken, chainName);
    if (!_outputToken) {
      return {
        error: "Token not found on the specified chain.",
      };
    }
  }

  const rpcUrl = getRpcUrlForChain(chainId);
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);
  const gasPrice = await provider.getGasPrice();

  let _inputAmount;
  let decimals = 18;
  if (_inputToken.address === NATIVE_TOKEN) {
    _inputAmount = utils.parseEther(inputAmount);
  } else {
    let token = new ethers.Contract(_inputToken.address, ERC20_ABI, provider);
    decimals = await token.decimals();
    _inputAmount = utils.parseUnits(inputAmount, decimals);
  }

  let approveTx = null;
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
          const data = await getQuoteFromParaSwap(
            chainId,
            spender,
            {
              address: _inputToken.address,
              symbol: inputToken,
              decimals,
            },
            {
              address: _outputToken.address,
              symbol: outputToken,
            },
            inputAmount,
            gasPrice,
            1,
            dexList
          );
          if (data) {
            const { tx } = data;
            const transactions = [];
            if (_inputToken.address !== NATIVE_TOKEN) {
              const approveData = await getApproveData(
                provider,
                _inputToken.address,
                _inputAmount,
                spender,
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
      params.push(spender);
      params.push(_inputAmount);

      if (_inputToken.address !== NATIVE_TOKEN && action != "claim") {
        approveTx = await getApproveData(
          provider,
          _inputToken.address,
          _inputAmount,
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
        funcName === "claim" ? "rewards" : inputToken.toLowerCase() // TODO: change key based on request
      );
      abi = getABIForProtocol(
        _protocolName,
        funcName === "claim" ? "rewards" : inputToken.toLowerCase() // TODO: change key based on request
      );
      if (funcName === "claim") {
        const comet = getProtocolAddressForChain(
          _protocolName,
          chainId,
          inputToken.toLowerCase()
        );
        params.push(comet);
        params.push(spender);
        params.push(true);
      } else {
        params.push(_inputToken.address);
        params.push(_inputAmount);

        if (_inputToken.address !== NATIVE_TOKEN) {
          approveTx = await getApproveData(
            provider,
            _inputToken.address,
            _inputAmount,
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
        `${inputToken.toLowerCase()}${
          outputToken.toLowerCase() === "hop" ? "" : `-${outputToken.toLowerCase()}`
        }`
      );
      abi = getABIForProtocol(_protocolName);
      if (action !== "claim") {
        params.push(_inputAmount);

        if (_inputToken.address !== NATIVE_TOKEN) {
          approveTx = await getApproveData(
            provider,
            _inputToken.address,
            _inputAmount,
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
  return { transactions: approveTx ? [approveTx, data] : [data] };
};
