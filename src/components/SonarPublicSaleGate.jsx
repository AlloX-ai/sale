import { useState } from "react";
import {
  ExternalLink,
  Loader2,
  Shield,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import {
  EntitySetupState,
  SaleEligibility,
} from "@echoxyz/sonar-core";
import { useSonarAuth, useSonarEntities } from "@echoxyz/sonar-react";
import {
  getSonarHomeUrl,
  isSonarConfigured,
  sonarSaleUUID,
  SONAR_OAUTH_RETURN_PATH_KEY,
} from "../config/sonar";

export function describeSonarEntity(entity) {
  if (!entity) {
    return {
      tone: "amber",
      title: "No Sonar entity found",
      detail:
        "Create or finish entity setup on Sonar with a wallet that matches the one connected here.",
      eligible: false,
      needsSetup: true,
    };
  }

  const setup = entity.EntitySetupState;
  const eligibility = entity.SaleEligibility;

  if (
    setup === EntitySetupState.NOT_STARTED ||
    setup === EntitySetupState.IN_PROGRESS ||
    setup === EntitySetupState.READY_FOR_REVIEW
  ) {
    return {
      tone: "amber",
      title: "Complete Sonar verification",
      detail:
        "Finish identity and eligibility checks on Sonar before you can join this sale.",
      eligible: false,
      needsSetup: true,
    };
  }

  if (setup === EntitySetupState.IN_REVIEW) {
    return {
      tone: "gray",
      title: "Verification under review",
      detail:
        "Sonar is reviewing your entity. Check back once approval completes.",
      eligible: false,
    };
  }

  if (
    setup === EntitySetupState.FAILURE ||
    setup === EntitySetupState.TECHNICAL_ISSUE
  ) {
    return {
      tone: "amber",
      title: "Action needed on Sonar",
      detail:
        "There is an issue with your entity setup that must be resolved on Sonar.",
      eligible: false,
      needsSetup: true,
    };
  }

  if (setup === EntitySetupState.FAILURE_FINAL) {
    return {
      tone: "red",
      title: "Not eligible",
      detail: "This Sonar entity is not eligible to invest in this sale.",
      eligible: false,
    };
  }

  if (setup === EntitySetupState.COMPLETE) {
    if (eligibility === SaleEligibility.ELIGIBLE) {
      return {
        tone: "green",
        title: "Eligible to participate",
        detail:
          "Your Sonar verification is complete. You can invest or whitelist.",
        eligible: true,
      };
    }
    return {
      tone: "red",
      title: "Not currently eligible",
      detail:
        "Entity setup is complete, but this sale is not available to your entity yet.",
      eligible: false,
    };
  }

  return {
    tone: "gray",
    title: "Unknown status",
    detail: "Could not interpret Sonar entity status.",
    eligible: false,
  };
}

const TONE_STYLES = {
  green: {
    box: "border-emerald-200 bg-emerald-50/90",
    icon: "text-emerald-600",
    title: "text-emerald-950",
  },
  amber: {
    box: "border-amber-200 bg-amber-50/90",
    icon: "text-amber-600",
    title: "text-amber-950",
  },
  red: {
    box: "border-red-200 bg-red-50/90",
    icon: "text-red-600",
    title: "text-red-950",
  },
  gray: {
    box: "border-gray-200 bg-gray-50/90",
    icon: "text-gray-500",
    title: "text-gray-900",
  },
};

/** Hook for public-sale Sonar OAuth + entity status. */
export function useSonarPublicSaleAccess(walletAddress) {
  const { ready, authenticated, login, logout } = useSonarAuth();
  const {
    loading: entitiesLoading,
    entities,
    error: entitiesError,
  } = useSonarEntities({
    saleUUID: sonarSaleUUID || "00000000-0000-0000-0000-000000000000",
    walletAddress: walletAddress || undefined,
  });

  const primaryEntity = entities?.[0] ?? null;
  const status = authenticated ? describeSonarEntity(primaryEntity) : null;

  const connectSonar = () => {
    // Pathname only — never store leftover ?code=&state= or we can loop
    const returnPath = window.location.pathname || "/sonar-public-sale";
    localStorage.setItem(SONAR_OAUTH_RETURN_PATH_KEY, returnPath);
    return login();
  };

  return {
    configured: isSonarConfigured,
    ready,
    authenticated,
    connectSonar,
    logout,
    entitiesLoading: authenticated && entitiesLoading,
    entities,
    entitiesError,
    primaryEntity,
    status,
    canViewSaleUi: Boolean(authenticated),
  };
}

export function SonarNotConfiguredNotice() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="font-bold text-gray-900 mb-1">
            Sonar is not configured
          </h5>
          <p className="text-sm text-gray-600">
            Set{" "}
            <code className="text-xs bg-white/80 px-1 rounded">
              VITE_SONAR_SALE_UUID
            </code>{" "}
            and{" "}
            <code className="text-xs bg-white/80 px-1 rounded">
              VITE_SONAR_OAUTH_CLIENT_UUID
            </code>{" "}
            from the Echo founder dashboard, then restart the app.
          </p>
        </div>
      </div>
    </div>
  );
}

export function SonarConnectPrompt({ onConnect }) {
  return (
    <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/90 to-white p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100/80 text-indigo-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-3">
            <Shield className="w-3.5 h-3.5" />
            Powered by Sonar
          </div>
          <h5 className="text-lg font-bold text-gray-900 mb-1">
            Connect with Sonar
          </h5>
          <p className="text-sm text-gray-600 max-w-xl">
            Your wallet is connected. Next, sign in with Sonar (Echo) to complete
            identity verification and unlock public sale participation details.
          </p>
        </div>
        <button
          type="button"
          onClick={onConnect}
          className="shrink-0 inline-flex items-center justify-center gap-2 bg-black text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-gray-800 transition-colors"
        >
          <img
            src="https://cdn.allox.ai/allox/publicSale/sonarConnect.png"
            alt=""
            className="h-4 w-auto"
            style={{ filter: "invert(1) brightness(1.4)" }}
          />
          Connect with Sonar
        </button>
      </div>
    </div>
  );
}

export function SonarEntityStatusBanner({
  status,
  entity,
  onDisconnect,
  loading,
  error,
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/70 p-6 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        <span className="text-sm text-gray-600">
          Loading your Sonar eligibility…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h5 className="font-bold text-gray-900 mb-1">
              Could not load Sonar entities
            </h5>
            <p className="text-sm text-gray-600 mb-3">
              {error.message || "Unknown error"}
            </p>
            {onDisconnect && (
              <button
                type="button"
                onClick={onDisconnect}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Disconnect Sonar and retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!status) return null;

  const styles = TONE_STYLES[status.tone] || TONE_STYLES.gray;
  const StatusIcon = status.eligible
    ? CheckCircle
    : status.tone === "red"
      ? AlertCircle
      : Shield;

  return (
    <div className={`rounded-2xl border p-5 ${styles.box}`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <StatusIcon
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.icon}`}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h5 className={`font-bold ${styles.title}`}>{status.title}</h5>
              <span className="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200/60">
                Sonar connected
              </span>
            </div>
            <p className="text-sm text-gray-700">{status.detail}</p>
            {/* {entity?.Label && (
              <p className="text-xs text-gray-500 mt-2">
                Entity:{" "}
                <span className="font-semibold text-gray-700">
                  {entity.Label}
                </span>
              </p>
            )} */}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {(status.needsSetup || !entity) && (
            <a
              href={getSonarHomeUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-black text-white text-sm font-semibold px-4 py-2.5 hover:bg-gray-800"
            >
              Continue on Sonar
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {onDisconnect && (
            <button
              type="button"
              onClick={onDisconnect}
              className="inline-flex items-center rounded-xl border border-gray-300 bg-white/80 text-sm font-semibold text-gray-700 px-4 py-2.5 hover:bg-white"
            >
              Disconnect Sonar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const TOAST_TONE_STYLES = {
  red: {
    box: "border-red-200 bg-red-50",
    icon: "text-red-600",
  },
  amber: {
    box: "border-amber-200 bg-amber-50",
    icon: "text-amber-600",
  },
};

function SonarToastShell({ tone, onDismiss, children }) {
  const styles = TOAST_TONE_STYLES[tone] || TOAST_TONE_STYLES.amber;
  return (
    <div className="fixed bottom-4 right-4 z-[100] w-[calc(100vw-2rem)] max-w-sm animate-fade-in">
      <div
        className={`relative rounded-2xl border shadow-lg p-4 pr-8 flex items-start gap-3 ${styles.box}`}
      >
        {children}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Bottom-right toast for non-success Sonar states (errors, or entity states
 * that need action). Eligible/success is intentionally silent here — callers
 * that already show a "connected" indicator elsewhere shouldn't duplicate it.
 */
export function SonarStatusToast({ status, entity, onDisconnect, loading, error }) {
  const [dismissed, setDismissed] = useState(false);
  const [lastDismissKey, setLastDismissKey] = useState(null);
  const dismissKey = error ? `error:${error.message}` : status?.title;

  if (dismissKey !== lastDismissKey) {
    setLastDismissKey(dismissKey);
    setDismissed(false);
  }

  if (dismissed || loading || !dismissKey) return null;

  if (error) {
    return (
      <SonarToastShell tone="red" onDismiss={() => setDismissed(true)}>
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <h5 className="font-bold text-sm text-gray-900 mb-1">
            Could not load Sonar entities
          </h5>
          <p className="text-xs text-gray-600 mb-2">
            {error.message || "Unknown error"}
          </p>
          {onDisconnect && (
            <button
              type="button"
              onClick={onDisconnect}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Disconnect Sonar and retry
            </button>
          )}
        </div>
      </SonarToastShell>
    );
  }

  if (!status || status.eligible) return null;

  const tone = status.tone === "red" ? "red" : "amber";
  const StatusIcon = tone === "red" ? AlertCircle : Shield;

  return (
    <SonarToastShell tone={tone} onDismiss={() => setDismissed(true)}>
      <StatusIcon
        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${TOAST_TONE_STYLES[tone].icon}`}
      />
      <div className="min-w-0 flex-1">
        <h5 className="font-bold text-sm text-gray-900 mb-1">{status.title}</h5>
        <p className="text-xs text-gray-600 mb-2">{status.detail}</p>
        <div className="flex flex-wrap gap-3">
          {(status.needsSetup || !entity) && (
            <a
              href={getSonarHomeUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Continue on Sonar
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {onDisconnect && (
            <button
              type="button"
              onClick={onDisconnect}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700"
            >
              Disconnect Sonar
            </button>
          )}
        </div>
      </div>
    </SonarToastShell>
  );
}

/**
 * Gates public-sale invest / whitelist UI behind Sonar OAuth (Echo).
 * Wallet connect is separate — after the wallet is connected, users still
 * need "Connect with Sonar" before seeing participation details.
 */
export function SonarPublicSaleGate({
  walletAddress,
  children,
  requireEligible = false,
}) {
  const sonar = useSonarPublicSaleAccess(walletAddress);

  if (!sonar.configured) {
    return <SonarNotConfiguredNotice />;
  }

  if (!sonar.ready) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/70 p-6 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        <span className="text-sm text-gray-600">Loading Sonar…</span>
      </div>
    );
  }

  if (!sonar.authenticated) {
    return <SonarConnectPrompt onConnect={sonar.connectSonar} />;
  }

  return (
    <>
      <SonarStatusToast
        status={sonar.status}
        entity={sonar.primaryEntity}
        onDisconnect={sonar.logout}
        loading={sonar.entitiesLoading}
        error={sonar.entitiesError}
      />
      {(!requireEligible || sonar.status?.eligible) && children}
    </>
  );
}
