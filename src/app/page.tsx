import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";
import JsonLd from "@/components/seo/JsonLd";
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo/site";

const HOME_TITLE = `${SITE_NAME} Cards: Tarot Readings, Card Meanings and Spreads`;
const HOME_DESCRIPTION =
  "Vesper is a tarot reading app. Get a daily card reading with Melissa, look up what every tarot card means (upright and reversed), and try love and yes or no spreads. 14-day free trial.";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_GB",
    url: "/",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title: HOME_TITLE, description: HOME_DESCRIPTION },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/melissa/melissa-default.png"),
    email: "melissa@vesper.cards",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "en-GB",
    alternateName: ["Vesper Cards", "vesper.cards"],
    publisher: { "@id": `${SITE_URL}/#organization` },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${SITE_URL}/#app`,
    name: "Vesper: Tarot Readings with Melissa",
    url: SITE_URL,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Any (web browser)",
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#organization` },
  },
];

export default function Home() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <LandingPage />
    </>
  );
}
