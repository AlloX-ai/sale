import {
  MessageSquare,
  PieChart,
  Flame,
  TrendingUp,
  Coins,
  History as HistoryIcon,
  TrendingDown,
  Users,
  Trophy,
  Eye,
  Briefcase,
  Gem,
  Landmark,
} from "lucide-react";

export const navigationTabs = [
  { id: "chat", label: "Build Portfolio", path: "/", Icon: MessageSquare },
  { id: "portfolio", label: "Portfolio", path: "/portfolio", Icon: PieChart },
  { id: "stocks", label: "Stocks", path: "/stocks", Icon: Landmark },
  { id: "season1", label: "Campaigns", path: "/campaigns", Icon: Flame },
  { id: "watchlist", label: "Watchlist", path: "/watchlist", Icon: Eye },
  { id: "rewards", label: "Rewards", path: "/rewards", Icon: Coins },
  { id: "referrals", label: "Referrals", path: "/referrals", Icon: Users },

  { id: "trading", label: "Trending", path: "/trending", Icon: TrendingUp },
  {
    id: "topportfolio",
    label: "Top Portfolios",
    path: "/top-portfolios",
    Icon: Trophy,
  },
  { id: "primepicks", label: "Prime Picks", path: "/prime-picks", Icon: Gem },
  { id: "staking", label: "Staking", path: "/staking", Icon: TrendingDown },
  { id: "history", label: "History", path: "/history", Icon: HistoryIcon },
];

/** Sidebar: "Portfolios" trigger + sub-routes (see LaunchSidebar). */
export const portfolioSidebarNav = {
  label: "Portfolios",
  Icon: Briefcase,
  items: [
    {
      id: "portfolio",
      label: "My Portfolio",
      path: "/portfolio",
      Icon: PieChart,
    },
    {
      id: "topportfolio",
      label: "Top Portfolios",
      path: "/top-portfolios",
      Icon: Trophy,
    },
    {
      id: "primepicks",
      label: "Prime Picks",
      path: "/prime-picks",
      Icon: Gem,
    },
    {
      id: "watchlist",
      label: "Watchlist",
      path: "/watchlist",
      Icon: Eye,
    },
  ],
};

export const portfolioSidebarNavIds = new Set([
  "portfolio",
  "watchlist",
  "topportfolio",
  "primepicks",
]);

export const isActivePath = (pathname, tabPath) => {
  if (tabPath === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(tabPath);
};

export const isPortfolioSidebarNavActive = (pathname) =>
  portfolioSidebarNav.items.some((i) => isActivePath(pathname, i.path));

/** Eligible private-sale CTA — distinct from the default black active tab. */
export const privateSaleNavButtonClass =
  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-white shadow-lg hover:opacity-95";

export const privateSaleNavButtonStyle = {
  background: "linear-gradient(135deg, #059669 0%, #0d9488 45%, #2563eb 100%)",
  boxShadow: "0 8px 20px rgba(13, 148, 136, 0.35)",
};