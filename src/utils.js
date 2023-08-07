import axios from "axios";

export const metamaskApiHeaders = {
  Referrer: "https://portfolio.metamask.io/",
  "User Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
};

// Helper function to convert chainName to chainId
export const getChainIdFromName = (chainName) => {
  // TODO: Need to handle lower vs upper case and slightly different names (ex. ethereum vs Ethereum, BSC vs BinanceSmartChain, Binance vs BinanceSmartChain)
  const chainNamesToIds = {
    Ethereum: 1,
    Optimism: 10,
    BinanceSmartChain: 56,
    Polygon: 137,
    Fantom: 250,
    Arbitrum: 42161,
    Avalanche: 43114,
    // Add more chainName-chainId mappings here as needed
  };

  return chainNamesToIds[chainName] || null;
};

// Helper function to get tokens on a chain
export const getTokensForChain = async (chainId) => {
  try {
    const response = await axios.get(
      `https://account.metafi.codefi.network/networks/${chainId}/tokens`,
      {
        headers: metamaskApiHeaders,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching tokens:", error);
    throw new Error("Failed to fetch tokens for the given chainId.");
  }
};

// Helper function to get token balances for a user on a chain
export const getTokenBalancesForUser = async (accountAddress, chainId) => {
  try {
    const response = await axios.get(
      `https://account.metafi.codefi.network/accounts/${accountAddress}?chainId=${chainId}&includePrices=true`,
      {
        headers: metamaskApiHeaders,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching token balances:", error);
    throw new Error(
      "Failed to fetch token balances for the given user and chain."
    );
  }
};
