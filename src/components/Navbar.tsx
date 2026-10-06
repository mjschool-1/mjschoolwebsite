import React, { useState } from 'react';
import { MAIN_NAV_ITEMS } from '../data/schoolData';
import { Menu, X, ChevronDown, Sparkles } from 'lucide-react';

interface NavbarProps {
  onSelectNav: (target: 'fee-structure' | 'about-school') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectNav }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleItemClick = (href: string) => {
    if (href === '#fee-structure') {
      onSelectNav('fee-structure');
    } else if (href === '#about-school') {
      onSelectNav('about-school');
    } else {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  return (
    <nav className="bg-[#0B2545] text-white sticky top-0 z-40 shadow-md border-b-2 border-[#C59B27]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          
          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-0.5">
            {MAIN_NAV_ITEMS.map((item) => (
              <div
                key={item.name}
                className="relative group py-2"
                onMouseEnter={() => setOpenDropdown(item.name)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <a
                  href={item.href}
                  onClick={(e) => {
                    if (item.children) {
                      e.preventDefault();
                    } else {
                      handleItemClick(item.href);
                    }
                  }}
                  className="px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-100 hover:text-[#F6D55C] hover:bg-[#133E6E] rounded transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {item.name}
                  {item.children && (
                    <ChevronDown className="w-3 h-3 text-slate-300 group-hover:text-[#F6D55C] transition-transform duration-200 group-hover:rotate-180" />
                  )}
                </a>

                {/* Dropdown Hover Window / Menu */}
                {item.children && (
                  <div
                    className={`absolute left-0 top-full w-64 bg-white text-slate-800 rounded-b-lg shadow-2xl border-t-2 border-[#C59B27] py-2 z-50 transition-all duration-200 transform origin-top ${
                      openDropdown === item.name
                        ? 'opacity-100 scale-100 pointer-events-auto'
                        : 'opacity-0 scale-95 pointer-events-none hidden'
                    }`}
                  >
                    <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100 mb-1">
                      {item.name} Options
                    </div>
                    {item.children.map((subItem) => (
                      <a
                        key={subItem.name}
                        href={subItem.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleItemClick(subItem.href);
                        }}
                        className="block px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-amber-50/80 hover:text-[#0B2545] border-l-3 border-transparent hover:border-[#C59B27] transition-all cursor-pointer"
                      >
                        {subItem.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Admissions 2025-26 CTA Button */}
          <div className="hidden lg:flex items-center">
            <a
              href="#admissions"
              onClick={(e) => {
                e.preventDefault();
                handleItemClick('#admissions');
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#C59B27] to-[#E0B236] hover:from-[#b58b19] hover:to-[#cda22b] text-[#0B2545] font-black text-xs uppercase tracking-wider px-3.5 py-1.5 rounded shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Admissions 2025-26</span>
            </a>
          </div>

          {/* Mobile menu trigger */}
          <div className="lg:hidden flex items-center justify-between w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F6D55C]">
              MJ School Menu
            </span>
            <div className="flex items-center gap-2">
              <a
                href="#admissions"
                onClick={() => handleItemClick('#admissions')}
                className="bg-[#C59B27] text-[#0B2545] text-[11px] font-black px-2.5 py-1 rounded shadow-sm"
              >
                Admissions
              </a>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded text-white hover:bg-white/10 cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A1F38] border-t border-slate-700 px-4 py-3 space-y-2 max-h-[80vh] overflow-y-auto">
          {MAIN_NAV_ITEMS.map((item) => (
            <div key={item.name} className="py-1">
              <a
                href={item.href}
                onClick={(e) => {
                  if (!item.children) {
                    handleItemClick(item.href);
                  }
                }}
                className="block text-sm font-semibold text-slate-100 hover:text-[#F6D55C] py-1 cursor-pointer"
              >
                {item.name}
              </a>
              {item.children && (
                <div className="pl-4 border-l border-slate-700 space-y-1 mt-1">
                  {item.children.map((sub) => (
                    <a
                      key={sub.name}
                      href={sub.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleItemClick(sub.href);
                      }}
                      className="block text-xs text-slate-300 hover:text-white py-1 cursor-pointer"
                    >
                      {sub.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-2">
            <a
              href="#admissions"
              onClick={() => handleItemClick('#admissions')}
              className="block text-center bg-[#C59B27] text-[#0B2545] font-bold py-2 rounded text-xs uppercase tracking-wider cursor-pointer"
            >
              Admissions 2025-26
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
