import httpStatus from "http-status";
import axios from "axios";
import { ethers, BigNumber } from "ethers";

import {
  metamaskApiHeaders,
  getChainIdFromName,
  getRpcUrlForChain,
  getFeeDataWithDynamicMaxPriorityFeePerGas,
  getTokensForChain,
  getTokenBalancesForUser,
} from "../utils.js";

import ERC20_ABI from "../abis/erc20.json" assert { type: "json" };

const NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";

const swap = async (req, res) => {
  try {
    const {
      accountAddress,
      chainName,
      sourceAmount,
      sourceToken,
      destinationToken,
    } = req.body;
    const chainId = getChainIdFromName(chainName);
    if (!chainId) {
      throw new Error("Invalid chain name");
    }

    const transactions = [];

    // Step 1: Check user balance on the given chain (Web3.js required)
    const rpcUrl = getRpcUrlForChain(chainId);
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);
    let balance;
    let token;
    if (sourceToken == NATIVE_TOKEN) {
      balance = await provider.getBalance(accountAddress);
    } else {
      token = new ethers.Contract(sourceToken, ERC20_ABI, provider);
      balance = await token.balanceOf(accountAddress);
    }
    if (balance.lt(BigNumber.from(sourceAmount))) {
      throw new Error("Insufficient balance");
    }

    // Step 2: Make an HTTP request to Metamask Swap API
    const queryURL = `https://swap.metaswap.codefi.network/networks/${chainId}/trades`;
    const queryParams = new URLSearchParams({
      sourceAmount,
      sourceToken,
      destinationToken,
      slippage: 2,
      walletAddress: accountAddress,
      timeout: 10000,
      enableDirectWrapping: true,
      includeRoute: true,
    });
    const response = await axios.get(`${queryURL}?${queryParams}`, {
      headers: metamaskApiHeaders,
    });

    // Step 3: Parse the response and extract relevant information for the transaction
    if (!response) {
      throw new Error("No trades found in the response.");
    }

    let i = 0;
    let trade = null;
    while (!trade) {
      trade = response.data[i]["trade"];
      i += 1;
    }

    // Step 4: Check user allowance and approve if necessary (Web3.js required)
    let nonce = await provider.getTransactionCount(accountAddress);
    if (sourceToken != NATIVE_TOKEN) {
      const allowance = await token.allowance(accountAddress, trade.to);
      if (allowance.lt(BigNumber.from(sourceAmount))) {
        const approveData = token.interface.encodeFunctionData("approve", [
          trade.to,
          BigNumber.from(sourceAmount),
        ]);
        const transactionDetails = {
          from: trade.from,
          to: sourceAmount,
          gas: 355250,
          value: 0,
          data: approveData,
          nonce,
          ...(await getFeeDataWithDynamicMaxPriorityFeePerGas(provider)),
        };
        nonce++;
        transactions.push(transactionDetails);
      }
    }

    // Step 5: Return the transaction details to the client
    const transactionDetails = {
      from: accountAddress,
      to: trade.to,
      gas: 355250,
      value: trade.value,
      data: trade.data,
      nonce,
      ...(await getFeeDataWithDynamicMaxPriorityFeePerGas(provider)),
    };
    transactions.push(transactionDetails);

    res.status(httpStatus.OK).json({ status: "success", transactions });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
};

const bridge = async (req, res) => {
  try {
    const { sourceChainName, destinationChainName, token, amount } = req.body;
    const sourceChainId = getChainIdFromName(sourceChainName);
    const destinationChainId = getChainIdFromName(destinationChainName);

    // Step 1: Check user balance and allowance on the source chain (Web3.js required)

    // Step 2: Make an HTTP request to Metamask Bridge API
    const queryURL = "https://bridge.metaswap.codefi.network/getQuote";
    const queryParams = new URLSearchParams({
      walletAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
      srcChainId: sourceChainId,
      destChainId: destinationChainId,
      srcTokenAddress: token, // need to get token address on source chain
      destTokenAddress: token, // need to get token address on destination chain
      srcTokenAmount: amount,
      slippage: 0.5,
      aggIds: "socket,lifi",
      insufficientBal: false,
    });
    const response = await axios.get(`${queryURL}?${queryParams}`, {
      headers: metamaskApiHeaders,
    });

    // Step 3: Parse the response and extract relevant information for the bridge transaction
    const { data: quoteData } = response;
    const { chainId, to, from, value, data } = quoteData;

    let i = 0;
    let trade = null;
    while (!trade) {
      trade = response["data"][i]["trade"];
      i += 1;
    }

    // Step 4: Return the transaction details to the client
    const transactionDetails = {
      from: trade.from,
      to: trade.to,
      gas: 355250,
      maxFeePerGas: 355250,
      maxPriorityFeePerGas: 355250,
      gasPrice: 355250,
      value: trade.value,
      data: "0x",
      nonce: 101,
    };

    res
      .status(httpStatus.OK)
      .json({ status: "success", transaction: transactionDetails });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
};

const transfer = async (req, res) => {
  try {
    const { accountAddress, token, amount, recipient, chainName } = req.body;

    // Step 1: Check user balance on the chain (Web3.js required)

    // Step 2: Return the transaction details to the client
    const transactionDetails = {
      from: accountAddress,
      to: recipient,
      gas: 355250,
      maxFeePerGas: 355250,
      maxPriorityFeePerGas: 355250,
      gasPrice: 355250,
      value: amount,
      data: "transaction_data", // For ERC20 token transfers, this field may contain the encoded transfer function call.
      nonce: "nonce",
    };

    res
      .status(httpStatus.OK)
      .json({ status: "success", transaction: transactionDetails });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
};

const getTokenBalance = async (req, res) => {
  try {
    const { accountAddress, chainName, tokenName } = req.query;
    const chainId = getChainIdFromName(chainName);

    // Step 1: Fetch the token address for the given tokenName on the specified chain
    const tokens = await getTokensForChain(chainId);
    const token = tokens.find(
      (t) => t.symbol.toLowerCase() === tokenName.toLowerCase()
    );
    if (!token) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Token not found on the specified chain.",
      });
    }

    // Step 2: Fetch the user's token balance using the MetaFi API
    const response = await getTokenBalancesForUser(accountAddress, chainId);
    const nativeBalances = [response.nativeBalance];
    const nativeBalance = nativeBalances.find(
      (b) => b.address === token.address
    );
    const tokenBalance = response.tokenBalances.find(
      (b) => b.address === token.address
    );
    if (!tokenBalance && !nativeBalance) {
      return res
        .status(httpStatus.OK)
        .json({ status: "success", balance: "0" });
    }
    res.status(httpStatus.OK).json({
      status: "success",
      balance: (tokenBalance || nativeBalance).balance,
    });
  } catch (err) {
    console.error("Error:", err);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ status: "error", message: "Internal server error" });
  }
};

export default {
  swap,
  bridge,
  transfer,
  getTokenBalance,
};
