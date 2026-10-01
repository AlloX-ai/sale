import { apiCall } from "./api";

const WHITELIST_ENDPOINT = "/public-sale/whitelist";
const WHITELIST_CHAIN_QUERY = `${WHITELIST_ENDPOINT}`;
const WHITELIST_SONAR_CHAIN_QUERY = `${WHITELIST_ENDPOINT}/sonar`;

/** EVM chain id for the Sonar public sale (Base mainnet). */
export const PUBLIC_SALE_CHAIN_ID = 8453;

export function isPublicSaleBaseChainRow(row) {
  const chain = String(row?.chain ?? "")
    .trim()
    .toLowerCase();
  if (chain === "base") return true;
  if (chain === "8453" || chain === "0x2105") return true;
  return false;
}

export function pickBaseBalanceBreakdown(breakdown) {
  if (!Array.isArray(breakdown)) return [];
  return breakdown.filter(isPublicSaleBaseChainRow);
}

export function sumBalanceBreakdownUsd(breakdown) {
  return breakdown.reduce(
    (sum, row) => sum + (Number(row?.balanceUsd) || 0),
    0,
  );
}

/** Restrict whitelist balance fields to Base (sale network). */
export function normalizePublicSaleWhitelistStatus(data) {
  if (!data || typeof data !== "object") return data;
  const baseBreakdown = pickBaseBalanceBreakdown(data.balanceBreakdown);
  const hasBreakdown = Array.isArray(data.balanceBreakdown);
  return {
    ...data,
    balanceBreakdown: baseBreakdown,
    walletBalanceUsd: hasBreakdown
      ? sumBalanceBreakdownUsd(baseBreakdown)
      : data.walletBalanceUsd,
  };
}

/**
 * GET /public-sale/whitelist (auth required)
 * Returns { open, minUsd, maxUsd, walletBalanceUsd, balanceBreakdown,
 *           registered, registration }
 * registration includes sonarEntityId + sonarLinkedAt (null until linked).
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
