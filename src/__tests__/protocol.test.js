import request from "supertest";
import app from "../app.js";

describe("Test Protocol Integration", () => {
  describe("Borrow", () => {
    it("Aave", async () => {
      const res = await request(app).post("/borrow").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Aave",
        chainName: "Ethereum",
        poolName: null,
        token: "USDC",
        amount: "50",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });

    it("Lodestar", async () => {
      const res = await request(app).post("/borrow").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Lodestar",
        chainName: "Arbitrum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });

    it("Rodeo", async () => {
      const res = await request(app).post("/borrow").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Rodeo",
        chainName: "Arbitrum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });
  });

  describe("Bridge", () => {
    it("Bungee", async () => {
      const res = await request(app).post("/bridge").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Bungee",
        sourceChainName: "Ethereum",
        destinationChainName: "Avalanche",
        token: "USDC",
        amount: "50",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it("Hop", async () => {
      const res = await request(app).post("/bridge").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Hop",
        sourceChainName: "Ethereum",
        destinationChainName: "Avalanche",
        token: "USDC",
        amount: "50",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it("Jumper", async () => {
      const res = await request(app).post("/bridge").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Jumper",
        sourceChainName: "Ethereum",
        destinationChainName: "Avalanche",
        token: "USDC",
        amount: "50",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it.skip("Synapse", async () => {
      const res = await request(app).post("/bridge").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Synapse",
        sourceChainName: "Ethereum",
        destinationChainName: "Avalanche",
        token: "USDC",
        amount: "50",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });
  });

  describe("Claim", () => {
    it("Hop", async () => {
      const res = await request(app).post("/claim").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Hop",
        chainName: "Optimism",
        poolName: "usdc",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });
  });

  describe("Deposit", () => {
    it("Aave", async () => {
      const res = await request(app).post("/deposit").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Aave",
        chainName: "Ethereum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });

    it("GMX", async () => {
      const res = await request(app).post("/deposit").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "GMX",
        chainName: "Arbitrum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });

    it("Rocket Pool", async () => {
      let res = await request(app).post("/deposit").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "RocketPool",
        chainName: "Ethereum",
        poolName: null,
        token: "ETH",
        amount: "1",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);

      res = await request(app).post("/deposit").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "RocketPool",
        chainName: "Ethereum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("error");
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toEqual("Token not supported");
    });

    it("Pendle", async () => {
      let res = await request(app).post("/deposit").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Pendle",
        chainName: "Ethereum",
        poolName: null,
        token: "stETH",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });

    it("JonesDAO", async () => {
      let res = await request(app).post("/deposit").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "JonesDAO",
        chainName: "Arbitrum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });

    it("Plutus", async () => {
      const res = await request(app).post("/deposit").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Plutus",
        chainName: "Arbitrum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });

    it("Rodeo", async () => {
      const res = await request(app).post("/deposit").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Rodeo",
        chainName: "Arbitrum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });

    it("Stargate", async () => {
      const res = await request(app).post("/deposit").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Stargate",
        chainName: "Ethereum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });

    it("Curve", async () => {
      const res = await request(app).post("/deposit").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Curve",
        chainName: "Ethereum",
        poolName: "3pool",
        token: "USDC",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it("Dopex", async () => {
      const res = await request(app).post("/deposit").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Dopex",
        chainName: "Arbitrum",
        poolName: "arb-monthly-ssov",
        token: "USDC",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it.skip("Synapse", async () => {
      const res = await request(app).post("/deposit").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Synapse",
        chainName: "Ethereum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it.skip("Hop", async () => {
      const res = await request(app).post("/deposit").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Hop",
        chainName: "Ethereum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });
  });

  describe("Lend", () => {
    it("Aave", async () => {
      const res = await request(app).post("/lend").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Aave",
        chainName: "Ethereum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });

    it("Lodestar", async () => {
      const res = await request(app).post("/lend").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Lodestar",
        chainName: "Arbitrum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });

    it("Rodeo", async () => {
      const res = await request(app).post("/lend").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Rodeo",
        chainName: "Arbitrum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });
  });

  describe("Repay", () => {
    it("Aave", async () => {
      const res = await request(app).post("/repay").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Aave",
        chainName: "Ethereum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });

    it("Lodestar", async () => {
      const res = await request(app).post("/repay").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Lodestar",
        chainName: "Arbitrum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });

    it("Rodeo", async () => {
      const res = await request(app).post("/repay").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Rodeo",
        chainName: "Arbitrum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });
  });

  describe("Swap", () => {
    it("Uniswap", async () => {
      const res = await request(app).post("/swap").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Uniswap",
        chainName: "Ethereum",
        inputToken: "USDC",
        inputAmount: "100",
        outputToken: "ETH",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it("Matcha", async () => {
      const res = await request(app).post("/swap").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Matcha",
        chainName: "Ethereum",
        inputToken: "USDC",
        inputAmount: "100",
        outputToken: "ETH",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it("1inch", async () => {
      const res = await request(app).post("/swap").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "1inch",
        chainName: "Ethereum",
        inputToken: "USDC",
        inputAmount: "100",
        outputToken: "ETH",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it("OpenOcean", async () => {
      const res = await request(app).post("/swap").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "OpenOcean",
        chainName: "Ethereum",
        inputToken: "USDC",
        inputAmount: "100",
        outputToken: "ETH",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it("ParaSwap", async () => {
      const res = await request(app).post("/swap").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "ParaSwap",
        chainName: "Avalanche",
        inputToken: "USDC",
        inputAmount: "100",
        outputToken: "ETH",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it("KyberSwap", async () => {
      const res = await request(app).post("/swap").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "KyberSwap",
        chainName: "Ethereum",
        inputToken: "USDC",
        inputAmount: "100",
        outputToken: "ETH",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it("Llamazip", async () => {
      const res = await request(app).post("/swap").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Llamazip",
        chainName: "Ethereum",
        inputToken: "USDC",
        inputAmount: "100",
        outputToken: "ETH",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it("YieldYak", async () => {
      const res = await request(app).post("/swap").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "YieldYak",
        chainName: "Avalanche",
        inputToken: "USDC",
        inputAmount: "100",
        outputToken: "ETH",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it("Synapse", async () => {
      const res = await request(app).post("/swap").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Synapse",
        chainName: "Ethereum",
        inputToken: "USDC",
        inputAmount: "100",
        outputToken: "ETH",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it("Jumper", async () => {
      const res = await request(app).post("/swap").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Jumper",
        chainName: "Ethereum",
        inputToken: "USDC",
        inputAmount: "100",
        outputToken: "ETH",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it("Camelot", async () => {
      const res = await request(app).post("/swap").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Camelot",
        chainName: "Ethereum",
        inputToken: "USDC",
        inputAmount: "100",
        outputToken: "ETH",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it("Cruve", async () => {
      const res = await request(app).post("/swap").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Cruve",
        chainName: "Ethereum",
        inputToken: "USDC",
        inputAmount: "100",
        outputToken: "ETH",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });
  });

  describe("Withdraw", () => {
    it("Aave", async () => {
      const res = await request(app).post("/withdraw").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Aave",
        chainName: "Ethereum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });

    it("GMX", async () => {
      const res = await request(app).post("/withdraw").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "GMX",
        chainName: "Arbitrum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });

    it("Rocket Pool", async () => {
      const res = await request(app).post("/withdraw").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "RocketPool",
        chainName: "Ethereum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });

    it("Pendle", async () => {
      let res = await request(app).post("/withdraw").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Pendle",
        chainName: "Ethereum",
        poolName: null,
        token: "stETH",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });

    it("Plutus", async () => {
      let res = await request(app).post("/withdraw").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Plutus",
        chainName: "Arbitrum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });

    it("Rodeo", async () => {
      let res = await request(app).post("/withdraw").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Rodeo",
        chainName: "Arbitrum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });

    it("Stargate", async () => {
      let res = await request(app).post("/withdraw").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Stargate",
        chainName: "Ethereum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });
  });

  describe("Stake", () => {
    it("Lido", async () => {
      let res = await request(app).post("/stake").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Lido",
        chainName: "Ethereum",
        token: "ETH",
        amount: "32",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);

      res = await request(app).post("/stake").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Lido",
        chainName: "Ethereum",
        token: "ETH",
        amount: "30",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("error");
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toEqual("Too less amount");
    });

    it("GMX", async () => {
      const res = await request(app).post("/stake").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "GMX",
        chainName: "Arbitrum",
        token: "GMX",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });

    it("JonesDAO", async () => {
      let res = await request(app).post("/withdraw").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "JonesDAO",
        chainName: "Arbitrum",
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });

    it("Lodestar", async () => {
      const res = await request(app).post("/stake").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Lodestar",
        chainName: "Arbitrum",
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });

    it("Plutus", async () => {
      const res = await request(app).post("/stake").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Plutus",
        chainName: "Arbitrum",
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });

    it("Kwenta", async () => {
      const res = await request(app).post("/stake").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Kwenta",
        chainName: "Optimism",
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });

    it("Stargate", async () => {
      const res = await request(app).post("/stake").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Stargate",
        chainName: "Ethereum",
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });
  });

  describe("Unstake", () => {
    it("GMX", async () => {
      const res = await request(app).post("/unstake").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "GMX",
        chainName: "Arbitrum",
        token: "GMX",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });

    it("Lodestar", async () => {
      const res = await request(app).post("/unstake").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Lodestar",
        chainName: "Arbitrum",
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });

    it("Plutus", async () => {
      const res = await request(app).post("/unstake").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Plutus",
        chainName: "Arbitrum",
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });

    it("Kwenta", async () => {
      const res = await request(app).post("/unstake").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Kwenta",
        chainName: "Optimism",
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });

    it("Stargate", async () => {
      const res = await request(app).post("/unstake").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Stargate",
        chainName: "Ethereum",
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });
  });

  describe("Long", () => {
    it("GMX", async () => {
      const res = await request(app).post("/long").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "GMX",
        chainName: "Arbitrum",
        inputToken: "WETH",
        inputAmount: "0.1",
        outputToken: "USDT",
        leverageMultiplier: 4,
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(3);
    });
  });

  describe("Short", () => {
    it("GMX", async () => {
      const res = await request(app).post("/short").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "GMX",
        chainName: "Arbitrum",
        inputToken: "USDT",
        inputAmount: "100",
        outputToken: "WETH",
        leverageMultiplier: 4,
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(3);
    });
  });

  describe("Lock", () => {
    it("Pendle", async () => {
      const res = await request(app).post("/lock").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Pendle",
        chainName: "Ethereum",
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });

    it("Plutus", async () => {
      const res = await request(app).post("/lock").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Plutus",
        chainName: "Arbitrum",
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });

    it("Thena", async () => {
      const res = await request(app).post("/lock").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Thena",
        chainName: "BinanceSmartChain",
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(2);
    });
  });

  describe("Unlock", () => {
    it("Pendle", async () => {
      const res = await request(app).post("/unlock").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Pendle",
        chainName: "Ethereum",
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });

    it("Plutus", async () => {
      const res = await request(app).post("/unlock").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Plutus",
        chainName: "Arbitrum",
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });

    it("Thena", async () => {
      const res = await request(app).post("/unlock").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Thena",
        chainName: "BinanceSmartChain",
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });
  });

  describe("Vote", () => {
    it("Pendle", async () => {
      const res = await request(app).post("/vote").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Pendle",
        chainName: "Ethereum",
        poolName: null,
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });

    it("Thena", async () => {
      const res = await request(app).post("/vote").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Thena",
        chainName: "BinanceSmartChain",
        poolName: null,
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });
  });

  describe("Claim", () => {
    it("Lodestar", async () => {
      const res = await request(app).post("/claim").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Lodestar",
        chainName: "Arbitrum",
        poolName: null,
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });

    it("Stargate", async () => {
      const res = await request(app).post("/claim").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Stargate",
        chainName: "Ethereum",
        poolName: null,
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });
  });

  describe.skip("Close", () => {
    it("GMX", async () => {
      const res = await request(app).post("/close").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "GMX",
        chainName: "Arbitrum",
        inputToken: "WETH",
        inputAmount: "0.1",
        outputToken: "USDT",
        leverageMultiplier: 4,
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body.transactions.length).toEqual(1);
    });

    it("Curve", async () => {
      const res = await request(app).post("/withdraw").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Curve",
        chainName: "Ethereum",
        poolName: "3pool",
        token: "USDC",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it("Dopex", async () => {
      const res = await request(app).post("/withdraw").send({
        accountAddress: "0x3392daec7d0bfd9d2dcf0e6d6c8a811bf09dbd73",
        protocolName: "Dopex",
        chainName: "Arbitrum",
        poolName: "arb-monthly-ssov",
        token: "USDC",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it.skip("Synapse", async () => {
      const res = await request(app).post("/withdraw").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Synapse",
        chainName: "Ethereum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });

    it("Hop", async () => {
      const res = await request(app).post("/withdraw").send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        protocolName: "Hop",
        chainName: "Arbitrum",
        poolName: null,
        token: "USDT",
        amount: "100",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body.status).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
    });
  });
});
