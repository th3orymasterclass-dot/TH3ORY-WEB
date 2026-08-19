// THE CHARACTER CODE™ — 12-Archetype Character Psychology & Influence Assessment Data Module

export const ARCHETYPES = {
  Sovereign: {
    name: 'The Sovereign',
    key: 'Sovereign',
    coreDrive: 'Authority',
    coreNeed: 'Control and significance',
    coreFear: 'Powerlessness',
    primaryStrength: 'Leadership',
    shadow: 'Domination',
    influenceStyle: 'Authority',
    healthy: 'Leader',
    unbalanced: 'Tyrant',
    description: 'Naturally assumes responsibility and looks for order, hierarchy, and direction.',
    growthDirection: 'Diplomat',
    superpower: 'Executive Command & Decisive Direction',
    blindSpot: 'May mistake compliance for genuine commitment.'
  },
  Strategist: {
    name: 'The Strategist',
    key: 'Strategist',
    coreDrive: 'Mastery',
    coreNeed: 'Competence',
    coreFear: 'Being outsmarted or unprepared',
    primaryStrength: 'Planning',
    shadow: 'Manipulation',
    influenceStyle: 'Information',
    healthy: 'Architect',
    unbalanced: 'Manipulator',
    description: 'Thinks several moves ahead and searches for patterns, leverage, and hidden variables.',
    growthDirection: 'Caregiver',
    superpower: 'Pattern Recognition & Strategic Vision',
    blindSpot: 'May treat people like systems to be optimized rather than human beings.'
  },
  Rebel: {
    name: 'The Rebel',
    key: 'Rebel',
    coreDrive: 'Freedom',
    coreNeed: 'Autonomy',
    coreFear: 'Conformity',
    primaryStrength: 'Disruption',
    shadow: 'Destruction',
    influenceStyle: 'Challenge',
    healthy: 'Revolutionary',
    unbalanced: 'Saboteur',
    description: 'Questions established rules and instinctively searches for another way.',
    growthDirection: 'Guardian',
    superpower: 'Status-Quo Disruption & Fearless Innovation',
    blindSpot: 'May reject valid structures simply because they represent authority.'
  },
  Hero: {
    name: 'The Hero',
    key: 'Hero',
    coreDrive: 'Achievement',
    coreNeed: 'Proving capability',
    coreFear: 'Failure or weakness',
    primaryStrength: 'Courage',
    shadow: 'Obsession',
    influenceStyle: 'Example',
    healthy: 'Champion',
    unbalanced: 'Conqueror',
    description: 'Energized by challenge and tends to move toward difficulty rather than away from it.',
    growthDirection: 'Sage',
    superpower: 'Relentless Resilience & High-Stakes Courage',
    blindSpot: 'May tie self-worth exclusively to winning and constant performance.'
  },
  Sage: {
    name: 'The Sage',
    key: 'Sage',
    coreDrive: 'Truth',
    coreNeed: 'Understanding',
    coreFear: 'Ignorance or being deceived',
    primaryStrength: 'Insight',
    shadow: 'Detachment',
    influenceStyle: 'Knowledge',
    healthy: 'Oracle',
    unbalanced: 'Intellectualizer',
    description: 'Seeks to understand reality beneath appearances through rigorous analysis.',
    growthDirection: 'Explorer',
    superpower: 'Deep Analytical Wisdom & Truth Extraction',
    blindSpot: 'May endlessly analyze situations without taking decisive action in the physical world.'
  },
  Magician: {
    name: 'The Magician',
    key: 'Magician',
    coreDrive: 'Transformation',
    coreNeed: 'Influence',
    coreFear: 'Being irrelevant or powerless',
    primaryStrength: 'Psychological insight',
    shadow: 'Deception',
    influenceStyle: 'Perception',
    healthy: 'Catalyst',
    unbalanced: 'Manipulator',
    description: 'Understands that changing perception can fundamentally change human behavior.',
    growthDirection: 'Guardian',
    superpower: 'Perception Shaping & Transformational Catalyst',
    blindSpot: 'May rely heavily on illusion and messaging instead of foundational substance.'
  },
  Explorer: {
    name: 'The Explorer',
    key: 'Explorer',
    coreDrive: 'Discovery',
    coreNeed: 'Freedom and experience',
    coreFear: 'Being trapped',
    primaryStrength: 'Adaptability',
    shadow: 'Restlessness',
    influenceStyle: 'Adventure',
    healthy: 'Pioneer',
    unbalanced: 'Drifter',
    description: 'Energized by novelty, uncertainty, and unfamiliar high-leverage experiences.',
    growthDirection: 'Guardian',
    superpower: 'Adaptive Navigational Agility & Pioneer Instinct',
    blindSpot: 'May abandon projects right before breakthrough due to restlessness.'
  },
  Creator: {
    name: 'The Creator',
    key: 'Creator',
    coreDrive: 'Expression',
    coreNeed: 'Originality',
    coreFear: 'Meaninglessness or mediocrity',
    primaryStrength: 'Imagination',
    shadow: 'Perfectionism',
    influenceStyle: 'Creation',
    healthy: 'Visionary',
    unbalanced: 'Perfectionist',
    description: 'Desires to manifest solutions and art that could not have existed without them.',
    growthDirection: 'Guardian',
    superpower: 'Visionary Originality & Aesthetic Architecture',
    blindSpot: 'May delay publishing or releasing work due to perfectionistic paralysis.'
  },
  Caregiver: {
    name: 'The Caregiver',
    key: 'Caregiver',
    coreDrive: 'Protection',
    coreNeed: 'Belonging',
    coreFear: 'Abandonment or causing harm',
    primaryStrength: 'Empathy',
    shadow: 'Self-neglect',
    influenceStyle: 'Support',
    healthy: 'Protector',
    unbalanced: 'Martyr',
    description: 'Instinctively notices needs and attempts to protect and elevate people.',
    growthDirection: 'Sovereign',
    superpower: 'Empathic Rapport & Relational Shielding',
    blindSpot: 'May neglect personal boundaries and goals while over-supporting others.'
  },
  Diplomat: {
    name: 'The Diplomat',
    key: 'Diplomat',
    coreDrive: 'Connection',
    coreNeed: 'Harmony',
    coreFear: 'Rejection or social conflict',
    primaryStrength: 'Social intelligence',
    shadow: 'People-pleasing',
    influenceStyle: 'Rapport',
    healthy: 'Connector',
    unbalanced: 'Chameleon',
    description: 'Understands social dynamics and seamlessly adjusts communication to build harmony.',
    growthDirection: 'Rebel',
    superpower: 'High Social Intelligence & Frictional Mitigation',
    blindSpot: 'May suppress personal truth to avoid social friction or disagreement.'
  },
  Jester: {
    name: 'The Jester',
    key: 'Jester',
    coreDrive: 'Stimulation',
    coreNeed: 'Joy',
    coreFear: 'Emotional heaviness or boredom',
    primaryStrength: 'Humour',
    shadow: 'Avoidance',
    influenceStyle: 'Entertainment',
    healthy: 'Entertainer',
    unbalanced: 'Escapist',
    description: 'Shifts emotional states through humor, playfulness, and strategic unpredictability.',
    growthDirection: 'Sage',
    superpower: 'State Disruption & Charismatic Levity',
    blindSpot: 'May use humor to deflect serious emotional topics or vulnerable truths.'
  },
  Guardian: {
    name: 'The Guardian',
    key: 'Guardian',
    coreDrive: 'Security',
    coreNeed: 'Stability',
    coreFear: 'Chaos or betrayal',
    primaryStrength: 'Reliability',
    shadow: 'Rigidity',
    influenceStyle: 'Trust',
    healthy: 'Anchor',
    unbalanced: 'Gatekeeper',
    description: 'Protects critical systems, people, commitments, and institutional standards.',
    growthDirection: 'Explorer',
    superpower: 'Rock-Solid Reliability & Systemic Fortress Security',
    blindSpot: 'May resist necessary change out of a desire for absolute predictability.'
  }
};

// 12-Archetype Assessment Questions (Section A to L)
export const CHARACTER_CODE_QUESTIONS = [
  // Authority (Sovereign)
  { id: 'S01', archetype: 'Sovereign', text: 'I naturally take charge when a group lacks direction.' },
  { id: 'S02', archetype: 'Sovereign', text: 'I am comfortable making decisions that affect other people.' },
  { id: 'S03', archetype: 'Sovereign', text: 'I dislike feeling powerless in a situation.' },
  { id: 'S04', archetype: 'Sovereign', text: 'People often look to me when something needs to be decided.' },
  { id: 'S05', archetype: 'Sovereign', text: 'I enjoy having responsibility.' },

  // Strategy (Strategist)
  { id: 'ST01', archetype: 'Strategist', text: 'I naturally think several steps ahead.' },
  { id: 'ST02', archetype: 'Strategist', text: 'I enjoy solving complicated problems.' },
  { id: 'ST03', archetype: 'Strategist', text: 'I notice patterns that other people overlook.' },
  { id: 'ST04', archetype: 'Strategist', text: 'I mentally simulate different outcomes before making decisions.' },
  { id: 'ST05', archetype: 'Strategist', text: 'Understanding how a system works gives me a sense of leverage.' },

  // Rebellion (Rebel)
  { id: 'R01', archetype: 'Rebel', text: 'I question rules that seem unnecessary or restrictive.' },
  { id: 'R02', archetype: 'Rebel', text: 'Authority does not automatically earn my respect.' },
  { id: 'R03', archetype: 'Rebel', text: 'I become energized when challenging an established system.' },
  { id: 'R04', archetype: 'Rebel', text: 'I would rather create my own method than follow a generic template.' },
  { id: 'R05', archetype: 'Rebel', text: 'I dislike being told what to do without a logical explanation.' },

  // Achievement (Hero)
  { id: 'H01', archetype: 'Hero', text: 'Difficult and intimidating goals deeply motivate me.' },
  { id: 'H02', archetype: 'Hero', text: 'I enjoy proving that I can accomplish hard things.' },
  { id: 'H03', archetype: 'Hero', text: 'Competition brings out my absolute best performance.' },
  { id: 'H04', archetype: 'Hero', text: 'I recover quickly after failure and come back stronger.' },
  { id: 'H05', archetype: 'Hero', text: 'I willingly take responsibility during high-stakes situations.' },

  // Knowledge (Sage)
  { id: 'SG01', archetype: 'Sage', text: 'I want to understand why things happen beneath the surface.' },
  { id: 'SG02', archetype: 'Sage', text: 'I enjoy learning even when there is no immediate practical benefit.' },
  { id: 'SG03', archetype: 'Sage', text: 'I question information and evidence before accepting it.' },
  { id: 'SG04', archetype: 'Sage', text: 'I would rather know the raw truth than hear something comforting.' },
  { id: 'SG05', archetype: 'Sage', text: 'Intellectual curiosity is a core part of my identity.' },

  // Transformation (Magician)
  { id: 'M01', archetype: 'Magician', text: 'I am fascinated by what truly motivates human behavior.' },
  { id: 'M02', archetype: 'Magician', text: 'I can often sense what someone really wants before they say it.' },
  { id: 'M03', archetype: 'Magician', text: 'I enjoy changing people\'s perspectives through strategic communication.' },
  { id: 'M04', archetype: 'Magician', text: 'I understand that changing perception can fundamentally change reality.' },
  { id: 'M05', archetype: 'Magician', text: 'I enjoy turning an ordinary interaction into something memorable.' },

  // Exploration (Explorer)
  { id: 'EX01', archetype: 'Explorer', text: 'Routine and predictability quickly become boring to me.' },
  { id: 'EX02', archetype: 'Explorer', text: 'New and unfamiliar experiences energize my mind.' },
  { id: 'EX03', archetype: 'Explorer', text: 'I would sacrifice some security for greater freedom and autonomy.' },
  { id: 'EX04', archetype: 'Explorer', text: 'I am comfortable entering completely unfamiliar social or professional environments.' },
  { id: 'EX05', archetype: 'Explorer', text: 'I would rather experiment than always choose the safe option.' },

  // Creation (Creator)
  { id: 'CR01', archetype: 'Creator', text: 'I feel a strong internal drive to express my unique individuality.' },
  { id: 'CR02', archetype: 'Creator', text: 'I frequently imagine solutions and ideas that do not yet exist.' },
  { id: 'CR03', archetype: 'Creator', text: 'Creating something tangible gives me deep satisfaction.' },
  { id: 'CR04', archetype: 'Creator', text: 'I notice aesthetic and structural details that others overlook.' },
  { id: 'CR05', archetype: 'Creator', text: 'I want my work to leave a distinct personal signature.' },

  // Care (Caregiver)
  { id: 'CA01', archetype: 'Caregiver', text: 'I naturally notice when someone around me needs help or support.' },
  { id: 'CA02', archetype: 'Caregiver', text: 'I feel protective when someone I care about is threatened or excluded.' },
  { id: 'CA03', archetype: 'Caregiver', text: 'People frequently come to me for emotional support and advice.' },
  { id: 'CA04', archetype: 'Caregiver', text: 'Loyalty and protecting my inner circle are paramount to me.' },
  { id: 'CA05', archetype: 'Caregiver', text: 'Helping someone succeed feels as rewarding as succeeding myself.' },

  // Social Connection (Diplomat)
  { id: 'D01', archetype: 'Diplomat', text: 'I can usually make people feel comfortable and valued around me.' },
  { id: 'D02', archetype: 'Diplomat', text: 'I quickly pick up on the emotional atmosphere of a room.' },
  { id: 'D03', archetype: 'Diplomat', text: 'I adapt my communication style seamlessly to different personalities.' },
  { id: 'D04', archetype: 'Diplomat', text: 'I am good at finding common ground between conflicting viewpoints.' },
  { id: 'D05', archetype: 'Diplomat', text: 'I naturally work to keep professional relationships harmonious.' },

  // Humour & Play (Jester)
  { id: 'J01', archetype: 'Jester', text: 'I use humor to lighten tense or uncomfortable situations.' },
  { id: 'J02', archetype: 'Jester', text: 'I become bored when conversations become overly rigid or serious.' },
  { id: 'J03', archetype: 'Jester', text: 'I often make people laugh spontaneously without overthinking it.' },
  { id: 'J04', archetype: 'Jester', text: 'I would rather be interesting and memorable than purely respectable.' },
  { id: 'J05', archetype: 'Jester', text: 'I can find levity and perspective in high-pressure situations.' },

  // Security (Guardian)
  { id: 'G01', archetype: 'Guardian', text: 'I prefer knowing what to expect before stepping into a scenario.' },
  { id: 'G02', archetype: 'Guardian', text: 'I notice potential risks and security flaws before others do.' },
  { id: 'G03', archetype: 'Guardian', text: 'I keep my promises and commitments even when inconvenient.' },
  { id: 'G04', archetype: 'Guardian', text: 'I value stability, reliability, and clear boundaries.' },
  { id: 'G05', archetype: 'Guardian', text: 'I would rather prevent a problem in advance than fix its fallout later.' }
];

// Archetype Combination Titles Mapping
export const COMBINATION_TITLES = {
  'Strategist+Magician+Sage': 'THE ARCHITECT',
  'Sovereign+Strategist': 'THE COMMANDER',
  'Sovereign+Rebel': 'THE REVOLUTIONARY LEADER',
  'Sovereign+Hero': 'THE CHAMPION',
  'Sovereign+Sage': 'THE PHILOSOPHER KING',
  'Sovereign+Magician': 'THE INFLUENCER',
  'Sovereign+Explorer': 'THE CONQUEROR',
  'Sovereign+Creator': 'THE VISIONARY',
  'Sovereign+Caregiver': 'THE PROTECTOR',
  'Sovereign+Diplomat': 'THE STATESMAN',
  'Sovereign+Jester': 'THE CHARISMATIC LEADER',
  'Sovereign+Guardian': 'THE PATRIARCH',
  'Strategist+Rebel': 'THE SYSTEM BREAKER',
  'Strategist+Hero': 'THE TACTICAL WARRIOR',
  'Strategist+Sage': 'THE ARCHITECT',
  'Strategist+Magician': 'THE PSYCHOLOGICAL STRATEGIST',
  'Strategist+Explorer': 'THE PIONEER',
  'Strategist+Creator': 'THE INVENTOR',
  'Strategist+Caregiver': 'THE PROBLEM SOLVER',
  'Strategist+Diplomat': 'THE NEGOTIATOR',
  'Strategist+Jester': 'THE TRICKSTER',
  'Strategist+Guardian': 'THE PLANNER',
  'Rebel+Hero': 'THE REVOLUTIONARY',
  'Rebel+Sage': 'THE CONTRARIAN',
  'Rebel+Magician': 'THE DISRUPTOR',
  'Rebel+Explorer': 'THE RENEGADE',
  'Rebel+Creator': 'THE RADICAL CREATOR',
  'Rebel+Caregiver': 'THE PROTECTOR OF THE OUTCAST',
  'Rebel+Diplomat': 'THE SOCIAL MAVERICK',
  'Rebel+Jester': 'THE PROVOCATEUR',
  'Rebel+Guardian': 'THE REFORMIST',
  'Hero+Sage': 'THE WARRIOR-PHILOSOPHER',
  'Hero+Magician': 'THE CATALYST',
  'Hero+Explorer': 'THE ADVENTURER',
  'Hero+Creator': 'THE VISIONARY BUILDER',
  'Hero+Caregiver': 'THE DEFENDER',
  'Hero+Diplomat': 'THE INSPIRATIONAL LEADER',
  'Hero+Jester': 'THE PERFORMER',
  'Hero+Guardian': 'THE DUTY-BOUND HERO',
  'Sage+Magician': 'THE ORACLE',
  'Sage+Explorer': 'THE SCHOLAR-EXPLORER',
  'Sage+Creator': 'THE PHILOSOPHER',
  'Sage+Caregiver': 'THE MENTOR',
  'Sage+Diplomat': 'THE COUNSELOR',
  'Sage+Jester': 'THE SATIRIST',
  'Sage+Guardian': 'THE ARCHIVIST',
  'Magician+Explorer': 'THE ALCHEMIST',
  'Magician+Creator': 'THE VISIONARY',
  'Magician+Caregiver': 'THE HEALER',
  'Magician+Diplomat': 'THE SOCIAL ALCHEMIST',
  'Magician+Jester': 'THE TRICKSTER',
  'Magician+Guardian': 'THE GATEKEEPER',
  'Explorer+Creator': 'THE ADVENTUROUS CREATOR',
  'Explorer+Caregiver': 'THE NOMADIC PROTECTOR',
  'Explorer+Diplomat': 'THE GLOBAL CONNECTOR',
  'Explorer+Jester': 'THE ADVENTURER',
  'Explorer+Guardian': 'THE INDEPENDENT GUARDIAN',
  'Creator+Caregiver': 'THE NURTURER',
  'Creator+Diplomat': 'THE SOCIAL ARTIST',
  'Creator+Jester': 'THE PERFORMER',
  'Creator+Guardian': 'THE TRADITIONAL INNOVATOR',
  'Caregiver+Diplomat': 'THE CONNECTOR',
  'Caregiver+Jester': 'THE EMOTIONAL UPLIFTER',
  'Caregiver+Guardian': 'THE PROTECTOR',
  'Diplomat+Jester': 'THE CHARMER',
  'Diplomat+Guardian': 'THE COMMUNITY BUILDER',
  'Jester+Guardian': 'THE LOYAL ENTERTAINER'
};

/**
 * Calculates raw score, percentage score, dominance classification,
 * influence profile, shadow profile, and counter-growth recommendation.
 */
export function calculateCharacterCodeResults(answers = {}) {
  // 1. Raw & Percentage Scores per Archetype
  const archetypeSums = {};
  const archetypeCounts = {};

  Object.keys(ARCHETYPES).forEach(k => {
    archetypeSums[k] = 0;
    archetypeCounts[k] = 0;
  });

  CHARACTER_CODE_QUESTIONS.forEach(q => {
    const val = Number(answers[q.id]) || 4; // Default 4 (Neutral)
    if (archetypeSums[q.archetype] !== undefined) {
      archetypeSums[q.archetype] += val;
      archetypeCounts[q.archetype] += 1;
    }
  });

  const scores = {};
  Object.keys(ARCHETYPES).forEach(k => {
    const count = archetypeCounts[k] || 5;
    const rawScore = archetypeSums[k];
    // Formula: % = ((RawScore - MinPossible) / (MaxPossible - MinPossible)) * 100
    const minPossible = count * 1;
    const maxPossible = count * 7;
    const pct = Math.round(((rawScore - minPossible) / (maxPossible - minPossible)) * 100);

    let classification = 'Dormant';
    if (pct >= 85) classification = 'Extreme';
    else if (pct >= 70) classification = 'Dominant';
    else if (pct >= 55) classification = 'Strong';
    else if (pct >= 40) classification = 'Moderate';
    else if (pct >= 25) classification = 'Low';

    scores[k] = {
      key: k,
      rawScore,
      pct: Math.min(100, Math.max(0, pct)),
      classification
    };
  });

  // Sort Archetypes by Score Descending
  const sortedStack = Object.values(scores).sort((a, b) => b.pct - a.pct);
  const primary = sortedStack[0];
  const secondary = sortedStack[1];
  const supporting = sortedStack[2];

  // 2. Character Name Generation
  const comboKey3 = `${primary.key}+${secondary.key}+${supporting.key}`;
  const comboKey2 = `${primary.key}+${secondary.key}`;
  const characterName = COMBINATION_TITLES[comboKey3] || COMBINATION_TITLES[comboKey2] || `THE ${primary.key.toUpperCase()} ${secondary.key.toUpperCase()}`;

  // 3. Influence Dimensions
  const powerScore = Math.round(((scores.Sovereign?.pct || 50) + (scores.Rebel?.pct || 50)) / 2);
  const credibilityScore = Math.round(((scores.Strategist?.pct || 50) + (scores.Sage?.pct || 50)) / 2);
  const warmthScore = Math.round(((scores.Caregiver?.pct || 50) + (scores.Diplomat?.pct || 50)) / 2);
  const charismaScore = Math.round(((scores.Magician?.pct || 50) + (scores.Jester?.pct || 50)) / 2);

  // 4. Growth Archetype Recommendation
  const primaryDetails = ARCHETYPES[primary.key] || ARCHETYPES.Strategist;
  const growthKey = primaryDetails.growthDirection || 'Diplomat';
  const growthDetails = ARCHETYPES[growthKey] || ARCHETYPES.Diplomat;

  return {
    primary,
    secondary,
    supporting,
    characterName,
    stack: sortedStack,
    influence: {
      power: powerScore,
      credibility: credibilityScore,
      warmth: warmthScore,
      charisma: charismaScore
    },
    primaryDetails,
    growthDetails,
    calculatedAt: new Date().toISOString()
  };
}
