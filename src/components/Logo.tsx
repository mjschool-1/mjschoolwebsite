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
        img: 'h-[58px] min-[375px]:h-[66px] min-[430px]:h-[72px] sm:h-[76px] lg:h-[84px] xl:h-[88px] w-auto shrink-0 -ml-1 sm:ml-0',
        text: 'text-[23px] min-[375px]:text-[26px] min-[430px]:text-[28px] sm:text-[30px] lg:text-[32px] xl:text-[34px]',
        sub: 'text-[10.5px] min-[375px]:text-[11.5px] min-[430px]:text-[12px] sm:text-[12.5px] lg:text-[13px]',
      }
    : sizeMap[size as keyof typeof sizeMap] || sizeMap.md;

  const gapClass = isHeader
    ? 'gap-3 min-[375px]:gap-3.5 sm:gap-4 lg:gap-5'
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
            className={`font-serif tracking-wider font-black uppercase text-[#0B2545] leading-none ${currentSize.text}`}
            style={{ fontFamily: "'Cinzel', 'Merriweather', 'Georgia', serif" }}
          >
            MJ School
          </span>
          <span
            className={`text-[#C59B27] font-bold tracking-widest uppercase font-sans ${currentSize.sub} ${
              isHeader ? 'mt-1 sm:mt-1.5' : ''
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

