import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  parseUnits,
  createPublicClient,
  http,
  formatUnits,
  erc20Abi,
  getAddress,
  isAddress,
} from "viem";
import { bsc, mainnet, base } from "viem/chains";
import { ERC20_ABI } from "./sellPortfolio";
import {
  CHAIN_KEY_TO_ID,
  getPrivateSaleContract,
  PRIVATE_SALE_CONTRACTS,
  PRIVATE_SALE_REVERT_MESSAGES,
} from "../constants/privateSaleContract";

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

const SOLANA_RPC =
  (typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_SOLANA_RPC_URL) ||
  "https://solana-rpc.publicnode.com";

function getSolanaConnection() {
  return new Connection(SOLANA_RPC, "confirmed");
}

const EVM_PUBLIC_CLIENTS = {
  BSC: createPublicClient({ chain: bsc, transport: http() }),
  ETH: createPublicClient({ chain: mainnet, transport: http() }),
  BASE: createPublicClient({ chain: base, transport: http() }),
};

/** Fixed native USD prices for private-sale balance + contributeNative math. */
export const PRIVATE_SALE_NATIVE_PRICE_USD = {
  BSC: 610.5,
  BNB: 610.5,
  ETH: 1885,
  BASE: 1885,
};

function getHardcodedNativePriceUsd(chainKey, token) {
  const key = String(chainKey || "").toUpperCase();
  if (PRIVATE_SALE_NATIVE_PRICE_USD[key] != null) {
    return PRIVATE_SALE_NATIVE_PRICE_USD[key];
  }
  const symbol = String(token?.symbol || "").toUpperCase();
  if (PRIVATE_SALE_NATIVE_PRICE_USD[symbol] != null) {
    return PRIVATE_SALE_NATIVE_PRICE_USD[symbol];
  }
  return null;
}

function toEvmAddress(value) {
  if (!value || !isAddress(value)) return null;
  try {
    return getAddress(value);
  } catch {
    return null;
  }
}

async function resolveNativePriceUsd(chainKey, chainConfig, token) {
  const hardcoded = getHardcodedNativePriceUsd(chainKey, token);
  if (hardcoded != null) return hardcoded;

  let price =
    token?.nativePriceUsd ?? chainConfig?.nativePriceUsd ?? null;
  if (Number.isFinite(Number(price)) && Number(price) > 0) {
    return Number(price);
  }
  return null;
}

function resolveEvmSaleContract(chainKey, chainConfig) {
  const local = getPrivateSaleContract(chainKey);
  const contractAddress = chainConfig?.contractAddress || local?.address;
  const abi = chainConfig?.abi || local?.abi;
  const chainId =
    chainConfig?.chainId || local?.chainId || CHAIN_KEY_TO_ID[chainKey];
  return { contractAddress, abi, chainId };
}

export function mapTierKeyToId(key) {
  const map = { SILVER: 0, GOLD: 1, PLATINUM: 2 };
  return map[String(key || "").toUpperCase()] ?? null;
}

export function tierIdFromPlanKey(planKey) {
  const map = { silver: 0, gold: 1, platinum: 2 };
  return map[String(planKey || "").toLowerCase()] ?? 0;
}

export function planKeyFromTierId(tierId) {
  const map = { 0: "silver", 1: "gold", 2: "platinum" };
  return map[Number(tierId)] ?? "silver";
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const NATIVE_SYMBOLS = new Set(["BNB", "ETH", "SOL"]);

/** Mainnet SPL mints used when the API lists USDC/USDT without a mint address. */
const SOLANA_KNOWN_MINTS = {
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMfrZAXG8xSF7BMUEaLsUxVX6VjZqiF37Nm11i3B",
};

function isValidSolanaAddress(value) {
  const s = String(value || "").trim();
  if (!s || s.startsWith("0x")) return false;
  try {
    // Throws if not a valid on-curve / base58 pubkey encoding.
    // eslint-disable-next-line no-new
    new PublicKey(s);
    return true;
  } catch {
    return false;
  }
}

export function isNativeToken(token) {
  if (!token) return false;
  if (token.isNative === true || token.native === true) return true;
  const symbol = String(token.symbol || "").toUpperCase();
  const address = String(token.address || token.mint || "").toLowerCase();
  return (
    NATIVE_SYMBOLS.has(symbol) &&
    (!address || address === ZERO_ADDRESS)
  );
}

export function normalizeChainToken(token, chainConfig) {
  if (!token) return null;
  const chainKey = String(chainConfig?.key || "").toUpperCase();
  const isSol = chainKey === "SOL";
  const symbol = String(token.symbol || "").toUpperCase();
  const native =
    isNativeToken(token) ||
    (isSol && (token.isNative === true || symbol === "SOL"));

  const decimals =
    Number(token.decimals) ||
    (native ? (isSol ? 9 : 18) : symbol === "USDT" || symbol === "USDC" ? 6 : 18);

  if (isSol) {
    // Private sale on Solana is USDC/USDT SPL only (no native SOL contribute).
    if (native || (symbol !== "USDT" && symbol !== "USDC")) return null;
    const mint = String(
      token.address || token.mint || SOLANA_KNOWN_MINTS[symbol] || "",
    ).trim();
    if (!isValidSolanaAddress(mint)) return null;
    return {
      ...token,
      symbol,
      address: mint,
      decimals,
      isNative: false,
      nativePriceUsd: null,
    };
  }

  if (native) {
    return {
      ...token,
      symbol,
      address: null,
      decimals,
      isNative: true,
      nativePriceUsd:
        getHardcodedNativePriceUsd(chainConfig?.key, token) ??
        token.nativePriceUsd ??
        chainConfig?.nativePriceUsd ??
        null,
    };
  }

  const erc20Address = toEvmAddress(token.address);
  if (!erc20Address) return null;
  return {
    ...token,
    symbol,
    address: erc20Address,
    decimals,
    isNative: false,
    nativePriceUsd: null,
  };
}

/** Whether a tier is unlocked for the current user per eligibility payload. */
export function isTierEligibleForUser(eligibility, tierKey) {
  if (!eligibility?.eligible) return false;
  const tiers = eligibility?.tiers;
  if (!tiers || typeof tiers !== "object") return true;
  const key = String(tierKey || "").toUpperCase();
  if (key in tiers) return tiers[key] === true;
  return true;
}

/** Convert a USD amount to token raw units (stablecoins: 1 USD = 1 token unit). */
export function usdToTokenRaw(amountUsd, decimals) {
  const n = Number(amountUsd);
  if (!Number.isFinite(n) || n <= 0) return 0n;
  const fixed = n.toFixed(Math.min(decimals, 8));
  return parseUnits(fixed, decimals);
}

/** Convert USD to native wei using posted native price (USD per 1 native token). */
export function usdToNativeWei(amountUsd, nativePriceUsd) {
  const usd = Number(amountUsd);
  const price = Number(nativePriceUsd);
  if (!Number.isFinite(usd) || !Number.isFinite(price) || price <= 0) {
    throw new Error("Native token price unavailable. Try again in a moment.");
  }
  const nativeAmount = usd / price;
  return parseUnits(nativeAmount.toFixed(18), 18);
}

export function parsePrivateSaleRevertError(error) {
  const raw = String(
    error?.shortMessage ||
      error?.cause?.reason ||
      error?.cause?.message ||
      error?.message ||
      error ||
      "",
  ).toLowerCase();

  for (const [key, message] of Object.entries(PRIVATE_SALE_REVERT_MESSAGES)) {
    if (raw.includes(key)) return message;
  }

  if (raw.includes("user rejected") || raw.includes("user denied")) {
    return "Transaction was rejected in your wallet.";
  }

  return error?.message || "Transaction failed. Please try again.";
}

export function normalizeTxHash(txResult) {
  if (typeof txResult === "string") return txResult;
  if (txResult?.hash) return txResult.hash;
  if (txResult?.transactionHash) return txResult.transactionHash;
  return null;
}

const RECEIPT_TIMEOUT_MS = 180_000;

async function waitForEvmTxReceipt(chainKey, hash) {
  const key = String(chainKey || "").toUpperCase();
  const client = EVM_PUBLIC_CLIENTS[key];
  if (!client) {
    throw new Error(`No RPC client configured for ${chainKey}.`);
  }
  if (!hash) throw new Error("Missing transaction hash.");
  const receipt = await client.waitForTransactionReceipt({
    hash,
    confirmations: 1,
    timeout: RECEIPT_TIMEOUT_MS,
  });
  if (receipt?.status === "reverted") {
    throw new Error("Transaction reverted on-chain.");
  }
  return receipt;
}

/**
 * Wait until an EVM contribution tx is mined before posting to the API.
 * Solana: no-op — POST the signature immediately; backend verifies finalized.
 */
export async function waitForPrivateSaleTxOnChain(chainKey, txHash) {
  const key = String(chainKey || "").toUpperCase();
  if (key === "SOL") return null;
  return waitForEvmTxReceipt(key, txHash);
}

/**
 * Execute an EVM private-sale contribution.
 * Stablecoin: approve then contribute. Native: contributeNative with msg.value.
 * Returns the contribute tx hash only after it is mined.
 */
export async function executeEvmPrivateSaleContribution({
  chainKey,
  chainConfig,
  tierId,
  token,
  amountUsd,
  walletAddress,
  writeContract,
  switchChain,
  currentChainId,
}) {
  const { contractAddress, abi, chainId } = resolveEvmSaleContract(
    chainKey,
    chainConfig,
  );
  if (!contractAddress || !abi) {
    throw new Error("Sale contract not configured for this chain.");
  }

  if (currentChainId !== chainId && switchChain?.mutateAsync) {
    try {
      await switchChain.mutateAsync({ chainId });
    } catch (switchErr) {
      throw new Error(
        switchErr?.message ||
          `Please switch to ${chainKey} to complete your contribution.`,
      );
    }
  }

  const isNative = isNativeToken(token);

  if (isNative) {
    const nativePriceUsd = await resolveNativePriceUsd(
      chainKey,
      chainConfig,
      token,
    );
    const value = usdToNativeWei(amountUsd, nativePriceUsd);
    const txResult = await writeContract({
      address: contractAddress,
      abi,
      functionName: "contributeNative",
      args: [Number(tierId)],
      value,
      chainId,
    });
    const hash = normalizeTxHash(txResult);
    await waitForEvmTxReceipt(chainKey, hash);
    return hash;
  }

  const rawAmount = usdToTokenRaw(amountUsd, token.decimals);
  if (rawAmount <= 0n) {
    throw new Error("Invalid contribution amount.");
  }

  const approveResult = await writeContract({
    address: token.address,
    abi: ERC20_ABI,
    functionName: "approve",
    args: [contractAddress, rawAmount],
    chainId,
  });
  await waitForEvmTxReceipt(chainKey, normalizeTxHash(approveResult));

  const txResult = await writeContract({
    address: contractAddress,
    abi,
    functionName: "contribute",
    args: [Number(tierId), token.address, rawAmount],
    chainId,
  });
  const hash = normalizeTxHash(txResult);
  await waitForEvmTxReceipt(chainKey, hash);
  return hash;
}

/**
 * Build and send a Solana contribution: SPL transfer + mandatory memo.
 * Memo format: ALLOX:PS:<tierId>
 */
export async function executeSolanaPrivateSaleContribution({
  tierId,
  token,
  amountUsd,
  treasuryAddress,
  fromPubkey,
  sendTransaction,
}) {
  if (!treasuryAddress) {
    throw new Error("Solana treasury address is not configured.");
  }
  if (!fromPubkey) {
    throw new Error("Solana wallet not connected.");
  }

  const connection = getSolanaConnection();
  const from = new PublicKey(fromPubkey);
  const to = new PublicKey(treasuryAddress);
  const rawAmount = usdToTokenRaw(amountUsd, token.decimals);

  const { blockhash } = await connection.getLatestBlockhash();
  const tx = new Transaction({
    feePayer: from,
    recentBlockhash: blockhash,
  });

  const mint = new PublicKey(token.address);
  const sourceAta = getAssociatedTokenAddressSync(mint, from, false);
  const destAta = getAssociatedTokenAddressSync(mint, to, false);

  const destInfo = await connection.getAccountInfo(destAta);
  if (!destInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(from, destAta, to, mint),
    );
  }

  tx.add(
    createTransferInstruction(
      sourceAta,
      destAta,
      from,
      rawAmount,
      [],
      TOKEN_PROGRAM_ID,
    ),
  );

  const memo = `ALLOX:PS:${tierId}`;
  tx.add(
    new TransactionInstruction({
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memo, "utf8"),
    }),
  );

  if (!sendTransaction) {
    throw new Error("Solana wallet does not support sending transactions.");
  }

  const sig = await sendTransaction(tx, connection);
  if (!sig) throw new Error("Missing transaction signature.");
  // Do not await confirmTransaction here — blockhash expiry (~60–90s) can throw
  // even when the tx landed. Backend verifies finalized status via reconciler.
  return typeof sig === "string" ? sig : sig?.signature || String(sig);
}

const PRIVATE_TIER_UNLOCK = {
  silver: { tgePct: 100, cliff: "None", vesting: "No vesting" },
  gold: { tgePct: 20, cliff: "None", vesting: "12 months, linear" },
  platinum: { tgePct: 0, cliff: "3 months", vesting: "12 months, linear" },
};

function parseFdvUsd(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const raw = String(value ?? "").trim();
  if (!raw) return 0;
  const million = raw.match(/([\d.]+)\s*m/i);
  if (million) return Number(million[1]) * 1_000_000;
  const n = Number(raw.replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Map API tier objects to UI plan shape. Unlock terms are hardcoded per tier. */
export function mapApiTiersToPlans(tiers) {
  if (!Array.isArray(tiers)) return [];
  return tiers.map((tier) => {
    const id = String(tier.key || "").toLowerCase();
    const unlock = PRIVATE_TIER_UNLOCK[id] ?? PRIVATE_TIER_UNLOCK.silver;
    return {
      id,
      tierId: tier.id,
      key: tier.key,
      name: tier.label || tier.key,
      discount: Number(tier.discountPct) || 0,
      fdv: parseFdvUsd(tier.fdv),
      price: Number(tier.priceUsd) || 0,
      unlock: tier.unlock || "",
      tgePct: unlock.tgePct,
      cliff: unlock.cliff,
      vesting: unlock.vesting,
      raisedUsd: tier.raisedUsd,
      contributions: tier.contributions,
      premium: id === "platinum",
    };
  });
}

/** Normalize API chains into UI-ready config with chainId */
export function normalizeSaleChains(chains) {
  const source =
    Array.isArray(chains) && chains.length > 0
      ? chains
      : Object.keys(PRIVATE_SALE_CONTRACTS).map((key) => ({
          key,
          enabled: true,
        }));

  return source
    .filter((c) => c?.enabled !== false)
    .map((c) => {
      const key = String(c.key || c.chain || "")
        .toUpperCase()
        .replace("SOLANA", "SOL");
      const local = getPrivateSaleContract(key);
      const chainId =
        local?.chainId ?? CHAIN_KEY_TO_ID[key] ?? (key === "SOL" ? 101 : 56);
      const chainConfig = {
        key,
        chainId,
        contractAddress: c.contractAddress || c.contract || local?.address || null,
        abi: local?.abi ?? null,
        treasuryAddress: c.treasuryAddress || c.treasury || null,
        nativePriceUsd:
          PRIVATE_SALE_NATIVE_PRICE_USD[key] ?? c.nativePriceUsd ?? null,
      };

      let tokens = (Array.isArray(c.tokens) ? c.tokens : [])
        .map((token) => normalizeChainToken(token, chainConfig))
        .filter(Boolean);

      // Ensure Solana always exposes USDC/USDT for the SPL + memo contribute flow.
      if (key === "SOL" && tokens.length === 0) {
        tokens = ["USDC", "USDT"]
          .map((symbol) =>
            normalizeChainToken(
              {
                symbol,
                address: SOLANA_KNOWN_MINTS[symbol],
                decimals: 6,
              },
              chainConfig,
            ),
          )
          .filter(Boolean);
      }

      return {
        ...chainConfig,
        tokens,
      };
    });
}

/**
 * Wallet balance for the selected sale token on BSC / ETH / BASE / SOL.
 * Supports USDT, USDC, and native (BNB / ETH).
 */
export async function fetchPrivateSaleTokenBalance({
  chainKey,
  chainConfig,
  token,
  walletAddress,
  solanaPubkey,
}) {
  if (!token) return null;
  const key = String(chainKey || chainConfig?.key || "").toUpperCase();
  const symbol = String(token.symbol || "").toUpperCase();
  const decimals = Number(token.decimals) || (isNativeToken(token) ? 18 : 6);

  let amount = 0;

  if (key === "SOL") {
    if (!solanaPubkey || !token.address) return null;
    const connection = getSolanaConnection();
    const owner = new PublicKey(solanaPubkey);
    const mint = new PublicKey(token.address);
    const ata = getAssociatedTokenAddressSync(mint, owner, false);
    try {
      const res = await connection.getTokenAccountBalance(ata);
      amount = Number(res?.value?.uiAmount ?? 0);
    } catch {
      amount = 0;
    }
  } else {
    const client = EVM_PUBLIC_CLIENTS[key];
    const owner = toEvmAddress(walletAddress);
    if (!client || !owner) return null;

    if (isNativeToken(token)) {
      const wei = await client.getBalance({ address: owner });
      amount = Number(formatUnits(wei, decimals));
    } else {
      const tokenAddress = toEvmAddress(token.address);
      if (!tokenAddress) return null;
      const raw = await client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [owner],
      });
      amount = Number(formatUnits(raw, decimals));
    }
  }

  if (!Number.isFinite(amount) || amount < 0) amount = 0;

  let usd = null;
  if (isNativeToken(token)) {
    const price = await resolveNativePriceUsd(key, chainConfig, token);
    if (price) usd = amount * price;
  } else if (symbol === "USDT" || symbol === "USDC") {
    // Stablecoins are treated as $1 for contribution / MAX.
    usd = amount;
  } else {
    usd = amount;
  }

  return {
    amount,
    usd,
    symbol,
    isNative: isNativeToken(token),
  };
}

export function getTokensForChain(chains, chainKey, { isSolanaWallet }) {
  const chain = chains.find(
    (c) => String(c.key).toUpperCase() === String(chainKey).toUpperCase(),
  );
  if (!chain) return [];

  if (chain.key === "SOL" && !isSolanaWallet) return [];
  if (chain.key !== "SOL" && isSolanaWallet) return [];

  return chain.tokens.filter(Boolean);
}
