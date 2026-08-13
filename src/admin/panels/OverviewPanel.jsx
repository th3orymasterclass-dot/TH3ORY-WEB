import React from 'react';
import { LayoutDashboard, TrendingUp, Users, BookOpen, Tag, Star, HelpCircle, User, Gift, Target, Video, Flame, Save, RotateCcw, Clock, DollarSign, Building2, Mail, ShieldCheck } from 'lucide-react';

export default function OverviewPanel({ data, reset, lastSaved, enrollments = [], queries = [], enterpriseQuotes = [], contactInquiries = [] }) {
  const d = data.courseDetails;

  const totalRevenueINR = enrollments.reduce((sum, item) => item.currency === 'INR' ? sum + Number(item.amount_paid || 0) : sum, 0);
  const totalRevenueUSD = enrollments.reduce((sum, item) => (item.currency === 'USD' || !item.currency) ? sum + Number(item.amount_paid || 0) : sum, 0);
  const totalEnrollments = enrollments.length;

  const pendingQueries = queries.filter(q => q.status !== 'resolved').length;
  const pendingQuotes  = enterpriseQuotes.filter(q => q.status !== 'contacted').length;
  const pendingContact = contactInquiries.filter(c => c.status !== 'resolved').length;

  const stats = [
    { label: 'Real-time Enrollments', value: totalEnrollments, icon: Users, color: 'text-amber-400' },
    { label: 'Revenue (INR)', value: `₹${totalRevenueINR.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Revenue (USD)', value: `$${totalRevenueUSD.toLocaleString()} USD`, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Pending Queries', value: pendingQueries, icon: HelpCircle, color: 'text-indigo-400' },
    { label: 'Enterprise Quotes', value: pendingQuotes, icon: Building2, color: 'text-purple-400' },
    { label: 'Seats Left', value: d?.urgency?.seatsLeft ?? 5, icon: Flame, color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white">Dashboard Overview</h2>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> REALTIME SYNCED
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">All updates sync live to the Supabase database and public landing page</p>
        </div>
      </div>

      {/* Last saved */}
      {lastSaved && (
        <div className="flex items-center gap-2 text-green-400 text-sm bg-green-950/30 border border-green-500/20 rounded-xl px-4 py-3">
          <Clock className="w-4 h-4" />
          Last saved & broadcasted: {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
            <div className="text-2xl lg:text-3xl font-black text-white font-mono">{s.value}</div>
            <div className="text-slate-500 text-xs mt-1 uppercase font-bold tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Real-time Enrollments Activity Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider">Recent Real-time Student Transactions</h3>
          <span className="text-xs text-slate-500">Live Supabase Feed</span>
        </div>
        
        {enrollments.length === 0 ? (
          <p className="text-slate-500 text-xs py-4 text-center">No student transactions recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {enrollments.slice(0, 5).map((item, idx) => (
              <div key={item.id || idx} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-xs">
                    ₹
                  </div>
                  <div>
                    <p className="text-white font-bold text-xs">{item.name || 'Anonymous Student'}</p>
                    <p className="text-slate-500 text-[11px] font-mono">{item.email} • {item.order_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold font-mono text-xs block">
                    {item.currency === 'INR' ? '₹' : '$'}{Number(item.amount_paid || 0).toLocaleString('en-IN')} {item.currency}
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    {item.created_at ? new Date(item.created_at).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Site Content Snapshot */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Current Public Site Snapshot</h3>
        {[
          ['Course Title', d?.title],
          ['Brand', d?.brandName],
          ['Rating', d?.rating],
          ['Total Students', d?.totalStudents?.toLocaleString()],
          ['Cohort #', d?.urgency?.cohortNumber],
          ['Start Date', d?.urgency?.startDate],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
            <span className="text-slate-500 text-sm">{k}</span>
            <span className="text-white text-sm font-medium truncate max-w-xs">{v}</span>
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-6">
        <h3 className="font-bold text-red-400 text-sm uppercase tracking-wider mb-2">Danger Zone</h3>
        <p className="text-slate-500 text-sm mb-4">Reset ALL site content settings to original defaults. This cannot be undone.</p>
        <button
          onClick={() => { if (window.confirm('Reset ALL site content data to defaults? This cannot be undone.')) reset('all'); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 text-sm font-bold transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Reset Everything to Defaults
        </button>
      </div>
    </div>
  );
}
