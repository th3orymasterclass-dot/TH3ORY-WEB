import React, { useState } from 'react';
import {
  LayoutDashboard, Type, Flame, BookOpen, Tag,
  Star, HelpCircle, User, Gift, Target, Video,
  LogOut, ChevronRight, Menu, X, ExternalLink, Shield,
  FolderOpen, Layers, ShoppingBag, Mail
} from 'lucide-react';
import useAdminData from './useAdminData';
import { isAdminAuthenticated } from '../data/adminData';
import OverviewPanel       from './panels/OverviewPanel';
import EnrollmentsPanel    from './panels/EnrollmentsPanel';

import CouponsPanel        from './panels/CouponsPanel';
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
import IntegrationsPanel   from './panels/IntegrationsPanel';
import NewsletterPanel     from './panels/NewsletterPanel';
import FeatureFlagsPanel   from './panels/FeatureFlagsPanel';
import { Database, Sliders } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',           icon: LayoutDashboard },
  { id: '__divider_db', divider: true, label: 'DATABASE & SALES' },
  { id: 'feature_flags', label: 'Vercel Feature Flags', icon: Sliders, badge: 'VERCEL' },
  { id: 'enrollments', label: 'Enrollments & Sales',icon: ShoppingBag, badge: 'LIVE' },
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
  const adminState = useAdminData();
  const { data, save, reset, defaults, lastSaved, enrollments, newsletterSubscribers, newsletterBroadcasts, saveBroadcast, updateSubscriberStatus, deleteSubscriber } = adminState;

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
      case 'feature_flags': return <FeatureFlagsPanel />;
      case 'enrollments':return <EnrollmentsPanel enrollments={enrollments} />;
      case 'coupons':    return <CouponsPanel     save={save} enrollments={enrollments} />;

      case 'newsletter': return <NewsletterPanel subscribers={newsletterSubscribers} broadcasts={newsletterBroadcasts} saveBroadcast={saveBroadcast} updateSubscriberStatus={updateSubscriberStatus} deleteSubscriber={deleteSubscriber} save={save} data={data} />;
      case 'integrations':return <IntegrationsPanel />;
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
    <div className="min-h-screen bg-[#15171A] text-[#FAFAF7] flex relative" style={{fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif"}}>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-[#15171A]/80 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 shrink-0 transition-transform duration-300 flex flex-col bg-[#15171A] border-r border-[#555A66]/30 shadow-2xl md:shadow-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'
      }`}>
        {/* Brand */}
        <div className="px-5 py-5 border-b border-[#555A66]/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#6344E0] flex items-center justify-center shrink-0 shadow-md">
              <Shield className="w-5 h-5 text-[#FAFAF7]" />
            </div>
            <div>
              <p className="font-black text-[#FAFAF7] text-sm tracking-tight font-heading">TH3ORY</p>
              <p className="text-[#555A66] text-xs font-semibold">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            if (item.divider) {
              return (
                <div key={item.id} className="pt-4 pb-1.5 px-2">
                  <p className="text-[10px] font-black text-[#555A66] uppercase tracking-[0.15em]">{item.label}</p>
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
                    ? 'bg-[#7C5CFC]/20 text-[#FAFAF7] border border-[#7C5CFC]/30 font-bold'
                    : 'text-[#555A66] hover:text-[#FAFAF7] hover:bg-[#7C5CFC]/10'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FFC857]' : 'text-[#555A66] group-hover:text-[#E9E4FF]'}`} />
                <span className="truncate">{item.label}</span>
                {item.badge && !isActive && (
                  <span className="ml-auto text-[9px] font-black bg-[#FFC857]/20 text-[#FFC857] border border-[#FFC857]/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider">{item.badge}</span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#FFC857]" />}
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
        <header className="h-14 border-b border-slate-800/60 flex items-center px-4 sm:px-5 gap-4 shrink-0 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-w-0 truncate">
            <span className="text-slate-500 hidden sm:inline">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-700 hidden sm:inline" />
            <span className="text-white font-semibold truncate">{currentNav?.label}</span>
          </div>

          {lastSaved && (
            <div className="ml-auto flex items-center gap-2 bg-green-950/40 border border-green-500/20 rounded-full px-3 py-1 text-green-400 text-xs shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Saved {lastSaved.toLocaleTimeString()}
            </div>
          )}
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
