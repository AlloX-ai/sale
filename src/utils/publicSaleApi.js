import { apiCall } from "./api";

const WHITELIST_ENDPOINT = "/public-sale/whitelist";
const WHITELIST_CHAIN_QUERY = `${WHITELIST_ENDPOINT}`;
const WHITELIST_SONAR_CHAIN_QUERY = `${WHITELIST_ENDPOINT}/sonar`;

/** EVM chain id for the Sonar public sale (Ethereum mainnet). */
export const PUBLIC_SALE_CHAIN_ID = 1;
export const PUBLIC_SALE_CHAIN_NAME = "Ethereum";
export const PUBLIC_SALE_CHAIN_LOGO =
  "https://cdn.allox.ai/allox/networks/eth.svg";

const PUBLIC_SALE_CHAIN_ALIASES = new Set([
  "ethereum",
  "eth",
  "mainnet",
  "1",
  "0x1",
]);

export function isPublicSaleChainRow(row) {
  const chain = String(row?.chain ?? "")
    .trim()
    .toLowerCase();
  return PUBLIC_SALE_CHAIN_ALIASES.has(chain);
}

export function pickSaleChainBalanceBreakdown(breakdown) {
  if (!Array.isArray(breakdown)) return [];
  return breakdown.filter(isPublicSaleChainRow);
}

export function sumBalanceBreakdownUsd(breakdown) {
  return breakdown.reduce(
    (sum, row) => sum + (Number(row?.balanceUsd) || 0),
    0,
  );
}

/** Restrict whitelist balance fields to Ethereum (sale network). */
export function normalizePublicSaleWhitelistStatus(data) {
  if (!data || typeof data !== "object") return data;
  const saleChainBreakdown = pickSaleChainBalanceBreakdown(
    data.balanceBreakdown,
  );
  const hasBreakdown = Array.isArray(data.balanceBreakdown);
  return {
    ...data,
    balanceBreakdown: saleChainBreakdown,
    walletBalanceUsd: hasBreakdown
      ? sumBalanceBreakdownUsd(saleChainBreakdown)
      : data.walletBalanceUsd,
  };
}

/**
 * GET /public-sale/whitelist (auth required)
 * Returns { open, minUsd, maxUsd, walletBalanceUsd, balanceBreakdown,
 *           registered, registration, checkedAddress, balanceIncomplete }
 * registration includes sonarEntityId + sonarLinkedAt (null until linked).
 * checkedAddress is the wallet the backend actually read the balance for;
 *   compare it with the connected wallet — if they differ, the user is signed
 *   in as a different account than the one holding the funds.
 * balanceIncomplete is true when a chain read failed, so walletBalanceUsd is
 *   partial/unreliable and must not be shown as a real $0.
 */
export async function fetchPublicSaleWhitelistStatus() {
  const data = await apiCall(WHITELIST_CHAIN_QUERY);
  return normalizePublicSaleWhitelistStatus(data);
}

/**
 * POST /public-sale/whitelist — upsert (first registration and later changes).
 * The server re-verifies the wallet balance on-chain on every call.
 * Pass sonarEntityId when Sonar is already connected so it is linked in the
 * same request.
 *
 * Throws { status, message, data } via apiCall:
 *   422 → insufficient balance (message is user-facing; data carries
 *         walletBalanceUsd + balanceBreakdown)
 *   400 → amount outside min/max (data has minUsd/maxUsd) or invalid email
 *   503 → transient chain-read failure when data.retryable is true
 *   403 → registration closed
 */
export async function registerPublicSaleWhitelist({
  allocationUsd,
  email,
  sonarEntityId,
}) {
  const body = { allocationUsd };
  const trimmedEmail = typeof email === "string" ? email.trim() : "";
  if (trimmedEmail) body.email = trimmedEmail;
  if (sonarEntityId) body.sonarEntityId = sonarEntityId;

  return apiCall(WHITELIST_CHAIN_QUERY, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * POST /public-sale/whitelist/sonar — attach a Sonar entity to an existing
 * registration (users who registered before connecting Sonar). Does not touch
 * the allocation.
 *
 * Throws { status, message, data } via apiCall:
 *   404 → wallet has no registration yet
 */
export async function linkPublicSaleWhitelistSonar({ sonarEntityId }) {
  return apiCall(WHITELIST_SONAR_CHAIN_QUERY, {
    method: "POST",
    body: JSON.stringify({ sonarEntityId }),
  });
}

// ── Sale ────────────────────────────────────────────────────────────────────

/**
 * GET /public-sale (public)
 * Returns { window, chain, contract, tokens, minCommitUsd, maxCommitUsd,
 *           tiers[], raisedUsd, contributors, referralPct }
 */
export async function fetchPublicSale() {
  return apiCall("/public-sale");
}

/** GET /public-sale/stats (public) → { contributors, raisedUsd } */
export async function fetchPublicSaleStats() {
  return apiCall("/public-sale/stats");
}

/**
 * GET /public-sale/position (auth)
 * Returns my commitment (commitmentUsd), plan, allocation (allocationTokens,
 * availableAtTgeTokens, lockedTokens) and transactions[] (explorerUrl, status).
 */
export async function fetchPublicSalePosition() {
  return apiCall("/public-sale/position");
}

/**
 * POST /public-sale/commit (auth) — call right after the wallet confirms the
 * bid, so the backend can track the tx and attribute the referral.
 */
export async function submitPublicSaleCommit({ txHash, tierId, refCode }) {
  const body = { txHash, tierId };
  if (refCode) body.refCode = refCode;
  return apiCall("/public-sale/commit", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const parseFdvUsd = (fdv) => {
  if (typeof fdv === "number") return fdv;
  const match = String(fdv ?? "").match(/([\d.]+)\s*([kmb])?/i);
  if (!match) return 0;
  const mult = { k: 1e3, m: 1e6, b: 1e9 }[match[2]?.toLowerCase()] ?? 1;
  return Number(match[1]) * mult;
};

/** Map GET /public-sale tiers[] to the plan-card shape used by the page. */
export function mapPublicSaleTiersToPlans(tiers) {
  if (!Array.isArray(tiers)) return [];
  return tiers.map((tier) => {
    const id = String(tier.key || tier.label || tier.id).toLowerCase();
    return {
      id,
      tierId: tier.id,
      key: tier.key,
      name: tier.label || tier.key,
      discount: Number(tier.discountPct) || 0,
      fdv: parseFdvUsd(tier.fdv),
      price: Number(tier.priceUsd) || 0,
      tgePct: Number(tier.tgeUnlockPct) || 0,
      cliff: tier.lockPeriod || "None",
      vesting: tier.vesting || "No vesting",
      unlock: tier.unlock || "",
      raisedUsd: tier.raisedUsd,
      contributors: tier.contributors,
      premium: id === "platinum",
    };
  });
}

// ── Referral ────────────────────────────────────────────────────────────────

/**
 * GET /public-sale/referral (auth)
 * Returns { refCode, refLink, stats: { referrals, totalVolumeUsd, earnedUsd },
 *           referred[]: { wallet, investedUsd, commissionUsd, at },
 *           pendingRewardsUsd, claims[] }
 * refLink is a path — prepend the site origin.
 */
export async function fetchPublicSaleReferral() {
  return apiCall("/public-sale/referral");
}

/** POST /public-sale/referral/bind (auth) — visitor arrived with ?refCode= */
export async function bindPublicSaleReferral({ refCode }) {
  return apiCall("/public-sale/referral/bind", {
    method: "POST",
    body: JSON.stringify({ refCode }),
  });
}

/** POST /public-sale/referral/claim (auth) — request payout of pending rewards */
export async function claimPublicSaleReferral({ toAddress } = {}) {
  return apiCall("/public-sale/referral/claim", {
    method: "POST",
    body: JSON.stringify(toAddress ? { toAddress } : {}),
  });
}

const PUBLIC_SALE_REF_STORAGE_KEY = "allox_public_sale_ref";

/** Persist ?refCode= from the URL so it survives the login redirect. */
export function capturePublicSaleRefCode(href = window.location.href) {
  const code = new URL(href).searchParams.get("refCode")?.trim();
  if (!code) return null;
  try {
    localStorage.setItem(PUBLIC_SALE_REF_STORAGE_KEY, code);
  } catch {
    // ignore
  }
  return code;
}

export function getStoredPublicSaleRefCode() {
  try {
    return localStorage.getItem(PUBLIC_SALE_REF_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearStoredPublicSaleRefCode() {
  try {
    localStorage.removeItem(PUBLIC_SALE_REF_STORAGE_KEY);
  } catch {
    // ignore
  }
}
