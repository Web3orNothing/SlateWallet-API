import { ethers } from "ethers";
import {
  getChainIdFromName,
  getRpcUrlForChain,
  getTokenAddressForChain,
  getApproveData,
  getProtocolAddressForChain,
  getFunctionData,
  getABIForProtocol,
  getFunctionName,
  getTokenAmount,
} from "../index.js";

import { NATIVE_TOKEN, NATIVE_TOKEN2 } from "../../constants.js";

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

  // let _token1;
  // let _amount1;
  // if (token1) {
  //   _token1 = await getTokenAddressForChain(_token1, chainName);
  //   if (!_token1) {
  //     return {
  //       error: "Token not found on the specified chain.",
  //     };
  //   }
  //   const { amount } = await getTokenAmount(
  //     _token1.address,
  //     provider,
  //     accountAddress,
  //     amount1
  //   );
  //   _amount1 = amount;
  // }

  let approveTxs = [];
  let address = null;
  let abi = [];
  const params = [];
  let value = ethers.constants.Zero;
  let funcName;

  switch (_protocolName) {
    case "aave": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      params.push(_token.address);
      params.push(_amount);
      params.push(accountAddress);
      params.push(0);

      if (_token.address !== NATIVE_TOKEN) {
        approveTxs = await getApproveData(
          provider,
          _token.address,
          _amount,
          accountAddress,
          address
        );
      }
      break;
    }
    case "compound": {
      params.push(_token.address);
      params.push(_amount);

      if (_token.address !== NATIVE_TOKEN) {
        approveTxs = await getApproveData(
          provider,
          _token.address,
          _amount,
          accountAddress,
          address
        );
      }
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
      const amounts = new Array(count).fill(0);
      amounts[tokenIndex] = _amount;

      if (_token.address === NATIVE_TOKEN2) {
        value = _amount;
      }

      params.push(amounts);
      params.push(0);
      break;
    }
    case "dopex": {
      address = getProtocolAddressForChain(_protocolName, chainId, poolName);
      abi = getABIForProtocol(_protocolName, "ssov");
      params.push(0); // TODO: strike ID
      params.push(_amount);
      params.push(address);
      break;
    }
    case "gmx": {
      address = getProtocolAddressForChain(
        _protocolName,
        chainId,
        token.toLowerCase() + "Vester"
      );
      abi = getABIForProtocol(_protocolName, "vester");
      params.push(_amount);

      if (_token.address !== NATIVE_TOKEN) {
        approveTxs = await getApproveData(
          provider,
          _token.address,
          _amount,
          accountAddress,
          address
        );
      }
      break;
    }
    case "rocketpool": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      break;
    }
    case "pendle": {
      address = getProtocolAddressForChain(_protocolName, chainId, "market");
      abi = getABIForProtocol(_protocolName, "market");
      params.push(accountAddress);
      params.push(_amount);
      params.push(_amount);

      if (_token.address !== NATIVE_TOKEN) {
        approveTxs = await getApproveData(
          provider,
          _token.address,
          _amount,
          accountAddress,
          address
        );
      }
      break;
    }
    case "jonesdao": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      params.push(0 /* uint256 _pid */);
      params.push(_amount);

      if (_token.address !== NATIVE_TOKEN) {
        approveTxs = await getApproveData(
          provider,
          _token.address,
          _amount,
          accountAddress,
          address
        );
      }
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

      params.push(amounts);
      params.push(0), params.push(Math.floor(Date.now() / 1000) + 1200);

      approveTxs = await getApproveData(
        provider,
        _token.address,
        _amount,
        accountAddress,
        address
      );
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

      if (_token.address !== NATIVE_TOKEN) {
        approveTxs = await getApproveData(
          provider,
          _token.address,
          _amount,
          accountAddress,
          address
        );
      }
      break;
    }
    case "rodeo": {
      address = getProtocolAddressForChain(_protocolName, chainId, "farm");
      abi = getABIForProtocol(_protocolName, "farm");
      params.push(accountAddress);
      params.push(ethers.constants.AddressZero /* address pol */);
      params.push(0 /* uint256 str */);
      params.push(_amount);
      params.push(0 /* uint256 bor */);
      params.push("0x" /* bytes dat */);

      if (_token.address !== NATIVE_TOKEN) {
        approveTxs = await getApproveData(
          provider,
          _token.address,
          _amount,
          accountAddress,
          address
        );
      }
      break;
    }
    case "stargate": {
      const key = _token.address === NATIVE_TOKEN ? "routerETH" : "router";
      address = getProtocolAddressForChain(_protocolName, chainId, key);
      abi = getABIForProtocol(_protocolName, key);
      params.push(0 /* uint256 _poolId */);
      params.push(_amount);
      params.push(accountAddress);

      if (_token.address !== NATIVE_TOKEN) {
        approveTxs = await getApproveData(
          provider,
          _token.address,
          _amount,
          accountAddress,
          address
        );
      }
      break;
    }
    // case "uniswap": {
    //   address = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
    //   abi = getABIForProtocol(_protocolName);
    //   const isToken0Eth = token.toLowerCase() === "eth";
    //   const isToken1Eth = token1.toLowerCase() === "eth";
    //   const hasEth = isToken0Eth || isToken1Eth;
    //   if (hasEth) {
    //     // addLiquidityETH
    //     funcName = "addLiquidityETH";
    //     value = isToken0Eth
    //       ? utils.parseEther(amount)
    //       : utils.parseEther(amount1);
    //     params.push(isToken0Eth ? _token1.address : _token.address);
    //     params.push(isToken0Eth ? _amount1 : _amount);
    //     params.push(0);

    //     approveTxs = await getApproveData(
    //       provider,
    //       isToken0Eth ? _token1.address : _token.address,
    //       isToken0Eth ? _amount1 : _amount,
    //       accountAddress,
    //       address
    //     );
    //   } else {
    //     // addLiquidity
    //     funcName = "addLiquidity";
    //     params.push(_token.address);
    //     params.push(_token1.address);
    //     params.push(_amount);
    //     params.push(_amount1);
    //     params.push(0);
    //     params.push(0);

    //     const approveTx1 = await getApproveData(
    //       provider,
    //       _token.address,
    //       _amount,
    //       accountAddress,
    //       address
    //     );
    //     const approveTx2 = await getApproveData(
    //       provider,
    //       _token1.address,
    //       _amount1,
    //       accountAddress,
    //       address
    //     );
    //     approveTxs = [...approveTx1, ...approveTx2];
    //   }
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
    funcName || getFunctionName(_protocolName, "deposit"),
    params,
    value.toString()
  );
  return { transactions: [...approveTxs, data] };
};
