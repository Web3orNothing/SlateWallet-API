export default [
  {
    inputs: [
      {
        internalType: "address",
        name: "_depositContract",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AppAuthLidoFailed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "firstArrayLength",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "secondArrayLength",
        type: "uint256",
      },
    ],
    name: "ArraysLengthMismatch",
    type: "error",
  },
  {
    inputs: [],
    name: "DepositContractZeroAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "DirectETHTransfer",
    type: "error",
  },
  {
    inputs: [],
    name: "EmptyWithdrawalsCredentials",
    type: "error",
  },
  {
    inputs: [],
    name: "ExitedValidatorsCountCannotDecrease",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidContractVersionIncrement",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "etherValue",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "depositsCount",
        type: "uint256",
      },
    ],
    name: "InvalidDepositsValue",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "actual",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expected",
        type: "uint256",
      },
    ],
    name: "InvalidPublicKeysBatchLength",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "code",
        type: "uint256",
      },
    ],
    name: "InvalidReportData",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "actual",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expected",
        type: "uint256",
      },
    ],
    name: "InvalidSignaturesBatchLength",
    type: "error",
  },
  {
    inputs: [],
    name: "NonZeroContractVersionOnInit",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "reportedExitedValidatorsCount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "depositedValidatorsCount",
        type: "uint256",
      },
    ],
    name: "ReportedExitedValidatorsExceedDeposited",
    type: "error",
  },
  {
    inputs: [],
    name: "StakingModuleAddressExists",
    type: "error",
  },
  {
    inputs: [],
    name: "StakingModuleNotActive",
    type: "error",
  },
  {
    inputs: [],
    name: "StakingModuleNotPaused",
    type: "error",
  },
  {
    inputs: [],
    name: "StakingModuleStatusTheSame",
    type: "error",
  },
  {
    inputs: [],
    name: "StakingModuleUnregistered",
    type: "error",
  },
  {
    inputs: [],
    name: "StakingModuleWrongName",
    type: "error",
  },
  {
    inputs: [],
    name: "StakingModulesLimitExceeded",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "expected",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "received",
        type: "uint256",
      },
    ],
    name: "UnexpectedContractVersion",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "currentModuleExitedValidatorsCount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "currentNodeOpExitedValidatorsCount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "currentNodeOpStuckValidatorsCount",
        type: "uint256",
      },
    ],
    name: "UnexpectedCurrentValidatorsCount",
    type: "error",
  },
  {
    inputs: [],
    name: "UnrecoverableModuleError",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "field",
        type: "string",
      },
    ],
    name: "ValueOver100Percent",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "field",
        type: "string",
      },
    ],
    name: "ZeroAddress",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "version",
        type: "uint256",
      },
    ],
    name: "ContractVersionSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "stakingModuleId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "lowLevelRevertData",
        type: "bytes",
      },
    ],
    name: "ExitedAndStuckValidatorsCountsUpdateFailed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "stakingModuleId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "lowLevelRevertData",
        type: "bytes",
      },
    ],
    name: "RewardsMintedReportFailed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      },
    ],
    name: "RoleAdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleGranted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "RoleRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "stakingModuleId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "stakingModule",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "createdBy",
        type: "address",
      },
    ],
    name: "StakingModuleAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "stakingModuleId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "unreportedExitedValidatorsCount",
        type: "uint256",
      },
    ],
    name: "StakingModuleExitedValidatorsIncompleteReporting",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "stakingModuleId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "stakingModuleFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "treasuryFee",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "setBy",
        type: "address",
      },
    ],
    name: "StakingModuleFeesSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "stakingModuleId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum StakingRouter.StakingModuleStatus",
        name: "status",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "address",
        name: "setBy",
        type: "address",
      },
    ],
    name: "StakingModuleStatusSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "stakingModuleId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "targetShare",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "setBy",
        type: "address",
      },
    ],
    name: "StakingModuleTargetShareSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "stakingModuleId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "StakingRouterETHDeposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "withdrawalCredentials",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "setBy",
        type: "address",
      },
    ],
    name: "WithdrawalCredentialsSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "stakingModuleId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "lowLevelRevertData",
        type: "bytes",
      },
    ],
    name: "WithdrawalsCredentialsChangeFailed",
    type: "event",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEPOSIT_CONTRACT",
    outputs: [
      {
        internalType: "contract IDepositContract",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "FEE_PRECISION_POINTS",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MANAGE_WITHDRAWAL_CREDENTIALS_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_STAKING_MODULES_COUNT",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_STAKING_MODULE_NAME_LENGTH",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "REPORT_EXITED_VALIDATORS_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "REPORT_REWARDS_MINTED_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "STAKING_MODULE_MANAGE_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "STAKING_MODULE_PAUSE_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "STAKING_MODULE_RESUME_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "TOTAL_BASIS_POINTS",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "UNSAFE_SET_EXITED_VALIDATORS_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "address",
        name: "_stakingModuleAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_targetShare",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_stakingModuleFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_treasuryFee",
        type: "uint256",
      },
    ],
    name: "addStakingModule",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_depositsCount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_depositCalldata",
        type: "bytes",
      },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
    ],
    name: "getAllNodeOperatorDigests",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "isTargetLimitActive",
                type: "bool",
              },
              {
                internalType: "uint256",
                name: "targetValidatorsCount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "stuckValidatorsCount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "refundedValidatorsCount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "stuckPenaltyEndTimestamp",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalExitedValidators",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalDepositedValidators",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "depositableValidatorsCount",
                type: "uint256",
              },
            ],
            internalType: "struct StakingRouter.NodeOperatorSummary",
            name: "summary",
            type: "tuple",
          },
        ],
        internalType: "struct StakingRouter.NodeOperatorDigest[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllStakingModuleDigests",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "nodeOperatorsCount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "activeNodeOperatorsCount",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "uint24",
                name: "id",
                type: "uint24",
              },
              {
                internalType: "address",
                name: "stakingModuleAddress",
                type: "address",
              },
              {
                internalType: "uint16",
                name: "stakingModuleFee",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "treasuryFee",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "targetShare",
                type: "uint16",
              },
              {
                internalType: "uint8",
                name: "status",
                type: "uint8",
              },
              {
                internalType: "string",
                name: "name",
                type: "string",
              },
              {
                internalType: "uint64",
                name: "lastDepositAt",
                type: "uint64",
              },
              {
                internalType: "uint256",
                name: "lastDepositBlock",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "exitedValidatorsCount",
                type: "uint256",
              },
            ],
            internalType: "struct StakingRouter.StakingModule",
            name: "state",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "totalExitedValidators",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalDepositedValidators",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "depositableValidatorsCount",
                type: "uint256",
              },
            ],
            internalType: "struct StakingRouter.StakingModuleSummary",
            name: "summary",
            type: "tuple",
          },
        ],
        internalType: "struct StakingRouter.StakingModuleDigest[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getContractVersion",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_depositsCount",
        type: "uint256",
      },
    ],
    name: "getDepositsAllocation",
    outputs: [
      {
        internalType: "uint256",
        name: "allocated",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "allocations",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLido",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "_nodeOperatorIds",
        type: "uint256[]",
      },
    ],
    name: "getNodeOperatorDigests",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "isTargetLimitActive",
                type: "bool",
              },
              {
                internalType: "uint256",
                name: "targetValidatorsCount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "stuckValidatorsCount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "refundedValidatorsCount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "stuckPenaltyEndTimestamp",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalExitedValidators",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalDepositedValidators",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "depositableValidatorsCount",
                type: "uint256",
              },
            ],
            internalType: "struct StakingRouter.NodeOperatorSummary",
            name: "summary",
            type: "tuple",
          },
        ],
        internalType: "struct StakingRouter.NodeOperatorDigest[]",
        name: "digests",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_offset",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_limit",
        type: "uint256",
      },
    ],
    name: "getNodeOperatorDigests",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "isTargetLimitActive",
                type: "bool",
              },
              {
                internalType: "uint256",
                name: "targetValidatorsCount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "stuckValidatorsCount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "refundedValidatorsCount",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "stuckPenaltyEndTimestamp",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalExitedValidators",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalDepositedValidators",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "depositableValidatorsCount",
                type: "uint256",
              },
            ],
            internalType: "struct StakingRouter.NodeOperatorSummary",
            name: "summary",
            type: "tuple",
          },
        ],
        internalType: "struct StakingRouter.NodeOperatorDigest[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_nodeOperatorId",
        type: "uint256",
      },
    ],
    name: "getNodeOperatorSummary",
    outputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "isTargetLimitActive",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "targetValidatorsCount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "stuckValidatorsCount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "refundedValidatorsCount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "stuckPenaltyEndTimestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalExitedValidators",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalDepositedValidators",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "depositableValidatorsCount",
            type: "uint256",
          },
        ],
        internalType: "struct StakingRouter.NodeOperatorSummary",
        name: "summary",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "getRoleMember",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
    ],
    name: "getRoleMemberCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStakingFeeAggregateDistribution",
    outputs: [
      {
        internalType: "uint96",
        name: "modulesFee",
        type: "uint96",
      },
      {
        internalType: "uint96",
        name: "treasuryFee",
        type: "uint96",
      },
      {
        internalType: "uint256",
        name: "basePrecision",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStakingFeeAggregateDistributionE4Precision",
    outputs: [
      {
        internalType: "uint16",
        name: "modulesFee",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "treasuryFee",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
    ],
    name: "getStakingModule",
    outputs: [
      {
        components: [
          {
            internalType: "uint24",
            name: "id",
            type: "uint24",
          },
          {
            internalType: "address",
            name: "stakingModuleAddress",
            type: "address",
          },
          {
            internalType: "uint16",
            name: "stakingModuleFee",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "treasuryFee",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "targetShare",
            type: "uint16",
          },
          {
            internalType: "uint8",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint64",
            name: "lastDepositAt",
            type: "uint64",
          },
          {
            internalType: "uint256",
            name: "lastDepositBlock",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "exitedValidatorsCount",
            type: "uint256",
          },
        ],
        internalType: "struct StakingRouter.StakingModule",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
    ],
    name: "getStakingModuleActiveValidatorsCount",
    outputs: [
      {
        internalType: "uint256",
        name: "activeValidatorsCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_stakingModuleIds",
        type: "uint256[]",
      },
    ],
    name: "getStakingModuleDigests",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "nodeOperatorsCount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "activeNodeOperatorsCount",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "uint24",
                name: "id",
                type: "uint24",
              },
              {
                internalType: "address",
                name: "stakingModuleAddress",
                type: "address",
              },
              {
                internalType: "uint16",
                name: "stakingModuleFee",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "treasuryFee",
                type: "uint16",
              },
              {
                internalType: "uint16",
                name: "targetShare",
                type: "uint16",
              },
              {
                internalType: "uint8",
                name: "status",
                type: "uint8",
              },
              {
                internalType: "string",
                name: "name",
                type: "string",
              },
              {
                internalType: "uint64",
                name: "lastDepositAt",
                type: "uint64",
              },
              {
                internalType: "uint256",
                name: "lastDepositBlock",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "exitedValidatorsCount",
                type: "uint256",
              },
            ],
            internalType: "struct StakingRouter.StakingModule",
            name: "state",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "totalExitedValidators",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "totalDepositedValidators",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "depositableValidatorsCount",
                type: "uint256",
              },
            ],
            internalType: "struct StakingRouter.StakingModuleSummary",
            name: "summary",
            type: "tuple",
          },
        ],
        internalType: "struct StakingRouter.StakingModuleDigest[]",
        name: "digests",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStakingModuleIds",
    outputs: [
      {
        internalType: "uint256[]",
        name: "stakingModuleIds",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
    ],
    name: "getStakingModuleIsActive",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
    ],
    name: "getStakingModuleIsDepositsPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
    ],
    name: "getStakingModuleIsStopped",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
    ],
    name: "getStakingModuleLastDepositBlock",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_maxDepositsValue",
        type: "uint256",
      },
    ],
    name: "getStakingModuleMaxDepositsCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
    ],
    name: "getStakingModuleNonce",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
    ],
    name: "getStakingModuleStatus",
    outputs: [
      {
        internalType: "enum StakingRouter.StakingModuleStatus",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
    ],
    name: "getStakingModuleSummary",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "totalExitedValidators",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalDepositedValidators",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "depositableValidatorsCount",
            type: "uint256",
          },
        ],
        internalType: "struct StakingRouter.StakingModuleSummary",
        name: "summary",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStakingModules",
    outputs: [
      {
        components: [
          {
            internalType: "uint24",
            name: "id",
            type: "uint24",
          },
          {
            internalType: "address",
            name: "stakingModuleAddress",
            type: "address",
          },
          {
            internalType: "uint16",
            name: "stakingModuleFee",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "treasuryFee",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "targetShare",
            type: "uint16",
          },
          {
            internalType: "uint8",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint64",
            name: "lastDepositAt",
            type: "uint64",
          },
          {
            internalType: "uint256",
            name: "lastDepositBlock",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "exitedValidatorsCount",
            type: "uint256",
          },
        ],
        internalType: "struct StakingRouter.StakingModule[]",
        name: "res",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStakingModulesCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStakingRewardsDistribution",
    outputs: [
      {
        internalType: "address[]",
        name: "recipients",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "stakingModuleIds",
        type: "uint256[]",
      },
      {
        internalType: "uint96[]",
        name: "stakingModuleFees",
        type: "uint96[]",
      },
      {
        internalType: "uint96",
        name: "totalFee",
        type: "uint96",
      },
      {
        internalType: "uint256",
        name: "precisionPoints",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalFeeE4Precision",
    outputs: [
      {
        internalType: "uint16",
        name: "totalFee",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getWithdrawalCredentials",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
    ],
    name: "hasStakingModule",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_admin",
        type: "address",
      },
      {
        internalType: "address",
        name: "_lido",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_withdrawalCredentials",
        type: "bytes32",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "onValidatorsCountsByNodeOperatorReportingFinished",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
    ],
    name: "pauseStakingModule",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_stakingModuleIds",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "_totalShares",
        type: "uint256[]",
      },
    ],
    name: "reportRewardsMinted",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_nodeOperatorIds",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "_exitedValidatorsCounts",
        type: "bytes",
      },
    ],
    name: "reportStakingModuleExitedValidatorsCountByNodeOperator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "_nodeOperatorIds",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "_stuckValidatorsCounts",
        type: "bytes",
      },
    ],
    name: "reportStakingModuleStuckValidatorsCountByNodeOperator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
    ],
    name: "resumeStakingModule",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
      {
        internalType: "enum StakingRouter.StakingModuleStatus",
        name: "_status",
        type: "uint8",
      },
    ],
    name: "setStakingModuleStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_withdrawalCredentials",
        type: "bytes32",
      },
    ],
    name: "setWithdrawalCredentials",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_nodeOperatorId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_triggerUpdateFinish",
        type: "bool",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "currentModuleExitedValidatorsCount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "currentNodeOperatorExitedValidatorsCount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "currentNodeOperatorStuckValidatorsCount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "newModuleExitedValidatorsCount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "newNodeOperatorExitedValidatorsCount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "newNodeOperatorStuckValidatorsCount",
            type: "uint256",
          },
        ],
        internalType: "struct StakingRouter.ValidatorsCountsCorrection",
        name: "_correction",
        type: "tuple",
      },
    ],
    name: "unsafeSetExitedValidatorsCount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "_stakingModuleIds",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "_exitedValidatorsCounts",
        type: "uint256[]",
      },
    ],
    name: "updateExitedValidatorsCountByStakingModule",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_nodeOperatorId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_refundedValidatorsCount",
        type: "uint256",
      },
    ],
    name: "updateRefundedValidatorsCount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_targetShare",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_stakingModuleFee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_treasuryFee",
        type: "uint256",
      },
    ],
    name: "updateStakingModule",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_stakingModuleId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_nodeOperatorId",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_isTargetLimitActive",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "_targetLimit",
        type: "uint256",
      },
    ],
    name: "updateTargetValidatorsLimits",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];
