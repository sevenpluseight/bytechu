"use client";

import React, { useEffect, useState } from "react";
import "../styles/globals.css";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const CONTRACT_ADDRESS = "0x6eED2f58ed21a651CCc42Af123E243FaBad920E0";
const CONTRACT_ABI = [
  {
    inputs: [],
    name: "greeting",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
];

const OASIS_SAPPHIRE_CHAIN_ID = 23295;

function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [greeting, setGreeting] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoadingGreeting, setIsLoadingGreeting] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask to continue.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts: string[] = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAddress(accounts[0]);
      const hexChainId: string = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(parseInt(hexChainId, 16));
    } catch (e: any) {
      setError(e?.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToSapphire = async () => {
    if (!window.ethereum) return;

    setError(null);

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x5B7F",
            chainName: "Oasis Sapphire Testnet",
            nativeCurrency: {
              name: "SROSE",
              symbol: "SROSE",
              decimals: 18,
            },
            rpcUrls: ["https://testnet.sapphire.oasis.dev"],
            blockExplorerUrls: ["https://testnet.explorer.sapphire.oasis.dev/"],
          },
        ],
      });
      const hexChainId: string = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(parseInt(hexChainId, 16));
    } catch (e: any) {
      setError(e?.message || "Failed to switch network");
    }
  };

  const fetchGreeting = React.useCallback(async () => {
    if (!window.ethereum || chainId !== OASIS_SAPPHIRE_CHAIN_ID) return;

    setIsLoadingGreeting(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const result: string = await contract.greeting();
      setGreeting(result);
    } catch (e: any) {
      setError("Failed to read greeting: " + (e.message || e.toString()));
    } finally {
      setIsLoadingGreeting(false);
    }
  }, [chainId]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      setAddress(accounts[0] || null);
      setError(null);
    };

    const handleChainChanged = (hex: string) => {
      setChainId(parseInt(hex, 16));
      setError(null);
    };

    window.ethereum.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum.on?.("chainChanged", handleChainChanged);

    (async () => {
      try {
        const accounts: string[] = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length) setAddress(accounts[0]);
        const hexChainId: string = await window.ethereum.request({ method: "eth_chainId" });
        setChainId(parseInt(hexChainId, 16));
      } catch {}
    })();

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  useEffect(() => {
    if (address && chainId === OASIS_SAPPHIRE_CHAIN_ID) {
      fetchGreeting();
    }
  }, [address, chainId, fetchGreeting]);

  const isConnectedToSapphire = address && chainId === OASIS_SAPPHIRE_CHAIN_ID;

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Oasis Sapphire</h1>
              <p className="text-gray-300 text-sm">Privacy-Enabled Smart Contracts</p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3">
              <span className="text-red-400 text-lg mt-0.5 flex-shrink-0">⚠️</span>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Connection Section */}
          {!address ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-300 text-sm mb-4">Connect your wallet to get started</p>
              </div>
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {isConnecting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-lg">👛</span>
                )}
                <span>{isConnecting ? "Connecting..." : "Connect MetaMask"}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Wallet Info */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-lg">✅</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Wallet Connected</p>
                    <p className="text-gray-300 text-sm font-mono">{formatAddress(address)}</p>
                  </div>
                </div>
              </div>

              {/* Network Status */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🌐</span>
                    <div>
                      <p className="text-white font-medium">Network Status</p>
                      <p className="text-gray-300 text-sm">Chain ID: {chainId}</p>
                    </div>
                  </div>
                  <div>
                    {chainId === OASIS_SAPPHIRE_CHAIN_ID ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-sm font-medium">Sapphire</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-400 text-sm font-medium">Wrong Network</span>
                      </div>
                    )}
                  </div>
                </div>
                {chainId !== OASIS_SAPPHIRE_CHAIN_ID && (
                  <button
                    onClick={switchToSapphire}
                    className="mt-4 w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <span className="text-lg">🔗</span>
                    <span>Switch to Sapphire Testnet</span>
                  </button>
                )}
              </div>

              {/* Contract Interaction */}
              {isConnectedToSapphire && (
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-6 border border-purple-500/20">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-sm">📜</span>
                      </div>
                      <h3 className="text-white font-semibold">Smart Contract</h3>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4">
                      <p className="text-gray-300 text-xs mb-2">Contract Greeting:</p>
                      {isLoadingGreeting ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <p className="text-white font-mono text-lg break-all">{greeting || "No greeting found"}</p>
                      )}
                    </div>
                    <button
                      onClick={fetchGreeting}
                      disabled={isLoadingGreeting}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center space-x-2"
                    >
                      <span>🔄</span>
                      <span>{isLoadingGreeting ? "Loading..." : "Refresh Greeting"}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-gray-400 text-xs">Oasis Sapphire Testnet • Privacy-First Blockchain</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
