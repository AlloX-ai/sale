import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Plus } from "lucide-react";
import {
  navigationTabs,
  isActivePath,
  portfolioSidebarNavIds,
  privateSaleNavButtonClass,
  privateSaleNavButtonStyle,
} from "../constants/navigation";
import { useCheckin } from "../hooks/useCheckin";
import { openCheckinModal } from "../redux/slices/walletSlice";
import { useAuth } from "../hooks/useAuth";
import { SidebarPromoSlider } from "./SidebarPromoSlider";
import {
  setCurrentMessages,
  setViewingHistorySessionId,
  requestBackendChatReset,
} from "../redux/slices/chatSlice";
import { PortfolioNavGroup } from "./PortfolioNavGroup";

export function LaunchSidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const isConnected = useSelector((state) => state.wallet.isConnected);
  const currentMessages = useSelector((state) => state.chat.currentMessages);
  const hasChatContent = currentMessages?.length > 0;
  const checkinStatus = useSelector((state) => state.checkin?.status);
  const { isAuthenticated } = useAuth();

  const { checkedInToday } = useCheckin();

  const sidebarRows = useMemo(() => {
    const filtered = navigationTabs.filter((t) => {
      if (portfolioSidebarNavIds.has(t.id)) return false;
      return true;
    });
    const out = [];
    for (const t of filtered) {
      out.push({ kind: "tab", tab: t });
      if (t.id === "chat") {
        out.push({ kind: "portfolio" });
      }
    }
    return out;
  }, []);

  const lastClaimed = useMemo(() => {
    const rewards = checkinStatus?.rewards ?? [];

    const result =
      checkinStatus?.rewards?.find((item) => {
        return item.current === true;
      }) || rewards?.toReversed().find((item) => item.claimed);
    if (result) {
      return result;
    }
  }, [checkinStatus]);

  const handleNewChat = (e) => {
    e.stopPropagation();
    dispatch(requestBackendChatReset());
    dispatch(setViewingHistorySessionId(null));
    dispatch(setCurrentMessages([]));
    navigate("/");
  };

  return (
    <>
      <aside
        className="hidden xl:flex flex-col  fixed top-20 bottom-0 left-0 w-59 2xl:w-69 border-r border-gray-200/50 bg-pattern/95"
        style={{ zIndex: "5" }}
      >
        <div className="flex flex-col w-full align-center">
          <div className="p-6 space-y-2">
            {sidebarRows.map((row) => {
              if (row.kind === "portfolio") {
                return (
                  <PortfolioNavGroup
                    key="portfolio-nav"
                    pathname={pathname}
                    navigate={navigate}
                    idPrefix="sidebar-portfolio"
                  />
                );
              }
              const { id, label, path, Icon } = row.tab;
              const isActive = isActivePath(pathname, path);
              const isChat = id === "chat";
              const isPrivateSaleTab = id === "publicSales";
              return (
                <button
                  key={id}
                  onClick={() => navigate(path)}
                  className={
                    isPrivateSaleTab
                      ? privateSaleNavButtonClass
                      : `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-black text-white shadow-lg"
                            : "text-gray-700 hover:bg-black/5 hover:shadow-sm"
                        }`
                  }
                  style={isPrivateSaleTab ? privateSaleNavButtonStyle : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    size={20}
                    className={`shrink-0 ${id === "season1" ? "text-orange-500 text-orange-600 animate-pulse" : ""}`}
                  />
                  <span className="flex-1 text-left">{label}</span>
                  {isChat && hasChatContent && (
                    <div
                      type="button"
                      onClick={handleNewChat}
                      className={`p-1 rounded-md shrink-0 transition-colors ${
                        isActive
                          ? "hover:bg-white/20 text-white"
                          : "hover:bg-black/10 text-gray-600"
                      }`}
                      title="Start new chat"
                      aria-label="Start new chat"
                    >
                      <Plus size={18} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="px-4 pb-4">
            <SidebarPromoSlider
              isAuthenticated={isAuthenticated}
              checkedInToday={checkedInToday}
              todayPoints={lastClaimed?.points}
              onDailyBonusClick={() => dispatch(openCheckinModal())}
            />
          </div>
        </div>
        <a
          href="https://skynet.certik.com/projects/allox"
          target="_blank"
          className="flex items-center w-full p-6  gap-2"
        >
          <div className="text-black font-medium text-sm ">Secured by</div>
          <img
            src="https://cdn.allox.ai/allox/partners/certikLarge.svg"
            className="w-24 dark-invert"
            alt=""
          />
        </a>
      </aside>
    </>
  );
}