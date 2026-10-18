import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { Search, X } from 'lucide-react';

interface HeaderProps {
  onSelectNav?: (target: 'fee-structure' | 'about-school') => void;
}

export const Header: React.FC<HeaderProps> = ({ onSelectNav }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Search items database
  const searchableContent = [
    { title: 'Fee Structure & Payment Schedule 2026', type: 'Admissions', href: '/admissions/fee-structure/', desc: 'Interactive fee calculator, quarterly dues and fee details' },
    { title: 'Fee Payment Portal 2026', type: 'Admissions', href: '/admissions/fee-payment-2026/', desc: 'Quarterly dues, net banking, UPI and card payments' },
    { title: 'About MJ School History & Philosophy', type: 'About Us', href: '/about/principals-message/', desc: 'Vision, Mission, Leadership & CBSE Affiliation' },
    { title: 'Online Admission Registration 2026', type: 'Admissions', href: '/admissions/2026/', desc: 'Eligibility, documents required, and online application form' },
    { title: "Head Mistress's Desk Message", type: 'About Us', href: '/about/principals-message/', desc: 'Message from the Head Mistress' },
    { title: 'Campus Infrastructure & Smart Classrooms', type: 'About Us', href: '/about/infrastructure/', desc: 'State-of-the-art campus, digital labs, and secure premises' },
    { title: 'School Facilities & Sports Complex', type: 'Facilities', href: '/facilities/', desc: 'Laboratories, library, sports grounds, and transportation' },
    { title: 'Faculty & Academic Staff', type: 'About Us', href: '/about/faculty-staff/', desc: 'Qualified educators and academic departments' },
    { title: 'Academic Syllabus & Curriculum', type: 'Academics', href: '/academics/syllabus/', desc: 'CBSE syllabus guidelines and grading structure' },
    { title: 'School Circulars & Examination Schedule', type: 'Notices', href: '/notices/', desc: 'Download official circulars and academic calendar' },
    { title: 'Frequently Asked Questions (FAQs)', type: 'Notices', href: '/faqs/', desc: 'Common queries regarding admissions, transport and timings' },
  ];

  const filteredResults = searchQuery.trim() === ''
    ? []
    : searchableContent.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const isSearchOpen = showSearchResults && searchQuery.trim() !== '';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className={`bg-white border-b border-gray-200 shadow-sm relative transition-all ${isSearchOpen ? 'z-50' : 'z-30'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 lg:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          
          {/* Left: School Logo & Identity */}
          <div className="flex items-center">
            <a href="/" className="group flex items-center" aria-label="MJ School Home">
              <Logo size="header" variant="full" />
            </a>
          </div>

          {/* Right: Search Bar */}
          <div className="w-full md:max-w-md lg:max-w-lg">
            <div ref={searchContainerRef} className="relative w-full">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  placeholder="Search notices, fees, admissions, curriculum..."
                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#0B2545] focus:bg-white text-sm text-slate-800 rounded-lg pl-10 pr-9 py-2.5 outline-none transition-all shadow-inner placeholder:text-slate-400 focus:ring-2 focus:ring-[#0B2545]/15"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
              {isSearchOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden z-50">
                  <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Search Results ({filteredResults.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSearchResults(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-medium px-1 py-0.5 rounded hover:bg-slate-200/50 transition-colors"
                      aria-label="Close search results"
                    >
                      Close
                    </button>
                  </div>
                  {filteredResults.length > 0 ? (
                    <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto divide-y divide-slate-100 overscroll-contain">
                      {filteredResults.map((item, idx) => (
                        <a
                          key={idx}
                          href={item.href}
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="block w-full px-3.5 py-2.5 text-left hover:bg-amber-50/60 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-semibold text-[#0B2545] group-hover:text-[#C59B27] block transition-colors leading-snug">
                                {item.title}
                              </span>
                              <span className="text-[11px] text-slate-500 block mt-0.5 leading-snug">
                                {item.desc}
                              </span>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                              {item.type}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No exact results found for "{searchQuery}". Try searching "fees" or "admissions".
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
