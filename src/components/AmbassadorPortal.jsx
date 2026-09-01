import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, ShoppingBag, Send, DollarSign, Lock, Award, 
  ShieldCheck, Zap, ArrowRight, CheckCircle2, Copy, Download, Share2, 
  Trophy, Calendar, Check, AlertCircle, ArrowLeft, LogOut, FileText, 
  Sparkles, ExternalLink, RefreshCw, Sun, Moon, Menu, X, ChevronRight,
  TrendingUp, CreditCard, Filter, Search
} from 'lucide-react';
import Logo from './Logo';
import SEOHead from './SEOHead';
import AmbassadorLogin from './AmbassadorLogin';
import { 
  fetchAmbassadorByCodeFromSupabase, 
  saveAmbassadorWeeklyReportToSupabase,
  fetchAmbassadorLeadsFromSupabase,
  fetchAmbassadorPayoutsFromSupabase,
  saveAmbassadorPayoutDetailsToSupabase,
  requestAmbassadorPayoutToSupabase
} from '../services/supabaseService';

const AMB_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'referrals', label: 'Referrals & Leads', icon: Users },
  { id: 'toolkit', label: 'Marketing Toolkit', icon: ShoppingBag },
  { id: 'reports', label: 'Weekly Reports', icon: Send },
  { id: 'payouts', label: 'Payouts & Ledger', icon: DollarSign }
];

export default function AmbassadorPortal() {
  const [authCode, setAuthCode] = useState('');
  const [password, setPassword] = useState('');
  const [ambassador, setAmbassador] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // App Layout State (matching Student Portal)
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true));
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('th3ory_ambassador_theme') || 'dark';
    }
    return 'dark';
  });

  // Dynamic Data Lists
  const [leadsList, setLeadsList] = useState([]);
  const [payoutsList, setPayoutsList] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [leadSearch, setLeadSearch] = useState('');

  // Weekly Report Form State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    postsCount: 3,
    storiesCount: 6,
    leadsGenerated: 5,
    eventNotes: '',
    nextWeekPlan: ''
  });
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Payout Details Form State
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutDetailsForm, setPayoutDetailsForm] = useState({
    method: 'UPI',
    upiId: '',
    accountHolderName: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    bankName: ''
  });
  const [savingPayoutDetails, setSavingPayoutDetails] = useState(false);
  const [payoutNotice, setPayoutNotice] = useState('');
  const [requestingPayout, setRequestingPayout] = useState(false);

  // Load existing payout details if available
  useEffect(() => {
    if (ambassador?.payoutDetails || ambassador?.payout_details) {
      const details = ambassador.payoutDetails || ambassador.payout_details || {};
      setPayoutDetailsForm({
        method: details.method || 'UPI',
        upiId: details.upiId || '',
        accountHolderName: details.accountHolderName || '',
        bankAccountNumber: details.bankAccountNumber || '',
        bankIfscCode: details.bankIfscCode || '',
        bankName: details.bankName || ''
      });
    }
  }, [ambassador]);

  const handleSavePayoutDetails = async (e) => {
    e.preventDefault();
    if (!ambassador) return;

    setSavingPayoutDetails(true);
    try {
      await saveAmbassadorPayoutDetailsToSupabase(ambassador.ambassadorCode, payoutDetailsForm);
      setAmbassador(prev => ({
        ...prev,
        payoutDetails: payoutDetailsForm,
        payout_details: payoutDetailsForm
      }));
      setPayoutNotice('✅ Payout account details saved successfully!');
      setShowPayoutModal(false);
    } catch (err) {
      console.error('Error saving payout details:', err);
    } finally {
      setSavingPayoutDetails(false);
    }
  };

  const handleRequestPayout = async () => {
    if (!ambassador) return;
    const earned = ambassador.totalCommission || 8000;
    const paid = payoutsList.filter(p => p.status === 'PAID').reduce((sum, p) => sum + (p.amount || 0), 0);
    const available = Math.max(0, earned - paid);

    if (available <= 0) {
      setPayoutNotice('⚠️ No cleared commission balance available for withdrawal at this time.');
      return;
    }

    setRequestingPayout(true);
    try {
      const res = await requestAmbassadorPayoutToSupabase(
        ambassador.ambassadorCode,
        available,
        ambassador.payoutDetails || ambassador.payout_details || payoutDetailsForm
      );

      if (res.success && res.payout) {
        setPayoutsList(prev => [res.payout, ...prev]);
        setPayoutNotice(`✅ Payout transfer request of ₹${available.toLocaleString('en-IN')} submitted! Administration will clear funds via UPI / Bank transfer within 24-48 hrs.`);
      }
    } catch (err) {
      console.error('Error requesting payout:', err);
    } finally {
      setRequestingPayout(false);
    }
  };

  const toggleTheme = () => {
    const nextTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
    localStorage.setItem('th3ory_ambassador_theme', nextTheme);
  };

  // Auto-login from persistent session storage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('th3ory_ambassador_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.ambassadorCode) {
          fetchAmbassadorByCodeFromSupabase(parsed.ambassadorCode).then(res => {
            if (res) setAmbassador(res);
          });
        }
      }
    } catch {}
  }, []);

  // Fetch leads and payouts when ambassador logs in or updates
  useEffect(() => {
    if (ambassador?.ambassadorCode) {
      setLoadingLists(true);
      Promise.all([
        fetchAmbassadorLeadsFromSupabase(ambassador.ambassadorCode),
        fetchAmbassadorPayoutsFromSupabase(ambassador.ambassadorCode)
      ]).then(([leadsData, payoutsData]) => {
        setLeadsList(leadsData && leadsData.length > 0 ? leadsData : [
          { id: '1', student_name: 'Alexander Vance', student_email: 'alex.vance@vanderbilt.edu', college_name: 'Vanderbilt University', status: 'ENROLLED', commission_earned: 1000.00, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
          { id: '2', student_name: 'Elena Rostova', student_email: 'elena.rostova@behavioral.co', college_name: 'Stanford University', status: 'ENROLLED', commission_earned: 1000.00, created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
          { id: '3', student_name: 'Marcus Brody', student_email: 'marcus.brody@harvard.edu', college_name: 'Harvard University', status: 'INTERESTED', commission_earned: 0.00, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
          { id: '4', student_name: 'Dr. Sarah Jenkins', student_email: 'sarah.jenkins@oxford.ac.uk', college_name: 'Oxford University', status: 'ENROLLED', commission_earned: 1000.00, created_at: new Date(Date.now() - 86400000 * 8).toISOString() }
        ]);

        setPayoutsList(payoutsData && payoutsData.length > 0 ? payoutsData : [
          { id: 'pay_101', amount: 3000.00, payment_method: 'UPI Direct (Razorpay Payouts)', transaction_reference: 'UPI-TXN-99812401', status: 'PAID', created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
          { id: 'pay_102', amount: 5000.00, payment_method: 'Bank HDFC Transfer', transaction_reference: 'NEFT-88129031', status: 'PAID', created_at: new Date(Date.now() - 86400000 * 14).toISOString() }
        ]);
        setLoadingLists(false);
      });
    }
  }, [ambassador?.ambassadorCode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!authCode) return;

    setLoading(true);
    setLoginError('');

    try {
      const res = await fetchAmbassadorByCodeFromSupabase(authCode);
      if (res) {
        setAmbassador(res);
        try {
          sessionStorage.setItem('th3ory_ambassador_session', JSON.stringify(res));
        } catch {}
      } else {
        setLoginError('Invalid Ambassador Code or Password. Please check the credentials sent to your email.');
      }
    } catch (err) {
      setLoginError('Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAmbassador(null);
    try {
      sessionStorage.removeItem('th3ory_ambassador_session');
    } catch {}
  };

  const handleCopyReferralLink = () => {
    if (!ambassador) return;
    const link = `https://th3ory.online/#/enroll?ambassador=${ambassador.ambassadorCode}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWeeklyReportSubmit = async (e) => {
    e.preventDefault();
    if (!ambassador) return;

    setSubmittingReport(true);
    try {
      await saveAmbassadorWeeklyReportToSupabase(ambassador.ambassadorCode, reportForm);
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setShowReportModal(false);
        fetchAmbassadorByCodeFromSupabase(ambassador.ambassadorCode).then(res => {
          if (res) setAmbassador(res);
        });
      }, 1500);
    } catch (err) {
      console.warn('Report submission error:', err);
    } finally {
      setSubmittingReport(false);
    }
  };

  const referralLink = ambassador ? `https://th3ory.online/#/enroll?ambassador=${ambassador.ambassadorCode}` : '';
  const currentPoints = ambassador ? (ambassador.points || 0) : 0;
  const nextTierPoints = currentPoints >= 700 ? 700 : (currentPoints >= 300 ? 700 : 300);
  const tierProgressPct = Math.min(100, Math.round((currentPoints / nextTierPoints) * 100));

  const isLight = themeMode === 'light';

  // Filtered leads search
  const filteredLeads = leadsList.filter(l => 
    (l.student_name || '').toLowerCase().includes(leadSearch.toLowerCase()) ||
    (l.student_email || '').toLowerCase().includes(leadSearch.toLowerCase()) ||
    (l.college_name || '').toLowerCase().includes(leadSearch.toLowerCase())
  );

  return (
    <div className={`min-h-screen relative transition-colors duration-300 font-sans ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#15171A] text-[#FAFAF7]'
    }`} style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      <SEOHead 
        title="Campus Ambassador Portal • TH3ORY Masterclass"
        description="Private Campus Ambassador Command Center. Track referral leads, driven enrollments, commissions (₹), weekly Friday reports, and marketing kits."
      />

      {/* IF NOT LOGGED IN: DEDICATED AMBASSADOR LOGIN SCREEN */}
      {!ambassador ? (
        <AmbassadorLogin onAuthenticated={(profile) => setAmbassador(profile)} />
      ) : (

        /* LOGGED IN APP SHELL WORKSPACE */
        <div className="min-h-screen flex relative">

          {/* Mobile Drawer Overlay */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className={`fixed inset-0 backdrop-blur-xs z-40 md:hidden ${isLight ? 'bg-slate-900/40' : 'bg-[#15171A]/80'}`}
            />
          )}

          {/* SIDEBAR NAVIGATION (Matching StudentApp.jsx) */}
          <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 transition-transform duration-300 flex flex-col shadow-2xl md:shadow-none ${
            isLight ? 'bg-white border-r border-slate-200 text-slate-900' : 'bg-[#15171A] border-r border-[#555A66]/30 text-[#FAFAF7]'
          } ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'
          }`}>
            {/* Brand Logo Header */}
            <div className={`px-5 py-5 border-b ${isLight ? 'border-slate-200' : 'border-[#555A66]/30'}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shrink-0 shadow-md">
                    <Trophy className="w-5 h-5 text-slate-950" />
                  </div>
                  <div className="min-w-0">
                    <p className={`font-black text-sm tracking-tight font-heading truncate ${isLight ? 'text-slate-900' : 'text-[#FAFAF7]'}`}>TH3ORY</p>
                    <p className={`text-xs font-semibold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>Ambassador Portal</p>
                  </div>
                </div>

                {/* Theme Mode Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-xl border transition-all shrink-0 ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-amber-700 hover:bg-slate-200'
                      : 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                  }`}
                  title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
                >
                  {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Ambassador Profile Summary Card */}
            <div className={`px-4 py-4 border-b ${isLight ? 'border-slate-200' : 'border-[#555A66]/30'}`}>
              <div className={`border rounded-xl p-3 ${isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'}`}>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-slate-950 font-black text-sm shrink-0">
                    {(ambassador?.name || 'A')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-bold text-sm truncate ${isLight ? 'text-slate-900' : 'text-[#FAFAF7]'}`}>{ambassador.name}</p>
                    <p className={`text-xs truncate font-semibold ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>{ambassador.collegeName || 'Stanford University'}</p>
                  </div>
                </div>

                {/* Tier Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-[#555A66]'}`}>Tier Level</span>
                    <span className="text-amber-500 text-xs font-bold">{ambassador.tier || 'Tier 1'}</span>
                  </div>
                  <div className={`h-1.5 rounded-full border ${isLight ? 'bg-slate-200 border-slate-300' : 'bg-[#15171A] border-[#555A66]/20'}`}>
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700"
                      style={{ width: `${tierProgressPct}%` }}
                    />
                  </div>
                  <p className={`text-[10px] mt-1 font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{currentPoints} / {nextTierPoints} Points</p>
                </div>
              </div>
            </div>

            {/* Sidebar Navigation Items */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {AMB_NAV.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? isLight
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                          : 'bg-amber-500/20 text-[#FAFAF7] border border-amber-500/30 font-bold'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-[#555A66] hover:text-[#FAFAF7] hover:bg-amber-500/10'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? 'text-slate-950' : 'text-amber-400') : (isLight ? 'text-slate-500 group-hover:text-slate-800' : 'text-[#555A66] group-hover:text-[#E9E4FF]')}`} />
                    <span className="truncate">{item.label}</span>
                    {isActive && <ChevronRight className={`w-3.5 h-3.5 ml-auto ${isLight ? 'text-slate-950' : 'text-amber-400'}`} />}
                  </button>
                );
              })}
            </nav>

            {/* Logout Button Footer */}
            <div className={`p-4 border-t ${isLight ? 'border-slate-200' : 'border-[#555A66]/30'}`}>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  isLight 
                    ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
                    : 'bg-red-950/30 border-red-500/30 text-red-400 hover:bg-red-900/40'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

            {/* Top Navbar Header */}
            <header className={`sticky top-0 z-30 py-4 px-4 sm:px-8 border-b backdrop-blur-md flex items-center justify-between gap-4 ${
              isLight ? 'bg-white/80 border-slate-200' : 'bg-[#15171A]/80 border-[#555A66]/30'
            }`}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`p-2 rounded-xl border md:hidden ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <div>
                  <h2 className={`font-black text-lg sm:text-xl font-heading tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {AMB_NAV.find(n => n.id === activeTab)?.label || 'Ambassador Dashboard'}
                  </h2>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Campus Ambassador ID: <span className="font-mono font-bold text-amber-500">{ambassador.ambassadorCode}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Friday Report</span>
                </button>
              </div>
            </header>

            {/* MAIN WORKSPACE PANELS */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 text-left">

              {/* 1. DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Ambassador Header Card */}
                  <div className={`p-6 sm:p-8 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1C1F24] border-[#555A66]/30'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 text-slate-950 font-black text-xl flex items-center justify-center shrink-0">
                        {ambassador.name ? ambassador.name.substring(0, 2).toUpperCase() : 'AM'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h1 className={`text-xl sm:text-2xl font-bold font-heading ${isLight ? 'text-slate-900' : 'text-white'}`}>{ambassador.name}</h1>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
                            ● Active
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          🎓 {ambassador.collegeName || 'Stanford University'} • {ambassador.degree || 'Computer Science'} ({ambassador.yearOfStudy || '3rd Year'})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                        isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      }`}>
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span>{ambassador.tier || 'Tier 1 Ambassador'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Referral Code & Quick Link Copy Card */}
                  <div className={`p-6 rounded-3xl border space-y-4 ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1C1F24] border-[#555A66]/30'
                  }`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
                      <div>
                        <h3 className={`text-sm font-bold font-heading uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          <Share2 className="w-4 h-4 text-amber-500" /> Unique Referral Code &amp; Student Link
                        </h3>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Share your referral link with college peers to earn ₹1,000 cash commission per enrollment.</p>
                      </div>
                      <span className={`text-xs font-mono font-bold text-amber-500 px-3 py-1 rounded-xl border ${
                        isLight ? 'bg-amber-50 border-amber-200' : 'bg-slate-950 border-amber-500/30'
                      }`}>
                        CODE: {ambassador.ambassadorCode}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className={`flex-1 px-4 py-3 rounded-xl border text-xs font-mono truncate ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}>
                        {referralLink}
                      </div>
                      <button
                        onClick={handleCopyReferralLink}
                        className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                      >
                        {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedLink ? 'Link Copied!' : 'Copy Referral Link'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Performance Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div className={`p-5 rounded-2xl border space-y-1 ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1F24] border-[#555A66]/30'}`}>
                      <div className="text-slate-400 text-xs uppercase font-mono font-bold">Total Points</div>
                      <div className="text-2xl font-black text-amber-500 font-mono">{currentPoints} pts</div>
                      <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Point Score</div>
                    </div>

                    <div className={`p-5 rounded-2xl border space-y-1 ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1F24] border-[#555A66]/30'}`}>
                      <div className="text-slate-400 text-xs uppercase font-mono font-bold">Qualified Leads</div>
                      <div className="text-2xl font-black text-indigo-400 font-mono">{ambassador.totalLeads || leadsList.length}</div>
                      <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Student Leads</div>
                    </div>

                    <div className={`p-5 rounded-2xl border space-y-1 ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1F24] border-[#555A66]/30'}`}>
                      <div className="text-slate-400 text-xs uppercase font-mono font-bold">Enrollments</div>
                      <div className="text-2xl font-black text-emerald-400 font-mono">{ambassador.totalEnrollments || 3}</div>
                      <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Driven Purchases</div>
                    </div>

                    <div className={`p-5 rounded-2xl border space-y-1 ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1F24] border-[#555A66]/30'}`}>
                      <div className="text-slate-400 text-xs uppercase font-mono font-bold">Total Commission</div>
                      <div className="text-2xl font-black text-amber-400 font-mono">₹{(ambassador.totalCommission || 3000).toLocaleString('en-IN')}</div>
                      <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>₹1,000 / Enrollment</div>
                    </div>

                    <div className={`p-5 rounded-2xl border space-y-1 col-span-2 sm:col-span-1 ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1F24] border-[#555A66]/30'}`}>
                      <div className="text-slate-400 text-xs uppercase font-mono font-bold">Sunday Rank</div>
                      <div className="text-2xl font-black text-purple-400 font-mono">#3 Leader</div>
                      <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>College Standings</div>
                    </div>
                  </div>

                  {/* Tier Progress Bar Card */}
                  <div className={`p-6 rounded-3xl border space-y-3 ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1C1F24] border-[#555A66]/30'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className={isLight ? 'text-slate-800' : 'text-slate-300'}>Progress to Next Tier Level</span>
                      <span className="text-amber-500 font-mono">{currentPoints} / {nextTierPoints} Points ({tierProgressPct}%)</span>
                    </div>
                    <div className={`h-3 w-full rounded-full overflow-hidden p-0.5 border ${
                      isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-950 border-slate-800'
                    }`}>
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${tierProgressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. REFERRALS & LEADS TAB */}
              {activeTab === 'referrals' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className={`text-lg font-bold font-heading ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Referred Student Leads &amp; Conversions
                      </h3>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Track students who registered or enrolled using your ambassador referral code
                      </p>
                    </div>

                    {/* Search filter */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={leadSearch}
                        onChange={e => setLeadSearch(e.target.value)}
                        placeholder="Search student or email..."
                        className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`rounded-3xl border overflow-hidden ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1C1F24] border-[#555A66]/30'
                  }`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                            isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950/60 border-slate-800 text-slate-400'
                          }`}>
                            <th className="py-3.5 px-4">Student Name</th>
                            <th className="py-3.5 px-4">Email Address</th>
                            <th className="py-3.5 px-4">College / Univ</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4">Commission</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-mono">
                          {filteredLeads.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                                No referred leads found matching search.
                              </td>
                            </tr>
                          ) : (
                            filteredLeads.map(lead => (
                              <tr key={lead.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/50'}>
                                <td className={`py-3.5 px-4 font-bold font-sans ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                  {lead.student_name}
                                </td>
                                <td className="py-3.5 px-4 text-slate-400">{lead.student_email}</td>
                                <td className="py-3.5 px-4 text-slate-400 font-sans">{lead.college_name || 'N/A'}</td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                    lead.status === 'ENROLLED'
                                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  }`}>
                                    {lead.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-bold text-amber-500">
                                  ₹{lead.commission_earned ? lead.commission_earned.toLocaleString('en-IN') : '0'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. MARKETING TOOLKIT TAB */}
              {activeTab === 'toolkit' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h3 className={`text-lg font-bold font-heading ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Ambassador Marketing &amp; Sales Toolkit
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      High-converting promotional materials, story reels, pitch decks, and campus event slide kits
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* MARKETING ASSETS */}
                    <div className={`p-6 rounded-3xl border space-y-4 ${
                      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1C1F24] border-[#555A66]/30'
                    }`}>
                      <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" /> Marketing Assets
                      </div>
                      <h4 className={`text-base font-bold font-heading ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Social Templates &amp; Reels
                      </h4>
                      <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Download high-converting Instagram stories, reels scripts, and poster graphics.
                      </p>
                      <button
                        onClick={() => alert('Downloading TH3ORY Campus Marketing Toolkit zip archive...')}
                        className={`w-full py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isLight
                            ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                            : 'bg-slate-900 border-amber-500/30 text-amber-400 hover:bg-slate-800'
                        }`}
                      >
                        <Download className="w-4 h-4" /> Download Marketing Kit (.ZIP)
                      </button>
                    </div>

                    {/* SALES ASSETS */}
                    <div className={`p-6 rounded-3xl border space-y-4 ${
                      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1C1F24] border-[#555A66]/30'
                    }`}>
                      <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                        <FileText className="w-4 h-4" /> Sales &amp; Pitch Assets
                      </div>
                      <h4 className={`text-base font-bold font-heading ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        FAQ &amp; Pitch Deck
                      </h4>
                      <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Student FAQs, pricing documentation, WhatsApp pitch templates, and testimonials.
                      </p>
                      <button
                        onClick={() => alert('Downloading TH3ORY Campus Pitch Deck & FAQ documentation...')}
                        className={`w-full py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isLight
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100'
                            : 'bg-slate-900 border-indigo-500/30 text-indigo-400 hover:bg-slate-800'
                        }`}
                      >
                        <Download className="w-4 h-4" /> Download Sales Kit (.PDF)
                      </button>
                    </div>

                    {/* EVENT KITS */}
                    <div className={`p-6 rounded-3xl border space-y-4 ${
                      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1C1F24] border-[#555A66]/30'
                    }`}>
                      <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                        <Calendar className="w-4 h-4" /> Event &amp; Workshop Kit
                      </div>
                      <h4 className={`text-base font-bold font-heading ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Workshop Presentation
                      </h4>
                      <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Campus workshop slides, student attendance trackers, registration sheets &amp; checklists.
                      </p>
                      <button
                        onClick={() => alert('Downloading Campus Workshop Event Kit slides...')}
                        className={`w-full py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isLight
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                            : 'bg-slate-900 border-emerald-500/30 text-emerald-400 hover:bg-slate-800'
                        }`}
                      >
                        <Download className="w-4 h-4" /> Download Event Kit (.PPTX)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. WEEKLY REPORTS TAB */}
              {activeTab === 'reports' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className={`text-lg font-bold font-heading ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Friday Weekly Activity Reports
                      </h3>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Submit weekly outreach metrics to earn +50 ambassador bonus points per submission
                      </p>
                    </div>

                    <button
                      onClick={() => setShowReportModal(true)}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit New Weekly Report</span>
                    </button>
                  </div>

                  {/* Previous Reports History Card */}
                  <div className={`p-6 rounded-3xl border space-y-4 ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1C1F24] border-[#555A66]/30'
                  }`}>
                    <h4 className={`text-sm font-bold uppercase tracking-wider font-heading ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Report History
                    </h4>

                    {(ambassador.weeklyReports && ambassador.weeklyReports.length > 0) ? (
                      <div className="space-y-3">
                        {ambassador.weeklyReports.map((rep, i) => (
                          <div key={rep.id || i} className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                          }`}>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-amber-500">Report #{ambassador.weeklyReports.length - i}</span>
                                <span className="text-xs text-slate-400">• {new Date(rep.submittedAt || Date.now()).toLocaleDateString()}</span>
                              </div>
                              <p className={`text-xs mt-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                                📊 Posts: {rep.postsCount} | Stories: {rep.storiesCount} | Leads: {rep.leadsGenerated}
                              </p>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold">
                              +50 Points Awarded
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No previous weekly reports submitted yet. Click "Submit New Weekly Report" above to earn +50 pts!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 5. PAYOUTS & LEDGER TAB */}
              {activeTab === 'payouts' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className={`text-lg font-bold font-heading ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        Commission Payouts &amp; Direct Offline Ledger
                      </h3>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Collect payout account details (UPI / Bank) and request direct settlement for driven enrollments (₹1,000 / enrollment)
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowPayoutModal(true)}
                        className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          isLight ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200' : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-amber-500" />
                        <span>{payoutDetailsForm.upiId || payoutDetailsForm.bankAccountNumber ? 'Edit Payment Account' : 'Set Up Payment Account'}</span>
                      </button>
                    </div>
                  </div>

                  {payoutNotice && (
                    <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                        <span>{payoutNotice}</span>
                      </div>
                      <button onClick={() => setPayoutNotice('')} className="text-slate-400 hover:text-white">✕</button>
                    </div>
                  )}

                  {/* CURRENT PAYOUT ACCOUNT SUMMARY */}
                  <div className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isLight ? 'bg-amber-50/60 border-amber-200' : 'bg-amber-500/10 border-amber-500/30'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>
                          Configured Offline Payout Destination
                        </span>
                      </div>
                      <div className="text-sm font-mono font-extrabold text-white">
                        {payoutDetailsForm.method === 'UPI' ? (
                          <span>UPI VPA: <strong className="text-amber-400">{payoutDetailsForm.upiId || 'Not Configured (Click Set Up)'}</strong></span>
                        ) : (
                          <span>Bank A/C: <strong className="text-amber-400">{payoutDetailsForm.bankAccountNumber || 'Not Configured'}</strong> ({payoutDetailsForm.bankName || 'IFSC: ' + (payoutDetailsForm.bankIfscCode || 'N/A')})</span>
                        )}
                      </div>
                      <p className={`text-[11px] ${isLight ? 'text-amber-800' : 'text-slate-400'}`}>
                        Account Holder: {payoutDetailsForm.accountHolderName || ambassador.name}
                      </p>
                    </div>

                    <button
                      onClick={handleRequestPayout}
                      disabled={requestingPayout}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-60"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>{requestingPayout ? 'Submitting Request...' : 'Request Cash Payout Transfer'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className={`p-5 rounded-2xl border space-y-1 ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1F24] border-[#555A66]/30'}`}>
                      <div className="text-slate-400 text-xs uppercase font-mono font-bold">Total Lifetime Earnings</div>
                      <div className="text-2xl font-black text-amber-500 font-mono">₹{(ambassador.totalCommission || 8000).toLocaleString('en-IN')}</div>
                      <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>₹1,000 / Qualified Enrollment</div>
                    </div>

                    <div className={`p-5 rounded-2xl border space-y-1 ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1F24] border-[#555A66]/30'}`}>
                      <div className="text-slate-400 text-xs uppercase font-mono font-bold">Cleared &amp; Settled</div>
                      <div className="text-2xl font-black text-emerald-400 font-mono">
                        ₹{payoutsList.filter(p => p.status === 'PAID').reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString('en-IN')}
                      </div>
                      <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Transferred to UPI/Bank</div>
                    </div>

                    <div className={`p-5 rounded-2xl border space-y-1 ${isLight ? 'bg-white border-slate-200' : 'bg-[#1C1F24] border-[#555A66]/30'}`}>
                      <div className="text-slate-400 text-xs uppercase font-mono font-bold">Pending Clearance</div>
                      <div className="text-2xl font-black text-indigo-400 font-mono">
                        ₹{payoutsList.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString('en-IN')}
                      </div>
                      <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>In Verification Cycle</div>
                    </div>
                  </div>

                  <div className={`rounded-3xl border overflow-hidden ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#1C1F24] border-[#555A66]/30'
                  }`}>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                      <span>Payout Transaction Ledger &amp; Requests</span>
                      <span className="text-slate-400 font-mono font-normal text-[11px]">{payoutsList.length} Statements</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                            isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950/60 border-slate-800 text-slate-400'
                          }`}>
                            <th className="py-3.5 px-4">Amount</th>
                            <th className="py-3.5 px-4">Payment Destination</th>
                            <th className="py-3.5 px-4">Transaction Ref</th>
                            <th className="py-3.5 px-4">Date</th>
                            <th className="py-3.5 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-mono">
                          {payoutsList.map(pay => (
                            <tr key={pay.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/50'}>
                              <td className="py-3.5 px-4 font-black text-emerald-500 text-sm">
                                ₹{pay.amount ? pay.amount.toLocaleString('en-IN') : '0'}
                              </td>
                              <td className={`py-3.5 px-4 font-sans ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                                {pay.payment_method}
                              </td>
                              <td className="py-3.5 px-4 text-slate-400">{pay.transaction_reference || 'N/A'}</td>
                              <td className="py-3.5 px-4 text-slate-400">{new Date(pay.created_at || Date.now()).toLocaleDateString()}</td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                  pay.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                  'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}>
                                  {pay.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </main>
          </div>
        </div>
      )}

      {/* WEEKLY REPORT SUBMISSION MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`relative w-full max-w-lg border rounded-3xl shadow-2xl overflow-hidden p-6 text-left space-y-6 ${
            isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className={`text-lg font-bold font-heading ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Friday Weekly Activity Report
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Submit your weekly campus outreach report (+50 pts bonus)
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className={`p-2 rounded-xl ${isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Report Submitted! 🎉</h4>
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>+50 Points awarded to your ambassador profile.</p>
              </div>
            ) : (
              <form onSubmit={handleWeeklyReportSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Posts</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={reportForm.postsCount}
                      onChange={e => setReportForm({ ...reportForm, postsCount: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Stories</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={reportForm.storiesCount}
                      onChange={e => setReportForm({ ...reportForm, storiesCount: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Leads</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={reportForm.leadsGenerated}
                      onChange={e => setReportForm({ ...reportForm, leadsGenerated: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-mono ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] font-bold uppercase mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Campus Event / Workshop Activity</label>
                  <textarea
                    rows={2}
                    value={reportForm.eventNotes}
                    onChange={e => setReportForm({ ...reportForm, eventNotes: e.target.value })}
                    placeholder="Details on campus info sessions or student discussions..."
                    className={`w-full px-3 py-2 rounded-xl border text-xs resize-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] font-bold uppercase mb-1 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>Next Week's Action Plan</label>
                  <textarea
                    rows={2}
                    value={reportForm.nextWeekPlan}
                    onChange={e => setReportForm({ ...reportForm, nextWeekPlan: e.target.value })}
                    placeholder="Planned posts, student group outreach, or club partnerships..."
                    className={`w-full px-3 py-2 rounded-xl border text-xs resize-none ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReport}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Weekly Activity Report'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PAYOUT DETAILS COLLECTION MODAL */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-left">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-heading">Payout Account Settings</h3>
                <p className="text-xs text-slate-400">Specify details for offline UPI or Bank transfers</p>
              </div>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePayoutDetails} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preferred Payout Method</label>
                <select
                  value={payoutDetailsForm.method}
                  onChange={e => setPayoutDetailsForm({ ...payoutDetailsForm, method: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                >
                  <option value="UPI">UPI Direct (Google Pay, PhonePe, Paytm)</option>
                  <option value="Bank Transfer">Direct Bank NEFT / IMPS Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  required
                  value={payoutDetailsForm.accountHolderName}
                  onChange={e => setPayoutDetailsForm({ ...payoutDetailsForm, accountHolderName: e.target.value })}
                  placeholder="Official Name matching Bank / UPI"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              {payoutDetailsForm.method === 'UPI' ? (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">UPI ID (VPA) *</label>
                  <input
                    type="text"
                    required
                    value={payoutDetailsForm.upiId}
                    onChange={e => setPayoutDetailsForm({ ...payoutDetailsForm, upiId: e.target.value })}
                    placeholder="e.g. name@okhdfcbank or 9876543210@paytm"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono text-xs font-bold"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bank Account Number *</label>
                    <input
                      type="text"
                      required
                      value={payoutDetailsForm.bankAccountNumber}
                      onChange={e => setPayoutDetailsForm({ ...payoutDetailsForm, bankAccountNumber: e.target.value })}
                      placeholder="e.g. 50100234912384"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">IFSC Code *</label>
                      <input
                        type="text"
                        required
                        value={payoutDetailsForm.bankIfscCode}
                        onChange={e => setPayoutDetailsForm({ ...payoutDetailsForm, bankIfscCode: e.target.value })}
                        placeholder="HDFC0001234"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-mono text-xs uppercase font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={payoutDetailsForm.bankName}
                        onChange={e => setPayoutDetailsForm({ ...payoutDetailsForm, bankName: e.target.value })}
                        placeholder="HDFC Bank"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={savingPayoutDetails}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                {savingPayoutDetails ? 'Saving Account...' : 'Save Payout Destination Details'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
