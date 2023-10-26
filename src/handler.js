import Sequelize from "sequelize";
import { ethers } from "ethers";
import webpush from "web-push";

import { sequelize } from "./db/index.js";
import conditionModel from "./db/condition.model.js";
import { getCoinPrice, getTokenBalance } from "./utils/index.js";

// Maintain subscriptions
const subscriptions = {};

// Add subscription
export const addSubscription = (userAddress, subscription) => {
  subscriptions[userAddress.toLowerCase()] = subscription;
};

export const checkTx = async () => {
  await syncConditionTx();
  const conditions = await findConditionTx();
  const retVal = {};
  conditions.map(({ id, actions, useraddress }) => {
    const address = useraddress.toLowerCase();
    if (!retVal[address]) {
      retVal[address] = [{ actions, id }];
    } else {
      retVal[address].push({ actions, id });
    }
  });
  const users = Object.keys(retVal);
  users.forEach((user) => {
    sendConditionTxToUser(user, retVal[user]);
  });
};

const syncConditionTx = async () => {
  const Conditions = await conditionModel(sequelize, Sequelize);
  const conditions = await Conditions.findAll({
    where: {
      [Sequelize.Op.or]: [
        { status: "pending" },
        {
          status: "completed",
          type: "time",
          recurrence: { [Sequelize.Op.ne]: null },
        },
      ],
    },
  });
  const gasPrice = await getGasPrice();
  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i];
    let ready = true;
    const { useraddress, status, actions } = condition.dataValues;

    for (let j = 0; j < condition.dataValues.conditions[j].length; j++) {
      let isReady;
      const {
        name,
        args: { type, subject, comparator, value: val, start_time, recurrence },
      } = condition.dataValues.conditions[j];
      const value = name === "condition" ? val : start_time;

      if (type === "gas") {
        if (comparator === "<") {
          isReady = gasPrice < parseFloat(value);
        } else if (comparator === "<=") {
          isReady = gasPrice <= parseFloat(value);
        } else if (comparator === ">") {
          isReady = gasPrice > parseFloat(value);
        } else if (comparator === ">=") {
          isReady = gasPrice >= parseFloat(value);
        } else if (comparator === "==") {
          isReady = gasPrice === parseFloat(value);
        }
      } else if (type === "time") {
        const now = Math.floor(Date.now() / 1000);
        const _value = parseInt(value);
        isReady = now >= _value && now < _value + 60;

        if (now >= _value && !isReady && recurrence) {
          const interval = getInterval(recurrence);
          isReady = (now - _value) % interval < 60;
        }
      } else if (type === "price") {
        const symbol = subject
          .replace("price", "")
          .replace(" ", "")
          .replace("_", "");
        const price = await getCoinPrice(symbol);
        if (comparator === "<") {
          isReady = price < parseFloat(value);
        } else if (comparator === "<=") {
          isReady = price <= parseFloat(value);
        } else if (comparator === ">") {
          isReady = price > parseFloat(value);
        } else if (comparator === ">=") {
          isReady = price >= parseFloat(value);
        } else if (comparator === "==") {
          isReady = price === parseFloat(value);
        }
      } else if (type === "balance") {
        const token = subject
          .replace("balance", "")
          .replace(" ", "")
          .replace("_", "");
        const chain =
          actions[0].body.chainName || actions[0].body.sourceChainName;
        const balance = await getTokenBalance(useraddress, chain, token);
        if (comparator === "<") {
          isReady = balance < parseFloat(value);
        } else if (comparator === "<=") {
          isReady = balance <= parseFloat(value);
        } else if (comparator === ">") {
          isReady = balance > parseFloat(value);
        } else if (comparator === ">=") {
          isReady = balance >= parseFloat(value);
        } else if (comparator === "==") {
          isReady = balance === parseFloat(value);
        }
      }
      ready &= isReady;
    }

    await condition.set("status", ready ? "ready" : status);
    await condition.save();
  }
};

const getInterval = (recurrence) => {
  let range;
  switch (recurrence.type) {
    case "hourly":
      range = 60 * 24;
      break;
    case "daily":
      range = 60 * 60 * 24;
      break;
    case "weekly":
      range = 60 * 60 * 24 * 7;
      break;
    case "monthly":
      range = 60 * 60 * 24 * 30;
      break;
    default:
      range = 1;
  }
  return recurrence.interval * range;
};

const findConditionTx = async () => {
  const Conditions = await conditionModel(sequelize, Sequelize);
  await Conditions.sync();
  return await Conditions.findAll({
    attributes: ["query", "useraddress", "id"],
    where: { status: "ready" },
  });
};

const sendConditionTxToUser = (user, conditions) => {
  const subscription = subscriptions[user];
  if (subscription) {
    const data = JSON.stringify({ success: true, address: user, conditions });
    webpush.sendNotification(subscription, data);
  }
};

const getGasPrice = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL, 1);
  const gasPrice = await provider.getGasPrice();
  return parseFloat(ethers.utils.formatUnits(gasPrice, 9));
};
