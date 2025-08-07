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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-start ">
      {/* Navbar */}
      <nav className="w-full bg-white/10 backdrop-blur-md border-b border-white/20 text-white py-4 px-6 flex items-center justify-between shadow-md">

        {/* Left: Logo */}
        <div className="z-10">
          <a href="#home" className="text-xl font-bold">Bytechu</a>
        </div>

        {/* Center: Nav Links */}
        <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex space-x-8">
          <a href="#projects" className="hover:text-purple-300 transition">How it works</a>
          <a href="#about" className="hover:text-purple-300 transition">Demo</a>
          <a href="#contact" className="hover:text-purple-300 transition">FAQ</a>
        </div>

        {/* Right: Wallet Button */}
        <div className="z-10 hidden md:flex">
          {!address ? (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow hover:shadow-md"
            >
              {isConnecting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-lg">👛</span>
              )}
              <span className="text-sm">{isConnecting ? "Connecting..." : "Connect"}</span>
            </button>
          ) : (
            <div className="flex items-center bg-green-500/10 border border-green-400/30 text-green-300 rounded-lg px-3 py-1 text-sm space-x-2">
              <span className="text-lg">✅</span>
              <span className="font-medium">Wallet Connected</span>
            </div>
          )}
        </div>
      </nav>

      {/* Header Section - full width, no container */}
        <header className="w-full text-center bg-blue-100 text-black py-55 px-4 flex flex-col items-center justify-center">
          <h1 className="text-5xl font-bold mb-4">START PAGE</h1>
          <p className="text-xl mb-6">Template by w3.css</p>
          <button className="bg-black hover:bg-gray-800 text-white py-3 px-6 text-lg rounded transition">
            Get Started
          </button>
        </header>
    
      {/* How It Works Section */}
          <section id="how-it-works" className="w-full bg-white py-40 px-4 flex flex-col items-center justify-center">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">How Bytechu Works</h2>
                <p className="text-xl text-gray-600">Simple steps to create and own your digital pet</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Claim Your Egg</h3>
                  <p className="text-gray-600">Connect your wallet and claim your first free egg. Each egg contains a mystery pet with different rarities.</p>
                </div>
                
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Hatch & Customize</h3>
                  <p className="text-gray-600">Watch your egg hatch to reveal your unique pet. Feed, play, and unlock accessories to personalize your companion.</p>
                </div>
                
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Mint & Trade</h3>
                  <p className="text-gray-600">Mint your customized pet as an NFT and trade it on popular marketplaces like OpenSea and Zora.</p>
                </div>
              </div>
            </div>
          </section>
          
          <section id="demo" className="w-full bg-blue-100 text-black py-20 px-4 flex flex-col items-center justify-center">
            {/* Section Title */}
            <h2 className="text-5xl font-bold mb-8 text-center">Live Demo</h2>
            <p className="text-xl mb-8 text-center">Watch how Bytechu works in action</p>

            {/* Video Container */}
            <div className="w-full max-w-4xl aspect-video bg-gray-200 flex items-center justify-center rounded-lg shadow-lg overflow-hidden">
              {/* Replace this video with your own or embed a gallery video */}
              <video controls className="w-full h-full object-cover">
                <source src="/path-to-your-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
        </section>
        
        {/* Rarity System */}
        <section className="w-full bg-white text-black py-40 px-4 flex flex-col items-center justify-center">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pet Rarity System</h2>
            <p className="text-xl text-gray-600">
              Each egg has a chance to contain pets of different rarities
            </p>
          </div>

          {/* Rarity Rings */}  
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 w-full">
            {[
              {
                name: 'Common',
                chance: '70%',
                color: 'from-gray-200 via-grey-400 to-gray-300',
                textColor: 'text-gray-700',
                effects: 'ring-2 ring-offset-2 ring-gray-500',
              },
              {
                name: 'Uncommon',
                chance: '15%',
                color: 'from-yellow-200 to-yellow-300',
                textColor: 'text-yellow-700',
                effects: 'ring-2 ring-offset-2 ring-yellow-500',
              },
              {
                name: 'Rare',
                chance: '10%',
                color: 'from-blue-200 to-blue-300',
                textColor: 'text-blue-700',
                effects: 'ring-2 ring-offset-2 ring-blue-500',
              },
              {
                name: 'Epic',
                chance: '4.5%',
                color: 'from-purple-300 to-purple-500',
                textColor: 'text-purple-700',
                effects: 'ring-2 ring-offset-2 ring-purple-700',
              },
              {
                name: 'Legendary',
                chance: '0.5%',
                color:
                  'from-red-500 via-orange-400 via-yellow-300 via-green-400 via-blue-400 via-indigo-500 to-purple-500',
                textColor:
                  'bg-gradient-to-r from-red-500 via-orange-400 via-yellow-500 via-green-400 via-blue-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent font-extrabold',
                effects: 'ring-4 ring-offset-2 ring-purple-500',
              },
                ].map((rarity, i) => (
                  <div
                    key={rarity.name}
                    className="flex flex-col items-center justify-center text-center w-full"
                  >
                <div
                  className={`w-28 h-28 bg-gradient-to-br ${rarity.color} rounded-full mb-4 flex items-center justify-center ${rarity.effects}`}
                  style={{
                    animation: 'spin 8s linear infinite',
                    animationDelay: `${i * 0.3}s`, // slight offset if desired
                  }}
                >
                  <div className="w-16 h-16 bg-white/50 rounded-full"></div>
                </div>
                <h3 className={`${rarity.textColor} text-xl font-bold mb-1`}>{rarity.name}</h3>
                <p className="text-base text-gray-600">{rarity.chance} chance</p>
              </div>
            ))}
          </div>
        </div>
      </section>

          {/* FAQ Section */}
          <section id="faq" className="w-full bg-blue-100 text-black py-40 px-4 flex flex-col items-center justify-center">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <p className="text-xl text-gray-600">Everything you need to know about Bytechu</p>
              </div>
              
              <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">What is Bytechu?</h3>
                  <p className="text-gray-600">Bytechu is a digital pet platform where you can claim, hatch, and trade unique NFT pets.</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">How do I claim my first egg?</h3>
                  <p className="text-gray-600">Connect your wallet and click the "Claim Egg" button to receive your first free egg.</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-2">Can I trade my pets?</h3>
                  <p className="text-gray-600">Yes! Once you mint your pet as an NFT, you can trade it on popular marketplaces like OpenSea and Zora.</p>
                </div>
              </div>
            </div>
          </section>

        {/* Footer */}
          <footer className="w-full bg-white/10 backdrop-blur-md border-t border-white/20 text-white py-8 px-6 flex items-center justify-between shadow-md mt-auto">
            <span>&copy; 2023 Bytechu. All rights reserved.</span>
            <span>Made with ❤️ by So Fat Now Team</span>
          </footer>
    </div>
  );
}

export default App;
