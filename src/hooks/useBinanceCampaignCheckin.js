import { useMemo } from "react";
import { useLocation } from "react-router";
import { useConnection } from "wagmi";
import { useSelector } from "react-redux";
import { useAuth } from "./useAuth";
import { isBinanceWalletConnection } from "../utils/binanceWallet";
import { useBinanceCampaignUserProgress } from "./useBinanceCampaignUserProgress";

export function useBinanceCampaignCheckin({ enabled = true } = {}) {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const { connector } = useConnection();
  const walletType = useSelector((state) => state.wallet.walletType);
  const sessionSource = useSelector((state) => state.wallet.sessionSource);
  const walletAddress = useSelector((state) => state.wallet.address);
  const isConnected = useSelector((state) => state.wallet.isConnected);

  const isBinanceCampaignRoute = pathname === "/bwcampaign";
  const isBinanceWallet = useMemo(
    () =>
      isBinanceWalletConnection({
        walletType,
        sessionSource,
        connector,
        address: walletAddress,
        isWalletConnected: isConnected,
      }),
    [walletType, sessionSource, connector, walletAddress, isConnected],
  );

  const shouldTrack =
    enabled && isAuthenticated && (isBinanceCampaignRoute || isBinanceWallet);

  const {
    progress,
    loading: historyLoading,
    refresh: refreshProgress,
  } = useBinanceCampaignUserProgress({ enabled: shouldTrack });

  return {
    shouldShowCampaignCheckin: shouldTrack,
    isBinanceCampaignRoute,
    isBinanceWallet,
    progress,
    historyLoading,
    refreshProgress,
  };
}
