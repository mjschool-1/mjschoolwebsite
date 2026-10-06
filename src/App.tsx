/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TopBar } from './components/TopBar';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { HeroSlider, FlashNews } from './components/HeroSlider';
import { FeeStructureSection } from './components/FeeStructureSection';
import { AboutSchoolSection } from './components/AboutSchoolSection';
import { NoticeBoardAndEvents } from './components/NoticeBoardAndEvents';
import { AdmissionsSection } from './components/AdmissionsSection';
import { Footer } from './components/Footer';
import { ArrowUp } from 'lucide-react';

export default function App() {
  const handleNavSelect = (target: 'fee-structure' | 'about-school') => {
    const targetElement = document.getElementById(target);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col selection:bg-[#C59B27] selection:text-white">
      {/* 1. Top Utility Info Bar (Only Mobile & Email, Pay Fees Online) */}
      <TopBar onOpenFee={() => handleNavSelect('fee-structure')} />

      {/* 2. Main Header with School Crest and Search Bar */}
      <Header onSelectNav={handleNavSelect} />

      {/* 3. Primary Sticky Navigation Bar with Dropdown Menus */}
      <Navbar onSelectNav={handleNavSelect} />

      {/* 4. Live Circulars Marquee / Flash News */}
      <FlashNews />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 5. Hero Carousel Slider */}
        <section id="home">
          <HeroSlider onSelectNav={handleNavSelect} />
        </section>

        {/* 6. About School Section (Under About Us) */}
        <AboutSchoolSection />

        {/* 7. Fee Structure Section (Inside Admissions with Interactive Calculator & Online Portal) */}
        <FeeStructureSection />

        {/* 8. Circulars, Notices & Student Hall of Fame */}
        <NoticeBoardAndEvents />

        {/* 9. Admissions 2025-26 & Online Registration Form */}
        <AdmissionsSection />
      </main>

      {/* 10. Comprehensive Footer */}
      <Footer onSelectNav={handleNavSelect} />

      {/* Floating Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 p-3 bg-[#0B2545] hover:bg-[#C59B27] text-white rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 border-2 border-white/40 cursor-pointer"
        title="Scroll to top"
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
