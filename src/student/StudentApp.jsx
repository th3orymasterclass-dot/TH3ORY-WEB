import React, { useState } from 'react';
import {
  LayoutDashboard, BookOpen, ShoppingBag, Star, MessageCircle,
  LogOut, ChevronRight, Menu, X, GraduationCap, Award, ExternalLink, Bookmark
} from 'lucide-react';
import DashboardHome from './panels/DashboardHome';
import CoursePanel   from './panels/CoursePanel';
import ShopPanel     from './panels/ShopPanel';
import ReviewPanel   from './panels/ReviewPanel';
import QueryPanel    from './panels/QueryPanel';
import { getProgress, getBookmarks } from './studentData';
import { getLevels } from '../data/adminData';

const NAV = [
  { id: 'home',    label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'course',  label: 'My Course',   icon: BookOpen },
  { id: 'shop',    label: 'Upgrade & Add-ons', icon: ShoppingBag },
  { id: 'review',  label: 'Leave a Review',    icon: Star },
  { id: 'queries', label: 'Query Sessions',    icon: MessageCircle },
];

export default function StudentApp({ profile, onLogout }) {
  const [active, setActive]       = useState('home');
  const [navExtra, setNavExtra]   = useState({}); // e.g. { levelId, lessonId }
  const [sidebarOpen, setSidebar] = useState(true);

  const navigate = (panel, extra = {}) => {
    setActive(panel);
    setNavExtra(extra);
  };

  const levels = getLevels();
  const progress = getProgress();
  const totalLessons = levels.reduce((a, l) => a + l.lessons.length, 0);
  const done = Object.keys(progress).length;
  const pct = totalLessons ? Math.round((done / totalLessons) * 100) : 0;

  const currentNav = NAV.find(n => n.id === active);

  const renderPanel = () => {
    switch (active) {
      case 'home':    return <DashboardHome profile={profile} onNavigate={navigate}/>;
      case 'course':  return <CoursePanel initialLevelId={navExtra.levelId} initialLessonId={navExtra.lessonId}/>;
      case 'shop':    return <ShopPanel profile={profile}/>;
      case 'review':  return <ReviewPanel profile={profile}/>;
      case 'queries': return <QueryPanel profile={profile}/>;
      default:        return <DashboardHome profile={profile} onNavigate={navigate}/>;
    }
  };

  return (
    <div className="min-h-screen bg-[#060910] text-slate-100 flex" style={{fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif"}}>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} shrink-0 transition-all duration-300 flex flex-col bg-slate-950 border-r border-slate-800/60`}>
        {/* Brand */}
        <div className="px-5 py-5 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-slate-950"/>
            </div>
            <div>
              <p className="font-black text-white text-sm tracking-tight">TH3ORY</p>
              <p className="text-slate-500 text-xs">Student Portal</p>
            </div>
          </div>
        </div>

        {/* Student card */}
        <div className="px-4 py-4 border-b border-slate-800/60">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black text-sm shrink-0">
                {profile.name[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">{profile.name}</p>
                <p className="text-slate-500 text-xs truncate">{profile.plan}</p>
              </div>
            </div>
            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-500 text-xs">Course Progress</span>
                <span className="text-amber-400 text-xs font-bold">{pct}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full">
                <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700"
                  style={{width:`${pct}%`}}/>
              </div>
              <p className="text-slate-600 text-xs mt-1">{done}/{totalLessons} lessons</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => { setActive(item.id); setNavExtra({}); if (window.innerWidth < 768) setSidebar(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}>
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}`}/>
                <span className="truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-amber-500/60"/>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 border-t border-slate-800/60 pt-4 space-y-1">
          <a href="/" target="_blank" rel="noreferrer"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 text-sm font-medium transition-all">
            <ExternalLink className="w-4 h-4 text-slate-500"/> Course Page
          </a>
          <button onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/30 text-sm font-medium transition-all">
            <LogOut className="w-4 h-4"/> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-slate-800/60 flex items-center px-5 gap-4 shrink-0 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
          <button onClick={() => setSidebar(o => !o)} className="text-slate-500 hover:text-white transition-colors">
            {sidebarOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Student Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-700"/>
            <span className="text-white font-semibold">{currentNav?.label}</span>
          </div>
          {/* Certificate badge */}
          {pct === 100 && (
            <div className="ml-auto flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1 text-amber-400 text-xs font-bold">
              <Award className="w-3.5 h-3.5"/> Certificate Ready!
            </div>
          )}
        </header>

        {/* Panel */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {renderPanel()}
          </div>
        </main>
      </div>
    </div>
  );
}
