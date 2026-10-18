import React, { useState, useEffect } from 'react';
import { getPublishedNotices, DEFAULT_NOTICES, NoticeRecord } from '../lib/supabase';
import { Download, ChevronDown, Check, RotateCcw } from 'lucide-react';

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
  // Notices state fetched from Supabase (with DEFAULT_NOTICES fallback)
  const [notices, setNotices] = useState<NoticeRecord[]>(DEFAULT_NOTICES);

  // Filter states: pending checkbox selection vs applied filter selection
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [appliedGrades, setAppliedGrades] = useState<string[]>([]);
  
  // Expanded notice item state (supports toggle per item)
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  // Mobile filter collapse toggle
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadNotices() {
      try {
        const records = await getPublishedNotices();
        if (isMounted && records && records.length > 0) {
          setNotices(records);
        }
      } catch (err) {
        console.warn('[NoticeBoard] Failover: retaining default notices.', err);
      }
    }
    loadNotices();
    return () => {
      isMounted = false;
    };
  }, []);

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

  const toggleExpand = (id: string | number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Filter notices logic: matches any applied grade, or notices marked for 'All Grades'
  const filteredNotices = notices.filter((notice) => {
    if (appliedGrades.length === 0) return true; // All Grades
    const noticeGrades = Array.isArray(notice.grades) ? notice.grades : ['All Grades'];
    if (noticeGrades.includes('All Grades')) return true;
    return appliedGrades.some((g) => noticeGrades.includes(g));
  });

  return (
    <section id="notices" className="py-12 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading - Editorial, Institutional */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-0.5 bg-[#C59B27] inline-block"></span>
            <span className="text-[11px] font-bold text-[#C59B27] tracking-wider uppercase">
              School Notice Board
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2545] font-serif tracking-tight">
            Notices &amp; Events
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-normal">
            Stay informed about school announcements, academic updates and upcoming events.
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* Left Sidebar: Filter by Grade (~240-260px wide) */}
          <aside className="w-full lg:w-60 xl:w-64 shrink-0">
            <div className="bg-slate-50/70 border border-slate-200/90 rounded-lg p-4 sm:p-5">
              
              {/* Header / Mobile Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#0B2545] uppercase tracking-wider">
                    Filter by Grade
                  </h3>
                  {appliedGrades.length > 0 && (
                    <span className="text-[11px] text-[#C59B27] font-medium block mt-0.5">
                      {appliedGrades.length} selected
                    </span>
                  )}
                </div>

                {/* Mobile Expand/Collapse Button */}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                  className="lg:hidden p-1 text-slate-500 hover:text-slate-800 rounded transition-colors cursor-pointer"
                  aria-label={mobileFilterOpen ? 'Collapse grade filter' : 'Expand grade filter'}
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileFilterOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Filter Content (Always visible on desktop, toggleable on mobile) */}
              <div className={`${mobileFilterOpen ? 'block' : 'hidden'} lg:block mt-3 pt-3 border-t border-slate-200/80 space-y-2`}>
                
                {/* "All Grades" Option */}
                <button
                  type="button"
                  onClick={handleSelectAllGrades}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    selectedGrades.length === 0
                      ? 'text-[#0B2545] font-bold bg-amber-50/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span>All Grades</span>
                  {selectedGrades.length === 0 && <Check className="w-3.5 h-3.5 text-[#C59B27]" />}
                </button>

                {/* Checkbox Options List */}
                <div className="space-y-0.5 pt-0.5">
                  {FILTERABLE_GRADES.map((grade) => {
                    const isChecked = selectedGrades.includes(grade);
                    return (
                      <label
                        key={grade}
                        className={`flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer select-none transition-colors ${
                          isChecked
                            ? 'text-[#0B2545] font-semibold bg-amber-50/50'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleGradeSelection(grade)}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-[#0B2545] focus:ring-[#C59B27] cursor-pointer"
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
                <div className="pt-3 border-t border-slate-200/80 space-y-1.5">
                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    className="w-full bg-[#0B2545] hover:bg-[#133E6E] text-white font-semibold text-xs py-2 px-3 rounded transition-colors cursor-pointer text-center"
                  >
                    Apply Filters
                  </button>

                  {(selectedGrades.length > 0 || appliedGrades.length > 0) && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="w-full text-slate-500 hover:text-[#0B2545] text-[11px] font-medium py-1 px-2 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>

              </div>

            </div>
          </aside>

          {/* Main Content Area: Continuous School Notice Board List */}
          <div className="flex-1 min-w-0 w-full">
            
            {/* Unified Notice Board Container */}
            <div className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
              
              {/* Header Bar with Count & Active Filter Indicator */}
              <div className="px-4 sm:px-6 py-3 bg-slate-50/60 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing <strong className="text-slate-700">{filteredNotices.length}</strong> {filteredNotices.length === 1 ? 'notice' : 'notices'}
                  {appliedGrades.length > 0 && (
                    <span className="ml-1 text-slate-500">
                      for <strong className="text-[#0B2545]">{appliedGrades.join(', ')}</strong>
                    </span>
                  )}
                </span>

                {appliedGrades.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-xs text-[#C59B27] hover:text-[#0B2545] font-semibold cursor-pointer underline underline-offset-2"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Empty State */}
              {filteredNotices.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    No notices found for the selected grades.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#0B2545] hover:text-[#C59B27] underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear filters and show all notices</span>
                  </button>
                </div>
              ) : (
                /* Continuous List Separated by Subtle Dividers */
                <div className="divide-y divide-slate-100">
                  {filteredNotices.map((notice) => {
                    const isExpanded = expandedId === notice.id;

                    return (
                      <div
                        key={notice.id}
                        className={`transition-colors ${
                          isExpanded ? 'bg-amber-50/25' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        {/* Notice Row (Clickable Disclosure Trigger) */}
                        <button
                          type="button"
                          onClick={() => toggleExpand(notice.id)}
                          aria-expanded={isExpanded}
                          aria-controls={`notice-body-${notice.id}`}
                          className="w-full text-left px-4 sm:px-6 py-4 flex items-start justify-between gap-4 cursor-pointer focus:outline-none focus:bg-slate-50 group"
                        >
                          {/* Desktop: Horizontal layout with aligned Date/Category and Title */}
                          <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-baseline gap-1 md:gap-6">
                            
                            {/* Date & Category (Aligned Column on Desktop) */}
                            <div className="shrink-0 md:w-32 text-left">
                              <span className="text-xs font-semibold text-slate-700 block">
                                {notice.date}
                              </span>
                              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">
                                {notice.category}
                              </span>
                            </div>

                            {/* Title & "New" Indicator */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline flex-wrap gap-2">
                                <h4 className="text-sm sm:text-[15px] font-bold text-[#0B2545] group-hover:text-[#C59B27] transition-colors leading-snug">
                                  {notice.title}
                                </h4>
                                {(notice.is_new ?? (notice as any).isNew) && (
                                  <span className="inline-block text-[9.5px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-1.5 py-0.2 rounded shrink-0">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>

                          </div>

                          {/* Understated Chevron Indicator */}
                          <div className="shrink-0 pt-0.5">
                            <ChevronDown
                              className={`w-4 h-4 text-slate-400 group-hover:text-[#0B2545] transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-[#C59B27]' : ''
                              }`}
                            />
                          </div>
                        </button>

                        {/* Inline Expanded Details */}
                        {isExpanded && (
                          <div
                            id={`notice-body-${notice.id}`}
                            className="px-4 sm:px-6 pb-5 pt-1 text-slate-700 border-t border-slate-100/80 bg-slate-50/50"
                          >
                            <div className="md:pl-38">
                              {/* Notice Description */}
                              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal mb-3.5">
                                {notice.description ||
                                  'Official administration notice and detailed academic guidelines. Please refer to the document attachment or contact the school administrative desk for further inquiries.'}
                              </p>

                              {/* Footer Actions: Applicability & Attachment */}
                              <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2.5 border-t border-slate-200/60">
                                <div className="text-slate-500 text-[11.5px]">
                                  <span>Applicable to: </span>
                                  <span className="font-semibold text-slate-700">
                                    {(Array.isArray(notice.grades) ? notice.grades : ['All Grades']).join(', ')}
                                  </span>
                                </div>

                                {Boolean((notice.has_attachment ?? (notice as any).hasAttachment) && notice.attachment_url?.trim()) && (
                                  <a
                                    href={notice.attachment_url!.trim()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B2545] hover:text-[#C59B27] py-1 px-2.5 rounded bg-white border border-slate-200 hover:border-[#C59B27] shadow-2xs transition-colors cursor-pointer"
                                    title="Download Circular PDF"
                                  >
                                    <Download className="w-3.5 h-3.5 text-[#C59B27]" />
                                    <span>Download Circular {(notice.file_size || (notice as any).fileSize) ? `(${notice.file_size || (notice as any).fileSize})` : ''}</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
