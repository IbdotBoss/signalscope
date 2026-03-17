import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SignalScope — Onchain Conviction Reports",
  description: "Understand any wallet, token, or contract in seconds. Smart Money intelligence from Nansen CLI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" style={{ fontFamily: "'General Sans', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
