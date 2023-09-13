import Sequelize from "sequelize";
import dotEnv from "dotenv";

import conditionModel from "./condition.model.js";

dotEnv.config();

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    dialect: "postgres",
    logging: false,
  }
);

export const Conditions = conditionModel(sequelize, Sequelize);
