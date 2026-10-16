import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'header';
  variant?: 'full' | 'icon-only';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
}) => {
  const isHeader = size === 'header';

  const sizeMap = {
    sm: { img: 'w-10 h-10', text: 'text-base', sub: 'text-[10px]' },
    md: { img: 'w-14 h-14', text: 'text-xl', sub: 'text-xs' },
    lg: { img: 'w-16 h-16', text: 'text-2xl', sub: 'text-sm' },
    xl: { img: 'w-20 h-20', text: 'text-3xl', sub: 'text-base' },
  };

  const currentSize = isHeader
    ? {
        img: 'w-12 h-12 min-[375px]:w-14 min-[375px]:h-14 sm:w-16 sm:h-16 lg:w-[68px] lg:h-[68px]',
        text: 'text-lg min-[375px]:text-xl sm:text-2xl lg:text-[26px] xl:text-[28px]',
        sub: 'text-[10px] min-[375px]:text-[11px] sm:text-xs lg:text-[12px]',
      }
    : sizeMap[size as keyof typeof sizeMap] || sizeMap.md;

  const gapClass = isHeader
    ? 'gap-2.5 min-[375px]:gap-3.5 sm:gap-4 lg:gap-4.5'
    : 'gap-3.5';

  return (
    <div className={`flex items-center ${gapClass} select-none ${className}`}>
      {/* Official MJ School Emblem Logo Image */}
      <div className="relative shrink-0 flex items-center justify-center">
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="MJ School Logo"
          className={`${currentSize.img} object-contain transition-transform duration-300 group-hover:scale-102`}
        />
      </div>

      {/* Typography */}
      {variant === 'full' && (
        <div className="flex flex-col text-left justify-center">
          <span
            className={`font-serif tracking-wider font-extrabold uppercase text-[#0B2545] leading-tight ${currentSize.text}`}
            style={{ fontFamily: "'Cinzel', 'Merriweather', 'Georgia', serif" }}
          >
            MJ School
          </span>
          <span
            className={`text-[#C59B27] font-bold tracking-widest uppercase font-sans ${currentSize.sub} ${
              isHeader ? 'mt-0.5' : ''
            }`}
          >
            Affiliated to CBSE
          </span>
          {isHeader ? (
            <span className="text-slate-500 text-[11px] lg:text-[12px] font-medium leading-none mt-1 hidden sm:block tracking-normal">
              Nurturing Lifelong Learners &amp; Shaping Future Leaders
            </span>
          ) : (
            <span className="text-gray-500 text-[11px] font-medium leading-none mt-0.5 hidden md:block">
              Nurturing Lifelong Learners &amp; Shaping Future Leaders
            </span>
          )}
        </div>
      )}
    </div>
  );
};

