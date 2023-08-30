import httpStatus from "http-status";
import { ethers, utils } from "ethers";

import {
  getChainIdFromName,
  getRpcUrlForChain,
  getFeeDataWithDynamicMaxPriorityFeePerGas,
  getTokensForChain,
  getApproveData,
  getProtocolAddressForChain,
  getFunctionData,
  getABIForProtocol,
  getFunctionName,
} from "../utils/index.js";

import ERC20_ABI from "../abis/erc20.abi.js";
import { getBestSwapRoute } from "../utils/swap.js";
import { getBestBridgeRoute } from "../utils/bridge.js";
import { NATIVE_TOKEN } from "../constants.js";

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
    let decimals = 18;
    let _sourceAmount;
    if (_sourceToken.address == NATIVE_TOKEN) {
      balance = await provider.getBalance(accountAddress);
      _sourceAmount = utils.parseEther(sourceAmount);
    } else {
      token = new ethers.Contract(_sourceToken.address, ERC20_ABI, provider);
      balance = await token.balanceOf(accountAddress);
      decimals = await token.decimals();
      _sourceAmount = utils.parseUnits(sourceAmount, decimals);
    }
    if (balance.lt(_sourceAmount)) {
      throw new Error("Insufficient balance");
    }

    // Step 2: Get best swap route
    const gasPrice = await provider.getGasPrice();
    const data = await getBestSwapRoute(
      chainId,
      accountAddress,
      {
        address: _sourceToken.address,
        symbol: sourceToken,
        decimals,
      },
      {
        address: _destinationToken.address,
        symbol: destinationToken,
      },
      sourceAmount,
      gasPrice
    );

    // Step 3: Parse the response and extract relevant information for the transaction
    if (!data) {
      throw new Error("No swap route found");
    }

    // Step 4: Check user allowance and approve if necessary (Web3.js required)
    let nonce = await provider.getTransactionCount(accountAddress);
    if (_sourceToken.address != NATIVE_TOKEN) {
      const approveData = await getApproveData(
        provider,
        _sourceToken.address,
        _sourceAmount,
        accountAddress,
        data.to,
        nonce
      );
      if (approveData) {
        nonce++;
        transactions.push(approveData);
      }
    }

    // Step 5: Return the transaction details to the client
    transactions.push({
      from: accountAddress,
      to: data.to,
      value: data.value,
      data: data.data,
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
    let decimals = 18;
    let _sourceAmount;
    if (_sourceToken.address == NATIVE_TOKEN) {
      balance = await provider.getBalance(accountAddress);
      _sourceAmount = utils.parseEther(sourceAmount);
    } else {
      token = new ethers.Contract(_sourceToken.address, ERC20_ABI, provider);
      balance = await token.balanceOf(accountAddress);
      decimals = await token.decimals();
      _sourceAmount = utils.parseUnits(sourceAmount, decimals);
    }
    if (balance.lt(_sourceAmount)) {
      throw new Error("Insufficient balance");
    }

    // Step 2: Make an HTTP request to Metamask Bridge API
    const data = await getBestBridgeRoute(
      sourceChainId,
      destinationChainId,
      accountAddress,
      {
        address: _sourceToken.address,
        symbol: sourceToken,
        decimals,
      },
      {
        address: _destinationToken.address,
        symbol: destinationToken,
      },
      sourceAmount
    );

    // Step 3: Parse the response and extract relevant information for the bridge transaction
    if (!data) {
      throw new Error("No bridge route found");
    }

    let transactions = [];

    // Step 4: Check user allowance and approve if necessary (Web3.js required)
    let nonce = await provider.getTransactionCount(accountAddress);
    if (_sourceToken.address != NATIVE_TOKEN) {
      const approveData = await getApproveData(
        provider,
        _sourceToken.address,
        _sourceAmount,
        accountAddress,
        data.to,
        nonce
      );
      if (approveData) {
        nonce++;
        transactions.push(approveData);
      }
    }

    // Step 5: Return the transaction details to the client
    transactions.push({
      from: accountAddress,
      to: data.to,
      value: data.value,
      data: data.data,
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
const protocol = async (req, res) => {
  try {
    const {
      accountAddress,
      chainName,
      protocolName,
      action,
      token0,
      token1,
      amount,
    } = req.body;

    const chainId = getChainIdFromName(chainName);
    const tokens = await getTokensForChain(chainId);
    const _token0 = tokens.find(
      (t) => t.symbol.toLowerCase() === token0.toLowerCase()
    );
    if (!["aave", "compound"].includes(protocolName) && !_token0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Token0 not found on the specified chain.",
      });
    }
    const _token1 = tokens.find(
      (t) => t.symbol.toLowerCase() === token1.toLowerCase()
    );
    if (!["aave", "compound", "hop"].includes(protocolName) && !_token1) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Token1 not found on the specified chain.",
      });
    }

    const rpcUrl = getRpcUrlForChain(chainId);
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);

    let address = null;
    let abi = [];
    const params = [];

    switch (protocolName) {
      case "aave": {
        address = getProtocolAddressForChain(protocolName, chainId, "stkAAVE"); // TODO: change key based request
        abi = getABIForProtocol(protocolName);
        params.push(token0); // eoa in this case
        params.push(amount);
        break;
      }
      case "compound": {
        const funcName = getFunctionName(protocolName, action);
        address = getProtocolAddressForChain(
          protocolName,
          funcName === "claim" ? "rewards" : "usdc" // TODO: change key based on request
        );
        abi = getABIForProtocol(
          protocolName,
          funcName === "claim" ? "rewards" : "usdc" // TODO: change key based on request
        );
        params.push(token0); // eoa in this case
        params.push(token1); // eoa in this case
        params.push(true);
        break;
      }
      case "hop": {
        address = getProtocolAddressForChain(
          protocolName,
          `${token0.toLowerCase()}${
            token1.toLowerCase() === "hop" ? "" : `-${token1.toLowerCase()}`
          }`
        );
        abi = getABIForProtocol(protocolName);
        if (action !== "claim") params.push(amount);
        break;
      }
      default: {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json({ status: "error", message: "Protocol not supported" });
      }
    }

    if (!address) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Protocol address not found on the specified chain.",
      });
    }
    if (!abi || abi.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Protocol ABI not found for the specified action.",
      });
    }

    const data = getFunctionData(
      address,
      abi,
      provider,
      getFunctionName(protocolName, action),
      params,
      "0x0"
    );
    return res.status(httpStatus.OK).json({ status: "success", data });
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
  protocol,
  transfer,
  getTokenAddress,
  getTokenBalance,
};
