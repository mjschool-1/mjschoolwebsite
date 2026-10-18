/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { HeroSlider, FlashNews } from './components/HeroSlider';
import { AboutSchoolSection } from './components/AboutSchoolSection';
import { NoticeBoardAndEvents } from './components/NoticeBoardAndEvents';
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
      {/* 1. Main Header with School Crest and Search Bar */}
      <Header onSelectNav={handleNavSelect} />

      {/* 2. Primary Sticky Navigation Bar with Dropdown Menus */}
      <Navbar onSelectNav={handleNavSelect} />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 3. Hero Carousel Slider */}
        <section id="home">
          <HeroSlider onSelectNav={handleNavSelect} />
        </section>

        {/* 4. Live Circulars Marquee / Flash News */}
        <FlashNews />

        {/* 6. About School Section (Under About Us) */}
        <AboutSchoolSection />

        {/* 7. Circulars, Notices & Student Hall of Fame */}
        <NoticeBoardAndEvents />
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
