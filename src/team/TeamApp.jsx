import React, { useState } from 'react';
import {
  HelpCircle, Mail, Tag, Shield, LogOut, ChevronRight, Menu, X, ExternalLink, Sun, Moon, Users
} from 'lucide-react';
import TeamQuotesPanel from './panels/TeamQuotesPanel';
import TeamInquiriesPanel from './panels/TeamInquiriesPanel';
import TeamAffiliatesPanel from './panels/TeamAffiliatesPanel';
import AmbassadorApplicationsPanel from '../admin/panels/AmbassadorApplicationsPanel';
import useAdminData from '../admin/useAdminData';

const TEAM_NAV = [
  { id: 'quotes',     label: 'Enterprise Quotes',    icon: HelpCircle, badge: 'RESTRICTED' },
  { id: 'ambassador', label: 'Ambassador Applications', icon: Users,      badge: 'REVIEW' },
  { id: 'inquiries',  label: 'Contact Us Inquiries', icon: Mail,       badge: 'RESTRICTED' },
  { id: 'affiliates', label: 'Affiliate Program',    icon: Tag,        badge: 'POLICY' },
];

export default function TeamApp({ onLogout }) {
  const [active, setActive] = useState('quotes');
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true));
  const [themeMode, setThemeMode] = useState(() => (
    localStorage.getItem('th3ory_team_theme') || 'dark'
  ));

  const toggleTheme = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    localStorage.setItem('th3ory_team_theme', next);
  };

  const adminState = useAdminData();
  const { enterpriseQuotes = [], contactInquiries = [], updateQuoteStatus, updateInquiryStatus, save } = adminState;

  const currentNav = TEAM_NAV.find(n => n.id === active);

  const renderPanel = () => {
    switch (active) {
      case 'quotes':     return <TeamQuotesPanel enterpriseQuotes={enterpriseQuotes} updateQuoteStatus={updateQuoteStatus} themeMode={themeMode} />;
      case 'ambassador': return <AmbassadorApplicationsPanel themeMode={themeMode} />;
      case 'inquiries':  return <TeamInquiriesPanel contactInquiries={contactInquiries} updateInquiryStatus={updateInquiryStatus} themeMode={themeMode} />;
      case 'affiliates': return <TeamAffiliatesPanel save={save} themeMode={themeMode} />;
      default:           return <TeamQuotesPanel enterpriseQuotes={enterpriseQuotes} updateQuoteStatus={updateQuoteStatus} themeMode={themeMode} />;
    }
  };

  const isDark = themeMode === 'dark';

  return (
    <div className={`min-h-screen flex relative transition-colors duration-200 ${
      isDark ? 'bg-[#05080F] text-[#FAFAF7]' : 'bg-[#F8FAFC] text-[#0F172A]'
    }`} style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className={`fixed inset-0 backdrop-blur-xs z-40 md:hidden ${
            isDark ? 'bg-[#05080F]/80' : 'bg-slate-900/40'
          }`}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 transition-all duration-300 flex flex-col border-r shadow-2xl md:shadow-none ${
        isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-white border-slate-200/80 shadow-md'
      } ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'
      }`}>
        {/* Brand */}
        <div className={`px-5 py-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`font-black text-sm tracking-tight font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>TH3ORY</p>
              <p className={`text-xs font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Team Access Portal</p>
            </div>
          </div>
        </div>

        {/* Restricted Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="pb-2 px-2">
            <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              ALLOWED MODULES (3 ONLY)
            </p>
          </div>
          {TEAM_NAV.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActive(item.id); if (window.innerWidth < 768) setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? isDark
                      ? 'bg-indigo-600/25 text-white border border-indigo-500/40 font-bold'
                      : 'bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold shadow-xs'
                    : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${
                  isActive 
                    ? isDark ? 'text-indigo-400' : 'text-indigo-600' 
                    : isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-700'
                }`} />
                <span className="truncate">{item.label}</span>
                {isActive && <ChevronRight className={`w-3.5 h-3.5 ml-auto ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className={`px-3 pb-4 space-y-2 border-t pt-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            View Public Site
          </a>
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isDark ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30' : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <LogOut className="w-4 h-4" />
            Sign Out Team Session
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className={`h-14 border-b flex items-center px-4 sm:px-5 gap-4 shrink-0 backdrop-blur-sm sticky top-0 z-10 transition-colors ${
          isDark ? 'bg-[#0B0F19]/80 border-slate-800 text-white' : 'bg-white/90 border-slate-200/80 text-slate-900 shadow-xs'
        }`}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className={`p-1 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-w-0 truncate">
            <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Team Portal</span>
            <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-slate-700' : 'text-slate-300'}`} />
            <span className="font-semibold truncate">{currentNav?.label}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              className={`p-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 px-3 transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span className="hidden sm:inline">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <div className={`rounded-full px-3 py-1 text-xs shrink-0 flex items-center gap-1.5 border ${
              isDark ? 'bg-indigo-950/60 border-indigo-500/30 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-800 font-semibold'
            }`}>
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Restricted Access</span>
            </div>
          </div>
        </header>

        {/* Panel content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {renderPanel()}
          </div>
        </main>
      </div>
    </div>
  );
}
