import React, { useState } from 'react';
import { Layers, Terminal, Code2, ExternalLink, Cpu, Database, Check } from 'lucide-react';
import { projectShowcase } from '../data/courseData';

export default function ProjectShowcase() {
  const [selectedProjectId, setSelectedProjectId] = useState(projectShowcase[0].id);
  const activeProject = projectShowcase.find(p => p.id === selectedProjectId) || projectShowcase[0];

  return (
    <section id="projects" className="py-24 relative bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold uppercase tracking-wider border border-purple-500/20">
            <Layers className="w-4 h-4" /> Production Portfolio Capstones
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white">
            Build Real <span className="text-gradient">Production Products</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            No simple 'Hello World' examples. You will build enterprise-grade apps ready to feature on your resume.
          </p>
        </div>

        {/* Interactive Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {projectShowcase.map(proj => (
            <button
              key={proj.id}
              onClick={() => setSelectedProjectId(proj.id)}
              className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                selectedProjectId === proj.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-105'
                  : 'glass-card text-slate-400 hover:text-white hover:bg-slate-800/80 border-slate-800'
              }`}
            >
              {proj.title}
            </button>
          ))}
        </div>

        {/* Selected Project Card Display */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Image & Tech Pills */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl group">
              <img
                src={activeProject.image}
                alt={activeProject.title}
                className="w-full h-[280px] sm:h-[360px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-300 font-mono bg-slate-950/80 p-3 rounded-xl backdrop-blur-md border border-slate-800">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Terminal className="w-4 h-4" /> Live Codebase Included
                </span>
                <span>Production Ready</span>
              </div>
            </div>

            {/* Tech Stack Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {activeProject.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right Column: Project Details & Features */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{activeProject.category}</span>
              <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">{activeProject.title}</h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {activeProject.description}
              </p>
            </div>

            {/* Key Architectural Features */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Engineering Milestones</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Real-Time Async Event Loops & WebSocket State Syncing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Vector Database Indexing & Hybrid Cosine-BM25 Search</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Stripe Metered Billing & Authentication Middleware</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Docker Containerization & GitHub Actions CI/CD Pipeline</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <a
                href="#curriculum"
                className="inline-flex items-center gap-2 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Code2 className="w-4 h-4" /> Explore Code Architecture in Module 4 &rarr;
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
