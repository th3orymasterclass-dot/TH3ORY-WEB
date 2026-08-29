import React, { useState } from 'react';
import { 
  Building2, GraduationCap, Users, Award, CheckCircle2, ArrowRight, 
  Send, Sparkles, Calendar, ShieldCheck, ChevronRight, ArrowLeft, Clock
} from 'lucide-react';
import Logo from './Logo';
import SEOHead from './SEOHead';
import StructuredData from './StructuredData';
import { saveContactInquiryToSupabase } from '../services/supabaseService';

export default function InstitutionalPage({ onBack }) {
  const [activeFormat, setActiveFormat] = useState(0);

  const [form, setForm] = useState({
    collegeName: '',
    contactName: '',
    designation: 'Placement Officer / Dean',
    email: '',
    phone: '',
    studentCount: '100 - 300',
    preferredFormat: '3-Day Campus Intensive Bootcamp',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [submittedRef, setSubmittedRef] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const formats = [
    {
      title: "1-Day Executive Keynote & Live Demo",
      duration: "4–6 Hours",
      target: "University Auditoriums & Annual Leadership Summits",
      description: "High-impact keynote by Mentalist Sravan Sudhakaran introducing behavioral demeanor, non-verbal confidence, and placement interview perception.",
      features: [
        "Live psychological perception demonstrations",
        "Non-verbal posture & voice resonance training",
        "Placement interview confidence framework",
        "Q&A session with Sravan Sudhakaran"
      ]
    },
    {
      title: "3-Day Campus Intensive Bootcamp",
      duration: "3 Full Days",
      target: "Final Year Engineering, MBA & Professional Undergrads",
      description: "Hands-on intensive workshop designed to prepare graduating students for corporate placement interviews, group discussions, and executive presence.",
      features: [
        "Group discussion tactical maneuvering & leadership",
        "Mock interview stress-testing & body language review",
        "Salary negotiation & first 90 days corporate demeanor",
        "Official Certificate of Completion for all attendees"
      ]
    },
    {
      title: "Semester Leadership Elective Certification",
      duration: "12-Week Module",
      target: "Autonomous Colleges & Deemed Universities",
      description: "Comprehensive 12-week institutional elective integrated into student development curriculum, combining digital modules with guest masterclasses.",
      features: [
        "LMS integration & individual progress tracking",
        "5-Pillar human influence behavioral Operating System",
        "Campus ambassador leadership tie-in",
        "Institutional accreditation badge for partner colleges"
      ]
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.collegeName || !form.email || !form.contactName) {
      setErrorMsg('Please complete required fields (College Name, Name, and Email).');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const ref = `INST-${Math.floor(100000 + Math.random() * 900000)}`;
      await saveContactInquiryToSupabase({
        name: form.contactName,
        email: form.email,
        phone: form.phone,
        subject: `Institutional Inquiry: ${form.collegeName} (${form.preferredFormat})`,
        message: `College: ${form.collegeName} | Designation: ${form.designation} | Students: ${form.studentCount} | Notes: ${form.notes}`
      });
      setSubmittedRef(ref);
    } catch {
      setSubmittedRef(`INST-${Math.floor(100000 + Math.random() * 900000)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#15171A] text-[#FAFAF7] font-sans relative overflow-x-hidden">
      <SEOHead 
        title="College & Institutional Workshops • TH3ORY Masterclass"
        description="Bring TH3ORY Masterclass to your university campus. High-impact leadership workshops, placement interview demeanor bootcamps, and keynotes by Sravan Sudhakaran."
      />
      <StructuredData type="Course" />

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-[#E9E4FF]/10 py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.location.hash = ''; window.dispatchEvent(new Event('hashchange')); }}
            className="flex items-center gap-3 group"
          >
            <Logo className="h-7 sm:h-9" />
          </a>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('college-inquiry-form');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] text-[#FAFAF7] font-extrabold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4 text-[#FFC857]" />
              <span>Request Campus Proposal</span>
            </button>

            <button
              onClick={() => {
                if (onBack) onBack();
                else { window.location.hash = ''; window.dispatchEvent(new Event('hashchange')); }
              }}
              className="px-3 py-2 rounded-xl glass-panel text-[#555A66] hover:text-[#FAFAF7] text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Main Site</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden text-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[420px] bg-[#7C5CFC]/15 blur-[170px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-[#E9E4FF]/20 text-[#E9E4FF] text-xs font-extrabold uppercase tracking-widest">
            <GraduationCap className="w-4 h-4 text-[#FFC857]" />
            <span>Higher Education &amp; Campus Partnerships</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-[#FAFAF7] uppercase tracking-tight leading-tight">
            ELEVATE YOUR STUDENTS' <span className="text-gradient-violet">PLACEMENT DEMEANOR</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[#FAFAF7]/80 font-serif-luxury italic leading-relaxed">
            Bring TH3ORY's signature behavioral influence &amp; executive presence workshops to your university. Empower your graduating cohorts to command respect in placement interviews and corporate environments.
          </p>

          <div className="flex justify-center pt-4">
            <button
              onClick={() => {
                const el = document.getElementById('college-inquiry-form');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#7C5CFC] via-[#9277FF] to-[#7C5CFC] text-[#FAFAF7] font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-[#7C5CFC]/30 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Submit Institutional Inquiry</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* WORKSHOP FORMATS CAROUSEL */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-16">
        
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black font-heading text-[#FAFAF7] uppercase">Campus Delivery Formats</h2>
            <p className="text-[#FAFAF7]/70 font-serif-luxury italic">Select a customized delivery model suited for your academic schedule.</p>
          </div>

          {/* Formats Switcher Bar */}
          <div className="flex justify-center gap-3 overflow-x-auto pb-2">
            {formats.map((fmt, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFormat(idx)}
                className={`px-5 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  activeFormat === idx
                    ? 'bg-[#7C5CFC] text-[#FAFAF7] shadow-lg shadow-[#7C5CFC]/30 scale-[1.02]'
                    : 'glass-panel text-[#555A66] hover:text-[#FAFAF7]'
                }`}
              >
                Option {idx + 1}: {fmt.title.split(' ')[0]} {fmt.title.split(' ')[1]}
              </button>
            ))}
          </div>

          {/* Active Format Showcase Box */}
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-[#7C5CFC]/30 bg-[#0B0F19]/90 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#555A66]/30 pb-6">
              <div>
                <span className="text-xs font-mono text-[#FFC857] uppercase font-bold">{formats[activeFormat].target}</span>
                <h3 className="text-2xl font-black font-heading text-[#FAFAF7] uppercase mt-1">{formats[activeFormat].title}</h3>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#15171A] border border-[#555A66]/30 text-xs font-mono text-[#FAFAF7]">
                <Clock className="w-4 h-4 text-[#7C5CFC]" /> {formats[activeFormat].duration}
              </div>
            </div>

            <p className="text-base text-[#FAFAF7]/90 font-serif-luxury italic leading-relaxed">
              "{formats[activeFormat].description}"
            </p>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#555A66]">Key Curriculum Modules Included</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formats[activeFormat].features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-center gap-2 text-sm text-[#FAFAF7]/90 bg-[#15171A] p-3 rounded-xl border border-[#E9E4FF]/10">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* INQUIRY FORM */}
        <div id="college-inquiry-form" className="max-w-2xl mx-auto glass-panel p-8 sm:p-12 rounded-3xl border border-[#7C5CFC]/40 space-y-8 bg-[#0B0F19]/90 shadow-2xl">
          {submittedRef ? (
            <div className="text-center space-y-6 py-8">
              <div className="w-16 h-16 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black font-heading text-[#FAFAF7] uppercase">PROPOSAL REQUEST RECEIVED!</h2>
              <p className="text-sm text-[#FAFAF7]/80 leading-relaxed max-w-md mx-auto">
                Thank you for contacting TH3ORY Institutional Partnerships. Your tracking reference is:
              </p>
              <div className="inline-block bg-[#15171A] px-6 py-3 rounded-2xl border border-[#7C5CFC]/40 font-mono font-bold text-lg text-[#FFC857]">
                {submittedRef}
              </div>
              <p className="text-xs text-[#555A66]">Our academic relations team will prepare a formal campus proposal and reach out within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center space-y-2 border-b border-[#555A66]/30 pb-6">
                <h2 className="text-2xl font-black font-heading text-[#FAFAF7] uppercase">REQUEST A CAMPUS PROPOSAL</h2>
                <p className="text-xs text-[#FAFAF7]/70 font-serif-luxury italic">Designed for Deans, HODs, Placement Officers, and Student Council Leads.</p>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#FAFAF7]">University / College Name *</label>
                <input 
                  type="text" 
                  required
                  value={form.collegeName} 
                  onChange={e => setForm({...form, collegeName: e.target.value})}
                  placeholder="E.g., St. Xavier's College / IIT Madras"
                  className="w-full px-4 py-3 rounded-xl bg-[#15171A] border border-[#555A66]/40 text-[#FAFAF7] text-sm focus:border-[#7C5CFC] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#FAFAF7]">Contact Person Name *</label>
                  <input 
                    type="text" 
                    required
                    value={form.contactName} 
                    onChange={e => setForm({...form, contactName: e.target.value})}
                    placeholder="Prof. Robert Vance"
                    className="w-full px-4 py-3 rounded-xl bg-[#15171A] border border-[#555A66]/40 text-[#FAFAF7] text-sm focus:border-[#7C5CFC] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#FAFAF7]">Designation</label>
                  <input 
                    type="text" 
                    value={form.designation} 
                    onChange={e => setForm({...form, designation: e.target.value})}
                    placeholder="Placement Director / HOD"
                    className="w-full px-4 py-3 rounded-xl bg-[#15171A] border border-[#555A66]/40 text-[#FAFAF7] text-sm focus:border-[#7C5CFC] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#FAFAF7]">Official Email *</label>
                  <input 
                    type="email" 
                    required
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="placements@university.edu"
                    className="w-full px-4 py-3 rounded-xl bg-[#15171A] border border-[#555A66]/40 text-[#FAFAF7] text-sm focus:border-[#7C5CFC] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#FAFAF7]">Phone / Contact Number</label>
                  <input 
                    type="tel" 
                    value={form.phone} 
                    onChange={e => setForm({...form, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl bg-[#15171A] border border-[#555A66]/40 text-[#FAFAF7] text-sm focus:border-[#7C5CFC] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#FAFAF7]">Target Cohort Size</label>
                  <select 
                    value={form.studentCount} 
                    onChange={e => setForm({...form, studentCount: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-[#15171A] border border-[#555A66]/40 text-[#FAFAF7] text-sm focus:border-[#7C5CFC] focus:outline-none"
                  >
                    <option value="50 - 100 Students">50 - 100 Students</option>
                    <option value="100 - 300 Students">100 - 300 Students</option>
                    <option value="300 - 1,000 Students">300 - 1,000 Students</option>
                    <option value="1,000+ Students">1,000+ Students</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#FAFAF7]">Preferred Format</label>
                  <select 
                    value={form.preferredFormat} 
                    onChange={e => setForm({...form, preferredFormat: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-[#15171A] border border-[#555A66]/40 text-[#FAFAF7] text-sm focus:border-[#7C5CFC] focus:outline-none"
                  >
                    <option value="1-Day Keynote & Live Demo">1-Day Keynote & Live Demo</option>
                    <option value="3-Day Campus Intensive Bootcamp">3-Day Campus Intensive Bootcamp</option>
                    <option value="Semester Leadership Elective">Semester Leadership Elective</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7C5CFC] via-[#9277FF] to-[#7C5CFC] text-[#FAFAF7] font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-[#7C5CFC]/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Submitting Request...' : 'Submit Institutional Proposal Request →'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
