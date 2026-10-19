import React, { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';

export interface InfrastructureFeature {
  id: string;
  titleLines: string[];
  desc: string;
  checklist: string[];
  bgColor: string; // Solid, saturated hex color matching reference
  accentColor: string; // Underline accent bar
  textColorHex: string;
  icon: (props: { className?: string }) => React.ReactElement;
  watermark: () => React.ReactElement;
}

// ---------------------------------------------------------------------------
// High-Fidelity Custom SVGs matching Reference Image 1 exactly
// ---------------------------------------------------------------------------

// 1. Sprout / Seedling Icon
const SproutIcon: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Left leaf */}
    <path d="M12 21 C12 12, 22 10, 24 10 C24 18, 17 22, 12 21 Z" />
    {/* Right leaf */}
    <path d="M36 21 C36 12, 26 10, 24 10 C24 18, 31 22, 36 21 Z" />
    {/* Stem */}
    <path d="M24 10 V36" />
  </svg>
);

// 2. Hand Holding / Cupping Leaf Icon
const HandLeafIcon: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Leaf */}
    <path d="M25 8 C33 8 39 13 37 22 C29 23 24 17 25 8 Z" />
    <path d="M25 8 C28 15 33 19 37 22" />
    {/* Hand */}
    <path d="M10 26 C12 24 15 23 19 23 C23 23 27 25 30 27 C33 29 36 29 38 27" />
    <path d="M10 26 C10 32 16 36 23 36 C29 36 34 33 37 29" />
  </svg>
);

// 3. Heart Icon
const HeartIcon: React.FC<{ className?: string }> = ({ className = 'w-13 h-13' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M24 39 C24 39 9 29.5 9 18.5 C9 13 13 8.5 18.5 8.5 C21.8 8.5 23.3 10.2 24 11.2 C24.7 10.2 26.2 8.5 29.5 8.5 C35 8.5 39 13 39 18.5 C39 29.5 24 39 24 39 Z" />
  </svg>
);

// 4. Sparkles Icon
const SparklesIcon: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Main 4-point sparkle */}
    <path d="M22 8 C22 16, 26 20, 34 20 C26 20, 22 24, 22 32 C22 24, 18 20, 10 20 C18 20, 22 16, 22 8 Z" />
    {/* Small cross sparkle top right */}
    <path d="M36 10 V16 M33 13 H39" strokeWidth="2.2" />
    {/* Small dot bottom left */}
    <circle cx="13" cy="33" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

// 5. Open Book Icon
const BookIcon: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M24 15 C20 12, 13 12, 10 13 V35 C13 34, 20 34, 24 37 C28 34, 35 34, 38 35 V13 C35 12, 28 12, 24 15 Z" />
    <path d="M24 15 V37" />
  </svg>
);

// 6. Trophy Cup Icon
const TrophyIcon: React.FC<{ className?: string }> = ({ className = 'w-11 h-11' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Trophy cup body */}
    <path d="M16 11 H32 V21 C32 26 28 30 24 30 C20 30 16 26 16 21 V11 Z" />
    {/* Left handle */}
    <path d="M16 14 H11 C11 20 15 22 16 22" />
    {/* Right handle */}
    <path d="M32 14 H37 C37 20 33 22 32 22" />
    {/* Stem */}
    <path d="M24 30 V36" />
    {/* Base */}
    <path d="M17 36 H31" />
  </svg>
);

// ---------------------------------------------------------------------------
// 6 Distinctive Infrastructure Pillars
// ---------------------------------------------------------------------------

export const FEATURES: InfrastructureFeature[] = [
  {
    id: 'green-env',
    titleLines: ['GREEN', 'LEARNING', 'ENVIRONMENT'],
    desc: 'A cleaner, greener school environment that inspires children to connect with nature, care for surroundings, and thrive in fresh open air.',
    checklist: [
      'Lush green campus surroundings',
      'Clean air & open outdoor spaces',
      'Nature-inspired learning atmosphere',
    ],
    bgColor: '#15803D', // Rich Forest Green
    accentColor: '#FBBF24', // Yellow bar
    textColorHex: '#15803D',
    icon: SproutIcon,
    watermark: () => (
      <svg
        className="absolute -right-8 -bottom-10 w-48 h-48 opacity-[0.09] pointer-events-none text-white"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M50 10 C30 10, 10 30, 10 50 C10 70, 30 90, 50 90 C70 90, 90 70, 90 50 C90 30, 70 10, 50 10 Z" />
      </svg>
    ),
  },
  {
    id: 'env-awareness',
    titleLines: ['ENVIRONMENTAL', 'AWARENESS'],
    desc: 'Nature walks, campus green habits, and cleanliness activities cultivate responsible environmental awareness from a young age.',
    checklist: [
      'Eco-friendly campus habits',
      'Nature observation & clean drives',
      'Environmental stewardship',
    ],
    bgColor: '#0D766E', // Deep Teal
    accentColor: '#4ADE80', // Mint bar
    textColorHex: '#0D766E',
    icon: HandLeafIcon,
    watermark: () => (
      <svg
        className="absolute -right-6 -bottom-8 w-44 h-44 opacity-[0.09] pointer-events-none text-white"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="40" />
      </svg>
    ),
  },
  {
    id: 'caring-env',
    titleLines: ['A CARING SCHOOL', 'ENVIRONMENT'],
    desc: 'A safe, inclusive and supportive space where every child feels valued, heard and encouraged to grow.',
    checklist: [
      'Student well-being & support',
      'Positive & respectful culture',
      'Nurturing teacher-student relationships',
    ],
    bgColor: '#DC2626', // Vivid Crimson Red
    accentColor: '#FBBF24', // Gold bar
    textColorHex: '#DC2626',
    icon: HeartIcon,
    watermark: () => (
      <svg
        className="absolute -right-10 top-10 w-56 h-56 opacity-[0.11] pointer-events-none text-white"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
  {
    id: 'hygiene-fac',
    titleLines: ['CLEAN &', 'HYGIENIC', 'FACILITIES'],
    desc: 'Classroom and sanitary facilities designed with meticulous care to support students’ everyday comfort, hygiene, and well-being.',
    checklist: [
      'Well-maintained clean classrooms',
      'Hygienic restrooms & handwash areas',
      'Daily sanitization & safety protocols',
    ],
    bgColor: '#1D4ED8', // Bright Royal Blue
    accentColor: '#60A5FA', // Sky Blue bar
    textColorHex: '#1D4ED8',
    icon: SparklesIcon,
    watermark: () => (
      <svg
        className="absolute -right-8 -bottom-10 w-48 h-48 opacity-[0.10] pointer-events-none text-white"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" />
      </svg>
    ),
  },
  {
    id: 'foundations',
    titleLines: ['LEARNING', 'THROUGH STRONG', 'FOUNDATIONS'],
    desc: 'Building essential skills in languages, mathematics, and core concepts through structured learning and encouraging formative assessments.',
    checklist: [
      'Strong core literacy & numeracy',
      'Structured CBSE curriculum foundation',
      'Continuous supportive assessments',
    ],
    bgColor: '#0B2545', // Deep Navy Blue
    accentColor: '#93C5FD', // Ice Blue bar
    textColorHex: '#0B2545',
    icon: BookIcon,
    watermark: () => (
      <svg
        className="absolute -right-8 -bottom-10 w-48 h-48 opacity-[0.09] pointer-events-none text-white"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <rect x="15" y="15" width="70" height="70" rx="12" />
      </svg>
    ),
  },
  {
    id: 'all-round',
    titleLines: ['ALL-ROUND', 'DEVELOPMENT'],
    desc: 'Creative activities, sports, and cultural celebrations nurture confidence, teamwork, leadership, and enduring Indian values.',
    checklist: [
      'Sports, physical fitness & yoga',
      'Creative arts & cultural activities',
      'Indian values & character building',
    ],
    bgColor: '#EA580C', // Vivid Burnt Orange
    accentColor: '#FDE047', // Yellow bar
    textColorHex: '#EA580C',
    icon: TrophyIcon,
    watermark: () => (
      <svg
        className="absolute -right-8 -bottom-10 w-48 h-48 opacity-[0.10] pointer-events-none text-white"
        viewBox="0 0 100 100"
        fill="currentColor"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="45" />
      </svg>
    ),
  },
];

export const InfrastructureCards: React.FC = () => {
  // Default to Card 3 ("caring-env", index 2) as required by prompt & reference image
  const [expandedId, setExpandedId] = useState<string>('caring-env');

  const toggleCard = (id: string) => {
    // Expand clicked card
    setExpandedId(id);
  };

  const activeIndex = FEATURES.findIndex((f) => f.id === expandedId);
  const activeFeature = FEATURES[activeIndex >= 0 ? activeIndex : 2];

  return (
    <div className="w-full relative py-6 md:py-10">
      {/* =================================================================== */}
      {/* Desktop & Tablet: Overlapping Series with Central Expand Up/Down    */}
      {/* Preserves the continuous layered visual composition across viewports*/}
      {/* =================================================================== */}
      <div className="hidden md:block w-full overflow-x-auto overflow-y-visible scrollbar-none py-6">
        <div
          className="relative flex items-center justify-center min-w-[1060px] min-h-[580px] lg:min-h-[610px] select-none mx-auto px-6"
          role="region"
          aria-label="Campus infrastructure features overlapping horizontal series"
        >
          {FEATURES.map((card, index) => {
            const isExpanded = expandedId === card.id;
            const Icon = card.icon;
            const Watermark = card.watermark;

            // Compute dynamic z-index so the active card is always on top (z=40),
            // and cards cascade down smoothly towards both left and right edges.
            let zIndex = 20;
            if (isExpanded) {
              zIndex = 40;
            } else if (index < activeIndex) {
              // Left wing: higher index sits on top of lower index
              zIndex = 10 + index * 5;
            } else {
              // Right wing: lower index sits on top of higher index
              zIndex = 30 - (index - activeIndex) * 5;
            }

            // Directional inner padding:
            // When card is to the RIGHT of active card, active card overlaps its left edge,
            // so we add extra left padding (`pl-9 lg:pl-10`) so text and button remain 100% visible!
            // When card is to the LEFT of active card, neighbor overlaps its right edge,
            // so we add extra right padding (`pr-8 lg:pr-9`).
            let cardPaddingClass = 'px-5 lg:px-6';
            if (isExpanded) {
              cardPaddingClass = 'px-6 lg:px-7';
            } else if (index > activeIndex) {
              cardPaddingClass = 'pl-9 lg:pl-10 pr-4 lg:pr-5';
            } else if (index < activeIndex) {
              cardPaddingClass = 'pr-9 lg:pr-10 pl-4 lg:pl-5';
            }

            return (
              <div
                key={card.id}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-label={`${card.titleLines.join(' ')}. ${
                  isExpanded ? 'Currently expanded.' : 'Click to expand.'
                }`}
                onClick={() => toggleCard(card.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleCard(card.id);
                  }
                }}
                style={{
                  backgroundColor: card.bgColor,
                  zIndex,
                  transition:
                    'width 500ms cubic-bezier(0.16, 1, 0.3, 1), height 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 400ms ease',
                }}
                className={`relative shrink-0 rounded-[28px] lg:rounded-[32px] py-6 text-white cursor-pointer flex flex-col justify-between overflow-hidden focus:outline-none focus-visible:ring-4 focus-visible:ring-white/80 ${cardPaddingClass} ${
                  index !== 0 ? '-ml-7 lg:-ml-8 xl:-ml-9' : ''
                } ${
                  isExpanded
                    ? 'w-[270px] lg:w-[295px] xl:w-[315px] h-[525px] lg:h-[555px] xl:h-[575px] shadow-[0_25px_50px_rgba(0,0,0,0.45),0_10px_20px_rgba(0,0,0,0.25)] ring-1 ring-white/20'
                    : 'w-[185px] lg:w-[200px] xl:w-[215px] h-[415px] lg:h-[435px] xl:h-[445px] shadow-[0_15px_30px_rgba(0,0,0,0.30)] hover:brightness-105'
                }`}
              >
                {/* Decorative Faint Watermark Background */}
                <Watermark />

                {/* Top Section: Icon, Condensed Uppercase Title, Accent Underline */}
                <div className="relative z-10">
                  {/* Standalone White Outline Icon */}
                  <div className="mb-5 lg:mb-6">
                    <Icon className="w-10 h-10 lg:w-12 lg:h-12 text-white stroke-[2.4]" />
                  </div>

                  {/* Uppercase Bold Condensed Title */}
                  <h3
                    className={`font-sans font-black tracking-tight text-white uppercase leading-[1.08] mb-3 ${
                      isExpanded
                        ? 'text-xl lg:text-2xl xl:text-[25px]'
                        : 'text-sm lg:text-[15.5px] xl:text-[16.5px]'
                    }`}
                  >
                    {card.titleLines.map((line, i) => (
                      <span key={i} className="block whitespace-nowrap">
                        {line}
                      </span>
                    ))}
                  </h3>

                  {/* Accent Underline Bar */}
                  <div
                    className="w-9 h-1 rounded-full mb-3.5"
                    style={{ backgroundColor: card.accentColor }}
                    aria-hidden="true"
                  />

                  {/* Expanded Content: Description & 3-Point Checklist */}
                  {isExpanded && (
                    <div className="animate-fadeIn mt-3.5 space-y-3.5">
                      <p className="text-xs lg:text-[13px] xl:text-[13.5px] text-white/95 leading-relaxed font-normal">
                        {card.desc}
                      </p>

                      <ul className="space-y-2 pt-1">
                        {card.checklist.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2.5 text-xs lg:text-[12.5px] text-white font-medium"
                          >
                            <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
                              <Check
                                className="w-2.5 h-2.5 stroke-[3]"
                                style={{ color: card.textColorHex }}
                              />
                            </span>
                            <span className="leading-snug">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom Action Button */}
                <div className="relative z-10 mt-auto pt-3">
                  {isExpanded ? (
                    <div className="w-full py-2.5 lg:py-3 px-5 rounded-full bg-white hover:bg-white/95 text-xs lg:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98">
                      <span style={{ color: card.textColorHex }}>Learn more</span>
                      <ChevronRight
                        className="w-4 h-4 stroke-[3]"
                        style={{ color: card.textColorHex }}
                      />
                    </div>
                  ) : (
                    <div className="w-full py-2 px-3 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-[11px] lg:text-xs font-semibold text-white flex items-center justify-between transition-colors">
                      <span>Learn more</span>
                      <ChevronRight className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* Mobile Presentation (< 768px): Card Selector + Featured Pillar Card */}
      {/* =================================================================== */}
      <div className="md:hidden w-full space-y-5">
        {/* Horizontal Card Selector Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 px-1 scrollbar-none select-none">
          {FEATURES.map((card) => {
            const isSelected = expandedId === card.id;
            const Icon = card.icon;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setExpandedId(card.id)}
                aria-pressed={isSelected}
                className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                  isSelected
                    ? 'text-white shadow-md scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                style={{
                  backgroundColor: isSelected ? card.bgColor : undefined,
                }}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                <span>{card.titleLines[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Featured Prominent Mobile Card */}
        {activeFeature && (
          <div
            style={{ backgroundColor: activeFeature.bgColor }}
            className="relative rounded-3xl p-6 text-white shadow-[0_20px_40px_rgba(0,0,0,0.35)] overflow-hidden transition-all duration-300"
          >
            {/* Watermark */}
            {activeFeature.watermark()}

            <div className="relative z-10">
              {/* Standalone White Outline Icon */}
              <div className="mb-4">
                {React.createElement(activeFeature.icon, {
                  className: 'w-11 h-11 text-white stroke-[2.4]',
                })}
              </div>

              {/* Uppercase Condensed Bold Title */}
              <h3 className="font-sans font-black tracking-tight text-white uppercase text-2xl leading-[1.1] mb-2.5">
                {activeFeature.titleLines.map((line, i) => (
                  <span key={i} className="block">
                    {line}
                  </span>
                ))}
              </h3>

              {/* Accent Underline Bar */}
              <div
                className="w-10 h-1 rounded-full mb-4"
                style={{ backgroundColor: activeFeature.accentColor }}
                aria-hidden="true"
              />

              {/* Verified Description */}
              <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-normal mb-4">
                {activeFeature.desc}
              </p>

              {/* 3-Point Checklist */}
              <ul className="space-y-2.5 mb-6">
                {activeFeature.checklist.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
                    <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check
                        className="w-2.5 h-2.5 stroke-[3]"
                        style={{ color: activeFeature.textColorHex }}
                      />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <div className="w-full py-3 px-5 rounded-full bg-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg">
                <span style={{ color: activeFeature.textColorHex }}>Learn more</span>
                <ChevronRight
                  className="w-4 h-4 stroke-[3]"
                  style={{ color: activeFeature.textColorHex }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
