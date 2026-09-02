/**
 * TH3ORY DIAGNOSTIC INDEX™
 * Enterprise Human Influence & Behavioural Capability Assessment
 * 
 * Multi-dimensional workforce diagnostic evaluating enterprise teams, leaders,
 * and managers across 7 Capability Dimensions (35 Standardized Items).
 * Reverse-scoring engine, Development bands, and Enterprise Pitch Matrix.
 */

export const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly disagree (Rarely observed in our teams)', shortLabel: 'Strongly Disagree', badge: '1' },
  { value: 2, label: 'Disagree (Inconsistently practiced across personnel)', shortLabel: 'Disagree', badge: '2' },
  { value: 3, label: 'Neutral (Varies by department / level)', shortLabel: 'Neutral', badge: '3' },
  { value: 4, label: 'Agree (Consistently demonstrated by our leaders)', shortLabel: 'Agree', badge: '4' },
  { value: 5, label: 'Strongly agree (Embedded organizational standard)', shortLabel: 'Strongly Agree', badge: '5' }
];

export const DIAGNOSTIC_DIMENSIONS = [
  {
    id: 'self',
    codePrefix: 'S',
    sectionNumber: 1,
    name: 'Self',
    subtitle: 'Workforce Self-Awareness & Behavioural Control',
    reflection: 'How our leaders regulate emotion & composure under pressure',
    executiveTheme: 'Emotional Regulation & Executive Composure',
    enterpriseImpact: 'Leaders with high self-awareness recognize emotional triggers under high stakes, preventing costly reactive decisions in negotiations and executive meetings.',
    questions: [
      { id: 'S1', text: 'Our leaders and team members recognize how emotional pressure impacts their communication and decision-making.', isReversed: false },
      { id: 'S2', text: 'Our managers and professionals can accurately identify situations in which their influence or communication becomes less effective.', isReversed: false },
      { id: 'S3', text: 'Our personnel actively notice when unexamined assumptions may be biasing strategic decisions and stakeholder judgements.', isReversed: false },
      { id: 'S4', text: 'Our teams can deliberately adapt their behavioral approach when high-stakes organizational situations demand it.', isReversed: false },
      { id: 'S5', text: 'When challenged by colleagues or clients, team members frequently react defensively before fully understanding the underlying issue.', isReversed: true }
    ],
    recommendedModules: ['Module 01: Executive Presence & Nervous System Control', 'Module 02: Cognitive Friction Management'],
    recommendedFormat: '3-Day Corporate Intensive (Day 1 Focus) & 1-on-1 Coaching'
  },
  {
    id: 'perception',
    codePrefix: 'P',
    sectionNumber: 2,
    name: 'Perception',
    subtitle: 'Cross-Functional Stakeholder Empathy & Anticipation',
    reflection: 'How our teams anticipate and align with cross-departmental stakeholders',
    executiveTheme: 'Stakeholder Empathy & Perspective Taking',
    enterpriseImpact: 'Eliminates departmental silos by teaching professionals to anticipate stakeholder concerns, map client motivations, and actively question initial biases.',
    questions: [
      { id: 'P1', text: 'Our professionals proactively consider how their actions and messages will be interpreted across different departments before executing.', isReversed: false },
      { id: 'P2', text: 'Our managers readily recognize that cross-functional stakeholders and clients interpret the same business situation from contrasting viewpoints.', isReversed: false },
      { id: 'P3', text: 'Our team members effectively tailor their communication style when engaging with diverse stakeholders, peers, and executive leaders.', isReversed: false },
      { id: 'P4', text: 'Our hiring and team leads deliberately challenge first impressions and cognitive biases when making key personnel and partner judgements.', isReversed: false },
      { id: 'P5', text: 'Across our organization, teams generally assume that other departments and clients view priorities the exact same way they do.', isReversed: true }
    ],
    recommendedModules: ['Module 03: Stakeholder Mapping & Social Calibration', 'Module 04: Cognitive Empathy in Cross-Functional Teams'],
    recommendedFormat: '6-Week Leadership Cohort & Cross-Department Workshops'
  },
  {
    id: 'presence',
    codePrefix: 'PR',
    sectionNumber: 3,
    name: 'Presence',
    subtitle: 'Organizational Communication, Clarity & Credibility',
    reflection: 'How our communication clarity & executive credibility are experienced by clients',
    executiveTheme: 'Executive Vocal Resonance & Room Authority',
    enterpriseImpact: 'Enables emerging leaders and senior managers to project unshakeable authority without arrogance, delivering complex ideas with magnetic clarity.',
    questions: [
      { id: 'PR1', text: 'Our professionals communicate complex technical and business ideas with clarity, precision, and zero unnecessary complexity.', isReversed: false },
      { id: 'PR2', text: 'Our leaders and frontline representatives maintain composure and poise when communicating under pressure or facing critical deadlines.', isReversed: false },
      { id: 'PR3', text: 'Key stakeholders, clients, and internal teams immediately grasp the core message and strategic priorities being communicated.', isReversed: false },
      { id: 'PR4', text: 'Our leaders project authentic confidence and executive authority without becoming overly aggressive or domineering.', isReversed: false },
      { id: 'PR5', text: 'When navigating ambiguity or uncertainty, communication across our teams becomes visibly hesitant, fragmented, or less confident.', isReversed: true }
    ],
    recommendedModules: ['Module 01: Executive Vocal Acoustics & Posture', 'Module 05: High-Stakes Pitch Architecture'],
    recommendedFormat: '3-Day Corporate Intensive & Executive Video Coaching Lab'
  },
  {
    id: 'connection',
    codePrefix: 'C',
    sectionNumber: 4,
    name: 'Connection',
    subtitle: 'Psychological Safety, Trust & Relationship Capital',
    reflection: 'How our organization cultivates psychological safety, trust & relationship capital',
    executiveTheme: 'Psychological Safety & Relationship Capital',
    enterpriseImpact: 'Transforms transactional interactions into enduring commercial partnerships and high-trust team dynamics, drastically reducing employee turnover.',
    questions: [
      { id: 'C1', text: 'Our managers practice active listening to genuinely understand stakeholder concerns rather than simply waiting for their turn to speak.', isReversed: false },
      { id: 'C2', text: 'Employees and collaborators across our organization feel safe expressing constructive disagreement, dissent, and critical feedback openly.', isReversed: false },
      { id: 'C3', text: 'Our team members smoothly adapt their working styles to different personalities, cultures, and communication preferences.', isReversed: false },
      { id: 'C4', text: 'Our leaders deliberately invest in building mutual trust and understanding before attempting to drive changes or persuade stakeholders.', isReversed: false },
      { id: 'C5', text: 'During internal disagreements or negotiations, employees tend to entrench and defend their position rather than understand the root cause.', isReversed: true }
    ],
    recommendedModules: ['Module 07: Trust Engineering & Vulnerability Calibration', 'Module 08: Non-Defensive Communication'],
    recommendedFormat: '6-Week Leadership Cohort & Peer Coaching Circles'
  },
  {
    id: 'persuasion',
    codePrefix: 'PE',
    sectionNumber: 5,
    name: 'Persuasion',
    subtitle: 'Cross-Departmental Influence & Decision Architecture',
    reflection: 'How our professionals influence decisions without hierarchical authority',
    executiveTheme: 'Influence Without Authority & Decision Architecture',
    enterpriseImpact: 'Equips technical specialists and product leaders to secure buy-in across executive committees and external clients by aligning to client outcomes.',
    questions: [
      { id: 'PE1', text: 'Our professionals consistently articulate proposals and strategies framed from the client\'s or decision-maker\'s perspective.', isReversed: false },
      { id: 'PE2', text: 'Our teams deliberately diagnose what truly matters to key stakeholders before attempting to pitch solutions or drive alignment.', isReversed: false },
      { id: 'PE3', text: 'Our managers present challenging ideas and organizational transitions in a way that minimizes resistance and accelerates adoption.', isReversed: false },
      { id: 'PE4', text: 'Our workforce clearly distinguishes between merely sharing information and actually influencing a strategic decision.', isReversed: false },
      { id: 'PE5', text: 'When facing resistance from stakeholders, team members typically respond by providing more data rather than uncovering the underlying friction.', isReversed: true }
    ],
    recommendedModules: ['Module 04: Cognitive Framing & Buy-In Frameworks', 'Module 06: Overcoming Corporate Inertia'],
    recommendedFormat: '12-Week Executive Accelerator & Sales Mastery Cohort'
  },
  {
    id: 'power',
    codePrefix: 'PO',
    sectionNumber: 6,
    name: 'Power',
    subtitle: 'Conflict Resolution, Political Savvy & Principled Negotiation',
    reflection: 'How our managers resolve conflict, navigate politics & negotiate outcomes',
    executiveTheme: 'Principled Negotiation & High-Stakes Mediation',
    enterpriseImpact: 'Allows managers to navigate tough political conflicts and commercial contract negotiations while fiercely protecting both outcome and long-term relationships.',
    questions: [
      { id: 'PO1', text: 'Our professionals can influence decisions and steer alignment even when they lack formal hierarchical authority over others.', isReversed: false },
      { id: 'PO2', text: 'Our teams navigate tough commercial and interpersonal disagreements without causing lasting damage to working relationships.', isReversed: false },
      { id: 'PO3', text: 'Our managers proactively lean into difficult conversations and accountability dialogues rather than avoiding or delaying them.', isReversed: false },
      { id: 'PO4', text: 'Our negotiators protect both commercial outcome and long-term partnership trust during high-stakes client negotiations.', isReversed: false },
      { id: 'PO5', text: 'When a workplace discussion becomes politically or emotionally tense, employees tend to avoid pushing the issue or drop accountability.', isReversed: true }
    ],
    recommendedModules: ['Module 06: Advanced Conflict De-Escalation', 'Module 09: Value-Creation Negotiation Architecture'],
    recommendedFormat: '3-Day Corporate Intensive & CXO Simulation Lab'
  },
  {
    id: 'performance',
    codePrefix: 'PF',
    sectionNumber: 7,
    name: 'Performance',
    subtitle: 'High-Stakes Influence & Real-Time Executive Execution',
    reflection: 'How our talent applies high-impact influence in clutch, high-stakes scenarios',
    executiveTheme: 'Clutch Execution & High-Status Communication',
    enterpriseImpact: 'Bridges the gap between knowing communication theory and applying it effortlessly in critical boardroom pitches, crisis meetings, and media opportunities.',
    questions: [
      { id: 'PF1', text: 'Our leaders and client-facing personnel elevate their communication clarity and effectiveness as situational stakes increase.', isReversed: false },
      { id: 'PF2', text: 'Our rising talent remains poised, credible, and influential when communicating directly with C-suite executives, board members, or high-status clients.', isReversed: false },
      { id: 'PF3', text: 'Our workforce consistently translates training principles into observable behavioral execution and real-world business outcomes.', isReversed: false },
      { id: 'PF4', text: 'Our teams deliberately prepare structured conversation gameplans for critical meetings rather than relying entirely on impromptu instinct.', isReversed: false },
      { id: 'PF5', text: 'Despite knowing effective communication theory, team members frequently struggle to apply best practices in the heat of real-time workplace pressure.', isReversed: true }
    ],
    recommendedModules: ['Module 05: Real-Time High-Status Interaction', 'Module 10: 90-Day Deliberate Practice & Stress Inoculation'],
    recommendedFormat: 'Annual Enterprise Academy & High-Potential Leadership Track'
  }
];

export const DEVELOPMENT_BANDS = [
  {
    range: [85, 100],
    name: 'ADVANCED',
    interpretation: 'Strong organizational capability. Embedded cultural strength with focus on executive refinement and high-stakes scale.',
    colorText: 'text-emerald-400',
    colorBg: 'bg-emerald-500/15',
    colorBorder: 'border-emerald-500/30',
    colorBadge: 'bg-emerald-500 text-slate-950',
    summaryTag: 'Enterprise Strength'
  },
  {
    range: [70, 84],
    name: 'EFFECTIVE',
    interpretation: 'Generally effective across workforce teams, with specific opportunities to refine behavioral consistency under pressure.',
    colorText: 'text-blue-400',
    colorBg: 'bg-blue-500/15',
    colorBorder: 'border-blue-500/30',
    colorBadge: 'bg-blue-500 text-slate-950',
    summaryTag: 'Solid Capability'
  },
  {
    range: [55, 69],
    name: 'DEVELOPING',
    interpretation: 'Workforce effectiveness varies considerably by department, management tier, or level of situational pressure.',
    colorText: 'text-amber-400',
    colorBg: 'bg-amber-500/15',
    colorBorder: 'border-amber-500/30',
    colorBadge: 'bg-amber-500 text-slate-950',
    summaryTag: 'Growth Opportunity'
  },
  {
    range: [40, 54],
    name: 'PRIORITY',
    interpretation: 'A critical organizational area requiring structured corporate training and deliberate behavioral practice.',
    colorText: 'text-orange-400',
    colorBg: 'bg-orange-500/15',
    colorBorder: 'border-orange-500/30',
    colorBadge: 'bg-orange-500 text-slate-950',
    summaryTag: 'Targeted Corporate Focus'
  },
  {
    range: [0, 39],
    name: 'HIGH PRIORITY',
    interpretation: 'Substantial room for capability development across the workforce; represents a potential bottleneck in team velocity and deal execution.',
    colorText: 'text-rose-400',
    colorBg: 'bg-rose-500/15',
    colorBorder: 'border-rose-500/30',
    colorBadge: 'bg-rose-500 text-slate-950',
    summaryTag: 'Immediate Corporate Action'
  }
];

export const REFLECTION_PROMPTS = [
  { id: 'rp1', label: 'Where does this capability matter most in our organizational workflow?' },
  { id: 'rp2', label: 'What behavioral patterns or communication habits need shifting across our teams?' },
  { id: 'rp3', label: 'What upcoming high-stakes business initiatives or client deals should be used for deliberate team practice?' },
  { id: 'rp4', label: 'What would measurable behavioral improvement look like in our quarterly performance and team retention?' }
];

/**
 * Scoring Calculation Engine
 */

export function reverseScore(rawScore) {
  const num = Number(rawScore) || 3;
  // Convert responses using: 1->5, 2->4, 3->3, 4->2, 5->1 (Formula: 6 - rawScore)
  return 6 - num;
}

export function calculateDimensionScore(dimensionId, responses = {}) {
  const dim = DIAGNOSTIC_DIMENSIONS.find(d => d.id === dimensionId);
  if (!dim) return { rawScore: 0, score: 0, band: DEVELOPMENT_BANDS[3], recommendedModules: [], recommendedFormat: '3-Day Corporate Intensive' };

  let rawTotal = 0;
  dim.questions.forEach(q => {
    const userVal = responses[q.id] || 3;
    const scoredVal = q.isReversed ? reverseScore(userVal) : Number(userVal);
    rawTotal += scoredVal;
  });

  // Dimension Score = (Raw Dimension Score ÷ 25) × 100
  const score = Math.round((rawTotal / 25) * 100);
  const band = getDevelopmentBand(score);

  return {
    ...dim,
    rawScore: rawTotal,
    maxRaw: 25,
    score,
    band
  };
}

export function getDevelopmentBand(score) {
  const s = Math.max(0, Math.min(100, Number(score) || 0));
  return DEVELOPMENT_BANDS.find(b => s >= b.range[0] && s <= b.range[1]) || DEVELOPMENT_BANDS[2];
}

export function calculateAllScores(responses = {}) {
  const dimensionResults = DIAGNOSTIC_DIMENSIONS.map(dim => calculateDimensionScore(dim.id, responses));
  
  // Overall TH3ORY Influence Score = Average of 7 dimensions
  const sumScores = dimensionResults.reduce((acc, curr) => acc + curr.score, 0);
  const overallScore = Math.round(sumScores / dimensionResults.length);
  const overallBand = getDevelopmentBand(overallScore);

  // Identify Strongest and Priority Area
  const sorted = [...dimensionResults].sort((a, b) => b.score - a.score);
  const strongestArea = sorted[0];
  const developmentPriority = sorted[sorted.length - 1];

  // Influence Gap = Highest dimension score - Lowest dimension score
  const highestScore = strongestArea.score;
  const lowestScore = developmentPriority.score;
  const influenceGap = highestScore - lowestScore;

  return {
    dimensionResults,
    overallScore,
    overallBand,
    strongestArea,
    developmentPriority,
    highestScore,
    lowestScore,
    influenceGap,
    completedQuestionsCount: Object.keys(responses).length,
    totalQuestions: 35
  };
}

/**
 * Sample Preset Profiles for 1-Click Enterprise Demonstration
 */
export const SAMPLE_PRESETS = {
  executiveLeader: {
    name: 'Enterprise Tech Organization (Sample Audit)',
    description: 'High technical presence and cross-functional empathy, with a clear ROI growth opportunity in conflict resolution and high-stakes negotiation.',
    responses: {
      S1: 4, S2: 4, S3: 4, S4: 3, S5: 4, // Self: 4+4+4+3+(6-4=2) = 17 => 68%
      P1: 4, P2: 4, P3: 4, P4: 4, P5: 4, // Perception: 4+4+4+4+(6-4=2) = 18 => 72%
      PR1: 5, PR2: 4, PR3: 5, PR4: 4, PR5: 4, // Presence: 5+4+5+4+(6-4=2) = 20 => 80%
      C1: 4, C2: 3, C3: 4, C4: 4, C5: 4, // Connection: 4+3+4+4+(6-4=2) = 17 => 68%
      PE1: 4, PE2: 4, PE3: 3, PE4: 4, PE5: 4, // Persuasion: 4+4+3+4+(6-4=2) = 17 => 68%
      PO1: 3, PO2: 3, PO3: 2, PO4: 3, PO5: 4, // Power: 3+3+2+3+(6-4=2) = 13 => 52% (Priority)
      PF1: 4, PF2: 3, PF3: 4, PF4: 4, PF5: 4  // Performance: 4+3+4+4+(6-4=2) = 17 => 68%
    }
  },
  highPotentialManager: {
    name: 'Fast-Growing Leadership Bench (Growth Audit)',
    description: 'Strong team trust and collaboration, with targeted need for executive boardroom presence and high-stakes influence.',
    responses: {
      S1: 3, S2: 3, S3: 3, S4: 3, S5: 4, // 14 => 56%
      P1: 4, P2: 4, P3: 4, P4: 3, P5: 3, // 18 => 72%
      PR1: 3, PR2: 2, PR3: 3, PR4: 3, PR5: 4, // 13 => 52% (Priority)
      C1: 5, C2: 4, C3: 4, C4: 5, C5: 4, // 20 => 80% (Strongest)
      PE1: 3, PE2: 4, PE3: 3, PE4: 3, PE5: 4, // 15 => 60%
      PO1: 2, PO2: 3, PO3: 2, PO4: 3, PO5: 4, // 12 => 48%
      PF1: 3, PF2: 2, PF3: 3, PF4: 3, PF5: 4  // 13 => 52%
    }
  }
};
