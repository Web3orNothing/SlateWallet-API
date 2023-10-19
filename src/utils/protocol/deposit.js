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
      break;
    }
    case "rocketpool": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
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
          spender,
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
    case "dolomite": {
      address = getProtocolAddressForChain(_protocolName, chainId);
      abi = getABIForProtocol(_protocolName);
      /* build operation and execute */
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
    //       spender,
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
    //       spender,
    //       address
    //     );
    //     const approveTx2 = await getApproveData(
    //       provider,
    //       _token1.address,
    //       _amount1,
    //       spender,
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
