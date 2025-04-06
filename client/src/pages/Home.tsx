import React, { useEffect, useRef } from "react";
import Header from "@/components/Header";
import BlogSection from "@/components/BlogSection";
import CanvaAccessSection from "@/components/CanvaAccessSection";
import InternshipSection from "@/components/InternshipSection";
import ApplicationForm from "@/components/ApplicationForm";
import Footer from "@/components/Footer";
import BannerAd from "@/components/BannerAd";
import { ThreeScene } from "@/lib/ThreeScene";

const Home: React.FC = () => {
  const canvaSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scene = new ThreeScene();
    return () => {
      scene.dispose();
    };
  }, []);

  const scrollToCanvaSection = () => {
    if (canvaSectionRef.current) {
      canvaSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="text-text-light font-inter overflow-x-hidden grid-overlay">
      <div className="relative">
        <Header onCanvaClick={scrollToCanvaSection} />
        <BannerAd position="top" />
        <BlogSection />
        <BannerAd position="middle" />
        <div ref={canvaSectionRef}>
          <CanvaAccessSection />
        </div>
        <InternshipSection />
        <BannerAd position="bottom" />
        <ApplicationForm />
        <Footer />
      </div>
    </div>
  );
};

export default Home;
