import { useState } from "react";
import CinematicIntro from "@/components/CinematicIntro";
import HeroSection from "@/components/HeroSection";
import ExperienceHub from "@/components/ExperienceHub";
import Footer from "@/components/Footer";
import RealitoChat from "@/components/RealitoChat";

const Index = () => {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {!introComplete ? (
        <CinematicIntro onComplete={() => setIntroComplete(true)} />
      ) : (
        <>
          <HeroSection />
          <ExperienceHub />
          <Footer />
          <RealitoChat />
        </>
      )}
    </div>
  );
};

export default Index;
