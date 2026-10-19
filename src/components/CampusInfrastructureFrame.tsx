import React, { useState, useEffect } from 'react';
import { getGalleryItemsBySection } from '../lib/supabase';

interface CampusInfrastructureFrameProps {
  initialTitle?: string;
  initialImageUrl?: string | null;
  initialShowTitle?: boolean;
}

export const CampusInfrastructureFrame: React.FC<CampusInfrastructureFrameProps> = ({
  initialTitle = 'CAMPUS INFRASTRUCTURE',
  initialImageUrl = null,
  initialShowTitle = true,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [title, setTitle] = useState<string>(initialTitle);
  const [showTitle, setShowTitle] = useState<boolean>(initialShowTitle);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadInfrastructureImage() {
      try {
        const items = await getGalleryItemsBySection('infrastructure');
        if (isMounted && items && items.length > 0) {
          const item = items[0];
          setImageUrl(item.image_url || null);
          setTitle(item.title || 'CAMPUS INFRASTRUCTURE');
          setShowTitle(item.show_title !== false);
        }
      } catch (err) {
        console.warn('[CampusInfrastructureFrame] Error loading infrastructure image:', err);
      } finally {
        if (isMounted) setLoaded(true);
      }
    }

    loadInfrastructureImage();
    return () => {
      isMounted = false;
    };
  }, []);

  const hasImage = Boolean(imageUrl && imageUrl.trim().length > 0);

  return (
    <div className="w-full max-w-[1536px] mx-auto">
      <div className="relative w-full aspect-[3/2] max-h-[1024px] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-sm flex flex-col justify-end p-6 sm:p-8 md:p-10">
        {/* Render uploaded image with object-cover to fit without distortion */}
        {hasImage && (
          <img
            src={imageUrl!}
            alt={title || 'Campus Infrastructure'}
            className="w-full h-full object-cover absolute inset-0"
            loading="lazy"
          />
        )}

        {/* Optional Title Badge: Visible only when showTitle is true and title is non-empty */}
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
