import React, { useState } from 'react';
import { NOTICES_LIST } from '../data/schoolData';
import { Download, FileText, ChevronDown, Filter, Calendar, Check, X, RotateCcw } from 'lucide-react';

const FILTERABLE_GRADES = [
  'Jr. KG',
  'Sr. KG',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
];

export const NoticeBoardAndEvents: React.FC = () => {
  // Filter states: pending checkbox selection vs applied filter selection
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [appliedGrades, setAppliedGrades] = useState<string[]>([]);
  
  // Expanded notice item state (supports toggle per item)
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Mobile filter collapse toggle
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const toggleGradeSelection = (grade: string) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  const handleSelectAllGrades = () => {
    setSelectedGrades([]);
    setAppliedGrades([]);
  };

  const handleApplyFilters = () => {
    setAppliedGrades(selectedGrades);
    setMobileFilterOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedGrades([]);
    setAppliedGrades([]);
  };

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Filter notices logic: matches any applied grade, or notices marked for 'All Grades'
  const filteredNotices = NOTICES_LIST.filter((notice) => {
    if (appliedGrades.length === 0) return true; // All Grades
    if (notice.grades.includes('All Grades')) return true;
    return appliedGrades.some((g) => notice.grades.includes(g));
  });

  return (
    <section id="notices" className="py-12 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-8 h-1 bg-[#C59B27] rounded-full inline-block"></span>
            <span className="text-xs uppercase font-bold text-[#C59B27] tracking-widest">
              Campus Updates &amp; Circulars
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] font-serif tracking-tight">
            Notices &amp; Events
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl font-medium">
            Stay informed about school announcements, academic updates and upcoming events.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* Left Sidebar: Filter by Grade (~240-260px wide) */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
              
              {/* Header / Mobile Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0B2545] text-[#F6D55C] flex items-center justify-center shrink-0 shadow-xs">
                    <Filter className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#0B2545] uppercase tracking-wider">
                      Filter by Grade
                    </h3>
                    {appliedGrades.length > 0 && (
                      <span className="text-[10px] text-[#C59B27] font-bold block">
                        {appliedGrades.length} grade{appliedGrades.length > 1 ? 's' : ''} filtered
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile Expand/Collapse Button */}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                  className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
                  aria-label={mobileFilterOpen ? 'Collapse grade filter' : 'Expand grade filter'}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileFilterOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Filter Content (Always visible on desktop, toggleable on mobile) */}
              <div className={`${mobileFilterOpen ? 'block' : 'hidden'} lg:block mt-4 pt-3 border-t border-slate-200/80 space-y-3`}>
                
                {/* "All Grades" Reset Option */}
                <button
                  type="button"
                  onClick={handleSelectAllGrades}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    selectedGrades.length === 0
                      ? 'bg-[#0B2545] text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200/60'
                  }`}
                >
                  <span>All Grades (Show All)</span>
                  {selectedGrades.length === 0 && <Check className="w-3.5 h-3.5 text-[#F6D55C]" />}
                </button>

                {/* Checkbox Options List */}
                <div className="space-y-1 pt-1">
                  {FILTERABLE_GRADES.map((grade) => {
                    const isChecked = selectedGrades.includes(grade);
                    return (
                      <label
                        key={grade}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer select-none transition-colors ${
                          isChecked
                            ? 'bg-amber-50/80 text-[#0B2545] font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleGradeSelection(grade)}
                            className="w-4 h-4 rounded text-[#0B2545] focus:ring-[#C59B27] border-slate-300 cursor-pointer"
                          />
                          <span>{grade}</span>
                        </span>
                        {isChecked && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C59B27]"></span>
                        )}
                      </label>
                    );
                  })}
                </div>

                {/* Filter Action Buttons */}
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    className="w-full bg-[#0B2545] hover:bg-[#133E6E] text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <span>Apply Filters</span>
                    {selectedGrades.length > 0 && (
                      <span className="bg-[#C59B27] text-[#0B2545] text-[10px] font-black px-1.5 py-0.2 rounded-full">
                        {selectedGrades.length}
                      </span>
                    )}
                  </button>

                  {(selectedGrades.length > 0 || appliedGrades.length > 0) && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="w-full text-slate-500 hover:text-rose-600 text-[11px] font-bold py-1 px-2 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear Filters</span>
                    </button>
                  )}
                </div>

              </div>

            </div>
          </aside>

          {/* Main Content Area: Vertical List of Notices */}
          <div className="flex-1 min-w-0 w-full">
            
            {/* Filter Status Bar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                Showing <strong>{filteredNotices.length}</strong> {filteredNotices.length === 1 ? 'announcement' : 'announcements'}
                {appliedGrades.length > 0 && (
                  <span className="text-slate-500 font-normal ml-1">
                    for <span className="text-[#0B2545] font-bold">{appliedGrades.join(', ')}</span>
                  </span>
                )}
              </span>

              {appliedGrades.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-[#C59B27] hover:text-[#0B2545] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Show All</span>
                </button>
              )}
            </div>

            {/* Empty State */}
            {filteredNotices.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 sm:p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-200/70 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-800">
                  No notices found for the selected grades.
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  There are currently no active announcements or circulars matching your selected grade filter.
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="inline-flex items-center gap-1.5 bg-[#0B2545] hover:bg-[#133E6E] text-white text-xs font-bold py-2 px-4 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear Filters &amp; View All</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Vertically Stacked List */
              <div className="space-y-3">
                {filteredNotices.map((notice) => {
                  const isExpanded = expandedId === notice.id;

                  return (
                    <article
                      key={notice.id}
                      className={`border rounded-xl bg-white transition-all overflow-hidden ${
                        isExpanded
                          ? 'border-[#C59B27] shadow-md ring-1 ring-[#C59B27]/30'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Notice Row Summary (Clickable Disclosure Trigger) */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(notice.id)}
                        aria-expanded={isExpanded}
                        aria-controls={`notice-content-${notice.id}`}
                        className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer focus:outline-none focus:bg-slate-50/50 group"
                      >
                        <div className="flex-1 min-w-0">
                          {/* Metadata Badges Row */}
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-[#0B2545] border border-slate-200">
                              {notice.category}
                            </span>

                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#C59B27]" />
                              <span>{notice.date}</span>
                            </span>

                            {notice.isNew && (
                              <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide">
                                New Circular
                              </span>
                            )}

                            {/* Grade Applicability Tag */}
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded">
                              {notice.grades.includes('All Grades')
                                ? 'All Grades'
                                : notice.grades.join(', ')}
                            </span>
                          </div>

                          {/* Notice Title (Primary Element) */}
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#0B2545] transition-colors leading-snug">
                            {notice.title}
                          </h4>
                        </div>

                        {/* Chevron Indicator */}
                        <div className={`p-1.5 rounded-full transition-transform duration-200 shrink-0 ${
                          isExpanded ? 'bg-amber-100 text-[#C59B27] rotate-180' : 'bg-slate-100 text-slate-400 group-hover:text-slate-700'
                        }`}>
                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                      </button>

                      {/* Expanded Content Area */}
                      {isExpanded && (
                        <div
                          id={`notice-content-${notice.id}`}
                          className="px-4 sm:px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/70 text-slate-700 animate-fadeIn"
                        >
                          {/* Full Description / Notice Details */}
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
                            {notice.description ||
                              'Official administration notice and detailed academic guidelines. Please refer to the document attachment or contact the school administrative desk for further inquiries.'}
                          </p>

                          {/* Metadata & Actions Footer */}
                          <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex flex-wrap items-center gap-2 text-slate-500">
                              <span className="font-medium">Applicability:</span>
                              <div className="flex flex-wrap gap-1">
                                {notice.grades.map((grade) => (
                                  <span
                                    key={grade}
                                    className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold"
                                  >
                                    {grade}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* PDF Download Button (Works independently) */}
                            {notice.hasAttachment && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`Downloading official circular PDF: "${notice.title}"`);
                                }}
                                className="inline-flex items-center gap-1.5 bg-[#0B2545] hover:bg-[#133E6E] text-white font-bold text-xs py-1.5 px-3 rounded-lg shadow-xs transition-colors cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5 text-[#F6D55C]" />
                                <span>Download PDF {notice.fileSize ? `(${notice.fileSize})` : ''}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
