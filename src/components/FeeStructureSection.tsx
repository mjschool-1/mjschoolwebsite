import React, { useState } from 'react';
import { FEE_STRUCTURE_DATA } from '../data/schoolData';
import { Calculator, CreditCard, CheckCircle, ShieldCheck } from 'lucide-react';

export const FeeStructureSection: React.FC = () => {
  // Interactive Calculator State
  const [calcGradeIndex, setCalcGradeIndex] = useState(0);
  const [transportZone, setTransportZone] = useState('0'); // 0 = none, 12000, 16000, 20000
  const [hasSiblingDiscount, setHasSiblingDiscount] = useState(false);
  const [studentEnrollment, setStudentEnrollment] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const currentGradeData = FEE_STRUCTURE_DATA[calcGradeIndex] || FEE_STRUCTURE_DATA[0];
  const transportCost = parseInt(transportZone, 10);
  const baseAnnual = currentGradeData.totalAnnual;
  const discountAmount = hasSiblingDiscount ? Math.round(currentGradeData.tuitionFeePerQuarter * 4 * 0.15) : 0;
  const finalCalculatedAnnual = baseAnnual + transportCost - discountAmount;
  const quarterlyInstallment = Math.round(finalCalculatedAnnual / 4);

  return (
    <section id="fee-structure" className="py-12 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header (without pill) */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] font-serif">
            Fee Structure &amp; Regulations 2025-26
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Approved by the School Managing Committee (SMC) in strict adherence to Maharashtra Educational Institutions (Regulation of Fee) Act.
          </p>
        </div>

        {/* Interactive Fee Estimator & Online Fee Payment Portal Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Fee Estimator */}
          <div className="lg:col-span-7 bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#C59B27]" />
                <h3 className="font-bold text-base text-[#0B2545]">Interactive Fee Calculator</h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Live Estimate</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Grade for Calculation:
                </label>
                <select
                  value={calcGradeIndex}
                  onChange={(e) => setCalcGradeIndex(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:border-[#0B2545] outline-none bg-white font-medium text-slate-800"
                >
                  {FEE_STRUCTURE_DATA.map((item, idx) => (
                    <option key={idx} value={idx}>
                      {item.category} ({item.grades})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Optional School Bus Transport Zone:
                </label>
                <select
                  value={transportZone}
                  onChange={(e) => setTransportZone(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-md focus:border-[#0B2545] outline-none bg-white font-medium text-slate-800"
                >
                  <option value="0">No Transport (Own Arrangement / Walkers)</option>
                  <option value="12000">Zone 1: Within Kalyan City Limits (₹12,000 / yr)</option>
                  <option value="16000">Zone 2: Dombivli / Titwala / Shahad (₹16,000 / yr)</option>
                  <option value="20000">Zone 3: Ulhasnagar / Ambernath / Extended Radius (₹20,000 / yr)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-md border border-slate-200">
                <input
                  type="checkbox"
                  id="siblingCheckbox"
                  checked={hasSiblingDiscount}
                  onChange={(e) => setHasSiblingDiscount(e.target.checked)}
                  className="rounded text-[#0B2545] focus:ring-[#0B2545] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="siblingCheckbox" className="text-xs text-slate-700 cursor-pointer">
                  Apply <strong>Sibling Concession (15% off Tuition)</strong> for younger sibling enrolled at MJ School
                </label>
              </div>

              {/* Summary Calculation Box */}
              <div className="bg-[#0B2545] text-white p-4 rounded-lg mt-4 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Standard Academic Fee:</span>
                  <span>₹{baseAnnual.toLocaleString('en-IN')}</span>
                </div>
                {transportCost > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span>Transport Charges:</span>
                    <span>+ ₹{transportCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Sibling Concession (15%):</span>
                    <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="border-t border-slate-700 pt-2 flex justify-between font-bold text-sm">
                  <span>Net Annual Payable:</span>
                  <span className="text-[#F6D55C] text-base">₹{finalCalculatedAnnual.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Payable in 4 Equal Quarters:</span>
                  <span className="text-white font-semibold">₹{quarterlyInstallment.toLocaleString('en-IN')} / Quarter</span>
                </div>
              </div>
            </div>
          </div>

          {/* Online Fee Payment Gateway Box */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0B2545] to-[#133E6E] text-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-[#F6D55C]" />
              <h3 className="font-bold text-base">Online Fee Portal</h3>
            </div>
            <p className="text-xs text-slate-200 mb-4 leading-relaxed">
              Parents can pay quarterly fees securely through Net Banking, UPI, Debit / Credit Card without visiting the campus fee counter.
            </p>

            {paymentSuccess ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 space-y-2 text-center animate-fadeIn">
                <CheckCircle className="w-8 h-8 text-[#F6D55C] mx-auto" />
                <h4 className="font-bold text-sm text-white">Payment Receipt Generated!</h4>
                <p className="text-xs text-slate-200">
                  Transaction ID: <code className="bg-black/30 px-1.5 py-0.5 rounded text-[#F6D55C]">MJ-TXN-{(Math.random() * 89999 + 10000).toFixed(0)}</code>
                </p>
                <p className="text-[11px] text-slate-300">
                  A receipt has been dispatched to registered mobile and Parent ERP portal.
                </p>
                <button
                  onClick={() => setPaymentSuccess(false)}
                  className="text-xs underline text-[#F6D55C] pt-2 cursor-pointer"
                >
                  Make another transaction
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Student GR Number / Enrollment No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MJ-2024-4821"
                    value={studentEnrollment}
                    onChange={(e) => setStudentEnrollment(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-slate-400 outline-none focus:border-[#F6D55C]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Installment Term
                  </label>
                  <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white outline-none">
                    <option className="text-slate-900" value="Q1">Quarter 1 (April - June 2025)</option>
                    <option className="text-slate-900" value="Q2">Quarter 2 (July - September 2025)</option>
                    <option className="text-slate-900" value="Q3">Quarter 3 (October - December 2025)</option>
                    <option className="text-slate-900" value="Q4">Quarter 4 (January - March 2026)</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    if (!studentEnrollment.trim()) {
                      alert('Please enter Student GR Number / Enrollment ID');
                      return;
                    }
                    setPaymentSuccess(true);
                  }}
                  className="w-full bg-[#C59B27] hover:bg-[#b58b19] text-[#0B2545] font-bold py-2.5 px-4 rounded transition-all flex items-center justify-center gap-2 shadow-lg mt-3 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#0B2545]" />
                  <span>Proceed to Secure Gateway</span>
                </button>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-slate-300 space-y-1">
              <p>• Due Date: 10th of every quarter starting month.</p>
              <p>• Support Desk: <span className="text-[#F6D55C]">accounts@mjschoolkalyan.edu.in</span></p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
