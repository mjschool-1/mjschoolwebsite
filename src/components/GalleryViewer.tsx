import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import {
  getGalleryItemsBySection,
  getAllGalleryCardImages,
  GalleryCardImageItem,
} from '../lib/supabase';

export interface GalleryItem {
  id?: string;
  facility_key?: string;
  title: string;
  image: string;
  alt: string;
  show_title?: boolean;
  display_order?: number;
}

interface GalleryViewerProps {
  items: GalleryItem[];
}

export const GalleryViewer: React.FC<GalleryViewerProps> = ({ items: initialItems }) => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(initialItems);
  const [cardSets, setCardSets] = useState<Record<string, GalleryCardImageItem[]>>({});
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Dynamic fetch from Supabase to sync with admin updates live
  useEffect(() => {
    let isMounted = true;
    async function loadGalleryData() {
      try {
        const [records, sets] = await Promise.all([
          getGalleryItemsBySection('gallery'),
          getAllGalleryCardImages(),
        ]);

        if (isMounted) {
          if (sets) {
            setCardSets(sets);
          }

          if (records && records.length > 0) {
            const sorted = [...records].sort((a, b) => a.display_order - b.display_order);
            const mapped: GalleryItem[] = sorted.map((rec) => ({
              id: rec.id,
              facility_key: rec.facility_key,
              title: rec.title || '',
              image: rec.image_url || '',
              alt: rec.title ? `${rec.title} at MJ School` : 'MJ School Campus',
              show_title: rec.show_title !== false,
              display_order: rec.display_order,
            }));
            setGalleryItems(mapped);
          }
        }
      } catch (err) {
        console.warn('[GalleryViewer] Fallback to initial items:', err);
      }
    }

    loadGalleryData();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeCard = activeCardIndex !== null ? galleryItems[activeCardIndex] : null;

  // Resolved list of images belonging exclusively to the currently active card
  const activeCardSet = useMemo(() => {
    if (!activeCard) return [];
    const key = activeCard.facility_key || '';
    const set = cardSets[key] || [];
    if (set.length > 0) {
      return set.map((img) => ({
        url: img.image_url,
        caption: img.caption || activeCard.title,
      }));
    }
    if (activeCard.image && activeCard.image.trim().length > 0) {
      return [
        {
          url: activeCard.image,
          caption: activeCard.title,
        },
      ];
    }
    return [];
  }, [activeCard, cardSets]);

  // Touch gesture tracking for mobile swipe
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  // Body scroll lock when lightbox is open
  useEffect(() => {
    if (activeCardIndex !== null) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [activeCardIndex]);

  // Keyboard controls: Escape to close, Left/Right arrows to navigate within active set
  useEffect(() => {
    if (activeCardIndex === null || activeCardSet.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveCardIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIndex((prev) => (prev - 1 + activeCardSet.length) % activeCardSet.length);
      } else if (e.key === 'ArrowRight') {
        setActiveImageIndex((prev) => (prev + 1) % activeCardSet.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCardIndex, activeCardSet.length]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (activeCardSet.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + activeCardSet.length) % activeCardSet.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (activeCardSet.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % activeCardSet.length);
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
        handlePrev();
      } else {
        handleNext();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  const handleOpenCard = (index: number) => {
    const card = galleryItems[index];
    const key = card.facility_key || '';
    const set = cardSets[key] || [];
    const hasAnyImage = set.length > 0 || Boolean(card.image && card.image.trim().length > 0);

    if (hasAnyImage) {
      setActiveCardIndex(index);
      setActiveImageIndex(0);
    }
  };

  return (
    <>
      {/* 3-Column Desktop Grid / 1-Column Mobile Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {galleryItems.map((item, index) => {
          const key = item.facility_key || '';
          const set = cardSets[key] || [];
          const hasImage = Boolean(item.image && item.image.trim().length > 0);
          const hasSet = set.length > 0;
          const totalPhotos = hasSet ? set.length : hasImage ? 1 : 0;
          const showTitle = item.show_title !== false && item.title && item.title.trim().length > 0;
          const displayTitle = item.title?.trim() || '';

          // If no image and no set, render clean placeholder without broken icon
          if (!hasImage && !hasSet) {
            return (
              <div
                key={item.facility_key || item.id || `empty-${index}`}
                className="relative block w-full text-left overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3] sm:aspect-[4/3] md:aspect-[3/2] lg:aspect-[4/3] flex flex-col justify-end"
              >
                {/* Title area with Navy/Gold brand framing (when title is visible) */}
                {showTitle && (
                  <div className="bg-[#0B2545] pt-4 pb-4 px-5 sm:px-6">
                    <div className="w-8 h-0.5 bg-[#C59B27] mb-2" />
                    <h2 className="text-white font-serif font-bold text-base sm:text-lg tracking-wide leading-snug">
                      {displayTitle}
                    </h2>
                  </div>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.facility_key || item.id || `card-${index}`}
              type="button"
              onClick={() => handleOpenCard(index)}
              className="group relative block w-full text-left overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C59B27] aspect-[4/3] sm:aspect-[4/3] md:aspect-[3/2] lg:aspect-[4/3]"
              aria-label={`Open full resolution image viewer for ${displayTitle || 'Gallery image'}`}
            >
              {/* Card Cover Image */}
              <img
                src={item.image || (hasSet ? set[0].image_url : '')}
                alt={item.alt || displayTitle}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Set Count Badge when collection has multiple images */}
              {totalPhotos > 1 && (
                <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0B2545]/85 backdrop-blur-xs text-white text-[11px] font-bold rounded shadow-md border border-white/20">
                  <Images className="w-3.5 h-3.5 text-[#C59B27]" />
                  <span>{totalPhotos} photos</span>
                </div>
              )}

              {/* Overlaid Title: Rendered only when title visibility is enabled */}
              {showTitle && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B2545]/90 via-[#0B2545]/55 to-transparent pt-12 pb-5 px-5 sm:px-6 flex flex-col justify-end">
                  <div className="w-8 h-0.5 bg-[#C59B27] mb-2 transition-all duration-300 group-hover:w-12" />
                  <h2 className="text-white font-serif font-bold text-lg sm:text-xl tracking-wide leading-snug drop-shadow-sm">
                    {displayTitle}
                  </h2>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Full-Resolution Lightbox Viewer (Strictly for the Active Card's Set) */}
      {activeCardIndex !== null && activeCard && activeCardSet.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Image viewer: ${activeCard.title || 'MJ School Gallery'}`}
          onClick={() => setActiveCardIndex(null)}
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
              <span className="w-2 h-2 rounded-full bg-[#C59B27]" />
              {activeCard.show_title !== false && activeCard.title ? (
                <span className="text-white font-serif font-bold text-sm sm:text-base tracking-wide">
                  {activeCard.title}
                </span>
              ) : (
                <span className="text-white font-serif font-bold text-sm sm:text-base tracking-wide">
                  MJ School Gallery
                </span>
              )}
              <span className="text-xs text-slate-300 font-sans tracking-widest pl-2 border-l border-slate-700">
                {activeImageIndex + 1} / {activeCardSet.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveCardIndex(null)}
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-[#C59B27] text-white hover:text-[#0B2545] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
              aria-label="Close image viewer (Press Escape)"
              title="Close viewer"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Previous Arrow Button (Desktop & Tablet) */}
          {activeCardSet.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-[#C59B27] text-white hover:text-[#0B2545] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
              aria-label="Previous image (Left arrow key)"
              title="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Next Arrow Button (Desktop & Tablet) */}
          {activeCardSet.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-[#C59B27] text-white hover:text-[#0B2545] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
              aria-label="Next image (Right arrow key)"
              title="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Main Full-Resolution Image Display Area */}
          <div
            className="relative max-w-[94vw] max-h-[82vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeCardSet[activeImageIndex]?.url}
              alt={activeCardSet[activeImageIndex]?.caption || activeCard.title || 'MJ School Gallery'}
              className="max-w-full max-h-[78vh] w-auto h-auto object-contain shadow-2xl transition-all duration-300"
            />
          </div>

          {/* Mobile Bottom Navigation & Controls */}
          {activeCardSet.length > 1 && (
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
          )}
        </div>
      )}
    </>
  );
};
