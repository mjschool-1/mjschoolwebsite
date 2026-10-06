import React, { useState, useEffect } from 'react';
import { FLASH_NEWS } from '../data/schoolData';
import { Bell, Pause, Play } from 'lucide-react';

interface HeroSliderProps {
  onSelectNav?: (target: 'fee-structure' | 'about-school') => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = () => {
  return (
    <div className="relative bg-slate-900 overflow-hidden">
      {/* Background Hero Banner Frame: Aspect Ratio matched to 535x378 (mobile) & 1920x640 (desktop) */}
      <div className="relative w-full aspect-[535/378] md:aspect-[1920/640] overflow-hidden">
        <picture className="w-full h-full block">
          <source media="(min-width: 768px)" srcSet="/hero-desktop.png" />
          <img
            src="/hero-mobile.png"
            alt="MJ School Banner"
            className="w-full h-full object-cover"
          />
        </picture>
      </div>
    </div>
  );
};

export const FlashNews: React.FC = () => {
  const [newsIndex, setNewsIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setNewsIndex((prev) => (prev + 1) % FLASH_NEWS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="bg-[#133E6E] text-white border-b border-[#0B2545]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 text-xs">
        
        {/* Flash badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1.5 bg-[#C59B27] text-[#0B2545] font-black uppercase text-[10px] px-2.5 py-1 rounded shadow-sm">
            <Bell className="w-3 h-3 animate-bounce" />
            <span>Circulars &amp; Alerts</span>
          </span>
        </div>

        {/* News text carousel */}
        <div className="flex-1 overflow-hidden relative h-5">
          <p className="truncate text-slate-100 font-medium animate-fadeIn">
            {FLASH_NEWS[newsIndex]}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0 text-slate-300">
          <span className="text-[10px] hidden sm:inline text-slate-400">
            {newsIndex + 1} of {FLASH_NEWS.length}
          </span>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
            title={isPlaying ? 'Pause ticker' : 'Play ticker'}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
        </div>

      </div>
    </div>
  );
};
