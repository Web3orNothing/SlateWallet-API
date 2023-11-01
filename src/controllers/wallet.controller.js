import Sequelize from "sequelize";
import httpStatus from "http-status";
import { utils } from "ethers";
import {
  getTokenAddressForChain,
  getSwapTx,
  getBridgeTx,
  getDepositTx,
  getWithdrawTx,
  getClaimTx,
  getBorrowTx,
  getLendTx,
  getRepayTx,
  getStakeTx,
  getUnstakeTx,
  getLongTx,
  getShortTx,
  getLockTx,
  getUnlockTx,
  getVoteTx,
  getTransferTx,
  simulateActions,
  getProtocolEntities,
  getChainEntities,
  getUserOwnedTokens,
  getChainIdFromName,
  getTokensForChain,
  findIntersection,
} from "../utils/index.js";
import { sequelize } from "../db/index.js";
import conditionModel from "../db/condition.model.js";
import historyModel from "../db/history.model.js";

const condition = async (req, res) => {
  const { accountAddress, query, conditions, connectedChainName } = req.body;
  if (conditions.length === 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: "error",
      message: "Invalid Request Body",
    });
  }

  try {
    let simstatus = 0;
    for (let i = 0; i < conditions.length; i++) {
      const { success } = await simulateActions(
        conditions[i].actions,
        conditions[i].conditions,
        accountAddress,
        connectedChainName
      );
      if (!success) {
        simstatus = 1;
        break;
      }
    }

    const Conditions = await conditionModel(sequelize, Sequelize);
    const ids = [];
    for (let i = 0; i < conditions.length; i++) {
      const condition = new Conditions({
        useraddress: accountAddress.toLowerCase(),
        ...conditions[i],
        query,
        status: "pending",
        simstatus,
      });
      const { id } = await condition.save();
      ids.push(id);
    }
    return res.status(httpStatus.CREATED).json({ status: "success", ids });
  } catch {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: "error", message: "Failed to store condition" });
  }
};

const updateStatus = async (req, res) => {
  const { accountAddress, conditionId, status } = req.body;

  try {
    const Conditions = await conditionModel(sequelize, Sequelize);
    const condition = await Conditions.findOne({
      where: {
        id: parseInt(conditionId),
        useraddress: accountAddress.toLowerCase(),
        status: { [Sequelize.Op.notIn]: ["completed", "canceled"] },
      },
    });

    if (!condition) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ status: "error", message: "Condition does not exist" });
    }

    await condition.set("status", status);
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
    const Conditions = await conditionModel(sequelize, Sequelize);
    const condition = await Conditions.findOne({
      where: {
        id: parseInt(conditionId),
        useraddress: accountAddress.toLowerCase(),
        status: { [Sequelize.Op.in]: ["pending", "ready", "executing"] },
      },
    });

    if (!condition) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ status: "error", message: "Condition does not exist" });
    }

    await condition.set("status", "canceled");
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
        : Boolean(isActive)
        ? ["ready", "pending", "executing"]
        : ["completed"];
    const Conditions = await conditionModel(sequelize, Sequelize);
    const conditions = await Conditions.findAll({
      where: {
        useraddress: accountAddress.toLowerCase(),
        status: { [Sequelize.Op.in]: statuses },
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

const addHistory = async (req, res) => {
  const { accountAddress, query, conditions, actions } = req.body;
  if (!query || (actions || []).length === 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: "error",
      message: "Invalid Request Body",
    });
  }

  try {
    const Histories = await historyModel(sequelize, Sequelize);
    const history = new Histories({
      useraddress: accountAddress.toLowerCase(),
      conditions,
      actions,
      query,
      timestamp: new Date().getTime(),
    });
    const { id } = await history.save();
    return res.status(httpStatus.CREATED).json({ status: "success", id });
  } catch {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: "error", message: "Failed to store history" });
  }
};

const getHistories = async (req, res) => {
  const { accountAddress } = req.query;

  try {
    const Histories = await historyModel(sequelize, Sequelize);
    const histories = await Histories.findAll({
      where: { useraddress: accountAddress.toLowerCase() },
      raw: true,
    });

    return res.status(httpStatus.OK).json({ status: "success", histories });
  } catch {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: "error", message: "Failed to get histories" });
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

const deposit = async (req, res) => {
  const { status, message, transactions } = await getDepositTx(req.body);
  if (message) {
    res.status(httpStatus.BAD_REQUEST).json({ status, message });
  } else {
    res.status(httpStatus.OK).json({ status, transactions });
  }
};

const withdraw = async (req, res) => {
  const { status, message, transactions } = await getWithdrawTx(req.body);
  if (message) {
    res.status(httpStatus.BAD_REQUEST).json({ status, message });
  } else {
    res.status(httpStatus.OK).json({ status, transactions });
  }
};

const claim = async (req, res) => {
  const { status, message, transactions } = await getClaimTx(req.body);
  if (message) {
    res.status(httpStatus.BAD_REQUEST).json({ status, message });
  } else {
    res.status(httpStatus.OK).json({ status, transactions });
  }
};

const borrow = async (req, res) => {
  const { status, message, transactions } = await getBorrowTx(req.body);
  if (message) {
    res.status(httpStatus.BAD_REQUEST).json({ status, message });
  } else {
    res.status(httpStatus.OK).json({ status, transactions });
  }
};

const lend = async (req, res) => {
  const { status, message, transactions } = await getLendTx(req.body);
  if (message) {
    res.status(httpStatus.BAD_REQUEST).json({ status, message });
  } else {
    res.status(httpStatus.OK).json({ status, transactions });
  }
};

const repay = async (req, res) => {
  const { status, message, transactions } = await getRepayTx(req.body);
  if (message) {
    res.status(httpStatus.BAD_REQUEST).json({ status, message });
  } else {
    res.status(httpStatus.OK).json({ status, transactions });
  }
};

const stake = async (req, res) => {
  const { status, message, transactions } = await getStakeTx(req.body);
  if (message) {
    res.status(httpStatus.BAD_REQUEST).json({ status, message });
  } else {
    res.status(httpStatus.OK).json({ status, transactions });
  }
};

const unstake = async (req, res) => {
  const { status, message, transactions } = await getUnstakeTx(req.body);
  if (message) {
    res.status(httpStatus.BAD_REQUEST).json({ status, message });
  } else {
    res.status(httpStatus.OK).json({ status, transactions });
  }
};

const long = async (req, res) => {
  const { status, message, transactions } = await getLongTx(req.body);
  if (message) {
    res.status(httpStatus.BAD_REQUEST).json({ status, message });
  } else {
    res.status(httpStatus.OK).json({ status, transactions });
  }
};

const short = async (req, res) => {
  const { status, message, transactions } = await getShortTx(req.body);
  if (message) {
    res.status(httpStatus.BAD_REQUEST).json({ status, message });
  } else {
    res.status(httpStatus.OK).json({ status, transactions });
  }
};

const lock = async (req, res) => {
  const { status, message, transactions } = await getLockTx(req.body);
  if (message) {
    res.status(httpStatus.BAD_REQUEST).json({ status, message });
  } else {
    res.status(httpStatus.OK).json({ status, transactions });
  }
};

const unlock = async (req, res) => {
  const { status, message, transactions } = await getUnlockTx(req.body);
  if (message) {
    res.status(httpStatus.BAD_REQUEST).json({ status, message });
  } else {
    res.status(httpStatus.OK).json({ status, transactions });
  }
};

const vote = async (req, res) => {
  const { status, message, transactions } = await getVoteTx(req.body);
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
    const backendTokens = await getTokensForChain(
      getChainIdFromName(chainName.toLowerCase())
    );
    const backendToken = backendTokens.find(
      (token) => token.symbol.toLowerCase() === tokenName.toLowerCase()
    );
    if (token) {
      res.status(httpStatus.OK).json({
        status: "success",
        address: token.address,
      });
    } else if (backendToken) {
      res.status(httpStatus.OK).json({
        status: "success",
        address: backendToken.address,
      });
    } else {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: "error",
        message: "Token not found on the specified chain.",
      });
    }
  } catch {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: "error", message: "Bad request" });
  }
};

const simulate = async (req, res) => {
  try {
    const {
      actions,
      conditions,
      conditionId,
      accountAddress,
      connectedChainName,
    } = req.body;
    const {
      success,
      message,
      transactionsList,
      actions: updatedActions,
    } = await simulateActions(
      actions,
      conditions,
      accountAddress,
      connectedChainName
    );
    if (!isNaN(parseInt(conditionId))) {
      const Conditions = await conditionModel(sequelize, Sequelize);
      const condition = await Conditions.findOne({
        where: {
          id: parseInt(conditionId),
          useraddress: accountAddress.toLowerCase(),
          status: { [Sequelize.Op.notIn]: ["completed", "canceled"] },
        },
      });

      if (!condition) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ status: "error", message: "Condition does not exist" });
      }

      if (condition.simstatus === 1 && !success) {
        await condition.set("simstatus", 2);
        await condition.save();
      }
    }
    if (success) {
      res.status(httpStatus.OK).json({
        status: "success",
        transactionsList,
        actions: updatedActions,
      });
    } else {
      res
        .status(httpStatus.BAD_REQUEST)
        .json({ status: "error", message: `Simulation failed: ${message}` });
    }
  } catch (err) {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: "error", message: `Simulation failed: ${err.message}` });
  }
};

const verifiedEntities = async (req, res) => {
  res.status(httpStatus.OK).json({
    status: "success",
    actions: [
      "borrow",
      "bridge",
      "claim",
      "close",
      "deposit",
      "lend",
      "lock",
      "long",
      "repay",
      "short",
      "stake",
      "swap",
      "transfer",
      "unlock",
      "unstake",
      "vote",
      "withdraw",
    ],
    protocols: [
      getProtocolEntities("0x"),
      getProtocolEntities("1inch"),
      getProtocolEntities("Aave"),
      getProtocolEntities("Balancer"),
      getProtocolEntities("Bungee"),
      getProtocolEntities("Camelot"),
      getProtocolEntities("Compound"),
      getProtocolEntities("Curve"),
      getProtocolEntities("Dolomite"),
      getProtocolEntities("Dopex"),
      getProtocolEntities("GMX"),
      getProtocolEntities("Hop"),
      getProtocolEntities("JonesDAO"),
      getProtocolEntities("Jumper"),
      getProtocolEntities("Kwenta"),
      getProtocolEntities("Kyberswap"),
      getProtocolEntities("Lido"),
      getProtocolEntities("LiFi"),
      getProtocolEntities("Llamazip"),
      getProtocolEntities("Lodestar"),
      getProtocolEntities("Matcha"),
      getProtocolEntities("OpenOcean"),
      getProtocolEntities("ParaSwap"),
      getProtocolEntities("Pendle"),
      getProtocolEntities("Plutus"),
      getProtocolEntities("RocketPool"),
      getProtocolEntities("Rodeo"),
      getProtocolEntities("Stargate"),
      getProtocolEntities("SushiSwap"),
      getProtocolEntities("Synapse"),
      getProtocolEntities("Thena"),
      getProtocolEntities("Uniswap"),
      getProtocolEntities("YieldYak"),
    ],
    chains: await Promise.all([
      getChainEntities("Ethereum"),
      getChainEntities("Optimism"),
      getChainEntities("Cronos"),
      getChainEntities("BinanceSmartChain"),
      getChainEntities("EthClassic"),
      getChainEntities("Gnosis"),
      getChainEntities("Polygon"),
      getChainEntities("Fantom"),
      getChainEntities("Filecoin"),
      getChainEntities("MoonBeam"),
      getChainEntities("MoonRiver"),
      getChainEntities("Kava"),
      getChainEntities("Mantle"),
      getChainEntities("Canto"),
      getChainEntities("Base"),
      getChainEntities("Arbitrum"),
      getChainEntities("Celo"),
      getChainEntities("Avalanche"),
      getChainEntities("Linea"),
    ]),
  });
};

const getUserTokenHoldings = async (req, res) => {
  try {
    const { accountAddress, chainId } = req.query;
    const userTokens = await getUserOwnedTokens(chainId, accountAddress);
    // const backendTokens = await getTokensForChain(chainId);
    // const symbolList = backendTokens.map(token => token.symbol);
    const tokens = userTokens.filter(
      (item) => item.indexOf(" ") === -1 && item !== ""
    );
    res.status(httpStatus.OK).json({
      status: "success",
      tokens,
    });
  } catch {
    res
      .status(httpStatus.BAD_REQUEST)
      .json({ status: "error", message: "Bad request" });
  }
};

export default {
  condition,
  updateStatus,
  cancel,
  getConditions,
  addHistory,
  getHistories,
  swap,
  bridge,
  deposit,
  withdraw,
  claim,
  borrow,
  lend,
  repay,
  stake,
  unstake,
  long,
  short,
  lock,
  unlock,
  vote,
  transfer,
  getTokenAddress,
  simulate,
  verifiedEntities,
  getUserTokenHoldings,
};
