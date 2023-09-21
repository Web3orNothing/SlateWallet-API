import { ethers } from "ethers";
import webpush from "web-push";

import { Conditions } from "./db/index.js";
import ORACLE_ABI from "./abi/oracle.js";

// Maintain subscriptions
const subscriptions = {};

// Add subscription
export const addSubscription = (userAddress, subscription) => {
  subscriptions[userAddress.toLowerCase()] = subscription;
};

export const checkTx = async () => {
  await syncConditionTx();
  const calls = await findConditionTx();
  const userToCallList = {};
  calls.map(({ id, transactionset, useraddress }) => {
    const address = useraddress.toLowerCase();
    if (!userToCallList[address]) {
      userToCallList[address] = [{ ...transactionset, id }];
    } else {
      userToCallList[address].push({ ...transactionset, id });
    }
  });
  const users = Object.keys(userToCallList);
  users.forEach((user) => {
    sendConditionTxToUser(user, userToCallList[user]);
  });
};

const syncConditionTx = async () => {
  const conditions = await Conditions.findAll({
    where: { completed: "pending" },
  });
  const gasPrice = await getGasPrice();
  const ethPrice = await getEthPrice();
  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i];
    const { type, comparator, value } = condition.dataValues;
    let isReady;
    if (type === "gas") {
      if (comparator === "lt") {
        isReady = gasPrice < parseFloat(value);
      } else if (comparator === "lte") {
        isReady = gasPrice <= parseFloat(value);
      } else if (comparator === "gt") {
        isReady = gasPrice > parseFloat(value);
      } else if (comparator === "gte") {
        isReady = gasPrice >= parseFloat(value);
      } else if (comparator === "eq") {
        isReady = gasPrice === parseFloat(value);
      }
    } else if (type === "time") {
      const now = Math.floor(Date.now() / 1000);
      isReady = Math.abs(parseInt(value) - now) < 60;
    } else if (type === "price") {
      if (comparator === "lt") {
        isReady = ethPrice < parseFloat(value);
      } else if (comparator === "lte") {
        isReady = ethPrice <= parseFloat(value);
      } else if (comparator === "gt") {
        isReady = ethPrice > parseFloat(value);
      } else if (comparator === "gte") {
        isReady = ethPrice >= parseFloat(value);
      } else if (comparator === "eq") {
        isReady = ethPrice === parseFloat(value);
      }
    }

    if (isReady) {
      await condition.set("completed", "ready");
      await condition.save();
    }
  }
};

const findConditionTx = async () => {
  await Conditions.sync();
  const calls = await Conditions.findAll({
    attributes: ["transactionset", "useraddress", "id"],
    where: { completed: "ready" },
  });
  return calls;
};

const sendConditionTxToUser = (user, calls) => {
  const subscription = subscriptions[user];
  if (subscription) {
    const data = JSON.stringify({ success: true, address: user, calls });
    webpush.sendNotification(subscription, data);
  }
};

const getGasPrice = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL, 1);
  const gasPrice = await provider.getGasPrice();
  return parseFloat(ethers.utils.formatUnits(gasPrice, 9));
};

const getEthPrice = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL, 1);
  const oracle = new ethers.Contract(
    process.env.ETH_PRICE_ORACLE,
    ORACLE_ABI,
    provider
  );
  const answer = await oracle.latestAnswer();
  return parseInt(answer.toString()) / 10 ** 8;
};
