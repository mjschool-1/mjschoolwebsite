import React, { useState } from 'react';
import { NOTICES_LIST } from '../data/schoolData';
import { Download, FileText, Trophy } from 'lucide-react';

export const NoticeBoardAndEvents: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notices' | 'events' | 'achievements'>('notices');

  const events = [
    { title: 'Inter-House Annual Athletic Championship 2025', date: 'OCT 28', time: '08:00 AM', venue: 'Main Sports Stadium' },
    { title: 'Science & Robotics Innovation Fair "TechnoSpark"', date: 'NOV 12', time: '09:30 AM', venue: 'Multipurpose Auditorium' },
    { title: 'Parent-Teacher Interaction Meeting (Term II Review)', date: 'NOV 22', time: '09:00 AM', venue: 'Respective Classrooms' },
    { title: 'Annual Cultural Fest & Musical Extravaganza', date: 'DEC 18', time: '04:30 PM', venue: 'Open Air Amphitheatre' },
  ];

  const achievements = [
    { student: 'Aarav Deshmukh', grade: 'Grade XII (Science)', feat: 'Scored 99.4% in CBSE Boards & qualified for JEE Advanced with AIR 312.' },
    { student: 'Ananya Kulkarni', grade: 'Grade X', feat: 'Gold Medalist in National CBSE Skating Championship (U-16 category).' },
    { student: 'MJ Robotics Team', grade: 'Grades VIII - XI', feat: '1st Runners-Up in International STEM Robotics Olympiad held in Mumbai.' },
    { student: 'Siddharth Patil', grade: 'Grade IX', feat: 'Winner of National Youth Elocution & Debating Competition.' },
  ];

  return (
    <section id="notices" className="py-12 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header (without Campus Happenings pill) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] font-serif">
              Notices, Events &amp; Student Accolades
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Stay updated with academic circulars, campus events, and student milestones.
            </p>
          </div>

          {/* Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('notices')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'notices' ? 'bg-[#0B2545] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Official Notices
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'events' ? 'bg-[#0B2545] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'achievements' ? 'bg-[#0B2545] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hall of Fame
            </button>
          </div>
        </div>

        {/* Tab 1: Notices */}
        {activeTab === 'notices' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {NOTICES_LIST.map((notice) => (
              <div
                key={notice.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-[#C59B27] hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#0B2545]/10 text-[#0B2545]">
                      {notice.category}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{notice.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 line-clamp-2 mt-1">
                    {notice.title}
                  </h4>
                  {notice.isNew && (
                    <span className="inline-block mt-2 bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                      New Circular
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  <button
                    onClick={() => alert(`Opening official circular PDF: "${notice.title}"`)}
                    className="inline-flex items-center gap-1 text-[#0B2545] hover:text-[#C59B27] font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Upcoming Events */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((ev, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                <div className="bg-[#0B2545] text-white p-3 rounded-xl text-center shrink-0 w-16">
                  <span className="text-[10px] uppercase block tracking-wider text-[#F6D55C] font-bold">
                    {ev.date.split(' ')[0]}
                  </span>
                  <span className="text-xl font-black block leading-none mt-1">
                    {ev.date.split(' ')[1]}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0B2545]">{ev.title}</h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                    <span>Time: <strong>{ev.time}</strong></span>
                    <span>Venue: <strong>{ev.venue}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Achievements */}
        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((ach, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-b from-amber-50/50 to-white border border-amber-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-[#C59B27]/20 text-[#0B2545] flex items-center justify-center mb-3">
                  <Trophy className="w-4 h-4 text-[#C59B27]" />
                </div>
                <h4 className="font-bold text-sm text-[#0B2545]">{ach.student}</h4>
                <span className="text-[11px] font-semibold text-[#C59B27] block mb-2">{ach.grade}</span>
                <p className="text-xs text-slate-600 leading-relaxed">{ach.feat}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
