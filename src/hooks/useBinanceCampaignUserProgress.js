import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { apiCall } from "../utils/api";
import {
  getBinanceCampaignUserProgressUrl,
  parseBinanceCampaignUserProgress,
} from "../utils/binanceCampaign";
import { useAuth } from "./useAuth";

export function useBinanceCampaignUserProgress({ enabled = true } = {}) {
  const { isAuthenticated } = useAuth();
  const walletAddress = useSelector((state) => state.wallet.address);
  const checkinStatus = useSelector((state) => state.checkin?.status);

  const shouldFetch = enabled && isAuthenticated && !!walletAddress;
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!shouldFetch) {
      setCampaignData(null);
      return null;
    }
    setLoading(true);
    try {
      const data = await apiCall(
        getBinanceCampaignUserProgressUrl(walletAddress),
      );
      setCampaignData(data);
      return data;
    } catch {
      setCampaignData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [shouldFetch, walletAddress]);

  useEffect(() => {
    refresh();
  }, [refresh, checkinStatus?.checkedInToday]);

  const progress = useMemo(
    () => (shouldFetch ? parseBinanceCampaignUserProgress(campaignData) : null),
    [campaignData, shouldFetch],
  );

  return {
    progress,
    loading,
    refresh,
  };
}
