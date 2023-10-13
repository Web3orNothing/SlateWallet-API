export default [
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "address", name: "tokenIn", type: "address" },
      { internalType: "address", name: "wrapper", type: "address" },
      { internalType: "uint256", name: "maxSteps", type: "uint256" },
      { internalType: "uint256", name: "gasPrice", type: "uint256" },
    ],
    name: "findBestPathAndWrap",
    outputs: [
      {
        components: [
          { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
          { internalType: "address[]", name: "adapters", type: "address[]" },
          { internalType: "address[]", name: "path", type: "address[]" },
          { internalType: "uint256", name: "gasEstimate", type: "uint256" },
        ],
        internalType: "struct FormattedOffer",
        name: "bestOffer",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "router",
    outputs: [
      { internalType: "contract IYakRouter", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_router", type: "address" }],
    name: "setRouter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amountIn", type: "uint256" },
      { internalType: "address", name: "tokenOut", type: "address" },
      { internalType: "address", name: "wrapper", type: "address" },
      { internalType: "uint256", name: "maxSteps", type: "uint256" },
      { internalType: "uint256", name: "gasPrice", type: "uint256" },
    ],
    name: "unwrapAndFindBestPath",
    outputs: [
      {
        components: [
          { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
          { internalType: "address[]", name: "adapters", type: "address[]" },
          { internalType: "address[]", name: "path", type: "address[]" },
          { internalType: "uint256", name: "gasEstimate", type: "uint256" },
        ],
        internalType: "struct FormattedOffer",
        name: "bestOffer",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
