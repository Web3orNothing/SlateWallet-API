import { Router } from "express";
import httpStatus from "http-status";

import WalletRoutes from "./wallet.routes.js";

const routes = new Router();

// wallet routes
routes.use("/wallet", WalletRoutes);

// status check route
routes.use("/status", (_req, res) => {
  res.status(httpStatus.OK).json({ status: "success" });
});

export default routes;
