import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import {
  bindPublicSaleReferral,
  capturePublicSaleRefCode,
  claimPublicSaleReferral,
  clearStoredPublicSaleRefCode,
  fetchPublicSale,
  fetchPublicSalePosition,
  fetchPublicSaleReferral,
  fetchPublicSaleStats,
  getStoredPublicSaleRefCode,
  mapPublicSaleTiersToPlans,
  submitPublicSaleCommit,
} from "../utils/publicSaleApi";

const STATS_POLL_MS = 30_000;

/**
 * Public sale backend data: plans/config, live stats, the user's position and
 * the referral program. Public endpoints load for everyone; position and
 * referral load once the user is signed in.
 */
export function usePublicSale({ enabled = true } = {}) {
  const { isAuthenticated } = useAuth();
  const [sale, setSale] = useState(null);
  const [stats, setStats] = useState(null);
  const [position, setPosition] = useState(null);
  const [positionLoading, setPositionLoading] = useState(false);
  const [referral, setReferral] = useState(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const mountedRef = useRef(true);
  const bindAttemptRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadSale = useCallback(async () => {
    try {
      const data = await fetchPublicSale();
      if (mountedRef.current) setSale(data);
    } catch (err) {
      console.error("Failed to load public sale:", err);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchPublicSaleStats();
      if (mountedRef.current) setStats(data);
    } catch (err) {
      console.error("Failed to load public sale stats:", err);
    }
  }, []);

  const loadPosition = useCallback(async () => {
    setPositionLoading(true);
    try {
      const data = await fetchPublicSalePosition();
      if (mountedRef.current) setPosition(data);
      return data;
    } catch (err) {
      if (err?.status !== 401) {
        console.error("Failed to load public sale position:", err);
      }
      return null;
    } finally {
      if (mountedRef.current) setPositionLoading(false);
    }
  }, []);

  const loadReferral = useCallback(async () => {
    setReferralLoading(true);
    try {
      const data = await fetchPublicSaleReferral();
      if (mountedRef.current) setReferral(data);
      return data;
    } catch (err) {
      if (err?.status !== 401) {
        console.error("Failed to load public sale referral:", err);
      }
      return null;
    } finally {
      if (mountedRef.current) setReferralLoading(false);
    }
  }, []);

  // Capture ?refCode= on landing so it can be bound after login.
  useEffect(() => {
    capturePublicSaleRefCode();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    loadSale();
    loadStats();
    const id = setInterval(loadStats, STATS_POLL_MS);
    return () => clearInterval(id);
  }, [enabled, loadSale, loadStats]);

  useEffect(() => {
    if (!enabled || !isAuthenticated) return;
    loadPosition();

    // Bind an incoming ?refCode= once per code, then load the referral data
    // (the bind can change who referred us but not our own stats).
    (async () => {
      const code = getStoredPublicSaleRefCode();
      if (code && bindAttemptRef.current !== code) {
        bindAttemptRef.current = code;
        try {
          await bindPublicSaleReferral({ refCode: code });
          clearStoredPublicSaleRefCode();
        } catch (err) {
          // 4xx = invalid, own code, or already bound: retrying won't help.
          if (err?.status >= 400 && err?.status < 500) {
            clearStoredPublicSaleRefCode();
          } else {
            console.error("Failed to bind referral code:", err);
          }
        }
      }
      loadReferral();
    })();
  }, [enabled, isAuthenticated, loadPosition, loadReferral]);

  /**
   * Report a bid to the backend right after the wallet confirms it. Failures
   * are logged, not thrown: the on-chain bid already went through.
   */
  const recordCommit = useCallback(
    async ({ txHash, tierId }) => {
      try {
        await submitPublicSaleCommit({
          txHash,
          tierId,
          refCode: getStoredPublicSaleRefCode() ?? undefined,
        });
      } catch (err) {
        console.error("Failed to record public sale commit:", err);
      }
      loadPosition();
      loadStats();
    },
    [loadPosition, loadStats],
  );

  const claimReferralRewards = useCallback(
    async ({ toAddress } = {}) => {
      setClaiming(true);
      try {
        const data = await claimPublicSaleReferral({ toAddress });
        await loadReferral();
        return data;
      } finally {
        if (mountedRef.current) setClaiming(false);
      }
    },
    [loadReferral],
  );

  const plans = useMemo(
    () => mapPublicSaleTiersToPlans(sale?.tiers),
    [sale?.tiers],
  );

  // refLink is a path; the site origin is prepended here.
  const rawRefLink = (isAuthenticated && referral?.refLink) || "";
  const referralLink = !rawRefLink
    ? null
    : /^https?:\/\//i.test(rawRefLink)
      ? rawRefLink
      : `${window.location.origin}${rawRefLink.startsWith("/") ? "" : "/"}${rawRefLink}`;

  return {
    sale,
    plans,
    stats,
    // Signed-out users never see a previous session's data.
    position: isAuthenticated ? position : null,
    positionLoading,
    referral: isAuthenticated ? referral : null,
    referralLoading,
    referralLink,
    claiming,
    recordCommit,
    claimReferralRewards,
    refreshPosition: loadPosition,
    refreshReferral: loadReferral,
  };
}
