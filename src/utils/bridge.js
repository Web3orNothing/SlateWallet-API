import axios from "axios";
import { BigNumber, utils } from "ethers";
import { config } from "dotenv";

import { NATIVE_TOKEN, NATIVE_TOKEN2 } from "../constants.js";

config();

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
        fromAmount: utils.parseUnits(amount, sourceToken.decimals).toString(),
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

// export const getQuoteFromSynapse = async (
//   sourceChainId,
//   destChainId,
//   account,
//   sourceToken,
//   destToken,
//   amount
// ) => {
//   try {
//     const queryParams = new URLSearchParams({
//       fromChain: sourceChainId,
//       toChain: destChainId,
//       fromToken: "USDC",
//       toToken: "USDC",
//       amount: parseFloat(amount),
//     });
//     const { data } = await axios.get(
//       `https://synapse-rest-api-v2.herokuapp.com/bridge?${queryParams}`
//     );
//     return {
//       amountOut: estimate.toAmount,
//       tx: {
//         to: transactionRequest.to,
//         value: BigNumber.from(transactionRequest.value).toString(),
//         data: transactionRequest.data,
//       },
//     };
//   } catch (err) {
//     console.log(err);
//   }
// };

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
      fromAmount: utils.parseUnits(amount, sourceToken.decimals).toString(),
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
  getQuoteFromLiFi,
  // getQuoteFromSynapse,
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
