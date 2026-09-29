import { X, Gem } from "lucide-react";
import { useState } from "react";
import {
  formatUsd,
  formatMultiplier,
  formatTierRange,
  formatCampaignDate,
  buildHoldMultiplierBands,
  buildLeaderboardBonusRows,
  earlyBonusPercent,
  toFiniteNumber,
} from "../utils/wodHodlCampaign";

interface WODCampaignFAQModalProps {
  onClose: () => void;
  campaign?: any;
}

export function WODCampaignFAQModal({
  onClose,
  campaign,
}: WODCampaignFAQModalProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const tiers = Array.isArray(campaign?.tiers) ? campaign.tiers : [];
  const holdingMultipliers = buildHoldMultiplierBands(campaign);
  const leaderboardBonus = buildLeaderboardBonusRows(campaign);
  const earlyHours = toFiniteNumber(campaign?.earlyBonus?.hours, 48);
  const earlyMultiplier = toFiniteNumber(campaign?.earlyBonus?.multiplier, 1.2);
  const earlyPct = earlyBonusPercent(campaign?.earlyBonus);
  const minHoldDays = toFiniteNumber(campaign?.minHoldDays, 3);
  const minBuyUsd = toFiniteNumber(campaign?.minBuyUsd, 50);
  const totalPoolGems = toFiniteNumber(campaign?.totalPoolGems, 20000);
  const gemUsdValue = toFiniteNumber(campaign?.gemUsdValue, 5);
  const jackpots = Array.isArray(campaign?.jackpots) ? campaign.jackpots : [];
  const startLabel = formatCampaignDate(campaign?.startsAt) || "Campaign start";
  const endLabel = formatCampaignDate(campaign?.endsAt || campaign?.snapshotAt) || "Snapshot";

  const faqs = [
    {
      question: "When does the campaign run?",
      answer: (
        <div className="space-y-3">
          <p>
            The WOD HODL campaign window is set by the snapshot schedule:
          </p>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-600 mb-1">Start Date</div>
                <div className="font-bold text-gray-900">{startLabel}</div>
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Snapshot</div>
                <div className="font-bold text-gray-900">{endLabel}</div>
              </div>
            </div>
          </div>
          <p>
            <span className="font-semibold">Pro Tip:</span> Join within the
            first {earlyHours} hours for a permanent {formatMultiplier(earlyMultiplier)}{" "}
            ({earlyPct}%) bonus multiplier!
          </p>
        </div>
      ),
    },
    {
      question: "What counts toward my position?",
      answer: (
        <div className="space-y-3">
          <p>
            Buys and holdings only count on <span className="font-semibold">BNB Chain through AlloX</span>.
            Selling WOD reduces your counted amount (net buys).
          </p>
          <p>
            You must hold until snapshot. Wallets that move or dump tokens
            before snapshot can be scaled down or disqualified at settlement.
          </p>
          <p className="text-xs text-gray-600">
            Minimum to qualify: {formatUsd(minBuyUsd)} net buy, hold at least{" "}
            {minHoldDays} days.
          </p>
        </div>
      ),
    },
    {
      question: "When are rewards distributed?",
      answer: (
        <div className="space-y-3">
          <p>Rewards are distributed after the campaign ends.</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                1
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900">
                  Snapshot Taken
                </div>
                <div className="text-xs text-gray-600">
                  Final holdings recorded on {endLabel}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                2
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900">
                  Validation
                </div>
                <div className="text-xs text-gray-600">
                  Holdings validated & rewards calculated
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                3
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900">
                  Distribution
                </div>
                <div className="text-xs text-gray-600">
                  Gems sent after validation
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      question: "Why do my estimated rewards change?",
      answer: (
        <div className="space-y-3">
          <p>
            Estimated rewards move as other participants join because pool
            shares are relative. Numbers changing between visits is expected
            behavior, not a bug.
          </p>
          <p className="text-xs text-gray-600">
            Finals are locked at snapshot after validation.
          </p>
        </div>
      ),
    },
    {
      question: "What is 'My Weight' and how is it calculated?",
      answer: (
        <div className="space-y-3">
          <p>
            Your Weight determines your share of your tier&apos;s reward pool:
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="text-center font-mono text-sm font-bold text-gray-900">
              Weight = Amount × Early Bonus × Holding Multiplier
            </div>
          </div>
        </div>
      ),
    },
    {
      question: "How does the Tier Pool system work?",
      answer: (
        <div className="space-y-3">
          <span className="inline-flex">
            The total campaign has{" "}
            <b className="flex items-center gap-1 font-bold text-purple-600 mx-1">
              {totalPoolGems.toLocaleString()} <Gem className="w-4 h-4 text-purple-600" />
            </b>{" "}
            divided into tier pools:
          </span>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900">
                    Tier
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900">
                    Investment Range
                  </th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-900">
                    Pool %
                  </th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-900">
                    Pool Gems
                  </th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier: any) => (
                  <tr
                    key={tier.id || tier.label}
                    className="border-t border-gray-100"
                  >
                    <td className="py-2 px-3 font-semibold text-gray-700">
                      {tier.label}
                    </td>
                    <td className="py-2 px-3 text-gray-600">
                      {formatTierRange(tier)}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold">
                      {tier.poolPct}%
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-purple-600">
                      <span className="flex gap-1 items-center justify-end">
                        {Number(tier.poolGems).toLocaleString()} <Gem className="w-4 h-4 text-purple-600" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      question: "What is the Early Participation Boost?",
      answer: (
        <div className="space-y-3">
          <p>
            Join within the{" "}
            <span className="font-semibold text-gray-900">
              first {earlyHours} hours
            </span>{" "}
            to receive a permanent{" "}
            <span className="font-bold text-yellow-600">
              {formatMultiplier(earlyMultiplier)} ({earlyPct}%)
            </span>{" "}
            on your weight!
          </p>
        </div>
      ),
    },
    {
      question: "How does the Holding Multiplier work?",
      answer: (
        <div className="space-y-3">
          <p>The longer you hold your WOD tokens, the higher your multiplier:</p>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900">
                    Holding Duration
                  </th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-900">
                    Multiplier
                  </th>
                </tr>
              </thead>
              <tbody>
                {holdingMultipliers.map((row) => (
                  <tr key={row.time} className="border-t border-gray-100">
                    <td className="py-2 px-3 text-gray-600">{row.time}</td>
                    <td className={`py-2 px-3 text-right font-bold ${row.color}`}>
                      {row.multiplier}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-600">
            You must hold continuously until snapshot. Selling can reset or
            disqualify your position.
          </p>
        </div>
      ),
    },
    {
      question: "What is the Leaderboard Bonus?",
      answer: (
        <div className="space-y-3">
          <p>
            Top holders earn{" "}
            <span className="font-semibold text-gray-900">extra Gem bonuses</span>{" "}
            on top of their tier pool share:
          </p>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold text-gray-900">
                    Rank
                  </th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-900">
                    Bonus
                  </th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-900">
                    USD Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboardBonus.map((item) => (
                  <tr key={item.rank} className="border-t border-gray-100">
                    <td className="py-2 px-3 font-semibold text-gray-900">
                      {item.rank}
                    </td>
                    <td className={`py-2 px-3 text-right font-bold ${item.color}`}>
                      <span className="flex gap-1 items-center justify-end">
                        +{item.gems} <Gem className="w-4 h-4 text-purple-600" />
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-gray-600">
                      {formatUsd(item.usd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      question: "How does the Jackpot system work?",
      answer: (
        <div className="space-y-3">
          <p>
            Random lucky winners receive bonus rewards regardless of tier:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {jackpots.map((jackpot: any) => (
              <div
                key={`${jackpot.winners}-${jackpot.gems}`}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200 text-center"
              >
                <div className="text-xs text-gray-600 mb-1">
                  {jackpot.winners} Winners
                </div>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  <span className="flex gap-1 items-center justify-center">
                    {jackpot.gems} <Gem className="w-6 h-6 text-purple-600" />
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  {formatUsd(toFiniteNumber(jackpot.gems) * gemUsdValue)} each
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Campaign FAQ</h2>
            <p className="text-sm text-gray-600 mt-1">
              Common questions about the WOD HODL campaign
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

        <div className="p-6">
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-sm text-gray-900">
                    {faq.question}
                  </span>
                  <div
                    className={`transform transition-transform ${openFaqIndex === index ? "rotate-180" : ""}`}
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>
                {openFaqIndex === index && (
                  <div className="px-4 pb-4 text-sm text-gray-600 bg-gray-50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
