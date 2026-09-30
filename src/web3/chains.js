import { defineChain } from "viem";

// VeChainThor exposes an Ethereum-compatible JSON-RPC proxy, so any standard
// EIP-1193 / EIP-6963 wallet (MetaMask, Coinbase, Rainbow, …) can connect.
// Chain IDs: Mainnet 100009 · Testnet 100010
export const vechainTestnet = defineChain({
  id: 100010,
  name: "VeChain EVM Testnet",
  nativeCurrency: { name: "VeChain", symbol: "VET", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-testnet.vechain.energy"] },
  },
  blockExplorers: {
    default: { name: "VeChain Explorer", url: "https://explore-testnet.vechain.org" },
  },
});

export const vechainMainnet = defineChain({
  id: 100009,
  name: "VeChain EVM Mainnet",
  nativeCurrency: { name: "VeChain", symbol: "VET", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-mainnet.vechain.energy"] },
  },
  blockExplorers: {
    default: { name: "VeChain Explorer", url: "https://explore.vechain.org" },
  },
});

// The chain the app is currently pointed at. Testnet matches the running backend.
export const DEFAULT_CHAIN = vechainTestnet;