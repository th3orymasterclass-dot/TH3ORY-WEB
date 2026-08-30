import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Plus, Trash2, Check, RotateCcw, ShieldCheck, 
  MapPin, Calendar, Users, Sparkles, Image as ImageIcon, ExternalLink, MoveUp, MoveDown 
} from 'lucide-react';
import { offlineTrainings as defaultTrainings } from '../../data/courseData';

export default function OfflineTrainingsPanel({ data, save, reset, themeMode = 'dark' }) {
  const isDark = themeMode === 'dark';
  const initial = data?.offlineTrainings || defaultTrainings;

  const [trainings, setTrainings] = useState(initial);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (data?.offlineTrainings) {
      setTrainings(data.offlineTrainings);
    }
  }, [data?.offlineTrainings]);

  const updateCard = (index, field, val) => {
    const next = [...trainings];
    next[index] = { ...next[index], [field]: val };
    setTrainings(next);
  };

  const updateTags = (index, tagsStr) => {
    const tagsArr = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    const next = [...trainings];
    next[index] = { ...next[index], tags: tagsArr };
    setTrainings(next);
  };

  const addTraining = () => {
    const next = [
      ...trainings,
      {
        id: `training-${Date.now()}`,
        title: "New Campus or Institutional Workshop",
        subtitle: "Keynote & Practical Behavioral Psychology Lab",
        location: "University Campus, City",
        date: "Offline Bootcamp",
        badge: "Campus Masterclass",
        image: "/trainings/training-1.jpg",
        attendees: "250+ Attendees",
        tags: ["Body Language", "Cognitive Focus", "Stage Presence"],
        description: "Overview of the offline training session, key psychological concepts demonstrated, and feedback from participating students and faculty."
      }
    ];
    setTrainings(next);
  };

  const removeTraining = (index) => {
    if (window.confirm('Are you sure you want to remove this offline training card?')) {
      setTrainings(trainings.filter((_, i) => i !== index));
    }
  };

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= trainings.length) return;
    const next = [...trainings];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setTrainings(next);
  };

  const handleSave = () => {
    save('offlineTrainings', trainings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset Offline Trainings Marquee to default 5 sessions?')) {
      reset('offlineTrainings');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-violet-500/10 text-violet-400 text-xs font-bold uppercase tracking-wider mb-2">
              <GraduationCap className="w-3.5 h-3.5" /> Offline Trainings Marquee
            </div>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Previous Offline Trainings
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Manage the moving marquee cards, photos, session stories, and attendee counts shown above the review section.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved Live!' : 'Save Marquee'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Active Training Sessions: <strong className="text-violet-400">{trainings.length}</strong>
        </span>

        <button
          onClick={addTraining}
          className="px-4 py-2 rounded-xl bg-violet-600/20 text-violet-300 border border-violet-500/40 text-xs font-bold hover:bg-violet-600/30 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Training Card
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-6">
        {trainings.map((item, idx) => (
          <div
            key={item.id || idx}
            className={`p-6 rounded-2xl border space-y-4 ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            {/* Card Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-violet-500/20 text-violet-400 font-mono text-xs font-bold">
                  SLIDE #{idx + 1}
                </span>
                <span className="text-xs font-bold text-amber-400">
                  {item.badge}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                  title="Move Up"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => move(idx, 1)}
                  disabled={idx === trainings.length - 1}
                  className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                  title="Move Down"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => removeTraining(idx)}
                  className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors ml-1"
                  title="Delete Card"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Card Content Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Photo Preview & Path */}
              <div className="md:col-span-4 space-y-3">
                <label className={`block text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Training Photo Preview
                </label>
                <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-video bg-black/40">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/trainings/training-1.jpg'; }}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Image Path or URL
                  </label>
                  <input
                    type="text"
                    value={item.image || ''}
                    onChange={e => updateCard(idx, 'image', e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => updateCard(idx, 'image', `/trainings/training-${n}.jpg`)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-violet-600 text-[10px] text-slate-300 hover:text-white transition-colors"
                      >
                        Preset #{n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text Meta Fields */}
              <div className="md:col-span-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Institution / Venue Title
                    </label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={e => updateCard(idx, 'title', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-bold ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Badge (e.g. Medical College Masterclass)
                    </label>
                    <input
                      type="text"
                      value={item.badge || ''}
                      onChange={e => updateCard(idx, 'badge', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-bold text-amber-400 ${
                        isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Subtitle / Event Name
                  </label>
                  <input
                    type="text"
                    value={item.subtitle || ''}
                    onChange={e => updateCard(idx, 'subtitle', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-xs font-medium ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Location (City, State)
                    </label>
                    <input
                      type="text"
                      value={item.location || ''}
                      onChange={e => updateCard(idx, 'location', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-xs ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Date / Occasion
                    </label>
                    <input
                      type="text"
                      value={item.date || ''}
                      onChange={e => updateCard(idx, 'date', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-xs ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Attendees (e.g. 350+ Med Students)
                    </label>
                    <input
                      type="text"
                      value={item.attendees || ''}
                      onChange={e => updateCard(idx, 'attendees', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-xs font-bold text-violet-400 ${
                        isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Session Story / Description (Shown in Lightbox Modal)
                  </label>
                  <textarea
                    rows={2}
                    value={item.description || ''}
                    onChange={e => updateCard(idx, 'description', e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-xs leading-relaxed ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Pillar Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={(item.tags || []).join(', ')}
                    onChange={e => updateTags(idx, e.target.value)}
                    placeholder="e.g. Cognitive Wellness, Empathy, Focus Mastery"
                    className={`w-full px-3 py-2 rounded-lg border text-xs ${
                      isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-800'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
