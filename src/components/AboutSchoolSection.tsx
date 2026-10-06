import React from 'react';
import { Target, Compass, Heart, Quote } from 'lucide-react';

export const AboutSchoolSection: React.FC = () => {
  return (
    <section id="about-school" className="py-12 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (without Legacy of excellence pill) */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] font-serif">
            About MJ School, Kalyan
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            A premier co-educational institution committed to academic brilliance, moral integrity, and progressive Indian values.
          </p>
        </div>

        {/* Overview & Key Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          
          <div className="lg:col-span-7 space-y-4 text-slate-700 leading-relaxed text-sm">
            <h3 className="text-xl sm:text-2xl font-bold text-[#0B2545] font-serif">
              Genesis &amp; Educational Philosophy
            </h3>
            <p>
              Established with an inspiring mission to provide holistic, value-based, and world-class education in Kalyan, <strong>MJ School</strong> stands as an epicenter of knowledge, character building, and innovation. Affiliated to the <strong>Central Board of Secondary Education (CBSE)</strong>, the school caters to students from Pre-Primary through Senior Secondary (Grade XII).
            </p>
            <p>
              Drawing inspiration from the highest benchmarks of modern education and timeless cultural heritage, our curriculum integrates academic rigor with experiential learning, scientific inquiry, environmental consciousness, and global competencies outlined in the <strong>National Education Policy (NEP 2020)</strong>.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                <span className="text-2xl sm:text-3xl font-black text-[#0B2545] block">25+</span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Years of Glory</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                <span className="text-2xl sm:text-3xl font-black text-[#C59B27] block">3,500+</span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Enrolled Scholars</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                <span className="text-2xl sm:text-3xl font-black text-[#0B2545] block">100%</span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">CBSE Pass Rate</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                <span className="text-2xl sm:text-3xl font-black text-[#C59B27] block">15 : 1</span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Teacher Ratio</span>
              </div>
            </div>
          </div>

          {/* School Campus Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1000&q=80"
                alt="MJ School Campus Building"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B2545]/90 via-transparent to-transparent flex items-end p-5">
                <div className="text-white">
                  <span className="text-xs text-[#F6D55C] font-bold uppercase tracking-wider block">
                    Campus Infrastructure
                  </span>
                  <h4 className="text-base font-bold">10-Acre Lush Green Learning Sanctuary</h4>
                  <p className="text-xs text-slate-200 mt-0.5">
                    Equipped with solar-powered eco-buildings, smart lecture halls, and Olympic standard sports facilities.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Vision, Mission, Values Triad */}
        <div id="vision-mission" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 scroll-mt-24">
          
          <div className="bg-gradient-to-b from-slate-50 to-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#0B2545] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0B2545] mb-2 font-serif">Our Vision</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To be an exemplary center of academic learning where every child discovers their distinct potential, develops an agile scientific temper, and blossoms into a compassionate, responsible citizen of the global community.
            </p>
          </div>

          <div className="bg-gradient-to-b from-slate-50 to-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-[#C59B27] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0B2545] mb-2 font-serif">Our Mission</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To nurture critical thinking, emotional resilience, and lifelong curiosity through high-caliber pedagogy, state-of-the-art technological immersion, and values-rooted ethical mentorship.
            </p>
          </div>

          <div className="bg-gradient-to-b from-slate-50 to-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#0B2545] mb-2 font-serif">Core Values</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Integrity</strong> (Satya), <strong>Diligence</strong> (Karmanya), <strong>Empathy</strong> (Karuna), and <strong>Excellence</strong> (Shreshthata) – guiding every interaction across the classrooms, laboratories, and playing fields.
            </p>
          </div>

        </div>

        {/* Principal's Desk Message */}
        <div id="principal-message" className="bg-[#0B2545] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden scroll-mt-24 shadow-xl">
          <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
            <Quote className="w-48 h-48 -mr-12 -mt-12" />
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-4 text-center md:text-left">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full mx-auto md:mx-0 overflow-hidden border-4 border-[#C59B27] shadow-lg mb-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
                  alt="Principal"
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-bold text-base text-white">Principal</h4>
              <p className="text-xs text-[#F6D55C] font-medium">MJ School, Kalyan</p>
              <p className="text-[10px] text-slate-400 mt-1">National CBSE Best Educator Awardee</p>
            </div>

            <div className="md:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded text-xs text-[#F6D55C] font-semibold">
                <Quote className="w-3 h-3" />
                <span>From the Principal's Desk</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                "Empowering Young Minds to Conquer the Challenges of Tomorrow"
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Dear Parents, Students, and Well-Wishers,
                <br /><br />
                At MJ School, Kalyan, education extends far beyond textbooks and formal examinations. We endeavor to create an intellectually stimulating ecosystem where curious minds are encouraged to question, experiment, create, and lead. Our faculty members act not merely as instructors, but as compassionate guides who awaken the latent genius inside every child.
                <br /><br />
                As we stride confidently into the future, we invite parents to walk alongside us as active partners in this magnificent journey of nurturing tomorrow's thinkers, changemakers, and leaders.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
