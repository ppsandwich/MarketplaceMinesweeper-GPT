import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarketSweeper",
  description: "Second-hand marketplaces can be a real minefield. 💣"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
