import { motion } from "motion/react";
import { X as CloseIcon } from "lucide-react";
import { PORTFOLIO_REWARD_TIERS } from "../utils/portfolioRewardTiers";

const TIER_BARS = ["6%", "30%", "55%", "78%", "100%"];

export function PortfolioTierModal({ isOpen, onClose, onCreatePortfolio }: { isOpen: boolean; onClose: () => void; onCreatePortfolio?: () => void }) {
    if (!isOpen) return null;
    const PORTFOLIO_TIERS = PORTFOLIO_REWARD_TIERS.map((tier, i) => ({
        size: `$${tier.amountUsd.toLocaleString()}`,
        points: tier.points.toLocaleString(),
        pointsNum: tier.points,
        bar: TIER_BARS[i] ?? "100%",
    }));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[75vh] overflow-hidden"
            >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold">Create Portfolio Rewards</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                    >
                        <CloseIcon size={16} className="text-gray-600" />
                    </button>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="p-5 overflow-y-auto max-h-[calc(75vh-72px)] space-y-4">
                    <p className="text-sm text-gray-600">Points are awarded based on the size of the portfolio you create. Larger portfolios earn significantly more points.</p>

                    {/* Tier rows */}
                    <div className="space-y-2">
                        {PORTFOLIO_TIERS.map((tier, i) => (
                            <div key={tier.size} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: i === PORTFOLIO_TIERS.length - 1 ? "linear-gradient(135deg, #f5f3ff, #fdf4ff)" : "rgba(0,0,0,0.02)", border: i === PORTFOLIO_TIERS.length - 1 ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(0,0,0,0.06)" }}>
                                <div className="w-20 flex-shrink-0 text-sm font-black text-gray-900">{tier.size}</div>
                                <div className="flex-1">
                                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                        <div className="h-full rounded-full transition-all" style={{ width: tier.bar, background: i === PORTFOLIO_TIERS.length - 1 ? "linear-gradient(90deg, #7c3aed, #a855f7)" : "linear-gradient(90deg, #3b82f6, #6366f1)" }} />
                                    </div>
                                </div>
                                <div className="w-24 text-right">
                                    <span className="text-sm font-black" style={{ color: i === PORTFOLIO_TIERS.length - 1 ? "#7c3aed" : "#1d4ed8" }}>{tier.points}</span>
                                    <span className="text-xs text-gray-400 ml-1">pts</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-xl p-3 bg-blue-50 border border-blue-200">
                        <p className="text-xs text-blue-700"><strong>Tip:</strong> Points are awarded once per portfolio at creation. Create larger portfolios to maximise your rewards.</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            onCreatePortfolio?.();
                        }}
                        className="bg-black w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90"

                    >
                        Create portfolio
                    </button>
                </div>
            </motion.div>
        </div>
    );
}