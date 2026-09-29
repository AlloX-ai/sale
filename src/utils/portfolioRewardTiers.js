// Portfolio creation reward tiers, used for display purposes (e.g. the tier
// chart and per-portfolio badges). The authoritative running point total
// lives on the backend (`/auth/me`'s `pointsBreakdown.fromPortfolios`) and
// must not be recomputed from the user's currently-held portfolios, since
// selling a portfolio never deducts its points.
export const PORTFOLIO_REWARD_DEFAULT_POINTS = 250;

export const PORTFOLIO_REWARD_TIERS = [
  { amountUsd: 100, points: 5000 },
  { amountUsd: 500, points: 27500 },
  { amountUsd: 1000, points: 60000 },
  { amountUsd: 5000, points: 350000 },
  { amountUsd: 10000, points: 800000 },
];

export const PORTFOLIO_REWARD_TIERS2 = [
  { amountUsd: "<100", points: 250 },
  { amountUsd: 100, points: 5000 },
  { amountUsd: 500, points: 27500 },
  { amountUsd: 1000, points: 60000 },
  { amountUsd: 5000, points: 350000 },
  { amountUsd: 10000, points: 800000 },
];

// Fixed launch date of the portfolio-creation reward program. Portfolios
// created on or after this date are eligible, forever — this must stay a
// fixed constant, not "today" recomputed on each call, otherwise portfolios
// created on day 1 would silently stop counting on day 2.
const PORTFOLIO_REWARD_PROGRAM_START = new Date(2026, 8, 14); // 2026-09-14, local time

export function getPortfolioInvestmentUsd(portfolio) {
  if (!portfolio) return 0;

  const direct = Number(
    portfolio.totalInvestment ??
      portfolio.investmentTier ??
      portfolio.total_investment ??
      portfolio.investment_tier,
  );
  if (Number.isFinite(direct) && direct > 0) return direct;

  const positions = Array.isArray(portfolio.positions)
    ? portfolio.positions
    : [];
  const fromPositions = positions.reduce(
    (sum, pos) =>
      sum +
      (Number(
        pos?.allocationUsd ?? pos?.allocation_usd ?? pos?.allocation,
      ) || 0),
    0,
  );
  if (fromPositions > 0) return fromPositions;

  const current = Number(
    portfolio.totalCurrentValue ??
      portfolio.totalCurrentValueUsd ??
      portfolio.totalValue,
  );
  return Number.isFinite(current) && current > 0 ? current : 0;
}

export function getPortfolioCreatedTimestamp(portfolio) {
  const raw =
    portfolio?.createdAt ??
    portfolio?.updatedAt ??
    portfolio?.created_at ??
    portfolio?.updated_at ??
    portfolio?.date ??
    portfolio?.timestamp;
  if (raw == null) return null;
  if (typeof raw === "number") return raw;
  const parsed = new Date(String(raw));
  const time = parsed.getTime();
  return Number.isFinite(time) ? time : null;
}

export function isPortfolioCreatedFromToday(dateInput) {
  if (dateInput == null) return false;
  const created =
    typeof dateInput === "number" ? new Date(dateInput) : new Date(dateInput);
  if (Number.isNaN(created.getTime())) return false;
  return created.getTime() >= PORTFOLIO_REWARD_PROGRAM_START.getTime();
}

// Full campaign points for a portfolio (used in EarnPoints stats / UI).
export function getPortfolioDisplayRewardPoints(investedUsd) {
  const amount = Number(investedUsd) || 0;
  let points = PORTFOLIO_REWARD_DEFAULT_POINTS;
  for (const tier of PORTFOLIO_REWARD_TIERS) {
    if (amount >= tier.amountUsd) points = tier.points;
  }
  return points;
}
