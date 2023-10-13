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
import uniswapFactoryAbi from "../../abis/uniswap-factory.abi.js";

export const getWithdrawData = async (
  accountAddress,
  protocolName,
  chainName,
  poolName,
  token0,
  amount0,
  token1
) => {
  const _protocolName = protocolName.toLowerCase();

  const chainId = getChainIdFromName(chainName);
  if (!chainId) {
    throw new Error("Invalid chain name");
  }

  const rpcUrl = getRpcUrlForChain(chainId);
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);

  const _token0 = await getTokenAddressForChain(token0, chainName);
  if (!_token0) {
    return { error: "Token not found on the specified chain." };
  }

  const { amount: _amount0 } = await getTokenAmount(
    _token0.address,
    provider,
    accountAddress,
    amount0
  );

  let _token1;
  if (token1) {
    _token1 = await getTokenAddressForChain(_token1, chainName);
    if (!_token1) {
      return {
        error: "Token not found on the specified chain.",
      };
    }
  }

  let address = null;
  let abi = [];
  const params = [];

  switch (_protocolName) {
    case "aave": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      params.push(_token0.address);
      params.push(_amount0);
      params.push(accountAddress);
      break;
    }
    case "compound": {
      address = getProtocolAddressForChain(
        _protocolName,
        chainId,
        token0.toLowerCase()
      );
      abi = getABIForProtocol(_protocolName, token0.toLowerCase());
      params.push(_token0.address);
      params.push(_amount0);
      break;
    }
    case "hop": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      params.push(_amount0);
      break;
    }
    case "rocketpool":
    case "pendle": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      params.push(_amount0);
      break;
    }
    case "rodeo": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      params.push(_amount0);
      params.push(accountAddress);
      break;
    }
    case "plutus": {
      address = getProtocolAddressForChain(
        _protocolName,
        chainId,
        "masterchef"
      );
      abi = getABIForProtocol(_protocolName);
      params.push(0 /* uint256 _pid */);
      params.push(_amount0);
      break;
    }
    case "jonesdao": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      params.push(0 /* uint256 _pid */);
      params.push(_amount0);
      break;
    }
    case "stargate": {
      const key = true /* based on param */ ? "staking" : "staking-time";
      address = getProtocolAddressForChain(_protocolName, chainId, key);
      abi = getABIForProtocol(_protocolName, key);

      params.push(accountAddress);
      params.push(0 /* uint256 _pid */);
      params.push(_amount0);
      break;
    }
    case "uniswap": {
      address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
      abi = getABIForProtocol(_protocolName);
      const isToken0Eth = token0.toLowerCase() === "eth";
      const isToken1Eth = token1.toLowerCase() === "eth";
      const hasEth = isToken0Eth || isToken1Eth;
      if (hasEth) {
        // removeLiquidityETH
        funcName = "removeLiquidityETH";
        params.push(isToken0Eth ? _token1.address : _token0.address);
        params.push(_amount0);
        params.push(0);
        params.push(0);
      } else {
        // removeLiquidity
        funcName = "removeLiquidity";
        params.push(_token0.address);
        params.push(_token1.address);
        params.push(_amount0);
        params.push(0);
        params.push(0);
      }
      const factoryContract = new ethers.Contract(
        "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
        uniswapFactoryAbi,
        provider
      );
      const lpTokenAddress = await factoryContract.getPair(
        _token0.address,
        _token1.address
      );
      approveTxs = await getApproveData(
        provider,
        lpTokenAddress,
        _amount0,
        spender,
        address
      );
      params.push(address);
      params.push(Math.floor(Date.now() / 1000) + 1200);
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
    getFunctionName(_protocolName, "withdraw"),
    params,
    "0"
  );
  return { transactions: data };
};
