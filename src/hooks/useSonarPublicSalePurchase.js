import { useCallback, useEffect, useRef, useState } from "react";
import { useConfig, useWriteContract } from "wagmi";
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
} from "@wagmi/core";
import {
  BaseError,
  ContractFunctionRevertedError,
  UserRejectedRequestError,
  formatUnits,
  parseUnits,
} from "viem";
import { InvestingRegion, PrePurchaseFailureReason } from "@echoxyz/sonar-core";
import { useSonarClient } from "@echoxyz/sonar-react";
import {
  PUBLIC_SALE_ETH_ABI,
  public_sale_eth_address,
} from "../constants/contracts";
import { PUBLIC_SALE_CHAIN_ID } from "../utils/publicSaleApi";
import { getSonarHomeUrl, sonarSaleUUID } from "../config/sonar";

const SALE_CONTRACT = public_sale_eth_address;
const CHAIN_ID = PUBLIC_SALE_CHAIN_ID;

// approve() is declared without outputs: Ethereum USDT doesn't return a bool,
// so a standard ERC-20 ABI would fail to decode its result.
const PAYMENT_TOKEN_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
];

/**
 * User-facing copy for each Sonar pre-purchase failure reason.
 * `action` tells the UI which button to offer.
 */
export function describePrePurchaseFailure(reason) {
  switch (reason) {
    case PrePurchaseFailureReason.REQUIRES_LIVENESS:
      return {
        tone: "amber",
        title: "Liveness check required",
        detail:
          "Sonar needs a quick liveness check before you can commit. It opens in a new tab and takes about a minute. Come back here and commit again when you're done.",
        action: "liveness",
      };
    case PrePurchaseFailureReason.WALLET_RISK:
      return {
        tone: "red",
        title: "This wallet can't be used for the sale",
        detail:
          "The connected wallet didn't pass Sonar's wallet risk screening. Connect a different wallet to commit.",
        action: "switchWallet",
      };
    case PrePurchaseFailureReason.MAX_WALLETS_USED:
      return {
        tone: "red",
        title: "Wallet limit reached",
        detail:
          "Your entity has already used the maximum number of wallets for this sale. Connect a wallet you've committed with before.",
        action: "switchWallet",
      };
    case PrePurchaseFailureReason.WALLET_NOT_LINKED:
      return {
        tone: "amber",
        title: "Wallet not linked to your entity",
        detail:
          "The connected wallet isn't linked to your Sonar entity. Link it on Sonar, then try again.",
        action: "sonar",
      };
    case PrePurchaseFailureReason.SALE_NOT_ACTIVE:
      return {
        tone: "gray",
        title: "The sale isn't open",
        detail:
          "Commitments are not being accepted right now. Check the sale schedule and try again once the sale is live.",
      };
    case PrePurchaseFailureReason.OUTSIDE_TIME_WINDOW:
      return {
        tone: "gray",
        title: "Outside your purchase window",
        detail:
          "You can't commit at this time. Your entity's purchase window hasn't opened yet or has already closed.",
      };
    default:
      return {
        tone: "red",
        title: "We couldn't confirm you're ready to commit",
        detail:
          "Sonar returned an unexpected result. Try again, or contact support@echo.xyz if it keeps happening.",
        action: "retry",
      };
  }
}

// Revert reasons from the SettlementSale contract.
const CONTRACT_ERROR_MESSAGES = {
  BidBelowMinAmount: "Your total commitment is below the minimum allowed.",
  BidExceedsMaxAmount: "Your total commitment is above the maximum allowed.",
  BidAmountCannotBeLowered:
    "Your new total can't be lower than what you've already committed.",
  BidOutsideAllowedWindow: "You're outside your allowed purchase window.",
  PurchasePermitExpired:
    "Your purchase permit expired before the transaction went through. Commit again to get a new one.",
  MaxWalletsPerEntityExceeded:
    "Your entity has reached the maximum number of wallets for this sale.",
  WalletTiedToAnotherEntity:
    "This wallet is already used by another Sonar entity. Connect a different wallet.",
  WalletNotAssociatedWithEntity:
    "This wallet isn't associated with your Sonar entity.",
  SalePaused: "The sale is paused. Try again later.",
  InvalidStage: "The sale isn't accepting commitments right now.",
  InvalidPaymentToken: "This token isn't accepted for the sale.",
  InvalidSaleUUID: "The purchase permit is for a different sale.",
  InvalidSender: "The connected wallet doesn't match the purchase permit.",
  UnauthorizedSigner: "The purchase permit signature is invalid.",
  SafeERC20FailedOperation:
    "The token transfer failed. Check your balance and token approval.",
  ZeroAmount: "Enter an amount greater than zero.",
  BidMustHaveLockup:
    "U.S. investors' commitments must include the token lockup. Refresh and try again.",
  BidLockupCannotBeUndone:
    "Your commitment already includes the token lockup, which can't be removed.",
};

export function parsePurchaseError(err) {
  if (err instanceof BaseError) {
    if (err.walk((e) => e instanceof UserRejectedRequestError)) {
      return "You rejected the request in your wallet.";
    }
    const revert = err.walk((e) => e instanceof ContractFunctionRevertedError);
    const errorName = revert?.data?.errorName;
    if (errorName && CONTRACT_ERROR_MESSAGES[errorName]) {
      return CONTRACT_ERROR_MESSAGES[errorName];
    }
    if (errorName) return `Transaction reverted: ${errorName}.`;
    return err.shortMessage || err.message;
  }
  const msg = String(err?.message || "");
  if (/user (rejected|denied)/i.test(msg)) {
    return "You rejected the request in your wallet.";
  }
  return msg || "Something went wrong. Please try again.";
}

const uuidToBytes16 = (uuid) =>
  `0x${String(uuid || "").replace(/-/g, "").toLowerCase()}`;

/**
 * Sonar public-sale purchase flow (frontend-only integration).
 *
 * prePurchaseCheck runs only inside `commit()`, never on mount, per Sonar's
 * integration checklist. Flow: prePurchaseCheck → generatePurchasePermit →
 * approve the increment → replaceBidWithApproval with the new total.
 */
export function useSonarPublicSalePurchase({
  entity,
  walletAddress,
  enabled = true,
  currentChainId,
  switchToSaleChain,
  onBidSubmitted,
}) {
  const sonarClient = useSonarClient();
  const config = useConfig();
  const { mutateAsync: writeContractAsync } = useWriteContract();

  const saleSpecificEntityID = entity?.SaleSpecificEntityID ?? null;
  // The sale forces a vesting lockup on U.S. investors; the contract rejects
  // their bids without it (Sonar docs: planning/lockup-vesting).
  const requiresLockup = entity?.InvestingRegion === InvestingRegion.US;

  const [saleInfo, setSaleInfo] = useState(null);
  const [saleInfoError, setSaleInfoError] = useState(null);
  const [tokenBalances, setTokenBalances] = useState({});
  const [currentTotalRaw, setCurrentTotalRaw] = useState(0n);
  const [committedByToken, setCommittedByToken] = useState({});
  const [step, setStep] = useState("idle");
  const [failure, setFailure] = useState(null);
  const [error, setError] = useState(null);
  const [lastTxHash, setLastTxHash] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Sale contract config: payment tokens, pause flag, and a check that the
  // contract belongs to the configured Sonar sale.
  const loadSaleInfo = useCallback(async () => {
    try {
      const read = (functionName, args) =>
        readContract(config, {
          address: SALE_CONTRACT,
          abi: PUBLIC_SALE_ETH_ABI,
          functionName,
          args,
          chainId: CHAIN_ID,
        });
      const [tokenAddresses, paused, contractSaleUUID] = await Promise.all([
        read("paymentTokens"),
        read("paused"),
        read("saleUUID"),
      ]);
      const tokens = await Promise.all(
        tokenAddresses.map(async (address) => {
          const [symbol, decimals] = await Promise.all([
            readContract(config, {
              address,
              abi: PAYMENT_TOKEN_ABI,
              functionName: "symbol",
              chainId: CHAIN_ID,
            }),
            readContract(config, {
              address,
              abi: PAYMENT_TOKEN_ABI,
              functionName: "decimals",
              chainId: CHAIN_ID,
            }),
          ]);
          return { address, symbol, decimals: Number(decimals) };
        }),
      );
      const saleUUIDMatches =
        !sonarSaleUUID ||
        String(contractSaleUUID).toLowerCase() === uuidToBytes16(sonarSaleUUID);
      if (mountedRef.current) {
        setSaleInfo({ tokens, paused, saleUUIDMatches });
        setSaleInfoError(null);
      }
    } catch (err) {
      console.error("Public sale contract read failed:", err);
      if (mountedRef.current) {
        setSaleInfoError("Couldn't load the sale contract. Refresh to try again.");
      }
    }
  }, [config]);

  // Entity commitment + wallet balances. Safe to call on load: these are
  // plain on-chain reads, not Sonar pre-purchase checks.
  const loadPosition = useCallback(async () => {
    if (!saleInfo) return;
    try {
      if (saleSpecificEntityID) {
        const states = await readContract(config, {
          address: SALE_CONTRACT,
          abi: PUBLIC_SALE_ETH_ABI,
          functionName: "entityStatesByIDs",
          args: [[saleSpecificEntityID]],
          chainId: CHAIN_ID,
        });
        const state = states?.[0];
        const byToken = {};
        for (const wallet of state?.walletStates ?? []) {
          for (const { token, amount } of wallet.committedAmountByToken ?? []) {
            const key = token.toLowerCase();
            byToken[key] = (byToken[key] ?? 0n) + amount;
          }
        }
        if (mountedRef.current) {
          setCurrentTotalRaw(state?.currentBid?.amount ?? 0n);
          setCommittedByToken(byToken);
        }
      } else if (mountedRef.current) {
        // No entity (e.g. Sonar disconnected): drop the previous position.
        setCurrentTotalRaw(0n);
        setCommittedByToken({});
      }
      if (walletAddress) {
        const balances = await Promise.all(
          saleInfo.tokens.map((t) =>
            readContract(config, {
              address: t.address,
              abi: PAYMENT_TOKEN_ABI,
              functionName: "balanceOf",
              args: [walletAddress],
              chainId: CHAIN_ID,
            }),
          ),
        );
        if (mountedRef.current) {
          setTokenBalances(
            Object.fromEntries(
              saleInfo.tokens.map((t, i) => [t.symbol.toUpperCase(), balances[i]]),
            ),
          );
        }
      }
    } catch (err) {
      console.error("Public sale position read failed:", err);
    }
  }, [config, saleInfo, saleSpecificEntityID, walletAddress]);

  useEffect(() => {
    if (enabled) loadSaleInfo();
  }, [enabled, loadSaleInfo]);

  useEffect(() => {
    if (enabled) loadPosition();
  }, [enabled, loadPosition]);

  // A new entity or wallet invalidates any previous check result and position.
  const entityID = entity?.EntityID;
  const resultKey = `${entityID ?? ""}:${walletAddress ?? ""}`;
  const [lastResultKey, setLastResultKey] = useState(resultKey);
  if (resultKey !== lastResultKey) {
    setLastResultKey(resultKey);
    setFailure(null);
    setError(null);
    setStep("idle");
    setLastTxHash(null);
    setCurrentTotalRaw(0n);
    setCommittedByToken({});
  }

  const getToken = useCallback(
    (symbol) =>
      saleInfo?.tokens.find(
        (t) => t.symbol.toUpperCase() === String(symbol).toUpperCase(),
      ) ?? null,
    [saleInfo],
  );

  const commit = useCallback(
    async ({ amountUsd, tokenSymbol, tierId }) => {
      setError(null);
      setFailure(null);
      setLastTxHash(null);

      const token = getToken(tokenSymbol);
      if (!entityID || !walletAddress) {
        setError("Connect your wallet and Sonar entity first.");
        return false;
      }
      if (!token) {
        setError(`${tokenSymbol} isn't accepted for this sale.`);
        return false;
      }

      let incrementRaw;
      try {
        incrementRaw = parseUnits(String(amountUsd), token.decimals);
      } catch {
        setError("Enter a valid amount.");
        return false;
      }
      if (incrementRaw <= 0n) {
        setError("Enter an amount greater than zero.");
        return false;
      }

      try {
        // 1. Sonar pre-purchase check — only here, during the purchase flow.
        setStep("checking");
        const check = await sonarClient.prePurchaseCheck({
          saleUUID: sonarSaleUUID,
          entityID,
          walletAddress,
        });
        if (!check.ReadyToPurchase) {
          if (mountedRef.current) {
            setFailure({
              reason: check.FailureReason,
              livenessCheckURL: check.LivenessCheckURL,
              ...describePrePurchaseFailure(check.FailureReason),
            });
            setStep("idle");
          }
          return false;
        }

        // 2. Signed purchase permit.
        setStep("permit");
        const permitResp = await sonarClient.generatePurchasePermit({
          saleUUID: sonarSaleUUID,
          entityID,
          walletAddress,
        });
        const permit = permitResp.PermitJSON;
        if (!permit || !("OpensAt" in permit)) {
          throw new Error(
            "Sonar returned an unexpected purchase permit. Please contact support.",
          );
        }

        if (currentChainId !== CHAIN_ID) {
          setStep("switching");
          await switchToSaleChain?.();
        }

        // 3. The bid amount is the entity's new total, not the increment.
        const states = await readContract(config, {
          address: SALE_CONTRACT,
          abi: PUBLIC_SALE_ETH_ABI,
          functionName: "entityStatesByIDs",
          args: [[permit.SaleSpecificEntityID]],
          chainId: CHAIN_ID,
        });
        const existingTotal = states?.[0]?.currentBid?.amount ?? 0n;
        // Once a bid has lockup it can't be removed.
        const lockup =
          requiresLockup || states?.[0]?.currentBid?.lockup === true;
        const newTotalRaw = existingTotal + incrementRaw;

        const maxAmount = BigInt(permit.MaxAmount);
        const minAmount = BigInt(permit.MinAmount);
        // The contract treats MaxAmount 0 as "no allocation", not "no limit".
        if (maxAmount === 0n) {
          throw new Error(
            "No purchase allocation is set for your account on this sale. Please contact support.",
          );
        }
        if (newTotalRaw > maxAmount) {
          throw new Error(
            `Your total would be ${formatUnits(newTotalRaw, token.decimals)} ${token.symbol}, above your limit of ${formatUnits(maxAmount, token.decimals)}.`,
          );
        }
        if (newTotalRaw < minAmount) {
          throw new Error(
            `The minimum total commitment is ${formatUnits(minAmount, token.decimals)} ${token.symbol}.`,
          );
        }

        const balance = await readContract(config, {
          address: token.address,
          abi: PAYMENT_TOKEN_ABI,
          functionName: "balanceOf",
          args: [walletAddress],
          chainId: CHAIN_ID,
        });
        if (balance < incrementRaw) {
          throw new Error(
            `You don't have enough ${token.symbol} on Ethereum for this commitment.`,
          );
        }

        // 4. Approve the increment. USDT requires resetting a non-zero
        // allowance to 0 before setting a new one.
        const allowance = await readContract(config, {
          address: token.address,
          abi: PAYMENT_TOKEN_ABI,
          functionName: "allowance",
          args: [walletAddress, SALE_CONTRACT],
          chainId: CHAIN_ID,
        });
        if (allowance < incrementRaw) {
          setStep("approving");
          if (allowance > 0n && token.symbol.toUpperCase() === "USDT") {
            const resetHash = await writeContractAsync({
              address: token.address,
              abi: PAYMENT_TOKEN_ABI,
              functionName: "approve",
              args: [SALE_CONTRACT, 0n],
              chainId: CHAIN_ID,
            });
            await waitForTransactionReceipt(config, {
              hash: resetHash,
              chainId: CHAIN_ID,
            });
          }
          const approveHash = await writeContractAsync({
            address: token.address,
            abi: PAYMENT_TOKEN_ABI,
            functionName: "approve",
            args: [SALE_CONTRACT, incrementRaw],
            chainId: CHAIN_ID,
          });
          const approveReceipt = await waitForTransactionReceipt(config, {
            hash: approveHash,
            chainId: CHAIN_ID,
          });
          if (approveReceipt.status !== "success") {
            throw new Error("The token approval failed on-chain.");
          }
        }

        // 5. Commit. Simulate first so contract reverts surface as readable
        // errors before the wallet prompt.
        setStep("committing");
        const { request } = await simulateContract(config, {
          address: SALE_CONTRACT,
          abi: PUBLIC_SALE_ETH_ABI,
          functionName: "replaceBidWithApproval",
          args: [
            token.address,
            { lockup, price: 0n, amount: newTotalRaw },
            {
              saleSpecificEntityID: permit.SaleSpecificEntityID,
              saleUUID: permit.SaleUUID,
              wallet: permit.Wallet,
              expiresAt: BigInt(permit.ExpiresAt),
              minAmount,
              maxAmount,
              minPrice: BigInt(permit.MinPrice),
              maxPrice: BigInt(permit.MaxPrice),
              opensAt: BigInt(permit.OpensAt),
              closesAt: BigInt(permit.ClosesAt),
              payload: permit.Payload,
            },
            permitResp.Signature,
          ],
          account: walletAddress,
          chainId: CHAIN_ID,
        });
        const bidHash = await writeContractAsync(request);
        if (mountedRef.current) {
          setLastTxHash(bidHash);
          setStep("confirming");
        }
        // The wallet confirmed the bid: report it to the backend now rather
        // than after the receipt, so it is tracked even if the tab closes.
        onBidSubmitted?.(bidHash, { tierId });
        const receipt = await waitForTransactionReceipt(config, {
          hash: bidHash,
          chainId: CHAIN_ID,
        });
        if (receipt.status !== "success") {
          throw new Error("Your commitment transaction reverted on-chain.");
        }

        if (mountedRef.current) setStep("success");
        await loadPosition();
        return true;
      } catch (err) {
        console.error("Public sale commit failed:", err);
        if (mountedRef.current) {
          setError(parsePurchaseError(err));
          setStep("idle");
        }
        return false;
      }
    },
    [
      config,
      currentChainId,
      entityID,
      getToken,
      loadPosition,
      onBidSubmitted,
      requiresLockup,
      sonarClient,
      switchToSaleChain,
      walletAddress,
      writeContractAsync,
    ],
  );

  const clearResult = useCallback(() => {
    setFailure(null);
    setError(null);
    setStep("idle");
  }, []);

  const formatRaw = useCallback(
    (raw, symbol) => {
      const token = symbol ? getToken(symbol) : saleInfo?.tokens?.[0];
      if (!token || raw == null) return null;
      return Number(formatUnits(raw, token.decimals));
    },
    [getToken, saleInfo],
  );

  const committedTotal = formatRaw(currentTotalRaw);

  return {
    saleContract: SALE_CONTRACT,
    saleInfo,
    saleInfoError,
    tokens: saleInfo?.tokens ?? [],
    tokenBalance: (symbol) => formatRaw(tokenBalances[String(symbol).toUpperCase()], symbol),
    committedTotal,
    committedByToken: (saleInfo?.tokens ?? []).map((t) => ({
      symbol: t.symbol,
      amount: Number(
        formatUnits(committedByToken[t.address.toLowerCase()] ?? 0n, t.decimals),
      ),
    })),
    step,
    busy: !["idle", "success"].includes(step),
    failure,
    error,
    lastTxHash,
    requiresLockup,
    commit,
    clearResult,
    refresh: loadPosition,
    sonarHomeUrl: getSonarHomeUrl(),
  };
}
