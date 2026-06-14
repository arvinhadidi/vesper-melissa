import styles from "./landing.module.css";
import LandingNav from "./LandingNav";
import LandingHero from "./LandingHero";
import TrustStrip from "./TrustStrip";
import FeaturesSection from "./FeaturesSection";
import Testimonials from "./Testimonials";
import FinalCta from "./FinalCta";
import LandingFooter from "./LandingFooter";

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <LandingNav />
      <LandingHero />
      <TrustStrip />
      <FeaturesSection />
      <Testimonials />
      <FinalCta />
      <LandingFooter />
    </div>
  );
}
