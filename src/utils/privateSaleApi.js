import { apiCall } from "./api";

const BASE = "/private-sale";

/** GET /private-sale/ — public sale page data */
export async function fetchPrivateSaleData() {
  return apiCall(`${BASE}/`);
}

/** GET /private-sale/eligibility — JWT required */
export async function fetchPrivateSaleEligibility() {
  return apiCall(`${BASE}/eligibility`);
}

/**
 * `waiting` = not submitted yet — no history row, safe to retry.
 * Strip those rows and don't count them toward pending.
 */
export function normalizePrivateSalePosition(data) {
  if (!data || typeof data !== "object") return data;
  const raw = Array.isArray(data.contributions) ? data.contributions : [];
  const isWaiting = (status) =>
    String(status || "").toLowerCase() === "waiting";
  const waitingCount = raw.filter((c) => isWaiting(c?.status)).length;
  const contributions = raw.filter((c) => !isWaiting(c?.status));
  const apiPending = Number(data.pendingCount);
  const pendingCount = Number.isFinite(apiPending)
    ? Math.max(0, apiPending - waitingCount)
    : contributions.filter(
        (c) => String(c?.status || "").toLowerCase() === "pending",
      ).length;
  return { ...data, contributions, pendingCount };
}

/** GET /private-sale/position — JWT required */
export async function fetchPrivateSalePosition() {
  const data = await apiCall(`${BASE}/position`);
  return normalizePrivateSalePosition(data);
}

/**
 * POST /private-sale/contribute — JWT required
 * @param {{ txHash: string, chain: string, tierId?: number }} payload
 */
export async function submitPrivateSaleContribution(payload) {
  return apiCall(`${BASE}/contribute`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** GET /private-sale/loyalty/status/:address — no signature required */
export async function fetchLoyaltyStatus(address) {
  const addr = encodeURIComponent(String(address || "").trim());
  if (!addr) throw new Error("Wallet address is required.");
  return apiCall(`${BASE}/loyalty/status/${addr}`);
}

/** Loyalty apply/status or eligibility payload that grants private-sale access. */
export function isApprovedForPrivateSale(record) {
  if (!record || typeof record !== "object") return false;
  const status = String(record.status || "").toLowerCase();
  return (
    record.eligible === true ||
    record.whitelisted === true ||
    status === "approved"
  );
}

/**
 * Combine JWT eligibility with public loyalty status.
 * Loyalty auto-approve (`whitelisted` / `status: approved`) must unlock the sale
 * even if `/eligibility` still reports the pre-loyalty checklist.
 */
export async function resolvePrivateSaleAccess({
  address,
  isAuthenticated = false,
} = {}) {
  const [eligibility, loyaltyStatus] = await Promise.all([
    isAuthenticated
      ? fetchPrivateSaleEligibility().catch(() => null)
      : Promise.resolve(null),
    address
      ? fetchLoyaltyStatus(address).catch(() => null)
      : Promise.resolve(null),
  ]);

  const approved =
    isApprovedForPrivateSale(eligibility) ||
    isApprovedForPrivateSale(loyaltyStatus);

  return {
    eligibility,
    loyaltyStatus,
    approved,
    mergedEligibility: approved
      ? {
          ...(eligibility || {}),
          ...(loyaltyStatus || {}),
          eligible: true,
          whitelisted:
            eligibility?.whitelisted === true ||
            loyaltyStatus?.whitelisted === true ||
            true,
        }
      : eligibility,
  };
}

/** GET /private-sale/loyalty/nonce/:address → { nonce, message } */
export async function fetchLoyaltyNonce(address) {
  const addr = encodeURIComponent(String(address || "").trim());
  if (!addr) throw new Error("Wallet address is required.");
  return apiCall(`${BASE}/loyalty/nonce/${addr}`);
}

/**
 * POST /private-sale/loyalty/apply { address, signature, nonce }
 * → { status, whitelisted, eligible, liveBalanceUsd? }
 * Auto-approved (eligible: true) if whitelisted OR liveBalanceUsd >= 20.
 * Otherwise status: "applied" (pending manual review).
 * Balance lookup can take ~1–2s — show a checking state on the FE.
 * `nonce` must match the value from GET /loyalty/nonce/:address.
 */
export async function submitLoyaltyApply({ address, signature, nonce }) {
  const walletAddress = String(address || "").trim();
  const sig = String(signature || "").trim();
  const nonceValue = String(nonce || "").trim();
  if (!walletAddress) throw new Error("Wallet address is required.");
  if (!sig) throw new Error("Signature is required to verify ownership.");
  if (!nonceValue) throw new Error("Nonce is required. Please try again.");

  return apiCall(`${BASE}/loyalty/apply`, {
    method: "POST",
    body: JSON.stringify({
      address: walletAddress,
      signature: sig,
      nonce: nonceValue,
    }),
  });
}
