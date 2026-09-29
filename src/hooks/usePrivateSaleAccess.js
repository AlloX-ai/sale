import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useSelector } from "react-redux";
import { resolvePrivateSaleAccess } from "../utils/privateSaleApi";
import { useAuth } from "./useAuth";

export const ALLOX_PRIVATE_SALE_PATH = "/private-sale";
export const ALLOX_LOYALTY_CHECK_PATH = "/loyalty-check";

const listeners = new Set();
let snapshot = {
  eligibility: null,
  loading: false,
  fetched: false,
};
let lastFetchKey = "";
let fetchGeneration = 0;

function emit() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(partial) {
  snapshot = { ...snapshot, ...partial };
  emit();
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function accessKey({ isConnected, isAuthenticated, walletAddress }) {
  return `${Boolean(isConnected)}|${Boolean(isAuthenticated)}|${String(walletAddress || "").toLowerCase()}`;
}

async function fetchSharedAccess({
  isConnected,
  isAuthenticated,
  walletAddress,
  force = false,
}) {
  const key = accessKey({ isConnected, isAuthenticated, walletAddress });
  if (!force && key === lastFetchKey && snapshot.fetched && !snapshot.loading) {
    return snapshot.eligibility;
  }

  lastFetchKey = key;
  const generation = ++fetchGeneration;

  if (!isConnected) {
    setSnapshot({ eligibility: null, loading: false, fetched: true });
    return null;
  }

  setSnapshot({ loading: true, fetched: false });
  try {
    const data = await resolvePrivateSaleAccess({
      address: walletAddress,
      isAuthenticated,
    });
    if (generation !== fetchGeneration) return snapshot.eligibility;
    setSnapshot({
      eligibility: data.mergedEligibility,
      loading: false,
      fetched: true,
    });
    return data.mergedEligibility;
  } catch {
    if (generation !== fetchGeneration) return snapshot.eligibility;
    setSnapshot({ eligibility: null, loading: false, fetched: true });
    return null;
  }
}

/**
 * Private sale surface access:
 * - disconnected → neither Private Sale nor Loyalty Check
 * - connected → GET /private-sale/eligibility (JWT) + loyalty/status/:address
 *   - eligible, whitelisted, or status approved → Private Sale
 *   - otherwise → Loyalty Check
 *
 * Shared across Header, Sidebar, and route guards so approval updates everywhere.
 */
export function usePrivateSaleAccess() {
  const isConnected = useSelector((state) => state.wallet.isConnected);
  const walletAddress = useSelector((state) => state.wallet.address);
  const { isAuthenticated } = useAuth();
  const { eligibility, loading, fetched } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getSnapshot,
  );

  const refresh = useCallback(
    () =>
      fetchSharedAccess({
        isConnected,
        isAuthenticated,
        walletAddress,
        force: true,
      }),
    [isConnected, isAuthenticated, walletAddress],
  );

  useEffect(() => {
    fetchSharedAccess({ isConnected, isAuthenticated, walletAddress });
  }, [isConnected, isAuthenticated, walletAddress]);

  const isWhitelisted = eligibility?.eligible === true;
  const canAccess = Boolean(isConnected && isWhitelisted);
  const accessResolved = isConnected ? fetched : true;
  const showLoyaltyCheck = Boolean(isConnected && accessResolved && !canAccess);

  return {
    canAccess,
    showLoyaltyCheck,
    accessResolved,
    loading,
    isConnected,
    isAuthenticated,
    isWhitelisted,
    eligibility,
    refresh,
  };
}