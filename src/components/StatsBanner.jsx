import { useQuery } from "@tanstack/react-query";
import Slider from "react-slick";
import {
  Users,
  PieChart,
  ArrowUpRight,
  Repeat2,
  BarChart2,
} from "lucide-react";
import { apiCall } from "../utils/api";
import getFormattedNumber from "../hooks/get-formatted-number";

const STATS_QUERY_KEY = ["portfolio", "stats", "full"];

const STAT_ICONS = {
  pnl: ArrowUpRight,
  portfolios: PieChart,
  users: Users,
  transactions: Repeat2,
  tvl: BarChart2,
};

const formatCompact = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return getFormattedNumber(n, 0);
};

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 420,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  arrows: false,
  pauseOnHover: true,
  dotsClass: "slick-dots stats-banner-dots",
};

const PLACEHOLDER_STATS = [
  { id: "pnl", label: "Positive P&L", value: "—" },
  { id: "portfolios", label: "Portfolios Created", value: "—" },
  { id: "users", label: "Total Users", value: "—" },
  { id: "transactions", label: "Transactions", value: "—" },
  { id: "tvl", label: "On-Chain Invested", value: "—" },
];

function buildStats(data) {
  if (!data) return null;
  return [
    {
      id: "pnl",
      label: "Positive P&L",
      value: `${Number(data?.pnl?.pnlPercent ?? 0).toFixed(1)}%`,
    },
    {
      id: "portfolios",
      label: "Portfolios Created",
      value: getFormattedNumber(data?.onChainPortfolios ?? 0, 0),
    },
    {
      id: "users",
      label: "Total Users",
      value: getFormattedNumber(data?.totalUsers ?? 0, 0),
    },
    {
      id: "transactions",
      label: "Transactions",
      value: formatCompact(data?.totalTransactions ?? 0),
    },
    {
      id: "tvl",
      label: "On-Chain Invested",
      value: formatCompact(data?.totalValueLockedUsd ?? 0),
    },
  ];
}

async function fetchPortfolioStats() {
  const data = await apiCall("/portfolio/stats/full");
  const stats = buildStats(data);
  if (!stats) throw new Error("No portfolio stats");
  return stats;
}

function StatSlide({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-center gap-2.5 px-6 py-2.5">
      <div
        className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #20b264 0%, #0f7a44 100%)",
        }}
      >
        <Icon size={14} className="text-white" strokeWidth={2.5} />
      </div>
      <span
        className="text-sm font-semibold whitespace-nowrap text-[#0f7a44] dark:text-green-400"
      >
        {label}: <span>{value}</span>
      </span>
    </div>
  );
}

export function StatsBanner({ className = "" }) {
  const { data: stats } = useQuery({
    queryKey: STATS_QUERY_KEY,
    queryFn: fetchPortfolioStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: true,
    retry: 2,
  });

  // Cached / fresh data when available; placeholders keep the banner visible while loading
  const slides = stats?.length ? stats : PLACEHOLDER_STATS;

  return (
    <div
      className={`flex justify-center stats-banner mx-auto mb-4 sm:mb-0 sm:fixed sm:top-25 sm:left-1/2 sm:-translate-x-1/2 min-[1280px]:!left-[calc(50%+100px)] min-[1440px]:!left-1/2 sm:z-20 ${className}`}
    >
      <style>{`
        .stats-banner .stats-banner-slider {
          width: 280px;
        }
        .stats-banner .stats-banner-slider .slick-list {
          border-radius: 9999px;
          background: linear-gradient(135deg, rgba(32,178,100,0.12) 0%, rgba(16,140,80,0.08) 100%);
          border: 1px solid rgba(32,178,100,0.3);
          box-shadow: 0 4px 20px rgba(32,178,100,0.1);
          backdrop-filter: blur(4px);
        }
        .stats-banner .stats-banner-slider .slick-track {
          display: flex;
          align-items: center;
        }
        .stats-banner .stats-banner-slider .slick-slide {
          height: auto;
        }
        .stats-banner .stats-banner-slider .slick-slide > div {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stats-banner .stats-banner-dots {
          position: static;
          margin: 8px 0 0;
          line-height: 0;
        }
        .stats-banner .stats-banner-dots li {
          margin: 0 3px;
          width: 6px;
          height: 6px;
        }
        .stats-banner .stats-banner-dots li button {
          width: 6px;
          height: 6px;
          padding: 0;
        }
        .stats-banner .stats-banner-dots li button:before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: rgba(32, 178, 100, 0.35);
          opacity: 1;
          top: 0;
          left: 0;
        }
        .stats-banner .stats-banner-dots li.slick-active button:before {
          background: #0f7a44;
        }
        /* Only hide the fixed desktop banner on short viewports — not mobile (in-flow) */
        @media (min-width: 640px) and (max-height: 759px) {
          .stats-banner {
            display: none !important;
          }
        }
      `}</style>
      <Slider {...sliderSettings} className="stats-banner-slider">
        {slides.map((stat) => (
          <div key={stat.id}>
            <StatSlide
              icon={STAT_ICONS[stat.id] ?? Users}
              label={stat.label}
              value={stat.value}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}
