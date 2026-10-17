import React from 'react';
import { FileText, CreditCard, Info } from 'lucide-react';

export const FeeStructureSection: React.FC = () => {
  return (
    <section id="fee-structure" className="py-12 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="w-8 h-0.5 bg-[#C59B27] mx-auto mb-3"></div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] font-serif">
            Fee Structure &amp; Regulations
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Adherence to Maharashtra Educational Institutions (Regulation of Fee) Act.
          </p>
        </div>

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Fee Structure Information Template */}
          <div className="lg:col-span-7 bg-white rounded-none border border-slate-200 p-6 sm:p-8">
            <div className="w-8 h-0.5 bg-[#C59B27] mb-3"></div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-[#C59B27]" />
              <h3 className="font-bold text-lg sm:text-xl text-[#0B2545] font-serif">
                Fee Structure Information
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6">
              The official fee structure for each grade will be published here once approved and provided by the school. Please contact the school office for confirmed fee details.
            </p>

            {/* Template Structure accommodating future grade-wise details */}
            <div className="border border-slate-200 overflow-hidden">
              <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200">
                <span className="text-[11px] font-bold text-[#0B2545] uppercase tracking-wider block">
                  Official Grade-Wise Schedule (Template Format)
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-3.5">Class / Grade</th>
                      <th className="py-3 px-3.5">Tuition Fee</th>
                      <th className="py-3 px-3.5">Other Approved Charges</th>
                      <th className="py-3 px-3.5">Total Payable Amount</th>
                      <th className="py-3 px-3.5">Payment Schedule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-500">
                    <tr>
                      <td colSpan={5} className="py-8 px-4 text-center bg-white text-slate-500 text-xs">
                        <div className="max-w-md mx-auto space-y-1">
                          <p className="font-medium text-slate-700">
                            Awaiting official schedule approval from the school
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Grade-wise tuition rates, approved charges, totals, and installment terms will appear in this format.
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-500">
              <Info className="w-4 h-4 text-[#C59B27] shrink-0 mt-0.5" />
              <p>
                All fees are subject to official confirmation by the School Managing Committee (SMC).
              </p>
            </div>
          </div>

          {/* Right Column: Online Fee Payment Information Panel */}
          <div className="lg:col-span-5 bg-[#0B2545] text-white p-6 sm:p-8 border border-slate-200">
            <div className="w-8 h-0.5 bg-[#C59B27] mb-3"></div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-[#C59B27]" />
              <h3 className="font-bold text-lg sm:text-xl font-serif text-white">
                Online Fee Payment
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 mb-6 leading-relaxed">
              Online fee payment information will be made available here once the school confirms the payment process and activates the appropriate payment facility.
            </p>

            <div className="bg-white/10 border border-white/15 p-5 space-y-3 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C59B27]"></span>
                <span className="font-bold text-white uppercase text-[11px] tracking-wider">
                  Payment Facility Status
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Direct transactions and digital payment channels will be announced by the school once approved institutional systems are active.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10 text-xs text-slate-300 space-y-2">
              <p className="font-semibold text-white">
                Need immediate fee guidance?
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Please contact the school administrative office during official working hours for all verified fee details and queries.
              </p>
              <div className="pt-2">
                <a
                  href="/admissions/fee-payment-2026/"
                  className="inline-block bg-[#C59B27] hover:bg-[#b58b19] text-[#0B2545] font-bold py-2 px-4 text-xs uppercase tracking-wider transition-colors"
                >
                  View Payment Portal Guidelines &rarr;
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

