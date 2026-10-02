import { useState } from "react";
import { createPortal } from "react-dom";
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
  InvestingRegion,
  SaleEligibility,
} from "@echoxyz/sonar-core";
import { useSonarAuth, useSonarEntities } from "@echoxyz/sonar-react";
import {
  getSonarHomeUrl,
  isSonarConfigured,
  sonarSaleUUID,
  SONAR_OAUTH_RETURN_PATH_KEY,
} from "../config/sonar";

const INVESTING_REGION_LABELS = {
  [InvestingRegion.US]: "United States",
  [InvestingRegion.EU]: "European Union",
  [InvestingRegion.OTHER]: "outside the US and EU",
};

/**
 * Maps a Sonar entity to a user-facing eligibility status.
 * `eligible` is the single gate for whitelist and purchase: only entities
 * with completed KYC and SaleEligibility.ELIGIBLE may participate.
 * `buttonLabel` is a short reason shown on blocked CTAs.
 * `phase` ("whitelist" | "live") tailors the copy to the current sale state.
 */
export function describeSonarEntity(entity, phase = "whitelist") {
  const isLive = phase === "live";
  const joinGoal = isLive ? "participate in public sale" : "join the whitelist";
  const joinVerb = isLive ? "participate" : "join";
  if (!entity) {
    return {
      tone: "amber",
      title: "No Sonar entity found",
      detail:
        "Create an entity on Sonar using the same email or wallet you're using here, then complete verification.",
      buttonLabel: "Set up your entity on Sonar",
      eligible: false,
      needsSetup: true,
    };
  }

  const setup = entity.EntitySetupState;
  const eligibility = entity.SaleEligibility;

  if (setup === EntitySetupState.NOT_STARTED) {
    return {
      tone: "amber",
      title: "Verification not started",
      detail:
        `Start identity and eligibility checks on Sonar. Only verified, eligible accounts can ${joinGoal}.`,
      buttonLabel: `Verify on Sonar to ${joinVerb}`,
      eligible: false,
      needsSetup: true,
    };
  }

  if (
    setup === EntitySetupState.IN_PROGRESS ||
    setup === EntitySetupState.READY_FOR_REVIEW
  ) {
    return {
      tone: "amber",
      title: "Finish your Sonar verification",
      detail:
        setup === EntitySetupState.READY_FOR_REVIEW
          ? "Your details are ready. Submit them for review on Sonar to continue."
          : `Your verification is in progress. Finish the remaining steps on Sonar to ${joinGoal}.`,
      buttonLabel: `Finish verification to ${joinVerb}`,
      eligible: false,
      needsSetup: true,
    };
  }

  if (setup === EntitySetupState.IN_REVIEW) {
    return {
      tone: "gray",
      title: "Verification under review",
      detail:
        `Sonar is reviewing your documents. You can ${joinGoal} as soon as you're approved.`,
      buttonLabel: "Verification under review",
      eligible: false,
    };
  }

  if (setup === EntitySetupState.FAILURE) {
    return {
      tone: "amber",
      title: "Verification needs another try",
      detail:
        "Sonar couldn't verify your details. Open Sonar to see what needs fixing and resubmit.",
      buttonLabel: "Fix verification on Sonar",
      eligible: false,
      needsSetup: true,
    };
  }

  if (setup === EntitySetupState.TECHNICAL_ISSUE) {
    return {
      tone: "amber",
      title: "Verification hit a technical issue",
      detail:
        "Something went wrong on Sonar's side while checking your details. Open Sonar to retry, or contact Sonar support if it keeps happening.",
      buttonLabel: "Retry verification on Sonar",
      eligible: false,
      needsSetup: true,
    };
  }

  if (setup === EntitySetupState.FAILURE_FINAL) {
    return {
      tone: "red",
      title: "Verification rejected",
      detail:
        "Sonar rejected this entity's verification, so it can't take part in this sale. Contact Sonar support if you think this is a mistake.",
      buttonLabel: `Not eligible to ${joinVerb}`,
      eligible: false,
    };
  }

  if (setup === EntitySetupState.COMPLETE) {
    if (eligibility === SaleEligibility.ELIGIBLE) {
      return {
        tone: "green",
        title: "Eligible to participate",
        detail:
          "Your Sonar verification is complete and this entity is eligible for the sale.",
        eligible: true,
      };
    }
    if (eligibility === SaleEligibility.NOT_ELIGIBLE) {
      const region = INVESTING_REGION_LABELS[entity.InvestingRegion];
      return {
        tone: "red",
        title: "Not eligible for this sale",
        detail: `Your verification is complete, but this entity doesn't meet the sale's eligibility rules${
          region ? ` (investing region on Sonar: ${region})` : ""
        }. If you have another entity, switch to it from the Sonar menu at the top.`,
        buttonLabel: `Not eligible to ${joinVerb}`,
        eligible: false,
      };
    }
    return {
      tone: "gray",
      title: "Checking sale eligibility",
      detail:
        "Your verification is complete. Sonar is still confirming whether this entity can join this sale. Check back shortly.",
      buttonLabel: "Eligibility check pending",
      eligible: false,
    };
  }

  return {
    tone: "gray",
    title: "Unknown status",
    detail:
      "We couldn't read your Sonar status. Refresh the page, or disconnect Sonar and connect again.",
    buttonLabel: "Sonar status unavailable",
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

/**
 * Hook for public-sale Sonar OAuth + entity status.
 * `selectedEntityId` picks which of the user's entities drives `activeEntity`
 * and `status`; falls back to the first entity. `phase` is passed through to
 * `describeSonarEntity` for sale-state-specific copy.
 */
export function useSonarPublicSaleAccess(
  walletAddress,
  selectedEntityId,
  phase = "whitelist",
) {
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
  const activeEntity =
    (selectedEntityId &&
      entities?.find((entity) => entity.EntityID === selectedEntityId)) ||
    primaryEntity;
  const status = authenticated ? describeSonarEntity(activeEntity, phase) : null;

  const connectSonar = () => {
    // Pathname only — never store leftover ?code=&state= or we can loop
    const returnPath = window.location.pathname || "/";
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
    activeEntity,
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
  showSonarLink = true,
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
            {entity?.Label && (
              <p className="text-xs text-gray-500 mt-2">
                Entity:{" "}
                <span className="font-semibold text-gray-700">
                  {entity.Label}
                </span>
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {showSonarLink && (status.needsSetup || !entity) && (
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

/**
 * Compact in-flow Sonar status for the selected entity, rendered inside the
 * purchase / whitelist form so the next step stays visible next to the CTA.
 * Pass `showEligible` to also confirm eligibility.
 */
export function SonarStatusInline({
  status,
  entity,
  onDisconnect,
  loading,
  error,
  showEligible = false,
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50">
        <Loader2 className="w-4 h-4 animate-spin text-indigo-600 flex-shrink-0" />
        <p className="text-xs text-gray-600">Checking your Sonar status…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl border border-red-200 bg-red-50">
        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gray-900">
            Could not load your Sonar status
          </p>
          <p className="text-xs text-gray-600 mt-0.5 break-words">
            {error.message || "Unknown error"}
          </p>
          {onDisconnect && (
            <button
              type="button"
              onClick={onDisconnect}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 mt-1.5"
            >
              Disconnect Sonar and retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!status || (status.eligible && !showEligible)) return null;

  const tone = TOAST_TONE_STYLES[status.tone] ? status.tone : "amber";
  const StatusIcon = status.eligible
    ? CheckCircle
    : tone === "red"
      ? AlertCircle
      : Shield;
  const needsSonarStep = status.needsSetup || !entity;

  return (
    <div
      className={`flex items-start gap-2.5 px-3 py-2 rounded-xl border ${TOAST_TONE_STYLES[tone].box}`}
    >
      <StatusIcon
        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${TOAST_TONE_STYLES[tone].icon}`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-xs font-semibold text-gray-900">{status.title}</p>
          {entity?.Label && (
            <span
              className="inline-flex max-w-[12rem] items-center rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-medium text-gray-600 ring-1 ring-black/5"
              title={`Sonar entity: ${entity.Label}`}
            >
              <span className="truncate">{entity.Label}</span>
            </span>
          )}
          <div className="ml-auto flex items-center gap-3">
            {needsSonarStep && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700"
                title="Reload after finishing verification on Sonar"
              >
                Refresh status
              </button>
            )}
            {onDisconnect && (
              <button
                type="button"
                onClick={onDisconnect}
                className="text-[11px] font-semibold text-gray-500 hover:text-gray-700"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
        {/* {!status.eligible && ( */}
          <p className="text-xs text-gray-600 mt-0.5">{status.detail}</p>
        {/* )} */}
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
  green: {
    box: "border-emerald-200 bg-emerald-50",
    icon: "text-emerald-600",
  },
  gray: {
    box: "border-gray-200 bg-gray-50",
    icon: "text-gray-500",
  },
};

// Portaled to <body>: a parent with backdrop-filter/transform (e.g. glass-card)
// would otherwise become the containing block for `fixed` and trap the toast.
function SonarToastShell({ tone, onDismiss, children }) {
  const styles = TOAST_TONE_STYLES[tone] || TOAST_TONE_STYLES.amber;
  return createPortal(
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
    </div>,
    document.body,
  );
}

/**
 * Bottom-right toast for the selected entity's Sonar status. By default only
 * non-success states show; pass `showEligible` to also confirm eligibility.
 * Dismissing hides it until the status or the selected entity changes.
 */
export function SonarStatusToast({
  status,
  entity,
  onDisconnect,
  loading,
  error,
  showEligible = false,
}) {
  const [dismissed, setDismissed] = useState(false);
  const [lastDismissKey, setLastDismissKey] = useState(null);
  const dismissKey = error
    ? `error:${error.message}`
    : status
      ? `${entity?.EntityID ?? "none"}:${status.title}`
      : null;

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

  if (!status || (status.eligible && !showEligible)) return null;

  const tone = TOAST_TONE_STYLES[status.tone] ? status.tone : "amber";
  const StatusIcon = status.eligible
    ? CheckCircle
    : tone === "red"
      ? AlertCircle
      : Shield;

  return (
    <SonarToastShell tone={tone} onDismiss={() => setDismissed(true)}>
      <StatusIcon
        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${TOAST_TONE_STYLES[tone].icon}`}
      />
      <div className="min-w-0 flex-1">
        <h5 className="font-bold text-sm text-gray-900 mb-1">{status.title}</h5>
        <p className="text-xs text-gray-600 mb-2">{status.detail}</p>
        {entity?.Label && (
          <p className="text-[11px] text-gray-500 mb-2">
            Entity:{" "}
            <span className="font-semibold text-gray-700">{entity.Label}</span>
          </p>
        )}
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
        entity={sonar.activeEntity}
        onDisconnect={sonar.logout}
        loading={sonar.entitiesLoading}
        error={sonar.entitiesError}
      />
      {(!requireEligible || sonar.status?.eligible) && children}
    </>
  );
}
