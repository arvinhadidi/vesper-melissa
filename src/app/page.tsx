import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Vesper · What the cards have been trying to tell you",
  description:
    "Meet Melissa, your personal oracle. Daily tarot readings, question-led spreads, and a private journal. 3-day free trial.",
};

export default function Home() {
  return <LandingPage />;
}
