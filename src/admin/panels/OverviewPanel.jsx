import React from 'react';
import { LayoutDashboard, TrendingUp, Users, BookOpen, Tag, Star, HelpCircle, User, Gift, Target, Video, Flame, Save, RotateCcw, Clock, DollarSign, Building2, Mail, ShieldCheck } from 'lucide-react';

export default function OverviewPanel({ data, reset, lastSaved, enrollments = [], queries = [], enterpriseQuotes = [], contactInquiries = [], themeMode = 'dark' }) {
  const d = data.courseDetails;
  const isDark = themeMode === 'dark';

  const totalRevenueINR = enrollments.reduce((sum, item) => item.currency === 'INR' ? sum + Number(item.amount_paid || 0) : sum, 0);
  const totalRevenueUSD = enrollments.reduce((sum, item) => (item.currency === 'USD' || !item.currency) ? sum + Number(item.amount_paid || 0) : sum, 0);
  const totalEnrollments = enrollments.length;

  const pendingQueries = queries.filter(q => q.status !== 'resolved').length;
  const pendingQuotes  = enterpriseQuotes.filter(q => q.status !== 'contacted').length;
  const pendingContact = contactInquiries.filter(c => c.status !== 'resolved').length;

  const stats = [
    { label: 'Real-time Enrollments', value: totalEnrollments, icon: Users, color: 'text-amber-500' },
    { label: 'Revenue (INR)', value: `₹${totalRevenueINR.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Revenue (USD)', value: `$${totalRevenueUSD.toLocaleString()} USD`, icon: DollarSign, color: 'text-emerald-500' },
    { label: 'Pending Queries', value: pendingQueries, icon: HelpCircle, color: 'text-indigo-500' },
    { label: 'Enterprise Quotes', value: pendingQuotes, icon: Building2, color: 'text-purple-500' },
    { label: 'Seats Left', value: d?.urgency?.seatsLeft ?? 5, icon: Flame, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Dashboard Overview</h2>
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border ${
              isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> REALTIME SYNCED
            </span>
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>All updates sync live to the Supabase database and public landing page</p>
        </div>
      </div>

      {/* Last saved */}
      {lastSaved && (
        <div className={`flex items-center gap-2 text-sm border rounded-xl px-4 py-3 ${
          isDark ? 'text-emerald-400 bg-emerald-950/30 border-emerald-500/20' : 'text-emerald-800 bg-emerald-50 border-emerald-200'
        }`}>
          <Clock className="w-4 h-4" />
          Last saved & broadcasted: {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`border rounded-2xl p-5 shadow-xs ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
            <div className={`text-2xl lg:text-3xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{s.value}</div>
            <div className={`text-xs mt-1 uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Real-time Enrollments Activity Feed */}
      <div className={`border rounded-2xl p-6 space-y-4 shadow-xs ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className={`font-bold text-sm uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent Real-time Student Transactions</h3>
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
            isDark ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>Live Stream</span>
        </div>

        {totalEnrollments === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-mono">
            No live transactions recorded yet.
          </div>
        ) : (
          <div className="space-y-2">
            {enrollments.slice(0, 5).map((item, idx) => (
              <div key={idx} className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 shrink-0">
                    {(item.name || item.email || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name || 'Enrolled Student'}</p>
                    <p className={`font-mono text-[11px] ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>{item.email}</p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <p className="font-bold text-emerald-500">{item.currency === 'INR' ? `₹${item.amount_paid}` : `$${item.amount_paid} USD`}</p>
                  <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{new Date(item.enrolled_at || item.created_at || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
