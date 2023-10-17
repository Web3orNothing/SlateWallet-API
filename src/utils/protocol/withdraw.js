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
// import uniswapFactoryAbi from "../../abis/uniswap-factory.abi.js";

export const getWithdrawData = async (
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

  const rpcUrl = getRpcUrlForChain(chainId);
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);

  const _token = await getTokenAddressForChain(token, chainName);
  if (!_token) {
    return { error: "Token not found on the specified chain." };
  }

  const { amount: _amount } = await getTokenAmount(
    _token.address,
    provider,
    accountAddress,
    amount
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
      params.push(_token.address);
      params.push(_amount);
      params.push(accountAddress);
      break;
    }
    case "compound": {
      address = getProtocolAddressForChain(
        _protocolName,
        chainId,
        token.toLowerCase()
      );
      abi = getABIForProtocol(_protocolName, token.toLowerCase());
      params.push(_token.address);
      params.push(_amount);
      break;
    }
    case "hop": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      params.push(_amount);
      break;
    }
    case "gmx": {
      address = getProtocolAddressForChain(
        _protocolName,
        chainId,
        token.toLowerCase() + "Vester"
      );
      abi = getABIForProtocol(_protocolName, "vester");
      break;
    }
    case "rocketpool":
    case "pendle": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      params.push(_amount);
      break;
    }
    case "jonesdao": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      params.push(0 /* uint256 _pid */);
      params.push(_amount);
      break;
    }
    case "plutus": {
      address = getProtocolAddressForChain(
        _protocolName,
        chainId,
        token.toLowerCase()
      );
      if (address) {
        abi = getABIForProtocol(_protocolName, token.toLowerCase());
      } else {
        address = getProtocolAddressForChain(
          _protocolName,
          chainId,
          "masterchef"
        );
        abi = getABIForProtocol(_protocolName, "masterchef");
        params.push(0 /* uint256 _pid */);
      }
      params.push(_amount);
      break;
    }
    case "rodeo": {
      address = getProtocolAddressForChain(_protocolName, chainId, "farm");
      abi = getABIForProtocol(_protocolName, "farm");
      params.push(0 /* uint256 id */);
      break;
    }
    // case "uniswap": {
    //   address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    //   abi = getABIForProtocol(_protocolName);
    //   const isToken0Eth = token.toLowerCase() === "eth";
    //   const isToken1Eth = token1.toLowerCase() === "eth";
    //   const hasEth = isToken0Eth || isToken1Eth;
    //   if (hasEth) {
    //     // removeLiquidityETH
    //     funcName = "removeLiquidityETH";
    //     params.push(isToken0Eth ? _token1.address : _token.address);
    //     params.push(_amount);
    //     params.push(0);
    //     params.push(0);
    //   } else {
    //     // removeLiquidity
    //     funcName = "removeLiquidity";
    //     params.push(_token.address);
    //     params.push(_token1.address);
    //     params.push(_amount);
    //     params.push(0);
    //     params.push(0);
    //   }
    //   const factoryContract = new ethers.Contract(
    //     "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    //     uniswapFactoryAbi,
    //     provider
    //   );
    //   const lpTokenAddress = await factoryContract.getPair(
    //     _token.address,
    //     _token1.address
    //   );
    //   approveTxs = await getApproveData(
    //     provider,
    //     lpTokenAddress,
    //     _amount,
    //     spender,
    //     address
    //   );
    //   params.push(address);
    //   params.push(Math.floor(Date.now() / 1000) + 1200);
    //   break;
    // }
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
