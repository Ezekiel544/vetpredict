import "@rainbow-me/rainbowkit/styles.css";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { DEFAULT_CHAIN } from "./chains";
import { createVeWorldConnector } from "./veWorldConnector";

// WalletConnect is required for mobile / "connect from your phone" flows.
// Add your projectId at cloud.walletconnect.com → .env → REACT_APP_WALLETCONNECT_PROJECT_ID
const WC_PROJECT_ID = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || "";

const veWorldWallet = () =>
  ({
    id: "veworld",
    name: "VeWorld",
    iconUrl: "/veworld.svg",
    iconBackground: "#15171c",
    downloadUrls: {
      browserExtension: "https://veworld.net",
    },
    createConnector: (walletDetails) => createVeWorldConnector(walletDetails),
  });

const walletList = [
  {
    groupName: "Popular",
    wallets: [
      veWorldWallet,
      metaMaskWallet,
      injectedWallet,
      rainbowWallet,
      coinbaseWallet,
    ],
  },
];

if (WC_PROJECT_ID) {
  walletList.push({
    groupName: "Mobile",
    wallets: [walletConnectWallet],
  });
}

const connectors = connectorsForWallets(walletList, {
  appName: "Pooz",
  projectId: WC_PROJECT_ID || "pooz-placeholder",
});

export const wagmiConfig = createConfig({
  connectors,
  chains: [DEFAULT_CHAIN],
  transports: {
    [DEFAULT_CHAIN.id]: http(),
  },
  ssr: false,
});