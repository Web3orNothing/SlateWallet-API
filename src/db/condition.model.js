const conditionModel = async (sequelize, Sequelize) => {
  const ConditionSchema = sequelize.define("conditions", {
    useraddress: {
      type: Sequelize.STRING,
    },
    type: {
      type: Sequelize.STRING,
    },
    subject: {
      type: Sequelize.STRING,
    },
    comparator: {
      type: Sequelize.ENUM,
      values: ["lt", "lte", "gt", "gte", "eq"],
    },
    value: {
      type: Sequelize.STRING,
    },
    repeatvalue: {
      type: Sequelize.STRING,
    },
    transactionset: {
      type: Sequelize.JSONB,
    },
    completed: {
      type: Sequelize.ENUM,
      values: ["pending", "ready", "executing", "completed", "canceled"],
    },
    simstatus: {
      type: Sequelize.ENUM,
      values: [0, 1, 2], // 0: no failure, 1: first sim failed, 2: second sim failed
    },
  });

  await ConditionSchema.sync();

  return ConditionSchema;
};

export default conditionModel;
