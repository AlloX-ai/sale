import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useSonarAuth } from "@echoxyz/sonar-react";
import { SONAR_OAUTH_RETURN_PATH_KEY } from "../config/sonar";

const OAUTH_CODE_HANDLED_KEY = "sonar:oauth:handled-code";

/**
 * OAuth redirect landing page for Sonar / Echo.
 * Must match the redirect URI configured in the Echo founder dashboard
 * (and VITE_SONAR_OAUTH_REDIRECT_URI) — typically /oauth/callback.
 */
export function SonarOAuthCallbackPage() {
  const { authenticated, completeOAuth, ready } = useSonarAuth();
  const oauthCompletionTriggered = useRef(false);
  const [oauthError, setOAuthError] = useState(null);
  const [timedOut, setTimedOut] = useState(false);
  const [status, setStatus] = useState("Connecting to Sonar…");

  useEffect(() => {
    const processOAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const oauthErrorParam = params.get("error");
      const errorDescription = params.get("error_description");

      if (oauthErrorParam) {
        setOAuthError(
          errorDescription
            ? `${oauthErrorParam}: ${errorDescription}`
            : `OAuth error: ${oauthErrorParam}`,
        );
        return;
      }

      if (!code || !state) {
        setOAuthError(
          "Missing authorization code. Start again from Connect with Sonar.",
        );
        return;
      }

      if (!ready) return;

      if (authenticated) {
        return;
      }

      // StrictMode / remounts: avoid exchanging the same one-time code twice
      const handledCode = sessionStorage.getItem(OAUTH_CODE_HANDLED_KEY);
      if (handledCode === code || oauthCompletionTriggered.current) {
        return;
      }
      oauthCompletionTriggered.current = true;
      sessionStorage.setItem(OAUTH_CODE_HANDLED_KEY, code);

      try {
        setStatus("Exchanging authorization code…");
        await completeOAuth({ code, state });
        setStatus("Connected. Redirecting…");
      } catch (err) {
        sessionStorage.removeItem(OAUTH_CODE_HANDLED_KEY);
        oauthCompletionTriggered.current = false;
        const message =
          err instanceof Error ? err.message : "OAuth failed";
        console.error("[Sonar OAuth] completeOAuth failed:", err);
        setOAuthError(message);
      }
    };

    processOAuthCallback();
  }, [authenticated, completeOAuth, ready]);

  useEffect(() => {
    if (!ready || !authenticated) return;

    const returnPathRaw =
      localStorage.getItem(SONAR_OAUTH_RETURN_PATH_KEY) || "/";
    localStorage.removeItem(SONAR_OAUTH_RETURN_PATH_KEY);
    sessionStorage.removeItem(OAUTH_CODE_HANDLED_KEY);

    // Never bounce back to the callback (or a URL still carrying oauth params)
    let returnPath = "/";
    try {
      const url = new URL(returnPathRaw, window.location.origin);
      if (
        url.pathname &&
        url.pathname !== "/oauth/callback" &&
        !url.searchParams.has("code")
      ) {
        returnPath = `${url.pathname}${url.search}${url.hash}`;
      }
    } catch {
      /* keep default */
    }

    window.location.replace(returnPath);
  }, [authenticated, ready]);

  useEffect(() => {
    setTimedOut(false);
    const timeoutId = setTimeout(() => setTimedOut(true), 20000);
    return () => clearTimeout(timeoutId);
  }, []);

  const goHome = () => {
    window.location.href = "/";
  };

  if (timedOut && !authenticated && !oauthError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-gray-900">
          Connection timed out
        </p>
        <p className="text-sm text-gray-600 max-w-md">
          Sonar authentication took too long. Check that{" "}
          <code className="text-xs bg-gray-100 px-1 rounded">
            VITE_SONAR_OAUTH_REDIRECT_URI
          </code>{" "}
          matches a redirect URI registered in the Echo founder dashboard
          (must end with <code className="text-xs bg-gray-100 px-1 rounded">/oauth/callback</code>).
        </p>
        <button
          type="button"
          onClick={goHome}
          className="mt-2 px-5 py-2.5 rounded-xl bg-black text-white font-semibold hover:bg-gray-800"
        >
          Back to sale
        </button>
      </div>
    );
  }

  if (oauthError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold text-red-700">
          Could not connect to Sonar
        </p>
        <p className="text-sm text-gray-600 max-w-md">{oauthError}</p>
        <p className="text-xs text-gray-500 max-w-md">
          Redirect URI must be exactly{" "}
          <code className="bg-gray-100 px-1 rounded">
            {window.location.origin}/oauth/callback
          </code>{" "}
          in both your .env and the Echo dashboard.
        </p>
        <button
          type="button"
          onClick={goHome}
          className="mt-2 px-5 py-2.5 rounded-xl bg-black text-white font-semibold hover:bg-gray-800"
        >
          Back to sale
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <p className="text-lg font-semibold text-gray-900">{status}</p>
      <p className="text-sm text-gray-500">
        Completing Echo authentication. You will be redirected shortly.
      </p>
    </div>
  );
}
