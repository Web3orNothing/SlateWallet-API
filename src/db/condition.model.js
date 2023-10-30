const conditionModel = async (sequelize, Sequelize) => {
  const ConditionSchema = sequelize.define("conditionsv2", {
    useraddress: {
      type: Sequelize.STRING,
    },
    conditions: {
      type: Sequelize.JSONB,
    },
    actions: {
      type: Sequelize.JSONB,
    },
    query: {
      type: Sequelize.JSONB,
    },
    status: {
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
