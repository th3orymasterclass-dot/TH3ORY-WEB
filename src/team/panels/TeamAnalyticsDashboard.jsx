import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, DollarSign, Users, Mail, HelpCircle, Briefcase,
  ArrowUpRight, ArrowDownRight, RefreshCw, Calendar, Filter, PieChart,
  ShieldCheck, Activity, Award, Download, CheckCircle2, AlertCircle, Sparkles,
  User, Check, Zap, Target
} from 'lucide-react';
import { fetchAllAmbassadorApplicationsFromSupabase } from '../../services/supabaseService';
import { formatDualCurrency } from '../../utils/currencyUtils';

export default function TeamAnalyticsDashboard({
  enterpriseQuotes = [],
  contactInquiries = [],
  newsletterSubscribers = [],
  teamProfile = {},
  themeMode = 'dark'
}) {
  const isDark = themeMode === 'dark';
  const [timeframe, setTimeframe] = useState('30days');
  const [viewScope, setViewScope] = useState('my'); // 'my' | 'all'
  const [ambassadorList, setAmbassadorList] = useState([]);
  const [isLoadingAmbassadors, setIsLoadingAmbassadors] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());

  const memberName = teamProfile.name || 'Team Officer';
  const memberId = teamProfile.memberId || teamProfile.member_id || 'TEAM-MEM-1001';
  const repCode = teamProfile.repCode || teamProfile.rep_code || 'REP-ALEX';
  const memberDept = teamProfile.department || 'Enterprise & B2B';

  // Load Ambassadors for analytics calculation
  useEffect(() => {
    async function loadData() {
      setIsLoadingAmbassadors(true);
      try {
        const res = await fetchAllAmbassadorApplicationsFromSupabase();
        if (res?.data) {
          setAmbassadorList(res.data);
        }
      } catch (err) {
        console.error('Error fetching ambassadors for analytics:', err);
      } finally {
        setIsLoadingAmbassadors(false);
      }
    }
    loadData();
  }, []);

  const handleRefresh = () => {
    setLastRefreshed(new Date().toLocaleTimeString());
  };

  // Helper numerical parser for revenue strings
  const parseAmount = (val) => {
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  // Helper probability multiplier
  const parseProb = (probStr) => {
    if (!probStr) return 0.5;
    const num = parseInt(String(probStr).replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0.5 : num / 100;
  };

  // Filter quotes and inquiries according to selected Account Scope
  const scopedQuotes = viewScope === 'my'
    ? enterpriseQuotes.filter(q => 
        q.assigned_to === memberId || 
        q.rep_code === repCode || 
        q.repCode === repCode ||
        !q.assigned_to // Fallback show unassigned to let member claim
      )
    : enterpriseQuotes;

  const scopedInquiries = viewScope === 'my'
    ? contactInquiries.filter(i =>
        i.assigned_to === memberId ||
        i.rep_code === repCode ||
        i.repCode === repCode ||
        !i.assigned_to
      )
    : contactInquiries;

  // Calculate Pipeline Financial Metrics
  const totalPipelineRaw = scopedQuotes.reduce((acc, q) => acc + parseAmount(q.expected_revenue || q.budget), 0);
  const weightedPipeline = scopedQuotes.reduce((acc, q) => {
    const val = parseAmount(q.expected_revenue || q.budget);
    const prob = parseProb(q.probability);
    return acc + (val * prob);
  }, 0);

  const closedWonDeals = scopedQuotes.filter(q => (q.status || '').toLowerCase().includes('won'));
  const closedWonRevenue = closedWonDeals.reduce((acc, q) => acc + parseAmount(q.expected_revenue || q.budget), 0);
  const activeDealsCount = scopedQuotes.filter(q => !(q.status || '').toLowerCase().includes('lost')).length;
  const leadConversionRate = scopedQuotes.length > 0 
    ? Math.round((closedWonDeals.length / scopedQuotes.length) * 100) 
    : 0;

  // Contact Inquiries metrics
  const resolvedInquiries = scopedInquiries.filter(i => i.status === 'resolved');
  const inquiryResolutionRate = scopedInquiries.length > 0
    ? Math.round((resolvedInquiries.length / scopedInquiries.length) * 100)
    : 100;

  // Ambassador metrics
  const activeAmbassadors = ambassadorList.filter(a => a.status === 'active' || a.status === 'approved');

  // Newsletter metrics
  const activeSubscribers = newsletterSubscribers.filter(s => s.status !== 'unsubscribed');

  // Deal Stage Distribution
  const stageCounts = {
    'New Lead': 0,
    'In Contact': 0,
    'Meeting Scheduled': 0,
    'Proposal Sent': 0,
    'Under Negotiation': 0,
    'Closed Won': 0,
    'Closed Lost': 0,
  };

  scopedQuotes.forEach(q => {
    const status = q.status || 'New Lead';
    if (stageCounts[status] !== undefined) {
      stageCounts[status] += 1;
    } else if (status.toLowerCase().includes('won')) {
      stageCounts['Closed Won'] += 1;
    } else if (status.toLowerCase().includes('lost')) {
      stageCounts['Closed Lost'] += 1;
    } else if (status.toLowerCase().includes('meeting')) {
      stageCounts['Meeting Scheduled'] += 1;
    } else if (status.toLowerCase().includes('proposal')) {
      stageCounts['Proposal Sent'] += 1;
    } else if (status.toLowerCase().includes('contact')) {
      stageCounts['In Contact'] += 1;
    } else {
      stageCounts['New Lead'] += 1;
    }
  });

  // Industry Sector Distribution
  const industryStats = {};
  scopedQuotes.forEach(q => {
    const ind = q.industry || 'Technology & Cloud';
    const rev = parseAmount(q.expected_revenue || q.budget);
    if (!industryStats[ind]) {
      industryStats[ind] = { count: 0, revenue: 0 };
    }
    industryStats[ind].count += 1;
    industryStats[ind].revenue += rev;
  });

  const topIndustries = Object.entries(industryStats)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Interactive Scope + Timeframe Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Operational Analytics &amp; Revenue Intelligence
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Account: <strong className="text-indigo-400">{memberName}</strong> ({repCode}) • {memberDept}
              </p>
            </div>
          </div>
        </div>

        {/* Scope & Timeframe controls */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Account Data Alignment Scope Toggle */}
          <div className={`flex items-center p-1 border rounded-xl ${
            isDark ? 'bg-slate-900 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'
          }`}>
            <button
              onClick={() => setViewScope('my')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewScope === 'my'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Assigned Data</span>
            </button>
            <button
              onClick={() => setViewScope('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewScope === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Team Data</span>
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className={`flex items-center p-1 border rounded-xl ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            {[
              { id: '7days', label: '7D' },
              { id: '30days', label: '30D' },
              { id: 'quarter', label: 'QTD' },
              { id: 'all', label: 'ALL' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTimeframe(t.id)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  timeframe === t.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Refresh Action */}
          <button
            onClick={handleRefresh}
            className={`p-2 border rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Refresh Analytics Data"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{lastRefreshed}</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          4 KEY PERFORMANCE INDICATORS (KPI CARDS)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Enterprise Pipeline */}
        <div className={`p-5 rounded-2xl border space-y-3 relative overflow-hidden transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              {viewScope === 'my' ? 'My Assigned Pipeline' : 'Total B2B Pipeline'}
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-mono">{formatDualCurrency(totalPipelineRaw)}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-emerald-400 font-bold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> {scopedQuotes.length} Deals
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Weighted: {formatDualCurrency(weightedPipeline)}</span>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min(leadConversionRate * 2, 100)}%` }} />
          </div>
        </div>

        {/* KPI 2: Deals Closed Won */}
        <div className={`p-5 rounded-2xl border space-y-3 relative overflow-hidden transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/40' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              {viewScope === 'my' ? 'My Closed Won Deals' : 'Team Won Revenue'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{formatDualCurrency(closedWonRevenue)}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-emerald-400 font-bold">
                {closedWonDeals.length} Won
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Win Rate: {leadConversionRate}%</span>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(leadConversionRate, 100)}%` }} />
          </div>
        </div>

        {/* KPI 3: Inquiries Handled */}
        <div className={`p-5 rounded-2xl border space-y-3 relative overflow-hidden transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800 hover:border-purple-500/40' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              {viewScope === 'my' ? 'My Inquiries Queue' : 'Contact Inquiries'}
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-mono">{scopedInquiries.length}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-purple-400 font-bold">
                {resolvedInquiries.length} Resolved
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Rate: {inquiryResolutionRate}%</span>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${inquiryResolutionRate}%` }} />
          </div>
        </div>

        {/* KPI 4: Active Campus Ambassadors & Outreach */}
        <div className={`p-5 rounded-2xl border space-y-3 relative overflow-hidden transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Rep Attribution Tag</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-purple-300 font-mono">{repCode}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-amber-400 font-bold">
                {activeAmbassadors.length} Ambassadors
              </span>
              <span className="text-[11px] text-slate-400 font-mono">{activeSubscribers.length} Subscribers</span>
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '85%' }} />
          </div>
        </div>

      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          MAIN CHARTS & BREAKDOWN SECTION
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Enterprise Deal Pipeline Stage Chart */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border space-y-5 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h3 className={`text-base font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Briefcase className="w-4 h-4 text-indigo-400" />
                Pipeline Stage Breakdown ({viewScope === 'my' ? 'Assigned to You' : 'Team Global'})
              </h3>
              <p className="text-xs text-slate-400">Distribution of B2B accounts across active sales stages</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {scopedQuotes.length} Deals in Scope
            </span>
          </div>

          {/* Interactive Horizontal Bar Chart */}
          <div className="space-y-4">
            {[
              { name: 'New Lead', count: stageCounts['New Lead'], color: 'from-slate-600 to-slate-500', pct: Math.round((stageCounts['New Lead'] / (scopedQuotes.length || 1)) * 100) },
              { name: 'In Contact', count: stageCounts['In Contact'], color: 'from-blue-600 to-indigo-600', pct: Math.round((stageCounts['In Contact'] / (scopedQuotes.length || 1)) * 100) },
              { name: 'Meeting Scheduled', count: stageCounts['Meeting Scheduled'], color: 'from-amber-600 to-orange-600', pct: Math.round((stageCounts['Meeting Scheduled'] / (scopedQuotes.length || 1)) * 100) },
              { name: 'Proposal Sent', count: stageCounts['Proposal Sent'], color: 'from-purple-600 to-indigo-600', pct: Math.round((stageCounts['Proposal Sent'] / (scopedQuotes.length || 1)) * 100) },
              { name: 'Under Negotiation', count: stageCounts['Under Negotiation'], color: 'from-pink-600 to-rose-600', pct: Math.round((stageCounts['Under Negotiation'] / (scopedQuotes.length || 1)) * 100) },
              { name: 'Closed Won', count: stageCounts['Closed Won'], color: 'from-emerald-500 to-teal-500', pct: Math.round((stageCounts['Closed Won'] / (scopedQuotes.length || 1)) * 100) },
            ].map(stage => (
              <div key={stage.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{stage.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{stage.count} deals</span>
                    <span className="font-extrabold text-indigo-400">{stage.pct}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${stage.color} transition-all duration-500`}
                    style={{ width: `${Math.max(stage.pct, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Forecast Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-extrabold text-white">Weighted Win Forecast</p>
                <p className="text-[11px] text-indigo-300 font-mono">Adjusted for win probability multipliers</p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-lg font-black text-emerald-400">${Math.round(weightedPipeline).toLocaleString()}</span>
              <p className="text-[10px] text-slate-400">{closedWonDeals.length} deals closed won</p>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Industry Sector Breakdown & Health */}
        <div className="space-y-6">
          
          {/* Top Industry Revenue Sectors */}
          <div className={`p-6 rounded-2xl border space-y-4 ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h3 className={`text-sm font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <PieChart className="w-4 h-4 text-purple-400" />
              Top Industry Sectors
            </h3>

            <div className="space-y-3">
              {topIndustries.length === 0 ? (
                <div className="text-xs font-mono text-slate-500 py-4 text-center">No industry revenue recorded in this scope.</div>
              ) : (
                topIndustries.map(([indName, stat]) => (
                  <div key={indName} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <div>
                      <p className="font-bold text-slate-200 truncate max-w-[140px]">{indName}</p>
                      <p className="text-[10px] text-slate-500">{stat.count} Accounts</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-400">${stat.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live System Health & Connectivity Monitor */}
          <div className={`p-6 rounded-2xl border space-y-4 ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <h3 className={`text-sm font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Activity className="w-4 h-4 text-emerald-400" />
              Live Sync &amp; Realtime Database Health
            </h3>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Account Scope Alignment
                </span>
                <span className="text-emerald-400 font-bold">SYNCD</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Assigned Rep Tag
                </span>
                <span className="text-indigo-300 font-bold">{repCode}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Calendly Scheduler
                </span>
                <span className="text-amber-300 font-bold">INTEGRATED</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
