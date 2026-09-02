/**
 * TH3ORY DIAGNOSTIC INDEX™
 * Enterprise Human Influence & Behavioural Capability Assessment
 * 
 * 7 Capability Dimensions, 35 Likert items (5 per dimension),
 * Reverse-scoring engine, Development bands, and Enterprise Pitch Matrix.
 */

export const LIKERT_OPTIONS = [
  { value: 1, label: 'Strongly disagree', shortLabel: 'Strongly Disagree', badge: '1' },
  { value: 2, label: 'Disagree', shortLabel: 'Disagree', badge: '2' },
  { value: 3, label: 'Neither agree nor disagree', shortLabel: 'Neutral', badge: '3' },
  { value: 4, label: 'Agree', shortLabel: 'Agree', badge: '4' },
  { value: 5, label: 'Strongly agree', shortLabel: 'Strongly Agree', badge: '5' }
];

export const DIAGNOSTIC_DIMENSIONS = [
  {
    id: 'self',
    codePrefix: 'S',
    sectionNumber: 1,
    name: 'Self',
    subtitle: 'Self-awareness & behavioural control',
    reflection: 'How I regulate my own behaviour',
    executiveTheme: 'Emotional Regulation & Composure',
    enterpriseImpact: 'Leaders with high self-awareness recognize emotional triggers under high stakes, preventing costly reactive decisions in negotiations and executive meetings.',
    questions: [
      { id: 'S1', text: 'I recognize how my emotions affect the way I communicate with others.', isReversed: false },
      { id: 'S2', text: 'I can identify situations in which I become less effective or less influential.', isReversed: false },
      { id: 'S3', text: 'I notice when my assumptions may be influencing my judgement.', isReversed: false },
      { id: 'S4', text: 'I can deliberately change my behaviour when a situation requires a different approach.', isReversed: false },
      { id: 'S5', text: 'When I am challenged, I usually react before fully understanding what is happening.', isReversed: true }
    ],
    recommendedModules: ['Module 01: Executive Presence & Nervous System Control', 'Module 02: Cognitive Friction Management'],
    recommendedFormat: '3-Day Corporate Intensive (Day 1 Focus) & 1-on-1 Coaching'
  },
  {
    id: 'perception',
    codePrefix: 'P',
    sectionNumber: 2,
    name: 'Perception',
    subtitle: 'Understanding how others see and interpret',
    reflection: 'How I interpret and anticipate others',
    executiveTheme: 'Stakeholder Empathy & Perspective Taking',
    enterpriseImpact: 'Eliminates departmental silos by teaching professionals to anticipate stakeholder concerns, map client motivations, and actively question initial biases.',
    questions: [
      { id: 'P1', text: 'I consider how my behaviour may be interpreted before I act.', isReversed: false },
      { id: 'P2', text: 'I can usually recognize that people may interpret the same situation differently.', isReversed: false },
      { id: 'P3', text: 'I adapt the way I communicate when speaking with different people.', isReversed: false },
      { id: 'P4', text: 'I actively question my first impression when making an important judgement about someone.', isReversed: false },
      { id: 'P5', text: 'I generally assume that other people see situations in the same way I do.', isReversed: true }
    ],
    recommendedModules: ['Module 03: Stakeholder Mapping & Social Calibration', 'Module 04: Cognitive Empathy in Cross-Functional Teams'],
    recommendedFormat: '6-Week Leadership Cohort & Cross-Department Workshops'
  },
  {
    id: 'presence',
    codePrefix: 'PR',
    sectionNumber: 3,
    name: 'Presence',
    subtitle: 'Communication, clarity & credibility',
    reflection: 'How my communication is experienced',
    executiveTheme: 'Executive Vocal Resonance & Room Authority',
    enterpriseImpact: 'Enables emerging leaders and senior managers to project unshakeable authority without arrogance, delivering complex ideas with magnetic clarity.',
    questions: [
      { id: 'PR1', text: 'I communicate my ideas clearly without unnecessary complexity.', isReversed: false },
      { id: 'PR2', text: 'I remain composed when communicating under pressure.', isReversed: false },
      { id: 'PR3', text: 'People generally understand the key point I am trying to communicate.', isReversed: false },
      { id: 'PR4', text: 'I can communicate confidence without becoming overly aggressive or dominant.', isReversed: false },
      { id: 'PR5', text: 'When I feel uncertain, my communication becomes noticeably less clear or confident.', isReversed: true }
    ],
    recommendedModules: ['Module 01: Executive Vocal Acoustics & Posture', 'Module 05: High-Stakes Pitch Architecture'],
    recommendedFormat: '3-Day Corporate Intensive & Executive Video Coaching Lab'
  },
  {
    id: 'connection',
    codePrefix: 'C',
    sectionNumber: 4,
    name: 'Connection',
    subtitle: 'Listening, trust & relationships',
    reflection: 'How I build understanding and trust',
    executiveTheme: 'Psychological Safety & Relationship Capital',
    enterpriseImpact: 'Transforms transactional interactions into enduring commercial partnerships and high-trust team dynamics, drastically reducing employee turnover.',
    questions: [
      { id: 'C1', text: 'I listen to understand rather than simply waiting for my turn to speak.', isReversed: false },
      { id: 'C2', text: 'People generally feel comfortable expressing disagreement with me.', isReversed: false },
      { id: 'C3', text: 'I can adapt my communication to different personalities and working styles.', isReversed: false },
      { id: 'C4', text: 'I build understanding and trust before trying to persuade someone.', isReversed: false },
      { id: 'C5', text: 'When someone disagrees with me, I focus more on defending my position than understanding theirs.', isReversed: true }
    ],
    recommendedModules: ['Module 07: Trust Engineering & Vulnerability Calibration', 'Module 08: Non-Defensive Communication'],
    recommendedFormat: '6-Week Leadership Cohort & Peer Coaching Circles'
  },
  {
    id: 'persuasion',
    codePrefix: 'PE',
    sectionNumber: 5,
    name: 'Persuasion',
    subtitle: 'Influence & decision-making',
    reflection: 'How I move ideas and decisions',
    executiveTheme: 'Influence Without Authority & Decision Architecture',
    enterpriseImpact: 'Equips technical specialists and product leaders to secure buy-in across executive committees and external clients by aligning to client outcomes.',
    questions: [
      { id: 'PE1', text: 'I can explain an idea from the other person\'s perspective.', isReversed: false },
      { id: 'PE2', text: 'I try to understand what matters to someone before attempting to persuade them.', isReversed: false },
      { id: 'PE3', text: 'I can present difficult ideas in a way that reduces unnecessary resistance.', isReversed: false },
      { id: 'PE4', text: 'I can distinguish between giving information and actually influencing a decision.', isReversed: false },
      { id: 'PE5', text: 'When someone resists my idea, I usually respond by giving them more information rather than understanding the reason for their resistance.', isReversed: true }
    ],
    recommendedModules: ['Module 04: Cognitive Framing & Buy-In Frameworks', 'Module 06: Overcoming Corporate Inertia'],
    recommendedFormat: '12-Week Executive Accelerator & Sales Mastery Cohort'
  },
  {
    id: 'power',
    codePrefix: 'PO',
    sectionNumber: 6,
    name: 'Power',
    subtitle: 'Difficult conversations, conflict & negotiation',
    reflection: 'How I handle disagreement and negotiation',
    executiveTheme: 'Principled Negotiation & High-Stakes Mediation',
    enterpriseImpact: 'Allows managers to navigate tough political conflicts and commercial contract negotiations while fiercely protecting both outcome and long-term relationships.',
    questions: [
      { id: 'PO1', text: 'I can influence people even when I do not have formal authority over them.', isReversed: false },
      { id: 'PO2', text: 'I can disagree with someone without unnecessarily damaging the relationship.', isReversed: false },
      { id: 'PO3', text: 'I am comfortable addressing difficult conversations rather than avoiding them.', isReversed: false },
      { id: 'PO4', text: 'I can negotiate while protecting both the relationship and the outcome.', isReversed: false },
      { id: 'PO5', text: 'When a conversation becomes emotionally or politically difficult, I tend to avoid pushing the issue.', isReversed: true }
    ],
    recommendedModules: ['Module 06: Advanced Conflict De-Escalation', 'Module 09: Value-Creation Negotiation Architecture'],
    recommendedFormat: '3-Day Corporate Intensive & CXO Simulation Lab'
  },
  {
    id: 'performance',
    codePrefix: 'PF',
    sectionNumber: 7,
    name: 'Performance',
    subtitle: 'Influence under pressure',
    reflection: 'How I apply influence under pressure',
    executiveTheme: 'Clutch Execution & High-Status Communication',
    enterpriseImpact: 'Bridges the gap between knowing communication theory and applying it effortlessly in critical boardroom pitches, crisis meetings, and media opportunities.',
    questions: [
      { id: 'PF1', text: 'I can adapt my communication effectively when the stakes of a situation increase.', isReversed: false },
      { id: 'PF2', text: 'I remain effective when communicating with senior or high-status people.', isReversed: false },
      { id: 'PF3', text: 'I can apply what I know about influence in real workplace situations.', isReversed: false },
      { id: 'PF4', text: 'I deliberately prepare for important conversations rather than relying entirely on instinct.', isReversed: false },
      { id: 'PF5', text: 'What I know about effective communication is often difficult for me to apply in the moment.', isReversed: true }
    ],
    recommendedModules: ['Module 05: Real-Time High-Status Interaction', 'Module 10: 90-Day Deliberate Practice & Stress Inoculation'],
    recommendedFormat: 'Annual Enterprise Academy & High-Potential Leadership Track'
  }
];

export const DEVELOPMENT_BANDS = [
  {
    range: [85, 100],
    name: 'ADVANCED',
    interpretation: 'Strong self-reported capability. Focus on refinement and high-stakes application.',
    colorText: 'text-emerald-400',
    colorBg: 'bg-emerald-500/15',
    colorBorder: 'border-emerald-500/30',
    colorBadge: 'bg-emerald-500 text-slate-950',
    summaryTag: 'Leadership Strength'
  },
  {
    range: [70, 84],
    name: 'EFFECTIVE',
    interpretation: 'Generally effective, with opportunities to refine specific behaviours.',
    colorText: 'text-blue-400',
    colorBg: 'bg-blue-500/15',
    colorBorder: 'border-blue-500/30',
    colorBadge: 'bg-blue-500 text-slate-950',
    summaryTag: 'Solid Capability'
  },
  {
    range: [55, 69],
    name: 'DEVELOPING',
    interpretation: 'Effectiveness may vary by situation or level of pressure.',
    colorText: 'text-amber-400',
    colorBg: 'bg-amber-500/15',
    colorBorder: 'border-amber-500/30',
    colorBadge: 'bg-amber-500 text-slate-950',
    summaryTag: 'Growth Opportunity'
  },
  {
    range: [40, 54],
    name: 'PRIORITY',
    interpretation: 'An important area for deliberate development and practice.',
    colorText: 'text-orange-400',
    colorBg: 'bg-orange-500/15',
    colorBorder: 'border-orange-500/30',
    colorBadge: 'bg-orange-500 text-slate-950',
    summaryTag: 'Targeted Focus'
  },
  {
    range: [0, 39],
    name: 'HIGH PRIORITY',
    interpretation: 'Substantial self-reported room for development in this capability area.',
    colorText: 'text-rose-400',
    colorBg: 'bg-rose-500/15',
    colorBorder: 'border-rose-500/30',
    colorBadge: 'bg-rose-500 text-slate-950',
    summaryTag: 'Immediate Action Needed'
  }
];

export const REFLECTION_PROMPTS = [
  { id: 'rp1', label: 'Where does this capability matter most in my work?' },
  { id: 'rp2', label: 'What behaviour would I like to change?' },
  { id: 'rp3', label: 'What real situation could I use as practice?' },
  { id: 'rp4', label: 'What would improvement look like?' }
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
  
  // Step 3 - Overall TH3ORY Influence Score = Average of 7 dimensions
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
 * Sample Preset Profiles for 1-Click Executive Demonstration
 */
export const SAMPLE_PRESETS = {
  executiveLeader: {
    name: 'Senior Technology Director (Demonstration Profile)',
    description: 'High executive presence & vision, with clear ROI growth opportunity in conflict negotiation and cross-department influence.',
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
    name: 'Emerging Manager (Growth Profile)',
    description: 'Empathetic team builder seeking mastery in high-stakes communication with CXOs and senior stakeholders.',
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
