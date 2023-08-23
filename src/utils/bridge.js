import axios from "axios";
import { BigNumber, utils } from "ethers";
import { config } from "dotenv";

config();

export const getQuoteFromLiFi = async (
  sourceChainId,
  destChainId,
  account,
  sourceToken,
  sourceTokenDecimals,
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
        fromToken: sourceToken,
        toToken: destToken,
        fromAmount: utils.parseUnits(amount, sourceTokenDecimals).toString(),
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

const bridgeRoutes = [getQuoteFromLiFi];

export const getBestBridgeRoute = async (
  sourceChainId,
  destChainId,
  account,
  sourceToken,
  sourceTokenDecimals,
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
      sourceTokenDecimals,
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
