import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Copy,
  Check,
  X,
  LogOut,
  Edit3,
  ChevronDown,
  Info,
  Lock,
  Wallet,
  CheckCircle,
  TrendingUp,
  Tag,
  Zap,
  ExternalLink,
  Users,
  AlertCircle,
  Mail,
  Gift,
  Shield,
  Award,
  CreditCard,
  Percent,
  Clock,
  Layers,
  UserPlus,
  DollarSign,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { setWalletModal, setChainId } from "../redux/slices/walletSlice";
import { useConnection, useSwitchChain } from "wagmi";
import {
  PUBLIC_SALE_CHAIN_ID,
  PUBLIC_SALE_CHAIN_NAME,
  PUBLIC_SALE_CHAIN_LOGO,
} from "../utils/publicSaleApi";
import { toast } from "../utils/toast";
import Countdown from "react-countdown";
import { usePublicSaleWhitelist } from "../hooks/usePublicSaleWhitelist";
import { usePrivateSale } from "../hooks/usePrivateSale";
import { useSonarPublicSalePurchase } from "../hooks/useSonarPublicSalePurchase";
import { usePublicSale } from "../hooks/usePublicSale";
import { useAuth } from "../hooks/useAuth";
import {
  CHAIN_EXPLORERS,
  CHAIN_LOGOS,
  TOKEN_LOGOS,
} from "../constants/privateSaleContract";
import binanceLaptop from "../assets/binanceLaptop.png";
import { AlloxSaleTermsModal } from "../components/AlloxSaleTermsModal";
import {
  SonarStatusInline,
  SonarNotConfiguredNotice,
  describeSonarEntity,
  useSonarPublicSaleAccess,
} from "../components/SonarPublicSaleGate";
import { getSonarHomeUrl } from "../config/sonar";
import esmaLogo from "../assets/ESMALogo.png";

const renderer = ({ days, hours, minutes, seconds, completed }) => {
  if (completed) {
    return (
      <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-green-50 border border-green-200 text-green-700 font-bold">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        Commitments are now open
      </div>
    );
  }
  return (
    <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
      {/* Days */}
      <div className="glass-card-desktop p-0 md:p-6 group hover:scale-105 transition-all duration-300 hover:shadow-2xl">
        <div className="text-3xl md:text-5xl lg:text-5xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 md:mb-4">
          {days >= 10 ? days : `0${days}`}
        </div>
        <div className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider">
          Days
        </div>
      </div>

      {/* Hours */}
      <div className="glass-card-desktop p-0 md:p-6 group hover:scale-105 transition-all duration-300 hover:shadow-2xl">
        <div className="text-3xl md:text-5xl lg:text-5xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 md:mb-4">
          {hours >= 10 ? hours : `0${hours}`}
        </div>
        <div className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider">
          Hours
        </div>
      </div>

      {/* Minutes */}
      <div className="glass-card-desktop p-0 md:p-6 group hover:scale-105 transition-all duration-300 hover:shadow-2xl">
        <div className="text-3xl md:text-5xl lg:text-5xl font-bold bg-gradient-to-br from-pink-600 to-orange-600 bg-clip-text text-transparent mb-2 md:mb-4">
          {minutes >= 10 ? minutes : `0${minutes}`}
        </div>
        <div className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider">
          Minutes
        </div>
      </div>

      {/* Seconds */}
      <div className="glass-card-desktop p-0 md:p-6 group hover:scale-105 transition-all duration-300 hover:shadow-2xl">
        <div className="text-3xl md:text-5xl lg:text-5xl font-bold bg-gradient-to-br from-orange-600 to-red-600 bg-clip-text text-transparent mb-2 md:mb-4">
          {seconds >= 10 ? seconds : `0${seconds}`}
        </div>
        <div className="text-xs md:text-sm font-medium text-gray-600 uppercase tracking-wider">
          Seconds
        </div>
      </div>
    </div>
  );
};

const WHITELIST_STEPS = [
  { title: "Connect wallet", desc: "Link the wallet you'll buy with." },
  { title: "Verify & register", desc: "Complete KYC and reserve your amount." },
  { title: "Commit at launch", desc: "Buy ALLOX when commitments open." },
];

const WhitelistSteps = ({ current }) => (
  <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mb-8 text-left">
    {WHITELIST_STEPS.map((s, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <li
          key={s.title}
          className={`flex items-start gap-3 rounded-xl border px-3 py-3 ${
            active
              ? "border-black bg-white shadow-sm"
              : "border-gray-200 bg-white/50"
          }`}
        >
          <span
            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              done
                ? "bg-green-500 text-white"
                : active
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-500"
            }`}
          >
            {done ? "✓" : i + 1}
          </span>
          <span>
            <span className="block text-sm font-semibold text-gray-900">
              {s.title}
            </span>
            <span className="block text-xs text-gray-500">{s.desc}</span>
          </span>
        </li>
      );
    })}
  </ol>
);

const partners = [
  { name: "BNB Chain", icon: "bnbChain.svg" },
  { name: "Base", icon: "base.svg" },
  { name: "Binance Wallet", icon: "binanceWallet.svg" },
  { name: "TrustWallet", icon: "trustWallet.svg" },
  { name: "Gate Wallet", icon: "gateWallet.svg" },
  { name: "Zerra Ventures", icon: "zerraVentures.svg" },
  { name: "XPIN Network", icon: "xpinNetwork.svg" },
  { name: "SWFT BLOCKCHAIN", icon: "swftBlockchain.svg" },
  { name: "Bridgers", icon: "bridgers.svg" },
  { name: "OKX Wallet", icon: "okxWallet.svg" },
  { name: "PancakeSwap", icon: "pancakeSwap.svg" },
  { name: "Simplicity Group", icon: "simplicityGroup.svg" },
  { name: "ChainGPT", icon: "chainGpt.svg" },
  { name: "Oortech", icon: "oortech.svg" },
  { name: "iMe", icon: "iMe.svg" },
  { name: "MoonWhale", icon: "moonWhale.svg" },
  { name: "World Mobile", icon: "worldMobile.svg" },
  { name: "World of Dypians", icon: "wod.svg" },
  { name: "Mansory", icon: "mansory.png" },
  { name: "4AI", icon: "4ai.png" },
  { name: "Syndicate", icon: "syndicate.png" },
  { name: "Gate DEX", icon: "gate.svg" },
  { name: "Aspecta", icon: "aspecta.png" },
  { name: "Sonar by Echo", icon: "echo.png" },
];

// const SALE_DATE = new Date("2026-05-31T23:59:59Z");
const PRIVATE_ALLOC_DATA = [
  {
    name: "Community",
    pct: 35,
    tge: "5%",
    cliff: "None",
    vesting: "48 mo. linear",
    color: "#818cf8",
  },
  {
    name: "Ecosystem",
    pct: 30,
    tge: "5%",
    cliff: "12 mo.",
    vesting: "24 mo. linear",
    color: "#22d3ee",
  },
  {
    name: "Investors",
    pct: 12,
    tge: "0%",
    cliff: "12 mo.",
    vesting: "24 mo. linear",
    color: "#fb923c",
  },
  {
    name: "Team",
    pct: 12,
    tge: "0%",
    cliff: "12 mo.",
    vesting: "36 mo. linear",
    color: "#e879f9",
  },
  {
    name: "Liquidity",
    pct: 5,
    tge: "100%",
    cliff: "None",
    vesting: "N/A",
    color: "#4ade80",
  },
  {
    name: "Private Round",
    pct: 3,
    tge: "100%",
    cliff: "None",
    vesting: "N/A",
    color: "#facc15",
  },
  {
    name: "Public Round",
    pct: 3,
    tge: "100%",
    cliff: "None",
    vesting: "N/A",
    color: "#f97316",
  },
];

const ALLOC_DATA = [
  {
    name: "Community",
    pct: 35,
    tge: "5%",
    cliff: "None",
    vesting: "48 mo. linear",
    color: "#818cf8",
  },
  {
    name: "Ecosystem",
    pct: 30,
    tge: "5%",
    cliff: "12 mo.",
    vesting: "24 mo. linear",
    color: "#22d3ee",
  },
  {
    name: "Investors",
    pct: 12,
    tge: "0%",
    cliff: "12 mo.",
    vesting: "24 mo. linear",
    color: "#fb923c",
  },
  {
    name: "Team",
    pct: 13,
    tge: "0%",
    cliff: "12 mo.",
    vesting: "36 mo. linear",
    color: "#e879f9",
  },
  {
    name: "Liquidity",
    pct: 5,
    tge: "100%",
    cliff: "None",
    vesting: "N/A",
    color: "#4ade80",
  },
  {
    name: "Community Round",
    pct: 5,
    tge: "100%",
    cliff: "None",
    vesting: "N/A",
    color: "#facc15",
  },
];

const TIERS = [
  {
    label: "Tier 1",
    range: "$500 – $2.5k",
    minAmount: 500,
    bonusNum: 5,
    price: "$0.0429",
  },
  {
    label: "Tier 2",
    range: "$2.5k – $10k",
    minAmount: 2500,
    bonusNum: 10,
    price: "$0.0409",
  },
  {
    label: "Tier 3",
    range: "$10k – $50k",
    minAmount: 10000,
    bonusNum: 15,
    price: "$0.0391",
  },
  {
    label: "Tier 4",
    range: "$50k – $100k",
    minAmount: 50000,
    bonusNum: 20,
    price: "$0.0375",
  },
  {
    label: "Tier 5",
    range: "$100k+",
    minAmount: 100000,
    bonusNum: 25,
    price: "$0.0360",
  },
];

const LIVE_PLANS = [
  {
    id: "silver",
    name: "Silver",
    discount: 0,
    fdv: 65_000_000,
    price: 0.065,
    tgePct: 100,
    cliff: "None",
    vesting: "No vesting",
  },
  {
    id: "gold",
    name: "Gold",
    discount: 20,
    fdv: 52_000_000,
    price: 0.052,
    tgePct: 20,
    cliff: "None",
    vesting: "12 months, linear",
  },
  {
    id: "platinum",
    name: "Platinum",
    discount: 40,
    fdv: 39_000_000,
    price: 0.039,
    tgePct: 0,
    cliff: "3 months",
    vesting: "12 months, linear",
    premium: true,
  },
];

const PRIVATE_PLANS = [
  {
    id: "silver",
    name: "Silver",
    discount: 0,
    fdv: 50_000_000,
    price: 0.05,
    tgePct: 100,
    cliff: "None",
    vesting: "No vesting",
  },
  {
    id: "gold",
    name: "Gold",
    discount: 20,
    fdv: 40_000_000,
    price: 0.04,
    tgePct: 20,
    cliff: "None",
    vesting: "12 months, linear",
  },
  {
    id: "platinum",
    name: "Platinum",
    discount: 40,
    fdv: 30_000_000,
    price: 0.03,
    tgePct: 0,
    cliff: "3 months",
    vesting: "12 months, linear",
    premium: true,
  },
];

const SALE_KIND_META = {
  private: {
    id: "private",
    label: "Private Sale",
    status: "Live Now",
    statusTone: "live",
    fdv: "$50M",
    raiseTarget: "$2,000,000",
    lines: [
      "An exclusive private round for loyal users.",
      "Limited allocation, early pricing.",
    ],
    bg: "https://cdn.allox.ai/allox/publicSale/privateSaleBg.png",
    logo: "https://cdn.allox.ai/allox/publicSale/alloxAiLogo.svg",
    logoAlt: "AlloX",
  },
  public: {
    id: "public",
    label: "Public Sale",
    status: "Live Now",
    statusTone: "live",
    fdv: "$65M",
    lines: ["Open to KYC'd users from eligible jurisdictions."],
    extras: [
      {
        title: "Public Round",
        value: "$1,000,000",
      },
      {
        title: "Network",
        value: "Ethereum • USDC • USDT",
      },
    ],
    mica: true,
    bg: "https://cdn.allox.ai/allox/publicSale/publicSaleBg.png",
    logo: "https://cdn.allox.ai/allox/publicSale/sonarLogo.svg",
    logoAlt: "SONAR by ECHO",
  },
};

const UTILITIES = [
  {
    icon: TrendingUp,
    title: "Staking",
    desc: "Earn yield from ALLOX staking pools.",
  },
  {
    icon: Users,
    title: "Governance",
    desc: "Vote on narrative categories, risk parameters, and platform upgrades.",
  },
  {
    icon: Tag,
    title: "Fee Discounts",
    desc: "Receive discounts on trading, portfolio creation, and transaction fees.",
  },
  {
    icon: Zap,
    title: "Premium Feature Access",
    desc: "Unlock advanced AI features, priority allocations, and exclusive campaigns.",
  },
];

const CREDIBILITY = [
  "Audited by CertiK, one of the industry's leading blockchain security firms, with the audit badge displayed directly on the platform",
  "AI continuously scans markets and creates your portfolio automatically",
  "Choose your risk level (High, Mid, or Low market cap) and get a diversified basket built around it",
  "Portfolios track live narratives, so allocations shift as market themes shift, not just prices",
  "Fully on-chain and non-custodial: assets stay in your wallet, AlloX never takes custody",
  "Live across 12+ wallets and 3 chains (BNB Chain, Base, Ethereum), so users aren't locked into one ecosystem",
];

const DEX_VOLUME = [
  { week: "24 May", value: 1000000, label: "$1M" },
  { week: "31 May", value: 3100000, label: "$3.1M" },
  { week: "7 Jun", value: 4300000, label: "$4.3M" },
  { week: "14 Jun", value: 5700000, label: "$5.7M" },
  { week: "21 Jun", value: 6400000, label: "$6.4M" },
  { week: "28 Jun", value: 7100000, label: "$7.1M" },
  { week: "5 Jul", value: 9100000, label: "$9.1M" },
  { week: "12 Jul", value: 12400000, label: "$12.4M" },
  { week: "19 Jul", value: 15500000, label: "$15.5M" },
  { week: "26 Jul", value: 44700000, label: "$44.7M" },
  { week: "2 Aug", value: 58200000, label: "$58.2M" },
  { week: "9 Aug", value: 67300000, label: "$67.3M" },
  { week: "18 Aug", value: 75300000, label: "$75.3M" },
  { week: "01 Sep", value: 92300000, label: "$92.3M" },
  { week: "15 Sep", value: 98600000, label: "$98.6M" },
  { week: "29 Sep", value: 121150000, label: "$121.15M" },
  { week: "05 Oct", value: 149300000, label: "$149.3M" },
  { week: "09 Oct", value: 162400000, label: "$162.4M" },
  { week: "12 Oct", value: 171400000, label: "$171.4M" },
];

const PUBLIC_SALE_STEPS = [
  {
    n: "01",
    title: "Create Your Account",
    desc: "Sign up through Sonar and complete onboarding to prepare for participation.",
    icon: UserPlus,
  },
  {
    n: "02",
    title: "Connect Your Wallet",
    desc: "Connect your wallet. This wallet is used for your contribution and token allocation.",
    icon: Wallet,
  },
  {
    n: "03",
    title: "Complete verification",
    desc: "Pass Sonar's identity and eligibility checks. Once approved, you'll be authorized to join the ALLOX sale.",
    icon: Shield,
  },
  {
    n: "04",
    title: "Participate in the Sale",
    desc: "Select the amount you wish to contribute during the active sale window.",
    icon: DollarSign,
  },
  {
    n: "05",
    title: "Receive Your ALLOX Tokens",
    desc: "Your allocated tokens will be distributed at the Token Generation Event (TGE).",
    icon: Gift,
  },
];

const PRIVATE_SALE_STEPS = [
  {
    n: "01",
    title: "Sign In",
    desc: "Sign in with your AlloX account to access the private sale.",
    icon: Award,
  },
  {
    n: "02",
    title: "Connect Your Wallet",
    desc: "Connect the wallet you'll contribute from and receive your allocation on.",
    icon: Wallet,
  },
  {
    n: "03",
    title: "Join the Private Sale",
    desc: "Choose a private plan (0% / 20% / 40% discount), then commit with USDC or USDT.",
    icon: DollarSign,
  },
  {
    n: "04",
    title: "Receive Your ALLOX Tokens",
    desc: "Tokens unlock at TGE per your private plan, full unlock, partial TGE, or cliff + vesting.",
    icon: Gift,
  },
];

const SALE_MOMENTUM_HIGHLIGHTS = [
  {
    value: "$0.7M+",
    label: "Revenue",
    detail: "Platform revenue generated to date",
    accent: "#818cf8",
  },
  {
    value: "2.6M+",
    label: "Registered Wallets",
    detail: "Wallets and participants across AlloX",
    accent: "#2dd4bf",
  },
  {
    value: "$171M",
    label: "Cumulative DEX Aggregator Volume",
    detail: "Cumulative trading & on-chain volume",
    accent: "#fbbf24",
  },
  {
    value: "{onChainPortfolios}",
    label: "On-chain Portfolios",
    detail: "On-chain portfolios created on AlloX",
    accent: "#fb7185",
  },
];

const SALE_MOMENTUM_SUPPORT = [
  { value: "12+", label: "Wallets supported" },
  { value: "3", label: "Chains live" },
  { value: "CertiK", label: "Security audited" },
  { value: "Binance", label: "Wallet campaign" },
];

const KEY_MILESTONES = [
  {
    title: "Project Launch",
    metric: "Feb 23, 2026",
    desc: "AlloX soft-launched, opening the platform to its first wave of users and on-chain activity.",
    status: "completed",
  },
  {
    title: "First Revenue",
    metric: "Apr 15, 2026",
    desc: "AlloX's first on-chain revenue-generating product went live, kicking off the platform's on-chain track record.",
    status: "completed",
  },
  {
    title: "Binance Wallet Booster",
    metric: "1 of 20",
    desc: "Selected from 650+ Binance Alpha tokens to run an exclusive Booster campaign under Binance's Booster format.",
    status: "completed",
  },
  {
    title: "Funding Round Closed",
    metric: "Funded",
    desc: "Closed with Zerra Ventures, one of the largest venture capital firms in Turkey.",
    status: "completed",
  },
  {
    title: "$171M Volume Reached",
    metric: "$171M",
    desc: "Crossed $171M in cumulative DEX Aggregator volume across {onChainPortfolios} on-chain portfolios.",
    status: "completed",
  },
  {
    title: "Wallets Registered",
    metric: "2.6M+",
    desc: "Registered wallets crossed 2.6 million, including 86.29K KYC-verified users from Binance.",
    status: "completed",
  },
  {
    title: "Public Token Sale",
    metric: "FDV $65M",
    desc: "The AlloX Public Token Sale. Subscribe to a stake in the AI-driven capital allocation layer for modern crypto markets.",
    status: "active",
  },
];

const TX_EXPLORERS = {
  Base: "https://basescan.org/tx/",
  Ethereum: "https://etherscan.io/tx/",
  "BNB Chain": "https://bscscan.com/tx/",
  BNB: "https://bscscan.com/tx/",
};

function shortenTxHash(hash) {
  if (!hash || hash.length < 12) return hash || "—";
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

// Public round target shown on the live stats bar (USD).
const PUBLIC_ROUND_TARGET_USD = 1_000_000;

// Whitelist allocation limits (USD)
const WL_MIN_USD = 100;
const WL_MAX_USD = 200_000;

// Keep only a positive decimal (max 2 fraction digits) and clamp it to the max.
const sanitizeUsdInput = (raw, max) => {
  let v = raw.replace(/,/g, "").replace(/[^\d.]/g, "");
  const dot = v.indexOf(".");
  if (dot !== -1) {
    v =
      v.slice(0, dot + 1) +
      v
        .slice(dot + 1)
        .replace(/\./g, "")
        .slice(0, 2);
  }
  v = v.replace(/^0+(?=\d)/, "");
  if (v !== "" && v !== "." && parseFloat(v) > max) return String(max);
  return v;
};

const REF_BIND_ERROR_MESSAGES = {
  SELF_REFERRAL: "You can't use your own referral code.",
  ALREADY_INVESTED:
    "This wallet had already invested, so the referral code wasn't applied.",
  BOUND_TO_ANOTHER_CODE:
    "This wallet is already linked to another referral code.",
  UNKNOWN_CODE: "This referral code doesn't exist.",
};

const shortWallet = (wallet) =>
  wallet && wallet.length > 12
    ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}`
    : wallet || "—";

function pad(n) {
  return String(n).padStart(2, "0");
}

function useCountdown(target) {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const start = Date.now();
    const step = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      setVal(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return val;
}

function formatCompactNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";

  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  const format = (scaled, suffix) => {
    const rounded = Math.round(scaled * 10) / 10;
    const normalized = Number.isInteger(rounded)
      ? String(rounded)
      : String(rounded).replace(/\.0$/, "");
    return `${sign}${normalized}${suffix}`;
  };

  if (abs >= 1_000_000_000) return format(abs / 1_000_000_000, "B");
  if (abs >= 1_000_000) return format(abs / 1_000_000, "M");
  if (abs >= 1_000) return format(abs / 1_000, "K");

  return `${sign}${abs.toLocaleString()}`;
}

const SALE_DATE = new Date("2026-10-12T11:59:59Z");
const LIVE_SALE_END = new Date("2026-09-01T23:59:59Z");
const LIVE_TOTAL_COMMITTED = 1_503_842;
const LIVE_ASSET_LOGOS = {
  USDC: "https://cdn.allox.ai/allox/tokens/usdc.svg",
  USDT: "https://cdn.allox.ai/allox/tokens/usdt.svg",
};
const LIVE_ASSETS = ["USDC", "USDT"];

const liveCountdownRenderer = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
}) => {
  if (completed) {
    return (
      <span className="text-lg font-bold text-gray-900 tabular-nums">
        Sale ended
      </span>
    );
  }
  const parts = [
    { v: days, l: "d" },
    { v: hours, l: "h" },
    { v: minutes, l: "m" },
    // { v: seconds, l: "s" },
  ];
  return (
    <div className="flex items-baseline gap-1.5 tabular-nums">
      {parts.map((p) => (
        <span key={p.l} className="inline-flex items-baseline gap-0.5">
          <span className="text-lg md:text-2xl font-bold text-gray-900">
            {p.v}
          </span>
          <span className="text-xs font-semibold text-gray-400">{p.l}</span>
        </span>
      ))}
    </div>
  );
};

export function PublicSaleSonarPage() {
  const [saleState, setSaleState] = useState("live");
  const [wlStep, setWlStep] = useState("connect");
  const [wlAmount, setWlAmount] = useState("");
  const [email, setEmail] = useState("");
  const [selectedEntity, setSelectedEntity] = useState(null);
  // Entity dropdown in the Sonar header pill. The menu is portaled with fixed
  // positioning because the sale banner clips overflow.
  const [entityMenuPos, setEntityMenuPos] = useState(null);
  const entityTriggerRef = useRef(null);
  const entityMenuOpen = entityMenuPos !== null;
  const toggleEntityMenu = () => {
    if (entityMenuOpen) {
      setEntityMenuPos(null);
      return;
    }
    const rect = entityTriggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setEntityMenuPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  };
  useEffect(() => {
    if (!entityMenuOpen) return;
    const close = () => setEntityMenuPos(null);
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [entityMenuOpen]);
  const [successCountdown, setSuccessCountdown] = useState(5);
  const [liveAmount, setLiveAmount] = useState("");
  const [liveSaleKind, setLiveSaleKind] = useState("public");
  const [livePlanId, setLivePlanId] = useState("platinum");
  const [liveAsset, setLiveAsset] = useState("USDC");
  const [liveAssetOpen, setLiveAssetOpen] = useState(false);
  const [liveChainOpen, setLiveChainOpen] = useState(false);
  // const [liveTermsAccepted, setLiveTermsAccepted] = useState(false);
  const [liveTermsOpen, setLiveTermsOpen] = useState(false);
  const [tiersOpen, setTiersOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [refTab, setRefTab] = useState("all");
  const [tiersExpanded, setTiersExpanded] = useState(true);

  const [data, setData] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [registeredInfoOpen, setRegisteredInfoOpen] = useState(false);
  const [investHistoryOpen, setInvestHistoryOpen] = useState(false);
  const balancePopupRef = useRef(null);
  const registeredInfoPopupRef = useRef(null);
  const liveAssetMenuRef = useRef(null);
  const liveChainMenuRef = useRef(null);
  const investHistoryPopupRef = useRef(null);

  useEffect(() => {
    if (
      !breakdownOpen &&
      !registeredInfoOpen &&
      !liveAssetOpen &&
      !liveChainOpen &&
      !investHistoryOpen
    )
      return;
    const onPointerDown = (e) => {
      if (
        breakdownOpen &&
        balancePopupRef.current &&
        !balancePopupRef.current.contains(e.target)
      ) {
        setBreakdownOpen(false);
      }
      if (
        registeredInfoOpen &&
        registeredInfoPopupRef.current &&
        !registeredInfoPopupRef.current.contains(e.target)
      ) {
        setRegisteredInfoOpen(false);
      }
      if (
        liveAssetOpen &&
        liveAssetMenuRef.current &&
        !liveAssetMenuRef.current.contains(e.target)
      ) {
        setLiveAssetOpen(false);
      }
      if (
        liveChainOpen &&
        liveChainMenuRef.current &&
        !liveChainMenuRef.current.contains(e.target)
      ) {
        setLiveChainOpen(false);
      }
      if (
        investHistoryOpen &&
        investHistoryPopupRef.current &&
        !investHistoryPopupRef.current.contains(e.target)
      ) {
        setInvestHistoryOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [
    breakdownOpen,
    registeredInfoOpen,
    liveAssetOpen,
    liveChainOpen,
    investHistoryOpen,
  ]);

  const dispatch = useDispatch();
  const isConnected = useSelector((state) => state.wallet.isConnected);
  const walletAddress = useSelector((state) => state.wallet.address);
  const walletType = useSelector((state) => state.wallet.walletType);
  const chainId = useSelector((state) => state.wallet.chainId);
  const { chainId: wagmiChainId } = useConnection();
  const switchChain = useSwitchChain();
  const isSolanaWallet = walletType === "solana";
  const currentEvmChainId = isSolanaWallet ? null : (wagmiChainId ?? chainId);
  const isOnSaleChain = currentEvmChainId === PUBLIC_SALE_CHAIN_ID;
  const needsSaleChainSwitch = isConnected && !isSolanaWallet && !isOnSaleChain;

  const switchToSaleChain = async () => {
    if (!switchChain.mutateAsync) {
      toast.error(
        "Unable to switch chain. Reconnect your wallet and try again.",
      );
      return;
    }
    try {
      await switchChain.mutateAsync({ chainId: PUBLIC_SALE_CHAIN_ID });
      dispatch(setChainId(PUBLIC_SALE_CHAIN_ID));
    } catch (err) {
      console.error(`Switch to ${PUBLIC_SALE_CHAIN_NAME}:`, err);
      toast.error(
        `Failed to switch to ${PUBLIC_SALE_CHAIN_NAME}. Confirm the network switch in your wallet.`,
      );
    }
  };

  const {
    status: wlStatus,
    statusLoading: wlStatusLoading,
    submit: submitWhitelist,
    linkSonar: linkWhitelistSonar,
    refresh: refreshWhitelist,
    submitting: wlSubmitting,
    retrying: wlRetrying,
  } = usePublicSaleWhitelist();
  const privateSale = usePrivateSale({ enabled: liveSaleKind === "private" });
  const { isAuthenticated, ensureAuthenticated } = useAuth();
  const sonar = useSonarPublicSaleAccess(
    walletAddress,
    selectedEntity?.EntityID,
    saleState,
  );

  const needsSonarConnect =
    liveSaleKind === "public" &&
    isConnected &&
    sonar.configured &&
    sonar.ready &&
    !sonar.authenticated;
  const sonarHasError =
    sonar.authenticated &&
    (Boolean(sonar.entitiesError) || sonar.status?.tone === "red");
  // console.log("wlStatus", wlStatus);
  const saleOpen = wlStatus ? wlStatus.open !== false : true;
  const minUsd = Number(wlStatus?.minUsd) || WL_MIN_USD;
  const maxUsd = Number(wlStatus?.maxUsd) || WL_MAX_USD;
  const walletBalanceUsd = wlStatus?.walletBalanceUsd ?? null;
  const balanceBreakdown = Array.isArray(wlStatus?.balanceBreakdown)
    ? wlStatus.balanceBreakdown
    : [];
  const isRegistered = wlStatus?.registered === true;
  const registration = wlStatus?.registration ?? null;

  // The wallet the backend actually read the balance for. If it differs from
  // the connected wallet, the user is signed in as a different account than the
  // one holding the funds, so we surface a "sign in with that wallet" notice
  // instead of a confusing $0/low balance.
  const checkedAddress = wlStatus?.checkedAddress ?? null;
  const balanceAddressMismatch =
    checkedAddress != null &&
    walletAddress != null &&
    checkedAddress.toLowerCase() !== walletAddress.toLowerCase();
  // A chain read failed on the backend: walletBalanceUsd is partial/unreliable,
  // so we must not render it as a real $0 — show a retry instead.
  const balanceIncomplete = wlStatus?.balanceIncomplete === true;

  const getData = async () => {
    try {
      const seasonRes = await fetch(`https://api.allox.ai/season1/stats`).then(
        (r) => r.json(),
      );
      setData(seasonRes);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);
  // Live count for the "{onChainPortfolios}" placeholder in the stat card and
  // milestone copy.
  const onChainPortfoliosText =
    data?.stats?.onChainPortfoliosCreated != null
      ? Number(data.stats.onChainPortfoliosCreated).toLocaleString("en-US")
      : "—";
  // useEffect(() => {
  //   if (liveSaleKind === "private") {
  //     setSaleState("whitelist");
  //   }
  // }, [liveSaleKind]);

  useEffect(() => {
    if (!isConnected) {
      setWlStep("connect");
      return;
    }
    // Public sale: wallet is enough to view whitelist details
    // if (liveSaleKind === "public" && wlStep === "connect") {
    //   setWlStep("form");
    // }
  }, [isConnected, liveSaleKind, wlStep]);

  // Public sale backend: plans, stats, my position and the referral program.
  const publicSale = usePublicSale();
  const refCode = publicSale.referral?.refCode ?? null;
  const refLink = publicSale.referralLink;
  // Referred wallets plus form-only leads, newest first. A lead whose wallet is
  // already referred is the same person. Anyone with money in is "invested";
  // everyone else (including form leads, whose amount is only a pledge) is
  // "invited".
  const referredList = Array.isArray(publicSale.referral?.referred)
    ? publicSale.referral.referred
    : [];
  const referredWallets = new Set(referredList.map((r) => r.wallet));
  const referredInvestors = [
    ...referredList.map((r) => ({
      wallet: r.wallet,
      investedUsd: Number(r.investedUsd) || 0,
      rewardUsd: Number(r.commissionUsd) || 0,
      at: r.at,
    })),
    ...(Array.isArray(publicSale.referral?.leads)
      ? publicSale.referral.leads
          .filter((l) => !referredWallets.has(l.wallet))
          .map((l) => ({
            wallet: l.wallet,
            investedUsd: 0,
            rewardUsd: 0,
            at: l.at,
          }))
      : []),
  ]
    .map((r) => ({ ...r, status: r.investedUsd > 0 ? "invested" : "invited" }))
    .sort((a, b) => (Date.parse(b.at) || 0) - (Date.parse(a.at) || 0));
  const refInvestorCount = referredInvestors.filter(
    (r) => r.status === "invested",
  ).length;
  const refVolumeUsd = referredInvestors.reduce((s, r) => s + r.investedUsd, 0);
  const visibleReferrals =
    refTab === "all"
      ? referredInvestors
      : referredInvestors.filter((r) => r.status === refTab);
  const fmtRefUsd = (n) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });
  const referredByCode = publicSale.position?.referredByCode ?? null;
  const bindErrorMessage = publicSale.bindError
    ? REF_BIND_ERROR_MESSAGES[publicSale.bindError.reason] ||
      publicSale.bindError.message
    : null;
  const isOwnLandingCode =
    publicSale.bindError?.reason === "SELF_REFERRAL" ||
    (!!refCode &&
      publicSale.landingRefCode?.toUpperCase() === refCode.toUpperCase());

  // Whitelist flow
  const wlNum = parseFloat(wlAmount) || 0;
  const insufficientBalance =
    walletBalanceUsd != null && wlNum > walletBalanceUsd;
  const belowMin = wlAmount !== "" && wlNum < minUsd;
  const aboveMax = wlNum > maxUsd;
  // Whitelist and purchase require the selected Sonar entity to have
  // completed KYC and be eligible for this sale.
  const sonarEligible = Boolean(sonar.status?.eligible);
  const sonarWhitelistReady =
    !sonar.configured ||
    (sonar.authenticated && !sonar.entitiesLoading && sonarEligible);
  // Short reason shown on blocked CTAs when Sonar is connected but the
  // entity can't participate yet.
  const sonarBlockedLabel =
    sonar.configured &&
    sonar.authenticated &&
    !sonar.entitiesLoading &&
    !sonarEligible
      ? sonar.entitiesError
        ? "Sonar status unavailable"
        : sonar.status?.buttonLabel || "Not eligible to join"
      : null;
  // The blocked CTA links out when the next step happens on Sonar
  // (start / finish / retry verification, or create an entity).
  const sonarNeedsSonarStep =
    Boolean(sonarBlockedLabel) &&
    !sonar.entitiesError &&
    Boolean(sonar.status?.needsSetup);
  const openSonar = () =>
    window.open(getSonarHomeUrl(), "_blank", "noopener,noreferrer");
  const wlValid =
    saleOpen &&
    !wlSubmitting &&
    sonarWhitelistReady &&
    isConnected &&
    isOnSaleChain &&
    wlNum >= minUsd &&
    !aboveMax &&
    !insufficientBalance;

  // Prefill the form with the existing registration so "change amount"
  // starts from the current allocation.
  useEffect(() => {
    if (!registration) return;
    setWlAmount((prev) =>
      prev === ""
        ? sanitizeUsdInput(String(registration.allocationUsd ?? ""), maxUsd)
        : prev,
    );
    setEmail((prev) => (prev === "" ? (registration.email ?? "") : prev));
  }, [registration]);

  // Sonar entity to attach to the whitelist registration (null until the
  // user connects Sonar and their entity loads).
  const sonarEntityId = sonar.authenticated
    ? (sonar.activeEntity?.EntityID ?? null)
    : null;

  // Registered before connecting Sonar (or before this field existed): link
  // the entity to the existing registration once it is available. Tracked per
  // entity so a failure is not retried in a loop.
  const sonarLinkAttemptRef = useRef(null);
  useEffect(() => {
    if (!isRegistered || !sonarEntityId || wlSubmitting) return;
    if (registration?.sonarEntityId) return;
    if (sonarLinkAttemptRef.current === sonarEntityId) return;
    sonarLinkAttemptRef.current = sonarEntityId;
    linkWhitelistSonar(sonarEntityId).catch((err) => {
      // 404 → no registration yet; the next /whitelist POST carries the ID.
      if (err?.status !== 404) {
        console.error("Failed to link Sonar to whitelist registration:", err);
      }
    });
  }, [
    isRegistered,
    registration?.sonarEntityId,
    sonarEntityId,
    wlSubmitting,
    linkWhitelistSonar,
  ]);

  const handleJoin = async () => {
    if (needsSaleChainSwitch) {
      await switchToSaleChain();
      return;
    }
    if (sonar.configured && !sonar.authenticated) {
      sonar.connectSonar();
      return;
    }
    if (!wlValid) return;
    setSubmitError(null);
    try {
      await submitWhitelist({
        allocationUsd: wlNum,
        email,
        sonarEntityId: sonarEntityId ?? undefined,
      });
      setWlStep("success");
      setSuccessCountdown(5);
    } catch (err) {
      setSubmitError({
        status: err?.status ?? null,
        message:
          err?.message ||
          "Something went wrong while joining the whitelist. Please try again.",
      });
    }
  };

  // Lowering only helps when the balance still covers the minimum allocation.
  const canLowerToBalance =
    walletBalanceUsd != null && Math.floor(walletBalanceUsd) >= minUsd;

  const lowerToBalance = () => {
    if (!canLowerToBalance) return;
    const lowered = Math.min(Math.floor(walletBalanceUsd), maxUsd);
    setWlAmount(lowered > 0 ? String(lowered) : "");
    setSubmitError(null);
  };

  useEffect(() => {
    if (wlStep !== "success") return;
    if (successCountdown <= 0) {
      setTimeout(() => {
        setWlStep("form");
      }, 300);
      return;
    }
    const id = setTimeout(() => setSuccessCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [wlStep, successCountdown]);

  // Live purchase
  // Sonar purchase flow for the public live sale (Ethereum SettlementSale).
  // Report each bid to the backend as soon as the wallet confirms it.
  const { recordCommit } = publicSale;
  const handleBidSubmitted = useCallback(
    (txHash, { tierId }) => recordCommit({ txHash, tierId }),
    [recordCommit],
  );
  const publicPurchase = useSonarPublicSalePurchase({
    onBidSubmitted: handleBidSubmitted,
    entity: sonar.authenticated ? sonar.activeEntity : null,
    walletAddress,
    enabled:
      liveSaleKind === "public" &&
      saleState === "live" &&
      isConnected &&
      !isSolanaWallet,
    currentChainId: currentEvmChainId,
    switchToSaleChain,
  });
  const isPrivateSale = liveSaleKind === "private";
  // Unlock terms (TGE %, cliff, vesting) come from LIVE_PLANS; the API only
  // has vague labels like "Cliff + vesting".
  const publicPlans =
    publicSale.plans.length > 0
      ? publicSale.plans.map((p) => {
          const local = LIVE_PLANS.find((l) => l.id === p.id);
          return local
            ? {
                ...p,
                tgePct: local.tgePct,
                cliff: local.cliff,
                vesting: local.vesting,
              }
            : p;
        })
      : LIVE_PLANS;
  // Biggest discount first: Platinum, Gold, Silver.
  const activePlans = [
    ...(isPrivateSale ? privateSale.plans : publicPlans),
  ].sort((a, b) => b.discount - a.discount);
  const activeSaleSteps = isPrivateSale
    ? PRIVATE_SALE_STEPS
    : PUBLIC_SALE_STEPS;
  const effectivePlanId = isPrivateSale
    ? privateSale.selectedPlanId
    : livePlanId;
  const livePlan =
    activePlans.find((p) => p.id === effectivePlanId) ?? activePlans[0] ?? null;

  const liveNum = isPrivateSale
    ? privateSale.amountNum
    : parseFloat(liveAmount) || 0;
  const liveTokensRaw = isPrivateSale
    ? privateSale.allocationPreview
    : livePlan?.price && liveNum
      ? liveNum / livePlan.price
      : 0;
  const privatePositionContributions = Array.isArray(
    privateSale.position?.contributions,
  )
    ? [...privateSale.position.contributions].sort((a, b) => {
        const ta = Date.parse(a?.at || 0) || 0;
        const tb = Date.parse(b?.at || 0) || 0;
        return tb - ta;
      })
    : [];
  const selectedTierKey = String(
    livePlan?.key || livePlan?.id || "",
  ).toUpperCase();
  const privateSelectedTierPosition =
    isPrivateSale && selectedTierKey
      ? privateSale.position?.perTier?.[selectedTierKey] ||
        privateSale.position?.perTier?.[selectedTierKey.toLowerCase()] ||
        null
      : null;
  const privateTierAllocation =
    Number(privateSelectedTierPosition?.allocationTokens) || 0;
  const privateTierUsd =
    Number(privateSelectedTierPosition?.contributedUsd) || 0;
  // Confirmed public position from GET /public-sale/position; falls back to
  // the on-chain commitment priced at the selected plan while it loads.
  const publicPosition = publicSale.position;
  const publicCommittedUsd = isPrivateSale
    ? 0
    : publicPosition?.commitmentUsd != null
      ? Number(publicPosition.commitmentUsd) || 0
      : Number(publicPurchase.committedTotal) || 0;
  const publicPositionTokens =
    publicPosition?.allocationTokens != null
      ? Number(publicPosition.allocationTokens) || 0
      : livePlan?.price
        ? publicCommittedUsd / livePlan.price
        : 0;
  const positionUsd = isPrivateSale ? privateTierUsd : publicCommittedUsd;
  const positionTokens = isPrivateSale
    ? privateTierAllocation
    : publicPositionTokens;
  const hasPosition = positionTokens > 0 || positionUsd > 0;
  // Prefer live entry preview; fall back to the confirmed position.
  const estimateTokensRaw =
    liveTokensRaw <= 0 && positionTokens > 0 ? positionTokens : liveTokensRaw;
  // Showing the confirmed public position: use the backend's TGE/locked split.
  const useApiPublicSplit =
    !isPrivateSale &&
    liveTokensRaw <= 0 &&
    publicPosition?.availableAtTgeTokens != null &&
    publicPosition?.lockedTokens != null;
  const liveTgeTokensRaw = useApiPublicSplit
    ? Number(publicPosition.availableAtTgeTokens) || 0
    : (estimateTokensRaw * (livePlan?.tgePct ?? 0)) / 100;
  const liveLockedTokensRaw = useApiPublicSplit
    ? Number(publicPosition.lockedTokens) || 0
    : estimateTokensRaw - liveTgeTokensRaw;
  const liveAllox =
    liveNum || positionTokens > 0
      ? formatCompactNumber(Math.floor(estimateTokensRaw))
      : "0";
  const liveTgeTokens = formatCompactNumber(Math.floor(liveTgeTokensRaw));
  const liveLockedTokens = formatCompactNumber(Math.floor(liveLockedTokensRaw));
  const pubPct = (320000 / 2500000) * 100;

  const switchLiveSaleKind = (kind) => {
    setLiveSaleKind(kind);
    const nextPlans = kind === "private" ? privateSale.plans : publicPlans;
    if (nextPlans.length > 0 && !nextPlans.some((p) => p.id === livePlanId)) {
      setLivePlanId(nextPlans[0].id);
    }
  };

  // Referral data needs a connected wallet and a signed-in session: open the
  // wallet modal first, then ask for the signature.
  const signInForReferral = async () => {
    if (!isConnected) {
      dispatch(setWalletModal(true));
      return;
    }
    try {
      await ensureAuthenticated();
    } catch (err) {
      toast.error(err?.message || "Sign-in failed. Please try again.");
    }
  };

  const copyRef = async () => {
    if (!isConnected || !isAuthenticated) {
      await signInForReferral();
      return;
    }
    if (!refLink) return;
    try {
      await navigator.clipboard.writeText(refLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link. Please copy it manually.");
    }
  };

  const WL_PRESETS = ["$100", "$500", "$1,000", "$5,000", "$10,000"];
  const LIVE_PRESETS = ["$100", "$500", "$1,000", "MAX"];
  const liveMinUsd = isPrivateSale
    ? privateSale.minContributionUsd
    : Number(publicSale.sale?.minCommitUsd) || WL_MIN_USD;
  const liveMaxUsd = isPrivateSale
    ? privateSale.maxContributionUsd
    : Number(publicSale.sale?.maxCommitUsd) || 200_000;
  const publicLiveSonarReady =
    !sonar.configured ||
    (sonar.authenticated && sonarEligible && !sonarHasError);

  const publicSaleBlocked =
    !isPrivateSale &&
    (publicPurchase.saleInfo?.paused ||
      publicPurchase.saleInfo?.saleUUIDMatches === false);

  const privateRoundFdvM = isPrivateSale
    ? privateSale.plans[0]?.fdv
      ? Math.round(privateSale.plans[0].fdv / 1_000_000)
      : null
    : 65;
  // Prefer the on-chain token balance read for the purchase flow; fall back to
  // the whitelist API breakdown while it loads.
  const onChainLiveBalance = publicPurchase.tokenBalance(liveAsset);
  const liveAssetBalanceUsd =
    onChainLiveBalance ??
    balanceBreakdown
      .filter(
        (row) =>
          String(row?.symbol || "").toUpperCase() ===
          String(liveAsset).toUpperCase(),
      )
      .reduce((sum, row) => sum + (Number(row?.balanceUsd) || 0), 0);
  const liveAssetBalanceKnown =
    isConnected &&
    (onChainLiveBalance != null ||
      (!wlStatusLoading && Array.isArray(wlStatus?.balanceBreakdown)));
  const liveInsufficientBalance =
    !isPrivateSale && liveAssetBalanceKnown && liveNum > liveAssetBalanceUsd;
  const liveCanSubmit = isPrivateSale
    ? privateSale.canSubmit
    : isConnected &&
      isOnSaleChain &&
      publicLiveSonarReady &&
      !publicSaleBlocked &&
      !publicPurchase.busy &&
      !liveInsufficientBalance &&
      liveNum >= liveMinUsd &&
      liveNum <= liveMaxUsd;
  const publicTransactions = Array.isArray(publicPosition?.transactions)
    ? publicPosition.transactions
    : null;
  // Backend transactions when available; otherwise the on-chain per-token
  // commitment.
  const publicInvestments = publicTransactions
    ? [...publicTransactions]
        .sort(
          (a, b) =>
            (Date.parse(b?.at || 0) || 0) - (Date.parse(a?.at || 0) || 0),
        )
        .map((tx, idx) => ({
          id: tx.txHash || `tx-${idx}`,
          date: tx.at
            ? new Date(tx.at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Committed",
          amount: Number(tx.amountUsd ?? tx.amount) || 0,
          token: String(tx.token || tx.symbol || "").toUpperCase(),
          network: PUBLIC_SALE_CHAIN_NAME,
          txHash: tx.txHash || null,
          explorerUrl: tx.explorerUrl || null,
          status: tx.status || null,
        }))
    : publicPurchase.committedByToken
        .filter((row) => row.amount > 0)
        .map((row) => ({
          id: `commit-${row.symbol}`,
          date: "Committed",
          amount: row.amount,
          token: row.symbol,
          network: PUBLIC_SALE_CHAIN_NAME,
          txHash:
            publicPurchase.lastTxHash &&
            row.symbol.toUpperCase() === liveAsset.toUpperCase()
              ? publicPurchase.lastTxHash
              : null,
        }));
  // Backend record of the bid just confirmed, for its explorer link + status.
  const lastPublicTx =
    publicPurchase.lastTxHash && publicTransactions
      ? (publicTransactions.find(
          (tx) =>
            String(tx?.txHash || "").toLowerCase() ===
            publicPurchase.lastTxHash.toLowerCase(),
        ) ?? null)
      : null;
  const PURCHASE_STEP_LABELS = {
    checking: "Checking eligibility with Sonar…",
    permit: "Getting purchase permit…",
    switching: `Switching to ${PUBLIC_SALE_CHAIN_NAME}…`,
    approving: `Approve ${liveAsset} in your wallet…`,
    committing: "Confirm the commitment in your wallet…",
    confirming: "Confirming on-chain…",
  };
  const liveMaxAmount = liveAssetBalanceKnown
    ? Math.max(0, Math.min(Math.floor(liveAssetBalanceUsd), liveMaxUsd))
    : 0;
  const privateTokenBalanceUsd = Number(privateSale.tokenBalance?.usd);
  const privateMaxAmount =
    isConnected && Number.isFinite(privateTokenBalanceUsd)
      ? Math.max(0, Math.min(Math.floor(privateTokenBalanceUsd), liveMaxUsd))
      : 0;
  const liveSteps = isPrivateSale
    ? [
        { id: "whitelist", label: "Whitelist", done: isRegistered },
        { id: "wallet", label: "Wallet", done: isConnected },
        {
          id: "eligible",
          label: "Eligible",
          done: isConnected && isRegistered,
        },
        {
          id: "registered",
          label: "Registered",
          done: isConnected && isRegistered,
        },
      ]
    : [
        { id: "wallet", label: "Wallet", done: isConnected },
        {
          id: "sonar",
          label: "Sonar",
          done: isConnected && sonar.authenticated,
        },
        {
          id: "eligible",
          label: "Eligible",
          done: Boolean(sonar.status?.eligible),
        },
        {
          id: "ready",
          label: "Ready",
          done: Boolean(sonar.status?.eligible),
        },
      ];

  const formatLiveBalance = (value) =>
    Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: Number(value || 0) >= 1 ? 2 : 6,
    });

  const sonarKycRegistered = Boolean(sonar.authenticated);
  // "Verified" means KYC complete AND eligible for this sale — a completed
  // but ineligible entity must not show a green tick.
  const sonarKycVerified = sonarEligible;
  const sonarKycFundsCommitted = isRegistered;

  const sonarKycSteps = [
    {
      title: "Register on Sonar",
      body: "New or returning, it's one flow. Use the same email or wallet you'll commit with later.",
      done: sonarKycRegistered,
    },
    {
      title: "Verify your identity",
      body: "Complete KYC now, during pre-registration. Don't wait for the window. Your documents go to Sonar, never to AlloX.",
      done: sonarKycVerified,
      // Current Sonar state under the step, so "not done" is never ambiguous
      // (in review vs rejected vs not eligible).
      note:
        sonarKycRegistered &&
        !sonar.entitiesLoading &&
        !sonarKycVerified &&
        sonar.status
          ? { text: sonar.status.title, tone: sonar.status.tone }
          : null,
    },
    {
      title: "Commit funds",
      body: saleOpen
        ? "Reserve your allocation below. Only verified accounts can commit. Sale Network: Ethereum • USDC • USDT"
        : "Only verified accounts can commit once registration opens.",
      done: sonarKycFundsCommitted && sonarKycVerified,
    },
  ];

  // Only offer "continue on Sonar" when the user can actually act there —
  // not while under review or after a final ineligibility decision.
  const sonarKycNextAction = !sonarKycRegistered
    ? "connect"
    : !sonar.entitiesLoading && !sonarKycVerified && sonar.status?.needsSetup
      ? "verify"
      : null;

  return (
    <>
      <div className="flex-1 px-6 py-8 portfolio-wrapper mx-auto w-full overflow-y-auto relative">
        {/* Header */}
        {/* <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold">
              {saleState === "live" ? "Get ALLOX Early" : "Community Sale"}
            </h2>
            <p className="text-gray-600 mt-2">
              {saleState === "live"
                ? "Two ways in before launch: an exclusive private round for loyal users, or the public sale on Sonar."
                : "Exclusive Allocation in Early Community Round for ALLOX before the TGE"}
            </p>
          </div>
        </div> */}

        {/* Referral landing (?refCode=) / "Referred by" */}
        {/* {(referredByCode ||
          (publicSale.landingRefCode && !isOwnLandingCode)) && (
          <div
            className="flex flex-wrap items-center gap-3 mt-2 p-3 rounded-2xl"
            style={{
              background: "rgba(99,102,241,0.07)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #818cf8, #6366f1)",
              }}
            >
              <Gift className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {referredByCode ? "Referred by" : "You were invited with code"}
              </div>
              <div className="text-sm font-black" style={{ color: "#6366f1" }}>
                {referredByCode || publicSale.landingRefCode}
              </div>
              {bindErrorMessage && !referredByCode && (
                <p className="text-[11px] text-amber-700 mt-0.5">
                  {bindErrorMessage}
                </p>
              )}
            </div>
          </div>
        )} */}

        {/* {liveSaleKind === "public" && (
          <div className="flex justify-end items-center my-4 gap-3">
            <div className="flex p-1 bg-white/60 backdrop-blur-xl border border-white/60 rounded-xl shadow-sm mt-4 md:mt-0">
              {["whitelist", "live"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSaleState(s)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${saleState === s ? "bg-black text-white" : "text-gray-600 hover:text-gray-900 hover:bg-white/50"}`}
                >
                  {s === "live" ? "Live" : "Whitelist"}
                </button>
              ))}
            </div>
          </div>
        )} */}
        <AnimatePresence mode="wait">
          {/* ══ LIVE TAB ══ */}
          {/* {saleState === "live" && ( */}
          <motion.div
            key="live"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Sale kind cards — Private / Public */}
            <div className="grid grid-cols-1">
              {["public"].map((kind) => {
                const meta = SALE_KIND_META[kind];
                const active = liveSaleKind === kind;
                const isLive = meta.statusTone === "live";
                const clickable = true;
                const SaleKindTag = clickable ? "button" : "div";
                return (
                  <SaleKindTag
                    key={kind}
                    {...(clickable
                      ? {
                          type: "button",
                          onClick: () => switchLiveSaleKind(kind),
                          "aria-pressed": active,
                        }
                      : { "aria-disabled": true })}
                    className={`theme-island relative overflow-hidden rounded-2xl text-left min-h-[168px] sm:min-h-[180px] transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      clickable ? "group cursor-pointer" : "cursor-default"
                    } ${
                      kind === "private"
                        ? active
                          ? "z-[1] shadow-[0_10px_28px_rgba(0,130,54,0.35)] hover:shadow-[0_14px_36px_rgba(0,130,54,0.55)] focus-visible:ring-emerald-500"
                          : "hover:opacity-100 shadow-none hover:shadow-[0_10px_28px_rgba(0,130,54,0.45)] focus-visible:ring-emerald-400"
                        : "shadow-none"
                    }`}
                  >
                    <img
                      src={meta.bg}
                      alt=""
                      className={`absolute inset-0 h-full w-full object-cover ${
                        kind === "private" ? "transition-all duration-300" : ""
                      }`}
                    />
                    {/* {kind === "public" && (
                      <div className="absolute -top-px left-0 right-0 flex justify-center z-20 pointer-events-none">
                        <span
                          className="inline-flex items-center px-3 py-0.5 sm:text-sm text-[10px] font-black tracking-widest uppercase rounded-b-lg text-white"
                          style={{
                            background:
                              "linear-gradient(90deg, #1d4ed8, #3b82f6, #1d4ed8)",
                            letterSpacing: "0.12em",
                            boxShadow: "0 2px 12px rgba(59, 130, 246, 0.55)",
                          }}
                        >
                          Coming Soon
                        </span>
                      </div>
                    )} */}
                    {!active && (
                      <div className="absolute inset-0 bg-gray-500/20 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-0 pointer-events-none" />
                    )}

                    <div className="relative z-10 flex h-full min-h-[168px] sm:min-h-[180px] flex-col justify-between p-5 sm:p-6">
                      <div className="flex flex-col md:flex-row items-start justify-between gap-3">
                        <div className="min-w-0 pr-2">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                            <h3
                              className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                                active
                                  ? "text-white transition-colors duration-300"
                                  : "text-white/70 transition-colors duration-300 group-hover:text-white"
                              }`}
                            >
                              {meta.label}
                            </h3>
                            {/* {meta.fdv && (
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] sm:text-xs font-bold tracking-wide backdrop-blur-sm ${
                                  active
                                    ? "bg-emerald-400/25 text-emerald-50 ring-1 ring-emerald-200/40 transition-all duration-300"
                                    : "bg-white/15 text-white/75 ring-1 ring-white/25 transition-all duration-300 group-hover:bg-white/20 group-hover:text-white"
                                }`}
                              >
                                <span className="opacity-80 font-semibold mr-1">
                                  FDV
                                </span>
                                {meta.fdv}
                              </span>
                            )} */}
                            {meta.mica && (
                              <Link
                                to="https://allox.ai/mica-whitepaper"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <div className="h-fit flex items-center gap-2 px-3 py-2  rounded-full bg-white hover:bg-gray-200 border border-gray-200 shadow-sm">
                                  <img
                                    src={esmaLogo}
                                    alt="ESMA"
                                    className="h-3 w-auto object-contain"
                                  />
                                  <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                                    MiCA Regulated
                                  </span>
                                </div>
                              </Link>
                            )}
                          </div>
                          <div className="mt-2 space-y-0.5">
                            {meta.lines.map((line) => (
                              <p
                                key={line}
                                className={`text-sm leading-snug max-w-[34ch] ${
                                  active
                                    ? "transition-colors duration-300"
                                    : "text-white/55 transition-colors duration-300 group-hover:text-white/80"
                                }`}
                                style={
                                  active
                                    ? {
                                        color:
                                          kind === "public"
                                            ? "#B9D0FF"
                                            : "#DCFCE7",
                                      }
                                    : undefined
                                }
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* {kind !== "public" && ( */}
                        <div className="flex flex-col justify-between h-full sm:items-end">
                          {sonar?.configured && sonar?.authenticated ? (
                            <div
                              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-sm py-1 pl-2 pr-1 shadow-sm ring-1 ring-black/5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <img
                                src={meta.logo}
                                alt=""
                                className="h-3.5 w-auto object-contain"
                                style={{ filter: "invert(1) brightness(1.4)" }}
                              />
                              <span className="h-3.5 w-px bg-gray-300" />
                              {sonar.entities && sonar.entities.length > 0 ? (
                                (() => {
                                  const currentEntity =
                                    sonar.activeEntity ?? sonar.entities[0];
                                  const canSwitch = sonar.entities.length > 1;
                                  const shieldColor = sonar.entitiesLoading
                                    ? "text-gray-400"
                                    : sonar.status?.eligible
                                      ? "text-emerald-600"
                                      : sonar.status?.tone === "red"
                                        ? "text-red-600"
                                        : "text-amber-500";
                                  return (
                                    <>
                                      {/* span, not button: the banner itself is a <button> */}
                                      <span
                                        ref={entityTriggerRef}
                                        role="button"
                                        tabIndex={canSwitch ? 0 : -1}
                                        aria-haspopup="listbox"
                                        aria-expanded={entityMenuOpen}
                                        aria-disabled={!canSwitch}
                                        title={
                                          canSwitch ? "Select entity" : "Entity"
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (canSwitch) toggleEntityMenu();
                                        }}
                                        onKeyDown={(e) => {
                                          if (
                                            canSwitch &&
                                            (e.key === "Enter" || e.key === " ")
                                          ) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleEntityMenu();
                                          }
                                        }}
                                        className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 py-1 pl-2 pr-1 ring-1 ring-emerald-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                                          canSwitch
                                            ? "cursor-pointer hover:bg-emerald-100"
                                            : "cursor-default"
                                        }`}
                                      >
                                        <Shield
                                          className={`h-3.5 w-3.5 ${shieldColor}`}
                                        />
                                        <span className="max-w-[140px] truncate text-[11px] font-semibold text-emerald-900">
                                          {currentEntity?.Label ||
                                            "Unnamed Entity"}
                                        </span>
                                        <span
                                          className={`inline-flex items-center justify-center rounded-full p-0.5 ${
                                            canSwitch
                                              ? "bg-emerald-600"
                                              : "bg-emerald-300"
                                          }`}
                                        >
                                          <ChevronDown
                                            className={`h-3 w-3 text-white transition-transform ${entityMenuOpen ? "rotate-180" : ""}`}
                                            strokeWidth={3}
                                          />
                                        </span>
                                      </span>

                                      {entityMenuOpen &&
                                        createPortal(
                                          <>
                                            <div
                                              className="fixed inset-0 z-[60]"
                                              onClick={() =>
                                                setEntityMenuPos(null)
                                              }
                                            />
                                            <div
                                              role="listbox"
                                              className="fixed z-[61] min-w-[180px] max-w-[260px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg animate-fade-in"
                                              style={{
                                                top: entityMenuPos.top,
                                                right: entityMenuPos.right,
                                              }}
                                            >
                                              <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                                                Entity
                                              </p>
                                              {sonar.entities.map((entity) => {
                                                const isSelected =
                                                  entity.EntityID ===
                                                  currentEntity?.EntityID;
                                                const label =
                                                  entity.Label ||
                                                  "Unnamed Entity";
                                                const entityStatus =
                                                  describeSonarEntity(
                                                    entity,
                                                    saleState,
                                                  );
                                                return (
                                                  <button
                                                    key={entity.EntityID}
                                                    type="button"
                                                    role="option"
                                                    aria-selected={isSelected}
                                                    onClick={() => {
                                                      setSelectedEntity(entity);
                                                      setEntityMenuPos(null);
                                                    }}
                                                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                                                      isSelected
                                                        ? "bg-black font-medium text-white hover:bg-gray-800"
                                                        : "text-gray-800 hover:bg-black/5"
                                                    }`}
                                                  >
                                                    <span
                                                      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                                        isSelected
                                                          ? "bg-white text-black"
                                                          : "bg-emerald-100 text-emerald-700"
                                                      }`}
                                                    >
                                                      {label
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                      <span className="block truncate">
                                                        {label}
                                                      </span>
                                                      <span
                                                        className={`block truncate text-[10px] font-medium ${
                                                          isSelected
                                                            ? "text-white/70"
                                                            : entityStatus.eligible
                                                              ? "text-emerald-600"
                                                              : entityStatus.tone ===
                                                                  "red"
                                                                ? "text-red-600"
                                                                : "text-amber-600"
                                                        }`}
                                                      >
                                                        {entityStatus.eligible
                                                          ? "Eligible"
                                                          : entityStatus.title}
                                                      </span>
                                                    </span>
                                                    {isSelected && (
                                                      <Check className="h-3.5 w-3.5 shrink-0" />
                                                    )}
                                                  </button>
                                                );
                                              })}
                                              <div className="my-1.5 w-full border-t border-gray-200/50" />
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setEntityMenuPos(null);
                                                  sonar.logout();
                                                }}
                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-medium text-[#F54900] transition-colors hover:bg-orange-100"
                                              >
                                                <LogOut className="h-3.5 w-3.5" />
                                                Disconnect Sonar
                                              </button>
                                            </div>
                                          </>,
                                          document.body,
                                        )}
                                    </>
                                  );
                                })()
                              ) : (
                                <span className="inline-flex items-center gap-1 pl-0.5 text-[11px] font-semibold text-gray-800">
                                  <Shield className="h-3.5 w-3.5 text-emerald-600" />
                                  {sonar.primaryEntity?.Label || "Connected"}
                                </span>
                              )}
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  sonar.logout();
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    sonar.logout();
                                  }
                                }}
                                className="inline-flex items-center justify-center rounded-full bg-red-50 p-1.5 text-red-600 ring-1 ring-red-200 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                                title="Disconnect Sonar"
                              >
                                <LogOut className="h-4 w-4" strokeWidth={2.5} />
                              </span>
                            </div>
                          ) : sonar?.configured ? (
                            <span
                              role="button"
                              tabIndex={0}
                              aria-disabled={!sonar.ready}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (sonar.ready) sonar.connectSonar();
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (sonar.ready) sonar.connectSonar();
                                }
                              }}
                              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full w-fit bg-white hover:bg-gray-200 text-gray-900 text-[11px] font-bold px-3 py-1.5 shadow-sm transition-colors ${
                                sonar.ready
                                  ? "cursor-pointer hover:bg-gray-100"
                                  : "opacity-50 cursor-not-allowed"
                              }`}
                            >
                              <img
                                src="https://cdn.allox.ai/allox/publicSale/sonarConnect.png"
                                alt=""
                                className="h-3.5 w-auto"
                              />
                              Connect with Sonar
                            </span>
                          ) : (
                            <span
                              className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                                isLive
                                  ? active
                                    ? "bg-emerald-200 text-emerald-950 transition-all duration-300"
                                    : "bg-emerald-200/70 text-emerald-950/80 transition-all duration-300 group-hover:bg-emerald-200 group-hover:text-emerald-950"
                                  : active
                                    ? "border border-white/45 bg-transparent text-white/90 transition-all duration-300"
                                    : "border border-white/30 bg-transparent text-white/60 transition-all duration-300 group-hover:border-white/50 group-hover:text-white/85"
                              }`}
                            >
                              {isLive && (
                                <div
                                  className="pulsatingDot"
                                  style={{
                                    width: 7,
                                    height: 7,
                                    marginRight: 5,
                                  }}
                                ></div>
                              )}
                              {meta.status}
                            </span>
                          )}
                          {meta.extras && (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6 md:mt-3">
                              {meta.extras.map((extra, index) => (
                                <div key={index} className="flex flex-col">
                                  <span className="text-white/70 text-sm">
                                    {extra.title}
                                  </span>
                                  <span className="font-semibold text-white text-lg">
                                    {extra.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* )} */}
                      </div>

                      {kind === "public" ? (
                        <div className="mt-5 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-white/25" />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 shrink-0">
                              Powered by
                            </span>
                            <div className="h-px flex-1 bg-white/25" />
                          </div>
                          <div className="flex items-center justify-center opacity-100">
                            <div className="flex items-baseline gap-1.5 pl-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  window.open(
                                    getSonarHomeUrl(),
                                    "_blank",
                                    "noopener,noreferrer",
                                  )
                                }
                                className="ml-2 text-white/70 hover:text-white transition-colors hover:border-b-2 flex items-end gap-1.5 border-b-2 border-transparent hover:border-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
                                title="View on Sonar"
                              >
                                {" "}
                                <img
                                  src={meta.logo}
                                  alt="SONAR by ECHO"
                                  className="h-7 sm:h-5 w-auto max-w-[100px] sm:max-w-[140px] object-contain object-right drop-shadow opacity-100"
                                />
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-end sm:justify-between">
                          <span
                            className={`inline-flex w-fit max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-xs sm:text-sm font-bold tracking-wide ring-1 backdrop-blur-sm transition-all duration-300 ${
                              active
                                ? "bg-emerald-300/24 text-emerald-50 ring-emerald-100/45 shadow-[0_10px_28px_rgba(16,185,129,0.28)]"
                                : "bg-emerald-200/12 text-white/80 ring-emerald-100/20 group-hover:bg-emerald-200/18 group-hover:text-white group-hover:ring-emerald-100/30 group-hover:shadow-[0_8px_22px_rgba(16,185,129,0.18)]"
                            }`}
                            style={
                              active
                                ? {
                                    color: "#DCFCE7",
                                  }
                                : undefined
                            }
                          >
                            {/* {active && (
                              <span
                                className="inline-block h-1.5 w-1.5 rounded-full"
                                style={{
                                  backgroundColor: "#DCFCE7",
                                }}
                              />
                            )} */}
                            <span
                              className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                                active
                                  ? "bg-emerald-50/14 text-emerald-50"
                                  : "bg-white/10 text-white/80 group-hover:bg-white/15 group-hover:text-white"
                              }`}
                            >
                              <DollarSign size={12} />
                            </span>
                            <span className="opacity-80 font-semibold">
                              Raise Target:
                            </span>
                            <span className="whitespace-nowrap">
                              {meta.raiseTarget}
                            </span>
                          </span>
                          <img
                            src={meta.logo}
                            alt={meta.logoAlt}
                            className={`h-6 self-end sm:h-8 w-auto max-w-[96px] sm:max-w-[140px] object-contain object-right drop-shadow transition-all duration-300 ${
                              active
                                ? "opacity-100 grayscale-0"
                                : "opacity-55 grayscale group-hover:opacity-100 group-hover:grayscale-0"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </SaleKindTag>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={liveSaleKind}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {liveSaleKind === "public" && saleState === "live" && (
                  <>
                    {(() => {
                      const raisedUsd = Number(
                        publicSale.stats?.raisedUsd ??
                          publicSale.sale?.raisedUsd ??
                          0,
                      );
                      const contributors =
                        publicSale.stats?.contributors ??
                        publicSale.sale?.contributors ??
                        null;
                      const subscriptionX = raisedUsd / PUBLIC_ROUND_TARGET_USD;
                      const targetBarPct = Math.min(subscriptionX * 100, 100);
                      const overflowBarPct = 100 - targetBarPct;
                      return (
                        <div className="glass-card px-5 py-4">
                          {/* Stats row */}
                          <div className="grid grid-cols-2 divide-x divide-gray-100">
                            {/* Committed */}
                            <div className="min-w-0 pr-3">
                              <div className="flex items-center gap-1 mb-0.5">
                                <DollarSign
                                  size={11}
                                  className="text-gray-400 flex-shrink-0"
                                />
                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest truncate">
                                  Total committed
                                </p>
                              </div>
                              <p className="text-lg sm:text-xl font-black text-gray-900 tracking-tight truncate">
                                ${raisedUsd.toLocaleString()}
                              </p>
                            </div>

                            {/* Participants */}
                            {/* <div className="min-w-0 px-3 text-center">
                              <div className="flex items-center justify-center gap-1 mb-0.5">
                                <Users
                                  size={11}
                                  className="text-gray-400 flex-shrink-0"
                                />
                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest truncate">
                                  Participants
                                </p>
                              </div>
                              <p className="text-lg sm:text-xl font-black text-gray-900 tracking-tight truncate">
                                {contributors != null
                                  ? Number(contributors).toLocaleString()
                                  : "—"}
                              </p>
                            </div> */}

                            {/* Subscription multiplier */}
                            <div className="min-w-0 pl-3 text-right">
                              <div className="flex items-center justify-end gap-1 mb-0.5">
                                <TrendingUp
                                  size={11}
                                  className="text-gray-400 flex-shrink-0"
                                />
                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest truncate">
                                  Subscribed
                                </p>
                              </div>
                              <p className="text-lg sm:text-xl font-black text-green-500 tracking-tight truncate">
                                {subscriptionX.toFixed(2)}×
                              </p>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-4">
                            <div className="relative h-2 rounded-full overflow-hidden bg-gray-100">
                              <div
                                className="absolute left-0 top-0 h-full"
                                style={{
                                  width: `${targetBarPct}%`,
                                  background: "black",
                                }}
                              />
                              <div
                                className="absolute top-0 h-full"
                                style={{
                                  left: `${targetBarPct}%`,
                                  width: `${overflowBarPct}%`,
                                  background: "#b4b7bd",
                                }}
                              />
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-[10px] text-gray-500">
                                ${raisedUsd.toLocaleString()} raised
                              </span>
                              <span className="text-[10px] text-gray-500">
                                Round target: $
                                {(PUBLIC_ROUND_TARGET_USD / 1_000_000).toFixed(
                                  2,
                                )}
                                M
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
                {/* ══ WHITELIST TAB ══ */}
                {liveSaleKind === "public" &&
                saleState === "whitelist" &&
                wlStep === "connect" ? (
                  <>
                    <section className="p-12  relative overflow-hidden  mb-4">
                      {/* Animated background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse rounded-3xl"></div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-blue-500/5 to-cyan-500/5 rounded-3xl"></div>

                      <div className="max-w-[1200px] mx-auto relative">
                        <div className="text-center space-y-8">
                          {/* Badge */}
                          {saleOpen ? (
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 border border-green-200">
                              <span className="relative flex w-2.5 h-2.5">
                                <span className="absolute inline-flex w-full h-full rounded-full bg-green-500 opacity-75 animate-ping" />
                                <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-green-500" />
                              </span>
                              <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-green-700">
                                Live now · Whitelist registration open
                              </span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200">
                              <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                              <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-gray-600">
                                Whitelist registration closed
                              </span>
                            </div>
                          )}

                          {/* Main Heading */}
                          <div className="space-y-4">
                            <h1 className="text-3xl md:text-5xl lg:text-5xl leading-tight tracking-tight animate-fade-in">
                              {saleOpen
                                ? "Register Now for the"
                                : "The Community Sale"}
                              <br />
                              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                {saleOpen
                                  ? "Community Sale Whitelist"
                                  : "Whitelist"}
                              </span>
                            </h1>
                            {saleOpen && (
                              <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto">
                                Whitelist registration is{" "}
                                <span className="font-semibold text-gray-900">
                                  open right now
                                </span>
                                . Register before the countdown ends so you're
                                ready to commit when the sale starts.
                              </p>
                            )}
                          </div>

                          {/* Countdown Timer */}
                          <div className="space-y-4">
                            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-gray-500">
                              Commitments open in
                            </p>
                            <Countdown date={SALE_DATE} renderer={renderer} />
                            {/* <p className="text-xs text-gray-500">
                              {SALE_DATE.toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                timeZone: "UTC",
                                timeZoneName: "short",
                              })}
                            </p> */}
                          </div>

                          <div className="glass-card w-full max-w-3xl mx-auto overflow-hidden">
                            {!isConnected ? (
                              <div className="flex flex-col items-center text-center px-6 py-10">
                                <h2 className="text-xl md:text-3xl font-bold mb-2">
                                  How to join the whitelist
                                </h2>
                                <p className="text-sm text-gray-600 mb-6 max-w-md">
                                  Registration is open now. Secure your ALLOX
                                  allocation before the sale opens to the
                                  general public.
                                </p>
                                <WhitelistSteps current={0} />
                                <button
                                  onClick={() => dispatch(setWalletModal(true))}
                                  className="bg-black text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
                                >
                                  <Wallet className="w-4 h-4" />
                                  Connect Wallet to Register
                                </button>
                              </div>
                            ) : isRegistered ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2">
                                <div className="flex flex-col justify-center px-6 py-8 sm:py-10 sm:border-r border-gray-100 text-center sm:text-left">
                                  <div className="inline-flex items-center gap-1.5 self-center sm:self-start px-2.5 py-1 bg-green-100 border border-green-200 rounded-full mb-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    <span className="text-[11px] font-bold uppercase tracking-wide text-green-700">
                                      Whitelisted
                                    </span>
                                  </div>
                                  <h2 className="text-xl md:text-2xl font-bold mb-2">
                                    You're on the list
                                  </h2>
                                  <p className="text-sm text-gray-600 max-w-xs mx-auto sm:mx-0">
                                    Your ALLOX allocation is reserved. You can
                                    update the amount anytime while registration
                                    is open.
                                  </p>
                                </div>

                                <div className="flex flex-col items-center justify-center gap-4 px-6 py-8 sm:py-10 bg-green-50/60 border-t sm:border-t-0 border-gray-100">
                                  <div className="text-center">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-green-700/70 mb-1">
                                      Reserved allocation
                                    </p>
                                    <p className="text-4xl md:text-5xl font-bold text-green-800 tracking-tight">
                                      $
                                      {Number(
                                        registration?.allocationUsd ?? 0,
                                      ).toLocaleString()}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => setWlStep("form")}
                                    disabled={!saleOpen}
                                    className="bg-black text-white font-semibold px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                    {saleOpen
                                      ? "Change Amount"
                                      : "Registration Closed"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center text-center px-6 py-10">
                                <h2 className="text-xl md:text-3xl font-bold mb-2">
                                  {saleOpen
                                    ? "You're not registered yet"
                                    : "Registration is closed"}
                                </h2>
                                <p className="text-sm text-gray-600 mb-6 max-w-md">
                                  {saleOpen
                                    ? "Your wallet is connected. Complete the next step to secure your ALLOX allocation before commitments open."
                                    : "Whitelist registration has ended for this round."}
                                </p>
                                {saleOpen && <WhitelistSteps current={1} />}
                                <button
                                  onClick={() => setWlStep("form")}
                                  disabled={!saleOpen}
                                  className="bg-black text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  {saleOpen
                                    ? "Register for Whitelist →"
                                    : "Registration Closed"}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Beta Notice */}
                        </div>
                      </div>
                    </section>
                  </>
                ) : liveSaleKind === "public" &&
                  wlStep !== "connect" &&
                  saleState === "whitelist" ? (
                  <>
                    <AnimatePresence mode="wait">
                      {(wlStep === "form" || wlStep === "success") && (
                        <motion.div
                          key="form"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18 }}
                          className="space-y-4"
                        >
                          {/* {isConnected && !sonar.configured && (
                            <SonarNotConfiguredNotice />
                          )} */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                            {/* Left — context & rules */}
                            <div className="glass-card p-5 sm:p-6 flex flex-col gap-5 overflow-hidden">
                              <div
                                className={`flex flex-col gap-4 ${
                                  isRegistered && registration
                                    ? "sm:flex-row sm:items-stretch sm:gap-5"
                                    : ""
                                }`}
                              >
                                <div className="min-w-0 flex-1 flex flex-col justify-center">
                                  <h3 className="text-lg sm:text-xl font-bold leading-snug">
                                    Verify to join the Community Sale
                                  </h3>
                                  <p className="text-sm text-gray-600 mt-1.5">
                                    Complete KYC before the window opens, so
                                    you're ready to commit the moment it does.
                                  </p>
                                </div>
                              </div>

                              {/* Eligibility status for the selected entity */}
                              {isConnected &&
                                sonar.configured &&
                                sonar.authenticated && (
                                  <SonarStatusInline
                                    status={sonar.status}
                                    entity={sonar.activeEntity}
                                    onDisconnect={sonar.logout}
                                    loading={sonar.entitiesLoading}
                                    error={sonar.entitiesError}
                                    showEligible
                                  />
                                )}

                              {!saleOpen && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                                  <Lock className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                  <p className="text-xs font-semibold text-gray-700">
                                    Registration closed
                                  </p>
                                </div>
                              )}

                              <div className="space-y-4 border-t border-gray-100 pt-4">
                                {/* <div>
                                  <p className="text-sm font-bold text-gray-900">
                                    Verify to join the Community Sale
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                    Complete KYC before the window opens, so
                                    you&apos;re ready to commit the moment it
                                    does.
                                  </p>
                                </div> */}

                                <div className="divide-y divide-gray-100">
                                  {sonarKycSteps.map((step, i) => {
                                    const isCurrent =
                                      !step.done &&
                                      sonarKycSteps
                                        .slice(0, i)
                                        .every((s) => s.done);
                                    return (
                                      <div
                                        key={step.title}
                                        className={`flex gap-3 py-3 ${
                                          i === 0 ? "pt-0" : ""
                                        }`}
                                      >
                                        <div
                                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold ${
                                            step.done || isCurrent
                                              ? "bg-black text-white"
                                              : "bg-gray-100 text-gray-400"
                                          }`}
                                        >
                                          {step.done ? (
                                            <Check className="w-3.5 h-3.5" />
                                          ) : (
                                            i + 1
                                          )}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-sm font-bold text-gray-900">
                                            {step.title}
                                          </p>
                                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                            {step.body}
                                          </p>
                                          {step.note && (
                                            <span
                                              className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${
                                                step.note.tone === "red"
                                                  ? "bg-red-50 text-red-700 ring-red-200"
                                                  : step.note.tone === "amber"
                                                    ? "bg-amber-50 text-amber-800 ring-amber-200"
                                                    : "bg-gray-50 text-gray-700 ring-gray-200"
                                              }`}
                                            >
                                              {step.note.tone === "red" ? (
                                                <AlertCircle className="w-3 h-3" />
                                              ) : step.note.tone === "amber" ? (
                                                <Info className="w-3 h-3" />
                                              ) : (
                                                <Clock className="w-3 h-3" />
                                              )}
                                              {step.note.text}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {sonar.configured && sonarKycNextAction && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (sonarKycNextAction === "connect") {
                                        sonar.connectSonar();
                                      } else {
                                        window.open(
                                          getSonarHomeUrl(),
                                          "_blank",
                                          "noopener,noreferrer",
                                        );
                                      }
                                    }}
                                    disabled={
                                      sonarKycNextAction === "connect" &&
                                      !sonar.ready
                                    }
                                    className="w-full bg-black text-white font-semibold py-3.5 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                  >
                                    {sonarKycNextAction === "connect"
                                      ? "Register & verify on Sonar"
                                      : "Continue verification on Sonar"}
                                    {/* <ExternalLink className="w-4 h-4" /> */}
                                  </button>
                                )}
                              </div>

                              {/* <div className="mt-auto flex items-start gap-2 px-3 py-2.5 bg-amber-50/80 border border-amber-100 rounded-xl">
                                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-700 leading-relaxed">
                                  <span className="font-semibold">
                                    Funds must remain in your wallet.
                                  </span>{" "}
                                  If the funds backing your allocation leave
                                  before the sale, your registration will be
                                  dropped from the final whitelist.
                                </p>
                              </div> */}
                            </div>

                            {/* Right — investment form */}
                            <div className="glass-card p-5 sm:p-6 flex flex-col gap-4">
                              <div>
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Allocation Amount
                                  </label>
                                  <div className="flex flex-col sm:flex-row items-center gap-2">
                                    {isRegistered && registration && (
                                      <div
                                        className="text-sm flex items-center text-gray-600 hover:text-gray-800 bg-green-50/80 border border-green-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2 hover:bg-green-100 transition-colors"
                                        ref={registeredInfoPopupRef}
                                      >
                                        <p className="text-[11px] font-semibold uppercase tracking-wide text-green-700/70">
                                          Reserved allocation
                                        </p>
                                        <p className="text-base font-bold text-green-800 tracking-tight">
                                          $
                                          {Number(
                                            registration.allocationUsd ?? 0,
                                          ).toLocaleString()}
                                        </p>
                                      </div>
                                    )}
                                    <div
                                      className="relative"
                                      ref={balancePopupRef}
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setBreakdownOpen((v) => !v)
                                        }
                                        className="text-sm text-gray-600 hover:text-gray-800 bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2 hover:bg-blue-100 transition-colors"
                                      >
                                        Wallet balance:{" "}
                                        <span
                                          className={`font-bold text-base ${
                                            balanceIncomplete
                                              ? "text-amber-600"
                                              : "text-gray-900"
                                          }`}
                                        >
                                          {wlStatusLoading &&
                                          walletBalanceUsd == null
                                            ? "Loading…"
                                            : balanceIncomplete
                                              ? "Couldn't read"
                                              : walletBalanceUsd != null
                                                ? `$${walletBalanceUsd.toLocaleString(
                                                    undefined,
                                                    {
                                                      maximumFractionDigits: 2,
                                                    },
                                                  )}`
                                                : "—"}
                                        </span>
                                        {balanceIncomplete ||
                                        balanceAddressMismatch ? (
                                          <AlertCircle className="w-4 h-4 text-amber-500" />
                                        ) : (
                                          <Info className="w-4 h-4 text-blue-500" />
                                        )}
                                      </button>

                                      <AnimatePresence>
                                        {breakdownOpen && (
                                          <motion.div
                                            initial={{
                                              opacity: 0,
                                              y: -4,
                                              scale: 0.98,
                                            }}
                                            animate={{
                                              opacity: 1,
                                              y: 0,
                                              scale: 1,
                                            }}
                                            exit={{
                                              opacity: 0,
                                              y: -4,
                                              scale: 0.98,
                                            }}
                                            transition={{ duration: 0.12 }}
                                            className="absolute right-0 top-full mt-2 w-72 z-20"
                                          >
                                            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3.5">
                                              <div className="flex items-center justify-between mb-2">
                                                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                                  Balance Breakdown
                                                </span>
                                                {!balanceIncomplete &&
                                                  walletBalanceUsd != null && (
                                                    <span className="text-xs font-bold text-gray-800">
                                                      $
                                                      {walletBalanceUsd.toLocaleString(
                                                        undefined,
                                                        {
                                                          maximumFractionDigits: 2,
                                                        },
                                                      )}
                                                    </span>
                                                  )}
                                              </div>

                                              {/* Signed in as a different wallet than the one we read */}
                                              {balanceAddressMismatch && (
                                                <div className="flex items-start gap-2 mb-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                                                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                  <p className="text-[11px] text-amber-800 leading-relaxed">
                                                    We checked{" "}
                                                    <span className="font-semibold">
                                                      {shortenTxHash(
                                                        checkedAddress,
                                                      )}
                                                    </span>
                                                    , which isn't the wallet
                                                    you're connected with. Sign
                                                    in with the wallet that
                                                    holds your funds to see the
                                                    right balance.
                                                  </p>
                                                </div>
                                              )}

                                              {balanceIncomplete ? (
                                                /* A chain read failed — never show this as a real $0 */
                                                <div className="flex flex-col gap-2 mb-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                                                  <div className="flex items-start gap-2">
                                                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                    <p className="text-[11px] text-amber-800 leading-relaxed">
                                                      Could not read balance,
                                                      try again.
                                                    </p>
                                                  </div>
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      refreshWhitelist()
                                                    }
                                                    disabled={wlStatusLoading}
                                                    className="self-start inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                  >
                                                    <RefreshCw
                                                      className={`w-3 h-3 ${
                                                        wlStatusLoading
                                                          ? "animate-spin"
                                                          : ""
                                                      }`}
                                                    />
                                                    {wlStatusLoading
                                                      ? "Retrying…"
                                                      : "Retry"}
                                                  </button>
                                                </div>
                                              ) : balanceBreakdown.length >
                                                0 ? (
                                                <div className="space-y-1.5 mb-2.5">
                                                  {balanceBreakdown.map(
                                                    (row, i) => (
                                                      <div
                                                        key={`${row.chain}-${row.symbol}-${i}`}
                                                        className="flex items-center justify-between text-xs"
                                                      >
                                                        <span className="text-gray-500">
                                                          {row.symbol}{" "}
                                                          <span className="text-gray-400">
                                                            on {row.chain}
                                                          </span>
                                                        </span>
                                                        <span className="font-semibold text-gray-700">
                                                          $
                                                          {Number(
                                                            row.balanceUsd ?? 0,
                                                          ).toLocaleString(
                                                            undefined,
                                                            {
                                                              maximumFractionDigits: 2,
                                                            },
                                                          )}
                                                        </span>
                                                      </div>
                                                    ),
                                                  )}
                                                </div>
                                              ) : (
                                                <p className="text-xs text-gray-400 mb-2.5">
                                                  No eligible assets detected in
                                                  your wallet yet.
                                                </p>
                                              )}

                                              {/* The wallet the backend actually read */}
                                              {checkedAddress && (
                                                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-100">
                                                  <span className="text-gray-400">
                                                    Checked wallet
                                                  </span>
                                                  <span className="font-mono font-semibold text-gray-600">
                                                    {shortenTxHash(
                                                      checkedAddress,
                                                    )}
                                                  </span>
                                                </div>
                                              )}

                                              <p className="text-[11px] text-gray-400 leading-relaxed pt-2 border-t border-gray-100">
                                                Balance counts USDC and USDT on
                                                Ethereum only (the public sale
                                                network).
                                              </p>
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mb-2.5">
                                  {WL_PRESETS.map((p) => {
                                    const v = p.replace(/[$,]/g, "");
                                    return (
                                      <button
                                        key={p}
                                        onClick={() => setWlAmount(v)}
                                        disabled={!saleOpen}
                                        className={`py-2 rounded-xl border-2 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${wlAmount === v ? "border-black bg-black text-white" : "border-gray-200 bg-white/60 text-gray-700 hover:border-gray-400"}`}
                                      >
                                        {p}
                                      </button>
                                    );
                                  })}
                                </div>

                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">
                                    $
                                  </span>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    autoComplete="off"
                                    value={wlAmount}
                                    onChange={(e) => {
                                      setWlAmount(
                                        sanitizeUsdInput(
                                          e.target.value,
                                          maxUsd,
                                        ),
                                      );
                                      setSubmitError(null);
                                    }}
                                    disabled={!saleOpen}
                                    placeholder={`$${minUsd.toLocaleString()} – $${maxUsd.toLocaleString()}`}
                                    aria-invalid={
                                      belowMin ||
                                      aboveMax ||
                                      insufficientBalance
                                    }
                                    className={`w-full pl-8 pr-4 py-3 border-2 rounded-xl focus:outline-none text-sm font-semibold bg-white/80 transition-colors disabled:opacity-50 ${insufficientBalance || belowMin || aboveMax ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-black"}`}
                                  />
                                </div>

                                <div className="flex justify-between gap-2 mt-1.5 px-0.5">
                                  <span
                                    className={`text-xs ${belowMin || aboveMax ? "text-red-600 font-medium" : "text-gray-400"}`}
                                  >
                                    {belowMin
                                      ? `Minimum is $${minUsd.toLocaleString()}`
                                      : `Min $${minUsd.toLocaleString()} · Max $${maxUsd.toLocaleString()}`}
                                  </span>
                                  {wlNum >= minUsd &&
                                    !aboveMax &&
                                    walletBalanceUsd != null &&
                                    !insufficientBalance && (
                                      <span className="text-xs text-green-600 font-medium">
                                        ✓ Sufficient balance
                                      </span>
                                    )}
                                </div>

                                <AnimatePresence>
                                  {insufficientBalance && !submitError && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="flex items-start gap-2 mt-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-xs font-semibold text-red-700">
                                            Insufficient wallet balance
                                          </p>
                                          <p className="text-xs text-red-600 mt-0.5">
                                            You need{" "}
                                            <span className="font-bold">
                                              $
                                              {(
                                                wlNum - walletBalanceUsd
                                              ).toLocaleString(undefined, {
                                                maximumFractionDigits: 2,
                                              })}
                                            </span>{" "}
                                            more in your wallet to proceed.
                                          </p>
                                          {canLowerToBalance ? (
                                            <button
                                              type="button"
                                              onClick={lowerToBalance}
                                              className="text-xs font-semibold text-red-700 underline mt-1"
                                            >
                                              Lower amount to available balance
                                            </button>
                                          ) : (
                                            <p className="text-xs text-red-600 mt-1">
                                              The minimum allocation is $
                                              {minUsd.toLocaleString()}. Add at
                                              least $
                                              {Math.max(
                                                0,
                                                minUsd - walletBalanceUsd,
                                              ).toLocaleString(undefined, {
                                                maximumFractionDigits: 2,
                                              })}{" "}
                                              in USDC or USDT on{" "}
                                              {PUBLIC_SALE_CHAIN_NAME} to join.
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>

                              <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                                  <Mail className="w-3 h-3" />
                                  Email Address
                                  <span className="font-normal text-gray-400 normal-case">
                                    optional
                                  </span>
                                </label>
                                <input
                                  type="email"
                                  value={email}
                                  onChange={(e) => {
                                    setEmail(e.target.value);
                                    setSubmitError(null);
                                  }}
                                  disabled={!saleOpen}
                                  placeholder="you@example.com"
                                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none text-sm bg-white/80 transition-colors disabled:opacity-50"
                                />
                                <p className="text-[11px] text-gray-400 mt-1 px-0.5">
                                  We'll notify you when the sale goes live.
                                </p>
                              </div>

                              {needsSaleChainSwitch && (
                                <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-amber-800">
                                    Switch your wallet to Ethereum to verify
                                    balance and{" "}
                                    {isRegistered ? "update" : "reserve"} your
                                    allocation.
                                  </p>
                                </div>
                              )}

                              <AnimatePresence>
                                {wlRetrying && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0 mt-0.5" />
                                      <p className="text-xs text-blue-700">
                                        Verifying your balance on-chain, this
                                        can take a few seconds…
                                      </p>
                                    </div>
                                  </motion.div>
                                )}

                                {submitError && !wlRetrying && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <p className="text-xs text-red-700">
                                          {submitError.message}
                                        </p>
                                        {submitError.status === 422 &&
                                          canLowerToBalance && (
                                            <button
                                              type="button"
                                              onClick={lowerToBalance}
                                              className="text-xs font-semibold text-red-700 underline mt-1"
                                            >
                                              Lower amount to available balance
                                            </button>
                                          )}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <button
                                type="button"
                                onClick={() => {
                                  if (needsSonarConnect) {
                                    sonar.connectSonar();
                                    return;
                                  }
                                  if (saleOpen && sonarNeedsSonarStep) {
                                    openSonar();
                                    return;
                                  }
                                  if (needsSaleChainSwitch) {
                                    switchToSaleChain();
                                    return;
                                  }
                                  handleJoin();
                                }}
                                disabled={
                                  needsSonarConnect
                                    ? !sonar.ready
                                    : (saleOpen && sonarNeedsSonarStep) ||
                                        needsSaleChainSwitch
                                      ? false
                                      : !wlValid || sonarHasError
                                }
                                className="mt-auto w-full bg-black text-white font-semibold py-3.5 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                              >
                                {needsSonarConnect ? (
                                  <>
                                    <img
                                      src="https://cdn.allox.ai/allox/publicSale/sonarConnect.png"
                                      alt=""
                                      className="h-4 w-auto"
                                      style={{
                                        filter: "invert(1) brightness(1.4)",
                                      }}
                                    />
                                    Connect with Sonar
                                  </>
                                ) : !saleOpen ? (
                                  "Registration Closed"
                                ) : wlSubmitting ? (
                                  wlRetrying ? (
                                    "Verifying balance…"
                                  ) : isRegistered ? (
                                    "Updating…"
                                  ) : (
                                    "Joining…"
                                  )
                                ) : sonar.configured &&
                                  sonar.authenticated &&
                                  sonar.entitiesLoading ? (
                                  "Checking Sonar status…"
                                ) : sonarBlockedLabel ? (
                                  sonarBlockedLabel
                                ) : needsSaleChainSwitch ? (
                                  `Switch to ${PUBLIC_SALE_CHAIN_NAME}`
                                ) : belowMin ? (
                                  `Minimum $${minUsd.toLocaleString()} required`
                                ) : aboveMax ? (
                                  `Maximum $${maxUsd.toLocaleString()} allowed`
                                ) : insufficientBalance ? (
                                  "Insufficient Balance"
                                ) : isRegistered ? (
                                  "Update Allocation"
                                ) : (
                                  "Join Whitelist"
                                )}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {wlStep === "success" && (
                        <motion.div
                          key="wl-success-modal"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="fixed inset-0 z-50 flex items-center justify-center p-4"
                          style={{
                            background: "rgba(0,0,0,0.55)",
                            backdropFilter: "blur(8px)",
                          }}
                          onClick={(e) => {
                            if (e.target === e.currentTarget) {
                              setWlStep("form");
                            }
                          }}
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 8 }}
                            transition={{
                              type: "spring",
                              stiffness: 320,
                              damping: 24,
                            }}
                            className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-gray-100 p-8 flex flex-col items-center text-center"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="wl-success-title"
                          >
                            <button
                              type="button"
                              onClick={() => setWlStep("form")}
                              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                              aria-label="Close"
                            >
                              <X className="w-4 h-4" />
                            </button>

                            <motion.div
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 18,
                              }}
                              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
                            >
                              <CheckCircle className="w-9 h-9 text-green-600" />
                            </motion.div>
                            <h4
                              id="wl-success-title"
                              className="text-xl font-bold text-gray-900 mb-1"
                            >
                              Your wallet is whitelisted!
                            </h4>
                            <p className="text-sm text-gray-600 mb-4">
                              You're on the list for the ALLOX Community Sale.
                            </p>
                            <div className="flex flex-col items-center gap-2 mb-6">
                              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-xs font-mono text-gray-700">
                                  {walletAddress
                                    ? `${walletAddress.slice(0, 12)}...${walletAddress.slice(-6)}`
                                    : "Wallet confirmed"}
                                </span>
                              </div>
                              {(registration?.allocationUsd != null ||
                                wlAmount) && (
                                <div className="text-xs text-gray-500">
                                  Reserved allocation:{" "}
                                  <span className="font-bold text-gray-800">
                                    $
                                    {Number(
                                      registration?.allocationUsd ??
                                        parseFloat(wlAmount),
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                {successCountdown}
                              </div>
                              Returning in {successCountdown}s…
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <></>
                )}

                {(liveSaleKind === "private" || saleState === "live") && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Left — contribution form */}

                    <div className="lg:col-span-7 glass-card p-5 md:p-6 flex flex-col gap-5 justify-between">
                      <div className="flex sm:flex-row flex-col items-center justify-between gap-3">
                        <div className="flex sm:flex-row flex-col sm:items-center justify-between w-full">
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">
                              Make a Contribution
                            </h4>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {isPrivateSale
                                ? "Pick a tier, chain, and token, then invest."
                                : "Pick a plan, enter an amount, then review before confirming."}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 rounded-lg p-1">
                            <p className="text-sm text-gray-500">Network:</p>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1">
                              <img
                                src={PUBLIC_SALE_CHAIN_LOGO}
                                alt=""
                                className="w-5 h-5 rounded-full"
                              />
                              <span className="text-sm font-semibold text-gray-900">
                                {PUBLIC_SALE_CHAIN_NAME}
                              </span>
                            </span>
                          </div>
                        </div>
                        {/* <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 to-white px-4 py-3 min-w-42.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-indigo-400 mb-1">
                              Time Remaining
                            </div>
                            {isPrivateSale ? (
                              privateSale.saleLoading &&
                              privateSale.countdownSeconds == null ? (
                                <span className="text-sm text-gray-400">
                                  Loading…
                                </span>
                              ) : (
                                <Countdown
                                  date={LIVE_SALE_END}
                                  renderer={liveCountdownRenderer}
                                />
                              )
                            ) : (
                              <Countdown
                                date={LIVE_SALE_END}
                                renderer={liveCountdownRenderer}
                              />
                            )}
                          </div>
                        </div> */}
                      </div>

                      {isPrivateSale &&
                        !privateSale.saleLoading &&
                        !privateSale.saleError &&
                        privateSale.plans.length === 0 && (
                          <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800">
                              Private sale tiers are not available yet. Please
                              refresh the page in a moment.
                            </p>
                          </div>
                        )}

                      {isPrivateSale && privateSale.saleError && (
                        <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-red-700">
                            {privateSale.saleError}
                          </p>
                        </div>
                      )}

                      {isPrivateSale && isConnected && !isAuthenticated && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                          <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-gray-900 mb-0.5">
                                Sign in to contribute
                              </h5>
                              <p className="text-sm text-gray-600">
                                Sign in to invest.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <>
                        {/* Plan selector */}
                        <div>
                          <p className="text-sm font-semibold text-gray-600 mb-2.5">
                            Choose a plan
                          </p>
                          {isPrivateSale &&
                          privateSale.saleLoading &&
                          activePlans.length === 0 ? (
                            <div className="grid sm:grid-cols-3 grid-cols-1 gap-2.5">
                              {[0, 1, 2].map((i) => (
                                <div
                                  key={i}
                                  className="h-28 rounded-2xl border-2 border-gray-100 bg-gray-50 animate-pulse"
                                />
                              ))}
                            </div>
                          ) : (
                            <div className="grid sm:grid-cols-3 grid-cols-1 gap-2.5">
                              {activePlans.map((p) => {
                                const selected = effectivePlanId === p.id;
                                return (
                                  <button
                                    key={`${liveSaleKind}-${p.id}`}
                                    type="button"
                                    onClick={() =>
                                      isPrivateSale
                                        ? privateSale.setSelectedPlanId(p.id)
                                        : setLivePlanId(p.id)
                                    }
                                    className={`relative text-left p-3.5 rounded-2xl border-2 transition-all duration-200 ${
                                      selected
                                        ? isPrivateSale
                                          ? "border-amber-500 bg-amber-50/80 shadow-[0_0_0_4px_rgba(245,158,11,0.12)] scale-[1.01]"
                                          : "border-black bg-gray-50 shadow-[0_0_0_4px_rgba(0,0,0,0.08)] scale-[1.01]"
                                        : "border-gray-200/80 bg-white/70 hover:border-gray-400 hover:bg-white hover:shadow-md"
                                    }`}
                                  >
                                    {p.premium && (
                                      <span className="absolute -top-2 right-2 bg-amber-400 text-amber-950 text-[10px] font-black tracking-wide px-2 py-0.5 rounded-md shadow-sm">
                                        PREMIUM
                                      </span>
                                    )}
                                    <div
                                      className={`text-base font-bold ${
                                        selected
                                          ? isPrivateSale
                                            ? "text-amber-950"
                                            : "text-black"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      {p.name}
                                    </div>
                                    <div
                                      className={`text-sm mt-1 font-medium ${
                                        selected
                                          ? isPrivateSale
                                            ? "text-amber-700"
                                            : "text-black"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {p.discount}% discount
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5">
                                      ${(p.fdv / 1_000_000).toFixed(0)}M FDV
                                    </div>
                                    {/* {isPrivateSale && p.price > 0 && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          ${p.price} / ALLOX
                                        </div>
                                      )} */}
                                    {/* {isPrivateSale &&
                                        Number(p.contributions) > 0 && (
                                          <div className="text-[10px] text-gray-400 mt-1">
                                            {Number(
                                              p.contributions,
                                            ).toLocaleString()}{" "}
                                            contributions
                                          </div>
                                        )} */}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Chain + Amount */}
                        <div>
                          <div
                            className={`grid gap-3 ${
                              isPrivateSale && privateSale.chains.length > 0
                                ? "grid-cols-1 sm:grid-cols-[minmax(148px,180px)_1fr]"
                                : "grid-cols-1"
                            }`}
                          >
                            {isPrivateSale && privateSale.chains.length > 0 && (
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-600 mb-2">
                                  Chain
                                </p>
                                <div
                                  className="relative"
                                  ref={liveChainMenuRef}
                                >
                                  <button
                                    type="button"
                                    disabled={privateSale.switchingChain}
                                    onClick={() => {
                                      setLiveAssetOpen(false);
                                      setLiveChainOpen((o) => !o);
                                    }}
                                    className={`w-full h-[46px] flex items-center gap-2.5 px-3 rounded-xl border-2 bg-white/80 text-sm font-semibold transition-all disabled:opacity-60 ${
                                      liveChainOpen
                                        ? "border-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.12)]"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                                  >
                                    <img
                                      src={
                                        CHAIN_LOGOS[
                                          privateSale.selectedChainKey
                                        ] || CHAIN_LOGOS.BSC
                                      }
                                      alt=""
                                      className="w-4 h-4 rounded-full shrink-0"
                                    />
                                    <span className="flex-1 text-left text-gray-900 truncate">
                                      {privateSale.selectedChainKey === "BSC"
                                        ? "BNB Chain"
                                        : privateSale.selectedChainKey === "ETH"
                                          ? "Ethereum"
                                          : privateSale.selectedChainKey ===
                                              "BASE"
                                            ? "Base"
                                            : privateSale.selectedChainKey ===
                                                "SOL"
                                              ? "Solana"
                                              : privateSale.selectedChainKey ||
                                                "Select"}
                                    </span>
                                    {privateSale.switchingChain ? (
                                      <span className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
                                    ) : (
                                      <ChevronDown
                                        className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${
                                          liveChainOpen ? "rotate-180" : ""
                                        }`}
                                      />
                                    )}
                                  </button>
                                  {liveChainOpen && (
                                    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                                      {privateSale.availableChains.map(
                                        (chain) => {
                                          const selected =
                                            privateSale.selectedChainKey ===
                                            chain.key;
                                          return (
                                            <button
                                              key={chain.key}
                                              type="button"
                                              disabled={
                                                privateSale.switchingChain
                                              }
                                              onClick={() => {
                                                privateSale.selectChain(
                                                  chain.key,
                                                );
                                                setLiveChainOpen(false);
                                              }}
                                              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-semibold text-left transition-colors disabled:opacity-50 ${
                                                selected
                                                  ? "bg-amber-50 text-amber-950"
                                                  : "text-gray-700 hover:bg-gray-50"
                                              }`}
                                            >
                                              <img
                                                src={
                                                  CHAIN_LOGOS[chain.key] ||
                                                  CHAIN_LOGOS.BSC
                                                }
                                                alt=""
                                                className="w-4 h-4 rounded-full"
                                              />
                                              {chain.key === "BSC"
                                                ? "BNB Chain"
                                                : chain.key === "ETH"
                                                  ? "Ethereum"
                                                  : chain.key === "BASE"
                                                    ? "Base"
                                                    : "Solana"}
                                            </button>
                                          );
                                        },
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-semibold text-gray-600">
                                  Amount
                                </label>
                                <span className="text-xs font-medium text-gray-400">
                                  ${liveMinUsd.toLocaleString()} to $
                                  {liveMaxUsd.toLocaleString()}
                                </span>
                              </div>

                              <div
                                className={`relative flex items-stretch rounded-xl border-2 border-gray-200 bg-white/80 focus-within:border-indigo-500 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all ${
                                  isPrivateSale
                                    ? "focus-within:border-amber-500 focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.12)]"
                                    : ""
                                }`}
                              >
                                <div className="relative flex-1">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-base">
                                    $
                                  </span>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    autoComplete="off"
                                    maxLength={isPrivateSale ? 10 : 6}
                                    value={
                                      isPrivateSale
                                        ? privateSale.amountUsd
                                        : liveAmount
                                    }
                                    onChange={(e) =>
                                      isPrivateSale
                                        ? privateSale.setAmountUsd(
                                            e.target.value,
                                          )
                                        : setLiveAmount(e.target.value)
                                    }
                                    placeholder="0"
                                    disabled={
                                      isPrivateSale &&
                                      (!privateSale.saleActive ||
                                        privateSale.saleEnded)
                                    }
                                    className="w-full h-[46px] pl-7 pr-2 bg-transparent focus:outline-none text-xl font-bold text-gray-900 placeholder:text-gray-300 tabular-nums disabled:opacity-50"
                                  />
                                </div>
                                <div
                                  className="relative border-l border-gray-200"
                                  ref={liveAssetMenuRef}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setLiveChainOpen(false);
                                      setLiveAssetOpen((o) => !o);
                                    }}
                                    className="h-[46px] flex items-center gap-1.5 px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-r-[10px] transition-colors"
                                  >
                                    <img
                                      src={
                                        isPrivateSale
                                          ? TOKEN_LOGOS[
                                              privateSale.selectedToken?.symbol
                                            ] || TOKEN_LOGOS.USDC
                                          : LIVE_ASSET_LOGOS[liveAsset]
                                      }
                                      alt={
                                        isPrivateSale
                                          ? privateSale.selectedToken?.symbol
                                          : liveAsset
                                      }
                                      className="w-4 h-4 rounded-full flex-shrink-0"
                                    />
                                    {isPrivateSale
                                      ? privateSale.selectedToken?.symbol || "—"
                                      : liveAsset}
                                    <ChevronDown
                                      className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
                                        liveAssetOpen ? "rotate-180" : ""
                                      }`}
                                    />
                                  </button>
                                  {liveAssetOpen && (
                                    <div className="absolute right-0 top-[calc(100%+6px)] z-30 min-w-[140px] rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                                      {(isPrivateSale
                                        ? privateSale.availableTokens
                                        : LIVE_ASSETS.map((symbol) => ({
                                            symbol,
                                          }))
                                      ).map((asset) => {
                                        const symbol = asset.symbol || asset;
                                        return (
                                          <button
                                            key={symbol}
                                            type="button"
                                            onClick={() => {
                                              if (isPrivateSale) {
                                                privateSale.setSelectedTokenSymbol(
                                                  symbol,
                                                );
                                              } else {
                                                setLiveAsset(symbol);
                                              }
                                              setLiveAssetOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-semibold text-left transition-colors ${
                                              (
                                                isPrivateSale
                                                  ? privateSale.selectedToken
                                                      ?.symbol === symbol
                                                  : liveAsset === symbol
                                              )
                                                ? isPrivateSale
                                                  ? "bg-amber-50 text-amber-950"
                                                  : "bg-indigo-50 text-indigo-700"
                                                : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                          >
                                            <img
                                              src={
                                                isPrivateSale
                                                  ? TOKEN_LOGOS[symbol] ||
                                                    TOKEN_LOGOS.USDC
                                                  : LIVE_ASSET_LOGOS[symbol]
                                              }
                                              alt={symbol}
                                              className="w-4 h-4 rounded-full"
                                            />
                                            {symbol}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 mt-2.5">
                            <div className="flex flex-wrap gap-2">
                              {LIVE_PRESETS.map((p) => {
                                const v =
                                  p === "MAX"
                                    ? String(
                                        isPrivateSale
                                          ? privateMaxAmount
                                          : liveMaxAmount,
                                      )
                                    : p.replace(/[$,]/g, "");
                                const currentAmount = isPrivateSale
                                  ? privateSale.amountUsd
                                  : liveAmount;
                                const active = currentAmount === v;
                                const disabled =
                                  p === "MAX" &&
                                  (isPrivateSale
                                    ? !isConnected ||
                                      privateSale.tokenBalanceLoading ||
                                      privateMaxAmount <= 0
                                    : !isConnected ||
                                      wlStatusLoading ||
                                      liveMaxAmount <= 0);
                                return (
                                  <button
                                    key={p}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() =>
                                      isPrivateSale
                                        ? privateSale.setAmountUsd(v)
                                        : setLiveAmount(v)
                                    }
                                    className={`min-w-[56px] px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${
                                      active
                                        ? "bg-black text-white shadow-sm"
                                        : "border-gray-200 bg-white/70 text-gray-700 hover:border-black-300 hover:bg-black/5"
                                    }`}
                                  >
                                    {p}
                                  </button>
                                );
                              })}
                            </div>
                            {isPrivateSale ? (
                              <span className="text-sm text-gray-500">
                                Balance{" "}
                                <span className="font-semibold text-gray-700">
                                  {!isConnected
                                    ? `— ${privateSale.selectedToken?.symbol || ""}`
                                    : privateSale.tokenBalanceLoading &&
                                        !privateSale.tokenBalance
                                      ? "Loading…"
                                      : `${formatLiveBalance(
                                          privateSale.tokenBalance?.amount,
                                        )} ${
                                          privateSale.tokenBalance?.symbol ||
                                          privateSale.selectedToken?.symbol ||
                                          ""
                                        }`}
                                </span>
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">
                                Balance{" "}
                                <span className="font-semibold text-gray-700">
                                  {!isConnected
                                    ? `— ${liveAsset}`
                                    : wlStatusLoading && !liveAssetBalanceKnown
                                      ? "Loading…"
                                      : `${formatLiveBalance(liveAssetBalanceUsd)} ${liveAsset}`}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>

                        {isPrivateSale &&
                          privateSale.contributeResult?.status ===
                            "pending" && (
                            <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-blue-700">
                                Confirming on-chain — this can take a few
                                minutes. Your position will update
                                automatically.
                              </p>
                            </div>
                          )}

                        {isPrivateSale &&
                          privateSale.contributeResult?.status ===
                            "verified" && (
                            <div className="flex items-start gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-emerald-800">
                                  Contribution verified!
                                </p>
                                {privateSale.contributeResult
                                  .allocationTokens != null && (
                                  <p className="text-xs text-emerald-700 mt-0.5">
                                    Estimated allocation:{" "}
                                    {formatCompactNumber(
                                      privateSale.contributeResult
                                        .allocationTokens,
                                    )}{" "}
                                    ALLOX
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Public sale: Sonar purchase flow status */}
                        {!isPrivateSale && isConnected && (
                          <div className="flex flex-col gap-2">
                            {publicCommittedUsd > 0 && (
                              <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                                <span className="text-gray-500">
                                  Your current commitment
                                </span>
                                <span className="font-bold text-gray-900 tabular-nums">
                                  $
                                  {publicCommittedUsd.toLocaleString(
                                    undefined,
                                    { maximumFractionDigits: 2 },
                                  )}
                                  {liveNum > 0 && (
                                    <span className="font-medium text-gray-500">
                                      {" "}
                                      → $
                                      {(
                                        publicCommittedUsd + liveNum
                                      ).toLocaleString(undefined, {
                                        maximumFractionDigits: 2,
                                      })}{" "}
                                      after this
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}

                            {publicPurchase.saleInfoError && (
                              <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-red-700">
                                  {publicPurchase.saleInfoError}
                                </p>
                              </div>
                            )}

                            {publicPurchase.saleInfo?.saleUUIDMatches ===
                              false && (
                              <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-red-700">
                                  The sale contract doesn't match this Sonar
                                  sale. Commitments are disabled until this is
                                  fixed.
                                </p>
                              </div>
                            )}

                            {publicPurchase.saleInfo?.paused && (
                              <div className="flex items-start gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                                <Clock className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-gray-700">
                                  The sale is paused. Commitments will reopen
                                  when it resumes.
                                </p>
                              </div>
                            )}

                            {publicPurchase.failure && (
                              <div
                                className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border ${
                                  publicPurchase.failure.tone === "red"
                                    ? "bg-red-50 border-red-200"
                                    : publicPurchase.failure.tone === "amber"
                                      ? "bg-amber-50 border-amber-200"
                                      : "bg-gray-50 border-gray-200"
                                }`}
                              >
                                <AlertCircle
                                  className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                                    publicPurchase.failure.tone === "red"
                                      ? "text-red-500"
                                      : publicPurchase.failure.tone === "amber"
                                        ? "text-amber-600"
                                        : "text-gray-500"
                                  }`}
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-gray-900">
                                    {publicPurchase.failure.title}
                                  </p>
                                  <p className="text-xs text-gray-700 mt-0.5">
                                    {publicPurchase.failure.detail}
                                  </p>
                                  <div className="flex flex-wrap gap-3 mt-1.5">
                                    {publicPurchase.failure.action ===
                                      "liveness" &&
                                      publicPurchase.failure
                                        .livenessCheckURL && (
                                        <a
                                          href={
                                            publicPurchase.failure
                                              .livenessCheckURL
                                          }
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                                        >
                                          Start liveness check
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      )}
                                    {publicPurchase.failure.action ===
                                      "sonar" && (
                                      <a
                                        href={publicPurchase.sonarHomeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                                      >
                                        Open Sonar
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                    {publicPurchase.failure.action ===
                                      "switchWallet" && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          dispatch(setWalletModal(true))
                                        }
                                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                                      >
                                        Connect a different wallet
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={publicPurchase.clearResult}
                                      className="text-xs font-semibold text-gray-500 hover:text-gray-700"
                                    >
                                      Dismiss
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {publicPurchase.error && (
                              <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-red-700 break-words min-w-0">
                                  {publicPurchase.error}
                                </p>
                              </div>
                            )}

                            {publicPurchase.busy && (
                              <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700">
                                  {PURCHASE_STEP_LABELS[publicPurchase.step]}
                                  {publicPurchase.step === "approving" &&
                                    " This lets the sale contract take the amount you're committing."}
                                </p>
                              </div>
                            )}

                            {publicPurchase.step === "success" && (
                              <div className="flex items-start gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-emerald-800">
                                    Commitment confirmed
                                    {lastPublicTx?.status && (
                                      <span className="ml-1.5 font-medium capitalize text-emerald-700">
                                        · {lastPublicTx.status}
                                      </span>
                                    )}
                                  </p>
                                  {publicPurchase.lastTxHash && (
                                    <a
                                      href={
                                        lastPublicTx?.explorerUrl ||
                                        `${TX_EXPLORERS[PUBLIC_SALE_CHAIN_NAME]}${publicPurchase.lastTxHash}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline mt-0.5"
                                    >
                                      View on Etherscan
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Eligibility status for the selected entity.
                            Only KYC-verified, eligible entities can buy in the live sale. */}
                        {!isPrivateSale &&
                          isConnected &&
                          sonar.configured &&
                          sonar.authenticated && (
                            <SonarStatusInline
                              status={sonar.status}
                              entity={sonar.activeEntity}
                              onDisconnect={sonar.logout}
                              loading={sonar.entitiesLoading}
                              error={sonar.entitiesError}
                              showEligible
                            />
                          )}

                        {/* Sonar requires telling U.S. investors about the
                            forced lockup their commitments carry. */}
                        {!isPrivateSale && publicPurchase.requiresLockup && (
                          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-3">
                            <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-700">
                              <span className="font-bold text-gray-900">
                                Lockup applies to U.S. investors.
                              </span>{" "}
                              Your tokens will be subject to a mandatory vesting
                              lockup, in addition to your plan's schedule. See
                              section 6.3 of the{" "}
                              <button
                                type="button"
                                onClick={() => setLiveTermsOpen(true)}
                                className="underline font-semibold"
                              >
                                Sale Terms
                              </button>
                              .
                            </p>
                          </div>
                        )}

                        {/* CTA */}
                        <button
                          type="button"
                          disabled={
                            isPrivateSale && privateSale.contributing
                              ? true
                              : isPrivateSale && !isConnected
                                ? false
                                : isPrivateSale &&
                                    isConnected &&
                                    !isAuthenticated
                                  ? false
                                  : !isPrivateSale && !isConnected
                                    ? false
                                    : !isPrivateSale && needsSonarConnect
                                      ? !sonar.ready
                                      : !isPrivateSale &&
                                          (needsSaleChainSwitch ||
                                            sonarNeedsSonarStep)
                                        ? false
                                        : !liveCanSubmit ||
                                          (isPrivateSale &&
                                            privateSale.contributing)
                          }
                          onClick={() => {
                            if (!isPrivateSale) {
                              if (!isConnected) {
                                dispatch(setWalletModal(true));
                                return;
                              }
                              if (needsSonarConnect) {
                                sonar.connectSonar();
                                return;
                              }
                              if (needsSaleChainSwitch) {
                                switchToSaleChain();
                                return;
                              }
                              if (sonarNeedsSonarStep) {
                                openSonar();
                                return;
                              }
                              if (!liveCanSubmit) return;
                              publicPurchase
                                .commit({
                                  amountUsd: liveAmount,
                                  tokenSymbol: liveAsset,
                                  tierId: livePlan?.tierId,
                                })
                                .then((ok) => {
                                  if (!ok) return;
                                  setLiveAmount("");
                                  publicSale.refreshPosition();
                                });
                              return;
                            }
                            if (!isConnected) {
                              dispatch(setWalletModal(true));
                              return;
                            }
                            if (!isAuthenticated) {
                              ensureAuthenticated();
                              return;
                            }
                            privateSale.contribute();
                          }}
                          className={`w-full font-bold py-4 rounded-2xl text-base transition-all duration-200 ${
                            (!isPrivateSale && !isConnected) ||
                            (!isPrivateSale &&
                              isConnected &&
                              !isAuthenticated) ||
                            (!isPrivateSale &&
                              isConnected &&
                              (needsSonarConnect ||
                                needsSaleChainSwitch ||
                                sonarNeedsSonarStep ||
                                liveCanSubmit)) ||
                            (liveCanSubmit && !privateSale.contributing)
                              ? "bg-black text-white hover:bg-gray-800 active:scale-[0.99]"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {isPrivateSale && privateSale.contributing
                            ? "Processing…"
                            : !isPrivateSale && publicPurchase.busy
                              ? PURCHASE_STEP_LABELS[publicPurchase.step] ||
                                "Processing…"
                              : isPrivateSale && !isConnected
                                ? "Connect Wallet"
                                : isPrivateSale && !isAuthenticated
                                  ? "Sign In"
                                  : !isPrivateSale && !isConnected
                                    ? "Connect Wallet"
                                    : !isPrivateSale && needsSonarConnect
                                      ? "Connect with Sonar"
                                      : !isPrivateSale && needsSaleChainSwitch
                                        ? `Switch to ${PUBLIC_SALE_CHAIN_NAME}`
                                        : !isPrivateSale && sonarBlockedLabel
                                          ? sonarBlockedLabel
                                          : !isPrivateSale &&
                                              publicPurchase.saleInfo?.paused
                                            ? "Sale paused"
                                            : !isPrivateSale &&
                                                liveNum > 0 &&
                                                liveInsufficientBalance
                                              ? `Insufficient ${liveAsset} balance`
                                              : isPrivateSale &&
                                                  !privateSale.saleActive
                                                ? privateSale.saleEnded
                                                  ? "Sale Ended"
                                                  : "Sale Not Active"
                                                : liveNum <= 0
                                                  ? "Enter Amount"
                                                  : liveNum < liveMinUsd
                                                    ? `Minimum is $${liveMinUsd.toLocaleString()}`
                                                    : liveNum > liveMaxUsd
                                                      ? "Amount exceeds maximum"
                                                      : "Invest"}
                        </button>
                      </>
                    </div>

                    {/* Right — estimated allocation */}
                    <div className="lg:col-span-5 glass-card p-5 md:p-6 flex flex-col gap-5 relative overflow-visible">
                      <div className="flex items-center justify-between relative">
                        <div
                          className="relative flex items-center gap-1.5"
                          ref={investHistoryPopupRef}
                        >
                          <span className="text-sm font-semibold text-gray-500">
                            Estimated allocation
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setInvestHistoryOpen((open) => !open)
                            }
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full border transition-colors relative ${
                              investHistoryOpen
                                ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                                : "border-gray-200 bg-white/80 text-gray-400 hover:border-indigo-200 hover:text-indigo-500 hover:bg-indigo-50/60"
                            }`}
                            aria-label="View investment history"
                            aria-expanded={investHistoryOpen}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            {isPrivateSale &&
                              privatePositionContributions.length > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-3.5 h-3.5 px-0.5 rounded-full bg-indigo-500 text-white text-[9px] font-bold leading-none flex items-center justify-center">
                                  {privatePositionContributions.length}
                                </span>
                              )}
                          </button>

                          <AnimatePresence>
                            {investHistoryOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                transition={{ duration: 0.12 }}
                                className="absolute left-0 top-full mt-2 w-[min(100vw-2rem,20rem)] z-30"
                              >
                                <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3.5">
                                  <div className="flex items-center justify-between mb-2.5">
                                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                      Your investments
                                    </span>
                                    <span className="text-[11px] font-bold text-gray-700">
                                      {
                                        (isPrivateSale
                                          ? privatePositionContributions
                                          : publicInvestments
                                        ).length
                                      }{" "}
                                      {isPrivateSale || publicTransactions
                                        ? "tx"
                                        : "tokens"}
                                    </span>
                                  </div>

                                  {(isPrivateSale
                                    ? privatePositionContributions
                                    : publicInvestments
                                  ).length > 0 ? (
                                    <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                                      {(isPrivateSale
                                        ? privatePositionContributions
                                        : publicInvestments
                                      ).map((inv, idx) => {
                                        const chainKey = isPrivateSale
                                          ? String(
                                              inv.chain || "",
                                            ).toUpperCase()
                                          : inv.network;
                                        const explorer = isPrivateSale
                                          ? CHAIN_EXPLORERS[chainKey] ||
                                            CHAIN_EXPLORERS.BSC
                                          : TX_EXPLORERS[inv.network] ||
                                            TX_EXPLORERS[
                                              PUBLIC_SALE_CHAIN_NAME
                                            ];
                                        const token = String(
                                          inv.token || "",
                                        ).toUpperCase();
                                        const txHash = inv.txHash;
                                        const amount = isPrivateSale
                                          ? inv.amountUsd
                                          : inv.amount;
                                        const status = inv.status || null;
                                        const allocation = isPrivateSale
                                          ? Number(inv.allocationTokens) || 0
                                          : 0;
                                        const when =
                                          isPrivateSale && inv.at
                                            ? new Date(
                                                inv.at,
                                              ).toLocaleDateString(undefined, {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                              })
                                            : null;
                                        return (
                                          <div
                                            key={
                                              isPrivateSale
                                                ? `${txHash || "tx"}-${idx}`
                                                : inv.id
                                            }
                                            className="rounded-lg border border-gray-100 bg-gray-50/80 px-2.5 py-2"
                                          >
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                              <span className="text-[11px] font-medium text-gray-400">
                                                {isPrivateSale
                                                  ? inv.tier || "—"
                                                  : inv.date}
                                                {when && (
                                                  <span className="ml-1.5">
                                                    · {when}
                                                  </span>
                                                )}
                                                {status && (
                                                  <span
                                                    className={`ml-1.5 capitalize ${
                                                      [
                                                        "verified",
                                                        "confirmed",
                                                        "success",
                                                      ].includes(
                                                        String(
                                                          status,
                                                        ).toLowerCase(),
                                                      )
                                                        ? "text-emerald-600"
                                                        : status === "pending"
                                                          ? "text-amber-600"
                                                          : "text-red-500"
                                                    }`}
                                                  >
                                                    · {status}
                                                  </span>
                                                )}
                                              </span>
                                              <span className="text-xs font-bold text-gray-900 tabular-nums">
                                                $
                                                {Number(
                                                  amount || 0,
                                                ).toLocaleString()}
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 text-[11px]">
                                              <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
                                                <img
                                                  src={
                                                    isPrivateSale
                                                      ? TOKEN_LOGOS[token] ||
                                                        TOKEN_LOGOS.USDC
                                                      : LIVE_ASSET_LOGOS[
                                                          inv.token
                                                        ]
                                                  }
                                                  alt=""
                                                  className="w-3 h-3 rounded-full"
                                                />
                                                {token || "—"}
                                                <span className="font-medium text-gray-400">
                                                  · {chainKey || "—"}
                                                </span>
                                              </span>
                                              {txHash && (
                                                <a
                                                  href={
                                                    inv.explorerUrl ||
                                                    `${explorer}${txHash}`
                                                  }
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="inline-flex items-center gap-0.5 font-semibold text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-2"
                                                >
                                                  {shortenTxHash(txHash)}
                                                  <ExternalLink className="w-2.5 h-2.5" />
                                                </a>
                                              )}
                                            </div>
                                            {isPrivateSale &&
                                              allocation > 0 && (
                                                <div className="mt-1 text-[11px] font-semibold text-gray-600">
                                                  {formatCompactNumber(
                                                    allocation,
                                                  )}{" "}
                                                  ALLOX
                                                </div>
                                              )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-400 py-2">
                                      No investments yet. Your contributions
                                      will show up here.
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <button
                          type="button"
                          onClick={() => setLiveTermsOpen(true)}
                          className="font-semibold text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
                        >
                          Sale Terms
                        </button>
                      </div>

                      <div className="relative">
                        {livePlan ? (
                          <motion.div
                            key={livePlan.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="text-2xl font-bold text-gray-900">
                              {livePlan.name}
                            </div>
                            <div className="text-sm text-gray-400 mt-0.5">
                              ${(livePlan.fdv / 1_000_000).toFixed(0)}M FDV
                            </div>
                          </motion.div>
                        ) : (
                          <div className="h-14 rounded-xl bg-gray-50 animate-pulse" />
                        )}
                      </div>

                      <div className="relative pl-3.5 border-l-[3px] border-indigo-500">
                        <div className="text-3xl md:text-4xl font-bold text-gray-900 tabular-nums tracking-tight">
                          {hasPosition && liveNum <= 0
                            ? formatCompactNumber(positionTokens)
                            : liveAllox}{" "}
                          ALLOX
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          {hasPosition && liveNum <= 0
                            ? isPrivateSale
                              ? `Your ${livePlan?.name || "tier"} contribution`
                              : "Your commitment"
                            : "Contribution preview"}{" "}
                          <span className="font-bold text-gray-900">
                            {hasPosition && liveNum <= 0
                              ? `$${positionUsd.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })}`
                              : `$${liveNum.toLocaleString(undefined, {
                                  minimumFractionDigits: liveNum ? 2 : 0,
                                  maximumFractionDigits: 2,
                                })}`}
                          </span>
                        </div>
                        {isPrivateSale &&
                          privateSale.positionLoading &&
                          !hasPosition && (
                            <p className="text-xs text-gray-400 mt-1.5">
                              Loading your position…
                            </p>
                          )}
                        {hasPosition && liveNum > 0 && (
                          <p className="text-xs text-gray-500 mt-1.5">
                            {isPrivateSale
                              ? `Current ${livePlan?.name || "tier"} position:`
                              : "Current commitment:"}{" "}
                            <span className="font-semibold text-gray-800">
                              {formatCompactNumber(positionTokens)} ALLOX
                            </span>
                            {" · "}
                            <span className="font-semibold text-gray-800">
                              $
                              {positionUsd.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}{" "}
                              contributed
                            </span>
                          </p>
                        )}
                        {positionTokens > 0 && liveNum > 0 && (
                          <p className="text-xs text-indigo-600 mt-1.5 font-medium">
                            + {formatCompactNumber(liveTokensRaw)} ALLOX from
                            current entry
                          </p>
                        )}
                        {isPrivateSale &&
                          (Number(privateSale.position?.pendingCount) || 0) >
                            0 && (
                            <p className="text-xs text-amber-600 mt-1.5 font-medium">
                              {privateSale.position.pendingCount} contribution
                              {privateSale.position.pendingCount !== 1
                                ? "s"
                                : ""}{" "}
                              confirming…
                            </p>
                          )}
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-4 relative">
                        {!livePlan
                          ? [0, 1, 2, 3, 4, 5].map((i) => (
                              <div
                                key={i}
                                className="h-12 rounded-lg bg-gray-50 animate-pulse"
                              />
                            ))
                          : [
                              {
                                icon: CreditCard,
                                label: "Token price",
                                value: `$${Number(livePlan.price)
                                  .toFixed(6)
                                  .replace(/\.?0+$/, "")}`,
                              },
                              {
                                icon: Percent,
                                label: "% Discount",
                                value: `${livePlan.discount}%`,
                                accent: livePlan.discount > 0,
                              },
                              {
                                icon: Zap,
                                label: "Available at TGE (estimated)",
                                value: `${liveTgeTokens} ALLOX`,
                              },
                              {
                                icon: Lock,
                                label: "Locked (estimated)",
                                value: `${liveLockedTokens} ALLOX`,
                              },
                              {
                                icon: Clock,
                                label: "Lock period",
                                value: livePlan.cliff,
                                warn: livePlan.cliff !== "None",
                              },
                              {
                                icon: Layers,
                                label: "Vesting",
                                value: livePlan.vesting,
                              },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className="flex items-start gap-2.5 min-w-0"
                              >
                                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50 border border-gray-100">
                                  <item.icon className="w-3.5 h-3.5 text-gray-400" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs text-gray-500 leading-snug">
                                    {item.label}
                                  </div>
                                  <div
                                    className={`text-sm font-bold mt-0.5 truncate ${
                                      item.warn
                                        ? "text-amber-600"
                                        : item.accent
                                          ? "text-indigo-600"
                                          : "text-gray-900"
                                    }`}
                                  >
                                    {item.value}
                                  </div>
                                </div>
                              </div>
                            ))}
                      </div>

                      {/* Unlock schedule */}
                      {livePlan && (
                        <div className="relative mt-auto pt-1">
                          <div className="text-sm font-semibold text-gray-600 mb-2.5">
                            Unlock schedule
                          </div>
                          {livePlan.tgePct >= 100 ? (
                            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-sm font-semibold text-emerald-800">
                              <span>TGE</span>
                              <span>100% unlocked</span>
                            </div>
                          ) : livePlan.tgePct > 0 ? (
                            <div className="flex rounded-xl overflow-hidden text-sm font-semibold border border-indigo-100">
                              <div
                                className="px-3 py-3 bg-indigo-500 text-white text-center"
                                style={{ flex: livePlan.tgePct }}
                              >
                                {livePlan.tgePct}% at TGE
                              </div>
                              <div
                                className="px-3 py-3 bg-indigo-50 text-indigo-700 text-center"
                                style={{ flex: 100 - livePlan.tgePct }}
                              >
                                {livePlan.vesting}
                              </div>
                            </div>
                          ) : (
                            <div className="flex rounded-xl overflow-hidden text-sm font-semibold border border-amber-100">
                              <div className="flex-1 px-3 py-3 bg-amber-400/90 text-amber-950 text-center">
                                {livePlan.cliff} lock
                              </div>
                              <div className="flex-1 px-3 py-3 bg-indigo-500 text-white text-center">
                                {livePlan.vesting}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <section
                  className="rounded-3xl overflow-hidden theme-island"
                  style={{
                    background: "#0b0b0d",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="px-5 sm:px-8 pt-8 sm:pt-10 pb-8 sm:pb-10">
                    <div className="max-w-3xl mb-8 sm:mb-10">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={`h-px w-6 ${
                            liveSaleKind === "private"
                              ? "bg-amber-400"
                              : "bg-indigo-400"
                          }`}
                        />
                        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
                          How the {liveSaleKind} sale works
                        </span>
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                        Five steps, zero uncertainty.
                      </h3>
                      <p className="mt-3 text-sm sm:text-base text-white/50 leading-relaxed max-w-2xl">
                        A transparent path from Sonar verification to tokens, so
                        you always know what to expect.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-3.5">
                      {activeSaleSteps.map((step, i) => {
                        const Icon = step.icon;
                        return (
                          <motion.div
                            key={`${liveSaleKind}-${step.n}`}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06, duration: 0.35 }}
                            className="group relative rounded-2xl p-4 sm:p-5 flex flex-col min-h-[210px] transition-colors"
                            style={{
                              background: "rgba(255,255,255,0.035)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor =
                                liveSaleKind === "private"
                                  ? "rgba(251,191,36,0.45)"
                                  : "rgba(129,140,248,0.45)";
                              e.currentTarget.style.background =
                                liveSaleKind === "private"
                                  ? "rgba(251,191,36,0.08)"
                                  : "rgba(129,140,248,0.08)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor =
                                "rgba(255,255,255,0.08)";
                              e.currentTarget.style.background =
                                "rgba(255,255,255,0.035)";
                            }}
                          >
                            <div className="flex items-start justify-between mb-5">
                              <span
                                className="inline-flex items-center justify-center min-w-[2.25rem] h-7 px-2 rounded-lg text-[11px] font-black tracking-wide"
                                style={{
                                  background:
                                    liveSaleKind === "private"
                                      ? "rgba(251,191,36,0.2)"
                                      : "rgba(129,140,248,0.2)",
                                  color:
                                    liveSaleKind === "private"
                                      ? "#fcd34d"
                                      : "#a5b4fc",
                                  border:
                                    liveSaleKind === "private"
                                      ? "1px solid rgba(251,191,36,0.35)"
                                      : "1px solid rgba(129,140,248,0.35)",
                                }}
                              >
                                {step.n}
                              </span>
                              <Icon
                                className={`w-5 h-5 text-white/70 transition-colors ${
                                  liveSaleKind === "private"
                                    ? "group-hover:text-amber-300"
                                    : "group-hover:text-indigo-300"
                                }`}
                                strokeWidth={1.75}
                              />
                            </div>
                            <h4 className="text-base font-bold text-white mb-2 leading-snug">
                              {step.title}
                            </h4>
                            <p className="text-sm text-white/45 leading-relaxed">
                              {step.desc}
                            </p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              </motion.div>
            </AnimatePresence>
          </motion.div>
          {/* )} */}
        </AnimatePresence>
        {saleState === "live" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-4"
          >
            {/* Section header + Form button */}
            <div className="flex items-center justify-between gap-3 my-4">
              <div>
                <h3 className="text-2xl font-black text-gray-900">
                  Referral Program
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Earn ALLOX on every investment your referrals make.
                </p>
              </div>
            </div>

            <div className="glass-card grid grid-cols-1 md:grid-cols-2 overflow-hidden">
              {/* LEFT — how it works, link, stats */}
              <div className="p-6 flex flex-col gap-5 border-b md:border-b-0 md:border-r border-gray-200">
                <div className="space-y-3">
                  {[
                    "Share your referral link with anyone",
                    "They invest in the ALLOX Community Sale",
                    "You earn ALLOX on their investment",
                  ].map((text, i) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-900 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-800">{text}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Your Referral Link
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 min-w-0 truncate px-3 py-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 font-mono">
                      {refLink ||
                        (!isConnected
                          ? "Connect wallet to get your referral link"
                          : !isAuthenticated
                            ? "Sign in to get your referral link"
                            : publicSale.referralLoading
                              ? "Loading…"
                              : "—")}
                    </span>
                    <button
                      onClick={copyRef}
                      disabled={isConnected && isAuthenticated && !refLink}
                      className={`flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold text-white flex-shrink-0 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${
                        copied ? "bg-green-500" : "bg-indigo-900"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : !isConnected ? (
                        "Connect wallet"
                      ) : !isAuthenticated ? (
                        "Sign in"
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    {
                      label: "Invited",
                      value: referredInvestors.length.toLocaleString(),
                    },
                    {
                      label: "Investors",
                      value: refInvestorCount.toLocaleString(),
                    },
                    { label: "Total Volume", value: fmtRefUsd(refVolumeUsd) },
                    {
                      label: "Conversion",
                      value: `${
                        referredInvestors.length
                          ? Math.round(
                              (refInvestorCount / referredInvestors.length) *
                                100,
                            )
                          : 0
                      }%`,
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-xl px-4 py-3 bg-gray-50"
                    >
                      <div className="text-xs text-gray-500">{s.label}</div>
                      <div className="text-xl font-black text-gray-900">
                        {s.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT — referred investors */}
              <div className="p-6 flex flex-col gap-3 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-black text-gray-900 text-lg">
                    Referred Investors
                  </div>
                  <div className="flex p-1 rounded-xl bg-gray-100">
                    {[
                      ["all", "All", referredInvestors.length],
                      ["invested", "Invested", refInvestorCount],
                      [
                        "invited",
                        "Invited",
                        referredInvestors.length - refInvestorCount,
                      ],
                    ].map(([key, label, count]) => (
                      <button
                        key={key}
                        onClick={() => setRefTab(key)}
                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all ${
                          refTab === key
                            ? "bg-white font-bold text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {label} <span className="text-gray-500">{count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {visibleReferrals.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
                      <UserPlus className="w-5 h-5 text-indigo-700" />
                    </div>
                    <div className="font-black text-gray-900">
                      {!isAuthenticated
                        ? "Sign in to see your referrals"
                        : publicSale.referralLoading
                          ? "Loading referrals…"
                          : "No referrals yet"}
                    </div>
                    {isAuthenticated && !publicSale.referralLoading && (
                      <p className="text-sm text-gray-500 mt-1 max-w-xs">
                        Share your link. Everyone who joins with it shows up
                        here.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="overflow-auto max-h-[298px]">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 z-10 bg-white">
                        <tr className="border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                          <th className="py-2 pr-2 text-left font-bold">
                            Wallet
                          </th>
                          <th className="py-2 px-2 text-left font-bold">
                            Status
                          </th>
                          <th className="py-2 px-2 text-right font-bold">
                            Invested
                          </th>
                          <th className="py-2 pl-2 text-right font-bold whitespace-nowrap">
                            Your Reward
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleReferrals.map((r, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="py-3 pr-2">
                              <div className="font-mono font-semibold text-gray-900 text-xs sm:text-sm">
                                {shortWallet(r.wallet)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {r.at
                                  ? new Date(r.at).toLocaleDateString(
                                      undefined,
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      },
                                    )
                                  : ""}
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  r.status === "invested"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {r.status === "invested"
                                  ? "Invested"
                                  : "Invited"}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right font-semibold text-gray-900">
                              {fmtRefUsd(r.investedUsd)}
                            </td>
                            <td
                              className={`py-3 pl-2 text-right font-bold ${
                                r.rewardUsd > 0
                                  ? "text-indigo-700"
                                  : "text-gray-500"
                              }`}
                            >
                              {r.rewardUsd > 0 ? "+" : ""}
                              {fmtRefUsd(r.rewardUsd)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="sticky bottom-0 bg-white">
                        <tr className="font-black">
                          <td className="pt-3 text-gray-900" colSpan={2}>
                            Total
                          </td>
                          <td className="pt-3 px-2 text-right text-gray-900">
                            {fmtRefUsd(
                              visibleReferrals.reduce(
                                (s, r) => s + r.investedUsd,
                                0,
                              ),
                            )}
                          </td>
                          <td className="pt-3 pl-2 text-right text-indigo-700">
                            {fmtRefUsd(
                              visibleReferrals.reduce(
                                (s, r) => s + r.rewardUsd,
                                0,
                              ),
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ══ SECTION JUMP LINKS ══ */}
        <nav
          aria-label="Page sections"
          className="my-6 rounded-2xl px-4 sm:px-6 py-4 overflow-x-auto text-black"
        >
          <ul className="flex items-center gap-5 sm:gap-7 min-w-max justify-center">
            {[
              { id: "sale-key-milestones", label: "Key milestones" },
              { id: "sale-tokenomics", label: "Tokenomics" },
              { id: "sale-partners", label: "Partners" },
              { id: "sale-traction", label: "Traction" },
            ].map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(item.id);
                    if (!el) return;
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="inline-flex text-black items-center gap-1 text-sm sm:text-[15px] font-medium transition-opacity hover:opacity-80"
                >
                  {item.label}
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* ══ KEY MILESTONES ══ */}
        <section
          id="sale-key-milestones"
          className="rounded-3xl overflow-hidden mb-4 scroll-mt-6 theme-island"
          style={{
            background: "#0b0b0d",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div className="px-5 sm:px-8 pt-8 sm:pt-10 pb-8 sm:pb-10">
            <div className="max-w-3xl mb-8 sm:mb-12">
              <div className="flex items-center gap-3 mb-3">
                <span className="h-px w-6 bg-indigo-400" />
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
                  Key milestones
                </span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                Execution momentum.
              </h3>
              <p className="mt-3 text-sm sm:text-base text-white/50 leading-relaxed max-w-2xl">
                From first on-chain product to token sale, a track record of
                shipping and scaling real capital allocation infrastructure.
              </p>
            </div>

            <div
              className="overflow-x-auto snap-x snap-mandatory -mx-5 px-5 sm:-mx-8 sm:px-8 pb-3 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]"
              style={{
                WebkitOverflowScrolling: "touch",
              }}
            >
              <div
                className="relative flex w-max gap-3.5"
                style={{ paddingTop: "1.75rem" }}
              >
                <div
                  className="absolute left-0 right-0 h-px pointer-events-none"
                  style={{
                    top: "calc(1.75rem + 0.7rem)",
                    background: "rgba(255,255,255,0.12)",
                  }}
                  aria-hidden
                />

                {KEY_MILESTONES.map((milestone, i) => {
                  const isActive = milestone.status === "active";
                  const accent = isActive ? "#a855f7" : "#4ade80";
                  return (
                    <motion.div
                      key={milestone.title}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: i * 0.06,
                        duration: 0.35,
                      }}
                      className="relative flex w-[220px] sm:w-[240px] shrink-0 flex-col snap-start"
                    >
                      <div className="relative z-10 flex flex-col items-center mb-5">
                        <span
                          className="absolute -top-5 text-[9px] font-bold uppercase tracking-[0.14em] whitespace-nowrap"
                          style={{ color: accent }}
                        >
                          {isActive ? "• Active" : "Completed"}
                        </span>
                        <span
                          className="relative block w-3 h-3 rounded-full"
                          style={{
                            background: accent,
                            boxShadow: isActive
                              ? "0 0 0 4px rgba(168,85,247,0.25), 0 0 16px rgba(168,85,247,0.55)"
                              : "0 0 0 3px rgba(74,222,128,0.18)",
                          }}
                          aria-hidden
                        />
                      </div>

                      <div
                        tabIndex={0}
                        className={`group rounded-2xl p-4 sm:p-5 flex flex-col min-h-[210px] transition-all duration-300 ease-out outline-none hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0d] ${
                          isActive
                            ? "focus-visible:ring-purple-400"
                            : "focus-visible:ring-emerald-400"
                        }`}
                        style={{
                          background: "rgba(255,255,255,0.035)",
                          border: isActive
                            ? "1px solid rgba(168,85,247,0.55)"
                            : "1px solid rgba(255,255,255,0.08)",
                          boxShadow: isActive
                            ? "0 0 24px rgba(168,85,247,0.12)"
                            : "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = isActive
                            ? "rgba(168,85,247,0.85)"
                            : "rgba(74,222,128,0.55)";
                          e.currentTarget.style.background = isActive
                            ? "rgba(168,85,247,0.1)"
                            : "rgba(74,222,128,0.08)";
                          e.currentTarget.style.boxShadow = isActive
                            ? "0 8px 28px rgba(168,85,247,0.22)"
                            : "0 8px 28px rgba(74,222,128,0.14)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = isActive
                            ? "rgba(168,85,247,0.55)"
                            : "rgba(255,255,255,0.08)";
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.035)";
                          e.currentTarget.style.boxShadow = isActive
                            ? "0 0 24px rgba(168,85,247,0.12)"
                            : "none";
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = isActive
                            ? "rgba(168,85,247,0.85)"
                            : "rgba(74,222,128,0.55)";
                          e.currentTarget.style.background = isActive
                            ? "rgba(168,85,247,0.1)"
                            : "rgba(74,222,128,0.08)";
                          e.currentTarget.style.boxShadow = isActive
                            ? "0 8px 28px rgba(168,85,247,0.22)"
                            : "0 8px 28px rgba(74,222,128,0.14)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = isActive
                            ? "rgba(168,85,247,0.55)"
                            : "rgba(255,255,255,0.08)";
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.035)";
                          e.currentTarget.style.boxShadow = isActive
                            ? "0 0 24px rgba(168,85,247,0.12)"
                            : "none";
                        }}
                      >
                        <h4 className="text-base font-bold text-white mb-2 leading-snug">
                          {milestone.title}
                        </h4>
                        {milestone.metric && (
                          <div
                            className="flex items-center gap-1.5 text-sm font-semibold mb-2"
                            style={{ color: "#c084fc" }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: "#a855f7" }}
                            />
                            {milestone.metric}
                          </div>
                        )}
                        <p className="text-sm text-white/45 leading-relaxed">
                          {milestone.desc.replace(
                            "{onChainPortfolios}",
                            onChainPortfoliosText,
                          )}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ══ TIER BONUSES — always visible ══ */}
        {/* <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="overflow-hidden rounded-2xl mb-4"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div
              className="relative flex items-center justify-between px-7 py-8 overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #061a0e 0%, #0a2a1a 50%, #0e3d24 100%)",
              }}
            >
              <div className="relative z-10 flex-1 pr-6">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4"
                  style={{
                    background: "rgba(74,222,128,0.15)",
                    color: "#4ade80",
                    border: "1px solid rgba(74,222,128,0.25)",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Tiered Bonus
                </span>
                <h3 className="text-2xl font-bold text-white leading-snug">
                  Get Up To <span className="text-green-400">25% Bonus</span>{" "}
                  via
                  <br />
                  Tiered Contribution Brackets
                </h3>
                <p
                  className="text-sm mt-2"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Larger contributions unlock higher bonuses. More ALLOX for the
                  same spend.
                </p>
              </div>
              <div className="relative flex-shrink-0 w-24 h-24 md:w-32 md:h-32">
                <svg
                  viewBox="0 0 128 128"
                  className="w-full h-full"
                  fill="none"
                >
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="rgba(74,222,128,0.15)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="44"
                    stroke="rgba(74,222,128,0.2)"
                    strokeWidth="1.5"
                    strokeDasharray="4 6"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="30"
                    stroke="rgba(74,222,128,0.3)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M64 6 A58 58 0 0 1 122 64"
                    stroke="#4ade80"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M122 64 A58 58 0 0 1 90 110"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M90 110 A58 58 0 0 1 38 110"
                    stroke="#16a34a"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M38 110 A58 58 0 0 1 6 64"
                    stroke="#15803d"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="64" cy="64" r="20" fill="rgba(74,222,128,0.1)" />
                  <text
                    x="64"
                    y="61"
                    textAnchor="middle"
                    fill="#4ade80"
                    fontSize="12"
                    fontWeight="700"
                    fontFamily="system-ui"
                  >
                    UP TO
                  </text>
                  <text
                    x="64"
                    y="74"
                    textAnchor="middle"
                    fill="#4ade80"
                    fontSize="15"
                    fontWeight="800"
                    fontFamily="system-ui"
                  >
                    25%
                  </text>
                </svg>
              </div>
            </div>

            <div className="bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {[
                        "Tier",
                        "Total Contributions",
                        "ALLOX Price",
                        "Bonus",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(tiersExpanded ? TIERS : TIERS.slice(0, 4)).map((t, i) => (
                      <motion.tr
                        key={t.label}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04, duration: 0.25 }}
                        className="border-b border-gray-50"
                      >
                        <td className="px-5 py-3.5 text-sm font-bold text-gray-800">
                          {t.label}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">
                          {t.range}
                        </td>
                        <td className="px-5 py-3.5 text-sm font-mono font-semibold text-gray-700">
                          {t.price}
                        </td>
                        <td
                          className="px-5 py-3.5 text-sm font-bold"
                          style={{
                            color: t.bonusNum > 0 ? "#16a34a" : "#9ca3af",
                          }}
                        >
                          +{t.bonusNum.toFixed(1)}%
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">
                          {t.fdv}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div> */}

        {/* ══ TOKENOMICS ══ */}
        <motion.div
          id="sale-tokenomics"
          className="scroll-mt-6"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="glass-card overflow-hidden my-4">
            <div className="flex flex-col sm:flex-row">
              {/* Donut */}
              <div className="flex flex-col items-center justify-center py-6 px-4 sm:w-52 flex-shrink-0 sm:border-r border-b sm:border-b-0 border-gray-100">
                <div
                  className="mb-3 text-center px-3 py-2 rounded-xl w-full"
                  style={{
                    background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <div className="text-[9px] font-bold uppercase tracking-widest text-green-600 mb-0.5">
                    {liveSaleKind !== "private" ? "Public" : "Private"} Round
                  </div>
                  <div className="text-lg font-black text-green-700 leading-none">
                    $
                    {isPrivateSale && privateRoundFdvM != null
                      ? privateRoundFdvM
                      : liveSaleKind !== "private"
                        ? "65"
                        : "—"}
                    M
                  </div>
                  <div className="text-[9px] text-green-500 font-semibold">
                    Valuation
                  </div>
                </div>
                <div className="relative">
                  <ResponsiveContainer width={152} height={152}>
                    <PieChart>
                      <Pie
                        data={PRIVATE_ALLOC_DATA}
                        cx={72}
                        cy={72}
                        innerRadius={44}
                        outerRadius={70}
                        dataKey="pct"
                        strokeWidth={2}
                        stroke="white"
                        paddingAngle={2}
                        isAnimationActive
                        animationBegin={0}
                        animationDuration={1000}
                        animationEasing="ease-out"
                      >
                        {PRIVATE_ALLOC_DATA.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          padding: "6px 10px",
                        }}
                        formatter={(v, _, entry) => [
                          `${v}%`,
                          entry.payload.name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-[9px] text-gray-400 uppercase tracking-widest">
                      Supply
                    </div>
                    <div className="text-lg font-black leading-none">1B</div>
                    <div className="text-[9px] text-gray-400">$ALLOX</div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-x-auto">
                <div className="flex sm:flex-row flex-col items-center justify-between px-5 pt-4 pb-2 border-b border-gray-100">
                  <h3 className="text-base font-bold">ALLOX Tokenomics</h3>
                  <span className="text-xs text-gray-400">
                    1,000,000,000 supply
                  </span>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["Tranche", "Alloc.", "TGE", "Cliff", "Vesting"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-gray-400"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {PRIVATE_ALLOC_DATA.map((d, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06, duration: 0.25 }}
                        className="hover:bg-gray-50/60 transition-colors"
                        style={{
                          borderBottom:
                            i < PRIVATE_ALLOC_DATA.length - 1
                              ? "1px solid #f9fafb"
                              : "none",
                        }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: d.color }}
                            />
                            <span className="text-sm font-semibold text-gray-800">
                              {d.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-sm font-bold"
                            style={{ color: d.color }}
                          >
                            {d.pct}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold"
                            style={{
                              background: `${d.color}18`,
                              color: d.color,
                            }}
                          >
                            {d.tge}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {d.cliff}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {d.vesting}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div className="glass-card p-6 mb-4">
            <h3 className="text-xl font-bold mb-6">ALLOX Token Utility</h3>
            <div className="relative">
              <div className="absolute left-4 top-5 bottom-5 w-px bg-gray-200/70" />
              <div className="space-y-6">
                {UTILITIES.map((u, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.3 }}
                    className="flex items-start gap-4 relative z-10"
                  >
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <u.icon className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-sm">{u.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {u.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ══ TOKEN UTILITY ══ */}

        {/* ══ TRACTION BANNER (dark) ══ */}

        <section
          id="sale-partners"
          className="py-12 bg-gradient-to-b from-gray-50/50 to-transparent scroll-mt-6"
        >
          <div className=" mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl mb-4">Partners & Backers</h2>
              <p className="text-xl text-gray-600">
                Collaborating with industry leaders to shape the future
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <div
                className="rounded-2xl overflow-hidden relative mb-8 theme-island"
                style={{
                  background: "#181410",
                  border: "1px solid rgba(240,185,11,0.25)",
                }}
              >
                {/* Gold glow top-right */}
                <div
                  className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{
                    background: "#f0b90b",
                    transform: "translate(30%, -30%)",
                  }}
                />

                <div className="relative flex flex-col md:flex-row items-center gap-0">
                  {/* Left: text */}
                  <div className="flex-1 px-8 py-8">
                    {/* Binance Wallet wordmark */}
                    <div className="flex items-center gap-2.5 mb-5">
                      {/* Binance logo mark */}
                      <img
                        src="https://cdn.allox.ai/allox/tokens/binanceLogo.svg"
                        className="w-6 h-6"
                        alt=""
                      />
                      <span
                        className="text-sm font-bold"
                        style={{ color: "#F0B90B" }}
                      >
                        Binance Wallet
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{
                          background: "rgba(240,185,11,0.15)",
                          color: "#F0B90B",
                          border: "1px solid rgba(240,185,11,0.3)",
                        }}
                      >
                        Exclusive
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-white leading-snug mb-3">
                      Exclusive Campaign
                      <br />
                      with Binance Wallet
                    </h3>
                    <p
                      className="text-sm leading-relaxed mb-6"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      AlloX was featured as an Exclusive Campaign on Binance
                      Wallet under the Booster format, with 86.29K KYC-verified
                      users joining the campaign.
                    </p>

                    <a
                      href="https://web3.binance.com/en/booster/47/5104555967354361344?chain=bsc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
                      style={{ background: "#F0B90B", color: "#181410" }}
                    >
                      View on Binance Wallet
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Right: laptop mockup */}
                  <div className="flex-shrink-0 px-6 py-8 flex items-center justify-center">
                    <div className="relative w-72">
                      <img
                        src={binanceLaptop}
                        alt="AlloX Exclusive Campaign on Binance Wallet"
                        className="w-full h-full object-cover object-top"
                      />{" "}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">
              {partners.map((partner) => (
                <div
                  key={partner.name}
                  className="glass-card p-8 flex items-center justify-center hover:scale-105 transition-transform duration-300"
                >
                  <div className="text-center">
                    <img
                      src={`https://cdn.allox.ai/allox/partners/${partner.icon}`}
                      alt={partner.name}
                      className="h-10 mx-auto mb-4"
                    />
                    <p className="text-xs font-medium text-gray-600">
                      {partner.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <motion.div
          id="sale-traction"
          className="scroll-mt-6"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="rounded-2xl overflow-hidden theme-island"
            style={{
              background: "#0d0d0d",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {/* Header + stats */}
            <div
              className="rounded-2xl p-7 overflow-hidden theme-island"
              style={{
                background: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-8">
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-white leading-tight mb-3">
                    Traction &<br />
                    Momentum
                  </h3>
                  <p
                    className="text-sm mb-5"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    The community sale is backed by a platform with real
                    metrics, real users, and real on-chain activity.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-10 gap-y-7 flex-shrink-0">
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 * 0.1, duration: 0.4 }}
                  >
                    <div
                      className="text-2xl font-bold mb-0.5"
                      style={{ color: "#2dd4bf" }}
                    >
                      {formatCompactNumber(data?.stats?.totalUsers)}+
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      Registered Wallets
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 * 0.1, duration: 0.4 }}
                  >
                    <div
                      className="text-2xl font-bold mb-0.5"
                      style={{ color: "#ffffff" }}
                    >
                      {formatCompactNumber(data?.stats?.totalTransactions)}+
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      Total Transactions
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 * 0.1, duration: 0.4 }}
                  >
                    <div
                      className="text-2xl font-bold mb-0.5"
                      style={{ color: "#ffffff" }}
                    >
                      ${formatCompactNumber(data?.stats?.totalVolume)}+
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      Total Volume
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 * 0.1, duration: 0.4 }}
                  >
                    <div
                      className="text-2xl font-bold mb-0.5"
                      style={{ color: "#ffffff" }}
                    >
                      {formatCompactNumber(
                        data?.stats?.onChainPortfoliosCreated,
                      )}
                      +
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      On-chain Portfolios
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 * 0.1, duration: 0.4 }}
                  >
                    <div
                      className="text-2xl font-bold mb-0.5"
                      style={{ color: "#ffffff" }}
                    >
                      ${formatCompactNumber(data?.stats?.totalValueLockedUsd)}+
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      On-Chain Investment
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 * 0.1, duration: 0.4 }}
                  >
                    <div
                      className="text-2xl font-bold mb-0.5"
                      style={{ color: "#ffffff" }}
                    >
                      {formatCompactNumber(data?.stats?.totalPortfoliosCreated)}
                      +
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      Total Portfolios
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* DEX Volume chart */}
            <div className="px-7 pt-6 pb-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    DEX Aggregator Volume
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    May – Oct 2026 · Source: DefiLlama
                  </div>
                </div>
                <a
                  href="https://defillama.com/protocol/allox?groupBy=cumulative"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors flex-shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }}
                >
                  {/* DefiLlama llama SVG */}
                  <img
                    src="https://cdn.allox.ai/allox/partners/defillama.svg"
                    width={22}
                    height={22}
                    alt=""
                  />
                  <span className="text-sm font-bold text-white">
                    DefiLlama
                  </span>
                </a>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={DEX_VOLUME}
                  margin={{ top: 24, right: 16, left: 8, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="dexGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#3b82f6"
                        stopOpacity={0.45}
                      />
                      <stop
                        offset="100%"
                        stopColor="#3b82f6"
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="week"
                    tick={{
                      fill: "rgba(255,255,255,0.35)",
                      fontSize: 10,
                      fontWeight: 500,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) =>
                      v >= 1000000
                        ? `$${(v / 1000000).toFixed(0)}M`
                        : `$${(v / 1000).toFixed(0)}K`
                    }
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    cursor={{
                      stroke: "rgba(255,255,255,0.15)",
                      strokeWidth: 1,
                    }}
                    contentStyle={{
                      background: "#1a1a2e",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "white",
                      padding: "8px 14px",
                    }}
                    formatter={(v) => [
                      `$${(v / 1000000).toFixed(1)}M`,
                      "Volume",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#dexGrad)"
                    dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                    activeDot={{
                      r: 5,
                      fill: "#3b82f6",
                      stroke: "white",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Product credibility */}
            <div
              className="px-7 pt-5 pb-7"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Product Credibility
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CREDIBILITY.map((point, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.3 }}
                    className="flex items-start gap-3 rounded-xl px-4 py-3"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: "#3b82f6" }}
                    />
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      {point}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        {/* ══ SALE MOMENTUM ══ */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-4 mb-4 rounded-3xl overflow-hidden relative"
          style={{
            background:
              "linear-gradient(145deg, #0b0b0d 0%, #12101a 55%, #0d1520 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="absolute -top-24 -right-16 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background: "#818cf8",
              filter: "blur(90px)",
              opacity: 0.18,
            }}
          />
          <div
            className="absolute -bottom-28 -left-10 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: "#2dd4bf",
              filter: "blur(90px)",
              opacity: 0.12,
            }}
          />

          <div className="relative px-5 sm:px-8 pt-8 sm:pt-10 pb-8 sm:pb-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8 sm:mb-10">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px w-6 bg-teal-400" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
                    Sale momentum
                  </span>
                </div>
                <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                  Real traction behind the sale.
                </h3>
                <p className="mt-3 text-sm sm:text-base text-white/50 leading-relaxed">
                  AlloX isn’t launching from zero, the community sale is backed
                  by revenue, users, and volume already proven in production.
                </p>
              </div>
              <div
                className="inline-flex items-center gap-2 self-start lg:self-auto rounded-full px-3.5 py-2 text-xs font-semibold"
                style={{
                  background: "rgba(45,212,191,0.12)",
                  border: "1px solid rgba(45,212,191,0.28)",
                  color: "#5eead4",
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
                </span>
                Live platform metrics
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-4">
              {SALE_MOMENTUM_HIGHLIGHTS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                  className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{
                      background: `linear-gradient(90deg, ${stat.accent}, transparent)`,
                    }}
                  />
                  <div
                    className="text-4xl sm:text-5xl font-black tracking-tight mb-2 tabular-nums"
                    style={{ color: stat.accent }}
                  >
                    {stat.value.replace(
                      "{onChainPortfolios}",
                      onChainPortfoliosText,
                    )}
                  </div>
                  <div className="text-sm sm:text-base font-bold text-white mb-1 leading-snug">
                    {stat.label}
                  </div>
                  <p className="text-sm text-white/45 leading-relaxed">
                    {stat.detail}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {SALE_MOMENTUM_SUPPORT.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl px-4 py-4"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="text-xl font-bold text-white mb-0.5">
                    {item.value}
                  </div>
                  <div className="text-xs font-medium text-white/40">
                    {item.label}
                  </div>
                </div>
              ))}
            </div> */}
          </div>
        </motion.section>
      </div>
      {/* ══ SALE TERMS MODAL ══ */}
      <AnimatePresence>
        {liveTermsOpen && (
          <AlloxSaleTermsModal
            open={liveTermsOpen}
            onClose={() => setLiveTermsOpen(false)}
            // onAccept={() => setLiveTermsAccepted(true)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
