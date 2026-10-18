import React, { useState, useEffect, useCallback } from 'react';
import {
  getPublishedBanners,
  resolveBannerUrl,
  SiteBannerRecord,
} from '../lib/supabase';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBannerProps {
  pageKey: string;
  pageTitle: string;
  pageSubtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export const PageBanner: React.FC<PageBannerProps> = ({
  pageKey,
  pageTitle,
  pageSubtitle,
  breadcrumbs,
}) => {
  const [banners, setBanners] = useState<SiteBannerRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isTabVisible, setIsTabVisible] = useState<boolean>(true);

  // 1. Fetch published banners for this specific page key
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const records = await getPublishedBanners(pageKey);
        if (isMounted && records && records.length > 0) {
          setBanners(records);
          setCurrentIndex(0);
        }
      } catch (err) {
        console.warn(`[PageBanner] Failover to fallback heading for ${pageKey}:`, err);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [pageKey]);

  // 2. Tab visibility listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 3. Carousel automatic rotation if multiple banners configured
  useEffect(() => {
    if (banners.length <= 1 || isHovered || !isTabVisible) {
      return;
    }
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [banners.length, isHovered, isTabVisible]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Fallback: If no published banner is configured for this page, render the clean institutional heading
  if (banners.length === 0) {
    return (
      <div className="bg-gradient-to-r from-[#0B2545] via-[#133E6E] to-[#0B2545] text-white py-10 sm:py-12 border-b-4 border-[#C59B27] shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-3">
              <ol className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <li>
                  <a href="/" className="hover:text-[#F6D55C] transition-colors flex items-center gap-1">
                    <span>Home</span>
                  </a>
                </li>
                {breadcrumbs.map((crumb, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold">→</span>
                    {crumb.href ? (
                      <a href={crumb.href} className="hover:text-[#F6D55C] transition-colors">
                        {crumb.label}
                      </a>
                    ) : (
                      <span className="text-[#F6D55C] font-semibold">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight text-white drop-shadow-sm">
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="mt-2 text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
              {pageSubtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  const currentBanner = banners[currentIndex] || banners[0];
  const desktopSrc = resolveBannerUrl(currentBanner.desktop_image_path);
  const mobileSrc = resolveBannerUrl(currentBanner.mobile_image_path || currentBanner.desktop_image_path);

  return (
    <div
      className="relative w-full border-b-4 border-[#C59B27] bg-[#07172C] select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ================================================================== */}
      {/* 1. Desktop Image Frame: Exact aspect ratio 1920 × 640 (3:1)        */}
      {/* ================================================================== */}
      <div className="hidden md:block w-full aspect-[1920/640] relative overflow-hidden">
        <img
          key={`desktop-${currentBanner.id || currentIndex}`}
          src={desktopSrc}
          alt={currentBanner.title || pageTitle}
          className="w-full h-full object-cover block animate-fadeIn"
          loading="eager"
        />

        {/* Contrast Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07172C]/90 via-[#0B2545]/70 to-[#07172C]/30 flex flex-col justify-center px-6 lg:px-12">
          <div className="max-w-7xl mx-auto w-full">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav aria-label="Breadcrumb" className="mb-3">
                <ol className="flex flex-wrap items-center gap-2 text-xs text-slate-200 drop-shadow-sm">
                  <li>
                    <a href="/" className="hover:text-[#F6D55C] transition-colors flex items-center gap-1 font-medium">
                      <span>Home</span>
                    </a>
                  </li>
                  {breadcrumbs.map((crumb, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-[#C59B27] font-bold">→</span>
                      {crumb.href ? (
                        <a href={crumb.href} className="hover:text-[#F6D55C] transition-colors font-medium">
                          {crumb.label}
                        </a>
                      ) : (
                        <span className="text-[#F6D55C] font-semibold">{crumb.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold font-serif tracking-tight text-white drop-shadow-md">
              {pageTitle}
            </h1>

            {pageSubtitle && (
              <p className="mt-2 text-xs sm:text-sm lg:text-base text-slate-100 max-w-3xl leading-relaxed drop-shadow-sm font-normal">
                {pageSubtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 2. Mobile Image Frame: Exact aspect ratio 535 × 378                */}
      {/* ================================================================== */}
      <div className="block md:hidden w-full aspect-[535/378] relative overflow-hidden">
        <img
          key={`mobile-${currentBanner.id || currentIndex}`}
          src={mobileSrc}
          alt={currentBanner.title || pageTitle}
          className="w-full h-full object-cover block animate-fadeIn"
          loading="eager"
        />

        {/* Contrast Gradient Overlay for Mobile */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07172C]/95 via-[#0B2545]/75 to-[#07172C]/30 flex flex-col justify-end p-4 sm:p-5">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-1.5">
              <ol className="flex flex-wrap items-center gap-1.5 text-[10.5px] text-slate-200 drop-shadow-sm">
                <li>
                  <a href="/" className="hover:text-[#F6D55C] transition-colors">Home</a>
                </li>
                {breadcrumbs.map((crumb, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="text-[#C59B27] font-bold">→</span>
                    <span className="text-[#F6D55C] font-semibold truncate max-w-[150px]">{crumb.label}</span>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <h1 className="text-xl sm:text-2xl font-extrabold font-serif tracking-tight text-white drop-shadow-md leading-tight">
            {pageTitle}
          </h1>

          {pageSubtitle && (
            <p className="mt-1 text-[11px] sm:text-xs text-slate-200 line-clamp-2 leading-snug drop-shadow-sm">
              {pageSubtitle}
            </p>
          )}
        </div>
      </div>

      {/* ================================================================== */}
      {/* 3. Multi-banner Indicator Dots (only shown when banners > 1)       */}
      {/* ================================================================== */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 right-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full">
          {banners.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                currentIndex === index
                  ? 'w-5 h-1.5 bg-[#C59B27]'
                  : 'w-1.5 h-1.5 bg-white/60 hover:bg-white'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
