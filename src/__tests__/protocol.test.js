import request from 'supertest';
import app from '../app.js';

describe('Test Protocol Integration', () => {
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
});
