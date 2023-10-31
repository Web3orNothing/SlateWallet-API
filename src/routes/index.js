import { Router } from "express";
import httpStatus from "http-status";

import walletController from "../controllers/wallet.controller.js";

const routes = new Router();

// Condition endpoint
routes.post("/condition", walletController.condition);

// Update endpoint
routes.post("/update-status", walletController.updateStatus);

// Cancel endpoint
routes.post("/cancel", walletController.cancel);

// Get condition txs endpoint
routes.get("/condition", walletController.getConditions);

// Create history endpoint
routes.post("/history", walletController.addHistory);

// Get histories endpoint
routes.get("/history", walletController.getHistories);

// Swap endpoint
routes.post("/swap", walletController.swap);

// Bridge endpoint
routes.post("/bridge", walletController.bridge);

// Deposit endpoint
routes.post("/deposit", walletController.deposit);

// Withdraw endpoint
routes.post("/withdraw", walletController.withdraw);

// Claim endpoint
routes.post("/claim", walletController.claim);

// Borrow endpoint
routes.post("/borrow", walletController.borrow);

// Lend endpoint
routes.post("/lend", walletController.lend);

// Repay endpoint
routes.post("/repay", walletController.repay);

// Stake endpoint
routes.post("/stake", walletController.stake);

// Unstake endpoint
routes.post("/unstake", walletController.unstake);

// Long endpoint
routes.post("/long", walletController.long);

// Short endpoint
routes.post("/short", walletController.short);

// Lock endpoint
routes.post("/lock", walletController.lock);

// Unlock endpoint
routes.post("/unlock", walletController.unlock);

// Vote endpoint
routes.post("/vote", walletController.vote);

// Transfer endpoint
routes.post("/transfer", walletController.transfer);

// Get token address
routes.get("/token-address", walletController.getTokenAddress);

// Simulate endpoint
routes.post("/simulate", walletController.simulate);

// Verified Entities endpoint
routes.get("/verified-entities", walletController.verifiedEntities);

routes.get("/token-holdings", walletController.getUserTokenHoldings);

// status check route
routes.get("/status", (_req, res) => {
  res.status(httpStatus.OK).json({ status: "success" });
});

export default routes;
