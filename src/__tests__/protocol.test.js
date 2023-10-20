import request from 'supertest';
import app from '../app.js';

describe('Test Protocol Integration', () => {
  describe('Borrow', () => {
    it('Aave', async () => {
      const res = await request(app).post('/borrow').send({
        accountAddress: '0xD6216fC19DB775Df9774a6E33526131dA7D19a2c',
        protocolName: 'Aave',
        chainName: 'Ethereum',
        poolName: null,
        token: 'USDC',
        amount: '50',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toEqual('success');
      expect(res.body).toHaveProperty('transactions');
    });
  });

  describe('Deposit', () => {
    it('Aave', async () => {
      const res = await request(app).post('/deposit').send({
        accountAddress: '0xD6216fC19DB775Df9774a6E33526131dA7D19a2c',
        protocolName: 'Aave',
        chainName: 'Ethereum',
        poolName: null,
        token: 'USDT',
        amount: '100',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toEqual('success');
      expect(res.body).toHaveProperty('transactions');
    });
  });

  describe('Lend', () => {
    it('Aave', async () => {
      const res = await request(app).post('/lend').send({
        accountAddress: '0xD6216fC19DB775Df9774a6E33526131dA7D19a2c',
        protocolName: 'Aave',
        chainName: 'Ethereum',
        poolName: null,
        token: 'USDT',
        amount: '100',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toEqual('success');
      expect(res.body).toHaveProperty('transactions');
    });
  });

  describe('Repay', () => {
    it('Aave', async () => {
      const res = await request(app).post('/repay').send({
        accountAddress: '0xD6216fC19DB775Df9774a6E33526131dA7D19a2c',
        protocolName: 'Aave',
        chainName: 'Ethereum',
        poolName: null,
        token: 'USDT',
        amount: '100',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toEqual('success');
      expect(res.body).toHaveProperty('transactions');
    });
  });

  describe('Withdraw', () => {
    it('Aave', async () => {
      const res = await request(app).post('/withdraw').send({
        accountAddress: '0xD6216fC19DB775Df9774a6E33526131dA7D19a2c',
        protocolName: 'Aave',
        chainName: 'Ethereum',
        poolName: null,
        token: 'USDT',
        amount: '100',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toEqual('success');
      expect(res.body).toHaveProperty('transactions');
    });
  });

  describe('Stake', () => {
    it('Lido', async () => {
      let res = await request(app).post('/stake').send({
        accountAddress: '0xD6216fC19DB775Df9774a6E33526131dA7D19a2c',
        protocolName: 'Lido',
        chainName: 'Ethereum',
        token: 'ETH',
        amount: '32',
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toEqual('success');
      expect(res.body).toHaveProperty('transactions');
      expect(res.body.transactions.length).toEqual(1);

      res = await request(app).post('/stake').send({
        accountAddress: '0xD6216fC19DB775Df9774a6E33526131dA7D19a2c',
        protocolName: 'Lido',
        chainName: 'Ethereum',
        token: 'ETH',
        amount: '30',
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toEqual('error');
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toEqual("Too less amount");
    })
  })
});
