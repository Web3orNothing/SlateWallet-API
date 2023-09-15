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
      type: Sequelize.STRING,
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
      values: ['pending', 'ready', 'completed']
    },
  });

  await ConditionSchema.sync();

  return ConditionSchema;
};

export default conditionModel;
