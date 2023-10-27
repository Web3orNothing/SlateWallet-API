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
import { NATIVE_TOKEN, NATIVE_TOKEN2 } from "../../constants.js";
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
    case "curve": {
      address = getProtocolAddressForChain(_protocolName, chainId, poolName);
      abi = getABIForProtocol(_protocolName, poolName);
      const pool = new ethers.Contract(address, abi, provider);
      let count = 0;
      let tokenIndex;
      while (true) {
        try {
          const coin = await pool.coins(count);
          if (
            coin.toLowerCase() === NATIVE_TOKEN2 &&
            _token.address === NATIVE_TOKEN
          ) {
            tokenIndex = count;
          } else if (_token.address.toLowerCase() === coin.toLowerCase()) {
            tokenIndex = count;
          }
          count++;
        } catch {
          break;
        }
      }

      params.push(_amount);
      params.push(tokenIndex);
      params.push(0);
      break;
    }
    case "dopex": {
      address = getProtocolAddressForChain(_protocolName, chainId, poolName);
      abi = getABIForProtocol(_protocolName, "ssov");
      const contract = new ethers.Contract(address, abi, provider);
      const tokenId = await contract.tokenOfOwnerByIndex(accountAddress, 0);
      params.push(tokenId);
      params.push(address);
      break;
    }
    case "synapse": {
      address = getProtocolAddressForChain(
        _protocolName,
        chainId,
        token.toLowerCase()
      );
      abi = getABIForProtocol(_protocolName, "staking");
      const contract = new ethers.Contract(address, abi, provider);
      const tokenIdx = await contract.getTokenIndex(_token.address);
      let count = tokenIdx + 1;
      while (true) {
        try {
          await contract.getToken(count);
          count++;
        } catch {
          break;
        }
      }
      let amounts = new Array(count).fill(0);
      amounts[tokenIdx] = _amount;

      params.push(_amount);
      params.push(tokenIdx);
      params.push(0);
      params.push(Math.floor(Date.now() / 1000) + 1200);
      break;
    }
    case "hop": {
      address = getProtocolAddressForChain(
        _protocolName,
        chainId,
        token.toLowerCase()
      );
      abi = getABIForProtocol(_protocolName);
      params.push(_amount);
      break;
    }
    case "gmx": {
      address = getProtocolAddressForChain(_protocolName, chainId, "gmxVester");
      abi = getABIForProtocol(_protocolName, "vester");
      break;
    }
    case "rocketpool": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      params.push(_amount);
      break;
    }
    case "pendle": {
      address = getProtocolAddressForChain(
        _protocolName,
        chainId,
        token.toLowerCase() + "Market"
      );
      abi = getABIForProtocol(_protocolName, "market");
      params.push(accountAddress);
      params.push(accountAddress);
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
    case "stargate": {
      address = getProtocolAddressForChain(_protocolName, chainId, "router");
      abi = getABIForProtocol(_protocolName, "router");
      params.push(chainId /* uint16 _dstChainId */);
      params.push(0 /* uint256 _srcPoolId */);
      params.push(0 /* uint256 _dstPoolId */);
      params.push(accountAddress /* address _refundAddress */);
      params.push(_amount /* uint256 _amountLP */);
      params.push(accountAddress /* bytes _to */);
      params.push([
        0 /* uint256 dstGasForCall */,
        _amount /* uint256 dstNativeAmount */,
        accountAddress /* bytes dstNativeAddr */,
      ]);
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
    //     accountAddress,
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
  return { transactions: [data] };
};
