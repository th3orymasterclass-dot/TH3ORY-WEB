import React, { useState, useEffect } from 'react';
import { 
  Share2, MousePointerClick, TrendingUp, DollarSign, ShieldCheck, 
  Search, Filter, ExternalLink, Copy, Check, Sparkles, RefreshCw, 
  Users, Tag, ShieldAlert, Award, ArrowRight
} from 'lucide-react';
import { 
  fetchAllReferralAnalyticsFromSupabase, 
  subscribeToReferralTracking 
} from '../../services/supabaseService';
import { buildShareableReferralLinks } from '../../utils/affiliateTrackingEngine';

export default function ReferralTrackingPanel({ themeMode = 'dark' }) {
  const isDark = themeMode === 'dark';

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalClicks: 0,
    uniqueClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    totalCommissionDisbursed: 0,
    totalGrossDriven: 0,
    clicks: [],
    conversions: [],
    codePerformance: []
  });

  const [activeTab, setActiveTab] = useState('clicks'); // 'clicks' | 'conversions' | 'performance' | 'generator'
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [copiedLink, setCopiedLink] = useState('');

  // Link Generator State
  const [genInputCode, setGenInputCode] = useState('AMB-1002');
  const [genDestination, setGenDestination] = useState('enroll'); // 'enroll' | 'home' | 'custom'
  const [genCustomPath, setGenCustomPath] = useState('/#/?ref=');
  const [genUtmCampaign, setGenUtmCampaign] = useState('fall_recruitment');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllReferralAnalyticsFromSupabase();
      if (data) setAnalytics(data);
    } catch (err) {
      console.warn('[Admin Referral Tracking] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToReferralTracking((newStats) => {
      if (newStats) setAnalytics(newStats);
    });
    return () => unsubscribe();
  }, []);

  const handleCopyText = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedLink(key || text);
    setTimeout(() => setCopiedLink(''), 2500);
  };

  // Generate dynamic link preview
  const generatedLinks = buildShareableReferralLinks(genInputCode);
  const activeGeneratedUrl = genDestination === 'home' 
    ? `${generatedLinks.rootHome}${genUtmCampaign ? `&utm_campaign=${encodeURIComponent(genUtmCampaign)}&utm_source=referral` : ''}`
    : genDestination === 'enroll'
      ? `${generatedLinks.enrollPage}${genUtmCampaign ? `&utm_campaign=${encodeURIComponent(genUtmCampaign)}&utm_source=referral` : ''}`
      : `https://th3ory.online${genCustomPath.startsWith('/') ? '' : '/'}${genCustomPath}${genInputCode}`;

  // Filtered clicks
  const filteredClicks = analytics.clicks.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      (c.click_id || c.clickId || '').toLowerCase().includes(q) ||
      (c.ref_code || c.refCode || '').toLowerCase().includes(q) ||
      (c.landing_url || c.landingUrl || '').toLowerCase().includes(q);

    const matchType = typeFilter === 'ALL' || (c.ref_type || c.refType || 'CAMPAIGN') === typeFilter;
    return matchSearch && matchType;
  });

  // Filtered conversions
  const filteredConversions = analytics.conversions.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      (c.conversion_id || c.conversionId || '').toLowerCase().includes(q) ||
      (c.ref_code || c.refCode || '').toLowerCase().includes(q) ||
      (c.student_name || c.studentName || '').toLowerCase().includes(q) ||
      (c.student_email || c.studentEmail || '').toLowerCase().includes(q) ||
      (c.order_id || c.orderId || '').toLowerCase().includes(q);

    const matchType = typeFilter === 'ALL' || (c.ref_type || c.refType || 'CAMPAIGN') === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Affiliation &amp; Referral Link Tracking
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live Protocol
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Real-time click stream, multi-touch attribution, conversion ledger, and anti-fraud tamper verification.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Refresh Live Ledger</span>
        </button>
      </div>

      {/* 6-Card Executive Analytics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className={`p-4 rounded-2xl border space-y-1 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Clicks</span>
            <MousePointerClick className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-black text-blue-400 font-mono">{analytics.totalClicks}</div>
          <div className="text-[10px] text-slate-500">{analytics.uniqueClicks} unique devices</div>
        </div>

        <div className={`p-4 rounded-2xl border space-y-1 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Conversions</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 font-mono">{analytics.totalConversions}</div>
          <div className="text-[10px] text-slate-500">Verified enrollments</div>
        </div>

        <div className={`p-4 rounded-2xl border space-y-1 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Conv. Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-black text-purple-400 font-mono">{analytics.conversionRate}%</div>
          <div className="text-[10px] text-slate-500">Click to payment</div>
        </div>

        <div className={`p-4 rounded-2xl border space-y-1 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Gross Driven</span>
            <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-black text-amber-400 font-mono">₹{analytics.totalGrossDriven.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-500">Attributed revenue</div>
        </div>

        <div className={`p-4 rounded-2xl border space-y-1 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Commission</span>
            <Award className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl font-black text-rose-400 font-mono">₹{analytics.totalCommissionDisbursed.toLocaleString('en-IN')}</div>
          <div className="text-[10px] text-slate-500">Payout obligations</div>
        </div>

        <div className={`p-4 rounded-2xl border space-y-1 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Active Codes</span>
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-xl font-black text-indigo-400 font-mono">{analytics.codePerformance.length}</div>
          <div className="text-[10px] text-slate-500">Tracked campaigns</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2 border-slate-800">
        <button
          onClick={() => setActiveTab('clicks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'clicks'
              ? 'bg-indigo-600 text-white shadow-md'
              : (isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900')
          }`}
        >
          <MousePointerClick className="w-4 h-4" />
          <span>Real-time Click Stream ({analytics.clicks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('conversions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'conversions'
              ? 'bg-indigo-600 text-white shadow-md'
              : (isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900')
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Verified Conversions ({analytics.conversions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'performance'
              ? 'bg-indigo-600 text-white shadow-md'
              : (isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900')
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Partner Performance Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('generator')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'generator'
              ? 'bg-indigo-600 text-white shadow-md'
              : (isDark ? 'bg-slate-900 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900')
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Link Builder &amp; Generator</span>
        </button>
      </div>

      {/* 1. REALTIME CLICK STREAM TAB */}
      {activeTab === 'clicks' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Click ID, Code, URL..."
                className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="ALL">All Partner Types</option>
                <option value="AMBASSADOR">Campus Ambassador</option>
                <option value="TEAM_REP">Team Rep</option>
                <option value="AFFILIATE_PARTNER">Affiliate Partner</option>
                <option value="CAMPAIGN">Campaign / Other</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <th className="py-3 px-3">Click ID</th>
                  <th className="py-3 px-3">Ref Code</th>
                  <th className="py-3 px-3">Classification</th>
                  <th className="py-3 px-3">Landing Destination</th>
                  <th className="py-3 px-3">Referrer Source</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                {filteredClicks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No referral clicks logged yet matching search filter.
                    </td>
                  </tr>
                ) : (
                  filteredClicks.map((clk, idx) => (
                    <tr key={clk.click_id || clk.clickId || idx} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                      <td className="py-3 px-3 font-bold text-amber-400">{clk.click_id || clk.clickId}</td>
                      <td className="py-3 px-3 font-bold text-indigo-400">{clk.ref_code || clk.refCode}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {clk.ref_type || clk.refType || 'CAMPAIGN'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 truncate max-w-[180px]">
                        {clk.landing_url || clk.landingUrl || '/#/enroll'}
                      </td>
                      <td className="py-3 px-3 text-slate-400 truncate max-w-[140px]">
                        {clk.referrer_url || clk.referrerUrl || 'Direct'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          clk.converted || clk.conversion_id
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {clk.converted || clk.conversion_id ? 'CONVERTED' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {new Date(clk.created_at || clk.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. VERIFIED CONVERSIONS TAB */}
      {activeTab === 'conversions' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Conversion ID, Order, Student..."
                className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <th className="py-3 px-3">Conversion ID</th>
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Ref Code</th>
                  <th className="py-3 px-3">Gross Paid</th>
                  <th className="py-3 px-3">Commission</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                {filteredConversions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No referral conversions recorded yet matching search.
                    </td>
                  </tr>
                ) : (
                  filteredConversions.map((conv, idx) => (
                    <tr key={conv.conversion_id || conv.conversionId || idx} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                      <td className="py-3 px-3 font-bold text-emerald-400">{conv.conversion_id || conv.conversionId}</td>
                      <td className="py-3 px-3 font-bold text-amber-400">{conv.order_id || conv.orderId}</td>
                      <td className="py-3 px-3 font-sans font-bold text-white">{conv.student_name || conv.studentName}</td>
                      <td className="py-3 px-3 font-bold text-indigo-400">{conv.ref_code || conv.refCode}</td>
                      <td className="py-3 px-3 text-slate-300 font-bold">₹{Number(conv.gross_amount || conv.grossAmount || 11999).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-amber-400 font-bold">₹{Number(conv.commission_amount || conv.commissionAmount || 1000).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {conv.status || 'APPROVED'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PERFORMANCE MATRIX TAB */}
      {activeTab === 'performance' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Partner Attribution Matrix &amp; Aggregates
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <th className="py-3 px-3">Referral Code</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Total Clicks</th>
                  <th className="py-3 px-3">Conversions</th>
                  <th className="py-3 px-3">Conv. Rate</th>
                  <th className="py-3 px-3">Gross Driven</th>
                  <th className="py-3 px-3">Commission Due</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-200'}`}>
                {analytics.codePerformance.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No partner metrics generated yet.
                    </td>
                  </tr>
                ) : (
                  analytics.codePerformance.map((item, idx) => {
                    const cRate = item.clicks > 0 ? ((item.conversions / item.clicks) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={item.code || idx} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                        <td className="py-3 px-3 font-bold text-amber-400">{item.code}</td>
                        <td className="py-3 px-3 text-slate-400">{item.refType}</td>
                        <td className="py-3 px-3 font-bold text-blue-400">{item.clicks}</td>
                        <td className="py-3 px-3 font-bold text-emerald-400">{item.conversions}</td>
                        <td className="py-3 px-3 font-bold text-purple-400">{cRate}%</td>
                        <td className="py-3 px-3 font-bold text-white">₹{item.revenue.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 font-bold text-amber-400">₹{item.commission.toLocaleString('en-IN')}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. LINK GENERATOR & BUILDER TAB */}
      {activeTab === 'generator' && (
        <div className={`p-6 rounded-3xl border space-y-6 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div>
            <h3 className={`text-lg font-bold font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Universal Referral Link Generator
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Construct cryptographic referral links with custom UTM tags and destination routes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] uppercase font-mono font-bold text-slate-400 block mb-1.5">
                Referral / Partner Code
              </label>
              <input
                type="text"
                value={genInputCode}
                onChange={e => setGenInputCode(e.target.value.toUpperCase())}
                placeholder="e.g. AMB-1002 or PARTNER"
                className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono font-bold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-amber-400' : 'bg-slate-50 border-slate-300 text-amber-600'
                }`}
              />
            </div>

            <div>
              <label className="text-[11px] uppercase font-mono font-bold text-slate-400 block mb-1.5">
                Target Destination
              </label>
              <select
                value={genDestination}
                onChange={e => setGenDestination(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="enroll">Direct Enrollment Page (/#/enroll)</option>
                <option value="home">Homepage Brand (/?ref=...)</option>
                <option value="custom">Custom Hash / Query Path</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase font-mono font-bold text-slate-400 block mb-1.5">
                UTM Campaign Tag
              </label>
              <input
                type="text"
                value={genUtmCampaign}
                onChange={e => setGenUtmCampaign(e.target.value)}
                placeholder="e.g. university_drive_2026"
                className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Generated URL Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-[11px] uppercase font-mono font-bold text-slate-400 block">
              Generated Tamper-Proof Referral URL
            </span>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                readOnly
                value={activeGeneratedUrl}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-emerald-400 select-all"
              />
              <button
                type="button"
                onClick={() => handleCopyText(activeGeneratedUrl, 'activeGen')}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-all shadow-md shadow-amber-500/20"
              >
                {copiedLink === 'activeGen' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink === 'activeGen' ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
