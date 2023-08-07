import express from 'express';

import walletController from '../controllers/wallet.controller.js';

const walletRouter = express.Router();

// Swap endpoint
walletRouter.post('/swap', walletController.swap);

// Bridge endpoint
walletRouter.post('/bridge', walletController.bridge);

// Transfer endpoint
walletRouter.post('/transfer', walletController.transfer);

// Get token balance endpoint
walletRouter.get('/token-balance', walletController.getTokenBalance);

export default walletRouter;
