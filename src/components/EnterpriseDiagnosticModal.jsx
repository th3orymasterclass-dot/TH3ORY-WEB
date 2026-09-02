import React, { useState, useMemo } from 'react';
import { 
  X, Sparkles, Crown, ArrowRight, ArrowLeft, CheckCircle2, 
  BarChart3, Target, ShieldCheck, Download, Printer, RotateCcw, 
  ChevronRight, ChevronDown, Award, Lightbulb, Compass, Send, 
  Calendar, Layers, TrendingUp, AlertCircle, Check, HelpCircle
} from 'lucide-react';
import { 
  DIAGNOSTIC_DIMENSIONS, 
  LIKERT_OPTIONS, 
  DEVELOPMENT_BANDS, 
  REFLECTION_PROMPTS, 
  calculateAllScores, 
  SAMPLE_PRESETS 
} from '../data/diagnosticIndexData';

export default function EnterpriseDiagnosticModal({
  isOpen,
  onClose,
  onApplyToQuote,
  onOpenCalendly
}) {
  if (!isOpen) return null;

  // View state: 'intro' | 'assessment' | 'results'
  const [currentStep, setCurrentStep] = useState('intro');
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  // User responses dictionary: { [questionId]: 1..5 }
  const [responses, setResponses] = useState({});
  const [expandedPrompt, setExpandedPrompt] = useState(null);

  const activeDimension = DIAGNOSTIC_DIMENSIONS[activeSectionIndex];

  // Real-time calculation results
  const diagnosticResults = useMemo(() => {
    return calculateAllScores(responses);
  }, [responses]);

  // Handle setting a single question answer
  const handleSelectOption = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Quick fill preset
  const handleLoadPreset = (presetKey) => {
    const preset = SAMPLE_PRESETS[presetKey];
    if (preset) {
      setResponses({ ...preset.responses });
      setCurrentStep('results');
    }
  };

  // Fill current section with defaults (for rapid tester flow)
  const handleFillCurrentSection = (defaultVal = 4) => {
    const updates = {};
    activeDimension.questions.forEach(q => {
      updates[q.id] = defaultVal;
    });
    setResponses(prev => ({ ...prev, ...updates }));
  };

  // Section completion check
  const isCurrentSectionComplete = activeDimension.questions.every(q => responses[q.id] !== undefined);
  const totalCompleted = Object.keys(responses).length;
  const totalQuestions = 35;
  const overallProgressPct = Math.round((totalCompleted / totalQuestions) * 100);

  // Navigation handlers
  const handleNextSection = () => {
    if (activeSectionIndex < DIAGNOSTIC_DIMENSIONS.length - 1) {
      setActiveSectionIndex(prev => prev + 1);
      // Scroll to top of modal container
      const container = document.getElementById('diagnostic-modal-scroll');
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentStep('results');
      const container = document.getElementById('diagnostic-modal-scroll');
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevSection = () => {
    if (activeSectionIndex > 0) {
      setActiveSectionIndex(prev => prev - 1);
      const container = document.getElementById('diagnostic-modal-scroll');
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentStep('intro');
    }
  };

  const handleReset = () => {
    setResponses({});
    setActiveSectionIndex(0);
    setCurrentStep('intro');
  };

  // Transfer diagnostic data to Enterprise Quote Form
  const handleTransferToQuote = () => {
    if (onApplyToQuote) {
      onApplyToQuote({
        overallScore: diagnosticResults.overallScore,
        overallBand: diagnosticResults.overallBand.name,
        strongestArea: diagnosticResults.strongestArea.name,
        strongestScore: diagnosticResults.strongestArea.score,
        developmentPriority: diagnosticResults.developmentPriority.name,
        priorityScore: diagnosticResults.developmentPriority.score,
        influenceGap: diagnosticResults.influenceGap,
        recommendedFormat: diagnosticResults.developmentPriority.recommendedFormat || '3-Day Corporate Intensive',
        dimensionBreakdown: diagnosticResults.dimensionResults.map(d => `${d.name}: ${d.score}% (${d.band.name})`).join(', '),
        fullResponses: responses
      });
    }
    onClose();
  };

  // Print Executive Diagnostic Report (Page 6 Style)
  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-hidden animate-fade-in">
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] glass-modal rounded-3xl border border-[#7C5CFC]/30 shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C5CFC] to-[#FFC857] p-0.5 flex items-center justify-center shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Crown className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFC857]">
                  TH3ORY DIAGNOSTIC INDEX™
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#7C5CFC]/20 text-[#E9E4FF] text-[10px] font-bold">
                  Enterprise Assessment
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white font-brand">
                Human Influence &amp; Behavioural Capability Assessment
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentStep !== 'intro' && (
              <button
                onClick={handleReset}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold transition-all cursor-pointer"
                title="Restart Assessment"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900/90 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border border-slate-800 transition-all cursor-pointer"
              title="Close Assessment"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div id="diagnostic-modal-scroll" className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">

          {/* ========================================================================= */}
          {/* STEP 0: INTRO SCREEN */}
          {/* ========================================================================= */}
          {currentStep === 'intro' && (
            <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
              
              {/* Luxury Banner */}
              <div className="glass-card rounded-3xl p-6 sm:p-10 border border-[#7C5CFC]/30 text-center space-y-4 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-[#15171A]">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7C5CFC]/15 border border-[#7C5CFC]/30 text-[#FFC857] text-xs font-extrabold uppercase tracking-widest">
                  <Sparkles className="w-4 h-4 text-[#FFC857]" /> Enterprise Capability Framework
                </div>

                <h1 className="text-2xl sm:text-4xl font-black font-heading text-white tracking-tight">
                  TH3ORY DIAGNOSTIC <span className="text-gradient-violet">INDEX™</span>
                </h1>

                <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                  A structured behavioral assessment designed to evaluate how leaders, managers, and cross-functional teams 
                  across your organization approach communication, interpersonal influence, relationship capital, decision-making, and high-stakes conflict.
                </p>

                {/* 3 Core Pillars Ribbon from Page 1 of PDF */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="text-xs font-black text-amber-400 uppercase tracking-widest font-mono">1. ASSESS</div>
                    <div className="text-sm font-bold text-white">Workforce Influence Profile</div>
                    <div className="text-xs text-slate-400">Benchmark capability scores across 7 key organizational dimensions.</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="text-xs font-black text-[#7C5CFC] uppercase tracking-widest font-mono">2. UNDERSTAND</div>
                    <div className="text-sm font-bold text-white">Team Strengths &amp; Blindspots</div>
                    <div className="text-xs text-slate-400">Pinpoint leadership leverage areas and departmental friction points.</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="text-xs font-black text-emerald-400 uppercase tracking-widest font-mono">3. DEVELOP</div>
                    <div className="text-sm font-bold text-white">Targeted Corporate Programs</div>
                    <div className="text-xs text-slate-400">Transform workforce diagnostics into tailored 90-day corporate intensives.</div>
                  </div>
                </div>
              </div>

              {/* Participant Instructions & Scale Guide */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 font-brand">
                    <Compass className="w-5 h-5 text-amber-400" /> Enterprise Assessment Guidelines
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Evaluate the statements based on the observable behaviors, communication habits, and negotiation practices 
                    typically demonstrated by professionals and leaders across your organization.
                  </p>
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
                    ⚡ <strong>Evaluation Principle:</strong> Answer based on how teams and leaders <em>actually operate in real workplace situations</em>, 
                    rather than ideal aspirational standards.
                  </div>
                  <div className="text-[11px] text-slate-500 italic">
                    * TH3ORY Diagnostic Index™ is an enterprise organizational development benchmark — not a clinical or psychometric diagnosis.
                  </div>
                </div>

                <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2 font-brand">
                      <BarChart3 className="w-5 h-5 text-[#7C5CFC]" /> 5-Point Response Scale
                    </h3>
                    <div className="space-y-1.5 pt-2 text-xs">
                      {LIKERT_OPTIONS.map(opt => (
                        <div key={opt.value} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                          <span className="font-semibold text-slate-200">{opt.shortLabel}</span>
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-mono font-bold flex items-center justify-center text-[11px]">
                            {opt.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    35 enterprise items across 7 capability dimensions • Approx 4–5 minutes
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => setCurrentStep('assessment')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#7C5CFC] via-[#9277FF] to-[#7C5CFC] hover:from-[#6c4ce0] hover:to-[#5233d0] text-white font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-[#7C5CFC]/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <span>Begin Workforce Assessment (35 Items)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleLoadPreset('executiveLeader')}
                    className="w-full sm:w-auto px-5 py-4 rounded-2xl glass-card text-amber-400 hover:text-white hover:bg-slate-900 text-xs font-bold border border-amber-500/30 hover:border-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>Load Enterprise Demo Profile</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1..7: ASSESSMENT QUESTIONNAIRE SECTIONS */}
          {/* ========================================================================= */}
          {currentStep === 'assessment' && (
            <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
              
              {/* Section Progress Navigation Pills */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-2 border-b border-slate-800">
                {DIAGNOSTIC_DIMENSIONS.map((dim, idx) => {
                  const isComplete = dim.questions.every(q => responses[q.id] !== undefined);
                  const isCurrent = idx === activeSectionIndex;
                  return (
                    <button
                      key={dim.id}
                      onClick={() => setActiveSectionIndex(idx)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] text-white shadow-md shadow-[#7C5CFC]/30'
                          : isComplete
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span>{dim.sectionNumber}. {dim.name}</span>
                      {isComplete && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                  <span>Section {activeDimension.sectionNumber} of 7: <strong className="text-white uppercase">{activeDimension.name}</strong></span>
                  <span>{totalCompleted} of {totalQuestions} answered ({overallProgressPct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-[#7C5CFC] via-[#9277FF] to-[#FFC857] transition-all duration-300 rounded-full"
                    style={{ width: `${overallProgressPct}%` }}
                  />
                </div>
              </div>

              {/* Active Dimension Header */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-[#7C5CFC]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-block px-2.5 py-0.5 rounded-md bg-[#7C5CFC]/20 text-[#E9E4FF] text-[11px] font-mono font-bold uppercase tracking-wider">
                    SECTION {activeDimension.sectionNumber} — {activeDimension.name.toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold text-white font-heading">{activeDimension.subtitle}</h3>
                  <div className="text-xs text-amber-400 italic font-serif-luxury">
                    "{activeDimension.reflection}"
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFillCurrentSection(4)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                    title="Quick fill this section for faster testing"
                  >
                    ⚡ Quick Fill (Agree)
                  </button>
                </div>
              </div>

              {/* 5 Questions in Current Dimension */}
              <div className="space-y-4">
                {activeDimension.questions.map((q, qIndex) => {
                  const currentValue = responses[q.id];
                  return (
                    <div 
                      key={q.id}
                      className={`p-5 rounded-2xl transition-all border ${
                        currentValue !== undefined 
                          ? 'glass-card border-slate-700/80 bg-slate-900/60' 
                          : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 mb-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-400 font-mono font-bold text-xs shrink-0 border border-slate-800">
                          {q.id}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm sm:text-base font-medium text-slate-100 leading-snug">
                            {q.text}
                          </p>
                          {q.isReversed && (
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                              [Reverse-scored item]
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 5-Point Likert Options Buttons */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                        {LIKERT_OPTIONS.map(opt => {
                          const isSelected = currentValue === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => handleSelectOption(q.id, opt.value)}
                              className={`p-2.5 rounded-xl text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-gradient-to-tr from-[#7C5CFC] to-[#6344E0] text-white shadow-lg shadow-[#7C5CFC]/30 border border-[#9277FF]'
                                  : 'bg-slate-900 hover:bg-slate-800/90 text-slate-300 border border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                                isSelected ? 'bg-white text-slate-950' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {opt.badge}
                              </span>
                              <span className="text-[11px] text-center leading-tight">
                                {opt.shortLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Subtle Enterprise Impact Context Callout */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border-l-4 border-amber-400 text-slate-300 space-y-1 text-xs">
                <div className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <Crown className="w-3.5 h-3.5 text-amber-400" /> Enterprise Capability Insight: {activeDimension.executiveTheme}
                </div>
                <p className="text-slate-400 leading-relaxed">
                  {activeDimension.enterpriseImpact}
                </p>
              </div>

              {/* Bottom Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={handlePrevSection}
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer border border-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{activeSectionIndex === 0 ? 'Back to Instructions' : 'Previous Section'}</span>
                </button>

                <div className="flex items-center gap-3">
                  {activeSectionIndex === DIAGNOSTIC_DIMENSIONS.length - 1 ? (
                    <button
                      onClick={handleNextSection}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Generate Diagnostic Results</span>
                      <Sparkles className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleNextSection}
                      className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] hover:from-[#6c4ce0] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#7C5CFC]/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Next Section: {DIAGNOSTIC_DIMENSIONS[activeSectionIndex + 1]?.name}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 8: DIAGNOSTIC RESULTS & SUBTLE ENTERPRISE PITCH (PAGE 6 TEMPLATE) */}
          {/* ========================================================================= */}
          {currentStep === 'results' && (
            <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
              
              {/* Top Banner & Header */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" /> Assessment Completed • TH3ORY Diagnostic Index™
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-heading">
                  EXECUTIVE DIAGNOSTIC <span className="text-gradient-gold">REPORT</span>
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
                  A snapshot of your self-reported communication and influence profile across the 7 core capability dimensions.
                </p>
              </div>

              {/* OVERALL SCORE & DEVELOPMENT BAND HERO CARD */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-[#15171A] shadow-2xl relative overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Circular / Radial Score Highlight */}
                  <div className="md:col-span-5 text-center p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Overall TH3ORY Influence Score
                    </div>
                    <div className="text-5xl sm:text-6xl font-black font-brand text-gradient-gold tracking-tight py-1">
                      {diagnosticResults.overallScore}
                      <span className="text-xl sm:text-2xl font-normal text-slate-500 font-sans"> / 100</span>
                    </div>
                    <div>
                      <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${diagnosticResults.overallBand.colorBadge}`}>
                        {diagnosticResults.overallBand.name} BAND
                      </span>
                    </div>
                  </div>

                  {/* Summary Callout & Band Interpretation */}
                  <div className="md:col-span-7 space-y-4 text-left">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white font-brand">Development Band Interpretation</h3>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                        {diagnosticResults.overallBand.interpretation}
                      </p>
                    </div>

                    {/* Gap Metrics */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-0.5">
                        <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Strongest Capability</div>
                        <div className="text-sm font-bold text-white">{diagnosticResults.strongestArea.name}</div>
                        <div className="text-xs font-mono font-bold text-emerald-400">{diagnosticResults.strongestArea.score} / 100</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 space-y-0.5">
                        <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Development Priority</div>
                        <div className="text-sm font-bold text-white">{diagnosticResults.developmentPriority.name}</div>
                        <div className="text-xs font-mono font-bold text-amber-400">{diagnosticResults.developmentPriority.score} / 100</div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 pt-1 flex items-center justify-between border-t border-slate-800">
                      <span>Influence Gap (Highest − Lowest):</span>
                      <strong className="text-white font-mono">{diagnosticResults.highestScore} − {diagnosticResults.lowestScore} = {diagnosticResults.influenceGap} points</strong>
                    </div>
                  </div>

                </div>
              </div>

              {/* 7 DIMENSION BREAKDOWN TABLE (Exact Page 6 Result Template) */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white font-brand flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#7C5CFC]" /> 7 Capability Dimensions Breakdown
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Max Raw: 25 pts each</span>
                </div>

                <div className="space-y-3">
                  {diagnosticResults.dimensionResults.map((dim) => (
                    <div 
                      key={dim.id} 
                      className={`p-4 rounded-2xl border transition-all ${
                        dim.id === diagnosticResults.developmentPriority.id
                          ? 'bg-amber-500/5 border-amber-500/40'
                          : dim.id === diagnosticResults.strongestArea.id
                          ? 'bg-emerald-500/5 border-emerald-500/40'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{dim.name}</span>
                            {dim.id === diagnosticResults.strongestArea.id && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                Strongest Area
                              </span>
                            )}
                            {dim.id === diagnosticResults.developmentPriority.id && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                Priority Focus
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 italic">
                            {dim.reflection}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${dim.band.colorBg} ${dim.band.colorText} border ${dim.band.colorBorder}`}>
                            {dim.band.name}
                          </span>
                          <span className="text-base font-black text-white font-mono min-w-[60px] text-right">
                            {dim.score} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            dim.score >= 85 ? 'bg-emerald-400' :
                            dim.score >= 70 ? 'bg-blue-400' :
                            dim.score >= 55 ? 'bg-amber-400' :
                            dim.score >= 40 ? 'bg-orange-400' : 'bg-rose-400'
                          }`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* REFLECTION PROMPTS SECTION (From Page 6 of PDF) */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white font-brand flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400" /> Executive Reflection Prompts
                  </h3>
                  <span className="text-xs text-slate-400">Deliberate Practice Architecture</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {REFLECTION_PROMPTS.map((prompt, idx) => (
                    <div key={prompt.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-left">
                      <div className="text-[10px] font-mono text-amber-400 font-bold uppercase">Prompt 0{idx + 1}</div>
                      <div className="text-xs font-semibold text-white">{prompt.label}</div>
                      <div className="text-[11px] text-slate-400 italic">
                        {idx === 0 && `High-stakes meetings, cross-functional alignment, or CXO pitches involving ${diagnosticResults.developmentPriority.name}.`}
                        {idx === 1 && `Replacing reactive responses with deliberate pauses and cognitive perspective-taking.`}
                        {idx === 2 && `Upcoming quarterly executive reviews or high-value negotiation discussions.`}
                        {idx === 3 && `Projecting composed authority, de-escalating resistance, and securing immediate stakeholder alignment.`}
                      </div>
                    </div>
                  ))}
                </div>

                {/* "What your result means" Disclaimer from PDF */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-400 text-xs leading-relaxed space-y-1">
                  <div className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">What your result means:</div>
                  <p>
                    Your score is not a measure of your worth, personality or potential. It is a snapshot of how you currently describe your 
                    behaviour across different influence situations. The useful question is not <em>“Is my score good or bad?”</em> but 
                    <strong className="text-amber-400"> “Which behaviours could I deliberately improve?”</strong>
                  </p>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SUBTLE ENTERPRISE PITCHING PROGRAM SECTION */}
              {/* ========================================================================= */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#7C5CFC]/40 bg-gradient-to-br from-slate-900 via-[#15171A] to-slate-950 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C5CFC]/10 rounded-full blur-[80px] pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7C5CFC]/15 text-[#FFC857] text-xs font-bold uppercase tracking-wider border border-[#7C5CFC]/30">
                      <Crown className="w-3.5 h-3.5" /> Enterprise Tailored Recommendation
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white font-heading mt-2">
                      Transforming <span className="text-gradient-violet">{diagnosticResults.developmentPriority?.name || 'Leadership'}</span> Into Team Leverage
                    </h3>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Recommended Format:</span>
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      {diagnosticResults.developmentPriority?.recommendedFormat || '3-Day Corporate Intensive'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                    <p className="leading-relaxed">
                      Our corporate leadership cohort curriculum directly bridges the <strong>{diagnosticResults.developmentPriority?.name || 'capability'}</strong> gap using deliberate behavioral practice, simulation role-plays, and executive coaching:
                    </p>

                    <div className="space-y-2 pt-1">
                      {(diagnosticResults.developmentPriority?.recommendedModules || ['Module 01: Executive Presence', 'Module 06: Advanced Negotiation']).map((mod, mIdx) => (
                        <div key={mIdx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="font-medium text-xs">{mod}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 text-left">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                      <Layers className="w-4 h-4" /> 90-Day Enterprise Impact Audit
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Corporate clients deploy the <strong>TH3ORY Diagnostic Index™</strong> before and 90 days after training to measure tangible behavioral improvements across management tiers.
                    </p>
                    <div className="text-[11px] text-slate-400 space-y-1 border-t border-slate-800 pt-2 font-medium">
                      <div>✓ Measure team communication velocity</div>
                      <div>✓ Eliminate cross-departmental friction</div>
                      <div>✓ Track manager confidence &amp; CXO presence</div>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handlePrintSummary}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                      title="Print Executive Diagnostic Summary"
                    >
                      <Printer className="w-4 h-4 text-amber-400" />
                      <span>Print Summary PDF</span>
                    </button>

                    {onOpenCalendly && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenCalendly();
                        }}
                        className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 text-[#7C5CFC]" />
                        <span>Book Strategy Call</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleTransferToQuote}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Transfer Diagnostic to Enterprise Proposal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
