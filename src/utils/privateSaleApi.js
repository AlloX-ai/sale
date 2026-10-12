import { apiCall } from "./api";

const BASE = "/private-sale";

/** GET /private-sale/ — public sale page data */
export async function fetchPrivateSaleData() {
  return apiCall(`${BASE}/`);
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
