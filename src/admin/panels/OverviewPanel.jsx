import React from 'react';
import { LayoutDashboard, TrendingUp, Users, BookOpen, Tag, Star, HelpCircle, User, Gift, Target, Video, Flame, Save, RotateCcw, Clock } from 'lucide-react';

export default function OverviewPanel({ data, reset, lastSaved }) {
  const d = data.courseDetails;

  const stats = [
    { label: 'Curriculum Levels', value: data.levels?.length ?? 0, icon: BookOpen, color: 'text-amber-400' },
    { label: 'Total Lessons', value: data.levels?.reduce((a, l) => a + (l.lessons?.length ?? 0), 0) ?? 0, icon: Target, color: 'text-sky-400' },
    { label: 'Pricing Plans', value: data.plans?.length ?? 0, icon: Tag, color: 'text-purple-400' },
    { label: 'Student Reviews', value: data.reviews?.length ?? 0, icon: Star, color: 'text-rose-400' },
    { label: 'FAQs', value: data.faqs?.length ?? 0, icon: HelpCircle, color: 'text-green-400' },
    { label: 'Seats Left', value: d?.urgency?.seatsLeft ?? '—', icon: Flame, color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white">Dashboard Overview</h2>
        <p className="text-slate-500 text-sm mt-1">All content changes sync live to the public site</p>
      </div>

      {/* Last saved */}
      {lastSaved && (
        <div className="flex items-center gap-2 text-green-400 text-sm bg-green-950/30 border border-green-500/20 rounded-xl px-4 py-3">
          <Clock className="w-4 h-4" />
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
            <div className="text-3xl font-black text-white">{s.value}</div>
            <div className="text-slate-500 text-xs mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Course snapshot */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Current Site Content Snapshot</h3>
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

      {/* Danger zone */}
      <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-6">
        <h3 className="font-bold text-red-400 text-sm uppercase tracking-wider mb-2">Danger Zone</h3>
        <p className="text-slate-500 text-sm mb-4">Reset ALL content to original defaults. This cannot be undone.</p>
        <button
          onClick={() => { if (window.confirm('Reset ALL data to defaults? This cannot be undone.')) reset('all'); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 text-sm font-bold transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Reset Everything to Defaults
        </button>
      </div>
    </div>
  );
}
