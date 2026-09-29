import {
  private_sale_bnb_address,
  private_sale_base_address,
  private_sale_eth_address,
  PRIVATE_SALE_BNB_ABI,
  PRIVATE_SALE_BASE_ABI,
  PRIVATE_SALE_ETH_ABI,
} from "./contracts";

export const CHAIN_KEY_TO_ID = {
  BSC: 56,
  ETH: 1,
  BASE: 8453,
  SOL: 101,
};

export const CHAIN_KEY_TO_API = {
  BSC: "BSC",
  ETH: "ETH",
  BASE: "BASE",
  SOL: "SOL",
};

export const PRIVATE_SALE_CONTRACTS = {
  BSC: {
    address: private_sale_bnb_address,
    abi: PRIVATE_SALE_BNB_ABI,
    chainId: CHAIN_KEY_TO_ID.BSC,
  },
  ETH: {
    address: private_sale_eth_address,
    abi: PRIVATE_SALE_ETH_ABI,
    chainId: CHAIN_KEY_TO_ID.ETH,
  },
  BASE: {
    address: private_sale_base_address,
    abi: PRIVATE_SALE_BASE_ABI,
    chainId: CHAIN_KEY_TO_ID.BASE,
  },
};

/** Resolve on-chain private-sale config for an EVM chain key (BSC / ETH / BASE). */
export function getPrivateSaleContract(chainKey) {
  const key = String(chainKey || "").toUpperCase();
  return PRIVATE_SALE_CONTRACTS[key] ?? null;
}

/** @deprecated Use getPrivateSaleContract(chainKey).abi */
export const PRIVATE_SALE_ABI = PRIVATE_SALE_BNB_ABI;

export const CHAIN_EXPLORERS = {
  BSC: "https://bscscan.com/tx/",
  ETH: "https://etherscan.io/tx/",
  BASE: "https://basescan.org/tx/",
  SOL: "https://explorer.solana.com/tx/",
};

export const TOKEN_LOGOS = {
  USDC: "https://cdn.allox.ai/allox/tokens/usdc.svg",
  USDT: "https://cdn.allox.ai/allox/tokens/usdt.svg",
  BNB: "https://cdn.allox.ai/allox/networks/bnbIcon.svg",
  ETH: "https://cdn.allox.ai/allox/networks/eth.svg",
  SOL: "https://cdn.allox.ai/allox/networks/solana.svg",
};

export const CHAIN_LOGOS = {
  BSC: "https://cdn.allox.ai/allox/networks/bnbIcon.svg",
  ETH: "https://cdn.allox.ai/allox/networks/eth.svg",
  BASE: "https://cdn.allox.ai/allox/networks/base.svg",
  SOL: "https://cdn.allox.ai/allox/networks/solana.svg",
};

/** Map contract revert reasons to user-facing messages */
export const PRIVATE_SALE_REVERT_MESSAGES = {
  "sale not active": "The private sale is not currently active.",
  "below minimum": "Contribution is below the minimum amount ($10).",
  "above maximum": "Contribution exceeds the maximum allowed amount.",
  "token not accepted": "This token is not accepted for contributions.",
  "sale paused": "The private sale is temporarily paused.",
};
