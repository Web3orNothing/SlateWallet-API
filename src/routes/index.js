import { Router } from "express";
import httpStatus from "http-status";

import walletController from '../controllers/wallet.controller.js';

const routes = new Router();

// Swap endpoint
routes.post('/swap', walletController.swap);

// Bridge endpoint
routes.post('/bridge', walletController.bridge);

// Transfer endpoint
routes.post('/transfer', walletController.transfer);

// Get token balance endpoint
routes.get('/token-balance', walletController.getTokenBalance);

// status check route
routes.get("/status", (_req, res) => {
  res.status(httpStatus.OK).json({ status: "success" });
});

export default routes;
