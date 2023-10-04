/*
  // Get execution fee and minimum USD value for amount of input token
  const executionFee = await positionRouter.minExecutionFee();
  const usdMin = await vault.tokenToUsdMin(inputToken, inputAmount);

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
    if (allowance.lt(inputAmount)) {
      // If allowance is not zero, reset it to 0
      if (!allowance.isZero()) {
        transactions.push(
          await token.populateTransaction.approve(addresses[network].router, 0)
        );
      }
      // Approve router to spend amount of input token
      transactions.push(
        await token.populateTransaction.approve(
          addresses[network].router,
          inputAmount
        )
      );
    }

    const sizeDelta = usdMin.mul(leverageMultiplier);

    if (action == "long") {
      // Get transaction data for creation of long position
      const priceMax = await vault.getMaxPrice(inputToken);
      transactions.push({
        ...(await positionRouter.populateTransaction.createIncreasePosition(
          [inputToken],
          outputToken,
          inputAmount,
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
      const priceMin = await vault.getMinPrice(inputToken);
      transactions.push({
        ...(await positionRouter.populateTransaction.createIncreasePosition(
          [inputToken],
          outputToken,
          inputAmount,
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
    const isLong = !(await vault.stableTokens(inputToken));
    const acceptablePrice = isLong
      ? await vault.getMinPrice(inputToken)
      : await vault.getMaxPrice(inputToken);
    const sizeDelta = usdMin.mul(leverageMultiplier);

    // Get transaction data for position close
    transactions.push({
      ...(await positionRouter.populateTransaction.createDecreasePosition(
        [inputToken],
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

export default [
  {
    inputs: [
      {
        internalType: "address",
        name: "_vault",
        type: "address",
      },
      {
        internalType: "address",
        name: "_router",
        type: "address",
      },
      {
        internalType: "address",
        name: "_weth",
        type: "address",
      },
      {
        internalType: "address",
        name: "_shortsTracker",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_depositFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_minExecutionFee",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "callbackTarget",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "success",
        type: "bool",
      },
    ],
    name: "Callback",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "address",
        name: "indexToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "collateralDelta",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sizeDelta",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isLong",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "acceptablePrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minOut",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "executionFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "blockGap",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timeGap",
        type: "uint256",
      },
    ],
    name: "CancelDecreasePosition",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "address",
        name: "indexToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minOut",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sizeDelta",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isLong",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "acceptablePrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "executionFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "blockGap",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timeGap",
        type: "uint256",
      },
    ],
    name: "CancelIncreasePosition",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "address",
        name: "indexToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "collateralDelta",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sizeDelta",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isLong",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "acceptablePrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minOut",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "executionFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "queueIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "blockTime",
        type: "uint256",
      },
    ],
    name: "CreateDecreasePosition",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "address",
        name: "indexToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minOut",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sizeDelta",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isLong",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "acceptablePrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "executionFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "queueIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "blockTime",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "gasPrice",
        type: "uint256",
      },
    ],
    name: "CreateIncreasePosition",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sizeDelta",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "marginFeeBasisPoints",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "referralCode",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "referrer",
        type: "address",
      },
    ],
    name: "DecreasePositionReferral",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "address",
        name: "indexToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "collateralDelta",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sizeDelta",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isLong",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "acceptablePrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minOut",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "executionFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "blockGap",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timeGap",
        type: "uint256",
      },
    ],
    name: "ExecuteDecreasePosition",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address[]",
        name: "path",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "address",
        name: "indexToken",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minOut",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sizeDelta",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isLong",
        type: "bool",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "acceptablePrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "executionFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "blockGap",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timeGap",
        type: "uint256",
      },
    ],
    name: "ExecuteIncreasePosition",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sizeDelta",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "marginFeeBasisPoints",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "referralCode",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "referrer",
        type: "address",
      },
    ],
    name: "IncreasePositionReferral",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "admin",
        type: "address",
      },
    ],
    name: "SetAdmin",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "callbackGasLimit",
        type: "uint256",
      },
    ],
    name: "SetCallbackGasLimit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "minBlockDelayKeeper",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minTimeDelayPublic",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxTimeDelay",
        type: "uint256",
      },
    ],
    name: "SetDelayValues",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "depositFee",
        type: "uint256",
      },
    ],
    name: "SetDepositFee",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "increasePositionBufferBps",
        type: "uint256",
      },
    ],
    name: "SetIncreasePositionBufferBps",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bool",
        name: "isLeverageEnabled",
        type: "bool",
      },
    ],
    name: "SetIsLeverageEnabled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address[]",
        name: "tokens",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "longSizes",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "shortSizes",
        type: "uint256[]",
      },
    ],
    name: "SetMaxGlobalSizes",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "minExecutionFee",
        type: "uint256",
      },
    ],
    name: "SetMinExecutionFee",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isActive",
        type: "bool",
      },
    ],
    name: "SetPositionKeeper",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "referralStorage",
        type: "address",
      },
    ],
    name: "SetReferralStorage",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "increasePositionRequestKeysStart",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "decreasePositionRequestKeysStart",
        type: "uint256",
      },
    ],
    name: "SetRequestKeysStartValues",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "WithdrawFees",
    type: "event",
  },
  {
    inputs: [],
    name: "BASIS_POINTS_DIVISOR",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "address",
        name: "_spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "callbackGasLimit",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_key",
        type: "bytes32",
      },
      {
        internalType: "address payable",
        name: "_executionFeeReceiver",
        type: "address",
      },
    ],
    name: "cancelDecreasePosition",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_key",
        type: "bytes32",
      },
      {
        internalType: "address payable",
        name: "_executionFeeReceiver",
        type: "address",
      },
    ],
    name: "cancelIncreasePosition",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_path",
        type: "address[]",
      },
      {
        internalType: "address",
        name: "_indexToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_collateralDelta",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_sizeDelta",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_isLong",
        type: "bool",
      },
      {
        internalType: "address",
        name: "_receiver",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_acceptablePrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_minOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_executionFee",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_withdrawETH",
        type: "bool",
      },
      {
        internalType: "address",
        name: "_callbackTarget",
        type: "address",
      },
    ],
    name: "createDecreasePosition",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_path",
        type: "address[]",
      },
      {
        internalType: "address",
        name: "_indexToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amountIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_minOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_sizeDelta",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_isLong",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "_acceptablePrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_executionFee",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "_referralCode",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_callbackTarget",
        type: "address",
      },
    ],
    name: "createIncreasePosition",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_path",
        type: "address[]",
      },
      {
        internalType: "address",
        name: "_indexToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_minOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_sizeDelta",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_isLong",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "_acceptablePrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_executionFee",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "_referralCode",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_callbackTarget",
        type: "address",
      },
    ],
    name: "createIncreasePositionETH",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "decreasePositionRequestKeys",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decreasePositionRequestKeysStart",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "decreasePositionRequests",
    outputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "address",
        name: "indexToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "collateralDelta",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "sizeDelta",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isLong",
        type: "bool",
      },
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "acceptablePrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "executionFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "blockTime",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "withdrawETH",
        type: "bool",
      },
      {
        internalType: "address",
        name: "callbackTarget",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "decreasePositionsIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "depositFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_key",
        type: "bytes32",
      },
      {
        internalType: "address payable",
        name: "_executionFeeReceiver",
        type: "address",
      },
    ],
    name: "executeDecreasePosition",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_endIndex",
        type: "uint256",
      },
      {
        internalType: "address payable",
        name: "_executionFeeReceiver",
        type: "address",
      },
    ],
    name: "executeDecreasePositions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_key",
        type: "bytes32",
      },
      {
        internalType: "address payable",
        name: "_executionFeeReceiver",
        type: "address",
      },
    ],
    name: "executeIncreasePosition",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_endIndex",
        type: "uint256",
      },
      {
        internalType: "address payable",
        name: "_executionFeeReceiver",
        type: "address",
      },
    ],
    name: "executeIncreasePositions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "feeReserves",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_key",
        type: "bytes32",
      },
    ],
    name: "getDecreasePositionRequestPath",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_key",
        type: "bytes32",
      },
    ],
    name: "getIncreasePositionRequestPath",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_index",
        type: "uint256",
      },
    ],
    name: "getRequestKey",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "getRequestQueueLengths",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "gov",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "increasePositionBufferBps",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "increasePositionRequestKeys",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "increasePositionRequestKeysStart",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "increasePositionRequests",
    outputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "address",
        name: "indexToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minOut",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "sizeDelta",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "isLong",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "acceptablePrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "executionFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "blockTime",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "hasCollateralInETH",
        type: "bool",
      },
      {
        internalType: "address",
        name: "callbackTarget",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "increasePositionsIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isLeverageEnabled",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "isPositionKeeper",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "maxGlobalLongSizes",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "maxGlobalShortSizes",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxTimeDelay",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minBlockDelayKeeper",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minExecutionFee",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minTimeDelayPublic",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "referralStorage",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "router",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "_receiver",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "sendValue",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_admin",
        type: "address",
      },
    ],
    name: "setAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_callbackGasLimit",
        type: "uint256",
      },
    ],
    name: "setCallbackGasLimit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_minBlockDelayKeeper",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_minTimeDelayPublic",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_maxTimeDelay",
        type: "uint256",
      },
    ],
    name: "setDelayValues",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_depositFee",
        type: "uint256",
      },
    ],
    name: "setDepositFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_gov",
        type: "address",
      },
    ],
    name: "setGov",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_increasePositionBufferBps",
        type: "uint256",
      },
    ],
    name: "setIncreasePositionBufferBps",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_isLeverageEnabled",
        type: "bool",
      },
    ],
    name: "setIsLeverageEnabled",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_tokens",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "_longSizes",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "_shortSizes",
        type: "uint256[]",
      },
    ],
    name: "setMaxGlobalSizes",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_minExecutionFee",
        type: "uint256",
      },
    ],
    name: "setMinExecutionFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_account",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_isActive",
        type: "bool",
      },
    ],
    name: "setPositionKeeper",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_referralStorage",
        type: "address",
      },
    ],
    name: "setReferralStorage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_increasePositionRequestKeysStart",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_decreasePositionRequestKeysStart",
        type: "uint256",
      },
    ],
    name: "setRequestKeysStartValues",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "shortsTracker",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "vault",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "weth",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
      {
        internalType: "address",
        name: "_receiver",
        type: "address",
      },
    ],
    name: "withdrawFees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];
