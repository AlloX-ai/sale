import { apiCall } from "./api";

const WHITELIST_ENDPOINT = "/public-sale/whitelist";

/**
 * GET /public-sale/whitelist (auth required)
 * Returns { open, minUsd, maxUsd, walletBalanceUsd, balanceBreakdown,
 *           registered, registration }
 */
export async function fetchPublicSaleWhitelistStatus() {
  return apiCall(WHITELIST_ENDPOINT);
}

/**
 * POST /public-sale/whitelist — upsert (first registration and later changes).
 * The server re-verifies the wallet balance on-chain on every call.
 *
 * Throws { status, message, data } via apiCall:
 *   422 → insufficient balance (message is user-facing; data carries
 *         walletBalanceUsd + balanceBreakdown)
 *   400 → amount outside min/max (data has minUsd/maxUsd) or invalid email
 *   503 → transient chain-read failure when data.retryable is true
 *   403 → registration closed
 */
export async function registerPublicSaleWhitelist({ allocationUsd, email }) {
  const body = { allocationUsd };
  const trimmedEmail = typeof email === "string" ? email.trim() : "";
  if (trimmedEmail) body.email = trimmedEmail;

  return apiCall(WHITELIST_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
