import express from "express";
import bodyParser from "body-parser";

import cors from "cors";
import dotEnv from "dotenv";
import webpush from "web-push";
import httpStatus from "http-status";

import apiRouters from "./routes/index.js";
import { addSubscription } from "./handler.js";

dotEnv.config();

const app = express();

// Enable cors
app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Add the apiRoutes stack to the server
app.use("/", apiRouters);

app.post("/subscribe", (req, res) => {
  const { address, subscription } = req.body;
  if (!address || !subscription) {
    res.status(httpStatus.BAD_REQUEST).json({
      status: "error",
      message: "Invalid address or subscription data",
    });
    return;
  }

  res.status(httpStatus.OK).json({ status: "success" });

  addSubscription(address.toLowerCase(), subscription);
});

export default app;
