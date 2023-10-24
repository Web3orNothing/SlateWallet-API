const tokenModel = async (sequelize, Sequelize) => {
  const TokenSchema = sequelize.define("tokens", {
    name: {
      type: Sequelize.STRING,
    },
    symbol: {
      type: Sequelize.STRING,
    },
    chainId: {
      type: Sequelize.INTEGER,
    },
    address: {
      type: Sequelize.STRING,
    },
  });

  await TokenSchema.sync();

  return TokenSchema;
};

export default tokenModel;
