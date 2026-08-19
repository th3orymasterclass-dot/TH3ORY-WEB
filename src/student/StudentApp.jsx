import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, BookOpen, ShoppingBag, Star, HelpCircle, Mail,
  LogOut, ChevronRight, Menu, X, GraduationCap, Award, ExternalLink, Bookmark, ShieldAlert,
  Sun, Moon, Zap
} from 'lucide-react';
import DashboardHome from './panels/DashboardHome';
import CoursePanel   from './panels/CoursePanel';
import ShopPanel     from './panels/ShopPanel';
import ReviewPanel   from './panels/ReviewPanel';
import QueryPanel    from './panels/QueryPanel';

import CertificatePanel from './panels/CertificatePanel';
import CharacterCodePortal from './components/CharacterCodePortal';
import { getProgress, getBookmarks } from './studentData';
import { useTh3oryLive } from '../data/adminData';
import { useFeatureFlags } from '../context/FeatureFlagContext';
import {
  fetchStudentDataFromSupabase,
  fetchStudentProfileFromSupabase,
  subscribeToStudentProgress,
  subscribeToStudentProfile
} from '../services/supabaseService';

const NAV = [
  { id: 'home',           label: 'Dashboard',         icon: LayoutDashboard },
  { id: 'course',         label: 'My Course',         icon: BookOpen },
  { id: 'character_code', label: 'Character Code™',   icon: Zap },
  { id: 'queries',        label: 'Email Support',     icon: Mail, flagKey: 'ENABLE_STUDENT_COMMUNITY' },
  { id: 'certificate',    label: 'Certificate',       icon: Award },
  { id: 'shop',           label: 'Upgrade & Add-ons', icon: ShoppingBag },
  { id: 'review',         label: 'Leave a Review',    icon: Star, flagKey: 'ENABLE_LIVE_REVIEWS' },
];

export default function StudentApp({ profile: initialProfile, onLogout }) {
  const { isFeatureEnabled } = useFeatureFlags();
  const isMaintenanceMode = isFeatureEnabled('MAINTENANCE_MODE', false);

  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('th3ory_student_theme') || 'dark';
    }
    return 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextTheme);
    localStorage.setItem('th3ory_student_theme', nextTheme);
  };

  const [active, setActive]       = useState('home');
  const [navExtra, setNavExtra]   = useState({}); // e.g. { levelId, lessonId }
  const [sidebarOpen, setSidebar] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true));
  const [currentProfile, setCurrentProfile] = useState(initialProfile);
  const [progress, setProgress]   = useState(() => getProgress(initialProfile?.email));

  // Live reactive admin data (levels, content, etc.)
  const liveData = useTh3oryLive();
  const levels = liveData.levels;

  const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 Hours in milliseconds

  // 24-Hour Auto-Signout Engine
  useEffect(() => {
    const checkSessionExpiration = () => {
      const authRaw = sessionStorage.getItem('th3ory_student_auth') || localStorage.getItem('th3ory_student_auth_persistent');
      if (!authRaw) return;

      try {
        const authData = JSON.parse(authRaw);
        const loginAt = authData.loginAt || currentProfile?.loginAt || initialProfile?.loginAt;

        // If session lacks loginAt timestamp, attach current timestamp to start 24h timer
        if (!loginAt) {
          authData.loginAt = Date.now();
          sessionStorage.setItem('th3ory_student_auth', JSON.stringify(authData));
          localStorage.setItem('th3ory_student_auth_persistent', JSON.stringify(authData));
          return;
        }

        const sessionAge = Date.now() - Number(loginAt);
        if (sessionAge >= SESSION_MAX_AGE_MS) {
          console.warn('[Security Engine] 24-Hour Student Session Expired. Logging out cleanly...');
          sessionStorage.removeItem('th3ory_student_auth');
          localStorage.removeItem('th3ory_student_auth_persistent');
          if (onLogout) onLogout({ expired: true });
        }
      } catch (err) {
        console.error('[Security Engine] Session expiration check error:', err);
      }
    };

    checkSessionExpiration();
    const interval = setInterval(checkSessionExpiration, 60000); // 60s Heartbeat

    window.addEventListener('focus', checkSessionExpiration);
    document.addEventListener('visibilitychange', checkSessionExpiration);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkSessionExpiration);
      document.removeEventListener('visibilitychange', checkSessionExpiration);
    };
  }, [currentProfile?.loginAt, initialProfile?.loginAt, onLogout]);

  // 1. Load student profile, progress, notes, and bookmarks from Supabase on mount
  useEffect(() => {
    if (initialProfile?.email) {
      fetchStudentProfileFromSupabase(initialProfile.email).then(freshProfile => {
        if (freshProfile) {
          setCurrentProfile(prev => ({ ...prev, ...freshProfile }));
        }
      });
      fetchStudentDataFromSupabase(initialProfile.email).then(data => {
        if (data?.progress) {
          setProgress(data.progress);
        }
      });
    }
  }, [initialProfile?.email]);

  // 2. Real-time WebSocket synchronization across devices
  useEffect(() => {
    if (!initialProfile?.email) return;

    // Local change event listener
    const h = () => setProgress(getProgress(initialProfile.email));
    window.addEventListener('th3ory_student_change', h);

    // Profile update event listener
    const hProfile = (e) => {
      if (e.detail) setCurrentProfile(prev => ({ ...prev, ...e.detail }));
    };
    window.addEventListener('th3ory_student_profile_update', hProfile);

    const refreshProfileAndData = () => {
      if (initialProfile?.email) {
        fetchStudentProfileFromSupabase(initialProfile.email).then(freshProfile => {
          if (freshProfile) setCurrentProfile(prev => ({ ...prev, ...freshProfile }));
        });
        fetchStudentDataFromSupabase(initialProfile.email).then(data => {
          if (data?.progress) setProgress(data.progress);
        });
      }
    };

    window.addEventListener('focus', refreshProfileAndData);
    document.addEventListener('visibilitychange', refreshProfileAndData);

    // Real-time Database WebSocket Subscriptions
    const unsubProgress = subscribeToStudentProgress(initialProfile.email, (data) => {
      if (data?.progress) {
        setProgress(data.progress);
      }
    });

    const unsubProfile = subscribeToStudentProfile(initialProfile.email, (updatedProfile) => {
      setCurrentProfile(prev => ({ ...prev, ...updatedProfile }));
    });

    return () => {
      window.removeEventListener('th3ory_student_change', h);
      window.removeEventListener('th3ory_student_profile_update', hProfile);
      window.removeEventListener('focus', refreshProfileAndData);
      document.removeEventListener('visibilitychange', refreshProfileAndData);
      unsubProgress();
      unsubProfile();
    };
  }, [initialProfile?.email]);

  const navigate = (panel, extra = {}) => {
    setActive(panel);
    setNavExtra(extra);
  };

  const totalLessons = levels.reduce((a, l) => a + l.lessons.length, 0);
  const done = Object.keys(progress).length;
  const pct = totalLessons ? Math.round((done / totalLessons) * 100) : 0;

  const currentNav = NAV.find(n => n.id === active);

  const activeProfile = currentProfile || initialProfile;

  const isLight = themeMode === 'light';

  const isLessonDone = (id) => !!progress[id]?.completed;
  const completedLevelsCount = levels.filter(l => l.lessons.every(ls => isLessonDone(ls.id))).length;

  const renderPanel = () => {
    switch (active) {
      case 'home':        return <DashboardHome profile={activeProfile} onNavigate={navigate} themeMode={themeMode}/>;
      case 'course':      return <CoursePanel profile={activeProfile} initialLevelId={navExtra.levelId} initialLessonId={navExtra.lessonId} onNavigate={navigate} themeMode={themeMode}/>;
      case 'character_code': return <CharacterCodePortal profile={activeProfile} themeMode={themeMode} completedLevelsCount={completedLevelsCount} onNavigate={navigate} onClose={() => setActive('home')} />;
      case 'queries':     return <QueryPanel profile={activeProfile} themeMode={themeMode}/>;
      case 'certificate': return <CertificatePanel profile={activeProfile} completedCount={done} totalLessons={totalLessons} onNavigate={navigate} themeMode={themeMode}/>;
      case 'shop':        return <ShopPanel profile={activeProfile} themeMode={themeMode}/>;
      case 'review':      return <ReviewPanel profile={activeProfile} themeMode={themeMode}/>;
      default:            return <DashboardHome profile={activeProfile} onNavigate={navigate} themeMode={themeMode}/>;
    }
  };

  return (
    <div className={`min-h-screen flex relative transition-colors duration-300 ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#15171A] text-[#FAFAF7]'
    }`} style={{fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif"}}>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebar(false)}
          className={`fixed inset-0 backdrop-blur-xs z-40 md:hidden ${isLight ? 'bg-slate-900/40' : 'bg-[#15171A]/80'}`}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 transition-transform duration-300 flex flex-col shadow-2xl md:shadow-none ${
        isLight ? 'bg-white border-r border-slate-200 text-slate-900' : 'bg-[#15171A] border-r border-[#555A66]/30 text-[#FAFAF7]'
      } ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'
      }`}>
        {/* Brand */}
        <div className={`px-5 py-5 border-b ${isLight ? 'border-slate-200' : 'border-[#555A66]/30'}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#6344E0] flex items-center justify-center shrink-0 shadow-md">
                <GraduationCap className="w-5 h-5 text-[#FAFAF7]"/>
              </div>
              <div className="min-w-0">
                <p className={`font-black text-sm tracking-tight font-heading truncate ${isLight ? 'text-slate-900' : 'text-[#FAFAF7]'}`}>TH3ORY</p>
                <p className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-[#555A66]'}`}>Student Portal</p>
              </div>
            </div>
            
            {/* Sidebar Theme Mode Button */}
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

        {/* Student card */}
        <div className={`px-4 py-4 border-b ${isLight ? 'border-slate-200' : 'border-[#555A66]/30'}`}>
          <div className={`border rounded-xl p-3 ${isLight ? 'bg-purple-50 border-purple-200' : 'bg-[#7C5CFC]/10 border-[#7C5CFC]/20'}`}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C5CFC] to-[#6344E0] flex items-center justify-center text-[#FAFAF7] font-black text-sm shrink-0">
                {(activeProfile?.name || 'S')[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-bold text-sm truncate ${isLight ? 'text-slate-900' : 'text-[#FAFAF7]'}`}>{activeProfile?.name || 'Student'}</p>
                <p className={`text-xs truncate ${isLight ? 'text-purple-700 font-semibold' : 'text-[#555A66]'}`}>{activeProfile?.plan || 'TH3ORY Masterclass'}</p>
              </div>
            </div>
            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-[#555A66]'}`}>Course Progress</span>
                <span className="text-[#FFC857] text-xs font-bold">{pct}%</span>
              </div>
              <div className={`h-1.5 rounded-full border ${isLight ? 'bg-slate-200 border-slate-300' : 'bg-[#15171A] border-[#555A66]/20'}`}>
                <div className="h-full bg-gradient-to-r from-[#7C5CFC] to-[#9277FF] rounded-full transition-all duration-700"
                  style={{width:`${pct}%`}}/>
              </div>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-[#555A66]'}`}>{done}/{totalLessons} lessons</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button key={item.id} onClick={() => {
                if (item.id === 'queries') {
                  window.location.href = "mailto:team@th3ory.online?subject=Student%20Query%20-%20TH3ORY%20Masterclass";
                } else {
                  setActive(item.id);
                  setNavExtra({});
                }
                if (window.innerWidth < 768) setSidebar(false);
              }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? isLight
                      ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                      : 'bg-[#7C5CFC]/20 text-[#FAFAF7] border border-[#7C5CFC]/30 font-bold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-[#555A66] hover:text-[#FAFAF7] hover:bg-[#7C5CFC]/10'
                }`}>
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? 'text-amber-300' : 'text-[#FFC857]') : (isLight ? 'text-slate-500 group-hover:text-slate-800' : 'text-[#555A66] group-hover:text-[#E9E4FF]')}`}/>
                <span className="truncate">{item.label}</span>
                {isActive && <ChevronRight className={`w-3.5 h-3.5 ml-auto ${isLight ? 'text-amber-300' : 'text-[#FFC857]'}`}/>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`px-3 pb-4 border-t pt-4 space-y-1 ${isLight ? 'border-slate-200' : 'border-slate-800/60'}`}>
          <a
            href="mailto:team@th3ory.online?subject=Student%20Query%20-%20TH3ORY%20Masterclass"
            onClick={(e) => {
              window.location.href = "mailto:team@th3ory.online?subject=Student%20Query%20-%20TH3ORY%20Masterclass";
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isLight ? 'text-amber-700 hover:text-amber-800 hover:bg-amber-50' : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <Mail className="w-4 h-4 text-amber-500"/> Email Support (team@th3ory.online)
          </a>
          <a href="/" target="_blank" rel="noreferrer"
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}>
            <ExternalLink className="w-4 h-4 text-slate-500"/> Course Page
          </a>
          <button onClick={onLogout}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isLight ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-slate-400 hover:text-red-400 hover:bg-red-950/30'
            }`}>
            <LogOut className="w-4 h-4"/> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Maintenance Banner */}
        {isMaintenanceMode && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-bold font-sans flex items-center justify-center gap-2 z-20 sticky top-0 border-b border-amber-600 shadow-md">
            <ShieldAlert className="w-4 h-4 text-slate-950" />
            <span>SYSTEM NOTICE: Platform maintenance in progress. Live queries &amp; certificate syncing may experience delays.</span>
          </div>
        )}

        {/* Top bar */}
        <header className={`h-14 border-b flex items-center px-4 sm:px-5 gap-4 shrink-0 backdrop-blur-sm sticky top-0 z-10 ${
          isLight ? 'bg-white/90 border-slate-200 text-slate-900' : 'bg-slate-950/50 border-slate-800/60 text-white'
        }`}>
          <button onClick={() => setSidebar(o => !o)} className={`p-1 rounded-lg transition-colors ${
            isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}>
            {sidebarOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-w-0 truncate">
            <span className={isLight ? 'text-slate-500 hidden sm:inline' : 'text-slate-500 hidden sm:inline'}>Student Portal</span>
            <ChevronRight className={`w-3.5 h-3.5 hidden sm:inline ${isLight ? 'text-slate-400' : 'text-slate-700'}`}/>
            <span className={`font-semibold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{currentNav?.label}</span>
          </div>

          {/* Theme Mode Toggle Button in Top Bar */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ml-auto shrink-0 select-none ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
            title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
          >
            {isLight ? (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            )}
          </button>

          {/* Certificate badge */}
          {pct === 100 && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1 text-amber-400 text-xs font-bold shrink-0">
              <Award className="w-3.5 h-3.5"/> Certificate Ready!
            </div>
          )}
        </header>

        {/* Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {renderPanel()}
          </div>
        </main>
      </div>
    </div>
  );
}
