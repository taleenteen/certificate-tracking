import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { dgaSdkSource } from "@/lib/dga-native";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ระบบตรวจสอบใบอนุญาต",
  description: "ระบบบริหารจัดการและตรวจสอบใบอนุญาต",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const usesMToken = process.env.NEXT_PUBLIC_DGA_AUTH_FLOW !== "oidc";

  return (
      <html lang="th">
      {usesMToken && (
        <Script id="dga-sdk-v5" src={dgaSdkSource()} strategy="afterInteractive" />
      )}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
