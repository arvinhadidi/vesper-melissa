import type { Metadata } from "next";
import { Cinzel, EB_Garamond, Lato } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel-var",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-garamond-var",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const lato = Lato({
  variable: "--font-lato-var",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
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
      className={`${cinzel.variable} ${ebGaramond.variable} ${lato.variable}`}
    >
      <body className="min-h-screen bg-cream">{children}</body>
    </html>
  );
}
