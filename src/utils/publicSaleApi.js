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
