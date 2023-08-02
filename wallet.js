const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Swap endpoint
app.post('/swap', async (req, res) => {
    try {
      var { chainId, sourceAmount, sourceToken, destinationToken } = req.body;
      if (chainId === 'Ethereum' || chainId === 'ethereum') {
        chainId = 1
      }
      // Step 1: Check user balance on the given chain (Web3.js required)
  
      // Step 2: Check user allowance and approve if necessary (Web3.js required)
  
      // Step 3: Make an HTTP request to Metamask Swap API
      const axios = require('axios');
      const queryURL = `https://swap.metaswap.codefi.network/networks/${chainId}/trades`;
      const queryParams = new URLSearchParams({
        sourceAmount,
        sourceToken,
        destinationToken,
        slippage: 2,
        walletAddress: 'wallet_address', // Replace with the actual wallet address
        timeout: 10000,
        enableDirectWrapping: true,
        includeRoute: true,
      });
      // const response = await axios.get(`${queryURL}?${queryParams}`);
      const response = await axios.get('https://swap.metaswap.codefi.network/networks/1/trades?sourceAmount=2000000000000000000&sourceToken=0x0000000000000000000000000000000000000000&destinationToken=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&slippage=2&walletAddress=0xc5a05570da594f8edcc9beaa2385c69411c28cbe&timeout=10000&enableDirectWrapping=true&includeRoute=true');
      console.log(response);

      // Step 4: Parse the response and extract relevant information for the transaction
      if (!response) {
        throw new Error('No trades found in the response.');
      }
  
      // For this example, we will use the first trade in the response
      var i = 0;
      var trade = null;
      while (!trade) {
        trade = response['data'][i]['trade'];
        i += 1;
      }
      
      // Step 5: Return the transaction details to the client
      const transactionDetails = {
        from: trade.from,
        to: trade.to,
        gas: 355250,
        maxFeePerGas: 355250,
        maxPriorityFeePerGas: 355250,
        gasPrice: 355250,
        value: trade.value,
        data: trade.data,
        nonce: 101,
      };
  
      res.status(200).json({ status: 'success', transaction: transactionDetails });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Bridge endpoint
app.post('/bridge', async (req, res) => {
    try {
      var { sourceChainId, destinationChainId, sourceToken, destinationToken, sourceAmount } = req.body;
      if (sourceChainId === 'Ethereum' || sourceChainId === 'ethereum') {
        sourceChainId = 1
      }
      if (destinationChainId === 'Ethereum' || destinationChainId === 'ethereum') {
        destinationChainId = 1
      }
      // Step 1: Check user balance and allowance on the source chain (Web3.js required)
  
      // Step 2: Make an HTTP request to Metamask Bridge API
      const axios = require('axios');
      const queryURL = 'https://bridge.metaswap.codefi.network/getQuote';
      const queryParams = new URLSearchParams({
        walletAddress: '0xc5a05570da594f8edcc9beaa2385c69411c28cbe',
        srcChainId: sourceChainId,
        destChainId: destinationChainId,
        srcTokenAddress: sourceToken,
        destTokenAddress: destinationToken,
        srcTokenAmount: sourceAmount,
        slippage: 0.5,
        aggIds: 'socket,lifi',
        insufficientBal: false,
      });
      // const response = await axios.get(`${queryURL}?${queryParams}`);
      const response = await axios.get('https://bridge.metaswap.codefi.network/getQuote?walletAddress=0xc5a05570da594f8edcc9beaa2385c69411c28cbe&srcChainId=1&destChainId=10&srcTokenAddress=0x0000000000000000000000000000000000000000&destTokenAddress=0x0000000000000000000000000000000000000000&srcTokenAmount=1500000000000000000&slippage=0.5&aggIds=socket,lifi&insufficientBal=false');
      console.log(response);

      // Step 3: Parse the response and extract relevant information for the bridge transaction
      const { data: quoteData } = response;
      const { chainId, to, from, value, data } = quoteData;

      // For this example, we will use the first trade in the response
      var i = 0;
      var trade = null;
      while (!trade) {
        trade = response['data'][i]['trade'];
        i += 1;
      }
        
  
      // Step 4: Return the transaction details to the client
      const transactionDetails = {
        from: trade.from,
        to: trade.to,
        gas: 355250,
        maxFeePerGas: 355250,
        maxPriorityFeePerGas: 355250,
        gasPrice: 355250,
        value: trade.value,
        data: trade.data,
        nonce: 101,
      };
  
      res.status(200).json({ status: 'success', transaction: transactionDetails });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Transfer endpoint
app.post('/transfer', async (req, res) => {
    try {
      const { token, amount, recipient } = req.body;
  
      // Step 1: Check user balance on the chain (Web3.js required)
  
      // Step 2: Return the transaction details to the client
      const transactionDetails = {
        from: 'sender_address',
        to: recipient,
        gas: 'gas_amount',
        gasPrice: 'gas_price',
        value: amount,
        data: 'transaction_data', // For ERC20 token transfers, this field may contain the encoded transfer function call.
        nonce: 'nonce',
      };
  
      res.status(200).json({ status: 'success', transaction: transactionDetails });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Status endpoint
app.get('/status', async (req, res) => {
  res.status(200).json({ status: 'success'});
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://127.0.0.1:${port}`);
});
