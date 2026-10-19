import React, { useState, useEffect, useCallback } from 'react';
import { Building2 } from 'lucide-react';
import { getGalleryItemsBySection } from '../lib/supabase';

export interface CampusInfrastructureFrameProps {
  initialTitle?: string;
  initialImageUrl?: string | null;
  initialShowTitle?: boolean;
  variant?: 'page' | 'philosophy';
  className?: string;
}

export const CampusInfrastructureFrame: React.FC<CampusInfrastructureFrameProps> = ({
  initialTitle = 'CAMPUS INFRASTRUCTURE',
  initialImageUrl = null,
  initialShowTitle = true,
  variant = 'page',
  className = '',
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [title, setTitle] = useState<string>(initialTitle);
  const [showTitle, setShowTitle] = useState<boolean>(initialShowTitle);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  const loadInfrastructureImage = useCallback(async () => {
    try {
      const items = await getGalleryItemsBySection('infrastructure');
      if (items && items.length > 0) {
        const item = items[0];
        setImageUrl(item.image_url || null);
        setTitle(item.title || 'CAMPUS INFRASTRUCTURE');
        setShowTitle(item.show_title !== false);
        setImageError(false);
      } else {
        setImageUrl(null);
        setTitle('CAMPUS INFRASTRUCTURE');
        setShowTitle(true);
      }
    } catch (err) {
      console.warn('[CampusInfrastructureFrame] Error loading infrastructure image:', err);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadInfrastructureImage();

    // In-page direct synchronization event dispatched by admin portal
    const handleSyncUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{
        imageUrl?: string | null;
        title?: string;
        showTitle?: boolean;
      }>;
      if (customEvent.detail) {
        if (customEvent.detail.imageUrl !== undefined) {
          setImageUrl(customEvent.detail.imageUrl);
          setImageError(false);
        }
        if (customEvent.detail.title !== undefined) {
          setTitle(customEvent.detail.title || 'CAMPUS INFRASTRUCTURE');
        }
        if (customEvent.detail.showTitle !== undefined) {
          setShowTitle(customEvent.detail.showTitle);
        }
      } else {
        loadInfrastructureImage();
      }
    };

    // Cross-tab synchronization via localStorage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mj_infra_updated_at') {
        loadInfrastructureImage();
      }
    };

    // Automatic revalidation on tab focus/return
    const handleWindowFocus = () => {
      loadInfrastructureImage();
    };

    window.addEventListener('mj_infrastructure_updated', handleSyncUpdate);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('mj_infrastructure_updated', handleSyncUpdate);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [loadInfrastructureImage]);

  const hasImage = Boolean(imageUrl && imageUrl.trim().length > 0 && !imageError);

  // Philosophy section visual (used on homepage)
  if (variant === 'philosophy') {
    return (
      <div className={`relative w-full h-full min-h-[280px] sm:min-h-[320px] lg:min-h-[350px] ${className}`}>
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm border-2 border-slate-200 bg-slate-100 flex flex-col justify-end p-5 group transition-all duration-300">
          {/* Render uploaded image with object-cover */}
          {hasImage ? (
            <>
              <img
                src={imageUrl!}
                alt={title || 'Campus Infrastructure'}
                className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
            </>
          ) : (
            /* Graceful empty state without broken icons */
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-6 text-center select-none">
              <Building2 className="w-12 h-12 text-slate-300 stroke-[1.5] mb-2" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                MJ School Campus
              </span>
            </div>
          )}

          {/* Title Badge: Visible when showTitle is true and title is non-empty */}
          {showTitle && title && title.trim().length > 0 && (
            <div className="relative z-10">
              <span className="inline-block bg-[#0B2545] text-[#F6D55C] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded shadow-sm">
                {title}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Dedicated Campus Infrastructure Image Frame (used on /about/infrastructure/)
  return (
    <div className={`w-full max-w-[1536px] mx-auto ${className}`}>
      <div className="relative w-full aspect-[3/2] max-h-[1024px] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-sm flex flex-col justify-end p-6 sm:p-8 md:p-10 group">
        {/* Render uploaded image with object-cover */}
        {hasImage ? (
          <>
            <img
              src={imageUrl!}
              alt={title || 'Campus Infrastructure'}
              className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-[1.01]"
              loading="lazy"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
          </>
        ) : (
          /* Graceful empty state without broken icons */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-8 text-center select-none">
            <Building2 className="w-16 h-16 text-slate-300 stroke-[1.5] mb-3" />
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              MJ School Campus Infrastructure
            </span>
          </div>
        )}

        {/* Title Badge: Visible only when showTitle is true and title is non-empty */}
        {showTitle && title && title.trim().length > 0 && (
          <div className="relative z-10">
            <span className="inline-block bg-[#0B2545] text-[#F6D55C] font-black text-xs sm:text-sm uppercase px-3.5 py-1.5 rounded-lg shadow-sm tracking-wider">
              {title}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
