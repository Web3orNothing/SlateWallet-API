import Sequelize from "sequelize";
import dotEnv from "dotenv";

import conditionModel from "./condition.model.js";
import historyModel from "./history.model.js";

dotEnv.config();

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    dialect: "postgres",
    logging: false,
  }
);

export const Conditions = await conditionModel(sequelize, Sequelize);
export const Histories = await historyModel(sequelize, Sequelize);
