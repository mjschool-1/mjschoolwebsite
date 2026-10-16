import React, { useState, useRef, useEffect } from 'react';
import { MAIN_NAV_ITEMS, ADMISSIONS_CTA } from '../data/schoolData';
import { Menu, X, ChevronDown, Sparkles } from 'lucide-react';

interface NavbarProps {
  onSelectNav?: (target: 'fee-structure' | 'about-school') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectNav }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resolveHref = (href: string) => {
    const base = import.meta.env.BASE_URL || '/';
    if (href.startsWith('http') || href.startsWith('#')) return href;
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
    const cleanHref = href.startsWith('/') ? href : `/${href}`;
    return `${cleanBase}${cleanHref}`;
  };

  const handleMouseEnter = (name: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(name);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent, name: string) => {
    if (e.key === 'Escape') {
      setOpenDropdown(null);
    } else if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpenDropdown(name);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      className="bg-[#0B2545] text-white sticky top-0 z-40 shadow-md border-b-2 border-[#C59B27]"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {MAIN_NAV_ITEMS.map((item) => {
              const isOpen = openDropdown === item.name;
              return (
                <div
                  key={item.name}
                  className="relative py-2"
                  onMouseEnter={() => handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => toggleDropdown(item.name)}
                    onKeyDown={(e) => handleKeyDown(e, item.name)}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    className={`px-3 py-2 text-xs xl:text-[13px] font-semibold uppercase tracking-wider rounded-md transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F6D55C] ${
                      isOpen
                        ? 'text-[#F6D55C] bg-[#133E6E]'
                        : 'text-slate-100 hover:text-[#F6D55C] hover:bg-[#133E6E]'
                    }`}
                  >
                    <span>{item.name}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#F6D55C]' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {item.children && (
                    <div
                      role="menu"
                      aria-label={`${item.name} submenu`}
                      className={`absolute left-0 top-full pt-1 z-50 transition-all duration-200 ${
                        isOpen
                          ? 'opacity-100 scale-100 pointer-events-auto block'
                          : 'opacity-0 scale-95 pointer-events-none hidden'
                      }`}
                      onMouseEnter={() => handleMouseEnter(item.name)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="w-60 bg-white text-slate-800 rounded-lg shadow-2xl border-t-2 border-[#C59B27] py-2 border border-slate-200">
                        <div className="px-3.5 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100 mb-1">
                          {item.name}
                        </div>
                        {item.children.map((subItem) => (
                          <a
                            key={subItem.name}
                            href={resolveHref(subItem.href)}
                            role="menuitem"
                            onClick={() => {
                              setOpenDropdown(null);
                            }}
                            className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-[#0B2545] border-l-3 border-transparent hover:border-[#C59B27] focus:outline-none focus:bg-amber-50 focus:border-[#C59B27] focus:text-[#0B2545] transition-all cursor-pointer"
                          >
                            {subItem.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Admissions 2026 CTA Button (Desktop) */}
          <div className="hidden lg:flex items-center">
            <a
              href={resolveHref(ADMISSIONS_CTA.href)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#C59B27] to-[#E0B236] hover:from-[#b58b19] hover:to-[#cda22b] text-[#0B2545] font-black text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-md transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F6D55C] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{ADMISSIONS_CTA.name}</span>
            </a>
          </div>

          {/* Mobile Bar Trigger */}
          <div className="lg:hidden flex items-center justify-between w-full">
            <a
              href={resolveHref(ADMISSIONS_CTA.href)}
              className="flex items-center gap-1 bg-[#C59B27] text-[#0B2545] text-xs font-black px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all"
            >
              <Sparkles className="w-3 h-3" />
              <span>{ADMISSIONS_CTA.name}</span>
            </a>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#F6D55C] cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-[#F6D55C]" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Collapsible Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A1F38] border-t border-slate-700 px-4 py-4 space-y-3 max-h-[80vh] overflow-y-auto">
          {MAIN_NAV_ITEMS.map((item) => {
            const isExpanded = expandedMobileCategory === item.name;
            return (
              <div key={item.name} className="border-b border-slate-700/60 pb-2">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedMobileCategory(isExpanded ? null : item.name)
                  }
                  className="w-full flex items-center justify-between py-2 text-sm font-bold uppercase tracking-wider text-slate-100 hover:text-[#F6D55C] text-left"
                  aria-expanded={isExpanded}
                >
                  <span>{item.name}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-[#F6D55C]' : ''
                    }`}
                  />
                </button>

                {isExpanded && item.children && (
                  <div className="pl-3 space-y-1 mt-1 border-l-2 border-[#C59B27]/60">
                    {item.children.map((sub) => (
                      <a
                        key={sub.name}
                        href={resolveHref(sub.href)}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-xs font-medium text-slate-300 hover:text-white py-1.5 px-2 rounded hover:bg-white/5 transition-colors"
                      >
                        {sub.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Prominent Admissions CTA in Drawer */}
          <div className="pt-2">
            <a
              href={resolveHref(ADMISSIONS_CTA.href)}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center bg-gradient-to-r from-[#C59B27] to-[#E0B236] text-[#0B2545] font-black py-2.5 rounded-lg text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
            >
              Apply for {ADMISSIONS_CTA.name}
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
