import { constants, ethers } from "ethers";
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
import ERC20_ABI from "../../abis/erc20.abi.js";

import { NATIVE_TOKEN } from "../../constants.js";

export const getLongData = async (
  accountAddress,
  protocolName,
  chainName,
  inputToken,
  inputAmount,
  outputToken,
  leverageMultiplier
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

  const { amount: _inputAmount } = await getTokenAmount(
    _inputToken.address,
    provider,
    accountAddress,
    inputAmount
  );

  if (_protocolName === "gmx") {
    const transactions = [];
    const routerAddress = getProtocolAddressForChain(
      _protocolName,
      chainId,
      "router"
    );
    const vaultAddress = getProtocolAddressForChain(
      _protocolName,
      chainId,
      "vault"
    );
    const positionRouterAddress = getProtocolAddressForChain(
      _protocolName,
      chainId,
      "positionRouter"
    );
    const routerAbi = getABIForProtocol(_protocolName, "router");
    const vaultAbi = getABIForProtocol(_protocolName, "vault");
    const positionRouterAbi = getABIForProtocol(
      _protocolName,
      "position-router"
    );
    const token = new ethers.Contract(_inputToken.address, ERC20_ABI, provider);
    const router = new ethers.Contract(routerAddress, routerAbi, provider);
    const vault = new ethers.Contract(vaultAddress, vaultAbi, provider);
    const positionRouter = new ethers.Contract(
      positionRouterAddress,
      positionRouterAbi,
      provider
    );
    const usdMin = await vault.tokenToUsdMin(_inputToken.address, _inputAmount);
    const executionFee = await positionRouter.minExecutionFee();

    const isApprovedPlugin = await router.approvedPlugins(
      accountAddress,
      positionRouterAddress
    );
    if (!isApprovedPlugin) {
      transactions.push(
        await getFunctionData(
          routerAddress,
          routerAbi,
          provider,
          "approvePlugin",
          [positionRouterAddress],
          "0"
        )
      );
    }
    const allowance = await token.allowance(accountAddress, routerAddress);
    if (allowance.lt(_inputAmount) && _inputToken.address !== NATIVE_TOKEN) {
      if (!allowance.isZero()) {
        transactions.push(
          await getFunctionData(
            _inputToken.address,
            ERC20_ABI,
            provider,
            "approve",
            [routerAddress, 0],
            "0"
          )
        );
      }
      transactions.push(
        ...(await getApproveData(
          provider,
          _inputToken.address,
          _inputAmount,
          accountAddress,
          routerAddress
        ))
      );
    }
    const sizeDelta = usdMin.mul(leverageMultiplier);
    const priceMax = await vault.getMaxPrice(_inputToken.address);
    transactions.push(
      await getFunctionData(
        positionRouterAddress,
        positionRouterAbi,
        provider,
        "createIncreasePosition",
        [
          [_inputToken.address],
          _outputToken.address,
          _inputAmount,
          0,
          sizeDelta,
          true,
          priceMax,
          executionFee,
          constants.HashZero,
          constants.AddressZero,
        ],
        executionFee.toString()
      )
    );
    return { transactions };
  }

  let approveTxs = [];
  let address = null;
  let abi = [];
  const params = [];

  switch (_protocolName) {
    case "kwenta": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);

      if (_token.address !== NATIVE_TOKEN) {
        approveTxs = await getApproveData(
          provider,
          _token.address,
          _inputAmount,
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
    getFunctionName(_protocolName, "long"),
    params,
    "0"
  );
  return { transactions: [...approveTxs, data] };
};
