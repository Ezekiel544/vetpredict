import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";

export function useEVMWallet() {
  const { address, isConnected, connector } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();

  return {
    address: address ? address.toLowerCase() : null,
    isConnected,
    connectorName: connector?.name || null,
    openConnectModal,
    disconnect,
  };
}