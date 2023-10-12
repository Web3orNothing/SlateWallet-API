import request from "supertest";
import app from "../index.js";

describe("Test Wallet API", () => {
  describe("Health Check", () => {
    it("health should be okay", async () => {
      const res = await request(app).get("/status").send();
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("success");
    });
  });

  describe("Test Swap", () => {
    it("should fail when invalid chain is provided", async () => {
      const res = await request(app).post("/swap").send({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        chainName: "ether",
        inputToken: "WETH",
        inputAmount: "10",
        outputToken: "USDC",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("error");
      expect(res.body).toHaveProperty("message");
      expect(res.body["message"]).toEqual("Bad request");
    });

    it("should fail when balance is insufficient", async () => {
      const res = await request(app).post("/swap").send({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        chainName: "ethereum",
        inputToken: "WETH",
        inputAmount: "10",
        outputToken: "USDC",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("error");
      expect(res.body).toHaveProperty("message");
      expect(res.body["message"]).toEqual("Bad request");
    });

    it("should fail when invalid token is provided", async () => {
      const res = await request(app).post("/swap").send({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        chainName: "ethereum",
        inputToken: "null",
        inputAmount: "10",
        outputToken: "USDC",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("error");
      expect(res.body).toHaveProperty("message");
      expect(res.body["message"]).toEqual(
        "Token not found on the specified chain."
      );
    });

    it("should return ETH->USDC swap data", async () => {
      const res = await request(app).post("/swap").send({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        chainName: "ethereum",
        inputToken: "ETH",
        inputAmount: "0.01",
        outputToken: "USDC",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      const transactions = res.body["transactions"];
      // no approve transaction
      expect(transactions.length).toEqual(1);
    });

    it("should return WETH->USDC swap data", async () => {
      const res = await request(app).post("/swap").send({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        chainName: "ethereum",
        inputToken: "WETH",
        inputAmount: "1",
        outputToken: "USDC",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      const transactions = res.body["transactions"];
      // should have 2 transactions: approve, swap
      expect(transactions.length).toEqual(2);
      // first transaction should be approve tx
      expect(transactions[0].to.toLowerCase()).toEqual(
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
      );
    });
  });

  describe("Test Bridge", () => {
    it("should fail when invalid chain is provided", async () => {
      let res = await request(app).post("/bridge").send({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        sourceChainName: "ether",
        destinationChainName: "arbitrum",
        inputToken: "WETH",
        inputAmount: "1",
        outputToken: "WETH",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("error");
      expect(res.body).toHaveProperty("message");
      expect(res.body["message"]).toEqual("Bad request");

      res = await request(app).post("/bridge").send({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        sourceChainName: "ethereum",
        destinationChainName: "arbi",
        inputToken: "WETH",
        inputAmount: "0.1",
        outputToken: "WETH",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("error");
      expect(res.body).toHaveProperty("message");
      expect(res.body["message"]).toEqual("Bad request");
    });

    it("should fail when balance is insufficient", async () => {
      const res = await request(app).post("/bridge").send({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        sourceChainName: "ethereum",
        destinationChainName: "arbitrum",
        inputToken: "WETH",
        inputAmount: "10",
        outputToken: "WETH",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("error");
      expect(res.body).toHaveProperty("message");
      expect(res.body["message"]).toEqual("Bad request");
    });

    it("should fail when invalid token is provided", async () => {
      const res = await request(app).post("/bridge").send({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        sourceChainName: "ethereum",
        destinationChainName: "arbitrum",
        inputToken: "null",
        inputAmount: "0.1",
        outputToken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("error");
      expect(res.body).toHaveProperty("message");
      expect(res.body["message"]).toEqual(
        "Token not found on the specified chain."
      );
    });

    it("should return Ethereum/WETH->Arbitrum/WETH bridge data", async () => {
      const res = await request(app).post("/bridge").send({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        sourceChainName: "ethereum",
        destinationChainName: "arbitrum",
        inputToken: "WETH",
        inputAmount: "0.1",
        outputToken: "WETH",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      const transactions = res.body["transactions"];
      // should have 2 transactions: approve, bridge
      expect(transactions.length).toEqual(2);
      // first transaction should be approve tx
      expect(transactions[0].to.toLowerCase()).toEqual(
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
      );
    });
  });

  describe("Test Transfer", () => {
    it("should fail when invalid chain is provided", async () => {
      const res = await request(app).post("/transfer").send({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        token: "WETH",
        amount: "0.1",
        recipient: "0xB23a734F49Ed11dc3B0dD3Ff322b5Df95220574e",
        chainName: "ether",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("error");
      expect(res.body).toHaveProperty("message");
      expect(res.body["message"]).toEqual("Bad request");
    });

    it("should fail when balance is insufficient", async () => {
      const res = await request(app).post("/transfer").send({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        token: "WETH",
        amount: "10",
        recipient: "0xB23a734F49Ed11dc3B0dD3Ff322b5Df95220574e",
        chainName: "ethereum",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("error");
      expect(res.body).toHaveProperty("message");
      expect(res.body["message"]).toEqual("Bad request");
    });

    it("should fail when invalid token is provided", async () => {
      const res = await request(app).post("/transfer").send({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        token: "null",
        amount: "0.1",
        recipient: "0xB23a734F49Ed11dc3B0dD3Ff322b5Df95220574e",
        chainName: "ethereum",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("error");
      expect(res.body).toHaveProperty("message");
      expect(res.body["message"]).toEqual(
        "Token not found on the specified chain."
      );
    });

    it("should return WETH transfer data", async () => {
      const res = await request(app).post("/transfer").send({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        token: "WETH",
        amount: "0.1",
        recipient: "0xB23a734F49Ed11dc3B0dD3Ff322b5Df95220574e",
        chainName: "ethereum",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body["transactions"].length).toEqual(1);
      const transaction = res.body["transactions"][0];
      expect(transaction.to.toLowerCase()).toEqual(
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
      );
    });

    it("should return ETH transfer data", async () => {
      const res = await request(app).post("/transfer").send({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        token: "ETH",
        amount: "0.01",
        recipient: "0xB23a734F49Ed11dc3B0dD3Ff322b5Df95220574e",
        chainName: "ethereum",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("success");
      expect(res.body).toHaveProperty("transactions");
      expect(res.body["transactions"].length).toEqual(1);
      const transaction = res.body["transactions"][0];
      expect(transaction.to.toLowerCase()).toEqual(
        "0xB23a734F49Ed11dc3B0dD3Ff322b5Df95220574e".toLowerCase()
      );
    });
  });

  describe("Test Get Balance", () => {
    it("should fail when invalid chain is provided", async () => {
      const res = await request(app).get("/token-balance").query({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        chainName: "ether",
        tokenName: "WETH",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("error");
      expect(res.body).toHaveProperty("message");
      expect(res.body["message"]).toEqual("Bad request");
    });

    it("should fail when invalid token name is provided", async () => {
      const res = await request(app).get("/token-balance").query({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        chainName: "ethereum",
        tokenName: "WETH123",
      });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("error");
      expect(res.body).toHaveProperty("message");
      expect(res.body["message"]).toEqual(
        "Token not found on the specified chain."
      );
    });

    it("should return WETH balance", async () => {
      const res = await request(app).get("/token-balance").query({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        chainName: "ethereum",
        tokenName: "WETH",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("success");
      expect(res.body).toHaveProperty("balance");
      const balance = res.body["balance"];
      expect(BigInt(balance)).toBeGreaterThan(0);
    });

    it("should return ETH balance", async () => {
      const res = await request(app).get("/token-balance").query({
        accountAddress: "0xc5a05570da594f8edcc9beaa2385c69411c28cbe",
        chainName: "ethereum",
        tokenName: "ETH",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("status");
      expect(res.body["status"]).toEqual("success");
      expect(res.body).toHaveProperty("balance");
      const balance = res.body["balance"];
      expect(BigInt(balance)).toBeGreaterThan(0);
    });
  });
});
