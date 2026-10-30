import React, { useState, useRef, useEffect } from 'react';
import { MAIN_NAV_ITEMS, ADMISSIONS_CTA } from '../data/schoolData';
import { Menu, X, ChevronDown, Sparkles, CreditCard } from 'lucide-react';

interface NavbarProps {
  onSelectNav?: (target: 'fee-structure' | 'about-school') => void;
  pathname?: string;
}

export function getCleanPath(rawPath: string): string {
  if (!rawPath) return '/';
  return (
    rawPath
      .split('?')[0]
      .split('#')[0]
      .toLowerCase()
      .replace(/\/index\.html$/, '')
      .replace(/\/+$/, '') || '/'
  );
}

export function isHomepageRoute(rawPath: string): boolean {
  return getCleanPath(rawPath) === '/';
}

export function isActionButtonsAllowed(rawPath: string): boolean {
  const cleanPath = getCleanPath(rawPath);
  return (
    cleanPath === '/' ||
    cleanPath === '/admissions/fee-payment-2026' ||
    cleanPath === '/admissions/fee-structure'
  );
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectNav, pathname }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (pathname) return pathname;
    if (typeof window !== 'undefined') return window.location.pathname;
    return '';
  });
  const navRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const effectivePath = currentPath || pathname || '';
  const isHomepage = isHomepageRoute(effectivePath);
  const showButtons = isActionButtonsAllowed(effectivePath);

  // Lock background scroll when mobile drawer is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (mobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [mobileMenuOpen]);

  // Expand active route category when drawer opens
  useEffect(() => {
    if (mobileMenuOpen && currentPath) {
      const activeCategory = MAIN_NAV_ITEMS.find((item) =>
        item.children?.some(
          (c) => currentPath === c.href || (c.href !== '/' && currentPath.startsWith(c.href))
        )
      );
      if (activeCategory) {
        setExpandedMobileCategory(activeCategory.name);
      }
    }
  }, [mobileMenuOpen, currentPath]);

  // Global Escape key listener to close drawer and dropdowns
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
        if (openDropdown) {
          setOpenDropdown(null);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [mobileMenuOpen, openDropdown]);

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

  // Keyboard accessibility for desktop dropdowns
  const handleKeyDown = (e: React.KeyboardEvent, name: string) => {
    if (e.key === 'Escape') {
      setOpenDropdown(null);
    } else if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpenDropdown(name);
    }
  };

  // Close desktop dropdown on outside click
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

  const renderDesktopNavItems = () => (
    <div className="flex items-center space-x-1 xl:space-x-2">
      {MAIN_NAV_ITEMS.map((item) => {
        const isOpen = openDropdown === item.name;
        const isCategoryActive = item.children?.some(
          (c) => currentPath === c.href || (c.href !== '/' && currentPath.startsWith(c.href))
        );

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
                isOpen || isCategoryActive
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
                  {item.children.map((subItem) => {
                    const isLinkActive =
                      currentPath === subItem.href ||
                      (subItem.href !== '/' && currentPath.startsWith(subItem.href));

                    return (
                      <a
                        key={subItem.name}
                        href={subItem.href}
                        role="menuitem"
                        onClick={() => {
                          setOpenDropdown(null);
                        }}
                        className={`block px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                          isLinkActive
                            ? 'bg-amber-50 text-[#0B2545] border-l-3 border-[#C59B27] font-bold'
                            : 'text-slate-700 hover:bg-amber-50 hover:text-[#0B2545] border-l-3 border-transparent hover:border-[#C59B27]'
                        } focus:outline-none focus:bg-amber-50 focus:border-[#C59B27] focus:text-[#0B2545]`}
                      >
                        {subItem.name}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderDesktopActionButtons = () => (
    <div className="flex items-center gap-2 xl:gap-2.5 shrink-0">
      {/* Pay Fees Online */}
      {onSelectNav ? (
        <button
          type="button"
          onClick={() => onSelectNav('fee-structure')}
          className="flex items-center gap-1.5 bg-[#0A1F38] hover:bg-[#133E6E] text-[#F6D55C] border border-[#C59B27]/80 hover:border-[#F6D55C] text-xs font-bold uppercase tracking-wider px-3 xl:px-3.5 py-2 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F6D55C] cursor-pointer"
        >
          <CreditCard className="w-3.5 h-3.5 text-[#F6D55C]" />
          <span>Pay Fees Online</span>
        </button>
      ) : (
        <a
          href="/admissions/fee-payment-2026/"
          className="flex items-center gap-1.5 bg-[#0A1F38] hover:bg-[#133E6E] text-[#F6D55C] border border-[#C59B27]/80 hover:border-[#F6D55C] text-xs font-bold uppercase tracking-wider px-3 xl:px-3.5 py-2 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F6D55C] cursor-pointer"
        >
          <CreditCard className="w-3.5 h-3.5 text-[#F6D55C]" />
          <span>Pay Fees Online</span>
        </a>
      )}

      {/* Admissions 2026 CTA */}
      <a
        href={ADMISSIONS_CTA.href}
        className={`flex items-center gap-1.5 bg-gradient-to-r from-[#C59B27] to-[#E0B236] hover:from-[#b58b19] hover:to-[#cda22b] text-[#0B2545] font-black text-xs uppercase tracking-wider px-3.5 xl:px-4 py-2 rounded-lg shadow-md transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#F6D55C] cursor-pointer ${
          currentPath.startsWith('/admissions/2026') ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0B2545]' : ''
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{ADMISSIONS_CTA.name}</span>
      </a>
    </div>
  );

  return (
    <>
      {isHomepage ? (
        /* 1. HOMEPAGE: Full in-flow sticky navbar with nav items, action buttons & mobile bar */
        <nav
          ref={navRef}
          className="bg-[#0B2545] text-white sticky top-0 z-40 shadow-md border-b-2 border-[#C59B27]"
          aria-label="Main Navigation"
        >
          <div className="max-w-7xl mx-auto px-2.5 min-[360px]:px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              {/* Desktop Nav Items */}
              <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
                {renderDesktopNavItems()}
              </div>

              {/* Desktop Action Buttons */}
              <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0">
                {renderDesktopActionButtons()}
              </div>

              {/* Mobile Action Bar: Admissions 2026, Pay Fees Online, Hamburger */}
              <div className="lg:hidden flex items-center justify-between w-full gap-1.5 min-[360px]:gap-2">
                <div className="flex items-center gap-1.5 min-[360px]:gap-2 shrink min-w-0">
                  {/* Admissions 2026 CTA */}
                  <a
                    href={ADMISSIONS_CTA.href}
                    className="flex items-center gap-1 min-[360px]:gap-1.5 bg-gradient-to-r from-[#C59B27] to-[#E0B236] hover:from-[#b58b19] hover:to-[#cda22b] text-[#0B2545] text-[10.5px] min-[360px]:text-[11.5px] min-[400px]:text-xs font-black px-2 min-[360px]:px-2.5 min-[400px]:px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 shrink-0" />
                    <span>{ADMISSIONS_CTA.name}</span>
                  </a>

                  {/* Pay Fees Online */}
                  {onSelectNav ? (
                    <button
                      type="button"
                      onClick={() => onSelectNav('fee-structure')}
                      className="flex items-center gap-1 min-[360px]:gap-1.5 bg-[#0A1F38] hover:bg-[#133E6E] text-[#F6D55C] border border-[#C59B27] text-[10.5px] min-[360px]:text-[11.5px] min-[400px]:text-xs font-bold px-2 min-[360px]:px-2.5 min-[400px]:px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <CreditCard className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 text-[#F6D55C] shrink-0" />
                      <span>Pay Fees Online</span>
                    </button>
                  ) : (
                    <a
                      href="/admissions/fee-payment-2026/"
                      className="flex items-center gap-1 min-[360px]:gap-1.5 bg-[#0A1F38] hover:bg-[#133E6E] text-[#F6D55C] border border-[#C59B27] text-[10.5px] min-[360px]:text-[11.5px] min-[400px]:text-xs font-bold px-2 min-[360px]:px-2.5 min-[400px]:px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all whitespace-nowrap shrink-0"
                    >
                      <CreditCard className="w-3 h-3 min-[360px]:w-3.5 min-[360px]:h-3.5 text-[#F6D55C] shrink-0" />
                      <span>Pay Fees Online</span>
                    </a>
                  )}
                </div>

                {/* Hamburger Menu Toggle */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-1.5 min-[360px]:p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#F6D55C] cursor-pointer shrink-0"
                  aria-label="Open navigation drawer"
                  aria-controls="mobile-nav-drawer"
                  aria-expanded={mobileMenuOpen}
                >
                  <Menu className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 text-[#F6D55C]" />
                </button>
              </div>
            </div>
          </div>
        </nav>
      ) : (
        /* 2. NON-HOMEPAGE: Desktop nav bar ONLY on lg: screens; ZERO height on mobile */
        <>
          <nav
            ref={navRef}
            className="hidden lg:block bg-[#0B2545] text-white sticky top-0 z-40 shadow-md border-b-2 border-[#C59B27]"
            aria-label="Main Navigation"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`flex items-center ${showButtons ? 'justify-between' : 'justify-start'} h-14`}>
                {renderDesktopNavItems()}
                {showButtons && renderDesktopActionButtons()}
              </div>
            </div>
          </nav>

          {/* Floating Mobile Hamburger Control over Banner Area */}
          <div className="lg:hidden relative z-35 h-0 w-full pointer-events-none">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 pointer-events-auto p-2 min-[360px]:p-2.5 rounded-xl bg-[#0B2545]/90 hover:bg-[#0B2545] text-[#F6D55C] border border-[#C59B27]/70 shadow-xl backdrop-blur-xs focus:outline-none focus:ring-2 focus:ring-[#F6D55C] cursor-pointer active:scale-95 transition-all flex items-center justify-center group"
              aria-label="Open navigation drawer"
              aria-controls="mobile-nav-drawer"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 text-[#F6D55C] group-hover:scale-105 transition-transform" />
            </button>
          </div>
        </>
      )}

      {/* Mobile Off-Canvas Drawer Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 transition-opacity duration-300 lg:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Off-Canvas Sliding Drawer (from right edge) */}
      <aside
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className={`fixed top-0 right-0 bottom-0 z-50 w-[86vw] max-w-sm sm:max-w-md bg-[#07172C] text-white shadow-2xl border-l-2 border-[#C59B27] flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header with School Identity & Close Button */}
        <div className="bg-[#0B2545] px-5 py-4 border-b border-slate-700/80 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white p-1 shrink-0 shadow-sm flex items-center justify-center">
              <img src="/logo.png" alt="MJ School Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-wider text-white font-serif uppercase">
                MJ School
              </span>
              <span className="text-[10px] text-[#F6D55C] font-semibold tracking-wide uppercase">
                CBSE Affiliated • Shahpur
              </span>
              <span className="text-[9.5px] text-slate-300 font-semibold tracking-wider uppercase mt-0.5 font-sans">
                UDISE NUMBER : 27214100866
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F6D55C] cursor-pointer"
            aria-label="Close navigation drawer"
          >
            <X className="w-5 h-5 text-slate-200 hover:text-white" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3.5 overscroll-contain">
          {/* Section Heading */}
          <div className="px-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-800">
            Navigation Menu
          </div>

          {/* Primary Navigation Categories */}
          <div className="space-y-2.5">
            {MAIN_NAV_ITEMS.map((item) => {
              const isExpanded = expandedMobileCategory === item.name;
              const isCategoryActive = item.children?.some(
                (c) => currentPath === c.href || (c.href !== '/' && currentPath.startsWith(c.href))
              );

              return (
                <div
                  key={item.name}
                  className={`rounded-xl overflow-hidden border transition-all ${
                    isExpanded
                      ? 'border-[#C59B27]/70 bg-[#0B2545] shadow-md'
                      : isCategoryActive
                      ? 'border-[#C59B27]/40 bg-[#0B2545]/80'
                      : 'border-slate-700/60 bg-[#0B2545]/50 hover:border-slate-600'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedMobileCategory(isExpanded ? null : item.name)
                    }
                    aria-expanded={isExpanded}
                    aria-controls={`submenu-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className={`w-full flex items-center justify-between px-4 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-left transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#F6D55C] ${
                      isExpanded || isCategoryActive
                        ? 'text-[#F6D55C]'
                        : 'text-slate-100 hover:text-[#F6D55C]'
                    }`}
                  >
                    <span>{item.name}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-[#F6D55C]' : ''
                      }`}
                    />
                  </button>

                  {/* Expandable Submenu Card */}
                  {isExpanded && item.children && (
                    <div
                      id={`submenu-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      className="bg-[#07172C] border-t border-slate-700/80 divide-y divide-slate-800/80"
                    >
                      {item.children.map((sub) => {
                        const isLinkActive =
                          currentPath === sub.href ||
                          (sub.href !== '/' && currentPath.startsWith(sub.href));

                        return (
                          <a
                            key={sub.name}
                            href={sub.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center justify-between min-h-[44px] px-5 py-3 text-xs sm:text-sm font-semibold transition-colors ${
                              isLinkActive
                                ? 'bg-amber-500/15 text-[#F6D55C] border-l-4 border-[#C59B27] font-bold'
                                : 'text-slate-300 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
                            }`}
                          >
                            <span>{sub.name}</span>
                            <span className="text-slate-500 text-xs">→</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Admissions 2026 Prominent CTA Card */}
          <div className="pt-3 pb-4">
            <a
              href={ADMISSIONS_CTA.href}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#C59B27] via-[#D8AD32] to-[#E0B236] hover:from-[#b58b19] hover:to-[#cda22b] text-[#0B2545] font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-[#F6D55C]"
            >
              <Sparkles className="w-4 h-4 text-[#0B2545]" />
              <span>Apply for {ADMISSIONS_CTA.name}</span>
            </a>
          </div>
        </div>

        {/* Drawer Footer Utility */}
        <div className="bg-[#040D1A] px-5 py-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
          <span>CBSE Affiliated Institution</span>
          <a
            href="/admissions/fee-payment-2026/"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#F6D55C] hover:underline font-semibold"
          >
            Pay Fees Online →
          </a>
        </div>
      </aside>
    </>
  );
};
