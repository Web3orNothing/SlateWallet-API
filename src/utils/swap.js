import axios from "axios";
import { BigNumber, ethers, utils } from "ethers";
import { constructSimpleSDK } from "@paraswap/sdk";
import { config } from "dotenv";

import { NATIVE_TOKEN, NATIVE_TOKEN2 } from "../constants.js";
import {
  getChainNameFromId,
  getNativeTokenSymbolForChain,
  getTokenAddressForChain,
} from "./index.js";

config();

export const getQuoteFromOpenOcean = async (
  chainId,
  account,
  tokenIn,
  tokenOut,
  amount,
  gasPrice,
  slippage = 1
) => {
  const baseUrl = "https://open-api.openocean.finance/v3";
  try {
    const queryParams = new URLSearchParams({
      inTokenAddress:
        tokenIn.address === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenIn.address,
      outTokenAddress:
        tokenOut.address === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenOut.address,
      amount: utils.formatUnits(amount, tokenIn.decimals),
      gasPrice: utils.formatUnits(gasPrice, "9"),
      slippage,
      account,
    }).toString();
    const {
      data: { data },
    } = await axios.get(`${baseUrl}/${chainId}/swap_quote?${queryParams}`);
    const gasCost = gasPrice.mul(data.estimatedGas);
    const gasToken = await getTokenAddressForChain(
      getNativeTokenSymbolForChain(chainId),
      getChainNameFromId(chainId)
    );
    return {
      amountOut: data.outAmount,
      gasUsd: utils.formatEther(gasCost) * gasToken.price,
      tx: {
        to: data.to,
        value: data.value,
        data: data.data,
      },
      source: "ocean",
    };
  } catch {}
};

export const getQuoteFrom1inch = async (
  chainId,
  account,
  tokenIn,
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
    src: tokenIn.address === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenIn.address,
    dst: tokenOut.address === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenOut.address,
    amount: amount.toString(),
    from: account,
    slippage,
    disableEstimate: true,
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
      source: "1inch",
    };
  } catch {}
};

export const getQuoteFromLiFi = async (
  chainId,
  account,
  tokenIn,
  tokenOut,
  amount,
  _,
  slippage = 1
) => {
  const {
    data: { chains },
  } = await axios.get("https://li.quest/v1/chains");
  const chain = chains.find((c) => c.id === chainId);
  if (!chain) return;

  const chainKey = chain.key;

  try {
    const {
      data: { estimate, transactionRequest },
    } = await axios.get("https://li.quest/v1/quote", {
      params: {
        fromChain: chainKey,
        toChain: chainKey,
        fromToken: tokenIn.symbol,
        toToken: tokenOut.symbol,
        fromAmount: amount.toString(),
        fromAddress: account,
        slippage: slippage / 100,
      },
    });
    return {
      amountOut: estimate.toAmount,
      gasUsd: estimate.gasCosts[0].amountUsd,
      tx: {
        to: transactionRequest.to,
        value: BigNumber.from(transactionRequest.value).toString(),
        data: transactionRequest.data,
      },
    };
  } catch {}
};

export const getQuoteFromSynapse = async (
  chainId,
  account,
  tokenIn,
  tokenOut,
  amount,
  _,
  slippage = 1
) => {
  const apiBaseUrl = "https://synapse-rest-api-v2.herokuapp.com";
  const headers = {
    headers: {
      accept: "application/json",
    },
  };
  const swapParams = {
    chain: chainId,
    fromToken: tokenIn.symbol,
    toToken: tokenOut.symbol,
    amount: parseFloat(utils.formatUnits(amount, tokenIn.decimals)),
  };
  const url =
    apiBaseUrl + "/swap?" + new URLSearchParams(swapParams).toString();

  try {
    const { data: quote } = await axios.get(url, headers);
    const {
      data: { to, data },
    } = await axios.get(
      apiBaseUrl + "/swapTxInfo?" + new URLSearchParams(swapParams).toString(),
      headers
    );
    if (quote && data) {
      return {
        amountOut: BigNumber.from(quote.maxAmountOut).toString(),
        tx: {
          to,
          value: tokenIn.address === NATIVE_TOKEN ? amount.toString() : "0",
          data,
        },
        source: "synapse",
      };
    }
  } catch {}
};

export const getQuoteFromParaSwap = async (
  chainId,
  account,
  tokenIn,
  tokenOut,
  amount,
  _,
  slippage = 1,
  includeDEXS = undefined
) => {
  const paraswapSdk = constructSimpleSDK({
    chainId,
    axios,
  });
  try {
    const priceRoute = await paraswapSdk.swap.getRate({
      srcToken:
        tokenIn.address === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenIn.address,
      destToken:
        tokenOut.address === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenOut.address,
      amount: amount.toString(),
      options: {
        includeDEXS,
      },
    });

    const data = await paraswapSdk.swap.buildTx(
      {
        srcToken: priceRoute.srcToken,
        destToken: priceRoute.destToken,
        srcAmount: amount.toString(),
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
      gasUsd: parseFloat(priceRoute.gasCostUSD),
      tx: {
        to: data.to,
        value: data.value,
        data: data.data,
      },
      source: "paraswap",
    };
  } catch {}
};

export const getQuoteFrom0x = async (
  chainId,
  account,
  tokenIn,
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
    const queryParams = new URLSearchParams({
      sellToken: tokenIn.symbol,
      buyToken: tokenOut.symbol,
      sellAmount: amount.toString(),
      slippagePercentage: slippage / 100,
      gasPrice: gasPrice.toString(),
    }).toString();
    const { data } = await axios.get(`${baseURL}swap/v1/quote?${queryParams}`, {
      headers: { "0x-api-key": process.env.API_KEY_0X },
    });
    const gasCost = gasPrice.mul(data.estimatedGas);
    const gasToken = await getTokenAddressForChain(
      getNativeTokenSymbolForChain(chainId),
      getChainNameFromId(chainId)
    );
    return {
      amountOut: data.grossBuyAmount,
      gasUsd: utils.formatEther(gasCost) * gasToken.price,
      tx: {
        to: data.to,
        value: data.value,
        data: data.data,
      },
      source: "0x",
    };
  } catch {}
};

// export const getQuoteFromFirebird = async (
//   chainId,
//   account,
//   tokenIn,
//   tokenOut,
//   amount,
//   gasPrice,
//   slippage = 1
// ) => {
//   try {
//     const sellAmount = utils.parseUnits(amount, tokenIn.decimals).toString();
//     const queryParams = new URLSearchParams({
//       chainId,
//       from: tokenIn.address === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenIn.address,
//       to: tokenOut.address === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenOut.address,
//       amount: sellAmount,
//       receiver: account,
//       slippage,
//       source: "firebird",
//     });
//     const { data } = await axios.get(
//       `https://router.firebird.finance/aggregator/v2/quote?${queryParams}`,
//       { headers: { "Content-Type": "application/json" } }
//     );
//     return {
//       amountOut: data.grossBuyAmount,
//       tx: {
//         to: data.encodedData.router,
//         value: tokenIn.address === NATIVE_TOKEN ? sellAmount : "0",
//         data: data.encodedData.data,
//       },
//     };
//   } catch (err) {
//     console.log(err.response.data.message);
//   }
// };

export const getQuoteFromKyber = async (
  chainId,
  account,
  tokenIn,
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
    const queryParams = new URLSearchParams({
      chain,
      tokenIn:
        tokenIn.address === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenIn.address,
      tokenOut:
        tokenOut.address === NATIVE_TOKEN ? NATIVE_TOKEN2 : tokenOut.address,
      amountIn: amount.toString(),
      saveGas: false,
      gasPrice: gasPrice.toString(),
      source: "spice-finance",
    });
    const {
      data: { data },
    } = await axios.get(
      `https://aggregator-api.kyberswap.com/${chain}/api/v1/routes?${queryParams}`,
      { headers: { "x-client-id": "spice-finance" } }
    );
    const {
      data: { data: _data },
    } = await axios.post(
      `https://aggregator-api.kyberswap.com/${chain}/api/v1/route/build`,
      {
        routeSummary: data.routeSummary,
        deadline: 0,
        slippageTolerance: slippage * 100,
        sender: account,
        recipient: account,
        source: "spice-finance",
      },
      { headers: { "x-client-id": "spice-finance" } }
    );
    return {
      amountOut: _data.amountOut,
      gasUsd: parseFloat(_data.gasUsd),
      tx: {
        to: _data.routerAddress,
        value: tokenIn.address === NATIVE_TOKEN ? amount.toString() : "0",
        data: _data.data,
        gasLimit: parseInt(_data.gas),
      },
      source: "kyber",
    };
  } catch {}
};

const swapRoutes = [
  getQuoteFromOpenOcean,
  getQuoteFrom1inch,
  getQuoteFromLiFi,
  getQuoteFromParaSwap,
  getQuoteFrom0x,
  // getQuoteFromFirebird,
  getQuoteFromKyber,
  getQuoteFromSynapse,
];

export const getBestSwapRoute = async (
  chainId,
  account,
  tokenIn,
  tokenOut,
  amount,
  gasPrice,
  slippage = 1
) => {
  let amountOutUsd;
  let tx;
  let source;
  const datas = await Promise.all(
    swapRoutes.map(
      async (swapRoute) =>
        await swapRoute(
          chainId,
          account,
          tokenIn,
          tokenOut,
          amount,
          gasPrice,
          slippage
        )
    )
  );
  for (let i = 0; i < datas.length; i++) {
    const data = datas[i];
    if (data) {
      const newAmountOut = BigNumber.from(data.amountOut);
      let newAmountOutUsd =
        parseFloat(utils.formatUnits(newAmountOut, tokenOut.decimals)) *
        tokenOut.price;
      if (data.gasUsd) {
        newAmountOutUsd -= data.gasUsd;
      } else {
        const { data: res } = await axios.post(
          `https://api.tenderly.co/api/v1/account/${process.env.TENDERLY_USER}/project/${process.env.TENDERLY_PROJECT}/simulate`,
          {
            network_id: chainId,
            save: true,
            save_if_fails: true,
            simulation_type: "full",
            from: account,
            to: data.tx.to,
            value: data.tx.value,
            input: data.tx.data,
          },
          { headers: { "X-Access-Key": process.env.TENDERLY_ACCESS_KEY } }
        );
        const gasCost = gasPrice.mul(res.transaction.gas_used);
        const gasToken = await getTokenAddressForChain(
          getNativeTokenSymbolForChain(chainId),
          getChainNameFromId(chainId)
        );
        const gasUsd = utils.formatEther(gasCost) * gasToken.price;
        newAmountOutUsd -= gasUsd;
      }
      if (!amountOutUsd || amountOutUsd < newAmountOutUsd) {
        amountOutUsd = newAmountOutUsd;
        tx = data.tx;
        source = data.source;
      }
    }
  }

  return { tx, source };
};
