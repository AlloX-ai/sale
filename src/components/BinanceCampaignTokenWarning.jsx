import { AlertTriangle } from "lucide-react";
import {
  BINANCE_CAMPAIGN_ELIGIBLE_TOKENS_LABEL,
  BINANCE_CAMPAIGN_UNSUPPORTED_TOKEN_MESSAGE,
} from "../utils/binanceCampaign";

export function BinanceCampaignTokenWarning({
  ineligibleTokens = [],
  className = "",
  onJoinCampaign,
}) {
  const tokens = Array.isArray(ineligibleTokens)
    ? ineligibleTokens.filter(Boolean)
    : [];

  return (
    <div
      className={`rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-4 shadow-md ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle
          size={18}
          className="shrink-0 mt-0.5 text-amber-700"
          aria-hidden
        />
        <div className="min-w-0 space-y-2 flex-1">
          <p className="text-sm font-bold text-amber-950">
            {BINANCE_CAMPAIGN_UNSUPPORTED_TOKEN_MESSAGE}
          </p>
          {tokens.length > 0 && (
            <p className="text-sm text-amber-900">
              <span className="font-medium">Not eligible:</span>{" "}
              {tokens.join(", ")}
            </p>
          )}
          <p className="text-sm text-amber-900">
            <span className="font-medium">Eligible:</span>{" "}
            {BINANCE_CAMPAIGN_ELIGIBLE_TOKENS_LABEL}
          </p>
          {typeof onJoinCampaign === "function" && (
            <button
              type="button"
              onClick={onJoinCampaign}
              className="mt-1 w-full sm:w-auto px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Join Binance Wallet Campaign
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
