import React, { useState } from 'react';
import {
  X, Calculator, DollarSign, TrendingUp, Award, Clock, PieChart,
  Copy, Check, FileText, Sparkles, Layers, Sliders, ShieldCheck
} from 'lucide-react';
import {
  DEFAULT_ROI_INPUTS,
  calculateEnterpriseRoi,
  generateSensitivityMatrix
} from '../utils/roiCalculatorEngine';
import { formatDualCurrency, formatDualLakhs } from '../utils/currencyUtils';

export function EnterpriseRoiCalculatorModal({
  isOpen,
  onClose,
  initialQuoteData = null,
  onSaveToDeal = null,
  themeMode = 'dark'
}) {
  if (!isOpen) return null;

  const isDark = themeMode === 'dark';
  const [activeTab, setActiveTab] = useState('results'); // 'results' | 'inputs' | 'quote' | 'sensitivity'
  const [copied, setCopied] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);

  // Initialize input state with quote data if available
  const [formData, setFormData] = useState(() => ({
    ...DEFAULT_ROI_INPUTS,
    clientName: initialQuoteData?.org_name || initialQuoteData?.name || DEFAULT_ROI_INPUTS.clientName,
    affectedParticipants: Number(initialQuoteData?.employee_size) || DEFAULT_ROI_INPUTS.affectedParticipants,
  }));

  const roiResult = calculateEnterpriseRoi(formData);
  const sensitivityRows = generateSensitivityMatrix(formData, [400000, 500000, 600000, 700000]);

  const handleChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof DEFAULT_ROI_INPUTS[field] === 'number' ? Number(val) || 0 : val
    }));
  };

  // Format dual currency helpers
  const fmtDual = (val) => formatDualCurrency(val);
  const fmtLakhsDual = (val) => formatDualLakhs(val);

  // Copy Executive Summary text to clipboard
  const handleCopySummary = () => {
    const text = `
=== INFLUENCE & NETWORKING MASTERY™ ENTERPRISE ROI PROPOSAL ===
Client: ${formData.clientName}
Program: ${formData.program}
Scenario: ${formData.scenario.toUpperCase()}

FINANCIAL SUMMARY & EXECUTIVE KPIs (DUAL CURRENCY USD & INR):
- Annual Quantified Benefit: ${fmtLakhsDual(roiResult.kpis.totalAnnualQuantifiedBenefit)} (${fmtDual(roiResult.kpis.totalAnnualQuantifiedBenefit)})
- Net Program Investment: ${fmtDual(roiResult.investment.netInvestment)}
- Modeled Net Annual Benefit: ${fmtDual(roiResult.kpis.netAnnualBenefit)}
- Illustrative ROI: ${roiResult.kpis.roiPct.toFixed(1)}%
- Benefit / Cost Ratio: ${roiResult.kpis.benefitCostRatio.toFixed(2)}x
- Payback Period: ${roiResult.kpis.paybackPeriodMonths.toFixed(1)} months
- Modeled Value per Participant: ${fmtDual(roiResult.kpis.valuePerParticipant)}

VALUE DRIVER BREAKDOWN:
1. Productivity Capacity Recovered: ${fmtDual(roiResult.drivers.recoveredProductivity)}
2. Avoided Turnover Cost: ${fmtDual(roiResult.drivers.avoidedTurnover)}
3. Manager Capacity Recovered: ${fmtDual(roiResult.drivers.recoveredManagerTime)}
4. Opportunity Pool Impact: ${fmtDual(roiResult.drivers.opportunityImpact)}
==============================================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAttachToDeal = async () => {
    if (!onSaveToDeal) return;
    setIsAttaching(true);
    try {
      const summaryNote = `[ROI Proposal Generated] Modeled Benefit: ${fmtLakhsDual(roiResult.kpis.totalAnnualQuantifiedBenefit)} | ROI: ${roiResult.kpis.roiPct.toFixed(1)}% | Payback: ${roiResult.kpis.paybackPeriodMonths.toFixed(1)} mo | Net Inv: ${fmtDual(roiResult.investment.netInvestment)}`;
      await onSaveToDeal({
        ...initialQuoteData,
        expected_revenue: fmtDual(roiResult.investment.netInvestment),
        remarks: initialQuoteData?.remarks 
          ? `${initialQuoteData.remarks}\n\n${summaryNote}` 
          : summaryNote
      });
      onClose();
    } catch (err) {
      console.error('Error attaching ROI calculation to deal:', err);
    } finally {
      setIsAttaching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className={`w-full max-w-4xl rounded-2xl border shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] ${
        isDark ? 'bg-[#0B0F19] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Enterprise ROI Calculator</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  INFLUENCE &amp; NETWORKING MASTERY™
                </span>
              </div>
              <p className="text-xs text-slate-400">Financial model for Corporate Leadership Accelerator quotes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-all ${
              isDark ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className={`px-5 pt-3 border-b flex items-center gap-2 overflow-x-auto shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-100/50'
        }`}>
          {[
            { id: 'results', label: 'ROI Results & KPIs', icon: Award },
            { id: 'inputs', label: 'Inputs & Assumptions', icon: Sliders },
            { id: 'quote', label: 'Quote Pricing Builder', icon: DollarSign },
            { id: 'sensitivity', label: 'Sensitivity Matrix', icon: Layers },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10 font-extrabold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ───────────────────────────────────────────────────────────────────
              TAB 1: ROI RESULTS & HERO KPIS
          ─────────────────────────────────────────────────────────────────── */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              
              {/* 4 Hero KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                
                <div className={`p-4 rounded-2xl border space-y-1 ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Annual Quantified Benefit</span>
                  <p className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                    {fmtLakhs(roiResult.kpis.totalAnnualQuantifiedBenefit)}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">{fmtINR(roiResult.kpis.totalAnnualQuantifiedBenefit)}</p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-1 ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Illustrative ROI</span>
                  <p className="text-xl sm:text-2xl font-black font-mono text-indigo-400">
                    {roiResult.kpis.roiPct.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">Net: {fmtINR(roiResult.kpis.netAnnualBenefit)}</p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-1 ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Benefit / Cost Ratio</span>
                  <p className="text-xl sm:text-2xl font-black font-mono text-purple-400">
                    {roiResult.kpis.benefitCostRatio.toFixed(2)}x
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">Per ₹1 Invested</p>
                </div>

                <div className={`p-4 rounded-2xl border space-y-1 ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Payback Period</span>
                  <p className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                    {roiResult.kpis.paybackPeriodMonths.toFixed(1)} mo
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">Value/User: {fmtINR(roiResult.kpis.valuePerParticipant)}</p>
                </div>

              </div>

              {/* Value Driver Breakdown */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-400" />
                  Modeled Value Driver Breakdown ({formData.scenario.toUpperCase()} Scenario: {roiResult.scenarioMultiplier}x)
                </h4>

                <div className="space-y-3">
                  {[
                    { label: 'Recovered Participant Productivity', val: roiResult.drivers.recoveredProductivity, color: 'from-blue-600 to-indigo-600' },
                    { label: 'Avoided Regrettable Turnover Cost', val: roiResult.drivers.avoidedTurnover, color: 'from-emerald-600 to-teal-600' },
                    { label: 'Recovered Manager Time & Escalations', val: roiResult.drivers.recoveredManagerTime, color: 'from-amber-600 to-orange-600' },
                    { label: 'Opportunity & Business Pool Impact', val: roiResult.drivers.opportunityImpact, color: 'from-purple-600 to-pink-600' },
                  ].map(drv => {
                    const pct = Math.round((drv.val / Math.max(1, roiResult.kpis.totalAnnualQuantifiedBenefit)) * 100);
                    return (
                      <div key={drv.label} className="space-y-1 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300 font-medium">{drv.label}</span>
                          <span className="font-bold text-white">{fmtINR(drv.val)} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div className={`h-full rounded-full bg-gradient-to-r ${drv.color}`} style={{ width: `${Math.max(pct, 2)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Disclaimer Note */}
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Executive Note:</strong> Results represent conservative modeled business outcomes based on explicit attribution rules. Replace baseline assumptions with client-specific HR evidence prior to final contract signing.
                </p>
              </div>

            </div>
          )}

          {/* ───────────────────────────────────────────────────────────────────
              TAB 2: INPUTS & ASSUMPTIONS
          ─────────────────────────────────────────────────────────────────── */}
          {activeTab === 'inputs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Program & Scenario */}
              <div className={`p-4 rounded-xl border space-y-3 md:col-span-2 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="text-xs font-extrabold uppercase text-slate-400">Client &amp; Scenario Settings</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Client Name</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={e => handleChange('clientName', e.target.value)}
                      className={`w-full p-2 rounded-lg border font-bold ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Program</label>
                    <input
                      type="text"
                      value={formData.program}
                      onChange={e => handleChange('program', e.target.value)}
                      className={`w-full p-2 rounded-lg border font-bold ${isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Scenario Multiplier</label>
                    <select
                      value={formData.scenario}
                      onChange={e => handleChange('scenario', e.target.value)}
                      className={`w-full p-2 rounded-lg border font-bold ${isDark ? 'bg-slate-950 border-slate-700 text-amber-400' : 'bg-white border-slate-300 text-indigo-700'}`}
                    >
                      <option value="conservative">Conservative (0.60x)</option>
                      <option value="base">Base Case (1.00x)</option>
                      <option value="upside">Upside Potential (1.25x)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Productivity Inputs */}
              <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="text-xs font-extrabold uppercase text-slate-400">1. Productivity Recovery</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-0.5">Affected Participants</label>
                    <input type="number" value={formData.affectedParticipants} onChange={e => handleChange('affectedParticipants', e.target.value)} className="w-full p-2 rounded-lg border bg-slate-950 border-slate-800 text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5">Hours Recovered / Participant / Mo</label>
                    <input type="number" step="0.5" value={formData.hoursRecoveredPerParticipantMonth} onChange={e => handleChange('hoursRecoveredPerParticipantMonth', e.target.value)} className="w-full p-2 rounded-lg border bg-slate-950 border-slate-800 text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5">Loaded Hourly Employee Cost (₹)</label>
                    <input type="number" value={formData.loadedHourlyEmployeeCost} onChange={e => handleChange('loadedHourlyEmployeeCost', e.target.value)} className="w-full p-2 rounded-lg border bg-slate-950 border-slate-800 text-white font-mono" />
                  </div>
                </div>
              </div>

              {/* Turnover Inputs */}
              <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="text-xs font-extrabold uppercase text-slate-400">2. Avoided Turnover Cost</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-0.5">Annual Regrettable Turnover Rate (%)</label>
                    <input type="number" value={formData.annualTurnoverRatePct} onChange={e => handleChange('annualTurnoverRatePct', e.target.value)} className="w-full p-2 rounded-lg border bg-slate-950 border-slate-800 text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5">Expected Relative Turnover Reduction (%)</label>
                    <input type="number" value={formData.relativeTurnoverReductionPct} onChange={e => handleChange('relativeTurnoverReductionPct', e.target.value)} className="w-full p-2 rounded-lg border bg-slate-950 border-slate-800 text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5">Replacement Cost Per Avoided Exit (₹)</label>
                    <input type="number" value={formData.replacementCostPerExit} onChange={e => handleChange('replacementCostPerExit', e.target.value)} className="w-full p-2 rounded-lg border bg-slate-950 border-slate-800 text-white font-mono" />
                  </div>
                </div>
              </div>

              {/* Manager Time Inputs */}
              <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="text-xs font-extrabold uppercase text-slate-400">3. Manager Capacity Time</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-0.5">Managers Affected</label>
                    <input type="number" value={formData.managersAffected} onChange={e => handleChange('managersAffected', e.target.value)} className="w-full p-2 rounded-lg border bg-slate-950 border-slate-800 text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5">Hours Recovered / Manager / Mo</label>
                    <input type="number" step="0.5" value={formData.hoursRecoveredPerManagerMonth} onChange={e => handleChange('hoursRecoveredPerManagerMonth', e.target.value)} className="w-full p-2 rounded-lg border bg-slate-950 border-slate-800 text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5">Loaded Hourly Manager Cost (₹)</label>
                    <input type="number" value={formData.loadedHourlyManagerCost} onChange={e => handleChange('loadedHourlyManagerCost', e.target.value)} className="w-full p-2 rounded-lg border bg-slate-950 border-slate-800 text-white font-mono" />
                  </div>
                </div>
              </div>

              {/* Opportunity Impact Inputs */}
              <div className={`p-4 rounded-xl border space-y-3 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="text-xs font-extrabold uppercase text-slate-400">4. Opportunity / Business Impact</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-0.5">Annual Opportunity Pool Influenced (₹)</label>
                    <input type="number" value={formData.annualOpportunityPool} onChange={e => handleChange('annualOpportunityPool', e.target.value)} className="w-full p-2 rounded-lg border bg-slate-950 border-slate-800 text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5">Conservative Impact Rate (%)</label>
                    <input type="number" value={formData.conservativeImpactRatePct} onChange={e => handleChange('conservativeImpactRatePct', e.target.value)} className="w-full p-2 rounded-lg border bg-slate-950 border-slate-800 text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5">Attribution to Program (%)</label>
                    <input type="number" value={formData.attributionPct} onChange={e => handleChange('attributionPct', e.target.value)} className="w-full p-2 rounded-lg border bg-slate-950 border-slate-800 text-white font-mono" />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ───────────────────────────────────────────────────────────────────
              TAB 3: QUOTE PRICING BUILDER
          ─────────────────────────────────────────────────────────────────── */}
          {activeTab === 'quote' && (
            <div className="space-y-5">
              <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="text-xs font-extrabold uppercase text-slate-400">Enterprise Quote Breakdown &amp; Investment Builder</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Core 3-Day Program Fee (₹)</label>
                    <input type="number" value={formData.coreProgramFee} onChange={e => handleChange('coreProgramFee', e.target.value)} className="w-full p-2.5 rounded-xl border bg-slate-950 border-slate-800 text-white font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Customization &amp; Industry Tailoring (₹)</label>
                    <input type="number" value={formData.customizationFee} onChange={e => handleChange('customizationFee', e.target.value)} className="w-full p-2.5 rounded-xl border bg-slate-950 border-slate-800 text-white font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">360 Leadership Assessment (₹)</label>
                    <input type="number" value={formData.assessmentFee} onChange={e => handleChange('assessmentFee', e.target.value)} className="w-full p-2.5 rounded-xl border bg-slate-950 border-slate-800 text-white font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">30-Day Reinforcement Suite (₹)</label>
                    <input type="number" value={formData.reinforcementFee} onChange={e => handleChange('reinforcementFee', e.target.value)} className="w-full p-2.5 rounded-xl border bg-slate-950 border-slate-800 text-white font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Additional Facilitator (Optional ₹)</label>
                    <input type="number" value={formData.additionalFacilitatorFee} onChange={e => handleChange('additionalFacilitatorFee', e.target.value)} className="w-full p-2.5 rounded-xl border bg-slate-950 border-slate-800 text-white font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Contract Discount (₹)</label>
                    <input type="number" value={formData.discount} onChange={e => handleChange('discount', e.target.value)} className="w-full p-2.5 rounded-xl border bg-slate-950 border-slate-800 text-rose-400 font-mono font-bold" />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between font-mono">
                  <span className="text-xs font-bold text-slate-400">Calculated Net Program Investment</span>
                  <span className="text-xl font-black text-emerald-400">{fmtINR(roiResult.investment.netInvestment)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────────────
              TAB 4: SENSITIVITY MATRIX
          ─────────────────────────────────────────────────────────────────── */}
          {activeTab === 'sensitivity' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="text-xs font-extrabold uppercase text-slate-400">Illustrative Sensitivity Matrix Across Investment Tiers</h4>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-300 text-slate-600'}`}>
                        <th className="p-2.5">Investment Tier</th>
                        <th className="p-2.5">Conservative (0.60x)</th>
                        <th className="p-2.5">Base Benefit (1.00x)</th>
                        <th className="p-2.5">Upside Benefit (1.25x)</th>
                        <th className="p-2.5">Base ROI %</th>
                        <th className="p-2.5">Base Payback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {sensitivityRows.map((row, idx) => (
                        <tr key={idx} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-100'}>
                          <td className="p-2.5 font-bold text-white">{fmtLakhs(row.investment)}</td>
                          <td className="p-2.5 text-slate-300">{fmtLakhs(row.conservativeBenefit)}</td>
                          <td className="p-2.5 text-emerald-400 font-bold">{fmtLakhs(row.baseBenefit)}</td>
                          <td className="p-2.5 text-purple-400">{fmtLakhs(row.upsideBenefit)}</td>
                          <td className="p-2.5 text-indigo-400 font-bold">{row.baseRoiPct.toFixed(1)}%</td>
                          <td className="p-2.5 text-amber-400">{row.basePaybackMonths.toFixed(1)} mo</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 ${
          isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopySummary}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : isDark ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-white border-slate-300 text-slate-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-indigo-400" />}
              {copied ? 'Copied ROI Proposal!' : 'Copy Executive Proposal'}
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Close
            </button>
            {onSaveToDeal && (
              <button
                onClick={handleAttachToDeal}
                disabled={isAttaching}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold hover:brightness-110 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                {isAttaching ? 'Attaching to CRM...' : 'Attach ROI to CRM Deal'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
