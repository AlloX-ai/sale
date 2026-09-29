import { useState, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { openCheckinModal } from "../redux/slices/walletSlice";
import {
  Wallet,
  Menu,
  X,
  ChevronRight,
  Copy,
  Check,
  SendHorizontal,
  Coins,
  Gem,
  Banknote,
} from "lucide-react";
import { NetworkSelector } from "./NetworkSelector";
import { shortAddress } from "../hooks/shortAddress";
import { useCheckin } from "../hooks/useCheckin";
import { useTotalPoints } from "../hooks/useTotalPoints";
import {
  navigationTabs,
  isActivePath,
  portfolioSidebarNavIds,
  privateSaleNavButtonClass,
  privateSaleNavButtonStyle,
} from "../constants/navigation";
import { PortfolioNavGroup } from "./PortfolioNavGroup";
import { usePrivateSaleAccess } from "../hooks/usePrivateSaleAccess";
import OutsideClickHandler from "react-outside-click-handler";
import {
  findSeason2RewardForWallet,
  findSeason3RewardForWallet,
  findAllocationRaceRewardForWallet,
} from "../constants/rewards";
import { MessageLimitModal } from "./MessageLimitModal";
import { useAuth } from "../hooks/useAuth";
import {
  getBonusMessages,
  getDailyMessagesRemaining,
  getTotalMessagesRemaining,
} from "../utils/rateLimitMessages";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarPromoSlider } from "./SidebarPromoSlider";

export function Header({
  isConnected,
  coinbase,
  onConnectClick,
  onDisconnectClick,
  onOpenFundModal,
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const rateLimit = useSelector((state) => state.chat?.rateLimit);
  const { totalPoints } = useTotalPoints();
  const messagesRemaining = getTotalMessagesRemaining(rateLimit);
  const dailyMessagesRemaining = getDailyMessagesRemaining(rateLimit);
  const bonusMessages = getBonusMessages(rateLimit);
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileMenuView, setMobileMenuView] = useState("main");
  const [copied, setCopied] = useState(false);
  const [messageLimitModalOpen, setMessageLimitModalOpen] = useState(false);
  const checkinStatus = useSelector((state) => state.checkin?.status);

  const user = useMemo(() => findSeason2RewardForWallet(coinbase), [coinbase]);
  const user3 = useMemo(() => findSeason3RewardForWallet(coinbase), [coinbase]);
  const user4 = useMemo(
    () => findAllocationRaceRewardForWallet(coinbase),
    [coinbase],
  );
  const { checkedInToday } = useCheckin();
  const { user: authUser, isAuthenticated } = useAuth();
  const {
    canAccess: canAccessPrivateSale,
    showLoyaltyCheck,
  } = usePrivateSaleAccess();

  // Each gem is worth $5 in this UI. Referral earnings arrive from `/auth/me`
  // as USD, so we convert them back into gems to fold them into the total.
  const GEM_USD_VALUE = 5;
  const gemsSummary = useMemo(() => {
    const rewardGems =
    (authUser ? Number(authUser?.gems?.balance) : 0) +
      (user ? Number(user?.gems) : 0) +
      (user3 ? Number(user3?.gems) : 0) +
      (user4 ? Number(user4?.gems) : 0);
    const referralUsd =
      Number(authUser?.referral?.earnings?.totalUsd ?? 0) || 0;
    const referralGems = referralUsd / GEM_USD_VALUE;
    return {
      totalGems: rewardGems + referralGems,
      totalUsd: rewardGems * GEM_USD_VALUE + referralUsd,
      referralUsd,
    };
  }, [user, user3, user4, authUser]);



  const formatGemsAmount = (value) =>
    Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
  const lastClaimed = useMemo(() => {
    const rewards = checkinStatus?.rewards ?? [];

    return (
      checkinStatus?.rewards?.find((item) => item.current === true) ||
      rewards.toReversed().find((item) => item.claimed)
    );
  }, [checkinStatus]);

  const mobileMainTabs = useMemo(() => {
    const filtered = navigationTabs.filter(
      (t) =>
        !["history", "trading", "staking"].includes(t.id) &&
        !portfolioSidebarNavIds.has(t.id) &&
        !(t.id === "publicSales" && !canAccessPrivateSale) &&
        !(t.id === "loyaltyCheck" && !showLoyaltyCheck),
    );
    const out = [];
    for (const t of filtered) {
      out.push({ kind: "tab", tab: t });
      if (t.id === "chat") {
        out.push({ kind: "portfolio" });
      }
    }
    return out;
  }, [canAccessPrivateSale, showLoyaltyCheck]);

  const handleOpenCheckinModal = () => {
    dispatch(openCheckinModal());
    setIsMenuOpen(false);
    setMobileMenuView("main");
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-pattern/95 backdrop-blur-lg border-b border-gray-200/50">
        <div className="flex gap-1 items-center justify-between">
          <NavLink className="flex items-center gap-2 cursor-pointer" to="/">
            <img
              src={"https://cdn.allox.ai/allox/AlloX-desktop.svg"}
              alt=""
              className="h-8 hidden xl:flex dark-invert"
            />
            <img
              src={"https://cdn.allox.ai/allox/AlloX-mobile.svg"}
              alt=""
              className="h-10 flex xl:hidden dark-invert"
            />
          </NavLink>
          <OutsideClickHandler
            onOutsideClick={() => {
              setIsMenuOpen(false);
            }}
          >
            <div className="flex gap-2 sm:gap-4">
              {/* {isConnected && (
                <div
                  className="hidden xl:flex bg-white rounded-full px-3 py-2 items-center gap-3 cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    navigate("/rewards");
                  }}
                  role="button"
                >
                  <div className="flex items-center gap-2">
                    <Coins className="size-4 text-amber-500" />

                    <span className="text-xs sm:text-sm font-semibold tabular-nums">
                      {totalPoints.toLocaleString()}
                    </span>
                  </div>
                  {(messagesRemaining != null ||
                    user ||
                    user3 ||
                    user4 ||
                    gemsSummary.referralUsd > 0) && (
                    <div className="border-l border-gray-200/60 pl-3 flex items-center gap-2">
                      <Gem className="size-4 text-purple-600" />
                      <span className="text-xs sm:text-sm font-semibold tabular-nums flex gap-1">
                        {formatGemsAmount(gemsSummary.totalGems)}

                        <span className="text-xs sm:text-sm font-semibold tabular-nums text-gray-600">
                          (${formatGemsAmount(gemsSummary.totalUsd)})
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              )}
              {totalPoints >= 0 && isConnected && (
                <div
                  className="hidden xl:flex bg-white rounded-full px-3 py-2 items-center gap-3 cursor-pointer hover:bg-gray-200 transition-color"
                  onClick={() => setMessageLimitModalOpen(true)}
                  role="button"
                >
                  {messagesRemaining != null && (
                    <div className="flex items-center gap-2">
                      <SendHorizontal className="size-4 text-green-600" />
                      <span className="text-sm font-semibold tabular-nums">
                        {messagesRemaining}
                      </span>
                    </div>
                  )}
                </div>
              )} */}
              {isConnected && authUser?.authProvider === "privy" && (
                <div className="xl:hidden flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onOpenFundModal}
                    className="flex items-center gap-1.5 shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full bg-linear-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-sm transition-all"
                  >
                    <Banknote className="h-5" />
                    Fund
                  </button>
                </div>
              )}
              <ThemeToggle />
              {/* {isConnected && <NotificationBell isConnected={isConnected} />} */}

              {isConnected ? (
                <div className="glass-card px-0 xl:pr-4 flex items-center gap-3 transition-all duration-200 hover:shadow-md">
                  {authUser?.authProvider === "privy" && (
                    <div className="hidden xl:flex items-center gap-2">
                      <button
                        type="button"
                        onClick={onOpenFundModal}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-linear-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-sm transition-all"
                      >
                        <Banknote className="h-5" />
                        Fund
                      </button>
                    </div>
                  )}
                  {/* <div className="hidden xl:flex"> */}
                  <NetworkSelector onDisconnectClick={onDisconnectClick} />
                  {/* </div> */}
                  <div className="pe-2 xl:flex items-center gap-2">
                    <span
                      className="text-xs sm:text-sm cursor-pointer font-medium flex gap-3 items-center"
                      onClick={() => handleCopy(coinbase)}
                    >
                      {shortAddress(coinbase)}
                      {copied ? (
                        <Check size={18} className="text-black" />
                      ) : (
                        <Copy size={18} className="text-black" />
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onConnectClick}
                  className="btn-primary transition-all duration-200 hover:shadow-lg"
                >
                  <Wallet size={20} className="xl:mr-2" />
                  <span className="hidden xl:inline">Connect Wallet</span>
                </button>
              )}

             
            </div>
          </OutsideClickHandler>
        </div>
      </header>
      <MessageLimitModal
        isOpen={messageLimitModalOpen}
        onClose={() => setMessageLimitModalOpen(false)}
        dailyMessagesRemaining={dailyMessagesRemaining}
        bonusMessages={bonusMessages}
      />
    </>
  );
}