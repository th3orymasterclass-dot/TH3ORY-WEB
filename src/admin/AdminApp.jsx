import React, { useState } from 'react';
import {
  LayoutDashboard, Type, Flame, BookOpen, Tag,
  Star, HelpCircle, User, Gift, Target, Video,
  LogOut, ChevronRight, Menu, X, ExternalLink, Shield,
  FolderOpen, Layers, ShoppingBag, MessageSquare, Building2
} from 'lucide-react';
import useAdminData from './useAdminData';
import { isAdminAuthenticated } from '../data/adminData';
import OverviewPanel       from './panels/OverviewPanel';
import EnrollmentsPanel    from './panels/EnrollmentsPanel';
import QueriesQuotesPanel  from './panels/QueriesQuotesPanel';
import HeroPanel           from './panels/HeroPanel';
import UrgencyPanel        from './panels/UrgencyPanel';
import CurriculumPanel     from './panels/CurriculumPanel';
import ContentPanel        from './panels/ContentPanel';
import PricingPanel        from './panels/PricingPanel';
import ReviewsPanel        from './panels/ReviewsPanel';
import FAQPanel            from './panels/FAQPanel';
import InstructorPanel     from './panels/InstructorPanel';
import BonusesPanel        from './panels/BonusesPanel';
import OutcomesPanel       from './panels/OutcomesPanel';
import MediaPanel          from './panels/MediaPanel';

const NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',           icon: LayoutDashboard },
  { id: '__divider_db', divider: true, label: 'DATABASE & SALES' },
  { id: 'enrollments', label: 'Enrollments & Sales',icon: ShoppingBag, badge: 'LIVE' },
  { id: 'requests',    label: 'Queries & Quotes',   icon: MessageSquare, badge: 'DB' },
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const adminState = useAdminData();
  const { data, save, reset, defaults, lastSaved, enrollments, queries, enterpriseQuotes, contactInquiries, updateQueryStatus, updateQuoteStatus, updateInquiryStatus } = adminState;

  // Enforce session access control
  React.useEffect(() => {
    if (!isAdminAuthenticated()) {
      onLogout();
    }
  }, [onLogout]);

  const panelProps = { data, save, reset, defaults, lastSaved, enrollments, queries, enterpriseQuotes, contactInquiries };

  const renderPanel = () => {
    switch (active) {
      case 'overview':   return <OverviewPanel   {...panelProps} />;
      case 'enrollments':return <EnrollmentsPanel enrollments={enrollments} />;
      case 'requests':   return <QueriesQuotesPanel queries={queries} enterpriseQuotes={enterpriseQuotes} contactInquiries={contactInquiries} updateQueryStatus={updateQueryStatus} updateQuoteStatus={updateQuoteStatus} updateInquiryStatus={updateInquiryStatus} />;
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

  return (
    <div className="min-h-screen bg-[#060910] text-slate-100 flex" style={{fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif"}}>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} shrink-0 transition-all duration-300 flex flex-col bg-slate-950 border-r border-slate-800/60`}>
        {/* Brand */}
        <div className="px-5 py-5 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <p className="font-black text-white text-sm tracking-tight">TH3ORY</p>
              <p className="text-slate-500 text-xs">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            if (item.divider) {
              return (
                <div key={item.id} className="pt-4 pb-1.5 px-2">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.15em]">{item.label}</p>
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
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="truncate">{item.label}</span>
                {item.badge && !isActive && (
                  <span className="ml-auto text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider">{item.badge}</span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-amber-500/60" />}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="px-3 pb-4 space-y-2 border-t border-slate-800/60 pt-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 text-sm font-medium transition-all"
          >
            <ExternalLink className="w-4 h-4 text-slate-500" />
            View Public Site
          </a>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/30 text-sm font-medium transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-slate-800/60 flex items-center px-5 gap-4 shrink-0 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="text-slate-500 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
            <span className="text-white font-semibold">{currentNav?.label}</span>
          </div>

          {lastSaved && (
            <div className="ml-auto flex items-center gap-2 bg-green-950/40 border border-green-500/20 rounded-full px-3 py-1 text-green-400 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Saved {lastSaved.toLocaleTimeString()}
            </div>
          )}
        </header>

        {/* Panel content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {renderPanel()}
          </div>
        </main>
      </div>
    </div>
  );
}
