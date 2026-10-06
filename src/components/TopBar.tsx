import React from 'react';
import { Phone, Mail, CreditCard } from 'lucide-react';

interface TopBarProps {
  onOpenFee: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenFee }) => {
  return (
    <div className="bg-[#0B2545] text-slate-100 text-xs border-b border-[#1E3A8A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Only Mobile Number & Email */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <div className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors">
            <Phone className="w-3.5 h-3.5 text-[#F6D55C]" />
            <span>+91 251 2230001 / 2230002</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors">
            <Mail className="w-3.5 h-3.5 text-[#F6D55C]" />
            <span>info@mjschoolkalyan.edu.in</span>
          </div>
        </div>

        {/* Only Pay Fees Online Button */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          <button
            onClick={onOpenFee}
            className="flex items-center gap-1.5 bg-[#C59B27] hover:bg-[#b58b19] text-[#0B2545] font-bold px-3 py-1 rounded transition-colors shadow-sm"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#0B2545]" />
            <span>Pay Fees Online</span>
          </button>
        </div>
      </div>
    </div>
  );
};
