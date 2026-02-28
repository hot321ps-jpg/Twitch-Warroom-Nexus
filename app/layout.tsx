import "./globals.css";
import type { Metadata } from "next";
import TopNav from "@/components/TopNav";

export const metadata: Metadata = {
  title: "Twitch Warroom Nexus",
  description: "戰情室中樞：Twitch 戰情室 + 多頻道監控"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <TopNav />
        <main className="container mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
