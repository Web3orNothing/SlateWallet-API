const conditionModel = async (sequelize, Sequelize) => {
  const ConditionSchema = sequelize.define("conditions", {
    useraddress: {
      type: Sequelize.STRING,
    },
    type: {
      type: Sequelize.ENUM,
      values: ["gas", "time", "price", "balance", "market cap", "yield"],
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
    recurrence: {
      type: Sequelize.JSONB,
    },
    query: {
      type: Sequelize.JSONB,
    },
    completed: {
      type: Sequelize.ENUM,
      values: ["pending", "ready", "executing", "completed", "canceled"],
    },
    simstatus: {
      type: Sequelize.INTEGER,
    },
  });

  await ConditionSchema.sync();

  return ConditionSchema;
};

export default conditionModel;
