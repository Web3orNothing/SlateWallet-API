import httpStatus from "http-status";
import axios from "axios";
import { ethers, utils } from "ethers";

import {
  metamaskApiHeaders,
  getChainIdFromName,
  getRpcUrlForChain,
  getFeeDataWithDynamicMaxPriorityFeePerGas,
  getTokensForChain,
  getApproveData,
} from "../utils/index.js";

import ERC20_ABI from "../abis/erc20.abi.js";

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

    const tokens = await getTokensForChain(chainId);
    const _sourceToken = tokens.find(
      (t) => t.symbol.toLowerCase() === sourceToken.toLowerCase()
    );
    if (!_sourceToken) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Token not found on the specified chain.",
      });
    }
    const _destinationToken = tokens.find(
      (t) => t.symbol.toLowerCase() === destinationToken.toLowerCase()
    );
    if (!_destinationToken) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Token not found on the specified chain.",
      });
    }

    // Step 1: Check user balance on the given chain (Web3.js required)
    const rpcUrl = getRpcUrlForChain(chainId);
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);
    let balance;
    let token;
    let _sourceAmount;
    if (_sourceToken.address == NATIVE_TOKEN) {
      balance = await provider.getBalance(accountAddress);
      _sourceAmount = utils.parseEther(sourceAmount);
    } else {
      token = new ethers.Contract(_sourceToken.address, ERC20_ABI, provider);
      balance = await token.balanceOf(accountAddress);
      const decimals = await token.decimals();
      _sourceAmount = utils.parseUnits(sourceAmount, decimals);
    }
    if (balance.lt(_sourceAmount)) {
      throw new Error("Insufficient balance");
    }

    // Step 2: Make an HTTP request to Metamask Swap API
    const queryURL = `https://swap.metaswap.codefi.network/networks/${chainId}/trades`;
    const queryParams = new URLSearchParams({
      sourceAmount: _sourceAmount.toString(),
      sourceToken: _sourceToken.address,
      destinationToken: _destinationToken.address,
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
    if (_sourceToken.address != NATIVE_TOKEN) {
      const approveData = await getApproveData(
        provider,
        _sourceToken.address,
        _sourceAmount,
        accountAddress,
        trade.to,
        nonce
      );
      if (approveData) {
        nonce++;
        transactions.push(approveData);
      }
    }

    // Step 5: Return the transaction details to the client
    const transactionDetails = {
      from: accountAddress,
      to: trade.to,
      value: trade.value,
      data: trade.data,
      nonce,
      ...(await getFeeDataWithDynamicMaxPriorityFeePerGas(provider)),
    };
    transactions.push(transactionDetails);

    res.status(httpStatus.OK).json({ status: "success", transactions });
  } catch (err) {
    console.log("Error:", err);
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: "error", message: "Bad request" });
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

    const sourceTokens = await getTokensForChain(sourceChainId);
    const _sourceToken = sourceTokens.find(
      (t) => t.symbol.toLowerCase() === sourceToken.toLowerCase()
    );
    if (!_sourceToken) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Token not found on the specified chain.",
      });
    }
    const destinationTokens = await getTokensForChain(destinationChainId);
    const _destinationToken = destinationTokens.find(
      (t) => t.symbol.toLowerCase() === destinationToken.toLowerCase()
    );
    if (!_destinationToken) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Token not found on the specified chain.",
      });
    }

    // Step 1: Check user balance on the source chain (Web3.js required)
    const rpcUrl = getRpcUrlForChain(sourceChainId);
    const provider = new ethers.providers.JsonRpcProvider(
      rpcUrl,
      sourceChainId
    );
    let balance;
    let token;
    let _sourceAmount;
    if (_sourceToken.address == NATIVE_TOKEN) {
      balance = await provider.getBalance(accountAddress);
      _sourceAmount = utils.parseEther(sourceAmount);
    } else {
      token = new ethers.Contract(_sourceToken.address, ERC20_ABI, provider);
      balance = await token.balanceOf(accountAddress);
      const decimals = await token.decimals();
      _sourceAmount = utils.parseUnits(sourceAmount, decimals);
    }
    if (balance.lt(_sourceAmount)) {
      throw new Error("Insufficient balance");
    }

    // Step 2: Make an HTTP request to Metamask Bridge API
    const queryURL = "https://bridge.metaswap.codefi.network/getQuote";
    const queryParams = new URLSearchParams({
      walletAddress: accountAddress,
      srcChainId: sourceChainId,
      destChainId: destinationChainId,
      srcTokenAddress: _sourceToken.address,
      destTokenAddress: _destinationToken.address,
      srcTokenAmount: _sourceAmount.toString(),
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
    console.log("Error:", err);
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: "error", message: "Bad request" });
  }
};

const transfer = async (req, res) => {
  try {
    const { accountAddress, token, amount, recipient, chainName } = req.body;

    const chainId = getChainIdFromName(chainName);
    if (!chainId) {
      throw new Error("Invalid chain name");
    }

    const tokens = await getTokensForChain(chainId);
    const tokenInfo = tokens.find(
      (t) => t.symbol.toLowerCase() === token.toLowerCase()
    );
    if (!tokenInfo) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Token not found on the specified chain.",
      });
    }

    let _recipient = recipient;
    if (!ethers.utils.isAddress(recipient)) {
      // Retrieve the recipient address
      const rpcUrl = getRpcUrlForChain(1);
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl, 1);
      try {
        _recipient = await provider.resolveName(recipient);
      } catch {
        return res.status(httpStatus.BAD_REQUEST).json({
          status: "error",
          message: "Invalid recipient provided.",
        });
      }
    }

    // Step 1: Check user balance on the chain (Web3.js required)
    const rpcUrl = getRpcUrlForChain(chainId);
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);
    let balance;
    let _token;
    let _amount;
    if (tokenInfo.address == NATIVE_TOKEN) {
      balance = await provider.getBalance(accountAddress);
      _amount = utils.parseEther(amount);
    } else {
      _token = new ethers.Contract(tokenInfo.address, ERC20_ABI, provider);
      balance = await _token.balanceOf(accountAddress);
      const decimals = await _token.decimals();
      _amount = utils.parseUnits(amount, decimals);
    }
    if (balance.lt(_amount)) {
      throw new Error("Insufficient balance");
    }

    // Step 2: Return the transaction details to the client
    let nonce = await provider.getTransactionCount(accountAddress);
    let to = _recipient;
    let data = "0x";
    let value = _amount;
    if (tokenInfo.address != NATIVE_TOKEN) {
      to = tokenInfo.address;
      data = _token.interface.encodeFunctionData("transfer", [
        _recipient,
        _amount,
      ]);
      value = 0;
    }
    const transactionDetails = {
      from: accountAddress,
      to,
      value: value.toString(),
      data,
      nonce,
      ...(await getFeeDataWithDynamicMaxPriorityFeePerGas(provider)),
    };

    res
      .status(httpStatus.OK)
      .json({ status: "success", transactions: [transactionDetails] });
  } catch (err) {
    console.log("Error:", err);
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: "error", message: "Bad request" });
  }
};

const getTokenAddress = async (req, res) => {
  try {
    const { chainName, tokenName } = req.query;
    const chainId = getChainIdFromName(chainName);

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

    res.status(httpStatus.OK).json({
      status: "success",
      address: token.address,
    });
  } catch (err) {
    console.log("Error:", err);
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: "error", message: "Bad request" });
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
    console.log("Error:", err);
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: "error", message: "Bad request" });
  }
};

export default {
  swap,
  bridge,
  transfer,
  getTokenAddress,
  getTokenBalance,
};
