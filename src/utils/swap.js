import axios from "axios";
import { BigNumber, utils } from "ethers";
import { constructSimpleSDK } from "@paraswap/sdk";
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
      gasPrice: utils.formatUnits(gasPrice, "9"),
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
      Authorization: `Bearer ${process.env.API_KEY_1INCH}`,
      accept: "application/json",
    },
  };
  const swapParams = {
    src: tokenIn === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenIn,
    dst: tokenOut === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenOut,
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

export const getQuoteFromParaSwap = async (
  chainId,
  account,
  tokenIn,
  tokenInDecimals,
  tokenOut,
  amount,
  _,
  slippage = 1
) => {
  const paraswapSdk = constructSimpleSDK({
    chainId,
    axios,
  });
  try {
    const srcAmount = utils.parseUnits(amount, tokenInDecimals).toString();

    const priceRoute = await paraswapSdk.swap.getRate({
      srcToken: tokenIn === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenIn,
      destToken: tokenOut === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenOut,
      amount: srcAmount,
    });

    const data = await paraswapSdk.swap.buildTx(
      {
        srcToken: priceRoute.srcToken,
        destToken: priceRoute.destToken,
        srcAmount,
        slippage: slippage * 0.01 * 10000,
        priceRoute: priceRoute,
        userAddress: account,
      },
      { ignoreChecks: true, ignoreGasEstimate: true }
    );

    return {
      amountOut: BigNumber.from(priceRoute.destAmount)
        .mul(100 - slippage)
        .div(100)
        .toString(),
      tx: {
        to: data.to,
        value: data.value,
        data: data.data,
      },
    };
  } catch {}
};

export const getQuoteFrom0x = async (
  chainId,
  account,
  tokenIn,
  tokenInDecimals,
  tokenOut,
  amount,
  gasPrice,
  slippage = 1
) => {
  const apis = {
    1: "https://api.0x.org/",
    137: "https://polygon.api.0x.org/",
    56: "https://bsc.api.0x.org/",
    10: "https://optimism.api.0x.org/",
    250: "https://fantom.api.0x.org/",
    42220: "https://celo.api.0x.org/",
    43114: "https://avalanche.api.0x.org/",
    42161: "https://arbitrum.api.0x.org/",
    8453: "https://base.api.0x.org/",
  };
  const baseURL = apis[chainId];
  if (!baseURL) return;

  try {
    const sellAmount = utils.parseUnits(amount, tokenInDecimals).toString();
    const queryParams = new URLSearchParams({
      sellToken: tokenIn,
      buyToken: tokenOut,
      sellAmount,
      slippagePercentage: slippage,
      gasPrice: gasPrice.toString(),
    });
    const { data } = await axios.get(`${baseURL}swap/v1/quote?${queryParams}`, {
      headers: {
        "0x-api-key": process.env.APY_KEY_0X,
      },
    });
    return {
      amountOut: data.grossBuyAmount,
      tx: {
        to: data.to,
        value: data.value,
        data: data.data,
      },
    };
  } catch (err) {
    console.log(err);
  }
};

// export const getQuoteFromFirebird = async (
//   chainId,
//   account,
//   tokenIn,
//   tokenInDecimals,
//   tokenOut,
//   amount,
//   gasPrice,
//   slippage = 1
// ) => {
//   try {
//     const sellAmount = utils.parseUnits(amount, tokenInDecimals).toString();
//     const queryParams = new URLSearchParams({
//       chainId,
//       from: tokenIn === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenIn,
//       to: tokenOut === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenOut,
//       amount: sellAmount,
//       receiver: account,
//       slippage,
//       source: "firebird",
//     });
//     const { data } = await axios.get(
//       `https://router.firebird.finance/aggregator/v2/quote?${queryParams}`,
//       {
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//     return {
//       amountOut: data.grossBuyAmount,
//       tx: {
//         to: data.encodedData.router,
//         value: tokenIn === NATIVE_TOKEN ? sellAmount : "0",
//         data: data.encodedData.data,
//       },
//     };
//   } catch (err) {
//     console.log(err);
//   }
// };

export const getQuoteFromKyber = async (
  chainId,
  account,
  tokenIn,
  tokenInDecimals,
  tokenOut,
  amount,
  gasPrice,
  slippage = 1
) => {
  const supportedChains = {
    42161: "arbitrum",
    43114: "avalanche",
    1: "ethereum",
    137: "polygon",
    56: "bsc",
    10: "optimism",
    250: "fantom",
    25: "cronos",
    59144: "linea",
  };
  const chain = supportedChains[chainId];
  if (!chain) return;

  try {
    const amountIn = utils.parseUnits(amount, tokenInDecimals).toString();
    const queryParams = new URLSearchParams({
      chain,
      tokenIn: tokenIn === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenIn,
      tokenOut: tokenOut === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenOut,
      amountIn,
      saveGas: false,
      gasPrice: gasPrice.toString(),
      source: "spice-finance",
    });
    const {
      data: { data },
    } = await axios.get(
      `https://aggregator-api.kyberswap.com/${chain}/api/v1/routes?${queryParams}`,
      {
        headers: {
          "x-client-id": "spice-finance",
        },
      }
    );
    const {
      data: { data: _data },
    } = await axios.post(
      `https://aggregator-api.kyberswap.com/${chain}/api/v1/route/build`,
      {
        routeSummary: data.routeSummary,
        deadline: 0,
        slippageTolerance: 0,
        sender: account,
        recipient: account,
        source: "spice-finance",
      },
      {
        headers: {
          "x-client-id": "spice-finance",
        },
      }
    );
    return {
      amountOut: _data.amountOut,
      tx: {
        to: _data.routerAddress,
        value: tokenIn === NATIVE_TOKEN ? amountIn : "0",
        data: _data.data,
      },
    };
  } catch {}
};

const swapRoutes = [
  getQuoteFromOpenOcean,
  getQuoteFrom1inch,
  getQuoteFromParaSwap,
  getQuoteFrom0x,
  // getQuoteFromFirebird,
  getQuoteFromKyber,
];

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
