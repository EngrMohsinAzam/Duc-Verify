import "./landing-animations.css";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { LogoCloud } from "@/components/landing/logo-cloud";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingStats } from "@/components/landing/landing-stats";
import { LandingCTA } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero zone — gradient matches image-hero.png background */}
      <div className="bg-gradient-to-b from-[#e4ebf7] via-[#ecf1f9] to-white">
        <LandingNavbar />
        <LandingHero />
        <LogoCloud />
      </div>

      <main className="bg-white">
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingStats />
        <LandingCTA />
      </main>

      <LandingFooter />
    </div>
  );
}
