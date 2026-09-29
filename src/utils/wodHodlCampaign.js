/**
 * WOD HODL campaign — overview, leaderboard, and swap quote helpers.
 *
 * GET  /campaigns/wod-hodl?address=0x...
 * GET  /campaigns/wod-hodl/leaderboard?page=1&limit=50
 * POST /campaigns/wod-hodl/swap/quote  (JWT) body: { totalInvestment, sourceToken }
 */

import { apiCall } from "./api";

export const WOD_HODL_API_BASE = "/campaigns/wod-hodl";
export const WOD_HODL_CAMPAIGN_SOURCE = "WOD_HODL";
export const WOD_HODL_CHAIN = "BSC";
export const WOD_HODL_SOURCE_TOKENS = ["USDT", "USDC", "BNB"];
export const WOD_HODL_LEADERBOARD_POLL_MS = 60_000;
export const WOD_HODL_DEFAULT_SLIPPAGE = 0.5;

export function getWodHodlOverviewUrl(address) {
  const trimmed = String(address || "").trim();
  if (!trimmed) return WOD_HODL_API_BASE;
  return `${WOD_HODL_API_BASE}?address=${encodeURIComponent(trimmed)}`;
}

export function getWodHodlLeaderboardUrl({ page = 1, limit = 10 } = {}) {
  return `${WOD_HODL_API_BASE}/leaderboard?page=${page}&limit=${limit}`;
}

export async function fetchWodHodlOverview(address) {
  return apiCall(getWodHodlOverviewUrl(address));
}

export async function fetchWodHodlLeaderboard({ page = 1, limit = 10 } = {}) {
  return apiCall(getWodHodlLeaderboardUrl({ page, limit }));
}

export async function fetchWodHodlSwapQuote({
  totalInvestment,
  sourceToken = "USDT",
}) {
  return apiCall(`${WOD_HODL_API_BASE}/swap/quote`, {
    method: "POST",
    body: JSON.stringify({
      totalInvestment: Number(totalInvestment),
      sourceToken: String(sourceToken || "USDT").toUpperCase(),
    }),
  });
}

export function toFiniteNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function formatUsd(value, { compact = false } = {}) {
  const n = toFiniteNumber(value, NaN);
  if (!Number.isFinite(n)) return "—";
  if (compact) {
    return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  return `$${n.toLocaleString(undefined, {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatGems(value) {
  const n = toFiniteNumber(value, NaN);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export function formatMultiplier(value) {
  const n = toFiniteNumber(value, NaN);
  if (!Number.isFinite(n)) return "—";
  const text = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
  return `${text}x`;
}

export function formatTierRange(tier) {
  if (!tier) return "";
  const min = toFiniteNumber(tier.minUsd, 0);
  if (tier.maxUsd == null || tier.maxUsd === "") {
    return `${formatUsd(min, { compact: true })}+`;
  }
  const maxDisplay = Math.floor(toFiniteNumber(tier.maxUsd, 0));
  return `${formatUsd(min, { compact: true })} - ${formatUsd(maxDisplay, { compact: true })}`;
}

export function getTierStyle(tierLabel) {
  switch (String(tierLabel || "").toLowerCase()) {
    case "starter":
      return {
        chip: "text-gray-700 bg-gray-100",
        card: "from-gray-50 to-gray-100 border-gray-200",
        text: "text-gray-700",
      };
    case "explorer":
      return {
        chip: "text-green-700 bg-green-100",
        card: "from-green-50 to-emerald-100 border-green-200",
        text: "text-green-700",
      };
    case "elite":
      return {
        chip: "text-purple-700 bg-purple-100",
        card: "from-purple-50 to-pink-100 border-purple-200",
        text: "text-purple-700",
      };
    default:
      return {
        chip: "text-gray-700 bg-gray-100",
        card: "from-gray-50 to-gray-100 border-gray-200",
        text: "text-gray-700",
      };
  }
}

export function getMultiplierColor(multiplier) {
  const n = toFiniteNumber(multiplier, NaN);
  if (!Number.isFinite(n) || n <= 0) return "text-gray-400";
  if (n <= 1) return "text-gray-600";
  if (n < 1.5) return "text-blue-600";
  if (n < 2) return "text-green-600";
  return "text-purple-600";
}

/** Prefer next checkpoint countdown; fall back to final snapshot seconds. */
export function getSecondsToNextSnapshot(campaign) {
  const next = campaign?.secondsToNextSnapshot;
  if (next != null && Number.isFinite(Number(next))) {
    return Math.max(0, Math.floor(Number(next)));
  }
  const finalSecs = campaign?.secondsToSnapshot;
  if (finalSecs != null && Number.isFinite(Number(finalSecs))) {
    return Math.max(0, Math.floor(Number(finalSecs)));
  }
  return null;
}

export function getNextSnapshotDay(campaign) {
  const day = Number(campaign?.nextSnapshotDay);
  if (Number.isFinite(day) && day > 0) return day;
  const snapshots = Array.isArray(campaign?.snapshots) ? campaign.snapshots : [];
  const upcoming = snapshots.find((s) => !s?.passed);
  const upcomingDay = Number(upcoming?.day);
  if (Number.isFinite(upcomingDay) && upcomingDay > 0) return upcomingDay;
  return null;
}

export function getCampaignSnapshots(campaign) {
  return Array.isArray(campaign?.snapshots) ? campaign.snapshots : [];
}

/** currentMultiplier 0 = under min hold days; show em dash instead of 0x. */
export function formatCurrentMultiplierDisplay(value) {
  const n = toFiniteNumber(value, NaN);
  if (!Number.isFinite(n) || n <= 0) return "1.0x";
  return formatMultiplier(n);
}

/**
 * Prefer API currentMultiplier. Soft-fallback when field is missing:
 * under minHoldDays → 0, else holdMultiplier.
 */
export function resolveCurrentMultiplier(row, minHoldDays = 3) {
  if (row == null) return NaN;
  if (row.currentMultiplier != null && row.currentMultiplier !== "") {
    return toFiniteNumber(row.currentMultiplier, NaN);
  }
  const days = toFiniteNumber(row.holdingDays, NaN);
  if (Number.isFinite(days) && days < minHoldDays) return 0;
  return toFiniteNumber(row.holdMultiplier, NaN);
}

/** Build display bands from holdMultipliers + minHoldDays. */
export function buildHoldMultiplierBands(campaign) {
  const minHoldDays = toFiniteNumber(campaign?.minHoldDays, 3);
  const rows = Array.isArray(campaign?.holdMultipliers)
    ? [...campaign.holdMultipliers]
        .map((row) => ({
          minDays: toFiniteNumber(row?.minDays, 0),
          multiplier: toFiniteNumber(row?.multiplier, 0),
        }))
        .sort((a, b) => a.minDays - b.minDays)
    : [];

  const bands = [
    {
      time: `<${minHoldDays} days`,
      multiplier: "No reward",
      color: "text-red-600",
      value: 0,
    },
  ];

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const next = rows[i + 1];
    const time =
      next != null
        ? `${row.minDays}–${next.minDays - 1} days`
        : `${row.minDays}+ days`;
    bands.push({
      time,
      multiplier: formatMultiplier(row.multiplier),
      color: getMultiplierColor(row.multiplier),
      value: row.multiplier,
    });
  }

  return bands;
}

export function buildLeaderboardBonusRows(campaign) {
  const bonuses = Array.isArray(campaign?.leaderboardBonuses)
    ? [...campaign.leaderboardBonuses].sort(
        (a, b) => toFiniteNumber(a?.maxRank) - toFiniteNumber(b?.maxRank),
      )
    : [];

  let prevMax = 0;
  return bonuses.map((row) => {
    const maxRank = toFiniteNumber(row?.maxRank, 0);
    const gems = toFiniteNumber(row?.gems, 0);
    const start = prevMax + 1;
    const rank =
      start === 1 ? `Top 1-${maxRank}` : `${start}-${maxRank}`;
    prevMax = maxRank;
    return {
      rank,
      gems,
      bonus: `+${gems} Gems`,
      usd: gems * toFiniteNumber(campaign?.gemUsdValue, 5),
      color:
        start === 1
          ? "text-yellow-600"
          : maxRank <= 50
            ? "text-gray-600"
            : "text-orange-600",
    };
  });
}

export function earlyBonusPercent(earlyBonus) {
  const multiplier = toFiniteNumber(earlyBonus?.multiplier, 1);
  return Math.round((multiplier - 1) * 100);
}

export function formatCampaignDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function secondsToParts(totalSeconds) {
  const safe = Math.max(0, Math.floor(toFiniteNumber(totalSeconds, 0)));
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return { days, hours, minutes, seconds, totalSeconds: safe };
}

/**
 * Parse swap/quote response into an execution payload for executePortfolioOnChain.
 * Echoes campaignSource: "WOD_HODL" into portfolioData for tagging.
 */
export function buildWodHodlExecutionFromQuote(response, {
  totalInvestment,
  sourceToken = "USDT",
} = {}) {
  const data = response?.data ?? response ?? {};
  const quote = data.quote ?? null;
  if (!quote) return null;

  const wodAddress =
    data.wodAddress ??
    quote?.positions?.[0]?.contractAddress ??
    null;
  const campaignSource =
    data.campaignSource ?? WOD_HODL_CAMPAIGN_SOURCE;
  const chain =
    quote?.chain || data.chain || WOD_HODL_CHAIN;
  const resolvedSource =
    data.sourceToken || quote?.sourceToken || sourceToken;
  const resolvedInvestment =
    toFiniteNumber(
      data.totalInvestment ??
        quote?.totalInvestment ??
        totalInvestment,
      NaN,
    );

  if (!Number.isFinite(resolvedInvestment) || resolvedInvestment <= 0) {
    return null;
  }

  const quotePositions = Array.isArray(quote.positions) ? quote.positions : [];
  const positions = quotePositions
    .filter((pos) => !pos?.error)
    .map((pos) => ({
      symbol: String(pos.symbol || "WOD").toUpperCase(),
      contractAddress: pos.contractAddress ?? wodAddress,
      allocationUsd: pos.allocationUsd ?? resolvedInvestment,
    }))
    .filter((pos) => pos.symbol);

  // Fallback: single 100% WOD position when quote has no positions yet
  if (positions.length === 0 && wodAddress) {
    positions.push({
      symbol: "WOD",
      contractAddress: wodAddress,
      allocationUsd: resolvedInvestment,
    });
  }

  if (positions.length === 0) return null;

  return {
    chain,
    sourceToken: resolvedSource,
    positions,
    portfolioData: {
      chain,
      sourceToken: resolvedSource,
      totalInvestment: resolvedInvestment,
      campaignSource,
    },
    quote,
    meta: {
      wodAddress,
      campaignSource,
      toTokenAmount: quotePositions[0]?.quote?.toTokenAmount ?? null,
      priceImpact: quotePositions[0]?.quote?.priceImpact ?? null,
    },
  };
}

export function extractWodExchangeRate(quote, sourceToken, totalInvestment) {
  const pos = Array.isArray(quote?.positions) ? quote.positions[0] : null;
  const toAmount = toFiniteNumber(pos?.quote?.toTokenAmount, NaN);
  const investment = toFiniteNumber(
    pos?.allocationUsd ?? quote?.totalInvestment ?? totalInvestment,
    NaN,
  );
  if (!Number.isFinite(toAmount) || !Number.isFinite(investment) || investment <= 0) {
    return null;
  }

  // For stablecoins, 1 USD ≈ 1 token; for BNB the quote still reports USD allocation.
  // Show WOD per 1 unit of source when we can; otherwise WOD per $1.
  const token = String(sourceToken || "").toUpperCase();
  if (token === "USDT" || token === "USDC") {
    return {
      label: `1 ${token} ≈ ${(toAmount / investment).toLocaleString(undefined, {
        maximumFractionDigits: 4,
      })} $WOD`,
      wodAmount: toAmount,
    };
  }

  return {
    label: `$1 ≈ ${(toAmount / investment).toLocaleString(undefined, {
      maximumFractionDigits: 4,
    })} $WOD`,
    wodAmount: toAmount,
  };
}

export function getRankStyle(rank) {
  if (rank === 1) {
    return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white";
  }
  if (rank === 2) {
    return "bg-gradient-to-br from-gray-300 to-gray-500 text-white";
  }
  if (rank === 3) {
    return "bg-gradient-to-br from-orange-400 to-orange-600 text-white";
  }
  return "bg-gray-100 text-gray-700";
}
