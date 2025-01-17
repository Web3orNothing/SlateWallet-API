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

import { NATIVE_TOKEN } from "../../constants.js";

export const getStakeData = async (
  accountAddress,
  protocolName,
  chainName,
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

  let approveTxs = [];
  let address = null;
  let abi = [];
  const params = [];

  switch (_protocolName) {
    case "hop": {
      let key = token.toLowerCase();
      const outputToken = "TODO: lp token 1 symbol";
      if (outputToken.toLowerCase() !== "hop")
        key += `-${outputToken.toLowerCase()}`;
      address = getProtocolAddressForChain(_protocolName, chainId, key);
      abi = getABIForProtocol(_protocolName);
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
    case "lido": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      if (+amount < 32) return { error: "Too less amount" };

      params.push(Math.floor(+amount < 32));
      params.push(1); // TODO: monitor available stake modules
      params.push("0x");
      break;
    }
    case "gmx": {
      address = getProtocolAddressForChain(
        _protocolName,
        chainId,
        "staked" + token.toUpperCase() + "Tracker"
      );
      abi = getABIForProtocol(_protocolName, "reward-tracker");
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
    case "lodestar": {
      address = getProtocolAddressForChain(_protocolName, chainId, "staking");
      abi = getABIForProtocol(_protocolName, "staking");
      params.push(_amount);
      params.push(86400 /* uint256 lockTime */);

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
    case "plutus": {
      address = getProtocolAddressForChain(_protocolName, chainId, "staking-1");
      abi = getABIForProtocol(_protocolName, "staking");
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
    case "kwenta": {
      address = getProtocolAddressForChain(_protocolName, chainId, "staking");
      abi = getABIForProtocol(_protocolName, "staking");
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
    case "stargate": {
      const key = true /* based on param */ ? "staking" : "staking-time";
      address = getProtocolAddressForChain(_protocolName, chainId, key);
      abi = getABIForProtocol(_protocolName, key);
      params.push(0 /* uint256 _poolId */);
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
    getFunctionName(_protocolName, "stake"),
    params,
    "0"
  );
  return { transactions: [...approveTxs, data] };
};
