import {
  X,
  ArrowDown,
  Check,
  ChevronDown,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAccount, useSwitchChain } from "wagmi";
import {
  getEmbeddedConnectedWallet,
  useSendTransaction,
  useWallets,
} from "@privy-io/react-auth";
import { useAuth } from "../hooks/useAuth";
import { setWalletModal, setChainId } from "../redux/slices/walletSlice";
import { CHAINS, chainIdFor, normalizeChain } from "../config/chains";
import {
  createPrivyExecutionTxEnv,
  executePortfolioOnChain,
} from "../utils/execution";
import { toast } from "../utils/toast";
import {
  WOD_HODL_CHAIN,
  WOD_HODL_SOURCE_TOKENS,
  fetchWodHodlSwapQuote,
  buildWodHodlExecutionFromQuote,
  extractWodExchangeRate,
  formatUsd,
  toFiniteNumber,
} from "../utils/wodHodlCampaign";

interface WODSwapModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  minBuyUsd?: number;
}

const TOKENS = [
  {
    name: "USDT",
    icon: "https://cdn.allox.ai/allox/networks/usdt.svg",
  },
  {
    name: "USDC",
    icon: "https://cdn.allox.ai/allox/networks/usdc.svg",
  },
  {
    name: "BNB",
    icon: "https://cdn.allox.ai/allox/networks/bnb.svg",
  },
] as const;

type SourceToken = (typeof WOD_HODL_SOURCE_TOKENS)[number];

const QUOTE_DEBOUNCE_MS = 500;

function formatWodAmount(value: number | null | undefined) {
  if (value == null || !Number.isFinite(Number(value))) return null;
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });
}

export function WODSwapModal({
  onClose,
  onSuccess,
  minBuyUsd = 50,
}: WODSwapModalProps) {
  const dispatch = useDispatch();
  const { isConnected, connector, chainId: wagmiChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { wallets } = useWallets();
  const { sendTransaction: privySendTransaction } = useSendTransaction();
  const { ensureAuthenticated, logout, user: authUser } = useAuth();

  const walletType = useSelector((state: any) => state.wallet.walletType);
  const sessionSource = useSelector((state: any) => state.wallet.sessionSource);
  const reduxChainId = useSelector((state: any) => state.wallet.chainId);

  const [sourceToken, setSourceToken] = useState<SourceToken>("USDT");
  const [amount, setAmount] = useState("");
  const [debouncedAmount, setDebouncedAmount] = useState(0);
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMeta, setSuccessMeta] = useState<{
    wodAmount: string | null;
    portfolioId: string | null;
  }>({ wodAmount: null, portfolioId: null });
  const [quotedRate, setQuotedRate] = useState<string | null>(null);
  const [quotedWodAmount, setQuotedWodAmount] = useState<string | null>(null);
  const [priceImpact, setPriceImpact] = useState<number | null>(null);
  const [cachedExecution, setCachedExecution] = useState<any>(null);

  const quoteRequestIdRef = useRef(0);

  const targetChainId = chainIdFor(WOD_HODL_CHAIN);
  const targetChainLabel =
    CHAINS[normalizeChain(WOD_HODL_CHAIN)]?.label || "BNB Chain";
  const currentChainId = wagmiChainId ?? reduxChainId ?? null;
  const onTargetChain = Number(currentChainId) === targetChainId;

  const investmentUsd = toFiniteNumber(amount, NaN);
  const quoteReady =
    cachedExecution != null &&
    Number(cachedExecution?.portfolioData?.totalInvestment) ===
      debouncedAmount &&
    String(cachedExecution?.sourceToken || "").toUpperCase() === sourceToken &&
    quotedWodAmount != null;
  const canSubmit =
    Number.isFinite(investmentUsd) &&
    investmentUsd > 0 &&
    quoteReady &&
    !isQuoting &&
    !isExecuting;

  const isPrivySession = useMemo(
    () =>
      authUser?.authProvider === "privy" ||
      sessionSource === "privy" ||
      walletType === "privy",
    [authUser?.authProvider, sessionSource, walletType],
  );

  // Debounce amount input so we don't hit /quote on every keystroke.
  useEffect(() => {
    const parsed = toFiniteNumber(amount, NaN);
    const timer = setTimeout(() => {
      setDebouncedAmount(Number.isFinite(parsed) && parsed > 0 ? parsed : 0);
    }, QUOTE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [amount]);

  const clearQuote = useCallback(() => {
    quoteRequestIdRef.current += 1;
    setQuotedRate(null);
    setQuotedWodAmount(null);
    setPriceImpact(null);
    setCachedExecution(null);
    setQuoteError(null);
  }, []);

  const applyQuoteResponse = useCallback(
    (response: any, totalInvestment: number, token: SourceToken) => {
      const execution = buildWodHodlExecutionFromQuote(response, {
        totalInvestment,
        sourceToken: token,
      });
      if (!execution) {
        setCachedExecution(null);
        setQuotedRate(null);
        setQuotedWodAmount(null);
        setPriceImpact(null);
        setQuoteError("Could not build quote. Try another amount.");
        return null;
      }

      const rate = extractWodExchangeRate(
        execution.quote,
        token,
        totalInvestment,
      );
      const impactRaw =
        execution.meta?.priceImpact ??
        execution.quote?.positions?.[0]?.quote?.priceImpact;
      const impactNum = Number(impactRaw);
      setCachedExecution(execution);
      setQuotedRate(rate?.label ?? null);
      setQuotedWodAmount(formatWodAmount(rate?.wodAmount));
      setPriceImpact(Number.isFinite(impactNum) ? impactNum : null);
      setQuoteError(null);
      return { execution, rate };
    },
    [],
  );

  // Live preview quote (debounced).
  useEffect(() => {
    if (!isConnected || debouncedAmount <= 0 || isExecuting) {
      if (debouncedAmount <= 0) clearQuote();
      return undefined;
    }

    const requestId = ++quoteRequestIdRef.current;
    let cancelled = false;

    const run = async () => {
      setIsQuoting(true);
      setQuoteError(null);
      try {
        await ensureAuthenticated();
        if (cancelled || requestId !== quoteRequestIdRef.current) return;

        const response = await fetchWodHodlSwapQuote({
          totalInvestment: debouncedAmount,
          sourceToken,
        });
        if (cancelled || requestId !== quoteRequestIdRef.current) return;

        applyQuoteResponse(response, debouncedAmount, sourceToken);
      } catch (err: any) {
        if (cancelled || requestId !== quoteRequestIdRef.current) return;
        if (err?.status === 401) logout();
        setCachedExecution(null);
        setQuotedRate(null);
        setQuotedWodAmount(null);
        setPriceImpact(null);
        setQuoteError(err?.message || "Failed to fetch quote");
      } finally {
        if (!cancelled && requestId === quoteRequestIdRef.current) {
          setIsQuoting(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [
    applyQuoteResponse,
    clearQuote,
    debouncedAmount,
    ensureAuthenticated,
    isConnected,
    isExecuting,
    logout,
    sourceToken,
  ]);

  const handleSwitchChain = useCallback(async () => {
    if (!isConnected) {
      dispatch(setWalletModal(true));
      return;
    }
    try {
      if (isPrivySession) {
        const embedded = getEmbeddedConnectedWallet(wallets);
        if (!embedded) {
          toast.error("Embedded wallet not found. Sign in again.");
          return;
        }
        await embedded.switchChain(targetChainId);
        dispatch(setChainId(targetChainId));
        return;
      }
      if (switchChainAsync) {
        await switchChainAsync({ chainId: targetChainId });
        dispatch(setChainId(targetChainId));
        return;
      }
      if (connector?.switchChain) {
        await connector.switchChain({ chainId: targetChainId });
        dispatch(setChainId(targetChainId));
      }
    } catch (err: any) {
      toast.error(err?.message || `Unable to switch to ${targetChainLabel}.`);
    }
  }, [
    connector,
    dispatch,
    isConnected,
    isPrivySession,
    switchChainAsync,
    targetChainId,
    targetChainLabel,
    wallets,
  ]);

  const handleExecutionUpdate = useCallback((update: any) => {
    const step = update?.step;
    if (step === "QUOTE_START") setStatusText("Preparing quote…");
    else if (step === "QUOTE_COMPLETE") setStatusText("Quote ready — swapping…");
    else if (step === "POSITION_START")
      setStatusText(`Swapping ${update?.symbol || "WOD"}…`);
    else if (step === "APPROVAL_REQUIRED")
      setStatusText("Approve token spending in your wallet…");
    else if (step === "POSITION_CONFIRMED")
      setStatusText("Swap confirmed — finalizing…");
    else if (step === "COMPLETE") setStatusText("Done!");
    else if (step === "POSITION_ERROR")
      setStatusText(update?.error || "Swap failed");
  }, []);

  const promptExecutionDecision = useCallback(async (promptData: any) => {
    if (promptData?.type === "SLIPPAGE_INCREASE_REQUIRED") return "accept";
    if (promptData?.type === "QUOTE_FAILED_TOKENS") return "continue";
    return "skip";
  }, []);

  const handleStartExecution = useCallback(
    async (execution: any) => {
      let privyTxEnv;
      const executionChain = normalizeChain(execution?.chain);
      const executionChainId = chainIdFor(executionChain);

      if (isPrivySession) {
        const embedded = getEmbeddedConnectedWallet(wallets);
        if (!embedded) {
          throw new Error(
            "Embedded wallet not found. Refresh the page or sign in again.",
          );
        }
        const cid = embedded.chainId;
        const onExecutionChain =
          cid === `eip155:${executionChainId}` ||
          (typeof cid === "string" &&
            cid.startsWith("0x") &&
            parseInt(cid, 16) === executionChainId) ||
          Number(cid) === executionChainId;
        if (!onExecutionChain) {
          await embedded.switchChain(executionChainId);
        }
        privyTxEnv = createPrivyExecutionTxEnv(
          embedded.address,
          privySendTransaction,
          executionChain,
        );
      }

      return executePortfolioOnChain(execution, {
        onUpdate: handleExecutionUpdate,
        onPrompt: promptExecutionDecision,
        ...(privyTxEnv ? { txEnv: privyTxEnv } : {}),
      });
    },
    [
      handleExecutionUpdate,
      isPrivySession,
      privySendTransaction,
      promptExecutionDecision,
      wallets,
    ],
  );

  const handleConfirm = async () => {
    setError(null);

    if (!isConnected) {
      dispatch(setWalletModal(true));
      return;
    }
    if (!onTargetChain) {
      await handleSwitchChain();
      return;
    }
    if (!Number.isFinite(investmentUsd) || investmentUsd <= 0) {
      setError("Enter a valid investment amount.");
      return;
    }

    try {
      await ensureAuthenticated();

      let execution = cachedExecution;
      let wodDisplay = quotedWodAmount;

      const quoteMatchesInput =
        execution != null &&
        Number(execution?.portfolioData?.totalInvestment) === investmentUsd &&
        String(execution?.sourceToken || "").toUpperCase() === sourceToken;

      if (!quoteMatchesInput) {
        setIsQuoting(true);
        setStatusText("Getting WOD quote…");
        const response = await fetchWodHodlSwapQuote({
          totalInvestment: investmentUsd,
          sourceToken,
        });
        const applied = applyQuoteResponse(
          response,
          investmentUsd,
          sourceToken,
        );
        if (!applied) {
          setError("Could not build swap from quote. Try again.");
          return;
        }
        execution = applied.execution;
        wodDisplay = formatWodAmount(applied.rate?.wodAmount);
      }

      setIsQuoting(false);
      setIsExecuting(true);
      setStatusText("Confirm transactions in your wallet…");

      const completeData = await handleStartExecution(execution);
      const portfolioId =
        completeData?.portfolioId ||
        completeData?.id ||
        completeData?.portfolio?.id ||
        null;

      setSuccessMeta({
        wodAmount: wodDisplay,
        portfolioId: portfolioId ? String(portfolioId) : null,
      });
      setShowSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      if (err?.status === 401) logout();
      const message =
        err?.message ||
        err?.data?.message ||
        "Swap failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsQuoting(false);
      setIsExecuting(false);
      setStatusText(null);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 border border-gray-200">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-3">
              <Check size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Swap Successful!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your WOD buy was submitted
              {successMeta.wodAmount ? (
                <>
                  {" "}
                  (~
                  <span className="font-bold text-purple-600">
                    {successMeta.wodAmount} $WOD
                  </span>
                  )
                </>
              ) : null}
              .
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-black text-white rounded-xl text-sm font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  const busy = isExecuting;
  const amountPending =
    Number.isFinite(investmentUsd) &&
    investmentUsd > 0 &&
    investmentUsd !== debouncedAmount;
  const showQuoteSpinner = isQuoting || amountPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Swap to WOD</h2>
            <p className="text-[11px] text-gray-500">
              Min {formatUsd(minBuyUsd)} · BSC via AlloX
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="relative space-y-1.5">
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-medium text-gray-500">
                  You pay (USD)
                </span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setIsTokenDropdownOpen(!isTokenDropdownOpen)
                    }
                    disabled={busy}
                    className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-lg hover:border-blue-400 transition-all text-xs font-semibold text-gray-900"
                  >
                    <img
                      src={
                        TOKENS.find((token) => token.name === sourceToken)
                          ?.icon
                      }
                      alt={sourceToken}
                      className="w-4 h-4"
                    />
                    {sourceToken}
                    <ChevronDown
                      size={14}
                      className={`text-gray-500 transition-transform ${isTokenDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isTokenDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsTokenDropdownOpen(false)}
                      />
                      <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden min-w-[110px]">
                        {TOKENS.map((token) => (
                          <button
                            type="button"
                            key={token.name}
                            onClick={() => {
                              setSourceToken(token.name);
                              setIsTokenDropdownOpen(false);
                              clearQuote();
                            }}
                            className={`w-full flex items-center gap-2 text-xs text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                              sourceToken === token.name
                                ? "bg-blue-50 font-semibold text-blue-600"
                                : "text-gray-700"
                            }`}
                          >
                            <img
                              src={token.icon}
                              alt={token.name}
                              className="w-4 h-4"
                            />
                            {token.name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                placeholder="0.00"
                disabled={busy}
                className="w-full bg-transparent text-2xl font-bold text-gray-900 outline-none placeholder:text-gray-300 leading-none"
                step="any"
                min="0"
              />
            </div>

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-white shadow-sm">
                <ArrowDown className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50/70 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[11px] font-medium text-purple-700/70">
                    You receive
                  </span>
                  
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                  <img
                    src="https://cdn.allox.ai/allox/tokens/wod.png"
                    alt="WOD"
                    className="w-4 h-4 rounded-full"
                  />
                  WOD
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-600 leading-none min-h-[1.2em] flex items-center">
                {showQuoteSpinner ? (
                  <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                ) : (
                  quotedWodAmount || "—"
                )}
              </div>
              {/* {!showQuoteSpinner && priceImpact != null && priceImpact > 1 && (
                <p className="mt-1.5 text-[10px] leading-snug text-pink-500/90">
                  Price impact too high. Proceed with caution.
                </p>
              )} */}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 px-1 text-[11px] text-gray-500">
            <span>Rate</span>
            <span className="font-medium text-gray-800 text-right truncate">
              {showQuoteSpinner
                ? "Fetching…"
                : quotedRate ||
                  (quoteError
                    ? "Quote unavailable"
                    : !isConnected
                      ? "Connect wallet to quote"
                      : "Enter amount")}
            </span>
          </div>

          {!onTargetChain && isConnected && (
            <div className="px-2.5 py-1.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
              Switch to {targetChainLabel} to continue.
            </div>
          )}

          {(error || quoteError) && (
            <div className="px-2.5 py-1.5 bg-red-50 rounded-lg border border-red-200 text-[11px] text-red-700">
              {error || quoteError}
            </div>
          )}

          {statusText && (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {statusText}
            </div>
          )}

          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={
              busy ||
              (isConnected &&
                onTargetChain &&
                (!canSubmit || showQuoteSpinner))
            }
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {!isConnected
              ? "Connect Wallet"
              : !onTargetChain
                ? `Switch to ${targetChainLabel}`
                : !amount || investmentUsd <= 0
                  ? "Enter Amount"
                  : showQuoteSpinner
                    ? "Fetching Quote…"
                    : !quoteReady
                      ? "Waiting for Quote"
                      : isExecuting
                        ? "Executing…"
                        : "Confirm Swap"}
          </button>

          <p className="text-[10px] text-gray-400 text-center leading-snug px-1">
            BSC buys via AlloX only · slippage may apply · hold until snapshot
          </p>
        </div>
      </div>
    </div>
  );
}
