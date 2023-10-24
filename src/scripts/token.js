import axios from "axios";
import Sequelize from "sequelize";
import { sequelize } from "../db/index.js";
import tokenModel from "../db/token.model.js";
import { getChainIdFromName, getChainNameFromCGC } from "../utils/index.js";

const sleep = async (seconds) => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
};

const fetchTokens = async () => {
  const Token = await tokenModel(sequelize, Sequelize);

  let response;
  const CGC_API_ENDPOINT = "https://api.coingecko.com/api/v3/coins/";
  try {
    response = await axios.get(CGC_API_ENDPOINT + "list");
  } catch {}
  const tokens = response?.data || [];
  const length = tokens.length;

  for (let i = 64; i < length; i++) {
    const { id } = tokens[i];
    try {
      const {
        data: { platforms, name, symbol },
      } = await axios.get(CGC_API_ENDPOINT + id);
      const cgcChainNames = Object.keys(platforms);
      const tokensToSave = cgcChainNames
        .map((cgcChainName) => {
          const chainName = getChainNameFromCGC(cgcChainName);
          if (!chainName) return null;
          const chainId = getChainIdFromName(getChainNameFromCGC(cgcChainName));
          if (!chainId) return null;
          return {
            name,
            symbol,
            chainId,
            address: platforms[cgcChainName],
          };
        })
        .filter((info) => !!info);
      for (let j = 0; j < tokensToSave.length; j++) {
        const record = new Token(tokensToSave[j]);
        await record.save();
      }
      console.log(`Processed ${i}th token`);

      await sleep(4);
    } catch {
      break;
    }
  }
};

fetchTokens();
