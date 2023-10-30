const historyModel = async (sequelize, Sequelize) => {
  const HistorySchema = sequelize.define("historiesv2", {
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
    timestamp: {
      type: Sequelize.BIGINT,
    },
  });

  await HistorySchema.sync();

  return HistorySchema;
};

export default historyModel;
