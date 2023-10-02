const historyModel = async (sequelize, Sequelize) => {
  const HistorySchema = sequelize.define("histories", {
    useraddress: {
      type: Sequelize.STRING,
    },
    condition: {
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
