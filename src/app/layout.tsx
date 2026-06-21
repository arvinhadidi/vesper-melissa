import type { Metadata } from "next";
import {
  DM_Sans,
  DM_Serif_Display,
  EB_Garamond,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import PostHogProvider from "@/components/analytics/PostHogProvider";
import "./globals.css";

const ebGaramond = EB_Garamond({
  variable: "--font-garamond-var",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif-var",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans-var",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vesper",
  description: "Your personal tarot guide",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ebGaramond.variable} ${dmSerifDisplay.variable} ${dmSans.variable}`}
    >
      <head>
      </head>
      <body className="min-h-screen">
        <PostHogProvider>{children}</PostHogProvider>
        <Analytics />
      </body>
    </html>
  );
}
