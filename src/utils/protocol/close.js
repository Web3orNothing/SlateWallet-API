import { constants, ethers } from "ethers";
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

export const getCloseData = async (
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
    const positionRouterAddress = getProtocolAddressForChain(
      _protocolName,
      chainId,
      "positionRouter"
    );
    const vaultAddress = getProtocolAddressForChain(
      _protocolName,
      chainId,
      "vault"
    );
    const positionRouterAbi = getABIForProtocol(
      _protocolName,
      "positionRouter"
    );
    const vaultAbi = getABIForProtocol(_protocolName, "vault");
    const positionRouter = new Contract(
      positionRouterAddress,
      positionRouterAbi,
      provider
    );
    const vault = new Contract(vaultAddress, vaultAbi, provider);
    const executionFee = await positionRouter.minExecutionFee();
    const usdMin = await vault.tokenToUsdMin(_inputToken.address, _amount);

    const isLong = !(await vault.stableTokens(_inputToken.address));
    const acceptablePrice = isLong
      ? await vault.getMinPrice(_inputToken.address)
      : await vault.getMaxPrice(_inputToken.address);
    const sizeDelta = usdMin.mul(leverageMultiplier);
    transactions.push(
      await getFunctionData(
        positionRouterAddress,
        positionRouterAbi,
        provider,
        "createDecreasePosition",
        [
          [_inputToken.address],
          _outputToken.address,
          usdMin,
          sizeDelta,
          isLong,
          accountAddress,
          acceptablePrice,
          0,
          executionFee,
          false,
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
    getFunctionName(_protocolName, "short"),
    params,
    "0"
  );
  return { transactions: [...approveTxs, data] };
};
