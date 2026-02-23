import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Product Review System",
  description: "Admin-managed product reviews with category-based feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <SiteNav />
        <div className="min-h-[calc(100vh-48px)]">{children}</div>
        <footer className="border-t border-[rgba(0,0,0,0.07)] bg-white">
          <div className="page-wrap">
            <div className="mx-auto flex max-w-6xl flex-col items-start gap-1 py-3 text-[12px] text-[#6B7280] sm:h-12 sm:flex-row sm:items-center sm:justify-between sm:py-0">
              <p>Designed and developed by Mumba Mukendi</p>
              <a href="mailto:freddie.mukendi@gmail.com" className="break-all text-[#9A3412] hover:underline sm:break-normal">
                freddie.mukendi@gmail.com
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
