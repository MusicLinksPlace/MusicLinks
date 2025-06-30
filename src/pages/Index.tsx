import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import ServiceCategories from '@/components/ServiceCategories';
import HowItWorks from '@/components/HowItWorks';
import TopUsersSection from '@/components/TopUsersSection';

const Index = () => {
  return (
    <div className="min-h-screen font-sans">
      <Header />
      <main>
        <HeroSection />
        <TopUsersSection role="artist" title="Top artistes du moment" />
        <ServiceCategories />
        <TopUsersSection role="provider" title="Top prestataires du moment" />
        <HowItWorks />
        <TopUsersSection role="partner" title="Top partenaires du moment" />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
