const historyModel = async (sequelize, Sequelize) => {
  const HistorySchema = sequelize.define("historiesv2", {
    useraddress: {
      type: Sequelize.STRING,
    },
    actions: {
      type: Sequelize.JSONB,
    },
    query: {
      type: Sequelize.JSONB,
    },
  });

  await HistorySchema.sync();

  return HistorySchema;
};

export default historyModel;
