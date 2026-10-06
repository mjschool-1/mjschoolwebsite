import React, { useState } from 'react';
import { Logo } from './Logo';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

interface FooterProps {
  onSelectNav: (target: 'fee-structure' | 'about-school') => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectNav }) => {
  const [emailSub, setEmailSub] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailSub) {
      setSubscribed(true);
      setEmailSub('');
    }
  };

  return (
    <footer id="contact" className="bg-[#07172C] text-slate-300 text-xs border-t-4 border-[#C59B27]">
      {/* Upper Footer: 4 Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Col 1: Identity & Crest (No Kalyan box in Logo) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white/95 p-3 rounded-xl inline-block shadow-md">
              <Logo size="md" variant="full" />
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              MJ School is an esteemed English Medium Co-educational institution affiliated with the Central Board of Secondary Education (CBSE). Committed to holistic academic excellence, moral integrity, and modern pedagogical rigor.
            </p>
          </div>

          {/* Col 2: Priority Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider font-serif border-b border-slate-700 pb-2">
              Quick Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectNav('about-school')}
                  className="hover:text-[#F6D55C] transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span className="text-[#C59B27]">▸</span>
                  <strong>About School &amp; Management</strong>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectNav('fee-structure')}
                  className="hover:text-[#F6D55C] transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span className="text-[#C59B27]">▸</span>
                  <strong>Fee Structure &amp; Regulations</strong>
                </button>
              </li>
              <li>
                <a href="#admissions" className="hover:text-[#F6D55C] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C59B27]">▸</span>
                  <span>Admissions Procedure 2025-26</span>
                </a>
              </li>
              <li>
                <a href="#notices" className="hover:text-[#F6D55C] transition-colors flex items-center gap-1.5">
                  <span className="text-[#C59B27]">▸</span>
                  <span>Notices and Circulars</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Campus Location */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider font-serif border-b border-slate-700 pb-2">
              Campus Contact
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#F6D55C] shrink-0 mt-0.5" />
                <span>
                  MJ School Campus, Near Birla College Road, Kalyan (West), District Thane, Maharashtra – 421301.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#F6D55C] shrink-0" />
                <span>+91 251 2230001 / 2230002</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#F6D55C] shrink-0" />
                <span>info@mjschoolkalyan.edu.in</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#F6D55C] shrink-0 mt-0.5" />
                <div>
                  <p>School Office Hours:</p>
                  <p className="text-[11px] text-slate-400">Monday to Saturday: 08:30 AM – 03:30 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Newsletter & Emergency Help */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-white text-sm font-bold uppercase tracking-wider font-serif border-b border-slate-700 pb-2">
              Stay Connected
            </h4>
            <p className="text-[11px] text-slate-400">
              Subscribe for circulars, exam dates, and admission announcements.
            </p>
            {subscribed ? (
              <p className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 p-2 rounded border border-emerald-800">
                Subscribed successfully!
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-1.5">
                <input
                  type="email"
                  required
                  placeholder="Enter email address"
                  value={emailSub}
                  onChange={(e) => setEmailSub(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white placeholder-slate-500 outline-none focus:border-[#C59B27]"
                />
                <button
                  type="submit"
                  className="w-full bg-[#C59B27] hover:bg-[#b58b19] text-[#0B2545] font-bold py-1.5 px-3 rounded text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Subscribe</span>
                </button>
              </form>
            )}
            <div className="pt-2 text-[10px] text-slate-400">
              Student Helpline: <br />
              <strong className="text-white text-xs">+91 251 2230009</strong>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#040D1A] py-4 border-t border-slate-800 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} MJ School, Kalyan. All Rights Reserved. Affiliated to CBSE.
          </p>
          <div className="flex items-center gap-4">
            <a href="#about-school" className="hover:text-slate-300">Privacy Policy</a>
            <span>•</span>
            <a href="#about-school" className="hover:text-slate-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
