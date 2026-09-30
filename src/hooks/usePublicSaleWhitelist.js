import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import {
  fetchPublicSaleWhitelistStatus,
  linkPublicSaleWhitelistSonar,
  normalizePublicSaleWhitelistStatus,
  registerPublicSaleWhitelist,
} from "../utils/publicSaleApi";

// 503 + retryable: true means a transient chain-read failure on the backend;
// per API contract we retry silently after ~3s instead of surfacing an error.
const TRANSIENT_RETRY_DELAY_MS = 3000;
const MAX_TRANSIENT_RETRIES = 3;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function usePublicSaleWhitelist() {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    let token = null;
    try {
      token = localStorage.getItem("authToken");
    } catch {
      token = null;
    }
    if (!token) return null;

    setStatusLoading(true);
    try {
      const data = await fetchPublicSaleWhitelistStatus();
      if (mountedRef.current) {
        setStatus(data);
        setStatusError(null);
      }
      return data;
    } catch (err) {
      if (mountedRef.current && err?.status !== 401) {
        setStatusError(err?.message || "Failed to load whitelist status");
      }
      return null;
    } finally {
      if (mountedRef.current) setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setStatus(null);
    }
  }, [isAuthenticated, refresh]);

  const submit = useCallback(async ({ allocationUsd, email, sonarEntityId }) => {
    setSubmitting(true);
    setRetrying(false);
    try {
      let attempt = 0;
      for (;;) {
        try {
          const data = await registerPublicSaleWhitelist({
            allocationUsd,
            email,
            sonarEntityId,
          });
          if (mountedRef.current && data?.registration) {
            setStatus((prev) => ({
              ...(prev ?? {}),
              registered: true,
              registration: data.registration,
            }));
          }
          return data;
        } catch (err) {
          const isTransient =
            err?.status === 503 && err?.data?.retryable === true;
          if (isTransient && attempt < MAX_TRANSIENT_RETRIES) {
            attempt += 1;
            if (mountedRef.current) setRetrying(true);
            await sleep(TRANSIENT_RETRY_DELAY_MS);
            continue;
          }

          if (mountedRef.current) {
            // 422 (insufficient balance) and 400 (min/max) payloads carry
            // fresh server-side numbers — fold them into status so the UI
            // renders against what the backend actually verified.
            if (err?.status === 422 && err?.data) {
              const normalized = normalizePublicSaleWhitelistStatus(err.data);
              setStatus((prev) => ({
                ...(prev ?? {}),
                ...(normalized.walletBalanceUsd != null
                  ? { walletBalanceUsd: normalized.walletBalanceUsd }
                  : {}),
                ...(Array.isArray(normalized.balanceBreakdown)
                  ? { balanceBreakdown: normalized.balanceBreakdown }
                  : {}),
              }));
            }
            if (err?.status === 400 && err?.data) {
              const { minUsd, maxUsd } = err.data;
              setStatus((prev) => ({
                ...(prev ?? {}),
                ...(minUsd != null ? { minUsd } : {}),
                ...(maxUsd != null ? { maxUsd } : {}),
              }));
            }
            if (err?.status === 403) {
              setStatus((prev) => (prev ? { ...prev, open: false } : prev));
            }
          }
          throw err;
        }
      }
    } finally {
      if (mountedRef.current) {
        setSubmitting(false);
        setRetrying(false);
      }
    }
  }, []);

  // Link a Sonar entity to an existing registration (does not change the
  // allocation). 404 means the wallet has no registration yet.
  const linkSonar = useCallback(async (sonarEntityId) => {
    const data = await linkPublicSaleWhitelistSonar({ sonarEntityId });
    if (mountedRef.current) {
      setStatus((prev) =>
        prev?.registration
          ? {
              ...prev,
              registration: data?.registration ?? {
                ...prev.registration,
                sonarEntityId,
              },
            }
          : prev,
      );
    }
    return data;
  }, []);

  return {
    status,
    statusLoading,
    statusError,
    refresh,
    submit,
    linkSonar,
    submitting,
    retrying,
  };
}
