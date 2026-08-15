import React, { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import PillarsSection from './components/PillarsSection';
import InstructorSection from './components/InstructorSection';
import VideoModal from './components/VideoModal';
import CurriculumExplorer from './components/CurriculumExplorer';
import OutcomesSection from './components/OutcomesSection';
import PricingSection from './components/PricingSection';
import ContactSection from './components/ContactSection';
import CheckoutModal from './components/CheckoutModal';
import StudentDashboardModal from './components/StudentDashboardModal';
import EnrollmentPage from './components/EnrollmentPage';
import Testimonials from './components/Testimonials';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import SEOHead from './components/SEOHead';
import StructuredData from './components/StructuredData';
import { useTh3oryLive } from './data/adminData';
import { useFeatureFlags } from './context/FeatureFlagContext';
import { Crown, ShoppingBag, ShieldAlert } from 'lucide-react';

export default function App() {
  const { plans: pricingPlans } = useTh3oryLive();
  const mainPlan = pricingPlans[0] || {};
  const { isFeatureEnabled } = useFeatureFlags();

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [showEnrollmentPage, setShowEnrollmentPage] = useState(false);

  const showQuickBar = isFeatureEnabled('SHOW_QUICK_ENROLLMENT_BAR', true);
  const showSeatsUrgency = isFeatureEnabled('SHOW_LIMITED_SEATS_BANNER', true);
  const showReviews = isFeatureEnabled('ENABLE_LIVE_REVIEWS', true);
  const isMaintenanceMode = isFeatureEnabled('MAINTENANCE_MODE', false);

  // Checkout state
  const [selectedPlan, setSelectedPlan] = useState(null); // null = use live plans[0]
  const [isMonthly, setIsMonthly] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Enrollment state
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const handleOpenCheckoutWithPlan = (plan = mainPlan, monthly = false) => {
    setSelectedPlan(plan);
    setIsMonthly(monthly);
    setShowEnrollmentPage(true);
  };

  const handleEnrollmentSuccess = (orderReceipt) => {
    setIsEnrolled(true);
    setReceipt(orderReceipt);
  };

  if (showEnrollmentPage) {
    return (
      <>
        <SEOHead
          title="Enroll | TH3ORY Masterclass of Influencing"
          description="Complete your enrollment in TH3ORY Masterclass. Secure instant 30-day access to all 50 video modules, workbooks, and cognitive resources."
          canonicalUrl="https://th3ory.online/#/enroll"
        />
        <StructuredData />
        <EnrollmentPage
          initialPlan={selectedPlan}
          onBack={() => setShowEnrollmentPage(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#15171A] text-[#FAFAF7] relative selection:bg-[#7C5CFC] selection:text-[#FAFAF7]">
      {/* Dynamic SEO Metadata & Structured Data Schemas */}
      <SEOHead />
      <StructuredData />

      {/* Maintenance Mode Notice Banner */}
      {isMaintenanceMode && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs font-bold font-sans flex items-center justify-center gap-2 z-50 sticky top-0 border-b border-amber-600 shadow-lg">
          <ShieldAlert className="w-4 h-4 text-slate-950" />
          <span>SYSTEM NOTICE: Platform maintenance is currently in progress. Live checkouts are temporarily paused.</span>
        </div>
      )}

      {/* Sticky Bottom Quick Enrollment Bar (Controlled via Vercel Feature Flag) */}
      {showQuickBar && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-lg glass-panel rounded-2xl p-3.5 border border-[#E9E4FF]/20 shadow-2xl flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#9277FF] flex items-center justify-center text-[#FAFAF7] font-bold text-xs shadow-md">
              <Crown className="w-4 h-4 fill-[#FAFAF7]" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#FAFAF7] flex items-center gap-1 font-brand">
                TH3ORY Masterclass {showSeatsUrgency && <span className="text-[10px] text-[#FFC857] font-normal font-sans">• 5 Seats Left</span>}
              </div>
              <div className="text-[11px] text-[#555A66]">Code 'TH3ORY20' for 20% OFF</div>
            </div>
          </div>

          <button
            onClick={() => handleOpenCheckoutWithPlan(mainPlan, false)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] hover:from-[#6c4ce0] hover:to-[#5233d0] text-[#FAFAF7] font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#7C5CFC]/25 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isEnrolled ? 'View Receipt' : `Enroll ($${mainPlan.priceFull || 149} / ₹${mainPlan.priceINR?.toLocaleString('en-IN') || '11,999'})`}</span>
          </button>
        </div>
      )}

      {/* Main Navigation Header */}
      <Navbar
        onOpenCheckout={() => handleOpenCheckoutWithPlan(selectedPlan, isMonthly)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        isEnrolled={isEnrolled}
      />

      {/* Main Page Layout Sections */}
      <main>
        <HeroSection
          onOpenVideo={() => setIsVideoModalOpen(true)}
          onOpenCheckout={() => handleOpenCheckoutWithPlan(mainPlan, false)}
        />

        <PillarsSection />

        <InstructorSection
          onOpenCheckout={() => handleOpenCheckoutWithPlan(mainPlan, false)}
        />

        <CurriculumExplorer
          onOpenVideo={() => setIsVideoModalOpen(true)}
        />

        <OutcomesSection />

        {showReviews && <Testimonials />}

        <PricingSection
          onSelectPlan={handleOpenCheckoutWithPlan}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          couponDiscount={couponDiscount}
          setCouponDiscount={setCouponDiscount}
        />

        <ContactSection />

        <FAQSection />
      </main>

      <Footer
        onOpenCheckout={() => handleOpenCheckoutWithPlan(mainPlan, false)}
      />

      {/* Interactive Modals */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onEnrollClick={() => handleOpenCheckoutWithPlan(mainPlan, false)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={selectedPlan || mainPlan}
        isMonthly={isMonthly}
        couponDiscount={couponDiscount}
        couponCode={couponCode}
        onEnrollmentSuccess={handleEnrollmentSuccess}
      />

      <StudentDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        receipt={receipt}
      />

      <Analytics />
    </div>
  );
}
