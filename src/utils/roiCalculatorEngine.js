/**
 * INFLUENCE & NETWORKING MASTERY™ — Enterprise ROI Calculator Engine
 * Calculation blueprint for productivity, turnover avoidance, manager capacity,
 * opportunity business impact, payback period, and sensitivity analysis.
 */

export const DEFAULT_ROI_INPUTS = {
  clientName: 'Example Enterprise Client',
  program: '3-Day Corporate Leadership Accelerator',
  participants: 40,
  cohorts: 1,
  
  // Productivity
  affectedParticipants: 40,
  hoursRecoveredPerParticipantMonth: 2.0,
  loadedHourlyEmployeeCost: 800, // INR/hr
  monthsOfRealizedBenefit: 10,
  
  // Turnover
  affectedTurnoverEmployees: 40,
  annualTurnoverRatePct: 12, // 12%
  relativeTurnoverReductionPct: 8, // 8%
  replacementCostPerExit: 300000, // ₹3,000,000 / exit
  
  // Manager Time
  managersAffected: 8,
  hoursRecoveredPerManagerMonth: 1.5,
  loadedHourlyManagerCost: 1800, // INR/hr
  
  // Opportunity / Business Impact
  annualOpportunityPool: 2500000, // ₹25,000,000 pool
  conservativeImpactRatePct: 2, // 2%
  attributionPct: 35, // 35%
  
  // Scenario selector: 'conservative' (0.60x), 'base' (1.00x), 'upside' (1.25x)
  scenario: 'base',
  
  // Pricing Quote Builder
  coreProgramFee: 450000,
  customizationFee: 50000,
  assessmentFee: 40000,
  reinforcementFee: 60000,
  additionalFacilitatorFee: 0,
  travelLogisticsFee: 0,
  discount: 0,
};

export const SCENARIO_MULTIPLIERS = {
  conservative: 0.60,
  base: 1.00,
  upside: 1.25,
};

/**
 * Executes full ROI calculation based on input object
 */
export function calculateEnterpriseRoi(inputs = {}) {
  const cfg = { ...DEFAULT_ROI_INPUTS, ...inputs };
  const scenarioMultiplier = SCENARIO_MULTIPLIERS[cfg.scenario] || 1.00;

  // 1. Recovered Participant Productivity
  const recoveredProductivity = 
    cfg.affectedParticipants *
    cfg.hoursRecoveredPerParticipantMonth *
    cfg.loadedHourlyEmployeeCost *
    cfg.monthsOfRealizedBenefit *
    scenarioMultiplier;

  // 2. Avoided Turnover Cost
  const avoidedTurnover = 
    cfg.affectedTurnoverEmployees *
    (cfg.annualTurnoverRatePct / 100) *
    (cfg.relativeTurnoverReductionPct / 100) *
    cfg.replacementCostPerExit *
    scenarioMultiplier;

  // 3. Recovered Manager Time
  const recoveredManagerTime = 
    cfg.managersAffected *
    cfg.hoursRecoveredPerManagerMonth *
    cfg.loadedHourlyManagerCost *
    cfg.monthsOfRealizedBenefit *
    scenarioMultiplier;

  // 4. Opportunity / Business Impact
  const opportunityImpact = 
    cfg.annualOpportunityPool *
    (cfg.conservativeImpactRatePct / 100) *
    (cfg.attributionPct / 100) *
    scenarioMultiplier;

  // Total Annual Quantified Benefit
  const totalAnnualQuantifiedBenefit = 
    recoveredProductivity + avoidedTurnover + recoveredManagerTime + opportunityImpact;

  // Quote Net Program Investment calculation
  const grossInvestment = 
    Number(cfg.coreProgramFee || 0) +
    Number(cfg.customizationFee || 0) +
    Number(cfg.assessmentFee || 0) +
    Number(cfg.reinforcementFee || 0) +
    Number(cfg.additionalFacilitatorFee || 0) +
    Number(cfg.travelLogisticsFee || 0);

  const netInvestment = Math.max(1, grossInvestment - Number(cfg.discount || 0));

  // Financial KPIs
  const netAnnualBenefit = totalAnnualQuantifiedBenefit - netInvestment;
  const roiPct = ((totalAnnualQuantifiedBenefit - netInvestment) / netInvestment) * 100;
  const benefitCostRatio = totalAnnualQuantifiedBenefit / netInvestment;
  const paybackPeriodMonths = (netInvestment / Math.max(1, totalAnnualQuantifiedBenefit)) * 12;
  const valuePerParticipant = totalAnnualQuantifiedBenefit / Math.max(1, cfg.affectedParticipants);

  return {
    inputs: cfg,
    scenarioMultiplier,
    drivers: {
      recoveredProductivity,
      avoidedTurnover,
      recoveredManagerTime,
      opportunityImpact,
    },
    investment: {
      grossInvestment,
      discount: cfg.discount,
      netInvestment,
    },
    kpis: {
      totalAnnualQuantifiedBenefit,
      netAnnualBenefit,
      roiPct,
      benefitCostRatio,
      paybackPeriodMonths,
      valuePerParticipant,
    }
  };
}

/**
 * Generates Sensitivity Table across different investment tiers
 */
export function generateSensitivityMatrix(inputs = {}, investmentTiers = [400000, 500000, 600000, 700000]) {
  const baseCfg = { ...DEFAULT_ROI_INPUTS, ...inputs };

  return investmentTiers.map(inv => {
    const consRes = calculateEnterpriseRoi({ ...baseCfg, scenario: 'conservative', coreProgramFee: inv, customizationFee: 0, assessmentFee: 0, reinforcementFee: 0, discount: 0 });
    const baseRes = calculateEnterpriseRoi({ ...baseCfg, scenario: 'base', coreProgramFee: inv, customizationFee: 0, assessmentFee: 0, reinforcementFee: 0, discount: 0 });
    const upRes   = calculateEnterpriseRoi({ ...baseCfg, scenario: 'upside', coreProgramFee: inv, customizationFee: 0, assessmentFee: 0, reinforcementFee: 0, discount: 0 });

    return {
      investment: inv,
      conservativeBenefit: consRes.kpis.totalAnnualQuantifiedBenefit,
      baseBenefit: baseRes.kpis.totalAnnualQuantifiedBenefit,
      upsideBenefit: upRes.kpis.totalAnnualQuantifiedBenefit,
      baseRoiPct: baseRes.kpis.roiPct,
      basePaybackMonths: baseRes.kpis.paybackPeriodMonths,
    };
  });
}
