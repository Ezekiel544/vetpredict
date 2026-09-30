import { createConnector } from "wagmi";
import {
  getWalletAddress,
  signAuthMessage,
  hasConnex,
  waitForConnex,
} from "../services/vechain";
import { vechainTestnet } from "./chains";

// Wraps VeWorld's Connex signer (browser extension / mobile dApp browser) as a
// regular wagmi v2 connector, so VeWorld appears as a wallet in the RainbowKit
// picker next to MetaMask, Coinbase, Rainbow, WalletConnect, etc.
//
// wagmi v2 uses plain-object connectors built via `createConnector`, so every
// method is explicit here (class instances do not survive object spreads).
const VEWORLD_ID = "veworld";

function buildVeWorldConnector() {
  let provider = null;
  let address = null;

  async function getProvider() {
    if (provider) return provider;

    const detected = await waitForConnex(5000);
    if (!detected) {
      throw new Error(
        "VeWorld wallet not detected. Install the extension from veworld.net"
      );
    }

    provider = {
      connex: window.connex || window.vechain,
      chainId: vechainTestnet.id,
      request: async () => null,
    };
    return provider;
  }

  async function ensureAddress() {
    if (!address) address = (await getWalletAddress()).toLowerCase();
    return address;
  }

  return {
    id: VEWORLD_ID,
    name: "VeWorld",
    type: VEWORLD_ID,
    ready: true,

    async setup() {},

    async connect() {
      const p = await getProvider();
      const account = await ensureAddress();
      return { accounts: [account], chainId: p.chainId };
    },

    async getAccounts() {
      if (address) return [address];
      throw new Error("VeWorld not connected");
    },

    async getAccount() {
      return ensureAddress();
    },

    async getChainId() {
      const p = await getProvider();
      return p.chainId;
    },

    // VeWorld permissions are transient (per-page), so never silently reconnect.
    isAuthorized: () => Promise.resolve(false),

    async getProvider() {
      return getProvider();
    },

    async disconnect() {
      provider = null;
      address = null;
    },

    async signMessage({ message }) {
      await getProvider();
      const raw =
        typeof message === "object"
          ? message?.raw ?? message?.hex ?? message?.string
          : message;
      const account = await ensureAddress();
      const cert = await signAuthMessage(account, String(raw));
      return cert.signature;
    },
  };
}

// `walletDetails` = { rkDetails, ... } that RainbowKit spreads onto every
// connector so it knows the badge / icon / position shown in the picker.
export function createVeWorldConnector(walletDetails) {
  return createConnector((parameters) => ({
    ...buildVeWorldConnector(),
    ...walletDetails,
  }));
}