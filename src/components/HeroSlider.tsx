import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FLASH_NEWS } from '../data/schoolData';
import { Bell, Pause, Play } from 'lucide-react';
import {
  getPublishedBanners,
  DEFAULT_HOMEPAGE_BANNER,
  SiteBannerRecord,
} from '../lib/supabase';

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
  // Initial fallback banner based on props or verified local defaults
  const initialBanner: SiteBannerRecord = {
    ...DEFAULT_HOMEPAGE_BANNER,
    desktop_image_path: initialDesktopBanner || DEFAULT_HOMEPAGE_BANNER.desktop_image_path,
    mobile_image_path: initialMobileBanner || DEFAULT_HOMEPAGE_BANNER.mobile_image_path,
  };

  const [banners, setBanners] = useState<SiteBannerRecord[]>([initialBanner]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isTabVisible, setIsTabVisible] = useState<boolean>(true);
  const [fallbackErrors, setFallbackErrors] = useState<Record<string, boolean>>({});

  // 1. Fetch all published banners from Supabase
  useEffect(() => {
    let isMounted = true;
    async function loadBanners() {
      try {
        const publishedBanners = await getPublishedBanners('homepage');
        if (isMounted && publishedBanners && publishedBanners.length > 0) {
          setBanners(publishedBanners);
          setCurrentIndex((prev) => (prev >= publishedBanners.length ? 0 : prev));
        }
      } catch (err) {
        console.warn('[HeroSlider] Failover: retaining default banner asset.', err);
      }
    }

    loadBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Handle document visibility (pause when browser tab is inactive)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 3. Carousel automatic rotation timer (every 3 seconds)
  useEffect(() => {
    // If only one banner, or hovered, or tab is hidden, do not rotate
    if (banners.length <= 1 || isHovered || !isTabVisible) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => {
      clearInterval(timer);
    };
  }, [banners.length, isHovered, isTabVisible]);

  // Navigate directly to a specific slide
  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Handle individual image load failures safely
  const handleImageError = (bannerId: string | undefined, index: number) => {
    const key = bannerId || `slide-${index}`;
    setFallbackErrors((prev) => ({ ...prev, [key]: true }));
  };

  const hasMultipleBanners = banners.length > 1;

  return (
    <div
      className="relative bg-slate-900 overflow-hidden select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="MJ School Featured Announcements and Campus Life"
    >
      {/* Background Hero Banner Container: Matched to 535x378 (mobile) & 1920x640 (desktop) */}
      <div className="relative w-full aspect-[535/378] md:aspect-[1920/640] overflow-hidden bg-slate-950">
        {hasMultipleBanners ? (
          /* Multi-banner sliding track */
          <div
            className="flex h-full w-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {banners.map((banner, index) => {
              const key = banner.id || `banner-${index}`;
              const hasError = fallbackErrors[key];

              const desktopUrl = hasError
                ? resolveBannerUrl(DEFAULT_HOMEPAGE_BANNER.desktop_image_path, 'hero-desktop.png')
                : resolveBannerUrl(banner.desktop_image_path, 'hero-desktop.png');

              const mobileUrl = hasError
                ? resolveBannerUrl(DEFAULT_HOMEPAGE_BANNER.mobile_image_path, 'hero-mobile.png')
                : resolveBannerUrl(banner.mobile_image_path, 'hero-mobile.png');

              return (
                <div
                  key={key}
                  className="min-w-full w-full h-full shrink-0 relative"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${banners.length}: ${banner.title || 'Campus Banner'}`}
                  aria-hidden={currentIndex !== index}
                >
                  <picture className="w-full h-full block">
                    <source media="(min-width: 768px)" srcSet={desktopUrl} />
                    <img
                      src={mobileUrl}
                      alt={banner.title || `MJ School Banner ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      onError={() => handleImageError(banner.id, index)}
                    />
                  </picture>
                </div>
              );
            })}
          </div>
        ) : (
          /* Single Banner: static display without sliding tracks or overhead */
          <div className="w-full h-full relative">
            {(() => {
              const single = banners[0] || initialBanner;
              const hasError = fallbackErrors[single.id || 'single'];

              const desktopUrl = hasError
                ? resolveBannerUrl(DEFAULT_HOMEPAGE_BANNER.desktop_image_path, 'hero-desktop.png')
                : resolveBannerUrl(single.desktop_image_path, 'hero-desktop.png');

              const mobileUrl = hasError
                ? resolveBannerUrl(DEFAULT_HOMEPAGE_BANNER.mobile_image_path, 'hero-mobile.png')
                : resolveBannerUrl(single.mobile_image_path, 'hero-mobile.png');

              return (
                <picture className="w-full h-full block">
                  <source media="(min-width: 768px)" srcSet={desktopUrl} />
                  <img
                    src={mobileUrl}
                    alt={single.title || 'MJ School Banner'}
                    className="w-full h-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    onError={() => handleImageError(single.id, 0)}
                  />
                </picture>
              );
            })()}
          </div>
        )}

        {/* Navigation Indicator: Pill-style at bottom centre (only if > 1 banner) */}
        {hasMultipleBanners && (
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            <nav
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-[#0B2545]/80 backdrop-blur-md rounded-full border border-white/20 shadow-lg"
              aria-label="Carousel Banner Indicators"
            >
              {banners.map((banner, index) => {
                const isActive = currentIndex === index;
                return (
                  <button
                    key={banner.id || `dot-${index}`}
                    type="button"
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}: ${banner.title || 'Banner'}`}
                    aria-current={isActive ? 'true' : 'false'}
                    className={`transition-all duration-300 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C59B27] ${
                      isActive
                        ? 'w-5 sm:w-6 h-2 bg-[#C59B27] shadow-sm'
                        : 'w-2 h-2 bg-white/50 hover:bg-white/90'
                    }`}
                  />
                );
              })}
            </nav>
          </div>
        )}
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
