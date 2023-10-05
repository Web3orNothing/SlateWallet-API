import { ethers } from "ethers";
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
  getTokenAmount,
} from "../utils/index.js";

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
  if (["sushiswap", "uniswap", "curve", "balancer"].includes(protocolName)) {
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

  const { amount: _inputAmount, decimals } = await getTokenAmount(
    _inputToken.address,
    provider,
    spender,
    inputAmount
  );

  let approveTxs = [];
  let address = null;
  let abi = [];
  const params = [];
  switch (_protocolName) {
    case "sushiswap":
    case "uniswap":
    case "curve":
    case "balancer": {
      switch (action) {
        case "swap": {
          let dexList;
          if (_protocolName === "sushiswap") {
            dexList = ["SushiSwap"];
          } else if (_protocolName === "uniswap") {
            dexList = ["UniswapV2", "UniswapV3"];
          } else if (_protocolName === "curve") {
            dexList = ["Curve"];
          } else if (_protocolName === "balancer") {
            dexList = ["Balancer"];
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
              const approveTxs = await getApproveData(
                provider,
                _inputToken.address,
                _inputAmount,
                spender,
                tx.to
              );
              transactions.push(...approveTxs);
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
      address = getProtocolAddressForChain(_protocolName, chainId, "stkAAVE");
      abi = getABIForProtocol(_protocolName);
      params.push(spender);
      params.push(_inputAmount);

      if (_inputToken.address !== NATIVE_TOKEN && action === "deposit") {
        approveTxs = await getApproveData(
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
      const key = action === "claim" ? "rewards" : inputToken.toLowerCase();
      address = getProtocolAddressForChain(_protocolName, chainId, key);
      abi = getABIForProtocol(_protocolName, key);
      if (action === "claim") {
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

        if (_inputToken.address !== NATIVE_TOKEN && action === "deposit") {
          approveTxs = await getApproveData(
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
      let key = inputToken.toLowerCase();
      if (outputToken.toLowerCase() !== "hop")
        key += `-${outputToken.toLowerCase()}`;
      address = getProtocolAddressForChain(_protocolName, chainId, key);
      abi = getABIForProtocol(_protocolName);
      if (action !== "claim") {
        params.push(_inputAmount);

        if (_inputToken.address !== NATIVE_TOKEN && action === "deposit") {
          approveTxs = await getApproveData(
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
    case "lido": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      params.push(0 /* uint256 _maxDepositsCount */);
      params.push(0 /* uint256 _stakingModuleId */);
      params.push("0x0" /* bytes _depositCalldata */);
      break;
    }
    case "gmx": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      // TODO: Build transaction
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
              await token.populateTransaction.approve(
                addresses[network].router,
                0
              )
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
      } */

      break;
    }
    case "rocketpool": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      if (action === "withdraw") params.push(_inputAmount);
      break;
    }
    case "pendle": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      if (action === "withdraw") params.push(_inputAmount);
      else if (action === "lock") {
        params.push(_inputAmount);
        params.push(0 /* uint128 newExpiry */);

        if (_inputToken.address !== NATIVE_TOKEN) {
          approveTxs = await getApproveData(
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
    case "jonesdao": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      params.push(0 /* uint256 _pid */);
      if (action !== "harvest") params.push(_inputAmount);

      if (_inputToken.address !== NATIVE_TOKEN && action === "deposit") {
        approveTxs = await getApproveData(
          provider,
          _inputToken.address,
          _inputAmount,
          spender,
          address
        );
      }
      break;
    }
    case "lodestar": {
      const key = action === "vote" ? "voting" : "staking";
      address = getProtocolAddressForChain(_protocolName, chainId, key);
      abi = getABIForProtocol(_protocolName, key);
      if (action === "vote") {
        params.push([] /* string[] tokens */);
        params.push([] /* VotingConstants.OperationType[] operations */);
        params.push([] /* uint256[] shares */);
      } else {
        if (action === "stake") params.push(spender);
        params.push(_inputAmount);

        if (_inputToken.address !== NATIVE_TOKEN && action === "stake") {
          approveTxs = await getApproveData(
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
    case "dolomite": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      /* build operation and execute */
      break;
    }
    case "plutus": {
      const key =
        action === "deposit" || action === "withdraw"
          ? "masterchef"
          : action === "stake" || stake === "unstake"
          ? "staking"
          : "voting";
      address = getProtocolAddressForChain(
        _protocolName,
        chainId,
        key === "staking" ? key + "-" + [1, 3, 6][0 /* based on param */] : key
      );
      abi = getABIForProtocol(_protocolName, key);
      if (key === "staking") {
        if (action === "stake") params.push(_inputAmount);
      } else if (key === "masterchef") {
        params.push(0 /* uint256 _pid */);
        params.push(_inputAmount);
      }

      if (
        _inputToken.address !== NATIVE_TOKEN &&
        (action === "deposit" || action === "stake")
      ) {
        approveTxs = await getApproveData(
          provider,
          _inputToken.address,
          _inputAmount,
          spender,
          address
        );
      }
      break;
    }
    case "rodeo": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      params.push(_inputAmount);
      if (action === "deposit" || action === "withdraw") params.push(spender);

      if (
        _inputToken.address !== NATIVE_TOKEN &&
        (action === "deposit" || action === "borrow")
      ) {
        approveTxs = await getApproveData(
          provider,
          _inputToken.address,
          _inputAmount,
          spender,
          address
        );
      }
      break;
    }
    case "kwenta": {
      const key =
        action === "stake" || action === "unstake" ? "staking" : "margin";
      address = getProtocolAddressForChain(_protocolName, chainId, key);
      abi = getABIForProtocol(_protocolName, key);

      if (key === "staking") {
        params.push(_inputAmount);
        if (_inputToken.address !== NATIVE_TOKEN && action === "stake") {
          approveTxs = await getApproveData(
            provider,
            _inputToken.address,
            _inputAmount,
            spender,
            address
          );
        }
      } else {
        params.push([] /* IAccount.Command[] _commands */);
        params.push([] /* bytes[] _inputs */);
      }
      break;
    }
    case "stargate": {
      const key = true /* based on param */ ? "staking" : "staking-time";
      address = getProtocolAddressForChain(_protocolName, chainId, key);
      abi = getABIForProtocol(_protocolName, key);

      if (action === "unstake") params.push(spender);
      params.push(0 /* uint256 _pid */);
      params.push(_inputAmount);

      if (_inputToken.address !== NATIVE_TOKEN && action === "stake") {
        approveTxs = await getApproveData(
          provider,
          _inputToken.address,
          _inputAmount,
          spender,
          address
        );
      }
      break;
    }
    case "thena": {
      if (action !== "vote") break;

      address = getProtocolAddressForChain(_protocolName, chainId, "voting");
      abi = getABIForProtocol(_protocolName, "voting");
      params.push(0 /* uint256 _tokenId */);
      params.push([] /* address[] _poolVote */);
      params.push([] /* uint256[] _weights */);

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
  return { transactions: [...approveTxs, ...data] };
};
