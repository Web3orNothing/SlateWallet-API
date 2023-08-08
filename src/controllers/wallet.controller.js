import httpStatus from "http-status";
import axios from "axios";
import { ethers, BigNumber } from "ethers";

import {
  metamaskApiHeaders,
  getChainIdFromName,
  getRpcUrlForChain,
  getFeeDataWithDynamicMaxPriorityFeePerGas,
  getTokensForChain,
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
          to: sourceToken,
          gasLimit: 355250,
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
      gasLimit: 355250,
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
    const {
      accountAddress,
      sourceChainName,
      destinationChainName,
      sourceToken,
      destinationToken,
      sourceAmount,
    } = req.body;
    const sourceChainId = getChainIdFromName(sourceChainName);
    const destinationChainId = getChainIdFromName(destinationChainName);

    // Step 1: Check user balance on the source chain (Web3.js required)
    const rpcUrl = getRpcUrlForChain(sourceChainId);
    const provider = new ethers.providers.JsonRpcProvider(
      rpcUrl,
      sourceChainId
    );
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

    // Step 2: Make an HTTP request to Metamask Bridge API
    const queryURL = "https://bridge.metaswap.codefi.network/getQuote";
    const queryParams = new URLSearchParams({
      walletAddress: accountAddress,
      srcChainId: sourceChainId,
      destChainId: destinationChainId,
      srcTokenAddress: sourceToken,
      destTokenAddress: destinationToken,
      srcTokenAmount: sourceAmount,
      slippage: 0.5,
      aggIds: "socket,lifi",
      insufficientBal: false,
    });
    const response = await axios.get(`${queryURL}?${queryParams}`, {
      headers: metamaskApiHeaders,
    });

    // Step 3: Parse the response and extract relevant information for the bridge transaction
    const { data: quoteData } = response;
    if (quoteData.length == 0) {
      throw new Error("No quotes found in the response.");
    }
    const { trade, approval } = quoteData[0];

    let transactions = [];

    // Step 4: Check user allowance and approve if necessary (Web3.js required)
    let nonce = await provider.getTransactionCount(accountAddress);
    if (approval) {
      transactions.push({
        ...approval,
        nonce,
        ...(await getFeeDataWithDynamicMaxPriorityFeePerGas(provider)),
      });
      nonce++;
    }

    // Step 5: Return the transaction details to the client
    transactions.push({
      ...trade,
      nonce,
      ...(await getFeeDataWithDynamicMaxPriorityFeePerGas(provider)),
    });

    res.status(httpStatus.OK).json({ status: "success", transactions });
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

    const chainId = getChainIdFromName(chainName);
    if (!chainId) {
      throw new Error("Invalid chain name");
    }

    // Step 1: Check user balance on the chain (Web3.js required)
    const rpcUrl = getRpcUrlForChain(chainId);
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);
    let balance;
    let _token;
    if (token == NATIVE_TOKEN) {
      balance = await provider.getBalance(accountAddress);
    } else {
      _token = new ethers.Contract(token, ERC20_ABI, provider);
      balance = await _token.balanceOf(accountAddress);
    }
    if (balance.lt(BigNumber.from(amount))) {
      throw new Error("Insufficient balance");
    }

    // Step 2: Return the transaction details to the client
    let nonce = await provider.getTransactionCount(accountAddress);
    let to = recipient;
    let data = "0x";
    let value = amount;
    if (token != NATIVE_TOKEN) {
      to = token;
      data = _token.interface.encodeFunctionData("transfer", [
        recipient,
        BigNumber.from(amount),
      ]);
      value = "0x0";
    }
    const transactionDetails = {
      from: accountAddress,
      to: recipient,
      gasLimit: 355250,
      value,
      data,
      nonce,
      ...(await getFeeDataWithDynamicMaxPriorityFeePerGas(provider)),
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

    const rpcUrl = getRpcUrlForChain(chainId);
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);

    let balance;
    if (token.address == NATIVE_TOKEN) {
      balance = await provider.getBalance(accountAddress);
    } else {
      const _token = new ethers.Contract(token.address, ERC20_ABI, provider);
      balance = await _token.balanceOf(accountAddress);
    }

    res.status(httpStatus.OK).json({
      status: "success",
      balance: balance.toString(),
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
