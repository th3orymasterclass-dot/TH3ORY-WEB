import React, { useState } from 'react';
import {
  LayoutDashboard, ShoppingBag, HelpCircle, Tag, Mail, Database,
  Sliders, ShieldCheck, Sun, Moon, Type, Flame, BookOpen, FolderOpen,
  Star, User, Gift, Target, Video, ChevronRight, Menu, X, ExternalLink, LogOut, Shield
} from 'lucide-react';
import useAdminData from './useAdminData';
import OverviewPanel       from './panels/OverviewPanel';

const isAdminAuthenticated = () => (
  typeof window !== 'undefined' && (sessionStorage.getItem('th3ory_admin_auth') === '1' || localStorage.getItem('th3ory_admin_auth') === '1')
);
import EnrollmentsPanel    from './panels/EnrollmentsPanel';
import QueriesQuotesPanel  from './panels/QueriesQuotesPanel';
import CouponsPanel        from './panels/CouponsPanel';
import HeroPanel           from './panels/HeroPanel';
import UrgencyPanel        from './panels/UrgencyPanel';
import CurriculumPanel     from './panels/CurriculumPanel';
import PricingPanel        from './panels/PricingPanel';
import ContentPanel        from './panels/ContentPanel';
import ReviewsPanel        from './panels/ReviewsPanel';
import FAQPanel            from './panels/FAQPanel';
import InstructorPanel     from './panels/InstructorPanel';
import BonusesPanel        from './panels/BonusesPanel';
import OutcomesPanel       from './panels/OutcomesPanel';
import MediaPanel          from './panels/MediaPanel';
import IntegrationsPanel   from './panels/IntegrationsPanel';
import NewsletterPanel     from './panels/NewsletterPanel';
import FeatureFlagsPanel   from './panels/FeatureFlagsPanel';
import TeamApprovalsPanel  from './panels/TeamApprovalsPanel';
import AmbassadorApplicationsPanel from './panels/AmbassadorApplicationsPanel';

const NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',           icon: LayoutDashboard },
  { id: '__divider_db', divider: true, label: 'DATABASE & SALES' },
  { id: 'ambassador_apps', label: 'Ambassador Applications', icon: Users, badge: 'AMBASSADOR' },
  { id: 'team_approvals', label: 'Team Approvals', icon: ShieldCheck, badge: 'QUEUE' },
  { id: 'feature_flags', label: 'Vercel Feature Flags', icon: Sliders, badge: 'VERCEL' },
  { id: 'enrollments', label: 'Enrollments & Sales',icon: ShoppingBag, badge: 'LIVE' },
  { id: 'queries_quotes', label: 'Forms & Quotes',  icon: HelpCircle, badge: 'FORMS' },
  { id: 'coupons',     label: 'Coupons & Affiliations', icon: Tag, badge: 'OFFERS' },

  { id: 'newsletter',  label: 'Newsletter Subscribers', icon: Mail, badge: 'COMM' },
  { id: 'integrations',label: 'Integrations & API', icon: Database, badge: 'DIAG' },
  { id: '__divider1',  divider: true, label: 'SITE CONTENT' },
  { id: 'hero',        label: 'Hero & Branding',     icon: Type },
  { id: 'urgency',     label: 'Urgency & Seats',     icon: Flame },
  { id: 'curriculum',  label: 'Curriculum',          icon: BookOpen },
  { id: '__divider2',  divider: true, label: 'FILES & MEDIA' },
  { id: 'content',     label: 'Content Library',     icon: FolderOpen, badge: 'NEW' },
  { id: '__divider3',  divider: true, label: 'SALES & SOCIAL' },
  { id: 'pricing',     label: 'Pricing Plans',       icon: Tag },
  { id: 'reviews',     label: 'Reviews',             icon: Star },
  { id: 'faqs',        label: 'FAQs',                icon: HelpCircle },
  { id: '__divider4',  divider: true, label: 'DETAILS' },
  { id: 'instructor',  label: 'Instructor',          icon: User },
  { id: 'bonuses',     label: 'Bonuses & Add-ons',   icon: Gift },
  { id: 'outcomes',    label: 'Outcomes & Pillars',  icon: Target },
  { id: 'media',       label: 'Video & Media',       icon: Video },
];

export default function AdminApp({ onLogout }) {
  const [active, setActive] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true));
  const [themeMode, setThemeMode] = useState(() => (
    localStorage.getItem('th3ory_admin_theme') || 'dark'
  ));

  const toggleTheme = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    localStorage.setItem('th3ory_admin_theme', next);
  };

  const adminState = useAdminData();
  const {
    data, save, reset, defaults, lastSaved,
    enrollments, queries = [], enterpriseQuotes = [], contactInquiries = [],
    newsletterSubscribers, newsletterBroadcasts, saveBroadcast,
    updateQueryStatus, deleteQuery, updateQuoteStatus, updateInquiryStatus,
    updateSubscriberStatus, deleteSubscriber
  } = adminState;

  // Enforce session access control
  React.useEffect(() => {
    if (!isAdminAuthenticated()) {
      onLogout();
    }
  }, [onLogout]);

  const panelProps = { data, save, reset, defaults, lastSaved, enrollments, queries, enterpriseQuotes, contactInquiries, themeMode };

  const renderPanel = () => {
    switch (active) {
      case 'overview':   return <OverviewPanel   {...panelProps} />;
      case 'ambassador_apps': return <AmbassadorApplicationsPanel themeMode={themeMode} />;
      case 'team_approvals': return <TeamApprovalsPanel themeMode={themeMode} />;
      case 'feature_flags': return <FeatureFlagsPanel themeMode={themeMode} />;
      case 'enrollments':return <EnrollmentsPanel enrollments={enrollments} themeMode={themeMode} />;
      case 'queries_quotes': return <QueriesQuotesPanel queries={queries} enterpriseQuotes={enterpriseQuotes} contactInquiries={contactInquiries} updateQueryStatus={updateQueryStatus} updateQuoteStatus={updateQuoteStatus} updateInquiryStatus={updateInquiryStatus} deleteQuery={deleteQuery} themeMode={themeMode} />;
      case 'coupons':    return <CouponsPanel     save={save} enrollments={enrollments} themeMode={themeMode} />;

      case 'newsletter': return <NewsletterPanel subscribers={newsletterSubscribers} broadcasts={newsletterBroadcasts} saveBroadcast={saveBroadcast} updateSubscriberStatus={updateSubscriberStatus} deleteSubscriber={deleteSubscriber} save={save} data={data} themeMode={themeMode} />;
      case 'integrations':return <IntegrationsPanel themeMode={themeMode} />;
      case 'hero':       return <HeroPanel       {...panelProps} />;
      case 'urgency':    return <UrgencyPanel    {...panelProps} />;
      case 'curriculum': return <CurriculumPanel {...panelProps} />;
      case 'content':    return <ContentPanel    {...panelProps} />;
      case 'pricing':    return <PricingPanel    {...panelProps} />;
      case 'reviews':    return <ReviewsPanel    {...panelProps} />;
      case 'faqs':       return <FAQPanel        {...panelProps} />;
      case 'instructor': return <InstructorPanel {...panelProps} />;
      case 'bonuses':    return <BonusesPanel    {...panelProps} />;
      case 'outcomes':   return <OutcomesPanel   {...panelProps} />;
      case 'media':      return <MediaPanel      {...panelProps} />;
      default:           return <OverviewPanel   {...panelProps} />;
    }
  };

  const currentNav = NAV_ITEMS.find(n => n.id === active);

  const isDark = themeMode === 'dark';

  return (
    <div className={`min-h-screen flex relative transition-colors duration-200 ${
      isDark ? 'bg-[#05080F] text-[#FAFAF7]' : 'bg-[#F8FAFC] text-[#0F172A]'
    }`} style={{fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif"}}>

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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#6344E0] flex items-center justify-center shrink-0 shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`font-black text-sm tracking-tight font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>TH3ORY</p>
              <p className={`text-xs font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Admin Command Center</p>
            </div>
          </div>
        </div>

        {/* Nav list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            if (item.divider) {
              return (
                <div key={item.id} className="pt-3 pb-1 px-2">
                  <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</p>
                </div>
              );
            }
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
                    ? isDark ? 'text-amber-400' : 'text-indigo-600' 
                    : isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-700'
                }`} />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${
                    isActive
                      ? isDark ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' : 'bg-indigo-100 text-indigo-800 border-indigo-300'
                      : isDark ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && !item.badge && <ChevronRight className={`w-3.5 h-3.5 ml-auto ${isDark ? 'text-amber-400' : 'text-indigo-600'}`} />}
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
            View Live Site
          </a>
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isDark ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-950/30' : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
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
            <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Admin</span>
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

            {lastSaved && (
              <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs shrink-0 border ${
                isDark ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
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
