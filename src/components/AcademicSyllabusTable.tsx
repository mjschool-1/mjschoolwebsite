import React, { useState } from 'react';
import { ChevronDown, BookOpen, AlertCircle } from 'lucide-react';

export interface GradeSyllabus {
  id: string;
  grade: string;
  subjectCountDisplay: string;
  countNumber?: number;
  subjects: string[];
  isProvided: boolean;
}

export const SYLLABUS_GRADES: GradeSyllabus[] = [
  {
    id: 'nursery',
    grade: 'Nursery',
    subjectCountDisplay: 'Not provided',
    subjects: [],
    isProvided: false,
  },
  {
    id: 'grade-1',
    grade: '1st Grade',
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
  },
  {
    id: 'grade-2',
    grade: '2nd Grade',
    subjectCountDisplay: '4 Subjects',
    countNumber: 4,
    subjects: [
      'English',
      'Mathematics',
      'Environmental Studies',
      'General Knowledge',
    ],
    isProvided: true,
  },
  {
    id: 'grade-3',
    grade: '3rd Grade',
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
  },
  {
    id: 'grade-4',
    grade: '4th Grade',
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
  },
  {
    id: 'grade-5',
    grade: '5th Grade',
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
  },
];

export const AcademicSyllabusTable: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleGrade = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full">
      {/* Grade-wise Syllabus Directory Table */}
      <div className="border border-slate-200 border-t-2 border-t-[#C59B27] bg-white overflow-hidden shadow-none">
        
        {/* Desktop / Tablet Table View (sm and up) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-full">
            <thead>
              <tr className="bg-[#0B2545] text-white text-xs uppercase tracking-wider font-sans select-none">
                <th scope="col" className="py-3.5 px-6 font-bold w-[32%]">
                  Grade
                </th>
                <th scope="col" className="py-3.5 px-6 font-bold w-[32%]">
                  Number of Subjects
                </th>
                <th scope="col" className="py-3.5 px-6 font-bold w-[36%] text-right sm:text-left">
                  Subjects
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm text-slate-800">
              {SYLLABUS_GRADES.map((item, index) => {
                const isExpanded = expandedId === item.id;
                const isStriped = index % 2 === 1;

                return (
                  <React.Fragment key={item.id}>
                    {/* Collapsed Grade Row */}
                    <tr
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
                      className={`cursor-pointer transition-colors focus:outline-none focus-visible:bg-amber-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C59B27] ${
                        isExpanded
                          ? 'bg-amber-50/50'
                          : isStriped
                          ? 'bg-slate-50/60 hover:bg-amber-50/30'
                          : 'bg-white hover:bg-amber-50/30'
                      }`}
                    >
                      {/* Grade Column */}
                      <td className="py-4 px-6 font-serif font-bold text-[#0B2545] text-sm sm:text-base">
                        <span className="flex items-center gap-2">
                          <span>{item.grade}</span>
                        </span>
                      </td>

                      {/* Number of Subjects Column */}
                      <td className="py-4 px-6 text-slate-700">
                        {item.isProvided ? (
                          <span className="font-semibold text-slate-800">
                            {item.subjectCountDisplay}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">
                            {item.subjectCountDisplay}
                          </span>
                        )}
                      </td>

                      {/* Subjects Action / Prompt Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-between">
                          {item.isProvided ? (
                            <span className="font-medium text-[#0B2545] group-hover:text-[#133E6E]">
                              {isExpanded ? 'Hide subjects' : 'View subjects'}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">
                              Not provided
                            </span>
                          )}

                          <span className="ml-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-[#0B2545] group-hover:bg-[#0B2545] group-hover:text-white transition-colors">
                            <ChevronDown
                              className={`w-4 h-4 text-[#C59B27] transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Subject Details Panel */}
                    {isExpanded && (
                      <tr id={`panel-${item.id}`} className="bg-slate-50/70">
                        <td colSpan={3} className="p-4 sm:p-6 border-t border-b border-slate-200/90">
                          <div className="bg-white border border-slate-200 p-5 sm:p-6 shadow-xs border-l-4 border-l-[#C59B27]">
                            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-[#C59B27]" />
                                <h4 className="font-serif font-bold text-sm sm:text-base text-[#0B2545]">
                                  {item.isProvided
                                    ? `Prescribed Subjects for ${item.grade}`
                                    : `Curriculum Status for ${item.grade}`}
                                </h4>
                              </div>
                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {item.isProvided
                                  ? `${item.subjects.length} Subjects`
                                  : 'Information Pending'}
                              </span>
                            </div>

                            {item.isProvided ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {item.subjects.map((subject, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 text-xs sm:text-sm font-medium text-slate-800 transition-colors hover:bg-amber-50/30 hover:border-[#C59B27]/40"
                                  >
                                    <span className="w-6 h-6 rounded-full bg-[#0B2545] text-[#F6D55C] text-xs font-bold flex items-center justify-center shrink-0">
                                      {sIdx + 1}
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                      {subject}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-start gap-3 p-4 bg-amber-50/50 border border-amber-200/70 text-xs sm:text-sm text-slate-700">
                                <AlertCircle className="w-5 h-5 text-[#C59B27] shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold text-[#0B2545] mb-0.5">
                                    Syllabus Not Provided Yet
                                  </p>
                                  <p className="text-slate-600 leading-relaxed">
                                    The official subject syllabus for Nursery has not been supplied by the school administration yet. It will be updated here once officially provided.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Card-Row View (< sm screens) */}
        <div className="block sm:hidden divide-y divide-slate-200">
          {/* Mobile Table Header Strip */}
          <div className="bg-[#0B2545] text-white text-[11px] font-bold uppercase tracking-wider px-4 py-3 flex items-center justify-between select-none">
            <span>Grade &amp; Details</span>
            <span>Subjects</span>
          </div>

          {SYLLABUS_GRADES.map((item, index) => {
            const isExpanded = expandedId === item.id;
            const isStriped = index % 2 === 1;

            return (
              <div
                key={item.id}
                className={isExpanded ? 'bg-amber-50/40' : isStriped ? 'bg-slate-50/60' : 'bg-white'}
              >
                {/* Clickable Mobile Header */}
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={`mobile-panel-${item.id}`}
                  onClick={() => toggleGrade(item.id)}
                  className="w-full text-left p-4 focus:outline-none focus-visible:bg-amber-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C59B27] transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      {/* Grade */}
                      <span className="block font-serif font-bold text-base text-[#0B2545]">
                        {item.grade}
                      </span>
                      {/* Number of Subjects */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <span className="font-medium text-slate-500 uppercase tracking-wider text-[10px]">
                          Subjects:
                        </span>
                        <span className={item.isProvided ? 'font-semibold text-slate-800' : 'text-slate-500 italic'}>
                          {item.subjectCountDisplay}
                        </span>
                      </div>
                    </div>

                    {/* Expand/Collapse Prompt & Chevron */}
                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                      <span className="text-xs font-semibold text-[#0B2545]">
                        {item.isProvided
                          ? isExpanded ? 'Hide' : 'View'
                          : 'Not provided'}
                      </span>
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[#0B2545]">
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-[#C59B27] transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </span>
                    </div>
                  </div>
                </button>

                {/* Mobile Expanded Subject Details Card */}
                {isExpanded && (
                  <div id={`mobile-panel-${item.id}`} className="px-4 pb-4 pt-1 bg-slate-50/80 border-t border-slate-200/80">
                    <div className="bg-white border border-slate-200 p-4 shadow-xs border-l-3 border-l-[#C59B27]">
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#C59B27]" />
                          <h4 className="font-serif font-bold text-xs text-[#0B2545]">
                            {item.isProvided
                              ? `Prescribed Subjects`
                              : `Curriculum Status`}
                          </h4>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                          {item.isProvided
                            ? `${item.subjects.length} Total`
                            : 'Pending'}
                        </span>
                      </div>

                      {item.isProvided ? (
                        <div className="space-y-2">
                          {item.subjects.map((subject, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-800"
                            >
                              <span className="w-5 h-5 rounded-full bg-[#0B2545] text-[#F6D55C] text-[10px] font-bold flex items-center justify-center shrink-0">
                                {sIdx + 1}
                              </span>
                              <span className="font-semibold text-slate-800">
                                {subject}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-start gap-2.5 p-3 bg-amber-50/50 border border-amber-200/70 text-xs text-slate-700">
                          <AlertCircle className="w-4 h-4 text-[#C59B27] shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-[#0B2545] mb-0.5">
                              Syllabus Not Provided Yet
                            </p>
                            <p className="text-slate-600 leading-relaxed text-[11.5px]">
                              Official subject syllabus for Nursery will be updated here once supplied by the school office.
                            </p>
                          </div>
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
  );
};
