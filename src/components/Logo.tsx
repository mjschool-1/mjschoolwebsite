import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
}) => {
  const sizeMap = {
    sm: { img: 'w-10 h-10', text: 'text-base', sub: 'text-[10px]' },
    md: { img: 'w-14 h-14', text: 'text-xl', sub: 'text-xs' },
    lg: { img: 'w-16 h-16', text: 'text-2xl', sub: 'text-sm' },
    xl: { img: 'w-20 h-20', text: 'text-3xl', sub: 'text-base' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Official MJ School Emblem Logo Image */}
      <div className="relative shrink-0 flex items-center justify-center">
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="MJ School Logo"
          className={`${currentSize.img} object-contain drop-shadow-md hover:scale-105 transition-transform duration-300`}
        />
      </div>

      {/* Typography */}
      {variant === 'full' && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span
              className={`font-serif tracking-wider font-extrabold uppercase text-[#0B2545] leading-tight ${currentSize.text}`}
              style={{ fontFamily: "'Cinzel', 'Merriweather', 'Georgia', serif" }}
            >
              MJ School
            </span>
          </div>
          <span className="text-[#C59B27] font-semibold text-xs tracking-wider uppercase font-sans">
            Affiliated to CBSE
          </span>
          <span className="text-gray-500 text-[11px] font-medium leading-none mt-0.5 hidden md:block">
            Nurturing Lifelong Learners &amp; Shaping Future Leaders
          </span>
        </div>
      )}
    </div>
  );
};

