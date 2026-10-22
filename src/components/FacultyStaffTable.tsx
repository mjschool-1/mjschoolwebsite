import React, { useState, useEffect } from 'react';
import { User, Award, BookOpen } from 'lucide-react';
import { StaffRecord, getAllStaffMembers } from '../lib/supabase';

interface FacultyStaffTableProps {
  initialStaff: StaffRecord[];
}

export const FacultyStaffTable: React.FC<FacultyStaffTableProps> = ({ initialStaff }) => {
  const [staffList, setStaffList] = useState<StaffRecord[]>(initialStaff);

  useEffect(() => {
    let isMounted = true;

    const reloadStaff = async () => {
      try {
        const data = await getAllStaffMembers();
        if (isMounted && data && data.length > 0) {
          setStaffList(data);
        }
      } catch (err) {
        console.warn('[FacultyStaffTable] Error loading staff data:', err);
      }
    };

    // Revalidate on custom event from admin portal or storage event
    const handleSync = () => {
      reloadStaff();
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'mj_staff_updated_at') {
        reloadStaff();
      }
    };

    window.addEventListener('mj_staff_updated', handleSync);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener('mj_staff_updated', handleSync);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  if (!staffList || staffList.length === 0) {
    return (
      <div className="border border-slate-200 border-t-4 border-t-[#C59B27] bg-white rounded-lg p-10 text-center shadow-xs">
        <User className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-[1.2]" />
        <h3 className="font-serif text-lg font-bold text-[#0B2545]">Faculty Directory</h3>
        <p className="text-sm text-slate-500 mt-1">Directory information is currently being updated.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ─────────────────────────────────────────────────────────────
          1. DESKTOP & TABLET TABLE VIEW (≥ 768px / md:block)
          - Prominent 96×96 px photograph frame (1:1 square)
          - Vertically centered rows with generous padding
          - Navy header (#0B2545) & Gold top accent (#C59B27)
          - Balanced column ratios (26% / 32% / 24% / 18%)
         ───────────────────────────────────────────────────────────── */}
      <div className="hidden md:block border border-slate-200 border-t-4 border-t-[#C59B27] bg-white rounded-lg overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-[#0B2545] text-white text-xs uppercase tracking-wider font-sans">
              <th scope="col" className="py-4 px-6 font-bold w-[26%]">
                Name
              </th>
              <th scope="col" className="py-4 px-6 font-bold w-[32%]">
                Department(s)
              </th>
              <th scope="col" className="py-4 px-6 font-bold w-[24%]">
                Qualification
              </th>
              <th scope="col" className="py-4 px-6 font-bold text-center w-[18%]">
                Photograph
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm text-slate-800">
            {staffList.map((member, index) => (
              <tr
                key={member.id}
                className={
                  index % 2 === 1
                    ? 'bg-slate-50/70 hover:bg-amber-50/30 transition-colors'
                    : 'bg-white hover:bg-amber-50/30 transition-colors'
                }
              >
                {/* 1. Name */}
                <td className="py-4 px-6 align-middle">
                  <div className="font-serif font-bold text-base text-[#0B2545] leading-snug break-words">
                    {member.name}
                  </div>
                  <div className="text-xs text-slate-500 font-sans mt-0.5">
                    Faculty Member
                  </div>
                </td>

                {/* 2. Department(s) */}
                <td className="py-4 px-6 align-middle">
                  <div className="text-slate-700 font-medium leading-relaxed break-words">
                    {member.departments && member.departments.length > 0
                      ? member.departments.join(' · ')
                      : (member.department || '—')}
                  </div>
                </td>

                {/* 3. Qualification */}
                <td className="py-4 px-6 align-middle">
                  <div className="text-slate-600 italic leading-relaxed break-words">
                    {member.qualification || '—'}
                  </div>
                </td>

                {/* 4. Photograph (Prominent 96×96 px frame) */}
                <td className="py-4 px-6 align-middle text-center">
                  <div className="inline-block">
                    <div
                      className="w-24 h-24 rounded-lg bg-slate-100 border border-slate-200/90 shadow-xs overflow-hidden flex items-center justify-center"
                      title={member.image_url ? member.name : `${member.name} (Placeholder avatar)`}
                    >
                      {member.image_url ? (
                        <img
                          src={member.image_url}
                          alt={`Portrait of ${member.name}`}
                          className="w-full h-full object-cover object-center"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-300">
                          <User className="w-10 h-10 stroke-[1.2]" aria-label={`Avatar placeholder for ${member.name}`} />
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MOBILE RESPONSIVE CARD VIEW (< 768px / block md:hidden)
          - Eliminates horizontal scrollbar completely
          - Clear 88×88 px photo on the left
          - Name, Department & Qualification stacked on the right
          - Tested across 320px, 360px, 390px, 414px+ widths
         ───────────────────────────────────────────────────────────── */}
      <div className="block md:hidden space-y-3">
        {staffList.map((member) => (
          <div
            key={member.id}
            className="bg-white border border-slate-200/90 border-l-4 border-l-[#C59B27] rounded-xl p-3.5 sm:p-4 shadow-xs flex items-center gap-3.5 sm:gap-4 transition-all hover:shadow-sm"
          >
            {/* Left Column: Prominent square photograph (88×88 px) */}
            <div className="w-[88px] h-[88px] shrink-0 rounded-lg bg-slate-100 border border-slate-200/90 overflow-hidden flex items-center justify-center shadow-xs">
              {member.image_url ? (
                <img
                  src={member.image_url}
                  alt={`Portrait of ${member.name}`}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-300">
                  <User className="w-9 h-9 stroke-[1.2]" aria-label={`Avatar placeholder for ${member.name}`} />
                </div>
              )}
            </div>

            {/* Right Column: Stacked text details with clean wrapping */}
            <div className="min-w-0 flex-1">
              {/* Staff Name */}
              <h3 className="font-serif font-bold text-base text-[#0B2545] leading-snug break-words">
                {member.name}
              </h3>

              {/* Department(s) */}
              <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C59B27] shrink-0">
                  Dept:
                </span>
                <span className="text-xs sm:text-sm text-slate-700 font-medium leading-snug break-words">
                  {member.departments && member.departments.length > 0
                    ? member.departments.join(' · ')
                    : (member.department || '—')}
                </span>
              </div>

              {/* Qualification */}
              {member.qualification && (
                <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider shrink-0">
                    Qual:
                  </span>
                  <span className="text-xs text-slate-600 italic break-words">
                    {member.qualification}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

