import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingBag, HelpCircle, Tag, Mail, Database,
  Sliders, ShieldCheck, Sun, Moon, Type, Flame, BookOpen, FolderOpen,
  Star, User, Gift, Target, Video, ChevronRight, ChevronDown, Menu, X, ExternalLink, 
  LogOut, Shield, Users, Calendar, BarChart3, Sparkles, MessageSquare, GraduationCap,
  Search, ChevronsUpDown, Share2, FileText
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
import ReferralTrackingPanel from './panels/ReferralTrackingPanel';
import CommunityAdminPanel from './panels/CommunityAdminPanel';
import BlogPanel from './panels/BlogPanel';
import ContentHubPanel from './panels/ContentHubPanel';

export const NAV_CATEGORIES = [
  {
    id: 'dashboard',
    title: 'Dashboard & Core',
    icon: LayoutDashboard,
    items: [
      { id: 'overview',           label: 'Overview',                   icon: LayoutDashboard },
      { id: 'analytics',          label: 'Analytics & Intelligence',   icon: BarChart3 },
      { id: 'section_visibility', label: 'Section Master Switches',    icon: Sliders },
      { id: 'dpdp_compliance',    label: 'DPDP Privacy & Compliance',  icon: ShieldCheck },
      { id: 'feature_flags',      label: 'Vercel Feature Flags',       icon: Sliders },
    ]
  },
  {
    id: 'content_studio',
    title: 'Content & Publishing Hub',
    icon: FolderOpen,
    items: [
      { id: 'content_hub',       label: 'Content Studio Master',       icon: Layers },
      { id: 'content_videos',    label: 'Course Videos & Streams',     icon: Video },
      { id: 'content_resources', label: 'Resources & Workbooks (PDF)', icon: FileText },
      { id: 'blogs',             label: 'Blog & Articles Studio',      icon: BookOpen },
      { id: 'community_hub',     label: 'Community Posts & Wall',      icon: MessageSquare },
      { id: 'curriculum',        label: 'Curriculum & Roadmap',        icon: Sliders },
    ]
  },
  {
    id: 'landing',
    title: 'Homepage & Landing',
    icon: Sparkles,
    items: [
      { id: 'hero',               label: 'Hero & Branding',            icon: Type },
      { id: 'campaign',           label: 'Launch Campaign (₹499)',     icon: Flame },
      { id: 'pillars',            label: '5 Pillars & Differentiators',icon: Sparkles },
      { id: 'outcomes',           label: 'Outcomes & Transformation',  icon: Target },
      { id: 'bonuses',            label: 'Bonuses & Perks',            icon: Gift },
      { id: 'instructor',         label: 'Instructor Spotlight',       icon: User },
      { id: 'offline_trainings',  label: 'Offline Trainings Marquee',  icon: GraduationCap },
      { id: 'pricing',            label: 'Pricing & Plans',            icon: Tag },
      { id: 'contact_settings',   label: 'Contact, Studio & Footer',   icon: MessageSquare },
      { id: 'faqs',               label: 'FAQs Management',            icon: HelpCircle },
      { id: 'urgency',            label: 'Urgency & Seats Counter',    icon: Flame },
      { id: 'media',              label: 'Video & Media Player',       icon: Video },
      { id: 'reviews',            label: 'Reviews & Testimonials',     icon: Star },
    ]
  },
  {
    id: 'sales',
    title: 'Sales & Commerce',
    icon: ShoppingBag,
    items: [
      { id: 'enrollments',        label: 'Enrollments & Sales',        icon: ShoppingBag },
      { id: 'queries_quotes',     label: 'Forms & Quotes',             icon: HelpCircle },
      { id: 'coupons',            label: 'Coupons & Affiliations',     icon: Tag },
      { id: 'referral_tracking',  label: 'Referral & Affiliate Tracking', icon: Share2 },
    ]
  },
  {
    id: 'team',
    title: 'Team & Access',
    icon: Users,
    items: [
      { id: 'team_roster',        label: 'Team Accounts & Roster',     icon: Users },
      { id: 'team_approvals',     label: 'Team Approvals',             icon: ShieldCheck },
      { id: 'ambassador_apps',    label: 'Ambassador Applications',    icon: Users },
    ]
  },
  {
    id: 'communications',
    title: 'Communications & System',
    icon: Mail,
    items: [
      { id: 'email_dispatcher',   label: 'Resend Email System',        icon: Mail },
      { id: 'newsletter',         label: 'Newsletter Subscribers',     icon: Mail },
      { id: 'integrations',       label: 'Integrations & API',         icon: Database },
    ]
  }
];

export const ALL_NAV_ITEMS = NAV_CATEGORIES.flatMap(cat => cat.items);

export default function AdminApp({ onLogout }) {
  const [active, setActive]           = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 768 : true));
  const [themeMode, setThemeMode]     = useState(() => (
    localStorage.getItem('th3ory_admin_theme') || 'dark'
  ));
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');

  const findCategoryForPanel = (panelId) => {
    return NAV_CATEGORIES.find(cat => cat.items.some(item => item.id === panelId));
  };

  const [openCategories, setOpenCategories] = useState(() => {
    const initialCat = findCategoryForPanel('overview');
    return {
      dashboard: true,
      landing: false,
      sales: false,
      team: false,
      communications: false,
      ...(initialCat ? { [initialCat.id]: true } : {})
    };
  });

  // Keep the category of the active panel open
  useEffect(() => {
    const parentCat = findCategoryForPanel(active);
    if (parentCat) {
      setOpenCategories(prev => ({ ...prev, [parentCat.id]: true }));
    }
  }, [active]);

  const toggleCategory = (catId) => {
    setOpenCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const allExpanded = useMemo(() => {
    return NAV_CATEGORIES.every(cat => openCategories[cat.id]);
  }, [openCategories]);

  const toggleAllCategories = () => {
    const nextState = !allExpanded;
    const updated = {};
    NAV_CATEGORIES.forEach(cat => {
      updated[cat.id] = nextState;
    });
    setOpenCategories(updated);
  };

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return NAV_CATEGORIES;

    return NAV_CATEGORIES.map(cat => {
      const matchingItems = cat.items.filter(item =>
        item.label.toLowerCase().includes(q) || cat.title.toLowerCase().includes(q)
      );
      return {
        ...cat,
        items: matchingItems
      };
    }).filter(cat => cat.items.length > 0);
  }, [searchQuery]);

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
      case 'outcomes':           return <OutcomesPanel {...panelProps} />;
      case 'bonuses':            return <BonusesPanel {...panelProps} />;
      case 'instructor':         return <InstructorPanel {...panelProps} />;
      case 'offline_trainings':  return <OfflineTrainingsPanel {...panelProps} />;
      case 'pricing':            return <PricingPanel {...panelProps} />;
      case 'contact_settings':   return <ContactPanel {...panelProps} />;
      case 'faqs':               return <FAQPanel {...panelProps} />;
      case 'urgency':            return <UrgencyPanel {...panelProps} />;
      case 'media':              return <MediaPanel {...panelProps} />;
      case 'reviews':            return <ReviewsPanel {...panelProps} />;
      case 'team_roster':        return <TeamManagementPanel themeMode={themeMode} />;
      case 'content_hub':
      case 'content_videos':
        return (
          <ContentHubPanel 
            {...panelProps} 
            initialSector="videos" 
            onNavigateSector={(s) => {
              if (s === 'videos') setActive('content_videos');
              else if (s === 'resources') setActive('content_resources');
              else if (s === 'blogs') setActive('blogs');
              else if (s === 'community') setActive('community_hub');
              else if (s === 'curriculum') setActive('curriculum');
            }} 
          />
        );
      case 'content_resources':
        return (
          <ContentHubPanel 
            {...panelProps} 
            initialSector="resources" 
            onNavigateSector={(s) => {
              if (s === 'videos') setActive('content_videos');
              else if (s === 'resources') setActive('content_resources');
              else if (s === 'blogs') setActive('blogs');
              else if (s === 'community') setActive('community_hub');
              else if (s === 'curriculum') setActive('curriculum');
            }} 
          />
        );
      case 'content':
        return (
          <ContentHubPanel 
            {...panelProps} 
            initialSector="videos" 
            onNavigateSector={(s) => {
              if (s === 'videos') setActive('content_videos');
              else if (s === 'resources') setActive('content_resources');
              else if (s === 'blogs') setActive('blogs');
              else if (s === 'community') setActive('community_hub');
              else if (s === 'curriculum') setActive('curriculum');
            }} 
          />
        );
      case 'curriculum':
        return (
          <ContentHubPanel 
            {...panelProps} 
            initialSector="curriculum" 
            onNavigateSector={(s) => {
              if (s === 'videos') setActive('content_videos');
              else if (s === 'resources') setActive('content_resources');
              else if (s === 'blogs') setActive('blogs');
              else if (s === 'community') setActive('community_hub');
              else if (s === 'curriculum') setActive('curriculum');
            }} 
          />
        );
      case 'blogs':
        return (
          <ContentHubPanel 
            {...panelProps} 
            initialSector="blogs" 
            onNavigateSector={(s) => {
              if (s === 'videos') setActive('content_videos');
              else if (s === 'resources') setActive('content_resources');
              else if (s === 'blogs') setActive('blogs');
              else if (s === 'community') setActive('community_hub');
              else if (s === 'curriculum') setActive('curriculum');
            }} 
          />
        );
      case 'community_hub':
        return (
          <ContentHubPanel 
            {...panelProps} 
            initialSector="community" 
            onNavigateSector={(s) => {
              if (s === 'videos') setActive('content_videos');
              else if (s === 'resources') setActive('content_resources');
              else if (s === 'blogs') setActive('blogs');
              else if (s === 'community') setActive('community_hub');
              else if (s === 'curriculum') setActive('curriculum');
            }} 
          />
        );
      case 'referral_tracking':  return <ReferralTrackingPanel themeMode={themeMode} />;
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

  const currentNav = ALL_NAV_ITEMS.find(n => n.id === active) || ALL_NAV_ITEMS[0];
  const currentCategory = findCategoryForPanel(active);
  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#070A11] text-[#FAFAF7]' : 'bg-slate-50 text-slate-900'}`} style={{fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif"}}>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-68 shrink-0 transition-transform duration-300 flex flex-col ${
        isDark ? 'bg-[#070A11]/95 border-r border-white/10 shadow-2xl shadow-black/80' : 'bg-white border-r border-slate-200 shadow-md'
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}`}>
        {/* Brand Header */}
        <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C5CFC] to-[#FFC857] flex items-center justify-center font-black text-slate-950 shadow-lg shadow-[#7C5CFC]/25 ring-2 ring-white/10">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className={`font-black text-base tracking-tight font-serif ${isDark ? 'text-[#FAFAF7]' : 'text-slate-900'}`}>TH3ORY</h1>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className={`text-[10px] uppercase tracking-[0.18em] font-extrabold ${isDark ? 'text-[#FFC857]' : 'text-indigo-600'}`}>Executive Command</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`p-1.5 rounded-xl md:hidden transition-colors ${isDark ? 'hover:bg-white/10 text-[#8F94A3]' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Collapse Controls */}
        <div className="p-3 pb-2 space-y-2.5">
          <div className="relative">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
              isDark ? 'text-[#8F94A3]' : 'text-slate-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 30 control panels..."
              className={`w-full text-xs pl-8 pr-7 py-2 rounded-xl border transition-all outline-none ${
                isDark
                  ? 'bg-black/60 border-white/10 text-slate-200 placeholder-[#555A66] focus:border-[#FFC857]/50 focus:ring-1 focus:ring-[#FFC857]/30'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#7C5CFC] focus:ring-1 focus:ring-[#7C5CFC]/20'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-sm ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {!searchQuery && (
            <div className="flex items-center justify-between px-1">
              <span className={`text-[10px] font-black tracking-widest uppercase font-mono ${
                isDark ? 'text-[#8F94A3]' : 'text-slate-500'
              }`}>
                Workspaces ({filteredCategories.length})
              </span>
              <button
                onClick={toggleAllCategories}
                className={`text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                  isDark ? 'text-[#FFC857] hover:brightness-125' : 'text-indigo-600 hover:text-indigo-700'
                }`}
                title={allExpanded ? "Collapse all categories" : "Expand all categories"}
              >
                <ChevronsUpDown className="w-3 h-3" />
                <span>{allExpanded ? 'Collapse' : 'Expand All'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-2 scrollbar-thin">
          {filteredCategories.length === 0 ? (
            <div className="py-8 text-center px-4">
              <p className={`text-xs ${isDark ? 'text-[#8F94A3]' : 'text-slate-500'}`}>
                No panels match "{searchQuery}"
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs text-[#FFC857] hover:underline font-bold cursor-pointer"
              >
                Reset search
              </button>
            </div>
          ) : (
            filteredCategories.map((category) => {
              const CategoryIcon = category.icon;
              const isCategoryOpen = searchQuery.trim().length > 0 || !!openCategories[category.id];
              const hasActiveChild = category.items.some(item => item.id === active);

              return (
                <div key={category.id} className="rounded-2xl overflow-hidden border border-white/5">
                  {/* Category Header / Dropdown trigger */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                      hasActiveChild
                        ? isDark
                          ? 'bg-white/[0.06] text-[#FAFAF7]'
                          : 'bg-slate-100 text-slate-900 font-extrabold'
                        : isDark
                          ? 'text-[#8F94A3] hover:text-[#FAFAF7] hover:bg-white/[0.03]'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CategoryIcon className={`w-4 h-4 shrink-0 ${
                        hasActiveChild 
                          ? isDark ? 'text-[#FFC857]' : 'text-indigo-600' 
                          : isDark ? 'text-[#8F94A3]' : 'text-slate-400'
                      }`} />
                      <span className="truncate text-left">{category.title}</span>
                      {hasActiveChild && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FFC857] shrink-0 animate-pulse" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isDark ? 'bg-black/50 text-[#8F94A3] border border-white/5' : 'bg-slate-200/80 text-slate-600'
                      }`}>
                        {category.items.length}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isCategoryOpen ? 'rotate-0' : '-rotate-90'
                      } ${isDark ? 'text-[#8F94A3]' : 'text-slate-400'}`} />
                    </div>
                  </button>

                  {/* Dropdown Items */}
                  {isCategoryOpen && (
                    <div className={`mt-1 space-y-1 pl-2.5 ml-3 border-l ${
                      isDark ? 'border-white/10' : 'border-slate-200'
                    }`}>
                      {category.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = active === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActive(item.id);
                              if (window.innerWidth < 768) setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                              isActive
                                ? isDark
                                  ? 'bg-gradient-to-r from-[#7C5CFC]/25 to-[#FFC857]/10 text-[#FFC857] border border-[#FFC857]/40 shadow-lg shadow-[#FFC857]/5 font-black'
                                  : 'bg-indigo-50 text-indigo-900 border border-indigo-200 shadow-xs font-bold'
                                : isDark
                                  ? 'text-[#8F94A3] hover:text-[#FAFAF7] hover:bg-white/[0.04]'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            <ItemIcon className={`w-3.5 h-3.5 shrink-0 ${
                              isActive
                                ? isDark ? 'text-[#FFC857]' : 'text-indigo-600'
                                : isDark ? 'text-[#8F94A3] group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'
                            }`} />
                            <span className="truncate">{item.label}</span>
                            {isActive && (
                              <ChevronRight className={`w-3.5 h-3.5 ml-auto shrink-0 ${
                                isDark ? 'text-[#FFC857]' : 'text-indigo-600'
                              }`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </nav>

        {/* Footer actions */}
        <div className={`px-3 pb-4 space-y-2 border-t pt-4 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              isDark ? 'text-[#8F94A3] hover:text-white hover:bg-white/[0.04]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ExternalLink className="w-4 h-4 text-[#8F94A3]" />
            <span>Launch Live Website</span>
          </a>
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              isDark ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/30' : 'text-rose-600 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className={`h-16 border-b flex items-center px-4 sm:px-6 gap-4 shrink-0 backdrop-blur-md sticky top-0 z-10 transition-colors ${
          isDark ? 'bg-[#070A11]/80 border-white/10 text-white shadow-xl shadow-black/40' : 'bg-white/90 border-slate-200/80 text-slate-900 shadow-xs'
        }`}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'text-[#8F94A3] hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0 truncate">
            <span className={isDark ? 'text-[#8F94A3]' : 'text-slate-400'}>Executive Console</span>
            <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-white/20' : 'text-slate-300'}`} />
            {currentCategory && (
              <>
                <span className={`hidden sm:inline ${isDark ? 'text-[#8F94A3]' : 'text-slate-500'}`}>
                  {currentCategory.title}
                </span>
                <ChevronRight className={`hidden sm:inline w-3.5 h-3.5 ${isDark ? 'text-white/20' : 'text-slate-300'}`} />
              </>
            )}
            <span className="font-bold truncate text-[#FFC857]">{currentNav?.label}</span>
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            {/* Calendly Meeting Button */}
            <button
              onClick={() => setIsCalendlyOpen(true)}
              className="p-2 rounded-xl border border-[#FFC857]/40 bg-[#FFC857]/15 text-[#FFC857] font-bold text-xs flex items-center gap-2 px-3.5 transition-all cursor-pointer hover:bg-[#FFC857]/25 shadow-md shadow-[#FFC857]/10 active:scale-95"
              title="Schedule Live Meeting via Calendly"
            >
              <Calendar className="w-4 h-4 text-[#FFC857]" />
              <span className="hidden sm:inline">Calendly Meeting</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              className={`p-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 px-3 transition-all cursor-pointer ${
                isDark
                  ? 'bg-white/5 border-white/10 text-[#FFC857] hover:bg-white/10'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4 text-[#FFC857]" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
            </button>

            {lastSaved && (
              <div className={`hidden md:flex items-center gap-2 rounded-full px-3 py-1 text-xs shrink-0 border ${
                isDark ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 shadow-sm' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Saved {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </div>
        </header>

        {/* Panel content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
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
