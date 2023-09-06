import axios from "axios";
import httpStatus from "http-status";
import { ethers } from "ethers";

import {
  getChainIdFromName,
  getRpcUrlForChain,
  getFeeDataWithDynamicMaxPriorityFeePerGas,
  getTokenAddressForChain,
  getApproveData,
  getTokenAmount,
} from "../utils/index.js";

import ERC20_ABI from "../abis/erc20.abi.js";
import { getBestSwapRoute } from "../utils/swap.js";
import { getBestBridgeRoute } from "../utils/bridge.js";
import { NATIVE_TOKEN } from "../constants.js";
import { getProtocolData } from "../utils/protocol.js";

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

    const _sourceToken = await getTokenAddressForChain(sourceToken, chainName);
    if (!_sourceToken) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Token not found on the specified chain.",
      });
    }
    const _destinationToken = await getTokenAddressForChain(
      destinationToken,
      chainName
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
    const { amount: balance, decimals } = await getTokenAmount(
      _sourceToken.address,
      provider,
      accountAddress
    );
    const { amount: _sourceAmount } = await getTokenAmount(
      _sourceToken.address,
      provider,
      accountAddress,
      sourceAmount
    );
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
      _sourceAmount,
      gasPrice
    );

    // Step 3: Parse the response and extract relevant information for the transaction
    if (!data) {
      throw new Error("No swap route found");
    }

    // Step 4: Check user allowance and approve if necessary (Web3.js required)
    if (_sourceToken.address != NATIVE_TOKEN) {
      const approveData = await getApproveData(
        provider,
        _sourceToken.address,
        _sourceAmount,
        accountAddress,
        data.to
      );
      if (approveData) {
        transactions.push(approveData);
      }
    }

    // Step 5: Return the transaction details to the client
    transactions.push({
      to: data.to,
      value: data.value,
      data: data.data,
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
      sourceAmount,
    } = req.body;
    const sourceChainId = getChainIdFromName(sourceChainName);
    if (!sourceChainId) {
      throw new Error("Invalid chain name");
    }
    const destinationChainId = getChainIdFromName(destinationChainName);
    if (!destinationChainId) {
      throw new Error("Invalid chain name");
    }

    const _sourceToken = await getTokenAddressForChain(
      sourceToken,
      sourceChainName
    );
    if (!_sourceToken) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Token not found on the specified chain.",
      });
    }
    const _destinationToken = await getTokenAddressForChain(
      sourceToken,
      destinationChainName
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
    const { amount: balance, decimals } = await getTokenAmount(
      _sourceToken.address,
      provider,
      accountAddress
    );
    const { amount: _sourceAmount } = await getTokenAmount(
      _sourceToken.address,
      provider,
      accountAddress,
      sourceAmount
    );
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
        symbol: sourceToken,
      },
      _sourceAmount
    );

    // Step 3: Parse the response and extract relevant information for the bridge transaction
    if (!data) {
      throw new Error("No bridge route found");
    }

    let transactions = [];

    // Step 4: Check user allowance and approve if necessary (Web3.js required)
    if (_sourceToken.address != NATIVE_TOKEN) {
      const approveData = await getApproveData(
        provider,
        _sourceToken.address,
        _sourceAmount,
        accountAddress,
        data.to
      );
      if (approveData) {
        transactions.push(approveData);
      }
    }

    // Step 5: Return the transaction details to the client
    transactions.push({
      to: data.to,
      value: data.value,
      data: data.data,
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
      spender,
      chainName,
      protocolName,
      action,
      inputToken,
      outputToken,
      inputAmount,
    } = req.body;
    const { transactions, error } = await getProtocolData(
      spender,
      chainName,
      protocolName,
      action,
      inputToken,
      outputToken,
      inputAmount
    );
    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ status: "error", message: error });
    } else {
      return res
        .status(httpStatus.OK)
        .json({ status: "success", transactions });
    }
  } catch (err) {
    console.log("Error:", err);
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: "error", message: "Bad request" });
  }
};

const yieldHandler = async (req, res) => {
  try {
    const { accountAddress, chainName, token, amount } = req.body;
    const _token = await getTokenAddressForChain(token, chainName);
    if (!_token) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Token not found on the specified chain.",
      });
    }
    const whitelistedProtocols = ["aave", "compound"]; // TODO: update supported protocols list in the future
    const {
      data: { data },
    } = await axios.get(`https://yields.llama.fi/pools`);
    let pools = data.filter(
      (pool) =>
        pool.chain.toLowerCase() === chainName.toLowerCase() &&
        whitelistedProtocols.includes(pool.project) &&
        (!pool.underlyingTokens ||
          pool.underlyingTokens
            .map((x) => x.toLowerCase())
            .includes(_token.address.toLowerCase()))
    );
    if (pools.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Protocol not found for given chain and token.",
      });
    }
    pools = pools.sort((a, b) => b.apy - a.apy);
    const bestPool = pools[0];
    const { transactions, error } = await getProtocolData(
      accountAddress,
      chainName,
      bestPool.project,
      "deposit",
      token,
      null,
      amount
    );
    if (error) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ status: "error", message: error });
    } else {
      return res
        .status(httpStatus.OK)
        .json({ status: "success", transactions });
    }
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

    const tokenInfo = await getTokenAddressForChain(token, chainName);
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
    const { amount: balance } = await getTokenAmount(
      tokenInfo.address,
      provider,
      accountAddress
    );
    const { amount: _amount } = await getTokenAmount(
      tokenInfo.address,
      provider,
      accountAddress,
      amount
    );
    if (balance.lt(_amount)) {
      throw new Error("Insufficient balance");
    }

    // Step 2: Return the transaction details to the client
    let to = _recipient;
    let data = "0x";
    let value = _amount;
    if (tokenInfo.address != NATIVE_TOKEN) {
      const _token = new ethers.Contract(
        tokenInfo.address,
        ERC20_ABI,
        provider
      );
      to = tokenInfo.address;
      data = _token.interface.encodeFunctionData("transfer", [
        _recipient,
        _amount,
      ]);
      value = 0;
    }
    const transactionDetails = {
      to,
      value: value.toString(),
      data,
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

    const token = await getTokenAddressForChain(tokenName, chainName);
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
    if (!chainId) {
      throw new Error("Invalid chain name");
    }

    // Step 1: Fetch the token address for the given tokenName on the specified chain
    const token = await getTokenAddressForChain(tokenName, chainName);
    if (!token) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Token not found on the specified chain.",
      });
    }

    const rpcUrl = getRpcUrlForChain(chainId);
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);

    const { amount: balance } = await getTokenAmount(
      token.address,
      provider,
      accountAddress
    );

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
  yieldHandler,
  transfer,
  getTokenAddress,
  getTokenBalance,
};
