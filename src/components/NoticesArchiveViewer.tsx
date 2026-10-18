import React, { useState, useEffect } from 'react';
import { getPublishedNotices, DEFAULT_NOTICES, NoticeRecord } from '../lib/supabase';
import { Download, Calendar, Bell, Search, Filter } from 'lucide-react';

export const NoticesArchiveViewer: React.FC = () => {
  const [notices, setNotices] = useState<NoticeRecord[]>(DEFAULT_NOTICES);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    async function loadNotices() {
      try {
        const records = await getPublishedNotices();
        if (isMounted && records && records.length > 0) {
          setNotices(records);
        }
      } catch (err) {
        console.warn('[NoticesArchiveViewer] Failover to default notices:', err);
      }
    }
    loadNotices();
    return () => {
      isMounted = false;
    };
  }, []);

  // Extract categories dynamically from current notices
  const availableCategories = [
    'All',
    ...Array.from(new Set(notices.map((n) => n.category))).filter(Boolean),
  ];

  const filteredNotices = notices.filter((notice) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      notice.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Notice Board Search & Category Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#C59B27]" />
            <h2 className="text-base font-bold font-serif text-[#0B2545]">
              Latest Circulars Archive
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {availableCategories.map((category) => {
              const isSelected = selectedCategory.toLowerCase() === category.toLowerCase();
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0B2545] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-[#C59B27] hover:text-[#0B2545]'
                  }`}
                >
                  {category === 'All' ? 'All Circulars' : category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notices Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B2545] text-white uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Date</th>
                <th className="py-3.5 px-4 sm:px-6">Category</th>
                <th className="py-3.5 px-4 sm:px-6">Title &amp; Reference</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 px-6 text-center text-slate-500">
                    <p className="text-sm font-medium">No circulars match the selected filter.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory('All');
                        setSearchQuery('');
                      }}
                      className="mt-2 text-xs font-bold text-[#0B2545] hover:text-[#C59B27] underline cursor-pointer"
                    >
                      Reset filter
                    </button>
                  </td>
                </tr>
              ) : (
                filteredNotices.map((notice, idx) => (
                  <tr key={notice.id || idx} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-slate-500 font-sans">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#C59B27]" />
                        <span>{notice.date}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-[#0B2545]">
                        {notice.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0B2545] text-xs sm:text-sm">
                          {notice.title}
                        </span>
                        {notice.is_new && (
                          <span className="bg-emerald-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Ref: MJS/NOT/2025-26/0{idx + 1}
                      </p>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      {notice.has_attachment ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (notice.attachment_url) {
                              window.open(notice.attachment_url, '_blank', 'noopener,noreferrer');
                            } else {
                              alert(`Downloading circular: "${notice.title}"`);
                            }
                          }}
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-[#C59B27] hover:text-[#0B2545] text-[#0B2545] font-bold px-3 py-1.5 rounded transition-all cursor-pointer text-xs"
                          title="Download Circular PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF {notice.file_size ? `(${notice.file_size})` : ''}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Notice Only</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
