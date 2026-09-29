import {
  X,
  Target,
  Clock,
  Zap,
  Trophy,
  Gift,
  Calculator,
  Shield,
  Gem,
} from "lucide-react";
import {
  formatUsd,
  formatMultiplier,
  formatTierRange,
  getTierStyle,
  buildHoldMultiplierBands,
  buildLeaderboardBonusRows,
  earlyBonusPercent,
  toFiniteNumber,
} from "../utils/wodHodlCampaign";

interface WODCampaignDetailsModalProps {
  onClose: () => void;
  campaign?: any;
}

export function WODCampaignDetailsModal({
  onClose,
  campaign,
}: WODCampaignDetailsModalProps) {
  const tiers = Array.isArray(campaign?.tiers) ? campaign.tiers : [];
  const holdingMultipliers = buildHoldMultiplierBands(campaign);
  const leaderboardBonus = buildLeaderboardBonusRows(campaign);
  const earlyHours = toFiniteNumber(campaign?.earlyBonus?.hours, 48);
  const earlyMultiplier = toFiniteNumber(campaign?.earlyBonus?.multiplier, 1.2);
  const earlyPct = earlyBonusPercent(campaign?.earlyBonus);
  const minHoldDays = toFiniteNumber(campaign?.minHoldDays, 3);
  const totalPoolGems = toFiniteNumber(campaign?.totalPoolGems, 20000);
  const gemUsdValue = toFiniteNumber(campaign?.gemUsdValue, 5);
  const jackpots = Array.isArray(campaign?.jackpots) ? campaign.jackpots : [];
  const explorerTier = tiers.find(
    (t: any) => String(t.label).toLowerCase() === "explorer",
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Campaign Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Everything you need to know about the WOD HODL campaign
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold">Core Rules</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Essential requirements to participate and qualify for rewards in
              this campaign.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                {
                  title: "BSC via AlloX only",
                  body: "Buys and holdings only count on BNB Chain through the platform.",
                },
                {
                  title: "Net Buys Only",
                  body: "Selling WOD reduces your counted amount (net buys).",
                },
                {
                  title: "Hold Until Snapshot",
                  body: "Wallets that move or dump before snapshot may be scaled down or disqualified.",
                },
                {
                  title: "Estimates move",
                  body: "Pool shares are relative — numbers changing between visits is expected.",
                },
              ].map((rule) => (
                <div
                  key={rule.title}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">
                      {rule.title}
                    </div>
                    <div className="text-xs text-gray-600">{rule.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold">Tier Structure</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Different reward tiers based on your net buy amount. Higher tiers
              get larger pool shares.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {tiers.map((tier: any) => {
                const style = getTierStyle(tier.label);
                return (
                  <div
                    key={tier.id || tier.label}
                    className={`p-4 border-2 ${style.chip.includes("green") ? "border-green-200 bg-green-50/30" : style.chip.includes("purple") ? "border-purple-200 bg-purple-50/30" : "border-gray-200 bg-gray-50/30"} rounded-xl`}
                  >
                    <div className="mb-3">
                      <div className={`font-bold text-lg ${style.text}`}>
                        {tier.label}
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatTierRange(tier)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Pool Allocation</span>
                        <span className="font-bold text-gray-900">
                          {tier.poolPct}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Pool Gems</span>
                        <span className="font-bold text-gray-900 flex gap-1 items-center">
                          {Number(tier.poolGems).toLocaleString()}  <Gem className="w-4 h-4 text-purple-600" />
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 text-xs text-gray-600">
                        Your share depends on your weight vs. total tier weight
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-700 mb-2">
                <span className="font-bold">How Pool Distribution Works:</span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex gap-1 items-center">
                  • Total campaign pool:{" "}
                  <span className="font-semibold flex gap-1 items-center">
                    {totalPoolGems.toLocaleString()} <Gem className="w-4 h-4 text-purple-600" />
                  </span>{" "}
                  (~{formatUsd(totalPoolGems * gemUsdValue)})
                </div>
                <div>
                  • Your weight ={" "}
                  <span className="font-semibold">
                    Amount × Early Bonus × Holding Multiplier
                  </span>
                </div>
                <div>
                  • Your reward ={" "}
                  <span className="font-semibold">
                    (Your Weight / Total Tier Weight) × Tier Pool
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold">Holding Multiplier</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              The longer you hold your $WOD tokens, the higher your reward
              multiplier. You must hold for at least {minHoldDays} days to
              qualify.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
              {holdingMultipliers.map((item) => (
                <div
                  key={item.time}
                  className="p-4 bg-gray-50 rounded-xl text-center"
                >
                  <div className="text-xs text-gray-600 mb-2">{item.time}</div>
                  <div className={`text-lg font-bold ${item.color}`}>
                    {item.multiplier}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-bold">Early Participation Boost</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Join within the first {earlyHours} hours for a{" "}
                {formatMultiplier(earlyMultiplier)} weight bonus (
                {earlyPct}% extra).
              </p>
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
                <div className="text-center mb-3">
                  <div className="text-3xl font-bold text-yellow-600">
                    +{earlyPct}%
                  </div>
                  <div className="text-sm text-gray-600">Bonus Gems</div>
                </div>
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
                    <span>First {earlyHours} hours only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
                    <span>Must hold until snapshot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
                    <span>One per wallet</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold">Leaderboard Bonus</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Top holders earn extra Gem bonuses on top of their tier rewards.
              </p>
              <div className="space-y-2">
                {leaderboardBonus.map((item) => (
                  <div
                    key={item.rank}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-semibold text-sm text-gray-900">
                      {item.rank}
                    </span>
                    <div className="flex items-center gap-1">
                      <Gem size={14} className="text-purple-600" />
                      <span className={`font-bold text-sm ${item.color}`}>
                        {item.bonus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-600">
                Based on total WOD bought + held
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-bold">Jackpot Layer</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Lucky random winners selected from all participants receive bonus
              rewards, regardless of their tier.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {jackpots.map((jackpot: any) => (
                <div
                  key={`${jackpot.winners}-${jackpot.gems}`}
                  className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 text-center"
                >
                  <div className="text-sm text-gray-600 mb-2">
                    {jackpot.winners} Winners
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Gem size={20} className="text-purple-600" />
                    <span className="text-2xl font-bold text-gray-900">
                      {jackpot.gems}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatUsd(toFiniteNumber(jackpot.gems) * gemUsdValue)} each
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-bold">Example Calculation</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Example weight and pool share for an Explorer-tier participant.
            </p>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
              <div className="space-y-3">
                <div className="text-sm font-bold text-gray-900 mb-2">
                  Scenario: {explorerTier?.label || "Explorer"} Tier User
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Investment Amount</span>
                  <span className="font-bold text-gray-900">$450</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    Early Bonus (first {earlyHours}h)
                  </span>
                  <span className="font-bold text-yellow-600">
                    × {earlyMultiplier}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Holding Duration (7 days)</span>
                  <span className="font-bold text-blue-600">× 1.25</span>
                </div>
                <div className="pt-2 border-t border-green-300">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-semibold">
                      User Weight
                    </span>
                    <span className="font-bold text-gray-900">
                      450 × {earlyMultiplier} × 1.25 ={" "}
                      {(450 * earlyMultiplier * 1.25).toFixed(0)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    {explorerTier?.label || "Explorer"} Tier Pool
                  </span>
                  <span className="font-bold text-gray-900 flex gap-1 items-center">
                    {Number(explorerTier?.poolGems || 3000).toLocaleString()} <Gem className="w-4 h-4 text-purple-600" />
                  </span>
                </div>
                <div className="pt-3 border-t-2 border-green-400">
                  <div className="text-xs text-gray-600">
                    Formula: (Your Weight / Total Tier Weight) × Tier Pool.
                    Estimates change as others join.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
