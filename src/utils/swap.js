import axios from "axios";
import { BigNumber, utils } from "ethers";
import { config } from "dotenv";

import { NATIVE_TOKEN, NATIVE_TOKEN2 } from "../constants.js";

config();

export const getQuoteFromOpenOcean = async (
  chainId,
  account,
  tokenIn,
  _,
  tokenOut,
  amount,
  gasPrice,
  slippage = 1
) => {
  const baseUrl = "https://open-api.openocean.finance/v3";
  try {
    const queryParams = new URLSearchParams({
      inTokenAddress: tokenIn,
      outTokenAddress: tokenOut,
      amount,
      gasPrice,
      slippage,
      account,
    });
    const {
      data: { data },
    } = await axios.get(`${baseUrl}/${chainId}/swap_quote?${queryParams}`);
    return {
      amountOut: data.outAmount,
      tx: {
        to: data.to,
        value: data.value,
        data: data.data,
      },
    };
  } catch {}
};

export const getQuoteFrom1inch = async (
  chainId,
  account,
  tokenIn,
  tokenInDecimals,
  tokenOut,
  amount,
  _,
  slippage = 1
) => {
  const apiBaseUrl = "https://api.1inch.dev/swap/v5.2/" + chainId;
  const headers = {
    headers: {
      Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`,
      accept: "application/json",
    },
  };
  const swapParams = {
    src: tokenIn === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenIn,
    dst: tokenOut,
    amount: utils.parseUnits(amount, tokenInDecimals).toString(),
    from: account,
    slippage,
    disableEstimate: false,
    allowPartialFill: false,
  };
  const url =
    apiBaseUrl + "/swap?" + new URLSearchParams(swapParams).toString();

  try {
    const { data } = await axios.get(url, headers);
    return {
      amountOut: data.toAmount,
      tx: {
        to: data.tx.to,
        value: data.tx.value,
        data: data.tx.data,
      },
    };
  } catch {}
};

const swapRoutes = [getQuoteFromOpenOcean, getQuoteFrom1inch];

export const getBestSwapRoute = async (
  chainId,
  account,
  tokenIn,
  tokenInDecimals,
  tokenOut,
  amount,
  gasPrice,
  slippage = 1
) => {
  let amountOut;
  let tx;
  for (let i = 0; i < swapRoutes.length; i++) {
    const data = await swapRoutes[i](
      chainId,
      account,
      tokenIn,
      tokenInDecimals,
      tokenOut,
      amount,
      gasPrice,
      slippage
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
