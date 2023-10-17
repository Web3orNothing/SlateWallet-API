import axios from "axios";
import { BigNumber, utils, ethers } from "ethers";
import { config } from "dotenv";

import { NATIVE_TOKEN, NATIVE_TOKEN2 } from "../constants.js";
import {
  getABIForProtocol,
  getChainIdFromName,
  getFunctionData,
  getProtocolAddressForChain,
} from "./index.js";

config();

export const getQuoteFromHop = async (
  sourceChainId,
  destChainId,
  account,
  sourceToken,
  destToken,
  amount
) => {
  const rpcUrl = getRpcUrlForChain(sourceChainId);
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl, sourceChainId);
  const bridgeContractAddress = getProtocolAddressForChain(
    "hop",
    sourceChainId,
    `bridge-${sourceToken.symbol.toLowerCase()}`
  );
  const abi = getABIForProtocol(
    "hop",
    sourceChainId === 1 ? "l1bridge" : "l2bridge"
  );
  const funcName = sourceChainId === 1 ? "sendToL2" : "swapAndSend";

  try {
    const headers = {
      headers: {
        accept: "application/json",
      },
    };
    const apiUrl = "https://api.hop.exchange/v1/quote?";
    const bridgeParams = {
      fromChain: getChainNameFromId(sourceChainId),
      toChain: getChainNameFromId(destChainId),
      token: sourceToken.symbol,
      amount: amount.toString(),
    };
    const url = apiBaseUrl + new URLSearchParams(bridgeParams).toString();
    const { data: quote } = await axios.get(url, headers);

    const params = [];
    if (sourceChainId === 1) {
      params.push(destChainId);
      params.push(account);
      params.push(amount);
      params.push(0);
      params.push(Math.floor(Date.now() / 1000) + 1200);
      params.push(ethers.constants.AddressZero);
      params.push(0);
    } else {
      params.push(destChainId);
      params.push(account);
      params.push(amount);
      params.push(quote.bonderFee);
      params.push(quote.amountOutMin);
      params.push(Math.floor(Date.now() / 1000) + 1200);
      if (destChainId === 1) {
        params.push(0);
        params.push(0);
      } else {
        params.push(quote.destinationAmountOutMin);
        params.push(quote.destinationDeadline);
      }
    }

    const data = await getFunctionData(
      bridgeContractAddress,
      abi,
      provider,
      funcName,
      params,
      sourceToken.address === NATIVE_TOKEN ? amount : "0"
    );
    return {
      amountOut: quote.amountOutMin,
      tx: {
        to: data.to,
        value: data.value,
        data: data.data,
      },
    };
  } catch {}
};

export const getQuoteFromLiFi = async (
  sourceChainId,
  destChainId,
  account,
  sourceToken,
  destToken,
  amount
) => {
  const {
    data: { chains },
  } = await axios.get("https://li.quest/v1/chains");
  const sourceChain = chains.find((c) => c.id === sourceChainId);
  const destChain = chains.find((c) => c.id === destChainId);
  if (!sourceChain || !destChain) return;

  const fromChain = sourceChain.key;
  const toChain = destChain.key;

  try {
    const {
      data: { estimate, transactionRequest },
    } = await axios.get("https://li.quest/v1/quote", {
      params: {
        fromChain,
        toChain,
        fromToken: sourceToken.symbol,
        toToken: destToken.symbol,
        fromAmount: amount.toString(),
        fromAddress: account,
      },
    });
    return {
      amountOut: estimate.toAmount,
      tx: {
        to: transactionRequest.to,
        value: BigNumber.from(transactionRequest.value).toString(),
        data: transactionRequest.data,
      },
    };
  } catch {}
};

export const getQuoteFromSynapse = async (
  sourceChainId,
  destChainId,
  account,
  sourceToken,
  destToken,
  amount
) => {
  try {
    const apiBaseUrl = "https://synapse-rest-api-v2.herokuapp.com";
    const headers = {
      headers: {
        accept: "application/json",
      },
    };
    const bridgeParams = {
      fromChain: sourceChainId,
      toChain: destChainId,
      fromToken: sourceToken.symbol,
      toToken: destToken.symbol,
      amount: utils.formatUnits(amount, sourceToken.decimals),
    };
    const url =
      apiBaseUrl + "/bridge?" + new URLSearchParams(bridgeParams).toString();

    const { data: quote } = await axios.get(url, headers);
    bridgeParams.destAddress = account;
    const {
      data: { to, data },
    } = await axios.get(
      apiBaseUrl +
        "/bridgeTxInfo?" +
        new URLSearchParams(bridgeParams).toString(),
      headers
    );
    return {
      amountOut: BigNumber.from(quote.maxAmountOut).toString(),
      tx: {
        to,
        value: sourceToken.address === NATIVE_TOKEN ? amount.toString() : "0",
        data,
      },
    };
  } catch {}
};

export const getQuoteFromAxelar = async (
  sourceChainId,
  destChainId,
  account,
  sourceToken,
  destToken,
  amount
) => {
  try {
    const queryParams = new URLSearchParams({
      fromChain: sourceChainId,
      fromToken:
        sourceToken.address === NATIVE_TOKEN
          ? NATIVE_TOKEN2
          : sourceToken.address,
      fromAmount: amount.toString(),
      toChain: destChainId,
      toToken:
        destToken.address === NATIVE_TOKEN ? NATIVE_TOKEN2 : destToken.address,
      toAddress: account,
      quoteOnly: false,
      slippage: 1.5,
    });
    const {
      data: { route },
    } = await axios.get(`https://api.0xsquid.com/v1/route?${queryParams}`);
    return {
      amountOut: route.estimate.toAmount,
      tx: {
        to: route.transactionRequest.targetAddress,
        value: route.transactionRequest.value,
        data: route.transactionRequest.data,
      },
    };
  } catch (err) {
    console.log(err);
  }
};

const bridgeRoutes = [
  getQuoteFromHop,
  getQuoteFromLiFi,
  getQuoteFromSynapse,
  getQuoteFromAxelar,
];

export const getBestBridgeRoute = async (
  sourceChainId,
  destChainId,
  account,
  sourceToken,
  destToken,
  amount
) => {
  let amountOut;
  let tx;
  for (let i = 0; i < bridgeRoutes.length; i++) {
    const data = await bridgeRoutes[i](
      sourceChainId,
      destChainId,
      account,
      sourceToken,
      destToken,
      amount
    );
    if (data) {
      const newAmountOut = BigNumber.from(data.amountOut);
      if (!amountOut || amountOut.lt(newAmountOut)) {
        amountOut = newAmountOut;
        tx = data.tx;
      }
    }
  }

  return tx;
};
