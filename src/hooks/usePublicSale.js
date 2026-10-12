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
  submitPublicSaleReferralLead,
  validatePublicSaleRefCode,
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
  // ?refCode= the visitor landed with (or kept from before the login redirect).
  const [landingRefCode] = useState(
    () => capturePublicSaleRefCode() ?? getStoredPublicSaleRefCode(),
  );
  const [landingRefValid, setLandingRefValid] = useState(false);
  // Rejected bind: { reason, message }. reason is SELF_REFERRAL,
  // ALREADY_INVESTED, BOUND_TO_ANOTHER_CODE or UNKNOWN_CODE.
  const [bindError, setBindError] = useState(null);
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

  // Only show the landing code (and offer it to the lead form) when it exists.
  useEffect(() => {
    if (!landingRefCode) return;
    let cancelled = false;
    validatePublicSaleRefCode(landingRefCode)
      .then((data) => {
        if (!cancelled) setLandingRefValid(data?.valid === true);
      })
      .catch((err) => {
        console.error("Failed to validate referral code:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [landingRefCode]);

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
          if (mountedRef.current) setBindError(null);
          // referredByCode on the position changes with the bind.
          loadPosition();
        } catch (err) {
          // 4xx = invalid, own code, or already bound: retrying won't help.
          if (err?.status >= 400 && err?.status < 500) {
            clearStoredPublicSaleRefCode();
            if (mountedRef.current) {
              setBindError({
                reason: err.data?.reason ?? null,
                message: err.message,
              });
            }
          } else {
            console.error("Failed to bind referral code:", err);
          }
        }
      }
      loadReferral();
    })();
  }, [enabled, isAuthenticated, loadPosition, loadReferral]);

  // The landing code goes along with a commit made straight away, unless the
  // backend already refused to bind it.
  const commitRefCode = landingRefValid && !bindError ? landingRefCode : null;

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
          refCode: commitRefCode ?? undefined,
        });
      } catch (err) {
        console.error("Failed to record public sale commit:", err);
      }
      loadPosition();
      loadStats();
      loadReferral();
    },
    [commitRefCode, loadPosition, loadStats, loadReferral],
  );

  /** "Join the Sale" form; no login needed. Throws apiCall errors. */
  const submitReferralLead = useCallback(
    async ({ refCode, address, amountUsd, email }) => {
      const data = await submitPublicSaleReferralLead({
        refCode,
        address,
        amountUsd,
        email,
      });
      if (isAuthenticated) loadReferral();
      return data;
    },
    [isAuthenticated, loadReferral],
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

  // refLink is an absolute URL: shown and copied as is.
  const referralLink = (isAuthenticated && referral?.refLink) || null;

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
    landingRefCode: landingRefValid ? landingRefCode : null,
    bindError: isAuthenticated ? bindError : null,
    recordCommit,
    claimReferralRewards,
    submitReferralLead,
    refreshPosition: loadPosition,
    refreshReferral: loadReferral,
  };
}
