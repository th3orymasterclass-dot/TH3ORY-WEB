import React, { useState, useEffect } from 'react';
import { 
  Share2, Copy, Check, QrCode, Send, MessageSquare, Mail, 
  ExternalLink, Sparkles, Building2, GraduationCap, Users, 
  Award, Shield, FileText, Download, TrendingUp, CheckCircle2,
  Phone, Globe, Zap, ArrowRight, Eye, RefreshCw
} from 'lucide-react';
import { fetchTeamSharedAssetsFromSupabase, saveTeamSharedAssetToSupabase } from '../../services/supabaseService';

export default function TeamShareableContentPanel({ teamProfile = {}, themeMode = 'dark' }) {
  const isDark = themeMode === 'dark';
  
  // Safe defaults from active team member profile
  const memberName = teamProfile.name || 'Team Officer';
  const memberRole = teamProfile.role || 'Enterprise Outreach Lead';
  const memberDept = teamProfile.department || 'Enterprise & B2B';
  const memberEmail = teamProfile.email || 'team@th3ory.online';
  const memberPhone = teamProfile.phone || '+91 98765 01001';
  const memberId = teamProfile.memberId || teamProfile.member_id || 'TEAM-MEM-1001';
  const repCode = teamProfile.repCode || teamProfile.rep_code || `REP-${memberName.split(' ')[0].toUpperCase()}`;

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://th3ory.online';

  // Links List
  const shareLinks = [
    {
      id: 'enroll',
      title: 'Flagship Masterclass Direct Enrollment (20% Discount Auto-Applied)',
      url: `${originUrl}/#/enroll?coupon=TH3ORY20&rep=${repCode}`,
      desc: 'Direct checkout link with early-bird discount and your personal rep attribution.',
      category: 'Student Sales',
      icon: Zap,
      color: 'from-amber-500 to-yellow-500'
    },
    {
      id: 'enterprise',
      title: 'B2B & Executive Influence Proposals Portal',
      url: `${originUrl}/#/enterprise?rep=${repCode}&assigned_to=${memberId}`,
      desc: 'B2B pitch page. Inquiries submitted here are auto-assigned to your account dashboard.',
      category: 'Enterprise B2B',
      icon: Building2,
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'colleges',
      title: 'University Keynotes & Institutional Workshops',
      url: `${originUrl}/#/colleges?rep=${repCode}&coordinator=${memberId}`,
      desc: 'Institutional proposal landing page for Deans, TPOs, and Student Councils.',
      category: 'Institutional',
      icon: GraduationCap,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'ambassador',
      title: 'Campus Ambassador Recruitment & Leadership Invite',
      url: `${originUrl}/#/ambassador?invited_by=${repCode}`,
      desc: 'Recruitment page for university ambassadors with your personal invite referral tag.',
      category: 'Campus Growth',
      icon: Users,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'affiliate',
      title: 'Affiliate & Influencer Partner Network Invitation',
      url: `${originUrl}/#/affiliate?rep=${repCode}`,
      desc: 'Partner network onboarding for high-profile creators & corporate partners.',
      category: 'Partnerships',
      icon: Share2,
      color: 'from-emerald-500 to-teal-500'
    }
  ];

  // Active Copy States
  const [copiedId, setCopiedId] = useState(null);
  const [qrModalItem, setQrModalItem] = useState(null);

  // Outreach Customizer State
  const [targetCompany, setTargetCompany] = useState('Acme Corporation');
  const [targetPerson, setTargetPerson] = useState('Director of Talent & Leadership');
  const [activeKitTab, setActiveKitTab] = useState('b2b');

  // Shared Assets State
  const [sharedAssets, setSharedAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [assetForm, setAssetForm] = useState({
    title: '',
    category: 'pitch_kit',
    content: '',
    targetDepartment: memberDept
  });

  useEffect(() => {
    async function loadAssets() {
      setLoadingAssets(true);
      const res = await fetchTeamSharedAssetsFromSupabase(memberId, memberDept);
      setSharedAssets(res || []);
      setLoadingAssets(false);
    }
    loadAssets();
  }, [memberId, memberDept]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveAsset = async (e) => {
    e.preventDefault();
    if (!assetForm.title) return;
    const res = await saveTeamSharedAssetToSupabase({
      ...assetForm,
      createdBy: `${memberName} (${memberRole})`,
      targetMemberId: null,
      targetDepartment: assetForm.targetDepartment
    });
    if (res && res.asset) {
      setSharedAssets(prev => [res.asset, ...prev]);
      setShowAssetModal(false);
      setAssetForm({ title: '', category: 'pitch_kit', content: '', targetDepartment: memberDept });
    }
  };

  // Outreach Pitch Templates
  const b2bPitch = `Subject: Executive Cognitive Influence & Behavioral Negotiation for ${targetCompany} Leadership

Dear ${targetPerson},

I am reaching out from Mentalist Sravan Production's TH3ORY team regarding our flagship Executive Behavioral Psychology & High-Stakes Influence Masterclass.

Unlike conventional corporate training, TH3ORY delivers 50 high-impact modules engineered specifically for CXOs, directors, and negotiation leaders covering:
• Non-Verbal De-escalation & Kinetic Rapport
• Behavioral Priming & Decision Architecture
• Executive Presence & High-Stakes Pitch Calibration

You can review our executive syllabus and request a custom corporate cohort proposal directly via my dedicated portal link:
👉 ${originUrl}/#/enterprise?rep=${repCode}&assigned_to=${memberId}

I would welcome a 15-minute executive briefing with your team this week.

Warm regards,

${memberName}
${memberRole} • TH3ORY Masterclass
Direct: ${memberPhone} | Email: ${memberEmail}
Representative ID: ${repCode}
https://th3ory.online`;

  const collegePitch = `Subject: Proposal for 1-Day Cognitive Influence & Masterclass Workshop at Your Esteemed Campus

Respected Dean / Placement Director,

As the Institutional Coordinator for TH3ORY Masterclass of Influencing (produced by Mentalist Sravan), I would like to propose an immersive campus workshop on Psychological Influence, Executive Presence, and High-Stakes Communication for your pre-final and final-year students.

Key Outcomes for Students:
1. Mastering Body Language & Micro-Expression Reading in Interviews
2. Cognitive Persuasion & Public Communication
3. Digital Certification and Verifiable Career Credentials

Explore the full institutional module and schedule our campus briefing via my official coordinator page:
👉 ${originUrl}/#/colleges?rep=${repCode}&coordinator=${memberId}

Looking forward to bringing this high-demand behavioral masterclass to your campus.

Sincerely,

${memberName}
${memberRole}
Campus & University Relations • TH3ORY Masterclass
Phone: ${memberPhone} | Email: ${memberEmail}`;

  const whatsappBlast = `🔥 *TH3ORY Masterclass of Influencing — Exclusive 20% Team Access*

Master high-stakes persuasion, non-verbal cues, and executive behavioral engineering with Mentalist Sravan.

✅ 50 In-Depth Production Modules
✅ Verifiable Digital Credentials
✅ Cognitive Negotiation Frameworks

👉 *Unlock Instant Access with 20% Team Discount:*
${originUrl}/#/enroll?coupon=TH3ORY20&rep=${repCode}

_Feel free to reach out to me directly if you have any questions!_
— *${memberName}* (${memberRole})`;

  const linkedinPost = `Influence is not a game of chance—it is an engineered discipline of behavioral psychology and cognitive science.

Proud to represent the TH3ORY Masterclass of Influencing team. Whether you are leading board negotiations, scaling an enterprise, or presenting under intense scrutiny, our 50-module curriculum is designed to transform your presence.

Explore the curriculum and claim your exclusive 20% partner enrollment here:
👉 ${originUrl}/#/enroll?coupon=TH3ORY20&rep=${repCode}

#Leadership #Negotiation #BehavioralPsychology #ExecutivePresence #TH3ORY`;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Account Alignment Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden shadow-2xl ${
        isDark 
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950/50 to-purple-950/40 border-indigo-500/30 text-white' 
          : 'bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-indigo-200 text-slate-900 shadow-md'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shrink-0">
              {memberName[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">{memberName}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                  ACTIVE
                </span>
              </div>
              <p className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                {memberRole} • <span className="opacity-80">{memberDept}</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono">
                <span>ID: <strong className="text-white">{memberId}</strong></span>
                <span>•</span>
                <span>Rep Tag: <strong className="text-purple-300">{repCode}</strong></span>
                <span>•</span>
                <span>Email: <strong className="text-slate-300">{memberEmail}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleCopy('all-creds', `TH3ORY Team Representative: ${memberName} | Rep Code: ${repCode} | Portal: ${originUrl}/#/team`)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isDark 
                  ? 'bg-slate-900/80 border-slate-700 hover:border-indigo-400 text-slate-200' 
                  : 'bg-white border-slate-300 hover:border-indigo-500 text-slate-800'
              }`}
            >
              {copiedId === 'all-creds' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
              <span>{copiedId === 'all-creds' ? 'Copied Details' : 'Copy Rep Info'}</span>
            </button>

            <a
              href={`mailto:?subject=TH3ORY Masterclass Inquiry&body=Contact Representative: ${memberName} (${memberRole}) at ${memberEmail}`}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-500/25"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Dispatch</span>
            </a>
          </div>
        </div>
      </div>

      {/* 1. Account-Aligned Shareable Link Generator */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Share2 className="w-5 h-5 text-indigo-500" />
              Your Tailor-Made Tracking &amp; Outreach Links
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              All links contain your unique tracking handle (<code className="text-indigo-400 font-bold">{repCode}</code>). Inquiries and enrollments generated through these links attribute directly to your dashboard.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {shareLinks.map(link => {
            const Icon = link.icon;
            const isCopied = copiedId === link.id;

            return (
              <div 
                key={link.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900/80 border-slate-800 hover:border-indigo-500/40' : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg bg-gradient-to-br ${link.color} text-white shadow-xs`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <h4 className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {link.title}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        isDark ? 'bg-slate-800 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {link.category}
                      </span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {link.desc}
                    </p>
                    <div className="pt-1">
                      <code className={`text-[11px] font-mono px-2.5 py-1 rounded-lg inline-block break-all select-all ${
                        isDark ? 'bg-slate-950 text-indigo-300 border border-slate-800' : 'bg-slate-50 text-indigo-700 border border-slate-200'
                      }`}>
                        {link.url}
                      </code>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                    <button
                      type="button"
                      onClick={() => handleCopy(link.id, link.url)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                          : isDark
                            ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-600/30'
                            : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQrModalItem(link)}
                      title="Generate QR Code"
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out TH3ORY Masterclass: ${link.url}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Share via WhatsApp"
                      className="p-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Test Link in New Tab"
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Tailor-Made Ready-to-Send Outreach Kits */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg space-y-6 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Sparkles className="w-5 h-5 text-amber-400" />
              Tailor-Made Outreach &amp; Pitch Kits
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Pre-written, personalized proposals auto-populated with your signature, contact handles, and assigned tracking tags.
            </p>
          </div>

          {/* Kit Tabs */}
          <div className={`flex items-center p-1 rounded-xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {[
              { id: 'b2b', label: 'B2B / CXO Email' },
              { id: 'college', label: 'College / Dean Letter' },
              { id: 'whatsapp', label: 'WhatsApp Blast' },
              { id: 'linkedin', label: 'LinkedIn Post' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveKitTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeKitTab === tab.id
                    ? isDark ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white text-indigo-700 shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Parameter Adjusters for B2B / College */}
        {(activeKitTab === 'b2b' || activeKitTab === 'college') && (
          <div className={`p-4 rounded-2xl border grid grid-cols-1 sm:grid-cols-2 gap-3 ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Target Organization / College Name
              </label>
              <input
                type="text"
                value={targetCompany}
                onChange={e => setTargetCompany(e.target.value)}
                placeholder="e.g. Infosys, IIT Madras, Deloitte"
                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none border ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Recipient Title / Person
              </label>
              <input
                type="text"
                value={targetPerson}
                onChange={e => setTargetPerson(e.target.value)}
                placeholder="e.g. Chief Learning Officer, Dean of Academics"
                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none border ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>
        )}

        {/* Pitch Content Display */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              readOnly
              rows={11}
              value={
                activeKitTab === 'b2b' ? b2bPitch :
                activeKitTab === 'college' ? collegePitch :
                activeKitTab === 'whatsapp' ? whatsappBlast : linkedinPost
              }
              className={`w-full p-4 rounded-2xl font-mono text-xs leading-relaxed resize-none focus:outline-none border select-all ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-slate-200' 
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Click below to copy this tailored message or launch it directly in your mail/chat client.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(
                  'active-kit',
                  activeKitTab === 'b2b' ? b2bPitch :
                  activeKitTab === 'college' ? collegePitch :
                  activeKitTab === 'whatsapp' ? whatsappBlast : linkedinPost
                )}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === 'active-kit' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedId === 'active-kit' ? 'Copied to Clipboard!' : 'Copy Full Template'}</span>
              </button>

              {activeKitTab === 'whatsapp' ? (
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappBlast)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Launch WhatsApp</span>
                </a>
              ) : (
                <a
                  href={`mailto:?subject=${encodeURIComponent(`TH3ORY Masterclass Partnership for ${targetCompany}`)}&body=${encodeURIComponent(activeKitTab === 'b2b' ? b2bPitch : collegePitch)}`}
                  className={`px-4 py-2.5 rounded-xl border font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-800'
                  }`}
                >
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>Open Email Client</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Official Digital Representative ID Badge */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-lg space-y-6 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div>
          <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Award className="w-5 h-5 text-purple-400" />
            Official Verified Representative ID Card
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Digital representation credential authenticating your authorization for corporate negotiations and university partnerships.
          </p>
        </div>

        {/* Visual Badge Card */}
        <div className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-br from-[#0B0F19] via-[#05080F] to-indigo-950 border-2 border-indigo-500/40 shadow-2xl relative overflow-hidden text-white space-y-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Bar of Badge */}
          <div className="flex items-center justify-between border-b border-indigo-900/80 pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <span className="font-black text-xs uppercase tracking-widest text-indigo-200">
                TH3ORY MASTERCLASS
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-wider">
              VERIFIED REP
            </span>
          </div>

          {/* Body of Badge */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-amber-500 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center font-black text-2xl text-white">
                {memberName[0].toUpperCase()}
              </div>
            </div>
            <div>
              <h4 className="font-black text-lg text-white leading-tight">{memberName}</h4>
              <p className="text-xs text-indigo-300 font-semibold">{memberRole}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{memberDept}</p>
            </div>
          </div>

          {/* Badge Metadata */}
          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-500 font-bold uppercase block">Official ID</span>
              <span className="font-mono font-bold text-indigo-300">{memberId}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-500 font-bold uppercase block">Rep Handle</span>
              <span className="font-mono font-bold text-purple-300">{repCode}</span>
            </div>
          </div>

          {/* Footer of Badge */}
          <div className="pt-2 border-t border-indigo-900/60 flex items-center justify-between text-[9px] text-slate-400">
            <span>Mentalist Sravan Production</span>
            <span>Validity: 2026 Season</span>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Print or Save Representative Card</span>
          </button>
        </div>
      </div>

      {/* QR Code Generator Modal */}
      {qrModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-black text-white text-base">{qrModalItem.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{qrModalItem.category}</p>
            </div>

            {/* Simulated Live QR Code SVG */}
            <div className="p-4 rounded-2xl bg-white mx-auto inline-block shadow-inner">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrModalItem.url)}`}
                alt="QR Code"
                className="w-44 h-44 mx-auto rounded-lg"
              />
            </div>

            <p className="text-[11px] text-slate-400 font-mono break-all px-2 select-all">
              {qrModalItem.url}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleCopy('modal-qr', qrModalItem.url)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedId === 'modal-qr' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'modal-qr' ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => setQrModalItem(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
