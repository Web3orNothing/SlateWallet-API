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

  let approveTxs = [];
  let address = null;
  let abi = [];
  const params = [];

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
  return { transactions: [...approveTxs, ...data] };
};

/*
  // Get execution fee and minimum USD value for amount of  token
const executionFee = await positionRouter.minExecutionFee();
const usdMin = await vault.tokenToUsdMin(Token, Amount);

// Populate transaction data
if (action == "long" || action == "short") {
  const isApprovedPlugin = await router.approvedPlugins(
    account,
    addresses[network].positionRouter
  );
  const allowance = await token.allowance(
    account,
    addresses[network].router
  );

  // If position router is not approved yet
  if (!isApprovedPlugin) {
    // Add position router to approved plugin list
    transactions.push(
      await router.populateTransaction.approvePlugin(
        addresses[network].positionRouter
      )
    );
  }

  // Set allowance if allowance is not enough
  if (allowance.lt(Amount)) {
    // If allowance is not zero, reset it to 0
    if (!allowance.isZero()) {
      transactions.push(
        await token.populateTransaction.approve(
          addresses[network].router,
          0
        )
      );
    }
    // Approve router to spend amount of  token
    transactions.push(
      await token.populateTransaction.approve(
        addresses[network].router,
        Amount
      )
    );
  }

  const sizeDelta = usdMin.mul(leverageMultiplier);

  if (action == "long") {
    // Get transaction data for creation of long position
    const priceMax = await vault.getMaxPrice(Token);
    transactions.push({
      ...(await positionRouter.populateTransaction.createIncreasePosition(
        [Token],
        outputToken,
        Amount,
        0, // Minimum out when swap
        sizeDelta, // USD value of the change in position size
        true, // Whether to long or short
        priceMax, // Acceptable price
        executionFee, // Execution fee
        constants.HashZero, // Referral code
        constants.AddressZero // An optional callback contract
      )),
      value: executionFee.toNumber(),
    });
  } else {
    // Get transaction data for creation of short position
    const priceMin = await vault.getMinPrice(Token);
    transactions.push({
      ...(await positionRouter.populateTransaction.createIncreasePosition(
        [Token],
        outputToken,
        Amount,
        0, // Minimum out when swap
        sizeDelta, // USD value of the change in position size
        false, // Whether to long or short
        priceMin, // Acceptable price
        executionFee, // Execution fee
        constants.HashZero, // Referral code
        constants.AddressZero // An optional callback contract
      )),
      value: executionFee.toNumber(),
    });
  }
} else {
  // Determine whether it's long or short
  const isLong = !(await vault.stableTokens(Token));
  const acceptablePrice = isLong
    ? await vault.getMinPrice(Token)
    : await vault.getMaxPrice(Token);
  const sizeDelta = usdMin.mul(leverageMultiplier);

  // Get transaction data for position close
  transactions.push({
    ...(await positionRouter.populateTransaction.createDecreasePosition(
      [Token],
      outputToken,
      usdMin, // The amount of collateral in USD value to withdraw
      sizeDelta, // The USD value of the change in position size
      isLong, // Whether the position is a long or short
      receiver, // The address to receive the withdrawn tokens
      acceptablePrice, // Acceptable price
      0, // Minimum out when swap
      executionFee, // Execution fee
      false, // Whether withdraw ETH when if WETH will be withdrawn
      constants.AddressZero // // An optional callback contract
    )),
    value: executionFee.toNumber(),
  });
} 
*/
