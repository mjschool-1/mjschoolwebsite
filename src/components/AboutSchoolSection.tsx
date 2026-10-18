import React from 'react';
import { Quote, User } from 'lucide-react';

export const AboutSchoolSection: React.FC = () => {
  return (
    <section id="about-school" className="py-8 sm:py-10 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] font-serif">
            About MJ School, Shahapur
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 font-medium">
            Nurturing Young Minds Through Knowledge, Values &amp; Holistic Development
          </p>
        </div>

        {/* Overview & Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8 sm:mb-10">
          
          <div className="lg:col-span-7 space-y-4 text-slate-700 leading-relaxed text-sm sm:text-[15px]">
            <h3 className="text-xl sm:text-2xl font-bold text-[#0B2545] font-serif">
              Our Vision &amp; Educational Philosophy
            </h3>
            <p>
              MJ School is an English-medium school in Shahapur, Maharashtra, committed to nurturing confident, curious, and responsible learners. With a focus on academic foundations, individual growth, and Indian values, we strive to create a learning environment where every child is encouraged to explore, express, and reach their potential. From Kindergarten to Primary School, our approach combines structured learning with engaging activities that make education meaningful and enjoyable.
            </p>
            <p>
              Our curriculum is designed to build strong foundations in English, Mathematics, languages, Environmental Studies, and other essential learning areas, aligned with CBSE-oriented academic expectations. Beyond the classroom, students are encouraged to develop creativity, communication, physical fitness, scientific curiosity, and social responsibility through competitions, cultural celebrations, nature walks, sports, and hands-on learning experiences. At MJ School, we believe that education is not just about what children learn, but also about the people they become.
            </p>
          </div>

          {/* School Campus Visual Placeholder */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-sm border-2 border-slate-200 bg-slate-100 h-72 sm:h-80 flex flex-col justify-end p-5">
              <div>
                <span className="inline-block bg-[#0B2545] text-[#F6D55C] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
                  CAMPUS INFRASTRUCTURE
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Head Mistress's Desk Message */}
        <div id="principal-message" className="bg-[#0B2545] text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden scroll-mt-24 shadow-xl">
          <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
            <Quote className="w-48 h-48 -mr-12 -mt-12" />
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-4 text-center md:text-left">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full mx-auto md:mx-0 overflow-hidden border-4 border-[#C59B27] bg-[#133E6E]/60 shadow-lg mb-3 flex items-center justify-center">
                <User className="w-16 h-16 sm:w-20 sm:h-20 text-white/30" />
              </div>
              <h4 className="font-bold text-base text-white">Head Mistress</h4>
              <p className="text-xs text-[#F6D55C] font-medium">MJ School, Shahapur</p>
              <p className="text-[10px] text-slate-400 mt-1">National CBSE Best Educator Awardee</p>
            </div>

            <div className="md:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded text-xs text-[#F6D55C] font-semibold">
                <Quote className="w-3 h-3" />
                <span>From the Head Mistress's Desk</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                "Empowering Young Minds to Conquer the Challenges of Tomorrow"
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                Dear Parents, Students, and Well-Wishers,
                <br /><br />
                At MJ School, Shahapur, education extends far beyond textbooks and formal examinations. We endeavor to create an intellectually stimulating ecosystem where curious minds are encouraged to question, experiment, create, and lead. Our faculty members act not merely as instructors, but as compassionate guides who awaken the latent genius inside every child.
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
