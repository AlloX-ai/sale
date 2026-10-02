export const checkin_base_address =
  "0x43be8192363899B853a98661e2ea6451940e27e3";
export const checkin_eth_address = "0x43be8192363899b853a98661e2ea6451940e27e3";
export const checkin_bnb_address = "0x43be8192363899b853a98661e2ea6451940e27e3";

export const buy_messages_bnb_address =
  "0x0b3e65149C84A0aB56B199DeA3C48965a0569225";
export const buy_messages_eth_address =
  "0xd33f10222a9783d30cb3a4dab51fed1a045c81e0";
export const buy_messages_base_address =
  "0xf3e05a607c97006b37d2b2789e17c3a832ba56f0";

export const private_sale_bnb_address =
  "0xd23be871ef3a7594226e4ef64b05186fc88d4c02";
export const private_sale_base_address =
  "0x999c68622266b7ca08369a3185a1970409a1339b";
export const private_sale_eth_address =
  "0xfAc9afd734DB570F010116891065C88D47E56837";

export const public_sale_eth_address =
  "0x86324c68C38Ec464Bc5712655f4425252a0E6e8a";

export const PUBLIC_SALE_ETH_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  { inputs: [], name: "AccessControlBadConfirmation", type: "error" },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "bytes32", name: "neededRole", type: "bytes32" },
    ],
    name: "AccessControlUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "target", type: "address" }],
    name: "AddressEmptyCode",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "AddressInsufficientBalance",
    type: "error",
  },
  {
    inputs: [{ internalType: "bytes16", name: "entityID", type: "bytes16" }],
    name: "AllocationAlreadySet",
    type: "error",
  },
  {
    inputs: [
      { internalType: "bytes16", name: "entityID", type: "bytes16" },
      { internalType: "address", name: "wallet", type: "address" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "allocation", type: "uint256" },
      { internalType: "uint256", name: "commitment", type: "uint256" },
    ],
    name: "AllocationExceedsCommitment",
    type: "error",
  },
  {
    inputs: [{ internalType: "bytes16", name: "entityID", type: "bytes16" }],
    name: "AlreadyRefunded",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "got", type: "uint256" },
      { internalType: "uint256", name: "want", type: "uint256" },
    ],
    name: "BidAmountCannotBeLowered",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "min", type: "uint256" },
    ],
    name: "BidBelowMinAmount",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "max", type: "uint256" },
    ],
    name: "BidExceedsMaxAmount",
    type: "error",
  },
  { inputs: [], name: "BidLockupCannotBeUndone", type: "error" },
  { inputs: [], name: "BidMustHaveLockup", type: "error" },
  {
    inputs: [
      { internalType: "uint64", name: "opensAt", type: "uint64" },
      { internalType: "uint64", name: "closesAt", type: "uint64" },
      { internalType: "uint256", name: "currentTime", type: "uint256" },
    ],
    name: "BidOutsideAllowedWindow",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "price", type: "uint256" },
      { internalType: "uint256", name: "min", type: "uint256" },
    ],
    name: "BidPriceBelowMinPrice",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "got", type: "uint256" },
      { internalType: "uint256", name: "want", type: "uint256" },
    ],
    name: "BidPriceCannotBeLowered",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "price", type: "uint256" },
      { internalType: "uint256", name: "max", type: "uint256" },
    ],
    name: "BidPriceExceedsMaxPrice",
    type: "error",
  },
  { inputs: [], name: "ClaimRefundDisabled", type: "error" },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "DuplicatePaymentToken",
    type: "error",
  },
  { inputs: [], name: "ECDSAInvalidSignature", type: "error" },
  {
    inputs: [{ internalType: "uint256", name: "length", type: "uint256" }],
    name: "ECDSAInvalidSignatureLength",
    type: "error",
  },
  {
    inputs: [{ internalType: "bytes32", name: "s", type: "bytes32" }],
    name: "ECDSAInvalidSignatureS",
    type: "error",
  },
  {
    inputs: [{ internalType: "bytes16", name: "entityID", type: "bytes16" }],
    name: "EntityNotInitialized",
    type: "error",
  },
  { inputs: [], name: "FailedInnerCall", type: "error" },
  { inputs: [], name: "InvalidInitialization", type: "error" },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "InvalidPaymentToken",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "got", type: "uint256" },
      { internalType: "uint256", name: "want", type: "uint256" },
    ],
    name: "InvalidPaymentTokenDecimals",
    type: "error",
  },
  {
    inputs: [
      { internalType: "bytes16", name: "got", type: "bytes16" },
      { internalType: "bytes16", name: "want", type: "bytes16" },
    ],
    name: "InvalidSaleUUID",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "got", type: "address" },
      { internalType: "address", name: "want", type: "address" },
    ],
    name: "InvalidSender",
    type: "error",
  },
  {
    inputs: [
      { internalType: "enum SettlementSale.Stage", name: "got", type: "uint8" },
      {
        internalType: "enum SettlementSale.Stage[]",
        name: "want",
        type: "uint8[]",
      },
    ],
    name: "InvalidStage",
    type: "error",
  },
  {
    inputs: [
      { internalType: "bytes16", name: "entityID", type: "bytes16" },
      { internalType: "uint256", name: "count", type: "uint256" },
      { internalType: "uint256", name: "max", type: "uint256" },
    ],
    name: "MaxWalletsPerEntityExceeded",
    type: "error",
  },
  { inputs: [], name: "NoPaymentTokens", type: "error" },
  { inputs: [], name: "NotInitializing", type: "error" },
  {
    inputs: [
      { internalType: "uint256", name: "expiresAt", type: "uint256" },
      { internalType: "uint256", name: "currentTime", type: "uint256" },
    ],
    name: "PurchasePermitExpired",
    type: "error",
  },
  { inputs: [], name: "ReduceCommitmentDisabled", type: "error" },
  {
    inputs: [
      { internalType: "bytes16", name: "entityID", type: "bytes16" },
      { internalType: "address", name: "wallet", type: "address" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "uint256", name: "committed", type: "uint256" },
      { internalType: "uint256", name: "allocated", type: "uint256" },
    ],
    name: "ReductionExceedsReducibleAmount",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  { inputs: [], name: "SalePaused", type: "error" },
  {
    inputs: [{ internalType: "address", name: "signer", type: "address" }],
    name: "UnauthorizedSigner",
    type: "error",
  },
  {
    inputs: [
      { internalType: "uint256", name: "got", type: "uint256" },
      { internalType: "uint256", name: "want", type: "uint256" },
    ],
    name: "UnexpectedTotalAcceptedAmount",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "wallet", type: "address" },
      { internalType: "bytes16", name: "entityID", type: "bytes16" },
    ],
    name: "WalletNotAssociatedWithEntity",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "wallet", type: "address" }],
    name: "WalletNotInitialized",
    type: "error",
  },
  {
    inputs: [
      { internalType: "bytes16", name: "got", type: "bytes16" },
      { internalType: "bytes16", name: "want", type: "bytes16" },
      { internalType: "address", name: "wallet", type: "address" },
    ],
    name: "WalletTiedToAnotherEntity",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "requested", type: "uint256" },
      { internalType: "uint256", name: "available", type: "uint256" },
    ],
    name: "WithdrawalExceedsAvailable",
    type: "error",
  },
  { inputs: [], name: "ZeroAddress", type: "error" },
  { inputs: [], name: "ZeroAmount", type: "error" },
  { inputs: [], name: "ZeroEntityID", type: "error" },
  { inputs: [], name: "ZeroMaxWalletsPerEntity", type: "error" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes16",
        name: "entityID",
        type: "bytes16",
      },
      {
        indexed: true,
        internalType: "address",
        name: "wallet",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "acceptedAmount",
        type: "uint256",
      },
    ],
    name: "AllocationSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes16",
        name: "entityID",
        type: "bytes16",
      },
      {
        indexed: true,
        internalType: "address",
        name: "wallet",
        type: "address",
      },
      {
        components: [
          { internalType: "bool", name: "lockup", type: "bool" },
          { internalType: "uint64", name: "price", type: "uint64" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        indexed: false,
        internalType: "struct SettlementSale.Bid",
        name: "bid",
        type: "tuple",
      },
    ],
    name: "BidPlaced",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "bool", name: "enabled", type: "bool" },
    ],
    name: "ClaimRefundEnabledChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes16",
        name: "entityID",
        type: "bytes16",
      },
      {
        indexed: true,
        internalType: "address",
        name: "wallet",
        type: "address",
      },
      {
        indexed: true,
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
    name: "CommitmentIncreased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes16",
        name: "entityID",
        type: "bytes16",
      },
      {
        indexed: true,
        internalType: "address",
        name: "wallet",
        type: "address",
      },
      {
        indexed: true,
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
    name: "CommitmentReduced",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes16",
        name: "entityID",
        type: "bytes16",
      },
      {
        indexed: true,
        internalType: "address",
        name: "wallet",
        type: "address",
      },
    ],
    name: "EntityInitialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes16",
        name: "entityID",
        type: "bytes16",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "EntityRefunded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "version",
        type: "uint64",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "previousMax",
        type: "uint8",
      },
      { indexed: false, internalType: "uint8", name: "newMax", type: "uint8" },
    ],
    name: "MaxWalletsPerEntityChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "bool", name: "paused", type: "bool" },
    ],
    name: "PausedStateChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousReceiver",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newReceiver",
        type: "address",
      },
    ],
    name: "ProceedsReceiverChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: true,
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
    name: "ProceedsWithdrawn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "bool", name: "enabled", type: "bool" },
    ],
    name: "ReduceCommitmentEnabledChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes16",
        name: "entityID",
        type: "bytes16",
      },
    ],
    name: "RefundedEntitySkipped",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "bytes32", name: "role", type: "bytes32" },
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
      { indexed: true, internalType: "bytes32", name: "role", type: "bytes32" },
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
      { indexed: true, internalType: "bytes32", name: "role", type: "bytes32" },
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
        internalType: "enum SettlementSale.Stage",
        name: "previousStage",
        type: "uint8",
      },
      {
        indexed: true,
        internalType: "enum SettlementSale.Stage",
        name: "newStage",
        type: "uint8",
      },
    ],
    name: "StageChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
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
      { indexed: true, internalType: "address", name: "to", type: "address" },
    ],
    name: "TokensRecovered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes16",
        name: "entityID",
        type: "bytes16",
      },
      {
        indexed: true,
        internalType: "address",
        name: "wallet",
        type: "address",
      },
    ],
    name: "WalletInitialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes16",
        name: "entityID",
        type: "bytes16",
      },
      {
        indexed: true,
        internalType: "address",
        name: "wallet",
        type: "address",
      },
      {
        indexed: true,
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
    name: "WalletRefunded",
    type: "event",
  },
  {
    inputs: [],
    name: "COMMITMENT_REDUCER_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PAUSER_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PURCHASE_PERMIT_SIGNER_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "REFUNDER_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "SALE_MANAGER_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "SETTLEMENT_FINALIZER_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "SETTLER_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "TOKEN_RECOVERER_ROLE",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "cancelBid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimRefund",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimRefundEnabled",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "from", type: "uint256" },
      { internalType: "uint256", name: "to", type: "uint256" },
    ],
    name: "entitiesIn",
    outputs: [{ internalType: "bytes16[]", name: "", type: "bytes16[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "entityAt",
    outputs: [{ internalType: "bytes16", name: "", type: "bytes16" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes16[]", name: "entityIDs", type: "bytes16[]" },
    ],
    name: "entityStatesByIDs",
    outputs: [
      {
        components: [
          { internalType: "bytes16", name: "entityID", type: "bytes16" },
          { internalType: "uint32", name: "bidTimestamp", type: "uint32" },
          { internalType: "bool", name: "refunded", type: "bool" },
          {
            components: [
              { internalType: "bool", name: "lockup", type: "bool" },
              { internalType: "uint64", name: "price", type: "uint64" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            internalType: "struct SettlementSale.Bid",
            name: "currentBid",
            type: "tuple",
          },
          {
            components: [
              { internalType: "address", name: "addr", type: "address" },
              { internalType: "bytes16", name: "entityID", type: "bytes16" },
              {
                components: [
                  { internalType: "address", name: "token", type: "address" },
                  { internalType: "uint256", name: "amount", type: "uint256" },
                ],
                internalType: "struct TokenAmount[]",
                name: "committedAmountByToken",
                type: "tuple[]",
              },
              {
                components: [
                  { internalType: "address", name: "token", type: "address" },
                  { internalType: "uint256", name: "amount", type: "uint256" },
                ],
                internalType: "struct TokenAmount[]",
                name: "cancelledAmountByToken",
                type: "tuple[]",
              },
              {
                components: [
                  { internalType: "address", name: "token", type: "address" },
                  { internalType: "uint256", name: "amount", type: "uint256" },
                ],
                internalType: "struct TokenAmount[]",
                name: "acceptedAmountByToken",
                type: "tuple[]",
              },
            ],
            internalType: "struct SettlementSale.WalletStateView[]",
            name: "walletStates",
            type: "tuple[]",
          },
        ],
        internalType: "struct SettlementSale.EntityStateView[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "from", type: "uint256" },
      { internalType: "uint256", name: "to", type: "uint256" },
    ],
    name: "entityStatesIn",
    outputs: [
      {
        components: [
          { internalType: "bytes16", name: "entityID", type: "bytes16" },
          { internalType: "uint32", name: "bidTimestamp", type: "uint32" },
          { internalType: "bool", name: "refunded", type: "bool" },
          {
            components: [
              { internalType: "bool", name: "lockup", type: "bool" },
              { internalType: "uint64", name: "price", type: "uint64" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            internalType: "struct SettlementSale.Bid",
            name: "currentBid",
            type: "tuple",
          },
          {
            components: [
              { internalType: "address", name: "addr", type: "address" },
              { internalType: "bytes16", name: "entityID", type: "bytes16" },
              {
                components: [
                  { internalType: "address", name: "token", type: "address" },
                  { internalType: "uint256", name: "amount", type: "uint256" },
                ],
                internalType: "struct TokenAmount[]",
                name: "committedAmountByToken",
                type: "tuple[]",
              },
              {
                components: [
                  { internalType: "address", name: "token", type: "address" },
                  { internalType: "uint256", name: "amount", type: "uint256" },
                ],
                internalType: "struct TokenAmount[]",
                name: "cancelledAmountByToken",
                type: "tuple[]",
              },
              {
                components: [
                  { internalType: "address", name: "token", type: "address" },
                  { internalType: "uint256", name: "amount", type: "uint256" },
                ],
                internalType: "struct TokenAmount[]",
                name: "acceptedAmountByToken",
                type: "tuple[]",
              },
            ],
            internalType: "struct SettlementSale.WalletStateView[]",
            name: "walletStates",
            type: "tuple[]",
          },
        ],
        internalType: "struct SettlementSale.EntityStateView[]",
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
        name: "expectedTotalAcceptedAmount",
        type: "uint256",
      },
    ],
    name: "finalizeSettlement",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "wallet", type: "address" },
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        internalType: "struct WalletTokenAmount[]",
        name: "reductions",
        type: "tuple[]",
      },
    ],
    name: "forceReduceCommitment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "role", type: "bytes32" }],
    name: "getRoleAdmin",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" },
      { internalType: "uint256", name: "index", type: "uint256" },
    ],
    name: "getRoleMember",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "role", type: "bytes32" }],
    name: "getRoleMemberCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" },
      { internalType: "address", name: "account", type: "address" },
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" },
      { internalType: "address", name: "account", type: "address" },
    ],
    name: "hasRole",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "bytes16", name: "saleUUID", type: "bytes16" },
          { internalType: "address", name: "admin", type: "address" },
          {
            internalType: "address[]",
            name: "extraManagers",
            type: "address[]",
          },
          {
            internalType: "address[]",
            name: "extraPausers",
            type: "address[]",
          },
          { internalType: "address", name: "extraSettler", type: "address" },
          { internalType: "address", name: "extraRefunder", type: "address" },
          {
            internalType: "address",
            name: "purchasePermitSigner",
            type: "address",
          },
          {
            internalType: "address",
            name: "proceedsReceiver",
            type: "address",
          },
          { internalType: "bool", name: "claimRefundEnabled", type: "bool" },
          {
            internalType: "bool",
            name: "reduceCommitmentEnabled",
            type: "bool",
          },
          { internalType: "bool", name: "skipPreOpen", type: "bool" },
          { internalType: "uint8", name: "maxWalletsPerEntity", type: "uint8" },
          {
            internalType: "contract IERC20Metadata[]",
            name: "paymentTokens",
            type: "address[]",
          },
          {
            internalType: "uint256",
            name: "expectedPaymentTokenDecimals",
            type: "uint256",
          },
        ],
        internalType: "struct SettlementSale.Init",
        name: "init",
        type: "tuple",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "maxWalletsPerEntity",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "numCommitments",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "numEntities",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "numEntityAllocations",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "openCancellation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "openCommitment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "openSettlement",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paymentTokens",
    outputs: [
      { internalType: "contract IERC20[]", name: "", type: "address[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "proceedsReceiver",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes16[]", name: "entityIDs", type: "bytes16[]" },
      { internalType: "bool", name: "skipAlreadyRefunded", type: "bool" },
    ],
    name: "processRefunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "readCommitmentDataAt",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "commitmentID", type: "bytes32" },
          {
            internalType: "bytes16",
            name: "saleSpecificEntityID",
            type: "bytes16",
          },
          { internalType: "uint64", name: "timestamp", type: "uint64" },
          { internalType: "uint64", name: "price", type: "uint64" },
          { internalType: "bool", name: "lockup", type: "bool" },
          { internalType: "bool", name: "refunded", type: "bool" },
          {
            components: [
              { internalType: "address", name: "wallet", type: "address" },
              { internalType: "address", name: "token", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            internalType: "struct WalletTokenAmount[]",
            name: "amounts",
            type: "tuple[]",
          },
          { internalType: "bytes", name: "extraData", type: "bytes" },
        ],
        internalType: "struct ICommitmentDataReader.CommitmentData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "from", type: "uint256" },
      { internalType: "uint256", name: "to", type: "uint256" },
    ],
    name: "readCommitmentDataIn",
    outputs: [
      {
        components: [
          { internalType: "bytes32", name: "commitmentID", type: "bytes32" },
          {
            internalType: "bytes16",
            name: "saleSpecificEntityID",
            type: "bytes16",
          },
          { internalType: "uint64", name: "timestamp", type: "uint64" },
          { internalType: "uint64", name: "price", type: "uint64" },
          { internalType: "bool", name: "lockup", type: "bool" },
          { internalType: "bool", name: "refunded", type: "bool" },
          {
            components: [
              { internalType: "address", name: "wallet", type: "address" },
              { internalType: "address", name: "token", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            internalType: "struct WalletTokenAmount[]",
            name: "amounts",
            type: "tuple[]",
          },
          { internalType: "bytes", name: "extraData", type: "bytes" },
        ],
        internalType: "struct ICommitmentDataReader.CommitmentData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "readEntityAllocationDataAt",
    outputs: [
      {
        components: [
          {
            internalType: "bytes16",
            name: "saleSpecificEntityID",
            type: "bytes16",
          },
          {
            components: [
              { internalType: "address", name: "wallet", type: "address" },
              { internalType: "address", name: "token", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            internalType: "struct WalletTokenAmount[]",
            name: "acceptedAmounts",
            type: "tuple[]",
          },
        ],
        internalType: "struct IEntityAllocationDataReader.EntityAllocationData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "from", type: "uint256" },
      { internalType: "uint256", name: "to", type: "uint256" },
    ],
    name: "readEntityAllocationDataIn",
    outputs: [
      {
        components: [
          {
            internalType: "bytes16",
            name: "saleSpecificEntityID",
            type: "bytes16",
          },
          {
            components: [
              { internalType: "address", name: "wallet", type: "address" },
              { internalType: "address", name: "token", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            internalType: "struct WalletTokenAmount[]",
            name: "acceptedAmounts",
            type: "tuple[]",
          },
        ],
        internalType:
          "struct IEntityAllocationDataReader.EntityAllocationData[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "contract IERC20", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
    ],
    name: "recoverTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "wallet", type: "address" },
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        internalType: "struct WalletTokenAmount[]",
        name: "reductions",
        type: "tuple[]",
      },
    ],
    name: "reduceCommitment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "reduceCommitmentEnabled",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" },
      { internalType: "address", name: "callerConfirmation", type: "address" },
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "contract IERC20", name: "token", type: "address" },
      {
        components: [
          { internalType: "bool", name: "lockup", type: "bool" },
          { internalType: "uint64", name: "price", type: "uint64" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        internalType: "struct SettlementSale.Bid",
        name: "bid",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "bytes16",
            name: "saleSpecificEntityID",
            type: "bytes16",
          },
          { internalType: "bytes16", name: "saleUUID", type: "bytes16" },
          { internalType: "address", name: "wallet", type: "address" },
          { internalType: "uint64", name: "expiresAt", type: "uint64" },
          { internalType: "uint256", name: "minAmount", type: "uint256" },
          { internalType: "uint256", name: "maxAmount", type: "uint256" },
          { internalType: "uint64", name: "minPrice", type: "uint64" },
          { internalType: "uint64", name: "maxPrice", type: "uint64" },
          { internalType: "uint64", name: "opensAt", type: "uint64" },
          { internalType: "uint64", name: "closesAt", type: "uint64" },
          { internalType: "bytes", name: "payload", type: "bytes" },
        ],
        internalType: "struct PurchasePermitV3",
        name: "purchasePermit",
        type: "tuple",
      },
      { internalType: "bytes", name: "purchasePermitSignature", type: "bytes" },
    ],
    name: "replaceBidWithApproval",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "contract IERC20", name: "token", type: "address" },
      {
        components: [
          { internalType: "bool", name: "lockup", type: "bool" },
          { internalType: "uint64", name: "price", type: "uint64" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        internalType: "struct SettlementSale.Bid",
        name: "bid",
        type: "tuple",
      },
      {
        components: [
          {
            internalType: "bytes16",
            name: "saleSpecificEntityID",
            type: "bytes16",
          },
          { internalType: "bytes16", name: "saleUUID", type: "bytes16" },
          { internalType: "address", name: "wallet", type: "address" },
          { internalType: "uint64", name: "expiresAt", type: "uint64" },
          { internalType: "uint256", name: "minAmount", type: "uint256" },
          { internalType: "uint256", name: "maxAmount", type: "uint256" },
          { internalType: "uint64", name: "minPrice", type: "uint64" },
          { internalType: "uint64", name: "maxPrice", type: "uint64" },
          { internalType: "uint64", name: "opensAt", type: "uint64" },
          { internalType: "uint64", name: "closesAt", type: "uint64" },
          { internalType: "bytes", name: "payload", type: "bytes" },
        ],
        internalType: "struct PurchasePermitV3",
        name: "purchasePermit",
        type: "tuple",
      },
      { internalType: "bytes", name: "purchasePermitSignature", type: "bytes" },
      { internalType: "uint256", name: "erc20PermitDeadline", type: "uint256" },
      { internalType: "bytes", name: "erc20PermitSignature", type: "bytes" },
    ],
    name: "replaceBidWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes32", name: "role", type: "bytes32" },
      { internalType: "address", name: "account", type: "address" },
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "saleUUID",
    outputs: [{ internalType: "bytes16", name: "", type: "bytes16" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "bytes16",
            name: "saleSpecificEntityID",
            type: "bytes16",
          },
          { internalType: "address", name: "wallet", type: "address" },
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "acceptedAmount", type: "uint256" },
        ],
        internalType: "struct IOffchainSettlement.Allocation[]",
        name: "allocations",
        type: "tuple[]",
      },
      { internalType: "bool", name: "allowOverwrite", type: "bool" },
    ],
    name: "setAllocations",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "enabled", type: "bool" }],
    name: "setClaimRefundEnabled",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "max", type: "uint8" }],
    name: "setMaxWalletsPerEntity",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "isPaused", type: "bool" }],
    name: "setPaused",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "newProceedsReceiver", type: "address" },
    ],
    name: "setProceedsReceiver",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "enabled", type: "bool" }],
    name: "setReduceCommitmentEnabled",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "stage",
    outputs: [
      { internalType: "enum SettlementSale.Stage", name: "", type: "uint8" },
    ],
    stateMutability: "view",
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
    inputs: [],
    name: "totalAcceptedAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalAcceptedAmountByToken",
    outputs: [
      {
        components: [
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        internalType: "struct TokenAmount[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalCancelledAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalCancelledAmountByToken",
    outputs: [
      {
        components: [
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        internalType: "struct TokenAmount[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalCommittedAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalCommittedAmountByToken",
    outputs: [
      {
        components: [
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        internalType: "struct TokenAmount[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalRefundedAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalRefundedAmountByToken",
    outputs: [
      {
        components: [
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        internalType: "struct TokenAmount[]",
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
        internalType: "enum SettlementSale.Stage",
        name: "newStage",
        type: "uint8",
      },
    ],
    name: "unsafeSetStage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [
      { internalType: "uint32", name: "", type: "uint32" },
      { internalType: "uint32", name: "", type: "uint32" },
      { internalType: "uint32", name: "", type: "uint32" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address[]", name: "addrs", type: "address[]" }],
    name: "walletStatesByAddresses",
    outputs: [
      {
        components: [
          { internalType: "address", name: "addr", type: "address" },
          { internalType: "bytes16", name: "entityID", type: "bytes16" },
          {
            components: [
              { internalType: "address", name: "token", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            internalType: "struct TokenAmount[]",
            name: "committedAmountByToken",
            type: "tuple[]",
          },
          {
            components: [
              { internalType: "address", name: "token", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            internalType: "struct TokenAmount[]",
            name: "cancelledAmountByToken",
            type: "tuple[]",
          },
          {
            components: [
              { internalType: "address", name: "token", type: "address" },
              { internalType: "uint256", name: "amount", type: "uint256" },
            ],
            internalType: "struct TokenAmount[]",
            name: "acceptedAmountByToken",
            type: "tuple[]",
          },
        ],
        internalType: "struct SettlementSale.WalletStateView[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "contract IERC20", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "withdrawPartial",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawnAmount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawnAmountByToken",
    outputs: [
      {
        components: [
          { internalType: "address", name: "token", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        internalType: "struct TokenAmount[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const PRIVATE_SALE_ETH_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_treasury", type: "address" },
      { internalType: "uint8", name: "_tierCount", type: "uint8" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      { indexed: true, internalType: "uint8", name: "tierId", type: "uint8" },
      {
        indexed: true,
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
      {
        indexed: false,
        internalType: "uint256",
        name: "amountNormalized",
        type: "uint256",
      },
    ],
    name: "Contributed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "priceUsd1e18",
        type: "uint256",
      },
    ],
    name: "NativePriceSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "bool", name: "paused", type: "bool" },
    ],
    name: "PausedSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint8", name: "tierId", type: "uint8" },
      { indexed: false, internalType: "uint256", name: "cap", type: "uint256" },
    ],
    name: "TierCapSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      { indexed: false, internalType: "bool", name: "enabled", type: "bool" },
      {
        indexed: false,
        internalType: "uint8",
        name: "decimals",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxAmount",
        type: "uint256",
      },
    ],
    name: "TokenConfigured",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "treasury",
        type: "address",
      },
    ],
    name: "TreasurySet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint64", name: "start", type: "uint64" },
      { indexed: false, internalType: "uint64", name: "end", type: "uint64" },
    ],
    name: "WindowSet",
    type: "event",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint8", name: "tierId", type: "uint8" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "contribute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "tierId", type: "uint8" }],
    name: "contributeNative",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "nativePriceUsd",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pendingOwner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "saleEnd",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "saleStart",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "priceUsd1e18", type: "uint256" },
    ],
    name: "setNativePrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "_paused", type: "bool" }],
    name: "setPaused",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint8", name: "tierId", type: "uint8" },
      { internalType: "uint256", name: "cap", type: "uint256" },
    ],
    name: "setTierCap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "bool", name: "enabled", type: "bool" },
      { internalType: "uint8", name: "decimals", type: "uint8" },
      { internalType: "uint256", name: "minAmount", type: "uint256" },
      { internalType: "uint256", name: "maxAmount", type: "uint256" },
    ],
    name: "setToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_treasury", type: "address" }],
    name: "setTreasury",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint64", name: "start", type: "uint64" },
      { internalType: "uint64", name: "end", type: "uint64" },
    ],
    name: "setWindow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "sweep",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    name: "tierCap",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tierCount",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    name: "tierRaised",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "tokens",
    outputs: [
      { internalType: "bool", name: "enabled", type: "bool" },
      { internalType: "uint8", name: "decimals", type: "uint8" },
      { internalType: "uint256", name: "minAmount", type: "uint256" },
      { internalType: "uint256", name: "maxAmount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "treasury",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];
export const PRIVATE_SALE_BASE_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_treasury", type: "address" },
      { internalType: "uint8", name: "_tierCount", type: "uint8" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      { indexed: true, internalType: "uint8", name: "tierId", type: "uint8" },
      {
        indexed: true,
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
      {
        indexed: false,
        internalType: "uint256",
        name: "amountNormalized",
        type: "uint256",
      },
    ],
    name: "Contributed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "priceUsd1e18",
        type: "uint256",
      },
    ],
    name: "NativePriceSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "bool", name: "paused", type: "bool" },
    ],
    name: "PausedSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint8", name: "tierId", type: "uint8" },
      { indexed: false, internalType: "uint256", name: "cap", type: "uint256" },
    ],
    name: "TierCapSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      { indexed: false, internalType: "bool", name: "enabled", type: "bool" },
      {
        indexed: false,
        internalType: "uint8",
        name: "decimals",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxAmount",
        type: "uint256",
      },
    ],
    name: "TokenConfigured",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "treasury",
        type: "address",
      },
    ],
    name: "TreasurySet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint64", name: "start", type: "uint64" },
      { indexed: false, internalType: "uint64", name: "end", type: "uint64" },
    ],
    name: "WindowSet",
    type: "event",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint8", name: "tierId", type: "uint8" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "contribute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "tierId", type: "uint8" }],
    name: "contributeNative",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "nativePriceUsd",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pendingOwner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "saleEnd",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "saleStart",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "priceUsd1e18", type: "uint256" },
    ],
    name: "setNativePrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "_paused", type: "bool" }],
    name: "setPaused",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint8", name: "tierId", type: "uint8" },
      { internalType: "uint256", name: "cap", type: "uint256" },
    ],
    name: "setTierCap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "bool", name: "enabled", type: "bool" },
      { internalType: "uint8", name: "decimals", type: "uint8" },
      { internalType: "uint256", name: "minAmount", type: "uint256" },
      { internalType: "uint256", name: "maxAmount", type: "uint256" },
    ],
    name: "setToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_treasury", type: "address" }],
    name: "setTreasury",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint64", name: "start", type: "uint64" },
      { internalType: "uint64", name: "end", type: "uint64" },
    ],
    name: "setWindow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "sweep",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    name: "tierCap",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tierCount",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    name: "tierRaised",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "tokens",
    outputs: [
      { internalType: "bool", name: "enabled", type: "bool" },
      { internalType: "uint8", name: "decimals", type: "uint8" },
      { internalType: "uint256", name: "minAmount", type: "uint256" },
      { internalType: "uint256", name: "maxAmount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "treasury",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];
export const PRIVATE_SALE_BNB_ABI = [
  {
    inputs: [
      { internalType: "address", name: "_treasury", type: "address" },
      { internalType: "uint8", name: "_tierCount", type: "uint8" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      { indexed: true, internalType: "uint8", name: "tierId", type: "uint8" },
      {
        indexed: true,
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
      {
        indexed: false,
        internalType: "uint256",
        name: "amountNormalized",
        type: "uint256",
      },
    ],
    name: "Contributed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "priceUsd1e18",
        type: "uint256",
      },
    ],
    name: "NativePriceSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "bool", name: "paused", type: "bool" },
    ],
    name: "PausedSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint8", name: "tierId", type: "uint8" },
      { indexed: false, internalType: "uint256", name: "cap", type: "uint256" },
    ],
    name: "TierCapSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      { indexed: false, internalType: "bool", name: "enabled", type: "bool" },
      {
        indexed: false,
        internalType: "uint8",
        name: "decimals",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxAmount",
        type: "uint256",
      },
    ],
    name: "TokenConfigured",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "treasury",
        type: "address",
      },
    ],
    name: "TreasurySet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint64", name: "start", type: "uint64" },
      { indexed: false, internalType: "uint64", name: "end", type: "uint64" },
    ],
    name: "WindowSet",
    type: "event",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint8", name: "tierId", type: "uint8" },
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "contribute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "tierId", type: "uint8" }],
    name: "contributeNative",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "nativePriceUsd",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pendingOwner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "saleEnd",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "saleStart",
    outputs: [{ internalType: "uint64", name: "", type: "uint64" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "priceUsd1e18", type: "uint256" },
    ],
    name: "setNativePrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bool", name: "_paused", type: "bool" }],
    name: "setPaused",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint8", name: "tierId", type: "uint8" },
      { internalType: "uint256", name: "cap", type: "uint256" },
    ],
    name: "setTierCap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "bool", name: "enabled", type: "bool" },
      { internalType: "uint8", name: "decimals", type: "uint8" },
      { internalType: "uint256", name: "minAmount", type: "uint256" },
      { internalType: "uint256", name: "maxAmount", type: "uint256" },
    ],
    name: "setToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_treasury", type: "address" }],
    name: "setTreasury",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint64", name: "start", type: "uint64" },
      { internalType: "uint64", name: "end", type: "uint64" },
    ],
    name: "setWindow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "sweep",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    name: "tierCap",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "tierCount",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    name: "tierRaised",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "tokens",
    outputs: [
      { internalType: "bool", name: "enabled", type: "bool" },
      { internalType: "uint8", name: "decimals", type: "uint8" },
      { internalType: "uint256", name: "minAmount", type: "uint256" },
      { internalType: "uint256", name: "maxAmount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "treasury",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
];

export const BUY_MESSAGES_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "packageId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "messageCount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountPaid",
        type: "uint256",
      },
    ],
    name: "MessagesPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "pricePerCentWei",
        type: "uint256",
      },
    ],
    name: "NativePricePerCentSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "packageId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "messageCount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "priceUSD",
        type: "uint256",
      },
    ],
    name: "PackageAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "packageId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "messageCount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "priceUSD",
        type: "uint256",
      },
      { indexed: false, internalType: "bool", name: "active", type: "bool" },
    ],
    name: "PackageUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "TokenAdded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amountPerCent",
        type: "uint256",
      },
    ],
    name: "TokenPricePerCentSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "TokenRemoved",
    type: "event",
  },
  {
    inputs: [
      { internalType: "uint256", name: "messageCount", type: "uint256" },
      { internalType: "uint256", name: "priceUSD", type: "uint256" },
    ],
    name: "addPackage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "addToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "packageId", type: "uint256" }],
    name: "buyWithNative",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "packageId", type: "uint256" },
    ],
    name: "buyWithToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "packageId", type: "uint256" }],
    name: "deactivatePackage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllPackages",
    outputs: [
      { internalType: "uint256[]", name: "messageCounts", type: "uint256[]" },
      { internalType: "uint256[]", name: "pricesUSD", type: "uint256[]" },
      { internalType: "bool[]", name: "actives", type: "bool[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "packageId", type: "uint256" }],
    name: "getPackage",
    outputs: [
      { internalType: "uint256", name: "messageCount", type: "uint256" },
      { internalType: "uint256", name: "priceUSD", type: "uint256" },
      { internalType: "bool", name: "active", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "packageId", type: "uint256" }],
    name: "getPackagePricing",
    outputs: [
      { internalType: "uint256", name: "nativePrice", type: "uint256" },
      { internalType: "address[]", name: "tokens", type: "address[]" },
      { internalType: "uint256[]", name: "prices", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "packageId", type: "uint256" }],
    name: "getRequiredNative",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "packageId", type: "uint256" },
    ],
    name: "getRequiredToken",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSupportedTokens",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nativePricePerCentWei",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "packageCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "packages",
    outputs: [
      { internalType: "uint256", name: "messageCount", type: "uint256" },
      { internalType: "uint256", name: "priceUSD", type: "uint256" },
      { internalType: "bool", name: "active", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "removeToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "pricePerCentWei", type: "uint256" },
    ],
    name: "setNativePricePerCent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "token", type: "address" },
      { internalType: "uint256", name: "amountPerCent", type: "uint256" },
    ],
    name: "setTokenPricePerCent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "supportedTokens",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "tokenList",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "tokenPricePerCent",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "packageId", type: "uint256" },
      { internalType: "uint256", name: "messageCount", type: "uint256" },
      { internalType: "uint256", name: "priceUSD", type: "uint256" },
      { internalType: "bool", name: "active", type: "bool" },
    ],
    name: "updatePackage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "token", type: "address" }],
    name: "withdrawToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export const CHECKIN_ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "dayNumber",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "CheckedIn",
    type: "event",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "canCheckIn",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "checkIn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "lastCheckInDay",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "lifetimeCheckInCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "secondsUntilNextReset",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
