const conditionModel = (sequelize, Sequelize) => {
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
      type: Sequelize.BOOLEAN,
    },
  });

  ConditionSchema.removeAttribute("createdAt");
  ConditionSchema.removeAttribute("updatedAt");

  return ConditionSchema;
};

export default conditionModel;
