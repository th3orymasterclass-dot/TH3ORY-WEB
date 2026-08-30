import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Calendar, Users, Sparkles, Award, GraduationCap, 
  ChevronLeft, ChevronRight, X, ZoomIn, Play, Pause, ArrowRight, ExternalLink
} from 'lucide-react';
import { useTh3oryLive } from '../data/adminData';
import { offlineTrainings as defaultOfflineTrainings } from '../data/courseData';

export default function OfflineTrainingsMarquee({ onOpenEnroll }) {
  const { offlineTrainings: liveTrainings } = useTh3oryLive();
  const trainingsList = (liveTrainings && liveTrainings.length > 0) ? liveTrainings : defaultOfflineTrainings;

  const [selectedItem, setSelectedItem] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const marqueeRef = useRef(null);

  // Duplicate items 3 times for super-smooth infinite marquee without gaps
  const marqueeItems = [...trainingsList, ...trainingsList, ...trainingsList];

  // Lightbox keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedItem) return;
      if (e.key === 'Escape') {
        setSelectedItem(null);
      } else if (e.key === 'ArrowRight') {
        navigateLightbox(1);
      } else if (e.key === 'ArrowLeft') {
        navigateLightbox(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, trainingsList]);

  const navigateLightbox = (direction) => {
    if (!selectedItem) return;
    const currentIndex = trainingsList.findIndex(t => t.id === selectedItem.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + direction + trainingsList.length) % trainingsList.length;
    setSelectedItem(trainingsList[nextIndex]);
  };

  const nudgeScroll = (direction) => {
    if (!marqueeRef.current) return;
    marqueeRef.current.scrollBy({
      left: direction * 360,
      behavior: 'smooth'
    });
  };

  return (
    <section 
      id="offline-trainings" 
      className="py-20 bg-[#0E1015] relative overflow-hidden border-t border-b border-[#555A66]/25"
      aria-label="Previous Offline Trainings and Masterclasses"
    >
      {/* Ambient decorative glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7C5CFC]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFC857]/5 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#7C5CFC]/15 to-[#FFC857]/15 border border-[#7C5CFC]/30 text-[#FFC857] text-xs font-extrabold uppercase tracking-widest mb-3 shadow-sm">
              <GraduationCap className="w-4 h-4 text-[#FFC857]" />
              <span>Proven On-Ground Track Record</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-[#FAFAF7] tracking-tight">
              Previous Offline <span className="text-gradient-violet">Trainings</span>
            </h2>
            
            <p className="text-sm sm:text-base text-[#FAFAF7]/80 mt-3 leading-relaxed">
              Before launching the TH3ORY digital masterclass, Sravan Sudhakaran conducted live offline campus workshops, medical college keynotes, and behavioral laboratories across premier institutions.
            </p>
          </div>

          {/* Interactive Navigation & Playback Toolbar */}
          <div className="flex items-center gap-2.5 self-start md:self-end">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                isPaused 
                  ? 'bg-[#FFC857]/20 border-[#FFC857]/40 text-[#FFC857]' 
                  : 'bg-[#15171A] border-[#E9E4FF]/15 text-[#FAFAF7]/80 hover:text-white hover:border-[#7C5CFC]/50'
              }`}
              title={isPaused ? "Resume Autoscroll" : "Pause Autoscroll"}
              aria-label={isPaused ? "Resume Marquee" : "Pause Marquee"}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
              <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={() => nudgeScroll(-1)}
              className="p-2 rounded-xl bg-[#15171A] border border-[#E9E4FF]/15 text-[#FAFAF7]/80 hover:text-[#FAFAF7] hover:border-[#7C5CFC]/50 transition-all hover:scale-105 active:scale-95"
              title="Previous training slide"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => nudgeScroll(1)}
              className="p-2 rounded-xl bg-[#15171A] border border-[#E9E4FF]/15 text-[#FAFAF7]/80 hover:text-[#FAFAF7] hover:border-[#7C5CFC]/50 transition-all hover:scale-105 active:scale-95"
              title="Next training slide"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Marquee Scroller Container */}
      <div 
        ref={marqueeRef}
        className="marquee-container marquee-mask overflow-x-auto no-scrollbar py-4 -my-4 relative select-none"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div 
          className={`animate-marquee-infinite flex gap-6 px-4 ${isPaused ? 'paused' : ''}`}
          style={{ willChange: 'transform' }}
        >
          {marqueeItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              onClick={() => setSelectedItem(item)}
              className="group relative w-[310px] sm:w-[380px] md:w-[420px] flex-shrink-0 glass-card rounded-2xl overflow-hidden border border-[#E9E4FF]/15 cursor-pointer shadow-lg hover:shadow-2xl hover:border-[#7C5CFC]/80 transition-all duration-300 hover:-translate-y-1.5"
            >
              {/* Image with zoom on hover */}
              <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-[#15171A]">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                />

                {/* Dark gradient overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                  <span className="px-2.5 py-1 rounded-lg bg-[#070A11]/80 backdrop-blur-md border border-[#7C5CFC]/40 text-[#FFC857] text-[11px] font-extrabold uppercase tracking-wide shadow-md">
                    {item.badge}
                  </span>
                  
                  <span className="px-2.5 py-1 rounded-lg bg-[#070A11]/80 backdrop-blur-md border border-white/10 text-[#FAFAF7] text-[11px] font-semibold flex items-center gap-1 shadow-md">
                    <Users className="w-3 h-3 text-[#7C5CFC]" />
                    {item.attendees}
                  </span>
                </div>

                {/* Hover Zoom Icon Pill */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                  <div className="px-3 py-1.5 rounded-full bg-[#7C5CFC]/90 text-[#FAFAF7] text-xs font-bold flex items-center gap-1.5 shadow-xl backdrop-blur-sm transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>View Story</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Details */}
              <div className="p-5 bg-[#0B0F19] relative z-10 space-y-2.5">
                <div className="flex items-center gap-3 text-xs text-[#555A66] font-medium">
                  <span className="flex items-center gap-1 text-[#E9E4FF]/70 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#FFC857] flex-shrink-0" />
                    {item.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#E9E4FF]/70 flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-[#7C5CFC] flex-shrink-0" />
                    {item.date}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#FAFAF7] group-hover:text-[#FFC857] transition-colors leading-snug line-clamp-1">
                  {item.title}
                </h3>

                <p className="text-xs text-[#FAFAF7]/75 line-clamp-2 leading-relaxed">
                  {item.subtitle}
                </p>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tags?.slice(0, 2).map((tag, tIdx) => (
                    <span 
                      key={tIdx}
                      className="px-2 py-0.5 rounded-md bg-[#15171A] border border-[#E9E4FF]/10 text-[10px] font-semibold text-[#E9E4FF]/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* On-Ground Authority Stats Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-[#E9E4FF]/15 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#FAFAF7] font-heading flex items-center justify-center gap-1.5">
              <Users className="w-5 h-5 text-[#FFC857]" />
              <span>18,450+</span>
            </div>
            <p className="text-xs text-[#555A66] mt-1 font-medium">Students & Pros Trained</p>
          </div>

          <div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#FAFAF7] font-heading flex items-center justify-center gap-1.5">
              <Award className="w-5 h-5 text-[#7C5CFC]" />
              <span>30+</span>
            </div>
            <p className="text-xs text-[#555A66] mt-1 font-medium">Institutional Keynotes</p>
          </div>

          <div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#FAFAF7] font-heading flex items-center justify-center gap-1.5">
              <Sparkles className="w-5 h-5 text-[#FFC857]" />
              <span>100%</span>
            </div>
            <p className="text-xs text-[#555A66] mt-1 font-medium">Real-Time Stage Demos</p>
          </div>

          <div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#FAFAF7] font-heading flex items-center justify-center gap-1.5">
              <MapPin className="w-5 h-5 text-[#7C5CFC]" />
              <span>Pan-India</span>
            </div>
            <p className="text-xs text-[#555A66] mt-1 font-medium">On-Ground Footprint</p>
          </div>
        </div>
      </div>

      {/* Full-Screen Interactive Lightbox Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in"
          onClick={() => setSelectedItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative w-full max-w-4xl glass-modal rounded-3xl overflow-hidden border border-[#E9E4FF]/25 shadow-2xl bg-[#0B0F19] max-h-[90vh] flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/60 text-white hover:bg-[#7C5CFC] hover:text-white transition-colors border border-white/10"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left/Top: High-Res Image View */}
            <div className="md:w-3/5 relative bg-[#070A11] flex items-center justify-center overflow-hidden min-h-[260px] sm:min-h-[360px] md:min-h-full">
              <img
                src={selectedItem.image}
                alt={selectedItem.title}
                className="w-full h-full object-cover max-h-[60vh] md:max-h-full"
              />

              {/* Prev / Next in Image Overlay */}
              <button
                onClick={() => navigateLightbox(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white hover:bg-[#7C5CFC] transition-all border border-white/15"
                title="Previous Photo"
                aria-label="Previous Photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigateLightbox(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 text-white hover:bg-[#7C5CFC] transition-all border border-white/15"
                title="Next Photo"
                aria-label="Next Photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Photo Index Counter */}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] text-white/90 font-mono border border-white/10">
                {trainingsList.findIndex(t => t.id === selectedItem.id) + 1} / {trainingsList.length}
              </div>
            </div>

            {/* Right/Bottom: Story & Session Context Details */}
            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#7C5CFC]/20 border border-[#7C5CFC]/40 text-[#FFC857] text-[11px] font-extrabold uppercase tracking-wide">
                    {selectedItem.badge}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[11px] font-semibold flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#7C5CFC]" />
                    {selectedItem.attendees}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black font-heading text-[#FAFAF7] leading-snug">
                    {selectedItem.title}
                  </h3>
                  <p className="text-xs text-[#FFC857] font-semibold mt-1">
                    {selectedItem.subtitle}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-[#555A66]">
                  <div className="flex items-center gap-2 text-[#E9E4FF]/80">
                    <MapPin className="w-3.5 h-3.5 text-[#FFC857]" />
                    <span>{selectedItem.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#E9E4FF]/80">
                    <Calendar className="w-3.5 h-3.5 text-[#7C5CFC]" />
                    <span>{selectedItem.date}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#E9E4FF] mb-1.5">
                    Session Context & Impact
                  </h4>
                  <p className="text-xs sm:text-sm text-[#FAFAF7]/80 leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#555A66] mb-2">
                    Key Pillars Covered
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.tags?.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-[#15171A] border border-[#7C5CFC]/30 text-xs font-medium text-[#E9E4FF]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom action inside modal */}
              {onOpenEnroll && (
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setSelectedItem(null);
                      onOpenEnroll();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] hover:from-[#6c4ce0] hover:to-[#5233d0] text-[#FAFAF7] font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  >
                    <span>Master This in TH3ORY 30-Day Program</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
