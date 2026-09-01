import React, { useState } from 'react';
import {
  LayoutDashboard, ShoppingBag, HelpCircle, Tag, Mail, Database,
  Sliders, ShieldCheck, Sun, Moon, Type, Flame, BookOpen, FolderOpen,
  Star, User, Gift, Target, Video, ChevronRight, Menu, X, ExternalLink, 
  LogOut, Shield, Users, Calendar, BarChart3, Sparkles, MessageSquare, GraduationCap
} from 'lucide-react';
import useAdminData from './useAdminData';
import OverviewPanel       from './panels/OverviewPanel';
import CalendlyModal       from '../components/CalendlyModal';

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
import TeamManagementPanel from './panels/TeamManagementPanel';
import TeamApprovalsPanel  from './panels/TeamApprovalsPanel';
import AmbassadorApplicationsPanel from './panels/AmbassadorApplicationsPanel';
import PortalEmailDispatcherPanel from './panels/PortalEmailDispatcherPanel';
import TeamAnalyticsDashboard from '../team/panels/TeamAnalyticsDashboard';
import DPDPCompliancePanel from './panels/DPDPCompliancePanel';
import SectionVisibilityPanel from './panels/SectionVisibilityPanel';
import CampaignPanel from './panels/CampaignPanel';
import PillarsPanel from './panels/PillarsPanel';
import OfflineTrainingsPanel from './panels/OfflineTrainingsPanel';
import ContactPanel from './panels/ContactPanel';

const NAV_ITEMS = [
  { id: 'overview',           label: 'Overview',                   icon: LayoutDashboard },
  { id: 'section_visibility', label: 'Section Master Switches',    icon: Sliders },
  { id: 'dpdp_compliance',    label: 'DPDP Privacy & Compliance',  icon: ShieldCheck },
  { id: 'analytics',          label: 'Analytics & Intelligence',   icon: BarChart3 },
  
  { id: '__divider_landing',  divider: true, label: 'HOMEPAGE & LANDING CONTENT' },
  { id: 'hero',               label: 'Hero & Branding',            icon: Type },
  { id: 'campaign',           label: 'Launch Campaign (₹499)',     icon: Flame },
  { id: 'pillars',            label: '5 Pillars & Differentiators',icon: Sparkles },
  { id: 'curriculum',         label: 'Curriculum & Roadmap',       icon: BookOpen },
  { id: 'outcomes',           label: 'Outcomes & Transformation',  icon: Target },
  { id: 'bonuses',            label: 'Bonuses & Perks',            icon: Gift },
  { id: 'instructor',         label: 'Instructor Spotlight',       icon: User },
  { id: 'offline_trainings',  label: 'Offline Trainings Marquee',  icon: GraduationCap },
  { id: 'pricing',            label: 'Pricing & Plans',            icon: Tag },
  { id: 'contact_settings',   label: 'Contact, Studio & Footer',   icon: MessageSquare },
  { id: 'faqs',               label: 'FAQs Management',            icon: HelpCircle },
  { id: 'urgency',            label: 'Urgency & Seats Counter',    icon: Flame },
  { id: 'media',              label: 'Video & Media Player',       icon: Video },
  { id: 'content',            label: 'Content Library (PDF/Video)',icon: FolderOpen },

  { id: '__divider_db',       divider: true, label: 'SALES & COMMUNICATIONS' },
  { id: 'team_roster',        label: 'Team Accounts & Roster',     icon: Users },
  { id: 'email_dispatcher',   label: 'Resend Email System',        icon: Mail },
  { id: 'ambassador_apps',    label: 'Ambassador Applications',    icon: Users },
  { id: 'team_approvals',     label: 'Team Approvals',             icon: ShieldCheck },
  { id: 'feature_flags',      label: 'Vercel Feature Flags',       icon: Sliders },
  { id: 'enrollments',        label: 'Enrollments & Sales',        icon: ShoppingBag },
  { id: 'queries_quotes',     label: 'Forms & Quotes',             icon: HelpCircle },
  { id: 'coupons',            label: 'Coupons & Affiliations',     icon: Tag },
  { id: 'newsletter',         label: 'Newsletter Subscribers',     icon: Mail },
  { id: 'integrations',       label: 'Integrations & API',         icon: Database },
];

export default function AdminApp({ onLogout }) {
  const [active, setActive]           = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true));
  const [themeMode, setThemeMode]     = useState(() => (
    localStorage.getItem('th3ory_admin_theme') || 'dark'
  ));
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);

  const toggleTheme = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    localStorage.setItem('th3ory_admin_theme', next);
  };

  const {
    data,
    save,
    reset,
    lastSaved,
    enrollments,
    queries,
    enterpriseQuotes,
    contactInquiries,
    newsletterSubscribers,
    newsletterBroadcasts,
    saveBroadcast,
    updateQueryStatus,
    deleteQuery,
    updateQuoteStatus,
    updateInquiryStatus,
    updateSubscriberStatus,
    deleteSubscriber,
  } = useAdminData();

  const isDark = themeMode === 'dark';
  const panelProps = { data, save, reset, themeMode };

  // Enforce session access control
  React.useEffect(() => {
    if (!isAdminAuthenticated()) {
      onLogout();
    }
  }, [onLogout]);

  const renderPanel = () => {
    switch (active) {
      case 'overview':           return (
        <OverviewPanel 
          data={data} 
          save={save} 
          reset={reset} 
          lastSaved={lastSaved} 
          enrollments={enrollments} 
          queries={queries} 
          enterpriseQuotes={enterpriseQuotes} 
          contactInquiries={contactInquiries} 
          themeMode={themeMode} 
        />
      );
      case 'section_visibility': return <SectionVisibilityPanel {...panelProps} />;
      case 'dpdp_compliance':    return <DPDPCompliancePanel />;
      case 'analytics':          return (
        <TeamAnalyticsDashboard 
          enterpriseQuotes={enterpriseQuotes} 
          contactInquiries={contactInquiries} 
          newsletterSubscribers={newsletterSubscribers} 
          themeMode={themeMode} 
          isAdminView={true} 
        />
      );
      case 'hero':               return <HeroPanel {...panelProps} />;
      case 'campaign':           return <CampaignPanel {...panelProps} />;
      case 'pillars':            return <PillarsPanel {...panelProps} />;
      case 'curriculum':         return <CurriculumPanel {...panelProps} />;
      case 'outcomes':           return <OutcomesPanel {...panelProps} />;
      case 'bonuses':            return <BonusesPanel {...panelProps} />;
      case 'instructor':         return <InstructorPanel {...panelProps} />;
      case 'offline_trainings':  return <OfflineTrainingsPanel {...panelProps} />;
      case 'pricing':            return <PricingPanel {...panelProps} />;
      case 'contact_settings':   return <ContactPanel {...panelProps} />;
      case 'faqs':               return <FAQPanel {...panelProps} />;
      case 'urgency':            return <UrgencyPanel {...panelProps} />;
      case 'media':              return <MediaPanel {...panelProps} />;
      case 'content':            return <ContentPanel {...panelProps} />;
      case 'reviews':            return <ReviewsPanel {...panelProps} />;
      case 'team_roster':        return <TeamManagementPanel themeMode={themeMode} />;
      case 'email_dispatcher':   return <PortalEmailDispatcherPanel themeMode={themeMode} />;
      case 'ambassador_apps':    return <AmbassadorApplicationsPanel themeMode={themeMode} />;
      case 'team_approvals':     return <TeamApprovalsPanel themeMode={themeMode} />;
      case 'feature_flags':      return <FeatureFlagsPanel themeMode={themeMode} />;
      case 'enrollments':        return <EnrollmentsPanel enrollments={enrollments} themeMode={themeMode} />;
      case 'queries_quotes':     return (
        <QueriesQuotesPanel
          queries={queries}
          enterpriseQuotes={enterpriseQuotes}
          contactInquiries={contactInquiries}
          updateQueryStatus={updateQueryStatus}
          updateQuoteStatus={updateQuoteStatus}
          updateInquiryStatus={updateInquiryStatus}
          deleteQuery={deleteQuery}
          themeMode={themeMode}
        />
      );
      case 'coupons':            return <CouponsPanel save={save} enrollments={enrollments} themeMode={themeMode} />;
      case 'newsletter':         return (
        <NewsletterPanel 
          subscribers={newsletterSubscribers} 
          broadcasts={newsletterBroadcasts} 
          saveBroadcast={saveBroadcast} 
          updateSubscriberStatus={updateSubscriberStatus} 
          deleteSubscriber={deleteSubscriber} 
          save={save} 
          data={data} 
          themeMode={themeMode} 
        />
      );
      case 'integrations':       return <IntegrationsPanel themeMode={themeMode} />;
      default:                   return (
        <OverviewPanel 
          data={data} 
          save={save} 
          reset={reset} 
          lastSaved={lastSaved} 
          enrollments={enrollments} 
          queries={queries} 
          enterpriseQuotes={enterpriseQuotes} 
          contactInquiries={contactInquiries} 
          themeMode={themeMode} 
        />
      );
    }
  };

  const currentNav = NAV_ITEMS.find(n => n.id === active) || NAV_ITEMS[0];

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`} style={{fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif"}}>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 transition-transform duration-300 flex flex-col ${
        isDark ? 'bg-slate-900/90 border-r border-slate-800' : 'bg-white border-r border-slate-200'
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}`}>
        {/* Brand */}
        <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
              T
            </div>
            <div>
              <h1 className={`font-bold text-sm leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>TH3ORY</h1>
              <p className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Admin Portal</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`p-1.5 rounded-lg md:hidden ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            if (item.divider) {
              return (
                <div key={item.id} className="pt-4 pb-1 px-3">
                  <p className={`text-[10px] font-black tracking-wider uppercase font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {item.label}
                  </p>
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
                      ? 'bg-indigo-600/25 text-white border border-indigo-500/40'
                      : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
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
                {isActive && <ChevronRight className={`w-3.5 h-3.5 ml-auto ${isDark ? 'text-amber-400' : 'text-indigo-600'}`} />}
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
            {/* Calendly Meeting Button */}
            <button
              onClick={() => setIsCalendlyOpen(true)}
              className="p-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 text-amber-300 font-bold text-xs flex items-center gap-1.5 px-3 transition-all cursor-pointer hover:bg-amber-500/25"
              title="Schedule Live Meeting via Calendly"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Schedule Meeting</span>
            </button>

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

      {/* Calendly Live Meeting Initiation Modal */}
      <CalendlyModal
        isOpen={isCalendlyOpen}
        onClose={() => setIsCalendlyOpen(false)}
        title="Admin Portal — Initiate Live Meeting"
        subtitle="Schedule a 1-on-1 meeting via Calendly for students, leads, or team members"
      />
    </div>
  );
}
