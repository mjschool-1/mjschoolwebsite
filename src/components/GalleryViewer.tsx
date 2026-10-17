import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface GalleryItem {
  title: string;
  image: string;
  alt: string;
}

interface GalleryViewerProps {
  items: GalleryItem[];
}

export const GalleryViewer: React.FC<GalleryViewerProps> = ({ items }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Touch gesture tracking for mobile swipe
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Body scroll lock when lightbox is open
  useEffect(() => {
    if (activeIndex !== null) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [activeIndex]);

  // Keyboard controls: Escape to close, Left/Right arrows to navigate
  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev !== null ? (prev - 1 + items.length) % items.length : null));
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev !== null ? (prev + 1) % items.length : null));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, items.length]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev !== null ? (prev - 1 + items.length) % items.length : null));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveIndex((prev) => (prev !== null ? (prev + 1) % items.length : null));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = touchEndY - touchStartYRef.current;

    // Minimum swipe threshold and ensure gesture is primarily horizontal
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        // Swiped right -> go to previous
        handlePrev();
      } else {
        // Swiped left -> go to next
        handleNext();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const currentItem = activeIndex !== null ? items[activeIndex] : null;

  return (
    <>
      {/* 3-Column Desktop Grid / 1-Column Mobile Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative block w-full text-left overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C59B27] aspect-[4/3] sm:aspect-[4/3] md:aspect-[3/2] lg:aspect-[4/3]"
            aria-label={`Open full resolution image: ${item.title}`}
          >
            {/* Card Image */}
            <img
              src={item.image}
              alt={item.alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {/* Overlaid Title with Subtle Navy/Gold Brand Contrast */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B2545]/90 via-[#0B2545]/55 to-transparent pt-12 pb-5 px-5 sm:px-6 flex flex-col justify-end">
              <div className="w-8 h-0.5 bg-[#C59B27] mb-2 transition-all duration-300 group-hover:w-12"></div>
              <h2 className="text-white font-serif font-bold text-lg sm:text-xl tracking-wide leading-snug drop-shadow-sm">
                {item.title}
              </h2>
            </div>
          </button>
        ))}
      </div>

      {/* Full-Resolution Lightbox Viewer */}
      {activeIndex !== null && currentItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Image viewer: ${currentItem.title}`}
          onClick={() => setActiveIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 sm:p-6 select-none animate-fadeIn"
        >
          {/* Top Bar with Title, Counter and Close Button */}
          <div
            className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-b from-black/80 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#C59B27]"></span>
              <span className="text-white font-serif font-bold text-sm sm:text-base tracking-wide">
                {currentItem.title}
              </span>
              <span className="text-xs text-slate-300 font-sans tracking-widest pl-2 border-l border-slate-700">
                {activeIndex + 1} / {items.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveIndex(null)}
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-[#C59B27] text-white hover:text-[#0B2545] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
              aria-label="Close image viewer (Press Escape)"
              title="Close viewer"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Previous Arrow Button (Desktop & Tablet) */}
          <button
            type="button"
            onClick={handlePrev}
            className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-[#C59B27] text-white hover:text-[#0B2545] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
            aria-label="Previous image (Left arrow key)"
            title="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Arrow Button (Desktop & Tablet) */}
          <button
            type="button"
            onClick={handleNext}
            className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-[#C59B27] text-white hover:text-[#0B2545] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
            aria-label="Next image (Right arrow key)"
            title="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Main Full-Resolution Image Display Area */}
          <div
            className="relative max-w-[94vw] max-h-[82vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentItem.image}
              alt={currentItem.alt}
              className="max-w-full max-h-[80vh] w-auto h-auto object-contain shadow-2xl transition-all duration-300"
            />
          </div>

          {/* Mobile Bottom Navigation & Controls */}
          <div
            className="sm:hidden absolute bottom-4 inset-x-0 z-50 flex items-center justify-center gap-6 py-2 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handlePrev}
              className="p-2.5 rounded-full bg-white/15 text-white active:bg-[#C59B27] active:text-[#0B2545] focus:outline-none"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-xs font-semibold text-slate-300 tracking-wider">
              Swipe or tap arrows
            </span>

            <button
              type="button"
              onClick={handleNext}
              className="p-2.5 rounded-full bg-white/15 text-white active:bg-[#C59B27] active:text-[#0B2545] focus:outline-none"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
