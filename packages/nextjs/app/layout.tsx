// app/layout.tsx
"use client";

import { WagmiConfig } from "wagmi";
// import "../styles/globals.css";
import { wagmiConfig } from "../services/web3/wagmiConfig";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WagmiConfig config={wagmiConfig}>
          {children}
        </WagmiConfig>
      </body>
    </html>
  );
}