import React, { useState, useEffect } from 'react';
import { FLASH_NEWS } from '../data/schoolData';
import { Bell, Pause, Play } from 'lucide-react';
import { getPublishedBanner, DEFAULT_HOMEPAGE_BANNER } from '../lib/supabase';

interface HeroSliderProps {
  onSelectNav?: (target: 'fee-structure' | 'about-school') => void;
  initialDesktopBanner?: string;
  initialMobileBanner?: string;
}

const resolveBannerUrl = (path: string, defaultPath: string) => {
  if (!path) return `${import.meta.env.BASE_URL}${defaultPath.replace(/^\//, '')}`;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
};

export const HeroSlider: React.FC<HeroSliderProps> = ({
  initialDesktopBanner,
  initialMobileBanner,
}) => {
  const [desktopSrc, setDesktopSrc] = useState<string>(() =>
    resolveBannerUrl(initialDesktopBanner || DEFAULT_HOMEPAGE_BANNER.desktop_image_path, 'hero-desktop.png')
  );
  const [mobileSrc, setMobileSrc] = useState<string>(() =>
    resolveBannerUrl(initialMobileBanner || DEFAULT_HOMEPAGE_BANNER.mobile_image_path, 'hero-mobile.png')
  );

  useEffect(() => {
    let isMounted = true;
    async function loadBanner() {
      try {
        const record = await getPublishedBanner('homepage');
        if (isMounted && record) {
          if (record.desktop_image_path) {
            setDesktopSrc(resolveBannerUrl(record.desktop_image_path, 'hero-desktop.png'));
          }
          if (record.mobile_image_path) {
            setMobileSrc(resolveBannerUrl(record.mobile_image_path, 'hero-mobile.png'));
          }
        }
      } catch (e) {
        // Failover remains silently on default assets
      }
    }
    loadBanner();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative bg-slate-900 overflow-hidden">
      {/* Background Hero Banner Frame: Aspect Ratio matched to 535x378 (mobile) & 1920x640 (desktop) */}
      <div className="relative w-full aspect-[535/378] md:aspect-[1920/640] overflow-hidden">
        <picture className="w-full h-full block">
          <source media="(min-width: 768px)" srcSet={desktopSrc} />
          <img
            src={mobileSrc}
            alt="MJ School Banner"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
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
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2">
        
        {/* Mobile View (< md): Compact Two-Row Layout */}
        <div className="flex flex-col md:hidden gap-1.5 py-0.5">
          {/* Row 1: ALERTS Badge + Slide Counter & Play/Pause Controls */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 bg-[#C59B27] text-[#0B2545] font-black uppercase text-[10px] px-2.5 py-0.5 rounded shadow-sm shrink-0">
              <Bell className="w-3 h-3 animate-bounce shrink-0" />
              <span>ALERTS</span>
            </span>

            <div className="flex items-center gap-2 text-slate-300 shrink-0">
              <span className="text-[10px] text-slate-300 font-medium">
                {newsIndex + 1} of {FLASH_NEWS.length}
              </span>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-1 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
                title={isPlaying ? 'Pause ticker' : 'Play ticker'}
                aria-label={isPlaying ? 'Pause ticker' : 'Play ticker'}
              >
                {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Row 2: Full Notice Text (No Truncation, Natural Wrap if Needed) */}
          <div className="w-full">
            <p
              key={newsIndex}
              className="text-[11.5px] min-[360px]:text-xs text-slate-100 font-medium leading-snug animate-fadeIn"
            >
              {FLASH_NEWS[newsIndex]}
            </p>
          </div>
        </div>

        {/* Desktop View (>= md): Single Horizontal Row */}
        <div className="hidden md:flex items-center justify-between gap-3 text-xs">
          {/* Flash badge */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1.5 bg-[#C59B27] text-[#0B2545] font-black uppercase text-[10px] px-2.5 py-1 rounded shadow-sm">
              <Bell className="w-3 h-3 animate-bounce" />
              <span>ALERTS</span>
            </span>
          </div>

          {/* News text carousel */}
          <div className="flex-1 overflow-hidden relative h-5">
            <p key={newsIndex} className="truncate text-slate-100 font-medium animate-fadeIn">
              {FLASH_NEWS[newsIndex]}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0 text-slate-300">
            <span className="text-[10px] text-slate-400">
              {newsIndex + 1} of {FLASH_NEWS.length}
            </span>
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 hover:text-white hover:bg-white/10 rounded transition-colors cursor-pointer"
              title={isPlaying ? 'Pause ticker' : 'Play ticker'}
              aria-label={isPlaying ? 'Pause ticker' : 'Play ticker'}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
