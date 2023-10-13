export default [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "marketId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "LogAddMarket",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "marketId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "LogRemoveMarket",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "accountMaxNumberOfMarketsWithBalances",
        type: "uint256",
      },
    ],
    name: "LogSetAccountMaxNumberOfMarketsWithBalances",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "autoTrader",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isSpecial",
        type: "bool",
      },
    ],
    name: "LogSetAutoTraderIsSpecial",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct Decimal.D256",
        name: "earningsRate",
        type: "tuple",
      },
    ],
    name: "LogSetEarningsRate",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "LogSetGlobalOperator",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "marketId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "interestSetter",
        type: "address",
      },
    ],
    name: "LogSetInterestSetter",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "marketId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isClosing",
        type: "bool",
      },
    ],
    name: "LogSetIsClosing",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct Decimal.D256",
        name: "liquidationSpread",
        type: "tuple",
      },
    ],
    name: "LogSetLiquidationSpread",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "marketId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct Decimal.D256",
        name: "marginPremium",
        type: "tuple",
      },
    ],
    name: "LogSetMarginPremium",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct Decimal.D256",
        name: "marginRatio",
        type: "tuple",
      },
    ],
    name: "LogSetMarginRatio",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "marketId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "bool",
            name: "sign",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct Types.Wei",
        name: "maxWei",
        type: "tuple",
      },
    ],
    name: "LogSetMaxWei",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct Monetary.Value",
        name: "minBorrowedValue",
        type: "tuple",
      },
    ],
    name: "LogSetMinBorrowedValue",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "marketId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "priceOracle",
        type: "address",
      },
    ],
    name: "LogSetPriceOracle",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "marketId",
        type: "uint256",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct Decimal.D256",
        name: "spreadPremium",
        type: "tuple",
      },
    ],
    name: "LogSetSpreadPremium",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "LogWithdrawExcessTokens",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "LogWithdrawUnsupportedTokens",
    type: "event",
  },
];
