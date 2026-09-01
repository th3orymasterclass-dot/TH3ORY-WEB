import React, { useState, useEffect } from 'react';
import {
  HelpCircle, Mail, Tag, Send, Users, Shield, LogOut, ChevronRight, 
  Menu, X, ExternalLink, Sun, Moon, BarChart3, Share2, Sparkles,
  UserCheck, UserPlus, CheckCircle2, QrCode, RefreshCw
} from 'lucide-react';
import useAdminData from '../admin/useAdminData';
import TeamQuotesPanel from './panels/TeamQuotesPanel';
import TeamInquiriesPanel from './panels/TeamInquiriesPanel';
import TeamAffiliatesPanel from './panels/TeamAffiliatesPanel';
import NewsletterPanel from '../admin/panels/NewsletterPanel';
import AmbassadorApplicationsPanel from '../admin/panels/AmbassadorApplicationsPanel';
import TeamAnalyticsDashboard from './panels/TeamAnalyticsDashboard';
import TeamShareableContentPanel from './panels/TeamShareableContentPanel';
import { fetchAllTeamMembersFromSupabase } from '../services/supabaseService';

const TEAM_NAV = [
  { id: 'analytics',  label: 'Overview & My Analytics',    icon: BarChart3 },
  { id: 'shareable',  label: 'Shareable Content & Kits',   icon: Share2 },
  { id: 'quotes',     label: 'Enterprise Quotes & Leads',  icon: HelpCircle },
  { id: 'inquiries',  label: 'Contact Us Enquiries',       icon: Mail },
  { id: 'affiliates', label: 'Affiliation Programs',      icon: Tag },
  { id: 'newsletter', label: 'Newsletter Subscriptions',    icon: Send },
  { id: 'ambassador', label: 'Campus Ambassador Program',  icon: Users },
];

export default function TeamApp({ onLogout }) {
  const [active, setActive] = useState('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true));
  const [themeMode, setThemeMode] = useState(() => (
    localStorage.getItem('th3ory_team_theme') || 'dark'
  ));

  // Current logged in person's profile
  const [teamProfile, setTeamProfile] = useState(() => {
    try {
      const raw = sessionStorage.getItem('th3ory_team_profile') || localStorage.getItem('th3ory_team_profile');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      name: 'Alex Vance',
      role: 'Enterprise Outreach Lead',
      department: 'Enterprise & B2B',
      email: 'alex.ops@th3ory.online',
      memberId: 'TEAM-MEM-1001',
      repCode: 'REP-ALEX',
      phone: '+91 98765 01001'
    };
  });

  const [allMembers, setAllMembers] = useState([]);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

  useEffect(() => {
    async function loadMembers() {
      try {
        const list = await fetchAllTeamMembersFromSupabase();
        if (list) setAllMembers(list);
      } catch {}
    }
    loadMembers();
  }, []);

  const handleSwitchAccount = (member) => {
    const profileObj = {
      role: member.role || 'Enterprise Outreach Lead',
      name: member.name || 'Team Officer',
      email: member.email || 'team@th3ory.online',
      memberId: member.memberId || member.member_id || 'TEAM-MEM-1001',
      repCode: member.repCode || member.rep_code || 'REP-TEAM',
      department: member.department || 'Enterprise & B2B',
      phone: member.phone || '',
      customQuote: member.customQuote || member.custom_quote || '',
      loginAt: Date.now()
    };

    setTeamProfile(profileObj);
    sessionStorage.setItem('th3ory_team_profile', JSON.stringify(profileObj));
    localStorage.setItem('th3ory_team_profile', JSON.stringify(profileObj));
    setShowAccountSwitcher(false);
  };

  const toggleTheme = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    localStorage.setItem('th3ory_team_theme', next);
  };

  const adminState = useAdminData();
  const {
    data,
    save,
    reset,
    enterpriseQuotes,
    contactInquiries,
    newsletterSubscribers,
    newsletterBroadcasts,
    updateQuoteStatus,
    updateInquiryStatus,
    updateSubscriberStatus,
    deleteSubscriber,
  } = adminState;

  const currentNav = TEAM_NAV.find(n => n.id === active);

  const renderPanel = () => {
    switch (active) {
      case 'analytics':
        return (
          <TeamAnalyticsDashboard
            enterpriseQuotes={enterpriseQuotes}
            contactInquiries={contactInquiries}
            newsletterSubscribers={newsletterSubscribers}
            teamProfile={teamProfile}
            themeMode={themeMode}
          />
        );
      case 'shareable':
        return (
          <TeamShareableContentPanel
            teamProfile={teamProfile}
            themeMode={themeMode}
          />
        );
      case 'quotes':
        return (
          <TeamQuotesPanel
            enterpriseQuotes={enterpriseQuotes}
            updateQuoteStatus={updateQuoteStatus}
            teamProfile={teamProfile}
            themeMode={themeMode}
          />
        );
      case 'inquiries':
        return (
          <TeamInquiriesPanel
            contactInquiries={contactInquiries}
            updateInquiryStatus={updateInquiryStatus}
            teamProfile={teamProfile}
            themeMode={themeMode}
          />
        );
      case 'affiliates':
        return (
          <TeamAffiliatesPanel
            save={save}
            teamProfile={teamProfile}
            themeMode={themeMode}
          />
        );
      case 'newsletter':
        return (
          <NewsletterPanel
            subscribers={newsletterSubscribers}
            broadcasts={newsletterBroadcasts}
            updateSubscriberStatus={updateSubscriberStatus}
            deleteSubscriber={deleteSubscriber}
            save={save}
            data={data}
            themeMode={themeMode}
          />
        );
      case 'ambassador':
        return (
          <AmbassadorApplicationsPanel
            themeMode={themeMode}
          />
        );
      default:
        return (
          <TeamAnalyticsDashboard
            enterpriseQuotes={enterpriseQuotes}
            contactInquiries={contactInquiries}
            newsletterSubscribers={newsletterSubscribers}
            teamProfile={teamProfile}
            themeMode={themeMode}
          />
        );
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
        {/* Brand Header */}
        <div className={`px-5 py-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`font-black text-sm tracking-tight font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>TH3ORY</p>
              <p className={`text-xs font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Team Operational Portal</p>
            </div>
          </div>
        </div>

        {/* Active Person Profile Card in Sidebar */}
        <div className={`p-3.5 mx-3 mt-3 rounded-2xl border ${
          isDark ? 'bg-slate-950/70 border-slate-800/80' : 'bg-indigo-50/60 border-indigo-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs">
              {(teamProfile.name || 'T')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`font-bold text-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{teamProfile.name}</p>
              <p className="text-[10px] text-indigo-400 font-semibold truncate">{teamProfile.role}</p>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
            <span className="font-mono text-purple-400 font-bold">{teamProfile.repCode || 'REP-TEAM'}</span>
            <button
              onClick={() => setShowAccountSwitcher(true)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
            >
              Switch Account
            </button>
          </div>
        </div>

        {/* Operational Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="pb-2 px-2">
            <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              ACCOUNT WORKSPACE MODULES
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
                {item.badge && (
                  <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase ${
                    isActive
                      ? isDark ? 'bg-indigo-500/30 text-indigo-300' : 'bg-indigo-200 text-indigo-900'
                      : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className={`px-3 pb-4 space-y-2 border-t pt-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            onClick={() => { window.location.hash = '#/team-register'; window.dispatchEvent(new Event('hashchange')); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isDark ? 'text-indigo-400 hover:text-white hover:bg-indigo-950/40 border border-indigo-900/60' : 'text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register Team Account
          </button>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            View Public Site
          </a>
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
              isDark ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30' : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out ({teamProfile.name.split(' ')[0]})
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className={`h-16 border-b flex items-center px-4 sm:px-6 gap-3 sm:gap-4 shrink-0 backdrop-blur-sm sticky top-0 z-10 transition-colors ${
          isDark ? 'bg-[#0B0F19]/90 border-slate-800 text-white' : 'bg-white/90 border-slate-200/80 text-slate-900 shadow-xs'
        }`}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-w-0 truncate">
            <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Team Portal</span>
            <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-[#555A66]' : 'text-slate-300'}`} />
            <span className="font-semibold truncate">{currentNav?.label}</span>
          </div>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* Account Switcher Header Pill */}
            <button
              onClick={() => setShowAccountSwitcher(true)}
              className={`p-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 px-3 transition-all cursor-pointer ${
                isDark 
                  ? 'bg-slate-950 border-indigo-500/40 text-indigo-300 hover:border-indigo-400' 
                  : 'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100'
              }`}
            >
              <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-black">
                {(teamProfile.name || 'T')[0].toUpperCase()}
              </div>
              <span className="hidden sm:inline font-semibold">{teamProfile.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono">
                {teamProfile.repCode || 'REP'}
              </span>
            </button>

            {/* Theme Toggle */}
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
              <span className="hidden md:inline">{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </header>

        {/* Panel content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {renderPanel()}
          </div>
        </main>
      </div>

      {/* Account Switcher Modal */}
      {showAccountSwitcher && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Switch Team Account</h3>
              </div>
              <button
                onClick={() => setShowAccountSwitcher(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Select any registered team member profile to switch the workspace and align the dashboard to their assigned department, quotes, and shareable content.
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {allMembers.map(m => {
                const isCurrent = (m.email && m.email === teamProfile.email) || (m.memberId && m.memberId === teamProfile.memberId);
                return (
                  <div
                    key={m.memberId || m.member_id || m.email}
                    onClick={() => handleSwitchAccount(m)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isCurrent
                        ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {(m.name || 'T')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">{m.name}</p>
                        <p className="text-[10px] text-indigo-400">{m.role || m.department}</p>
                        <p className="text-[9px] font-mono text-slate-500">{m.repCode || m.rep_code}</p>
                      </div>
                    </div>
                    {isCurrent && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowAccountSwitcher(false);
                  window.location.hash = '#/team-register';
                  window.dispatchEvent(new Event('hashchange'));
                }}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register New Person</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAccountSwitcher(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
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
