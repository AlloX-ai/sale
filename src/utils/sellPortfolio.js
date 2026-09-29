// Small grace period after on-chain approvals before we ask the backend to
// re-prepare the swap — gives its allowance indexer a moment to catch up.
export const APPROVAL_INDEX_LAG_MS = 3000;
export const PREPARE_RETRY_DELAY_MS = 2500;
export const PREPARE_BUSY_RETRY_DELAY_MS = 3000;
export const MAX_POST_APPROVAL_PREPARE_RETRIES = 4;
export const MAX_PREPARE_BUSY_RETRIES = 8;
export const PERMIT2_BATCH_PROVIDERS = new Set(["PANCAKESWAP", "UNISWAP"]);
export const PCS_AGGREGATOR_PROVIDER = "PCS_AGGREGATOR";
export const MAX_ORDER_ATTEMPTS = 3;

export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
];

export const PERMIT2_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "spender", type: "address" },
      { name: "amount", type: "uint160" },
      { name: "expiration", type: "uint48" },
    ],
    outputs: [],
  },
];

export const POLL_INTERVAL_MS = 3500;
export const MAX_POLL_ATTEMPTS = 60;
export const STALE_TX_SUBMITTED_TIMEOUT_MS = 120000;

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const collectTokenLogos = (items) => {
  const map = {};
  (Array.isArray(items) ? items : []).forEach((item) => {
    const symbol = String(item?.symbol || item?.name || "")
      .trim()
      .toUpperCase();
    const logo =
      item?.logo ?? item?.logoUrl ?? item?.image ?? item?.icon ?? null;
    if (symbol && logo && !map[symbol]) {
      map[symbol] = logo;
    }
  });
  return map;
};

export const extractSellTokenLogosFromPortfolioInfo = (response) => {
  const portfolioPayload = response?.portfolio || response || {};
  return {
    ...collectTokenLogos(portfolioPayload?.positions),
    ...collectTokenLogos(response?.positions),
  };
};

export const parseOptionalGasLimit = (value) => {
  if (value == null || value === "") return undefined;
  try {
    const gas = BigInt(value);
    return gas > 0n ? gas : undefined;
  } catch {
    return undefined;
  }
};

const isRateLimitedError = (error) => {
  if (!error) return false;
  if (error?.status === 429 || error?.code === 429) return true;
  const msg = String(error?.message || error).toLowerCase();
  return (
    msg.includes("429") ||
    msg.includes("too many requests") ||
    msg.includes("rate limit")
  );
};

export const sellPollDelayMs = (attempt, error) => {
  const base = Math.min(12000, Math.round(POLL_INTERVAL_MS * 1.3 ** attempt));
  const boosted = isRateLimitedError(error) ? Math.max(base, 12000) : base;
  const jitter = 0.85 + Math.random() * 0.3;
  return Math.round(boosted * jitter);
};

const normalizeOrderProvider = (provider) =>
  String(provider || "")
    .trim()
    .toUpperCase();

const canonicalizeOrderProvider = (provider) => {
  const normalized = normalizeOrderProvider(provider);
  if (!normalized) return "";
  // PCS aggregator (stocks) must not collapse into PANCAKESWAP — those rows
  // use plain ERC20 approve, not Permit2 batch.
  if (
    normalized === PCS_AGGREGATOR_PROVIDER ||
    normalized.includes("PCS_AGGREGATOR") ||
    normalized === "PCS"
  ) {
    return PCS_AGGREGATOR_PROVIDER;
  }
  if (normalized.includes("PANCAKE")) return "PANCAKESWAP";
  if (normalized.includes("UNISWAP")) return "UNISWAP";
  if (normalized.includes("BRIDGERS")) return "BRIDGERS";
  return normalized;
};

export const isPcsAggregatorProvider = (provider) =>
  canonicalizeOrderProvider(provider) === PCS_AGGREGATOR_PROVIDER;

export const isPermit2BatchProvider = (provider) => {
  const canonical = canonicalizeOrderProvider(provider);
  if (!canonical || canonical === PCS_AGGREGATOR_PROVIDER) return false;
  return PERMIT2_BATCH_PROVIDERS.has(canonical);
};

export const isRetryablePrepareBusy = (error) =>
  error?.status === 503 && error?.data?.retryable !== false;

export const pickOrderProvider = (order) =>
  canonicalizeOrderProvider(
    order?.swapProvider ?? order?.provider ?? order?.routeProvider,
  );

export const pickOrderTokenAddress = (order) =>
  String(
    order?.fromTokenAddress ??
      order?.tokenAddress ??
      order?.fromToken?.address ??
      order?.token?.address ??
      "",
  ).trim();

export const pickOrderAmountWei = (order) =>
  String(
    order?.fromAmount ??
      order?.fromAmountWei ??
      order?.amountWei ??
      order?.amountInWei ??
      "",
  ).trim();
