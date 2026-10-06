import React, { useState } from 'react';
import { CheckCircle, FileText, Send, HelpCircle } from 'lucide-react';

export const AdmissionsSection: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    candidateName: '',
    dob: '',
    applyingGrade: 'Nursery',
    parentName: '',
    email: '',
    phone: '',
    currentSchool: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="admissions" className="py-12 bg-white border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header (without Enroll for Session pill) */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] font-serif">
            Admission Procedure &amp; Registration
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Join the MJ School fraternity. Admissions are granted on a merit and transparent criteria basis without capitation fee or donation.
          </p>
        </div>

        {/* 4 Steps Process */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { step: '01', title: 'Online Registration', desc: 'Fill out the initial inquiry / registration form online or collect the kit from the admission counter.' },
            { step: '02', title: 'Document Verification', desc: 'Submit Birth Certificate, previous report cards, Aadhaar card, and address proof for verification.' },
            { step: '03', title: 'Interaction / Readiness', desc: 'Warm, informal interactive session with parents and student (aptitude test for Grade VI upwards).' },
            { step: '04', title: 'Admission Confirmation', desc: 'Offer letter issuance, completion of fee formalities, and issuance of Student ERP credentials.' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative overflow-hidden">
              <span className="text-3xl font-black text-slate-200 absolute top-2 right-3 font-serif">
                {item.step}
              </span>
              <div className="w-7 h-7 rounded-full bg-[#0B2545] text-white flex items-center justify-center font-bold text-xs mb-3">
                {item.step}
              </div>
              <h4 className="font-bold text-sm text-[#0B2545] mb-1">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Two-Column Form & Eligibility Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Eligibility & Documents */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <h3 className="font-bold text-sm text-[#0B2545] uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C59B27]" />
                Mandatory Documents Checklist
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Original Municipal Birth Certificate (for Nursery to Grade I)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Original School Leaving Certificate (Countersigned for outstation boards)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Certified copy of previous year's Cumulative Report Card</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Aadhaar Card copies of Student and both Parents</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>3 recent passport-sized color photographs of the applicant</span>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-xs text-amber-900 space-y-2">
              <h4 className="font-bold text-sm flex items-center gap-1.5 text-[#0B2545]">
                <HelpCircle className="w-4 h-4 text-[#C59B27]" />
                Age Criteria (As of 31st December 2025)
              </h4>
              <p>• <strong>Nursery:</strong> Minimum 3 years complete</p>
              <p>• <strong>Junior KG:</strong> Minimum 4 years complete</p>
              <p>• <strong>Senior KG:</strong> Minimum 5 years complete</p>
              <p>• <strong>Grade I:</strong> Minimum 6 years complete per NEP guidelines</p>
            </div>
          </div>

          {/* Online Application Form */}
          <div id="admission-form" className="lg:col-span-7 bg-white rounded-xl shadow-md border border-slate-200 p-6 sm:p-7">
            <h3 className="text-base font-bold text-[#0B2545] font-serif mb-1">
              Online Admission Registration Form (2025-26)
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Submit your preliminary registration. Our admissions counselor will contact you within 24 working hours.
            </p>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-emerald-900">Application Submitted Successfully!</h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Thank you, <strong>{formData.parentName}</strong>. Application for <strong>{formData.candidateName}</strong> for <strong>{formData.applyingGrade}</strong> has been logged with Registration Token: <code className="font-mono bg-emerald-200 px-1 py-0.5 rounded text-emerald-900 font-bold">MJ-ADM-2025-{(Math.random() * 89999 + 10000).toFixed(0)}</code>.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-semibold text-emerald-800 underline hover:text-emerald-950 pt-2 cursor-pointer"
                >
                  Submit another application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Student's Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="First Middle Surname"
                      value={formData.candidateName}
                      onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-[#0B2545] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-[#0B2545] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Applying for Grade *
                    </label>
                    <select
                      value={formData.applyingGrade}
                      onChange={(e) => setFormData({ ...formData, applyingGrade: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-[#0B2545] outline-none bg-white font-medium"
                    >
                      <option value="Nursery">Nursery</option>
                      <option value="Junior KG">Junior KG</option>
                      <option value="Senior KG">Senior KG</option>
                      <option value="Grade I">Grade I</option>
                      <option value="Grade II">Grade II</option>
                      <option value="Grade III">Grade III</option>
                      <option value="Grade IV">Grade IV</option>
                      <option value="Grade V">Grade V</option>
                      <option value="Grade VI">Grade VI</option>
                      <option value="Grade VII">Grade VII</option>
                      <option value="Grade VIII">Grade VIII</option>
                      <option value="Grade IX">Grade IX</option>
                      <option value="Grade XI - Science">Grade XI - Science (PCM / PCB)</option>
                      <option value="Grade XI - Commerce">Grade XI - Commerce</option>
                      <option value="Grade XI - Humanities">Grade XI - Humanities</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Parent / Guardian Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Parent's Name"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-[#0B2545] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Mobile Number (WhatsApp Enabled) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-[#0B2545] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="parent@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-[#0B2545] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Current School (if applicable)
                  </label>
                  <input
                    type="text"
                    placeholder="Name of previous school and board"
                    value={formData.currentSchool}
                    onChange={(e) => setFormData({ ...formData, currentSchool: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-[#0B2545] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#0B2545] hover:bg-[#133E6E] text-white font-bold py-3 px-4 rounded-md transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#F6D55C]" />
                  <span>Submit Admission Application</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
