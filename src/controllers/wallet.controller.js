import Sequelize from "sequelize";
import httpStatus from "http-status";
import { ethers, utils } from "ethers";
import {
  getChainIdFromName,
  getProtocolTx,
  getRpcUrlForChain,
  getTokenAddressForChain,
  getTokenAmount,
  getTransferTx,
  getYieldTx,
  getSwapTx,
  getBridgeTx,
  simulateConditionCall,
  simulateTxs,
} from "../utils/index.js";
import { Conditions } from "../db/index.js";

const comparatorMap = {
  "less than": "lt",
  "less than or equal": "lte",
  "greater than": "gt",
  "greater than or equal": "lte",
  equal: "eq",
};

const condition = async (req, res) => {
  const { accountAddress, query, type, subject, comparator, value } = req.body;
  if (!type || !subject || !comparator || !value) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: "error",
      message: "Invalid Request Body",
    });
  }

  try {
    let simstatus = "no failure";
    for (let i = 0; i < query.calls.length; i++) {
      if (!(await simulateConditionCall(query.calls[i]), accountAddress)) {
        simstatus = "firstsimfailed";
        break;
      }
    }

    const condition = new Conditions({
      useraddress: accountAddress.toLowerCase(),
      type,
      subject,
      comparator: comparatorMap[comparator],
      value,
      repeatvalue: undefined,
      transactionset: query,
      completed: "pending",
      simstatus,
    });
    const { id } = await condition.save();
    return res.status(httpStatus.CREATED).json({ status: "success", id });
  } catch {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: "error", message: "Failed to store condition" });
  }
};

const time = async (req, res) => {
  const { accountAddress, query, value, repeat_value } = req.body;
  if (!value) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: "error",
      message: "Invalid Request Body",
    });
  }

  try {
    let simstatus = "no failure";
    for (let i = 0; i < query.calls.length; i++) {
      if (!(await simulateConditionCall(query.calls[i]))) {
        simstatus = "firstsimfailed";
        break;
      }
    }

    const condition = new Conditions({
      useraddress: accountAddress.toLowerCase(),
      type: "time",
      subject: "time",
      comparator: "eq",
      value,
      repeatvalue: repeat_value,
      transactionset: query,
      completed: "pending",
      simstatus,
    });
    const { id } = await condition.save();
    return res.status(httpStatus.CREATED).json({ status: "success", id });
  } catch {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: "error", message: "Failed to store condition" });
  }
};

const updateStatus = async (req, res) => {
  const { accountAddress, conditionId, status } = req.body;

  try {
    const condition = await Conditions.findOne({
      where: {
        id: parseInt(conditionId),
        useraddress: accountAddress.toLowerCase(),
        completed: {
          [Sequelize.Op.notIn]: ["completed", "canceled"],
        },
      },
    });

    if (!condition) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ status: "error", message: "Condition does not exist" });
    }

    await condition.set("completed", status);
    await condition.save();

    return res.status(httpStatus.OK).json({ status: "success" });
  } catch {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: "error", message: "Failed to update condition status" });
  }
};

const cancel = async (req, res) => {
  const { accountAddress, conditionId, signature } = req.body;
  if (!accountAddress || !conditionId || !signature) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: "error",
      message: "Invalid Request Body",
    });
  }

  try {
    const message = `I authorize cancellation #${conditionId}`;
    const recovered = utils.verifyMessage(message, signature);
    if (accountAddress.toLowerCase() !== recovered.toLowerCase()) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Unauthorized",
      });
    }
  } catch {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: "error",
      message: "Unauthorized",
    });
  }

  try {
    const condition = await Conditions.findOne({
      where: {
        id: parseInt(conditionId),
        useraddress: accountAddress.toLowerCase(),
        completed: { [Sequelize.Op.in]: ["pending", "ready", "executing"] },
      },
    });

    if (!condition) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ status: "error", message: "Condition does not exist" });
    }

    await condition.set("completed", "canceled");
    await condition.save();

    return res.status(httpStatus.OK).json({ status: "success" });
  } catch {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: "error", message: "Failed to cancel condition" });
  }
};

const getConditions = async (req, res) => {
  const { accountAddress, isActive } = req.query;

  try {
    const statuses =
      isActive === undefined
        ? ["ready", "pending", "executing", "completed"]
        : !isActive
        ? ["ready", "pending", "executing"]
        : ["completed"];
    const conditions = await Conditions.findAll({
      where: {
        useraddress: accountAddress.toLowerCase(),
        completed: { [Sequelize.Op.in]: statuses },
      },
      raw: true,
    });

    return res.status(httpStatus.OK).json({ status: "success", conditions });
  } catch {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: "error", message: "Failed to get conditions" });
  }
};

const swap = async (req, res) => {
  const { status, message, transactions } = await getSwapTx(req.body);
  if (message) {
    res.status(httpStatus.BAD_REQUEST).json({ status, message });
  } else {
    res.status(httpStatus.OK).json({ status, transactions });
  }
};

const bridge = async (req, res) => {
  const { status, message, transactions } = await getBridgeTx(req.body);
  if (message) {
    res.status(httpStatus.BAD_REQUEST).json({ status, message });
  } else {
    res.status(httpStatus.OK).json({ status, transactions });
  }
};

const protocol = async (req, res) => {
  const { status, message, transactions } = await getProtocolTx(req.body);
  if (message) {
    res.status(httpStatus.BAD_REQUEST).json({ status, message });
  } else {
    res.status(httpStatus.OK).json({ status, transactions });
  }
};

const yieldHandler = async (req, res) => {
  const { status, message, transactions } = await getYieldTx(req.body);
  if (message) {
    res.status(httpStatus.BAD_REQUEST).json({ status, message });
  } else {
    res.status(httpStatus.OK).json({ status, transactions });
  }
};

const transfer = async (req, res) => {
  const { status, message, transactions } = await getTransferTx(req.body);
  if (message) {
    res.status(httpStatus.BAD_REQUEST).json({ status, message });
  } else {
    res.status(httpStatus.OK).json({ status, transactions });
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
      throw new Error("Invalid chain name: " + chainName);
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

const simulate = async (req, res) => {
  const { transactions, conditionId } = req.body;
  const data = await simulateTxs(transactions);
  if (!isNaN(parseInt(conditionId))) {
    const condition = await Conditions.findOne({
      where: {
        id: parseInt(conditionId),
        useraddress: transactions[0].from.toLowerCase(),
        completed: {
          [Sequelize.Op.notIn]: ["completed", "canceled"],
        },
      },
    });

    if (!condition) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ status: "error", message: "Condition does not exist" });
    }

    if (condition.simstatus === "firstsimfailed" && !data) {
      await condition.set("simstatus", "secondsimfailed");
      await condition.save();
    }
  }
  if (data) {
    res.status(httpStatus.OK).json({
      status: "success",
      result: data,
    });
  } else {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: "error", message: "Simulation Failed" });
  }
};

export default {
  condition,
  time,
  updateStatus,
  cancel,
  getConditions,
  swap,
  bridge,
  protocol,
  yieldHandler,
  transfer,
  getTokenAddress,
  getTokenBalance,
  simulate,
};
