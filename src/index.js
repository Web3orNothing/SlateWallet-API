import express from "express";
import bodyParser from "body-parser";
import cron from "node-cron";

import cors from "cors";
import dotEnv from "dotenv";
import webpush from "web-push";
import httpStatus from "http-status";

import apiRouters from "./routes/index.js";
import { addSubscription, checkTx } from "./handler.js";

dotEnv.config();

const app = express();
const port = process.env.PORT || 5000;

const subject = process.env.SUBJECT;
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;
webpush.setVapidDetails(subject, publicVapidKey, privateVapidKey);

// Enable cors
app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Add the apiRoutes stack to the server
app.use("/", apiRouters);

app.listen(port, () => {
  console.log(`Server listening on port ${port}!`);
});

app.post("/subscribe", (req, res) => {
  const { address, subscription } = req.body;
  res.status(httpStatus.OK).json({ status: "success" });

  addSubscription(address.toLowerCase(), subscription);
});

cron.schedule("*/60 * * * * *", checkTx);

export default app;
