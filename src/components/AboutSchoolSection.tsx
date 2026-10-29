import React from 'react';
import { CampusInfrastructureFrame } from './CampusInfrastructureFrame';

export interface AboutSchoolSectionProps {
  initialInfraImageUrl?: string | null;
  initialInfraTitle?: string;
  initialInfraShowTitle?: boolean;
}

export const AboutSchoolSection: React.FC<AboutSchoolSectionProps> = ({
  initialInfraImageUrl = null,
  initialInfraTitle = 'CAMPUS INFRASTRUCTURE',
  initialInfraShowTitle = true,
}) => {
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

          {/* School Campus Visual Synchronized with Campus Infrastructure Settings */}
          <div className="lg:col-span-5 relative self-stretch flex items-stretch">
            <CampusInfrastructureFrame
              variant="philosophy"
              initialImageUrl={initialInfraImageUrl}
              initialTitle={initialInfraTitle}
              initialShowTitle={initialInfraShowTitle}
            />
          </div>

        </div>

        {/* Head Mistress's Desk Message Panel */}
        <div
          id="principal-message"
          className="bg-[#0B2545] text-white rounded-2xl sm:rounded-3xl relative overflow-hidden scroll-mt-24 shadow-xl border border-slate-700/60 flex flex-col md:flex-row items-stretch"
        >
          {/* Left Column: Headmistress Photograph in natural, untinted colors separated by a clean gold border */}
          <div className="relative w-full md:w-[35%] lg:w-[33%] min-h-[300px] sm:min-h-[350px] md:min-h-[440px] shrink-0 overflow-hidden flex flex-col justify-end border-b border-[#C59B27] md:border-b-0 md:border-r border-[#C59B27]">
            {/* The Actual Photograph in natural full color - no tint, no gradient overlay, no filter */}
            <img
              src="/head-mistress.jpeg"
              alt="Head Mistress of MJ School, Shahapur"
              className="absolute inset-0 w-full h-full object-cover object-[30%_15%]"
              loading="lazy"
            />

            {/* Headmistress Title & School Name directly over photograph without any surrounding box */}
            <div className="relative z-10 p-5 sm:p-6 md:p-6 lg:p-7 select-none">
              <h4 className="font-bold text-lg sm:text-xl lg:text-2xl text-white font-serif tracking-wide leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                Head Mistress
              </h4>
              <p className="text-xs sm:text-sm text-[#F6D55C] font-bold tracking-wider mt-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase">
                MJ School, Shahapur
              </p>
            </div>
          </div>

          {/* Right Column: Message Content on Solid Navy Background */}
          <div className="relative z-10 flex-1 bg-[#0B2545] p-6 sm:p-8 lg:p-10 flex flex-col justify-center space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-[#C59B27]/15 border border-[#C59B27]/40 px-3 py-1 rounded-full text-xs text-[#F6D55C] font-bold uppercase tracking-wider self-start">
              <span>From the Headmistress’s Desk</span>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-[28px] font-bold font-serif text-white leading-snug">
              Nurturing Young Minds, Building Bright Futures
            </h3>

            <div className="space-y-3.5 text-xs sm:text-sm lg:text-[15px] text-slate-200 leading-relaxed pt-1">
              <p className="font-semibold text-slate-100 text-sm sm:text-base">
                Dear Parents and Students,
              </p>
              <p>
                At MJ School, Shahapur, we believe every child has the potential to learn, grow, and succeed. Our aim is to provide a supportive learning environment where children build strong academic foundations, develop good values, and discover their unique abilities.
              </p>
              <p>
                We believe that a strong partnership between parents and teachers is essential to every child’s growth. Together, let us help our children become confident, responsible, and compassionate individuals.
              </p>

              <div className="pt-2 space-y-0.5 text-xs sm:text-sm">
                <p className="font-bold text-white text-sm sm:text-base">Warm regards,</p>
                <p className="italic text-slate-200">Headmistress</p>
                <p className="text-slate-300">MJ School, Shahapur</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
