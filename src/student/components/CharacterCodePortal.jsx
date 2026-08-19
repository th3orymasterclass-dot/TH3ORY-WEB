import React, { useState, useEffect } from 'react';
import {
  Sparkles, Zap, ShieldCheck, CheckCircle2, ChevronRight, ChevronLeft,
  RotateCcw, Award, Printer, Share2, Linkedin, Check, X, Flame, Compass,
  Eye, Cpu, ArrowRight, Lock, UserCheck, Target, Activity, RefreshCw, BookOpen,
  Crown, Scroll, Shield, Gem, Compass as CompassIcon, Feather, Feather as Wand
} from 'lucide-react';
import {
  ARCHETYPES,
  CHARACTER_CODE_QUESTIONS,
  calculateCharacterCodeResults
} from '../../data/characterCodeData';

// Collectible Internet Artifacts Definitions
const COLLECTIBLE_ARTIFACTS = [
  { id: 'crown', name: 'Crown of Sovereignty', icon: Crown, rarity: 'LEGENDARY', desc: 'Symbol of Executive Command & Authority' },
  { id: 'prism', name: 'Prism of Perception', icon: Gem, rarity: 'MYTHIC', desc: 'Magician\'s Crystal of Transformation' },
  { id: 'scroll', name: 'Scroll of the Architect', icon: Scroll, rarity: 'ANCIENT', desc: 'Strategist\'s Master System Blueprint' },
  { id: 'shield', name: 'Shield of the Guardian', icon: Shield, rarity: 'EPIC', desc: 'Fortress Emblem of Unshakeable Reliability' },
  { id: 'flame', name: 'Promethean Flame', icon: Flame, rarity: 'RARE', desc: 'Torch of Status-Quo Disruption' },
];

export default function CharacterCodePortal({ profile, themeMode = 'dark', completedLevelsCount = 0, onNavigate, onClose }) {
  const isLight = themeMode === 'light';
  const email = profile?.email || 'default';
  const storageKey = `th3ory_character_code_${email}`;

  // Portal State: 'loading' | 'quiz' | 'report'
  const [stage, setStage] = useState('loading');
  const [loadingPct, setLoadingPct] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing Character Psychology Matrix...');
  const [activeArtifactIdx, setActiveArtifactIdx] = useState(0);

  // Quiz State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState(() => {
    try {
      const raw = localStorage.getItem(`${storageKey}_answers`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  // Report State
  const [results, setResults] = useState(null);
  const [reportScreen, setReportScreen] = useState(1);
  const [copied, setCopied] = useState(false);
  const [showRetakeLockModal, setShowRetakeLockModal] = useState(false);

  // 1. Classic Animated Loading Simulation with Collectible Artifact Unlocks
  useEffect(() => {
    if (stage === 'loading') {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        if (progress <= 20) {
          setLoadingText('Initializing Character Psychology Matrix...');
          setActiveArtifactIdx(0);
        } else if (progress <= 40) {
          setLoadingText('Unlocking Relic #1: Crown of Sovereignty...');
          setActiveArtifactIdx(1);
        } else if (progress <= 60) {
          setLoadingText('Unlocking Relic #2: Prism of Perception...');
          setActiveArtifactIdx(2);
        } else if (progress <= 80) {
          setLoadingText('Unlocking Relic #3: Scroll of the Architect...');
          setActiveArtifactIdx(3);
        } else if (progress < 100) {
          setLoadingText('Synthesizing Character Artifacts & Growth Engine...');
          setActiveArtifactIdx(4);
        } else {
          setLoadingText('Access Granted. Welcome to THE CHARACTER CODE™.');
        }

        setLoadingPct(Math.min(100, progress));

        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            try {
              const savedResults = localStorage.getItem(`${storageKey}_results`);
              if (savedResults) {
                setResults(JSON.parse(savedResults));
                setStage('report');
              } else {
                setStage('quiz');
              }
            } catch {
              setStage('quiz');
            }
          }, 600);
        }
      }, 40);

      return () => clearInterval(interval);
    }
  }, [stage]);

  const currentQuestion = CHARACTER_CODE_QUESTIONS[currentQIndex];
  const totalQuestions = CHARACTER_CODE_QUESTIONS.length;

  const handleSelectScore = (score) => {
    const updated = { ...answers, [currentQuestion.id]: score };
    setAnswers(updated);
    try {
      localStorage.setItem(`${storageKey}_answers`, JSON.stringify(updated));
    } catch {}

    if (currentQIndex < totalQuestions - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      // Calculate final results with level completion snapshot
      const computed = calculateCharacterCodeResults(updated);
      const res = {
        ...computed,
        completedLevelAtTest: completedLevelsCount
      };
      setResults(res);
      try {
        localStorage.setItem(`${storageKey}_results`, JSON.stringify(res));
      } catch {}
      setStage('report');
      setReportScreen(1);
    }
  };

  const handleRetake = () => {
    // LEVEL-GATED RETAKE LOCK GUARD:
    // Retake is only permitted if current completed levels > completed levels at previous test time
    const testLevel = (results && results.completedLevelAtTest !== undefined) ? results.completedLevelAtTest : 0;
    if (completedLevelsCount <= testLevel) {
      setShowRetakeLockModal(true);
      return;
    }

    setAnswers({});
    setResults(null);
    setCurrentQIndex(0);
    try {
      localStorage.removeItem(`${storageKey}_answers`);
      localStorage.removeItem(`${storageKey}_results`);
    } catch {}
    setStage('quiz');
  };

  const handleShareReport = async () => {
    const shareText = `My Character Code result: ${results?.characterName} (${results?.primary.key} Dominant). Discover your character psychology at https://th3ory.online!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'THE CHARACTER CODE™ Assessment',
          text: shareText,
          url: window.location.origin
        });
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {}
  };

  const CurrentArtifactIcon = COLLECTIBLE_ARTIFACTS[activeArtifactIdx]?.icon || Crown;

  return (
    <div className="fixed inset-0 z-50 bg-[#090B10]/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="w-full max-w-4xl min-h-[600px] flex flex-col justify-between space-y-4 print:space-y-0 print:w-full font-serif">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between bg-[#0D1017] border border-amber-500/30 p-4 rounded-2xl print:hidden shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 border border-amber-300">
              <Crown className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-black text-white text-base tracking-widest flex items-center gap-2 font-serif uppercase">
                <span>THE CHARACTER CODE™</span>
                <span className="text-[10px] bg-amber-500/15 border border-amber-500/40 text-amber-400 font-extrabold px-2 py-0.5 rounded-full tracking-wider font-sans">
                  Royal Edition
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-sans">12-Archetype Character Psychology &amp; Influence Assessment</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {stage === 'report' && (
              <button
                onClick={handleRetake}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition-all border border-amber-500/30 font-sans"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* ── STAGE 1: CLASSIC ROYAL ANIMATED LOADING SCREEN ───────────────────────────── */}
        {stage === 'loading' && (
          <div className="flex-1 bg-gradient-to-b from-[#0B0D14] via-[#0D1017] to-[#08090E] border-2 border-amber-600/40 rounded-3xl p-8 sm:p-14 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl space-y-8 my-auto">
            {/* Corner Flourish Accents */}
            <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-amber-500/60 pointer-events-none" />
            <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-amber-500/60 pointer-events-none" />
            <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-amber-500/60 pointer-events-none" />
            <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-amber-500/60 pointer-events-none" />

            {/* Collectible Internet Artifact Display Box */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-amber-400/80 flex items-center justify-center shadow-2xl shadow-amber-500/40 animate-pulse">
                <CurrentArtifactIcon className="w-14 h-14 text-amber-400 animate-bounce" />
              </div>
              <Sparkles className="w-7 h-7 text-amber-300 absolute -top-3 -right-3 animate-spin" />
            </div>

            <div className="space-y-3 max-w-lg">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400 font-sans px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                UNLOCKED RELIC #{activeArtifactIdx + 1}: {COLLECTIBLE_ARTIFACTS[activeArtifactIdx].rarity}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-wider font-serif">
                {COLLECTIBLE_ARTIFACTS[activeArtifactIdx].name}
              </h2>
              <p className="text-xs sm:text-sm text-amber-300/90 font-mono font-semibold tracking-wide h-6">
                {loadingText}
              </p>
            </div>

            {/* Classic Progress Bar */}
            <div className="w-full max-w-md space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>CHARACTER SYNTHESIS</span>
                <span className="text-amber-400 font-bold">{loadingPct}%</span>
              </div>
              <div className="w-full h-3.5 bg-slate-950 border border-amber-500/30 rounded-full p-0.5 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 rounded-full transition-all duration-300 shadow-md shadow-amber-500/50"
                  style={{ width: `${loadingPct}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STAGE 2: INTERACTIVE QUESTIONNAIRE UI ───────────────────────────── */}
        {stage === 'quiz' && currentQuestion && (
          <div className="flex-1 bg-gradient-to-b from-[#0D1017] to-[#0A0C10] border-2 border-amber-500/30 rounded-3xl p-6 sm:p-10 flex flex-col justify-between space-y-6 shadow-2xl relative">
            {/* Top Progress Meter */}
            <div className="space-y-2 font-sans">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Activity className="w-4 h-4" />
                  <span>Statement {currentQIndex + 1} of {totalQuestions}</span>
                </span>
                <span>{Math.round(((currentQIndex + 1) / totalQuestions) * 100)}% Evaluated</span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-amber-500/20">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
                  style={{ width: `${((currentQIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="py-8 space-y-4 text-center">
              <span className="px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-[0.25em] font-sans">
                Behavioral Scale Assessment
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-white leading-relaxed max-w-2xl mx-auto font-serif tracking-tight">
                "{currentQuestion.text}"
              </h2>
            </div>

            {/* 1-7 Likert Scale Rating Buttons */}
            <div className="space-y-3 font-sans">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                <span>1 — Completely Unlike Me</span>
                <span>4 — Neutral</span>
                <span>7 — Extremely Like Me</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map(score => (
                  <button
                    key={score}
                    onClick={() => handleSelectScore(score)}
                    className="py-4 rounded-xl bg-slate-950 hover:bg-gradient-to-br hover:from-amber-400 hover:to-amber-600 hover:text-slate-950 border border-amber-500/30 text-amber-400 font-black text-lg transition-all active:scale-95 shadow-md flex flex-col items-center justify-center gap-1 group"
                  >
                    <span className="group-hover:text-slate-950">{score}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Back Button */}
            {currentQIndex > 0 && (
              <button
                onClick={() => setCurrentQIndex(prev => prev - 1)}
                className="self-start text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 font-bold pt-2 font-sans"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Statement
              </button>
            )}
          </div>
        )}

        {/* ── STAGE 3: 8-SCREEN INTERACTIVE REPORT VIEWER ───────────────────────────── */}
        {stage === 'report' && results && (
          <div className="flex-1 bg-gradient-to-b from-[#0B0D14] via-[#0D1017] to-[#08090E] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col justify-between space-y-6 relative">
            {/* Screen Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-amber-500/20 scrollbar-none print:hidden font-sans">
              {[
                { s: 1, name: '1. Identity' },
                { s: 2, name: '2. Stack' },
                { s: 3, name: '3. Drives' },
                { s: 4, name: '4. Influence' },
                { s: 5, name: '5. Shadow' },
                { s: 6, name: '6. Blind Spot' },
                { s: 7, name: '7. Evolution' },
                { s: 8, name: '8. Identity Relic Card' },
              ].map(tab => (
                <button
                  key={tab.s}
                  onClick={() => setReportScreen(tab.s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    reportScreen === tab.s
                      ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 text-slate-400 hover:text-amber-400 border border-slate-800'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* SCREEN 1: YOUR CHARACTER IS... */}
            {reportScreen === 1 && (
              <div className="text-center py-8 space-y-6 animate-in fade-in duration-300">
                <span className="text-xs font-black uppercase tracking-[0.35em] text-amber-400 font-sans">
                  Primary Character Profile
                </span>
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-serif uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500">
                  {results.characterName}
                </h1>
                <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-bold font-sans">
                  {results.primary.key} ({results.primary.pct}%) × {results.secondary.key} ({results.secondary.pct}%) × {results.supporting.key} ({results.supporting.pct}%)
                </div>
                <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                  {results.primaryDetails.description} You operate through high {results.primaryDetails.primaryStrength.toLowerCase()} and strategic {results.primaryDetails.influenceStyle.toLowerCase()}.
                </p>

                {/* Collectible Artifact Showcase */}
                <div className="pt-4 flex items-center justify-center gap-4">
                  <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-amber-500/30 flex items-center gap-3">
                    <Crown className="w-6 h-6 text-amber-400" />
                    <div className="text-left font-sans text-xs">
                      <span className="text-amber-400 font-black block text-[10px] uppercase">Unlocked Collectible</span>
                      <span className="text-white font-bold">{COLLECTIBLE_ARTIFACTS[0].name}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 2: CHARACTER STACK */}
            {reportScreen === 2 && (
              <div className="space-y-6 animate-in fade-in duration-300 font-sans">
                <div>
                  <h3 className="text-xl font-black text-white font-serif">Your Character Stack</h3>
                  <p className="text-xs text-slate-400">12 Archetypes Ranked by Behavioral Dominance</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                  {results.stack.map((item, idx) => (
                    <div key={item.key} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-white">{idx + 1}. {item.key}</span>
                        <span className="text-amber-400 font-extrabold">{item.pct}% ({item.classification})</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCREEN 3: CORE MOTIVATIONS & DRIVES */}
            {reportScreen === 3 && (
              <div className="space-y-6 animate-in fade-in duration-300 font-sans">
                <div>
                  <h3 className="text-xl font-black text-white font-serif">What Drives You?</h3>
                  <p className="text-xs text-slate-400">Top 3 Primary Behavioral Motivators</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[results.primary, results.secondary, results.supporting].map((arch, idx) => {
                    const info = ARCHETYPES[arch.key];
                    return (
                      <div key={arch.key} className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3">
                        <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                          Motivator #{idx + 1}
                        </span>
                        <h4 className="font-black text-lg text-white font-serif">{info.name}</h4>
                        <div className="text-xs space-y-1 text-slate-300">
                          <div><strong>Core Drive:</strong> {info.coreDrive}</div>
                          <div><strong>Core Need:</strong> {info.coreNeed}</div>
                          <div><strong>Core Fear:</strong> {info.coreFear}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SCREEN 4: SOCIAL INFLUENCE PROFILE */}
            {reportScreen === 4 && (
              <div className="space-y-6 animate-in fade-in duration-300 font-sans">
                <div>
                  <h3 className="text-xl font-black text-white font-serif">How Do You Influence?</h3>
                  <p className="text-xs text-slate-400">4 Core Dimensions of Social Power</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'POWER', val: results.influence.power, desc: 'Authority + Challenge' },
                    { label: 'CREDIBILITY', val: results.influence.credibility, desc: 'Knowledge + Competence' },
                    { label: 'WARMTH', val: results.influence.warmth, desc: 'Understanding + Comfort' },
                    { label: 'CHARISMA', val: results.influence.charisma, desc: 'Emotion + Enjoyment' },
                  ].map(dim => (
                    <div key={dim.label} className="p-4 rounded-2xl bg-slate-950 border border-amber-500/20 text-center space-y-2">
                      <span className="text-xs font-black text-amber-400">{dim.label}</span>
                      <div className="text-3xl font-black text-white font-serif">{dim.val}%</div>
                      <p className="text-[10px] text-slate-500">{dim.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCREEN 5: STRESS & SHADOW */}
            {reportScreen === 5 && (
              <div className="space-y-6 animate-in fade-in duration-300 font-sans">
                <div>
                  <h3 className="text-xl font-black text-white font-serif">Who Are You Under Pressure?</h3>
                  <p className="text-xs text-slate-400">Shadow Tendencies Under High Stress</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-950 border border-rose-500/40 space-y-3">
                  <span className="text-xs font-black uppercase text-rose-400 tracking-wider">
                    Primary Shadow Pattern
                  </span>
                  <h4 className="text-2xl font-black text-white font-serif">{results.primaryDetails.shadow}</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    When under sustained pressure or feeling {results.primaryDetails.coreFear.toLowerCase()}, your primary strength ({results.primaryDetails.primaryStrength.toLowerCase()}) can invert into <strong>{results.primaryDetails.shadow}</strong> ({results.primaryDetails.unbalanced}).
                  </p>
                </div>
              </div>
            )}

            {/* SCREEN 6: BLIND SPOT */}
            {reportScreen === 6 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-xl font-black text-white font-serif">Your Psychological Blind Spot</h3>
                  <p className="text-xs text-slate-400 font-sans">Provocative Self-Awareness Insight</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4 text-center">
                  <Eye className="w-10 h-10 text-amber-400 mx-auto" />
                  <h4 className="text-lg font-bold text-white max-w-xl mx-auto leading-relaxed font-serif">
                    "{results.primaryDetails.blindSpot}"
                  </h4>
                </div>
              </div>
            )}

            {/* SCREEN 7: NEXT EVOLUTION */}
            {reportScreen === 7 && (
              <div className="space-y-6 animate-in fade-in duration-300 font-sans">
                <div>
                  <h3 className="text-xl font-black text-white font-serif">Your Counter-Growth Evolution</h3>
                  <p className="text-xs text-slate-400">Recommended Growth Direction</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-950 border border-green-500/40 space-y-3">
                  <span className="text-xs font-black uppercase text-green-400 tracking-wider">
                    Target Evolution: {results.growthDetails.name}
                  </span>
                  <h4 className="text-2xl font-black text-white font-serif">Integrate {results.growthDetails.primaryStrength}</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    To counterbalance the shadow of {results.primaryDetails.key}, focus on developing <strong>{results.growthDetails.name}</strong> traits: {results.growthDetails.description}
                  </p>
                </div>
              </div>
            )}

            {/* SCREEN 8: COMPLETE GILDED IDENTITY RELIC CARD */}
            {reportScreen === 8 && (
              <div className="space-y-6 animate-in fade-in duration-300 font-sans">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white font-serif">Gilded Collectible Relic Card</h3>
                    <p className="text-xs text-slate-400">Official Character Architecture Artifact</p>
                  </div>
                  <button
                    onClick={handleShareReport}
                    className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black text-xs uppercase rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Share Result'}</span>
                  </button>
                </div>

                {/* Gilded Metallic Foil Card */}
                <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-[#0E1118] to-slate-950 border-4 border-double border-amber-500/60 space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
                    <div className="flex items-center gap-2">
                      <Crown className="w-6 h-6 text-amber-400" />
                      <span className="text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
                        IDENTITY: {profile?.name || 'Valued Graduate'}
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest border border-amber-500/40 px-2.5 py-0.5 rounded-full">
                      LIMITED ARTIFACT #1
                    </span>
                  </div>

                  <div className="text-center py-4 space-y-2">
                    <h2 className="text-3xl sm:text-5xl font-black text-white font-serif uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-500">
                      {results.characterName}
                    </h2>
                    <p className="text-xs text-slate-300">
                      {results.primary.key} ({results.primary.pct}%) × {results.secondary.key} ({results.secondary.pct}%)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs border-t border-amber-500/30 pt-4">
                    <div><span className="text-slate-400 block font-bold">Superpower:</span> <strong className="text-white font-serif">{results.primaryDetails.superpower}</strong></div>
                    <div><span className="text-slate-400 block font-bold">Growth Direction:</span> <strong className="text-amber-300 font-serif">{results.growthDetails.name}</strong></div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Screen Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-amber-500/20 print:hidden font-sans">
              <button
                disabled={reportScreen === 1}
                onClick={() => setReportScreen(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Screen
              </button>

              <span className="text-xs font-mono text-slate-500">Screen {reportScreen} of 8</span>

              <button
                disabled={reportScreen === 8}
                onClick={() => setReportScreen(prev => Math.min(8, prev + 1))}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-black text-xs uppercase disabled:opacity-40 flex items-center gap-1 shadow-md"
              >
                Next Screen <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* LEVEL COMPLETION REQUIRED RETAKE LOCK MODAL */}
        {showRetakeLockModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 print:hidden">
            <div className="bg-[#0D1017] border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6 relative overflow-hidden font-sans">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
                <Lock className="w-8 h-8 text-amber-400" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">
                  Level Gated Assessment
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-serif">
                  Complete Next Level to Unlock Retake
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  You have already unlocked your current Character Code profile for Level {results?.completedLevelAtTest || 0}. To re-evaluate your character evolution, you must complete the next level of the TH3ORY Masterclass video course first.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    setShowRetakeLockModal(false);
                    if (onNavigate) onNavigate('course');
                  }}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Continue Video Course</span>
                </button>

                <button
                  onClick={() => setShowRetakeLockModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Current Character Report</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
