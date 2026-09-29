import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useWriteContract, useSwitchChain, useConnection } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWallets } from "@privy-io/react-auth";
import {
  fetchPrivateSaleData,
  fetchPrivateSaleEligibility,
  fetchLoyaltyStatus,
  isApprovedForPrivateSale,
  fetchPrivateSalePosition,
  submitPrivateSaleContribution,
} from "../utils/privateSaleApi";
import {
  executeEvmPrivateSaleContribution,
  executeSolanaPrivateSaleContribution,
  fetchPrivateSaleTokenBalance,
  isTierEligibleForUser,
  mapApiTiersToPlans,
  normalizeSaleChains,
  parsePrivateSaleRevertError,
  tierIdFromPlanKey,
  waitForPrivateSaleTxOnChain,
} from "../utils/privateSaleContribute";
import { setChainId } from "../redux/slices/walletSlice";
import {
  getPrivyEmbedded,
  switchPrivyEmbeddedToChain,
} from "../utils/privyWalletUtils";
import { toast } from "../utils/toast";
import { useAuth } from "./useAuth";

const PREFERRED_CHAIN_STORAGE_KEY = "walletPreferredChainId";
const SOLANA_CHAIN_ID = 101;

const SALE_CHAIN_NETWORKS = {
  ETH: {
    chainId: 1,
    chainHex: "0x1",
    chainName: "Ethereum Mainnet",
    rpcUrls: ["https://cloudflare-eth.com"],
    blockExplorerUrls: ["https://etherscan.io"],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  BSC: {
    chainId: 56,
    chainHex: "0x38",
    chainName: "BNB Chain",
    rpcUrls: ["https://bsc-dataseed.binance.org"],
    blockExplorerUrls: ["https://bscscan.com"],
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  },
  BASE: {
    chainId: 8453,
    chainHex: "0x2105",
    chainName: "Base",
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org"],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
};

const POSITION_POLL_MS = 30_000;
const SALE_REFRESH_MS = 60_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function usePrivateSale({ enabled = true } = {}) {
  const dispatch = useDispatch();
  const { isAuthenticated, ensureAuthenticated } = useAuth();
  const walletType = useSelector((state) => state.wallet.walletType);
  const walletAddress = useSelector((state) => state.wallet.address);
  const chainId = useSelector((state) => state.wallet.chainId);
  const isConnected = useSelector((state) => state.wallet.isConnected);
  const sessionSource = useSelector((state) => state.wallet.sessionSource);

  const isSolanaWallet = walletType === "solana";
  const { chainId: wagmiChainId, connector } = useConnection();
  const currentEVMChainId = isSolanaWallet ? null : (wagmiChainId ?? chainId);
  const { wallets } = useWallets();
  const isPrivySession =
    sessionSource === "privy" ||
    walletType === "privy" ||
    !!(wallets ?? []).find((w) => w.walletClientType === "privy" && w.switchChain);

  const writeContractHook = useWriteContract();
  const switchChain = useSwitchChain();
  const { sendTransaction: sendSolanaTransaction, publicKey: solanaPublicKey } =
    useWallet();

  const [saleData, setSaleData] = useState(null);
  const [saleLoading, setSaleLoading] = useState(false);
  const [saleError, setSaleError] = useState(null);

  const [eligibility, setEligibility] = useState(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  const [position, setPosition] = useState(null);
  const [positionLoading, setPositionLoading] = useState(false);

  const [selectedChainKey, setSelectedChainKey] = useState(null);
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState("silver");
  const [amountUsd, setAmountUsd] = useState("");
  const setAmountUsdSanitized = useCallback((value) => {
    const cleaned = String(value ?? "")
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*)\./g, "$1");
    setAmountUsd(cleaned);
  }, []);

  const [contributing, setContributing] = useState(false);
  const [contributeError, setContributeError] = useState(null);
  const [contributeResult, setContributeResult] = useState(null);
  const [switchingChain, setSwitchingChain] = useState(false);

  const [countdownSeconds, setCountdownSeconds] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [tokenBalanceLoading, setTokenBalanceLoading] = useState(false);
  const balanceRequestIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshSaleData = useCallback(async () => {
    if (!enabled) return null;
    setSaleLoading(true);
    try {
      const data = await fetchPrivateSaleData();
      if (mountedRef.current) {
        if (!data || !Array.isArray(data?.tiers) || data.tiers.length === 0) {
          setSaleData(null);
          setSaleError(
            "Private sale data is unavailable. Please try again shortly.",
          );
        } else {
          setSaleData(data);
          setSaleError(null);
          if (data?.window?.secondsRemaining != null) {
            setCountdownSeconds(Number(data.window.secondsRemaining));
          }
        }
      }
      return data;
    } catch (err) {
      if (mountedRef.current) {
        setSaleError(err?.message || "Failed to load private sale data.");
      }
      return null;
    } finally {
      if (mountedRef.current) setSaleLoading(false);
    }
  }, [enabled]);

  const refreshEligibility = useCallback(async () => {
    if (!enabled) {
      if (mountedRef.current) setEligibility(null);
      return null;
    }
    setEligibilityLoading(true);
    try {
      let data = null;
      if (isAuthenticated) {
        try {
          data = await fetchPrivateSaleEligibility();
        } catch (err) {
          if (err?.status !== 401) {
            throw err;
          }
        }
      }

      if (!isApprovedForPrivateSale(data) && walletAddress) {
        const loyalty = await fetchLoyaltyStatus(walletAddress).catch(
          () => null,
        );
        if (isApprovedForPrivateSale(loyalty)) {
          data = {
            ...(data || {}),
            ...loyalty,
            eligible: true,
            whitelisted: loyalty?.whitelisted ?? true,
          };
        }
      }

      if (mountedRef.current) setEligibility(data);
      return data;
    } catch (err) {
      if (mountedRef.current && err?.status !== 401) {
        setEligibility(null);
      }
      return null;
    } finally {
      if (mountedRef.current) setEligibilityLoading(false);
    }
  }, [enabled, isAuthenticated, walletAddress]);

  const refreshPosition = useCallback(async () => {
    if (!enabled || !isAuthenticated) {
      if (mountedRef.current) {
        setPosition(null);
        setPositionLoading(false);
      }
      return null;
    }
    setPositionLoading(true);
    try {
      const data = await fetchPrivateSalePosition();
      if (mountedRef.current) setPosition(data);
      return data;
    } catch (err) {
      if (mountedRef.current) {
        if (err?.status === 401) {
          setPosition(null);
        } else {
          console.error("Private sale position error:", err);
          setPosition(null);
        }
      }
      return null;
    } finally {
      if (mountedRef.current) setPositionLoading(false);
    }
  }, [enabled, isAuthenticated]);

  useEffect(() => {
    if (!enabled) return;
    refreshSaleData();
    const id = setInterval(refreshSaleData, SALE_REFRESH_MS);
    return () => clearInterval(id);
  }, [enabled, refreshSaleData]);

  useEffect(() => {
    if (!enabled) return;
    refreshEligibility();
  }, [enabled, refreshEligibility]);

  useEffect(() => {
    if (!enabled) return;
    refreshPosition();
  }, [enabled, refreshPosition]);

  useEffect(() => {
    if (!enabled || !isAuthenticated) return;
    const pending = Number(position?.pendingCount) || 0;
    if (pending <= 0) return;
    const id = setInterval(refreshPosition, POSITION_POLL_MS);
    return () => clearInterval(id);
  }, [enabled, isAuthenticated, position?.pendingCount, refreshPosition]);

  useEffect(() => {
    if (!enabled || positionLoading) return;
    const isPendingContribution =
      contributeResult?.status === "pending" ||
      contributeResult?.status === "waiting";
    if (!isPendingContribution) return;

    const pendingPositions = Number(position?.pendingCount) || 0;
    if (pendingPositions <= 0) {
      setContributeResult(null);
    }
  }, [enabled, contributeResult?.status, position?.pendingCount, positionLoading]);

  // Local countdown tick from API secondsRemaining
  useEffect(() => {
    if (countdownSeconds == null) return;
    const id = setInterval(() => {
      setCountdownSeconds((s) => (s != null && s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [saleData?.window?.endsAt, saleData?.window?.secondsRemaining]);

  const plans = useMemo(
    () => mapApiTiersToPlans(saleData?.tiers),
    [saleData?.tiers],
  );

  const isTierEligible = useCallback(
    (tierKey) => isTierEligibleForUser(eligibility, tierKey),
    [eligibility],
  );

  const eligiblePlans = useMemo(() => {
    if (!eligibility?.eligible) return [];
    return plans.filter((plan) => isTierEligibleForUser(eligibility, plan.key));
  }, [plans, eligibility]);

  const plansWithEligibility = useMemo(() => {
    return plans.map((plan) => ({
      ...plan,
      tierEligible: isTierEligibleForUser(eligibility, plan.key),
    }));
  }, [plans, eligibility]);

  const chains = useMemo(
    () => normalizeSaleChains(saleData?.chains),
    [saleData?.chains],
  );

  // Show every sale chain in the dropdown (mirror header network list).
  // Wallet-type mismatches are handled in selectChain with a toast.
  const availableChains = useMemo(() => chains, [chains]);

  // Chains the connected wallet can actually use (for auto-sync selection).
  const walletCompatibleChains = useMemo(() => {
    return chains.filter((c) => {
      if (c.key === "SOL") return isSolanaWallet;
      return !isSolanaWallet;
    });
  }, [chains, isSolanaWallet]);

  const selectedChain = useMemo(
    () =>
      chains.find((c) => c.key === selectedChainKey) ??
      availableChains[0] ??
      chains[0] ??
      null,
    [chains, availableChains, selectedChainKey],
  );

  const availableTokens = useMemo(() => {
    if (!selectedChain) return [];
    return selectedChain.tokens;
  }, [selectedChain]);

  const selectedToken = useMemo(() => {
    return (
      availableTokens.find(
        (t) =>
          String(t.symbol).toUpperCase() ===
          String(selectedTokenSymbol).toUpperCase(),
      ) ??
      availableTokens[0] ??
      null
    );
  }, [availableTokens, selectedTokenSymbol]);

  const refreshTokenBalance = useCallback(async () => {
    const requestId = ++balanceRequestIdRef.current;

    if (!enabled || !isConnected || !selectedToken || !selectedChain) {
      if (mountedRef.current && requestId === balanceRequestIdRef.current) {
        setTokenBalance(null);
        setTokenBalanceLoading(false);
      }
      return null;
    }

    const isSol = selectedChain.key === "SOL";
    const solanaAddr =
      solanaPublicKey?.toBase58?.() ??
      (isSolanaWallet ? walletAddress : null);
    const evmAddr = isSolanaWallet ? null : walletAddress;

    if (isSol ? !solanaAddr : !evmAddr) {
      if (mountedRef.current && requestId === balanceRequestIdRef.current) {
        setTokenBalance(null);
        setTokenBalanceLoading(false);
      }
      return null;
    }

    if (mountedRef.current && requestId === balanceRequestIdRef.current) {
      setTokenBalanceLoading(true);
    }

    try {
      const result = await fetchPrivateSaleTokenBalance({
        chainKey: selectedChain.key,
        chainConfig: selectedChain,
        token: selectedToken,
        walletAddress: evmAddr,
        solanaPubkey: solanaAddr,
      });
      if (
        mountedRef.current &&
        requestId === balanceRequestIdRef.current
      ) {
        setTokenBalance(result);
      }
      return result;
    } catch (err) {
      console.error("Private sale token balance error:", err);
      if (
        mountedRef.current &&
        requestId === balanceRequestIdRef.current
      ) {
        setTokenBalance(null);
      }
      return null;
    } finally {
      if (
        mountedRef.current &&
        requestId === balanceRequestIdRef.current
      ) {
        setTokenBalanceLoading(false);
      }
    }
  }, [
    enabled,
    isConnected,
    selectedToken,
    selectedChain,
    walletAddress,
    solanaPublicKey,
    isSolanaWallet,
  ]);

  useEffect(() => {
    setTokenBalance(null);
    refreshTokenBalance();
  }, [refreshTokenBalance]);

  // Keep the selected sale chain in sync with the wallet when connected.
  useEffect(() => {
    if (!enabled || chains.length === 0) return;

    if (isConnected) {
      // Solana wallet → keep Solana selected. EVM wallet → never Solana.
      if (isSolanaWallet) {
        const sol =
          walletCompatibleChains.find((c) => c.key === "SOL") ??
          walletCompatibleChains[0];
        if (sol && selectedChainKey !== sol.key) {
          setSelectedChainKey(sol.key);
        }
        return;
      }

      if (
        selectedChainKey === "SOL" ||
        !walletCompatibleChains.some((c) => c.key === selectedChainKey)
      ) {
        const walletMatch =
          chainId != null
            ? walletCompatibleChains.find(
                (c) => Number(c.chainId) === Number(chainId),
              )
            : null;
        const fallback = walletMatch ?? walletCompatibleChains[0];
        if (fallback && fallback.key !== selectedChainKey) {
          setSelectedChainKey(fallback.key);
        }
        return;
      }

      if (chainId != null) {
        const walletMatch = walletCompatibleChains.find(
          (c) => Number(c.chainId) === Number(chainId),
        );
        if (walletMatch && walletMatch.key !== selectedChainKey) {
          setSelectedChainKey(walletMatch.key);
        }
      }
      return;
    }

    if (
      !selectedChainKey ||
      !chains.some((c) => c.key === selectedChainKey)
    ) {
      const fallback = walletCompatibleChains[0] ?? chains[0];
      if (fallback) setSelectedChainKey(fallback.key);
    }
  }, [
    enabled,
    chains,
    walletCompatibleChains,
    selectedChainKey,
    chainId,
    isConnected,
    isSolanaWallet,
  ]);

  const selectChain = useCallback(
    async (chainKey) => {
      const chain = chains.find((c) => c.key === chainKey);
      if (!chain || switchingChain) return;

      if (!isConnected) {
        setSelectedChainKey(chainKey);
        return;
      }

      if (chain.key === "SOL") {
        if (isPrivySession) {
          toast.error(
            "Your session uses Privy’s embedded EVM wallet. Use Ethereum, BNB Chain, or Base.",
          );
          return;
        }
        if (!isSolanaWallet) {
          toast.error(
            "Solana requires a Solana-capable wallet (e.g. Phantom). Please connect with a Solana wallet.",
          );
          return;
        }
        try {
          localStorage.setItem(
            PREFERRED_CHAIN_STORAGE_KEY,
            String(SOLANA_CHAIN_ID),
          );
        } catch {
          /* ignore */
        }
        dispatch(setChainId(SOLANA_CHAIN_ID));
        setSelectedChainKey(chainKey);
        return;
      }

      if (isSolanaWallet) {
        toast.error(
          "Switch to an EVM wallet to use Ethereum, BNB Chain, or Base.",
        );
        return;
      }

      const targetChainId = Number(chain.chainId);
      if (Number(currentEVMChainId) === targetChainId) {
        setSelectedChainKey(chainKey);
        return;
      }

      const network = SALE_CHAIN_NETWORKS[chain.key];

      try {
        setSwitchingChain(true);

        if (isPrivySession) {
          const embedded = getPrivyEmbedded(wallets);
          if (!embedded?.switchChain) {
            toast.error(
              "Embedded wallet not ready. Refresh the page or sign in again.",
            );
            return;
          }
          await switchPrivyEmbeddedToChain(embedded, targetChainId);
          dispatch(setChainId(targetChainId));
          try {
            localStorage.removeItem(PREFERRED_CHAIN_STORAGE_KEY);
          } catch {
            /* ignore */
          }
          setSelectedChainKey(chainKey);
          return;
        }

        if (!switchChain.mutateAsync) {
          toast.error(
            "Unable to switch chain. Please try reconnecting your wallet.",
          );
          return;
        }
        if (!connector) {
          toast.error("No wallet connected. Please connect an EVM wallet first.");
          return;
        }

        try {
          await switchChain.mutateAsync({ chainId: targetChainId });
        } catch (error) {
          if (error?.code !== 4902 || !network) throw error;
          const provider = await connector.getProvider();
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: network.chainHex,
                chainName: network.chainName,
                rpcUrls: network.rpcUrls,
                blockExplorerUrls: network.blockExplorerUrls,
                nativeCurrency: network.nativeCurrency,
              },
            ],
          });
          await switchChain.mutateAsync({ chainId: targetChainId });
        }

        dispatch(setChainId(targetChainId));
        try {
          localStorage.removeItem(PREFERRED_CHAIN_STORAGE_KEY);
        } catch {
          /* ignore */
        }
        setSelectedChainKey(chainKey);
      } catch (error) {
        console.error("Private sale network switch error:", error);
        toast.error("Failed to switch network.");
      } finally {
        setSwitchingChain(false);
      }
    },
    [
      chains,
      switchingChain,
      isConnected,
      isPrivySession,
      isSolanaWallet,
      currentEVMChainId,
      wallets,
      switchChain,
      connector,
      dispatch,
    ],
  );

  useEffect(() => {
    if (!enabled || availableTokens.length === 0) return;
    if (
      !selectedTokenSymbol ||
      !availableTokens.some(
        (t) =>
          String(t.symbol).toUpperCase() ===
          String(selectedTokenSymbol).toUpperCase(),
      )
    ) {
      setSelectedTokenSymbol(availableTokens[0].symbol);
    }
  }, [enabled, availableTokens, selectedTokenSymbol]);

  useEffect(() => {
    if (!enabled || plans.length === 0) return;
    const preferred =
      eligiblePlans.find((p) => p.id === selectedPlanId) ??
      eligiblePlans[0] ??
      plans.find((p) => p.id === selectedPlanId) ??
      plans[0];
    if (preferred && preferred.id !== selectedPlanId) {
      setSelectedPlanId(preferred.id);
    }
  }, [enabled, plans, eligiblePlans, selectedPlanId]);

  const selectedPlan =
    plans.find((p) => p.id === selectedPlanId) ?? plans[0] ?? null;

  const isSelectedTierEligible = selectedPlan
    ? isTierEligibleForUser(eligibility, selectedPlan.key)
    : false;

  const minContributionUsd = Number(saleData?.minContributionUsd) || 10;
  const maxContributionUsd = Number(saleData?.maxContributionUsd) || 5_000_000;
  const amountNum = parseFloat(amountUsd) || 0;

  const allocationPreview =
    selectedPlan?.price > 0 && amountNum > 0
      ? amountNum / selectedPlan.price
      : 0;

  const isEligible = isApprovedForPrivateSale(eligibility);
  const saleActive = saleData?.window?.isActive === true;
  const saleEnded = saleData?.window?.isEnded === true;

  const canSubmit =
    isEligible &&
    isSelectedTierEligible &&
    saleActive &&
    !saleEnded &&
    !contributing &&
    amountNum >= minContributionUsd &&
    amountNum <= maxContributionUsd &&
    selectedChain &&
    selectedToken &&
    selectedPlan &&
    (isSolanaWallet ? !!solanaPublicKey : !!walletAddress);

  const countdownParts = useMemo(() => {
    const total = Math.max(0, countdownSeconds ?? 0);
    return {
      days: Math.floor(total / 86400),
      hours: Math.floor((total % 86400) / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60,
      completed: total <= 0,
    };
  }, [countdownSeconds]);

  const contribute = useCallback(async () => {
    if (!canSubmit) return;
    setContributing(true);
    setContributeError(null);
    setContributeResult(null);

    try {
      await ensureAuthenticated();

      const tierId = selectedPlan.tierId ?? tierIdFromPlanKey(selectedPlan.id);
      const chainKey = selectedChain.key;
      let txHash;

      if (chainKey === "SOL") {
        if (!isSolanaWallet) {
          throw new Error(
            "Solana contributions require a Solana wallet (Phantom, MetaMask Solana, etc.).",
          );
        }
        if (!selectedToken?.address) {
          throw new Error("Select USDC or USDT to contribute on Solana.");
        }
        txHash = await executeSolanaPrivateSaleContribution({
          tierId,
          token: selectedToken,
          amountUsd: amountNum,
          treasuryAddress: selectedChain.treasuryAddress,
          fromPubkey: solanaPublicKey?.toBase58?.() ?? walletAddress,
          sendTransaction: sendSolanaTransaction,
        });
      } else {
        txHash = await executeEvmPrivateSaleContribution({
          chainKey,
          chainConfig: selectedChain,
          tierId,
          token: selectedToken,
          amountUsd: amountNum,
          walletAddress,
          writeContract: writeContractHook.mutateAsync,
          switchChain,
          currentChainId: currentEVMChainId,
        });
      }

      if (!txHash) throw new Error("Missing transaction hash.");

      // EVM: wait for receipt. Solana: POST signature immediately — backend
      // verifies finalized (FE confirmTransaction can expire even when tx landed).
      if (chainKey !== "SOL") {
        await waitForPrivateSaleTxOnChain(chainKey, txHash);
      }

      const payload = { txHash, chain: chainKey };
      if (chainKey === "SOL") payload.tierId = tierId;

      let result = await submitPrivateSaleContribution(payload);

      // Poll while the indexer catches up (pending / waiting).
      let attempts = 0;
      while (
        (result?.status === "pending" || result?.status === "waiting") &&
        attempts < 8
      ) {
        await sleep(2500);
        result = await submitPrivateSaleContribution(payload);
        attempts += 1;
      }

      if (mountedRef.current) {
        setContributeResult(result);
        if (result?.status === "rejected") {
          const message =
            result?.detail ||
            result?.message ||
            "Contribution was rejected. Please contact support if funds were sent.";
          setContributeError(message);
          toast.error(message);
        } else if (result?.status === "waiting") {
          // Still not indexed after on-chain confirm — keep hash so user can retry submit.
          const message =
            result?.detail ||
            result?.message ||
            "Transaction is on-chain but not indexed yet. Please try again in a moment.";
          setContributeError(message);
          toast.error(message);
        } else {
          setContributeError(null);
          setAmountUsd("");
          refreshPosition();
          refreshSaleData();
          refreshTokenBalance();
        }
      }

      return result;
    } catch (err) {
      const message = parsePrivateSaleRevertError(err);
      if (mountedRef.current) setContributeError(message);
      toast.error(message);
      throw err;
    } finally {
      if (mountedRef.current) setContributing(false);
    }
  }, [
    canSubmit,
    ensureAuthenticated,
    selectedPlan,
    selectedChain,
    selectedToken,
    amountNum,
    solanaPublicKey,
    walletAddress,
    isSolanaWallet,
    sendSolanaTransaction,
    writeContractHook.mutateAsync,
    switchChain,
    currentEVMChainId,
    refreshPosition,
    refreshSaleData,
    refreshTokenBalance,
  ]);

  return {
    saleData,
    saleLoading,
    saleError,
    refreshSaleData,
    eligibility,
    eligibilityLoading,
    refreshEligibility,
    position,
    positionLoading,
    refreshPosition,
    plans,
    plansWithEligibility,
    eligiblePlans,
    isTierEligible,
    isSelectedTierEligible,
    chains,
    availableChains,
    selectedChainKey,
    setSelectedChainKey,
    selectChain,
    switchingChain,
    selectedTokenSymbol,
    setSelectedTokenSymbol,
    selectedToken,
    availableTokens,
    selectedPlanId,
    setSelectedPlanId,
    selectedPlan,
    amountUsd,
    setAmountUsd: setAmountUsdSanitized,
    amountNum,
    allocationPreview,
    minContributionUsd,
    maxContributionUsd,
    isEligible,
    isSolanaWallet,
    saleActive,
    saleEnded,
    canSubmit,
    contributing,
    contributeError,
    contributeResult,
    contribute,
    countdownParts,
    countdownSeconds,
    tokenBalance,
    tokenBalanceLoading,
  };
}
