import React, { useState } from 'react';
import {
  ChevronDown,
  BookOpen,
  Puzzle,
  Calculator,
  Lightbulb,
  Globe,
  Leaf,
  FlaskConical,
  Landmark,
} from 'lucide-react';

export interface GradeItem {
  id: string;
  grade: string;
  description: string;
  subjectCountDisplay: string;
  countNumber?: number;
  subjects: string[];
  isProvided: boolean;
  iconType: 'teddy' | 'bunny' | 'books' | 'star' | 'globe' | 'trophy';
  colors: {
    bg: string;
    hoverBg: string;
    border: string;
    pillBg: string;
    pillText: string;
    cardBorder: string;
  };
}

export const SYLLABUS_GRADES: GradeItem[] = [
  {
    id: 'nursery',
    grade: 'Nursery',
    description: 'A joyful start to learning through play, stories and exploration.',
    subjectCountDisplay: 'Not provided',
    subjects: [],
    isProvided: false,
    iconType: 'teddy',
    colors: {
      bg: 'bg-[#FFFDF7]',
      hoverBg: 'hover:bg-[#FFF8EA]',
      border: 'border-amber-100',
      pillBg: 'bg-amber-100/80',
      pillText: 'text-amber-900',
      cardBorder: 'border-amber-200/90',
    },
  },
  {
    id: 'grade-1',
    grade: '1st Grade',
    description: 'Building core skills with hands-on learning and real-life connections.',
    subjectCountDisplay: '5 Subjects',
    countNumber: 5,
    subjects: [
      'English',
      'Reasoning and Aptitude',
      'Mathematics',
      'General Knowledge',
      'The World Around Us',
    ],
    isProvided: true,
    iconType: 'bunny',
    colors: {
      bg: 'bg-[#F2F8FF]',
      hoverBg: 'hover:bg-[#E7F2FF]',
      border: 'border-sky-100',
      pillBg: 'bg-sky-100/90',
      pillText: 'text-sky-900',
      cardBorder: 'border-sky-200/90',
    },
  },
  {
    id: 'grade-2',
    grade: '2nd Grade',
    description: 'Strengthening fundamentals with engaging activities.',
    subjectCountDisplay: '4 Subjects',
    countNumber: 4,
    subjects: [
      'English',
      'Mathematics',
      'Environmental Studies',
      'General Knowledge',
    ],
    isProvided: true,
    iconType: 'books',
    colors: {
      bg: 'bg-[#F9F5FF]',
      hoverBg: 'hover:bg-[#F2EBFF]',
      border: 'border-purple-100',
      pillBg: 'bg-purple-100/90',
      pillText: 'text-purple-900',
      cardBorder: 'border-purple-200/90',
    },
  },
  {
    id: 'grade-3',
    grade: '3rd Grade',
    description: 'Growing confidence through deeper learning.',
    subjectCountDisplay: '5 Subjects',
    countNumber: 5,
    subjects: [
      'English',
      'Mathematics',
      'Science',
      'Social Studies',
      'General Knowledge',
    ],
    isProvided: true,
    iconType: 'star',
    colors: {
      bg: 'bg-[#F2FAF5]',
      hoverBg: 'hover:bg-[#E5F7EC]',
      border: 'border-emerald-100',
      pillBg: 'bg-emerald-100/90',
      pillText: 'text-emerald-900',
      cardBorder: 'border-emerald-200/90',
    },
  },
  {
    id: 'grade-4',
    grade: '4th Grade',
    description: 'Building critical thinking and real-world understanding.',
    subjectCountDisplay: '5 Subjects',
    countNumber: 5,
    subjects: [
      'English',
      'Mathematics',
      'Science',
      'Social Studies',
      'General Knowledge',
    ],
    isProvided: true,
    iconType: 'globe',
    colors: {
      bg: 'bg-[#FEFDF2]',
      hoverBg: 'hover:bg-[#FDF9DC]',
      border: 'border-amber-200/50',
      pillBg: 'bg-amber-100/90',
      pillText: 'text-amber-900',
      cardBorder: 'border-amber-200/90',
    },
  },
  {
    id: 'grade-5',
    grade: '5th Grade',
    description: 'Preparing for the next academic milestone with strong foundations.',
    subjectCountDisplay: '5 Subjects',
    countNumber: 5,
    subjects: [
      'English',
      'Mathematics',
      'Science',
      'Social Studies',
      'General Knowledge',
    ],
    isProvided: true,
    iconType: 'trophy',
    colors: {
      bg: 'bg-[#FFF5F7]',
      hoverBg: 'hover:bg-[#FFEAF0]',
      border: 'border-rose-100',
      pillBg: 'bg-rose-100/90',
      pillText: 'text-rose-900',
      cardBorder: 'border-rose-200/90',
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Handcrafted Child-Friendly Vector Grade Icons                              */
/* -------------------------------------------------------------------------- */

const GradeIcon: React.FC<{ type: GradeItem['iconType'] }> = ({ type }) => {
  switch (type) {
    case 'teddy':
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-xs" aria-hidden="true">
          <circle cx="16" cy="18" r="8.5" fill="#C97A3E" />
          <circle cx="16" cy="18" r="5" fill="#F8B490" />
          <circle cx="48" cy="18" r="8.5" fill="#C97A3E" />
          <circle cx="48" cy="18" r="5" fill="#F8B490" />
          <ellipse cx="32" cy="36" rx="19" ry="17" fill="#E28D4D" />
          <ellipse cx="32" cy="40" rx="9.5" ry="7.5" fill="#FFF2DF" />
          <ellipse cx="32" cy="37" rx="4" ry="2.8" fill="#3D2314" />
          <path d="M32 39.8v3.2M29.5 43c1 .8 4 .8 5 0" stroke="#3D2314" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="23.5" cy="33" r="2.8" fill="#2C1810" />
          <circle cx="24.4" cy="32.1" r="1" fill="#FFFFFF" />
          <circle cx="40.5" cy="33" r="2.8" fill="#2C1810" />
          <circle cx="41.4" cy="32.1" r="1" fill="#FFFFFF" />
          <circle cx="18" cy="39" r="2.5" fill="#FF8A80" opacity="0.45" />
          <circle cx="46" cy="39" r="2.5" fill="#FF8A80" opacity="0.45" />
        </svg>
      );

    case 'bunny':
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-xs" aria-hidden="true">
          <ellipse cx="23" cy="18" rx="5.5" ry="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
          <ellipse cx="23" cy="19" rx="3" ry="9" fill="#FFB2C9" />
          <ellipse cx="41" cy="18" rx="5.5" ry="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
          <ellipse cx="41" cy="19" rx="3" ry="9" fill="#FFB2C9" />
          <circle cx="32" cy="38" r="18" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
          <circle cx="24" cy="36" r="2.8" fill="#2C1810" />
          <circle cx="25" cy="35" r="1" fill="#FFFFFF" />
          <circle cx="40" cy="36" r="2.8" fill="#2C1810" />
          <circle cx="41" cy="35" r="1" fill="#FFFFFF" />
          <path d="M30 40.5l2 2.5 2-2.5z" fill="#FF8FA3" />
          <path d="M32 43v2M30 45c1 .8 3 .8 4 0" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" />
          <ellipse cx="19" cy="41" rx="3" ry="2" fill="#FFA4B6" opacity="0.5" />
          <ellipse cx="45" cy="41" rx="3" ry="2" fill="#FFA4B6" opacity="0.5" />
        </svg>
      );

    case 'books':
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-xs" aria-hidden="true">
          <rect x="12" y="42" width="40" height="9" rx="2.5" fill="#3B82F6" />
          <rect x="15" y="44" width="37" height="5" rx="1" fill="#FEF3C7" />
          <rect x="11" y="42" width="5" height="9" rx="1.5" fill="#1D4ED8" />
          <rect x="16" y="31" width="36" height="9" rx="2.5" fill="#10B981" />
          <rect x="19" y="33" width="33" height="5" rx="1" fill="#FFFBEB" />
          <rect x="15" y="31" width="5" height="9" rx="1.5" fill="#047857" />
          <rect x="13" y="20" width="38" height="9" rx="2.5" fill="#F97316" />
          <rect x="16" y="22" width="35" height="5" rx="1" fill="#FFFBEB" />
          <rect x="12" y="20" width="5" height="9" rx="1.5" fill="#C2410C" />
          <path d="M42 20v6l3-1.5 3 1.5v-6z" fill="#FBBF24" />
        </svg>
      );

    case 'star':
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-xs" aria-hidden="true">
          <defs>
            <linearGradient id="starGradClean" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>
          </defs>
          <path
            d="M32 8l6.8 14.5 16 2.3-11.6 11.3 2.7 15.9L32 44.5 18.1 52l2.7-15.9L9.2 24.8l16-2.3L32 8z"
            fill="url(#starGradClean)"
            stroke="#CA8A04"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="26" cy="28" r="2.2" fill="#78350F" />
          <circle cx="26.7" cy="27.3" r="0.7" fill="#FFFFFF" />
          <circle cx="38" cy="28" r="2.2" fill="#78350F" />
          <circle cx="38.7" cy="27.3" r="0.7" fill="#FFFFFF" />
          <path d="M28 34c1.5 1.5 6.5 1.5 8 0" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="22" cy="32" r="1.8" fill="#F43F5E" opacity="0.4" />
          <circle cx="42" cy="32" r="1.8" fill="#F43F5E" opacity="0.4" />
        </svg>
      );

    case 'globe':
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-xs" aria-hidden="true">
          <path d="M22 55h20M32 49v6" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          <path d="M16 31a16 16 0 0 0 31.8 2.5" stroke="#64748B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="32" cy="29" r="14.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          <path d="M25 23c2-2 5-2 7 0 1 1 0 4-1 5s-3 3-4 5c-1-2-2-6-2-10z" fill="#22C55E" opacity="0.9" />
          <path d="M35 30c2 1 4 0 6-2 1 1 1 3 0 4-2 1-5 0-6-2z" fill="#22C55E" opacity="0.9" />
          <path d="M28 36c2 3 5 3 8 2-1 2-3 2-5 1-2-1-3-3-3-3z" fill="#22C55E" opacity="0.9" />
          <ellipse cx="32" cy="29" rx="14.5" ry="5.5" stroke="#BAE6FD" strokeWidth="1" fill="none" opacity="0.5" />
          <line x1="32" y1="14.5" x2="32" y2="43.5" stroke="#BAE6FD" strokeWidth="1" opacity="0.5" />
        </svg>
      );

    case 'trophy':
      return (
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full drop-shadow-xs" aria-hidden="true">
          <defs>
            <linearGradient id="trophyGradClean" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>
          </defs>
          <path d="M21 16h22v12a11 11 0 0 1-22 0V16z" fill="url(#trophyGradClean)" stroke="#B45309" strokeWidth="1.5" />
          <path d="M21 20H14a5 5 0 0 0-5 5v1a5 5 0 0 0 5 5h7M43 20h7a5 5 0 0 1 5 5v1a5 5 0 0 1-5 5h-7" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M30 40h4v8h-4z" fill="#D97706" />
          <rect x="23" y="48" width="18" height="6.5" rx="2" fill="#475569" />
          <rect x="25.5" y="50" width="13" height="2.5" rx="1" fill="#FCD34D" />
          <path d="M32 21.5l1.3 2.6 2.9.4-2.1 2 .5 2.9-2.6-1.4-2.6 1.4.5-2.9-2.1-2 2.9-.4L32 21.5z" fill="#F59E0B" />
        </svg>
      );

    default:
      return null;
  }
};

/* -------------------------------------------------------------------------- */
/* Subject Visual Mappings & Tiles                                            */
/* -------------------------------------------------------------------------- */

interface SubjectVisualConfig {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  badgeBg: string;
  badgeBorder: string;
  tileBorder: string;
  tileHoverBorder: string;
}

const SUBJECT_VISUAL_MAP: Record<string, SubjectVisualConfig> = {
  'English': {
    icon: BookOpen,
    iconColor: 'text-sky-600',
    badgeBg: 'bg-sky-50',
    badgeBorder: 'border-sky-200/80',
    tileBorder: 'border-sky-100',
    tileHoverBorder: 'hover:border-sky-300',
  },
  'Reasoning and Aptitude': {
    icon: Puzzle,
    iconColor: 'text-purple-600',
    badgeBg: 'bg-purple-50',
    badgeBorder: 'border-purple-200/80',
    tileBorder: 'border-purple-100',
    tileHoverBorder: 'hover:border-purple-300',
  },
  'Mathematics': {
    icon: Calculator,
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200/80',
    tileBorder: 'border-amber-100',
    tileHoverBorder: 'hover:border-amber-300',
  },
  'General Knowledge': {
    icon: Lightbulb,
    iconColor: 'text-orange-600',
    badgeBg: 'bg-orange-50',
    badgeBorder: 'border-orange-200/80',
    tileBorder: 'border-orange-100',
    tileHoverBorder: 'hover:border-orange-300',
  },
  'The World Around Us': {
    icon: Globe,
    iconColor: 'text-teal-600',
    badgeBg: 'bg-teal-50',
    badgeBorder: 'border-teal-200/80',
    tileBorder: 'border-teal-100',
    tileHoverBorder: 'hover:border-teal-300',
  },
  'Environmental Studies': {
    icon: Leaf,
    iconColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200/80',
    tileBorder: 'border-emerald-100',
    tileHoverBorder: 'hover:border-emerald-300',
  },
  'Science': {
    icon: FlaskConical,
    iconColor: 'text-indigo-600',
    badgeBg: 'bg-indigo-50',
    badgeBorder: 'border-indigo-200/80',
    tileBorder: 'border-indigo-100',
    tileHoverBorder: 'hover:border-indigo-300',
  },
  'Social Studies': {
    icon: Landmark,
    iconColor: 'text-rose-600',
    badgeBg: 'bg-rose-50',
    badgeBorder: 'border-rose-200/80',
    tileBorder: 'border-rose-100',
    tileHoverBorder: 'hover:border-rose-300',
  },
};

const getSubjectConfig = (name: string): SubjectVisualConfig => {
  return (
    SUBJECT_VISUAL_MAP[name] || {
      icon: BookOpen,
      iconColor: 'text-sky-600',
      badgeBg: 'bg-sky-50',
      badgeBorder: 'border-sky-200/80',
      tileBorder: 'border-sky-100',
      tileHoverBorder: 'hover:border-sky-300',
    }
  );
};

const SubjectTile: React.FC<{ subject: string }> = ({ subject }) => {
  const config = getSubjectConfig(subject);
  const IconComponent = config.icon;

  return (
    <div
      className={`group/subject flex items-center gap-2.5 sm:gap-3 py-2 px-3 sm:py-2.5 sm:px-3.5 bg-white border ${config.tileBorder} ${config.tileHoverBorder} hover:bg-slate-50/80 rounded-xl transition-all duration-200 shadow-2xs hover:shadow-xs`}
    >
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${config.badgeBg} ${config.badgeBorder} border shadow-2xs transition-transform duration-200 group-hover/subject:scale-105`}
        aria-hidden="true"
      >
        <IconComponent className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${config.iconColor}`} />
      </div>
      <span className="font-bold text-xs sm:text-sm text-slate-800 leading-snug tracking-tight">
        {subject}
      </span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Main Academic Syllabus Table Component                                     */
/* -------------------------------------------------------------------------- */

export const AcademicSyllabusTable: React.FC = () => {
  // 1st Grade is expanded on load to match the reference UI presentation
  const [expandedId, setExpandedId] = useState<string | null>('grade-1');

  const toggleGrade = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full">
      {/* Container: Rounded card with top navy header */}
      <div className="border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm bg-white">
        
        {/* ================================================================= */}
        {/* Desktop / Large Screen Layout (>= 1024px)                        */}
        {/* ================================================================= */}
        <div className="hidden lg:block">
          {/* Header Row */}
          <div className="grid grid-cols-12 items-center bg-[#0B2545] text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 select-none">
            <div className="col-span-3">GRADE</div>
            <div className="col-span-2">NUMBER OF SUBJECTS</div>
            <div className="col-span-7 pl-3">SUBJECTS</div>
          </div>

          {/* Grade Rows */}
          <div className="divide-y divide-slate-100">
            {SYLLABUS_GRADES.map((item, index) => {
              const isExpanded = expandedId === item.id;
              const isLast = index === SYLLABUS_GRADES.length - 1;

              return (
                <div
                  key={item.id}
                  id={`row-${item.id}`}
                  tabIndex={0}
                  role="button"
                  aria-expanded={isExpanded}
                  aria-controls={`panel-${item.id}`}
                  onClick={() => toggleGrade(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleGrade(item.id);
                    }
                  }}
                  className={`p-4 lg:px-6 lg:py-4 transition-all duration-200 ${item.colors.bg} ${item.colors.hoverBg} ${
                    isLast ? 'rounded-b-2xl' : ''
                  } cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C59B27]`}
                >
                  <div className="grid grid-cols-12 items-center gap-4">
                    {/* Column 1: Grade Icon & Details (col-span-3) */}
                    <div className="col-span-3 flex items-center gap-3.5">
                      <div className="w-12 h-12 lg:w-13 lg:h-13 shrink-0 flex items-center justify-center drop-shadow-2xs">
                        <GradeIcon type={item.iconType} />
                      </div>
                      <div className="min-w-0 pr-1">
                        <h3 className="font-serif font-black text-lg lg:text-xl text-[#0B2545] leading-tight">
                          {item.grade}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-snug font-normal">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Column 2: Number of Subjects (col-span-2) */}
                    <div className="col-span-2 text-slate-700 font-semibold text-sm lg:text-base">
                      {item.isProvided ? (
                        <span className="text-[#0B2545] font-bold">{item.subjectCountDisplay}</span>
                      ) : (
                        <span className="text-slate-500 font-normal italic">{item.subjectCountDisplay}</span>
                      )}
                    </div>

                    {/* Column 3: Subjects Preview or Expanded Card (col-span-7) */}
                    <div className="col-span-7 pl-3">
                      {!isExpanded ? (
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-xs lg:text-sm text-slate-600 font-medium line-clamp-2">
                            {item.description}
                          </p>

                          {/* Circular Chevron Button */}
                          <div
                            className="w-8 h-8 rounded-full bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center text-[#0B2545] shrink-0 transition-transform duration-200"
                            aria-hidden="true"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        /* Expanded State: White card matching reference UI */
                        <div
                          id={`panel-${item.id}`}
                          className="flex items-center gap-3 w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className={`flex-1 bg-white rounded-2xl p-4 lg:p-4.5 border ${item.colors.cardBorder} shadow-xs`}>
                            {/* Card Header */}
                            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-[#C59B27]" />
                                <h4 className="font-serif font-black text-xs sm:text-sm lg:text-base text-[#0B2545]">
                                  {item.isProvided
                                    ? `Prescribed Subjects for ${item.grade}`
                                    : `Curriculum Status for ${item.grade}`}
                                </h4>
                              </div>
                              <span
                                className={`text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${item.colors.pillBg} ${item.colors.pillText}`}
                              >
                                {item.isProvided ? `${item.subjects.length} Subjects` : 'Information Pending'}
                              </span>
                            </div>

                            {/* Subject Tiles */}
                            {item.isProvided ? (
                              <div className="flex flex-wrap gap-2 lg:gap-2.5">
                                {item.subjects.map((subj, sIdx) => (
                                  <SubjectTile key={sIdx} subject={subj} />
                                ))}
                              </div>
                            ) : (
                              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-slate-700">
                                <p className="font-bold text-[#0B2545] mb-0.5">
                                  Syllabus details will be updated soon
                                </p>
                                <p className="text-slate-600 leading-relaxed text-[11.5px]">
                                  The official Nursery curriculum outline has not been provided yet by the school administration.
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Circular Chevron Button (Upward) */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleGrade(item.id);
                            }}
                            className="w-8 h-8 rounded-full bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center text-[#0B2545] hover:bg-[#0B2545] hover:text-white transition-all shrink-0 cursor-pointer"
                            title="Collapse subjects"
                            aria-label="Collapse subjects"
                          >
                            <ChevronDown className="w-4 h-4 rotate-180 transition-transform duration-200" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* Tablet & Mobile Layout (< 1024px)                                 */}
        {/* ================================================================= */}
        <div className="block lg:hidden">
          {/* Mobile Header Strip */}
          <div className="bg-[#0B2545] text-white text-xs font-bold uppercase tracking-wider px-4 py-3 flex items-center justify-between select-none">
            <span>Grade &amp; Curriculum</span>
            <span>Subjects</span>
          </div>

          <div className="divide-y divide-slate-100">
            {SYLLABUS_GRADES.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <div key={item.id} className={`${item.colors.bg} ${item.colors.hoverBg} transition-colors`}>
                  {/* Clickable Mobile Header */}
                  <button
                    type="button"
                    id={`mobile-row-${item.id}`}
                    aria-expanded={isExpanded}
                    aria-controls={`mobile-panel-${item.id}`}
                    onClick={() => toggleGrade(item.id)}
                    className="w-full text-left p-4 focus:outline-none focus-visible:bg-white/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C59B27] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 shrink-0 flex items-center justify-center drop-shadow-2xs">
                          <GradeIcon type={item.iconType} />
                        </div>
                        <div className="space-y-0.5">
                          <h3 className="font-serif font-black text-base text-[#0B2545] leading-tight">
                            {item.grade}
                          </h3>
                          <p className="text-[11.5px] text-slate-600 leading-snug line-clamp-1 font-normal">
                            {item.description}
                          </p>
                          <div className="pt-0.5">
                            <span
                              className={`inline-block text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.colors.pillBg} ${item.colors.pillText}`}
                            >
                              {item.subjectCountDisplay}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expand/Collapse Chevron Button */}
                      <div className="pt-1">
                        <div
                          className="w-8 h-8 rounded-full bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center text-[#0B2545] shrink-0"
                          aria-hidden="true"
                        >
                          <ChevronDown
                            className={`w-4 h-4 text-[#0B2545] transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Subject Card on Mobile */}
                  {isExpanded && (
                    <div
                      id={`mobile-panel-${item.id}`}
                      className="px-4 pb-4 pt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className={`bg-white rounded-2xl p-4 border ${item.colors.cardBorder} shadow-xs`}>
                        {/* Card Header */}
                        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-1">
                            <BookOpen className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                            <h4 className="font-serif font-black text-xs sm:text-sm text-[#0B2545] leading-snug">
                              {item.isProvided
                                ? `Prescribed Subjects for ${item.grade}`
                                : `Curriculum Status for ${item.grade}`}
                            </h4>
                          </div>
                          <span
                            className={`hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${item.colors.pillBg} ${item.colors.pillText}`}
                          >
                            {item.isProvided ? `${item.subjects.length} Subjects` : 'Pending'}
                          </span>
                        </div>

                        {/* Subject Tiles */}
                        {item.isProvided ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {item.subjects.map((subj, sIdx) => (
                              <SubjectTile key={sIdx} subject={subj} />
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-slate-700">
                            <p className="font-bold text-[#0B2545] mb-0.5">
                              Syllabus details will be updated soon
                            </p>
                            <p className="text-slate-600 leading-relaxed text-[11.5px]">
                              The official Nursery curriculum outline has not been provided yet by the school administration.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
