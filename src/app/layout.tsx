import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { Basket } from "@/components/Basket";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title:       { default: "Raffle Rumble", template: "%s | Raffle Rumble" },
  description: "UK's most exciting technology raffle. Win premium tech for just £1. Daily draws at 11:11 PM.",
  keywords:    ["raffle", "technology", "prize", "win", "MacBook", "iPhone", "PlayStation"],
  openGraph: {
    type:        "website",
    siteName:    "Raffle Rumble",
    title:       "Raffle Rumble — Win Premium Tech from £1",
    description: "UK's most exciting technology raffle. Win premium tech for just £1. Daily draws at 11:11 PM.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor:  "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#050505] text-white antialiased">
        <Providers>
          <AnnouncementBanner />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Basket />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#111",
                color:      "#fff",
                border:     "1px solid #222",
                borderRadius: "12px",
              },
              success: { iconTheme: { primary: "#f59e0b", secondary: "#000" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
