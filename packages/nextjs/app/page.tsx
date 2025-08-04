"use client";
declare global {
  interface Window {
    ethereum?: any;
  }
}

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import deployedContracts from "../contracts/deployedContracts";

const Home = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [greeting, setGreeting] = useState<string>("");

  useEffect(() => {
    const readGreeting = async () => {
      if (!isConnected || !window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const yourContract = new ethers.Contract(
        deployedContracts[23295].YourContract.address,
        deployedContracts[23295].YourContract.abi,
        signer,
      );

      const result = await yourContract.greeting(); // assuming `greeting()` is in your contract
      setGreeting(result);
    };

    readGreeting();
  }, [isConnected]);

  return (
    <div>
      <h1>Connected Address: {connectedAddress}</h1>
      <h2>Greeting: {greeting}</h2>
    </div>
  );
};

export default Home;
