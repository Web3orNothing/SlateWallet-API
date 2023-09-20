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
      values: ["pending", "ready", "completed", "canceled"],
    },
  });

  await ConditionSchema.sync();

  return ConditionSchema;
};

export default conditionModel;
