import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import PillarsSection from './components/PillarsSection';
import VideoModal from './components/VideoModal';
import CurriculumExplorer from './components/CurriculumExplorer';
import OutcomesSection from './components/OutcomesSection';
import PricingSection from './components/PricingSection';
import CheckoutModal from './components/CheckoutModal';
import StudentDashboardModal from './components/StudentDashboardModal';
import EnrollmentPage from './components/EnrollmentPage';
import Testimonials from './components/Testimonials';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import { pricingPlans } from './data/courseData';
import { Crown, ShoppingBag } from 'lucide-react';

export default function App() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [showEnrollmentPage, setShowEnrollmentPage] = useState(false);
  
  // Checkout state
  const [selectedPlan, setSelectedPlan] = useState(pricingPlans[1]); // Pro by default
  const [isMonthly, setIsMonthly] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Enrollment state
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const handleOpenCheckoutWithPlan = (plan = pricingPlans[1], monthly = false) => {
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
      <EnrollmentPage
        initialPlan={selectedPlan}
        onBack={() => setShowEnrollmentPage(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 relative selection:bg-amber-500 selection:text-slate-950">
      
      {/* Sticky Bottom Quick Enrollment Bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-lg glass-panel rounded-2xl p-3.5 border border-amber-500/40 shadow-2xl flex items-center justify-between gap-3 animate-fade-in">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center text-slate-950 font-bold text-xs">
            <Crown className="w-4 h-4 fill-slate-950" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-white flex items-center gap-1 font-brand">
              TH3ORY Masterclass <span className="text-[10px] text-amber-400 font-normal font-sans">• 5 Seats Left</span>
            </div>
            <div className="text-[11px] text-slate-400">Code 'TH3ORY20' for 20% OFF</div>
          </div>
        </div>

        <button
          onClick={() => handleOpenCheckoutWithPlan(pricingPlans[1], false)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center gap-1.5 whitespace-nowrap"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isEnrolled ? 'View Receipt' : 'Enroll ($299)'}</span>
        </button>
      </div>

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
          onOpenCheckout={() => handleOpenCheckoutWithPlan(pricingPlans[1], false)}
        />

        <PillarsSection />

        <CurriculumExplorer
          onOpenVideo={() => setIsVideoModalOpen(true)}
        />

        <OutcomesSection />

        <PricingSection
          onSelectPlan={handleOpenCheckoutWithPlan}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          couponDiscount={couponDiscount}
          setCouponDiscount={setCouponDiscount}
        />

        <Testimonials />

        <FAQSection />
      </main>

      <Footer
        onOpenCheckout={() => handleOpenCheckoutWithPlan(pricingPlans[1], false)}
      />

      {/* Interactive Modals */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onEnrollClick={() => handleOpenCheckoutWithPlan(pricingPlans[1], false)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={selectedPlan}
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
    </div>
  );
}
