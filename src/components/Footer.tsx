import React from 'react';
import { Logo } from './Logo';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

interface FooterProps {
  onSelectNav?: (target: 'fee-structure' | 'about-school') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectNav }) => {
  return (
    <footer id="contact" className="bg-[#07172C] text-slate-300 text-xs border-t-4 border-[#C59B27]">
      {/* Upper Footer: 3 Columns cleanly balanced on desktop and stacked on mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Col 1: Identity & Crest */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white/95 p-3 rounded-xl inline-block shadow-md">
              <Logo size="md" variant="full" />
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              MJ School is an esteemed English Medium Co-educational institution affiliated with the Central Board of Secondary Education (CBSE). Committed to holistic academic excellence, moral integrity, and modern pedagogical rigor.
            </p>
          </div>

          {/* Col 2: Priority Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider font-serif border-b border-slate-700 pb-2">
              Quick Portals
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href="/about/principals-message/"
                  className="hover:text-[#F6D55C] transition-colors flex items-center gap-1.5 text-left"
                >
                  <span className="text-[#C59B27]">▸</span>
                  <strong>About School &amp; Management</strong>
                </a>
              </li>
              <li>
                <a
                  href="/admissions/fee-structure/"
                  className="hover:text-[#F6D55C] transition-colors flex items-center gap-1.5 text-left"
                >
                  <span className="text-[#C59B27]">▸</span>
                  <strong>Fee Structure &amp; Regulations</strong>
                </a>
              </li>
              <li>
                <a href="/admissions/2026/" className="hover:text-[#F6D55C] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C59B27]">▸</span>
                  <span>Admissions 2026</span>
                </a>
              </li>
              <li>
                <a href="/notices/" className="hover:text-[#F6D55C] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C59B27]">▸</span>
                  <span>Notices and Circulars</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Campus Contact */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider font-serif border-b border-slate-700 pb-2">
              Campus Contact
            </h4>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#F6D55C] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Manas Tulsi Valley, Tambadmal Road, Shahapur, Maharashtra 421601
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#F6D55C] shrink-0" />
                <a
                  href="tel:+918652270204"
                  className="hover:text-[#F6D55C] transition-colors"
                >
                  +91 86522 70204
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#F6D55C] shrink-0" />
                <a
                  href="mailto:admin@mjschool.in"
                  className="hover:text-[#F6D55C] transition-colors"
                >
                  admin@mjschool.in
                </a>
              </div>
              <div className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-[#F6D55C] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">School Office Hours:</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Monday to Saturday, 9:30 AM – 3:00 PM</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#040D1A] py-4 border-t border-slate-800 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>
            © 2026 MJ School, Shahapur. All Rights Reserved. Affiliated to CBSE.
          </p>
          <div className="flex items-center gap-4">
            <a href="/privacy-policy/" className="hover:text-slate-300">Privacy Policy</a>
            <span>•</span>
            <a href="/terms-and-conditions/" className="hover:text-slate-300">Terms and Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
