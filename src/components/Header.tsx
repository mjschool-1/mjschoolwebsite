import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { Search, X } from 'lucide-react';

interface HeaderProps {
  onSelectNav: (target: 'fee-structure' | 'about-school') => void;
}

export const Header: React.FC<HeaderProps> = ({ onSelectNav }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Search items database
  const searchableContent = [
    { title: 'Fee Structure & Payment Schedule 2025-26', type: 'Admissions', target: 'fee-structure' as const, desc: 'Interactive fee calculator, quarterly dues and online payment portal' },
    { title: 'About MJ School History & Philosophy', type: 'About Us', target: 'about-school' as const, desc: 'Vision, Mission, Leadership & CBSE Affiliation' },
    { title: 'Online Admission Registration 2025-26', type: 'Admissions', target: 'fee-structure' as const, desc: 'Eligibility, documents required, and online application form' },
    { title: "Principal's Desk Message", type: 'About Us', target: 'about-school' as const, desc: 'Message from the Principal' },
    { title: 'School Circulars & Examination Schedule', type: 'Notices', target: 'about-school' as const, desc: 'Download official circulars and academic calendar' },
  ];

  const filteredResults = searchQuery.trim() === ''
    ? []
    : searchableContent.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 lg:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Left: School Logo & Identity */}
          <div className="flex items-center justify-between">
            <a href="#home" className="group">
              <Logo size="md" variant="full" />
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
              {showSearchResults && searchQuery.trim() !== '' && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Search Results ({filteredResults.length})
                    </span>
                    <button
                      onClick={() => setShowSearchResults(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  {filteredResults.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {filteredResults.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            onSelectNav(item.target);
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="w-full px-3.5 py-2.5 text-left hover:bg-amber-50/50 flex items-start justify-between group transition-colors cursor-pointer"
                        >
                          <div>
                            <span className="text-xs font-semibold text-[#0B2545] group-hover:text-[#C59B27] block transition-colors">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              {item.desc}
                            </span>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-2 shrink-0">
                            {item.type}
                          </span>
                        </button>
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
