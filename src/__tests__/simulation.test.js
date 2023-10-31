import request from "supertest";
import app from "../app.js";

describe("Test Simulation", () => {
  it("should simulate", async () => {
    const res = await request(app)
      .post("/simulate")
      .send({
        accountAddress: "0xD6216fC19DB775Df9774a6E33526131dA7D19a2c",
        actions: [
          {
            name: "bridge",
            args: {
              sourceChainName: "Ethereum",
              destinationChainName: "Arbitrum",
              token: "USDC",
              amount: "10000",
            },
          },
          {
            name: "transfer",
            args: {
              token: "USDC",
              amount: "",
              recipient: "0x42310121982db7fa65552aE797016aB63b430292",
              chainName: "Arbitrum",
            },
          },
        ],
        conditions: [],
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("status");
    expect(res.body["status"]).toEqual("success");
    expect(res.body).toHaveProperty("transactionsList");
    expect(res.body).toHaveProperty("actions");
  });
});
