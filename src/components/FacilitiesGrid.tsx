import React, { useState, useEffect, useMemo } from 'react';
import { FACILITIES_CARDS, FacilityCardItem } from '../data/schoolData';
import { getFacilityCardConfigs, FacilityCardConfig } from '../lib/supabase';

interface FacilitiesGridProps {
  initialConfigs?: Record<string, FacilityCardConfig>;
}

export const FacilitiesGrid: React.FC<FacilitiesGridProps> = ({ initialConfigs = {} }) => {
  const [configs, setConfigs] = useState<Record<string, FacilityCardConfig>>(initialConfigs);

  useEffect(() => {
    let isMounted = true;
    async function loadConfigs() {
      try {
        const data = await getFacilityCardConfigs();
        if (isMounted && data && Object.keys(data).length > 0) {
          setConfigs(data);
        }
      } catch (err) {
        console.warn('[FacilitiesGrid] Error loading facility card configs:', err);
      }
    }
    loadConfigs();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sort the four cards by their configured display_order (falling back to initial index)
  const orderedCards = useMemo(() => {
    return [...FACILITIES_CARDS].sort((a, b) => {
      const defaultIndexA = FACILITIES_CARDS.findIndex((c) => c.key === a.key);
      const defaultIndexB = FACILITIES_CARDS.findIndex((c) => c.key === b.key);
      const orderA = configs[a.key]?.display_order ?? defaultIndexA;
      const orderB = configs[b.key]?.display_order ?? defaultIndexB;
      return orderA - orderB;
    });
  }, [configs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      {orderedCards.map((facility) => {
        const config = configs[facility.key];
        const imageUrl = config?.image_url;
        const showTitle = config?.show_title !== false;
        const cardTitle = config?.title?.trim() || facility.title;

        return (
          <div
            key={facility.key}
            className="bg-white border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            {/* Flat Rectangular Image Placeholder / Display at Top (16:9 aspect ratio) */}
            <div className="w-full aspect-[16/9] bg-slate-100 border-b border-slate-200 overflow-hidden relative">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={cardTitle}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-slate-100" />
              )}
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
              <div>
                {/* Title rendered when showTitle is enabled and non-empty */}
                {showTitle && cardTitle ? (
                  <>
                    <div className="w-8 h-0.5 bg-[#C59B27] mb-3.5" />
                    <h2 className="text-lg sm:text-xl font-bold text-[#0B2545] font-serif mb-3 leading-snug">
                      {cardTitle}
                    </h2>
                  </>
                ) : (
                  // Spacing preservation when title is hidden to avoid card collapse
                  <div className="pt-2" />
                )}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6">
                  {facility.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                {facility.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold text-[#0B2545] bg-slate-100 border border-slate-200/80 px-2.5 py-1 tracking-wider uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
