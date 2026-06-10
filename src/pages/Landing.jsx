import React from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import MarketsSection from '@/components/landing/MarketsSection';
import StakingSection from '@/components/landing/StakingSection';
import ActivityFeed from '@/components/landing/ActivityFeed';
import PricingSection from '@/components/landing/PricingSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import BannerSection from '@/components/landing/BannerSection';
import FAQSection from '@/components/landing/FAQSection';
import Footer from '@/components/landing/Footer';
import BonusPopup from '@/components/landing/BonusPopup';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BonusPopup />
      <HeroSection />
      <FeaturesSection />
      <MarketsSection />
      <StakingSection />
      <ActivityFeed />
      <PricingSection />
      <TestimonialsSection />
      <BannerSection />
      <FAQSection />
      <Footer />
    </div>
  );
}