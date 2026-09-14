import React, { useState, useEffect } from 'react';
import {
  Code, Terminal, Copy, Check, Play, Download, ExternalLink,
  Maximize2, Minimize2, RotateCcw, FileCode, Braces, ChevronDown,
  ChevronUp, Sparkles, Laptop, ShieldCheck
} from 'lucide-react';

const CODE_TEMPLATES = {
  behavioral_script: {
    name: 'Behavioral Calibration Script',
    lang: 'javascript',
    code: `// TH3ORY Behavioral Analysis & Influence Script
// Module Calibration Exercise

function analyzeInteraction(clientStatus, verbalResonance) {
  const presenceThreshold = 0.85;
  const rapportIndex = (clientStatus * 0.4) + (verbalResonance * 0.6);
  
  return {
    status: rapportIndex >= presenceThreshold ? 'Commanding Authority' : 'Recalibrate Gaze & Tonality',
    score: Math.round(rapportIndex * 100),
    actionItem: 'Hold 3-second strategic pause before delivering key proposal terms.'
  };
}

// Execute evaluation
const result = analyzeInteraction(0.92, 0.88);
console.log('[Calibration Matrix]:', result);
`
  },
  executive_framework: {
    name: 'Executive Speech Architecture (Markdown)',
    lang: 'markdown',
    code: `# Executive Presence & Value Pitch Matrix
## 30-Second Framing Blueprint

1. **The Hook (First 6 Seconds)**:
   - "Every high-stakes decision comes down to trust before logic."

2. **The Contrast (Next 12 Seconds)**:
   - Current friction: Silos, hesitation, and cognitive fatigue.
   - Proposed transformation: Unshakeable non-verbal certainty.

3. **The Call to Decision (Final 12 Seconds)**:
   - Deliver with 20% slower vocal cadence.
   - Anchor silence: Maintain eye gaze without nervous fidgets.
`
  },
  experiment_json: {
    name: 'Cognitive Experiment Logger (JSON)',
    lang: 'json',
    code: `{
  "experimentId": "EXP-PRESENCE-01",
  "module": "Day 01 - First Impressions",
  "metrics": {
    "postureStability": 94,
    "vocalResonanceHz": 120,
    "fidgetCount": 0,
    "pauseDurationSeconds": 2.5
  },
  "outcome": "Complete conversational framing buy-in achieved within 7 seconds."
}
`
  }
};

export default function VSCodeModule({ lessonId, lessonTitle, isLight }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState('behavioral_script');
  const [editorMode, setEditorMode] = useState('embedded'); // 'embedded' | 'vscode_web'
  const [code, setCode] = useState(() => {
    try {
      const saved = localStorage.getItem(`th3ory_vscode_${lessonId}`);
      return saved || CODE_TEMPLATES.behavioral_script.code;
    } catch {
      return CODE_TEMPLATES.behavioral_script.code;
    }
  });
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync saved code when lessonId changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`th3ory_vscode_${lessonId}`);
      if (saved) {
        setCode(saved);
      } else {
        setCode(CODE_TEMPLATES[activeTemplate]?.code || CODE_TEMPLATES.behavioral_script.code);
      }
    } catch {}
    setOutput('');
  }, [lessonId]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    try {
      localStorage.setItem(`th3ory_vscode_${lessonId}`, newCode);
    } catch {}
  };

  const handleSelectTemplate = (templateKey) => {
    setActiveTemplate(templateKey);
    const newCode = CODE_TEMPLATES[templateKey]?.code || '';
    handleCodeChange(newCode);
    setOutput('');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCode = () => {
    try {
      const logs = [];
      const customConsole = {
        log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
        warn: (...args) => logs.push('[WARN] ' + args.join(' ')),
        error: (...args) => logs.push('[ERROR] ' + args.join(' '))
      };
      
      const runner = new Function('console', code);
      runner(customConsole);
      
      setOutput(logs.length > 0 ? logs.join('\n') : '// Script executed successfully with 0 output logs.');
    } catch (err) {
      setOutput(`[Syntax/Runtime Error]: ${err.message}`);
    }
  };

  const handleDownloadCode = () => {
    const ext = activeTemplate === 'executive_framework' ? 'md' : activeTemplate === 'experiment_json' ? 'json' : 'js';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TH3ORY_${lessonId || 'module'}_script.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900 border-slate-800'
    } ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : ''}`}>
      {/* Header Bar */}
      <div className={`p-4 sm:p-5 flex items-center justify-between gap-3 border-b ${
        isLight ? 'border-slate-200 bg-slate-50/80' : 'border-slate-800/80 bg-slate-950/40'
      }`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#007acc]/15 border border-[#007acc]/30 flex items-center justify-center text-[#007acc] shrink-0 shadow-sm shadow-[#007acc]/20">
            <Code className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`font-black text-sm sm:text-base tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Visual Studio Code — Module Lab
              </h4>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#007acc]/15 text-[#007acc] border border-[#007acc]/30">
                IDE Workspace
              </span>
            </div>
            <p className={`text-xs truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Write, test behavioral scripts, and document executive protocols for this module
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://vscode.dev"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold text-[#007acc] border-[#007acc]/30 bg-[#007acc]/10 hover:bg-[#007acc]/20 transition-all"
            title="Launch official VS Code Web"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Launch vscode.dev
          </a>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isOpen
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-500'
                : isLight
                ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isOpen ? (
              <>
                <ChevronUp className="w-4 h-4" /> Collapse Editor
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> Open Editor
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {isOpen && (
        <div className={`p-4 sm:p-5 flex flex-col gap-4 ${isFullscreen ? 'flex-1 overflow-y-auto' : ''}`}>
          {/* Editor Mode & Template Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-slate-800/40">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setEditorMode('embedded')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  editorMode === 'embedded'
                    ? 'bg-[#007acc] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                In-App Code Lab
              </button>
              <button
                onClick={() => setEditorMode('vscode_web')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  editorMode === 'vscode_web'
                    ? 'bg-[#007acc] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" /> VS Code Web
              </button>
            </div>

            {/* Template Selector */}
            {editorMode === 'embedded' && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Template:</span>
                {Object.entries(CODE_TEMPLATES).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => handleSelectTemplate(key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      activeTemplate === key
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-500 font-bold'
                        : isLight
                        ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all"
                title="Copy Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleDownloadCode}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all"
                title="Download Script File"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Active View */}
          {editorMode === 'vscode_web' ? (
            <div className="w-full rounded-xl overflow-hidden border border-[#007acc]/30 h-[450px] relative bg-slate-950">
              <div className="bg-[#007acc]/20 px-3 py-1.5 border-b border-[#007acc]/30 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Code className="w-3.5 h-3.5 text-[#007acc]" /> Microsoft Visual Studio Code Web Environment
                </span>
                <a
                  href="https://vscode.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:text-amber-300 text-[11px] font-bold flex items-center gap-1"
                >
                  Open in New Window <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <iframe
                src="https://vscode.dev"
                title="Visual Studio Code Web"
                className="w-full h-[calc(100%-32px)] border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* VS Code Dark Editor Pane */}
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#1e1e1e] font-mono text-xs shadow-inner">
                {/* Editor Title Bar */}
                <div className="bg-[#252526] px-4 py-2 border-b border-[#333333] flex items-center justify-between text-[11px] text-slate-400 select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    <span className="ml-2 text-slate-300 font-semibold truncate max-w-[200px]">
                      {lessonId || 'module'}_script.{activeTemplate === 'executive_framework' ? 'md' : activeTemplate === 'experiment_json' ? 'json' : 'js'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunCode}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-all shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current" /> Run Script
                    </button>
                    <button
                      onClick={() => handleSelectTemplate(activeTemplate)}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-all"
                      title="Reset Template"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                </div>

                {/* Editor Textarea */}
                <textarea
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  spellCheck="false"
                  rows={isFullscreen ? 18 : 11}
                  className="w-full bg-[#1e1e1e] text-[#d4d4d4] p-4 font-mono text-xs focus:outline-none resize-none leading-relaxed border-0 selection:bg-[#264f78]"
                />

                {/* Status Bar */}
                <div className="bg-[#007acc] text-white px-3 py-1 text-[10px] flex items-center justify-between font-mono select-none">
                  <span className="flex items-center gap-2">
                    <Code className="w-3 h-3" /> Visual Studio Code Engine
                  </span>
                  <span>UTF-8 • {activeTemplate === 'executive_framework' ? 'Markdown' : activeTemplate === 'experiment_json' ? 'JSON' : 'JavaScript'}</span>
                </div>
              </div>

              {/* Console Output Window */}
              {output && (
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] font-mono text-xs">
                  <div className="bg-slate-900/90 px-3 py-1.5 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <Terminal className="w-3.5 h-3.5" /> Output Console
                    </span>
                    <button
                      onClick={() => setOutput('')}
                      className="text-slate-500 hover:text-slate-300 text-[10px]"
                    >
                      Clear
                    </button>
                  </div>
                  <pre className="p-3 text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed text-[11px]">
                    {output}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
