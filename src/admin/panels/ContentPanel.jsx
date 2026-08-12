import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Save, Plus, Trash2, Edit3, X, Upload, Link2, Search,
  Play, FileText, Image, Music, Archive, BookOpen, HelpCircle,
  CheckCircle2, Clock, Eye, EyeOff, Download, Filter,
  AlertCircle, Video, File, ChevronDown, Tag, Lock, Unlock,
  FolderOpen, Grid, List, Layers, ExternalLink
} from 'lucide-react';
import { saveCourseContentToSupabase, deleteCourseContentFromSupabase } from '../../services/supabaseService';

// ─── Content type config ───────────────────────────────────────────────────────
const CONTENT_TYPES = [
  { id: 'video',     label: 'Video Lesson',    icon: Video,    color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30'   },
  { id: 'pdf',       label: 'PDF / Document',  icon: FileText, color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30'    },
  { id: 'worksheet', label: 'Worksheet',       icon: Edit3,    color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30'  },
  { id: 'quiz',      label: 'Quiz / Test',     icon: HelpCircle, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { id: 'audio',     label: 'Audio',           icon: Music,    color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/30'   },
  { id: 'image',     label: 'Image / Graphic', icon: Image,    color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30'   },
  { id: 'resource',  label: 'Resource / Link', icon: Link2,    color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30'  },
  { id: 'archive',   label: 'ZIP / Archive',   icon: Archive,  color: 'text-slate-400',  bg: 'bg-slate-500/10',  border: 'border-slate-500/30'  },
];

const ACCESS_TYPES = [
  { id: 'free',     label: 'Free Preview', icon: Unlock, color: 'text-green-400' },
  { id: 'enrolled', label: 'Enrolled Only', icon: Lock,   color: 'text-amber-400' },
  { id: 'vip',      label: 'VIP Only',      icon: Lock,   color: 'text-purple-400' },
];

const BLANK_ITEM = {
  id: '', title: '', type: 'video', description: '', url: '',
  fileName: '', fileSize: '', duration: '', access: 'enrolled',
  levelId: '', lessonId: '', tags: [], published: true,
  uploadedAt: null, thumbnail: '',
};

function getTypeConfig(typeId) {
  return CONTENT_TYPES.find(t => t.id === typeId) || CONTENT_TYPES[0];
}

// ─── File size formatter ───────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ─── Content Card ─────────────────────────────────────────────────────────────
function ContentCard({ item, onEdit, onDelete, onTogglePublish, viewMode }) {
  const tc = getTypeConfig(item.type);
  const Icon = tc.icon;
  const accessConf = ACCESS_TYPES.find(a => a.id === item.access) || ACCESS_TYPES[0];
  const AccessIcon = accessConf.icon;

  if (viewMode === 'list') {
    return (
      <div className={`flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all ${!item.published ? 'opacity-60' : ''}`}>
        <div className={`w-10 h-10 rounded-xl ${tc.bg} border ${tc.border} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${tc.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white font-semibold text-sm truncate">{item.title || 'Untitled'}</p>
            {!item.published && <span className="text-xs bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">Draft</span>}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className={`text-xs font-medium ${tc.color}`}>{tc.label}</span>
            {item.duration && <span className="text-slate-500 text-xs flex items-center gap-1"><Clock className="w-3 h-3"/>{item.duration}</span>}
            {item.fileSize && <span className="text-slate-500 text-xs">{item.fileSize}</span>}
            {item.levelId && <span className="text-slate-600 text-xs">Level: {item.levelId}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs ${accessConf.color} flex items-center gap-1`}>
            <AccessIcon className="w-3 h-3" />{accessConf.label}
          </span>
          <button onClick={() => onTogglePublish(item.id)} className={`p-1.5 rounded-lg transition-colors ${item.published ? 'text-green-400 hover:bg-green-950/30' : 'text-slate-500 hover:bg-slate-800'}`}>
            {item.published ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}
          </button>
          <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"><Edit3 className="w-4 h-4"/></button>
          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg text-red-500/50 hover:text-red-400 hover:bg-red-950/30 transition-colors"><Trash2 className="w-4 h-4"/></button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all group ${!item.published ? 'opacity-60' : ''}`}>
      {/* Thumbnail / type indicator */}
      <div className={`h-36 ${tc.bg} relative flex items-center justify-center`}>
        {item.thumbnail ? (
          <img src={item.thumbnail} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
        ) : (
          <Icon className={`w-12 h-12 ${tc.color} opacity-40`} />
        )}
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button onClick={() => onEdit(item)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"><Edit3 className="w-4 h-4"/></button>
          <button onClick={() => onDelete(item.id)} className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"><Trash2 className="w-4 h-4"/></button>
        </div>
        {/* Status badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tc.bg} ${tc.border} ${tc.color}`}>{tc.label}</span>
          {!item.published && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700">Draft</span>}
        </div>
        <div className="absolute top-2 right-2">
          <button onClick={() => onTogglePublish(item.id)} className={`p-1 rounded-lg transition-colors ${item.published ? 'text-green-400' : 'text-slate-500'}`}>
            {item.published ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}
          </button>
        </div>
        {item.duration && (
          <div className="absolute bottom-2 right-2 bg-slate-950/80 rounded px-1.5 py-0.5 text-white text-xs font-mono">{item.duration}</div>
        )}
      </div>
      {/* Info */}
      <div className="p-4">
        <p className="text-white font-semibold text-sm line-clamp-1 mb-1">{item.title || 'Untitled'}</p>
        {item.description && <p className="text-slate-500 text-xs line-clamp-2 mb-2">{item.description}</p>}
        <div className="flex items-center justify-between">
          <span className={`text-xs flex items-center gap-1 ${accessConf.color}`}>
            <AccessIcon className="w-3 h-3"/>{accessConf.label}
          </span>
          {item.fileSize && <span className="text-slate-600 text-xs">{item.fileSize}</span>}
          {item.levelId && <span className="text-slate-600 text-xs">L{item.levelId}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Content Edit Modal ────────────────────────────────────────────────────────
function ContentModal({ item, levels, onSave, onClose }) {
  const [form, setForm] = useState({ ...BLANK_ITEM, ...item });
  const [urlMode, setUrlMode] = useState(!item?.fileName); // url or file upload
  const fileRef = useRef();

  const up = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm(f => ({
      ...f,
      url,
      fileName: file.name,
      fileSize: formatBytes(file.size),
      title: f.title || file.name.replace(/\.[^/.]+$/, ''),
      // Auto-detect type
      type: file.type.startsWith('video/') ? 'video'
          : file.type === 'application/pdf' ? 'pdf'
          : file.type.startsWith('audio/') ? 'audio'
          : file.type.startsWith('image/') ? 'image'
          : file.name.endsWith('.zip') ? 'archive'
          : f.type,
    }));
    setUrlMode(false);
  };

  const handleSave = () => {
    if (!form.title.trim()) return alert('Please enter a title.');
    if (!form.url.trim()) return alert('Please add a URL or upload a file.');
    onSave({
      ...form,
      id: form.id || `c_${Date.now()}`,
      uploadedAt: form.uploadedAt || new Date().toISOString(),
    });
  };

  const tc = getTypeConfig(form.type);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${tc.bg} border ${tc.border} flex items-center justify-center`}>
              <tc.icon className={`w-5 h-5 ${tc.color}`} />
            </div>
            <div>
              <h3 className="text-white font-bold">{form.id ? 'Edit Content' : 'Add Content'}</h3>
              <p className="text-slate-500 text-xs">{form.id || 'New item'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1 rounded-lg transition-colors"><X className="w-5 h-5"/></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Type selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Content Type</label>
            <div className="grid grid-cols-4 gap-2">
              {CONTENT_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => up('type', t.id)}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${form.type === t.id ? `${t.bg} ${t.border} ${t.color}` : 'bg-slate-950 border-slate-700 text-slate-500 hover:border-slate-600'}`}
                >
                  <t.icon className="w-4 h-4"/>
                  <span className="text-center leading-tight">{t.label.split('/')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Title *</label>
            <input value={form.title} onChange={e => up('title', e.target.value)}
              placeholder="e.g. Day 01: Neuroscience of First Impressions"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
            <textarea rows={2} value={form.description} onChange={e => up('description', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60 resize-none" />
          </div>

          {/* URL / File upload toggle */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Source *</label>
              <div className="ml-auto flex gap-1 bg-slate-950 border border-slate-700 rounded-lg p-0.5">
                <button onClick={() => setUrlMode(true)} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${urlMode ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>
                  <span className="flex items-center gap-1.5"><Link2 className="w-3 h-3"/>URL / Link</span>
                </button>
                <button onClick={() => setUrlMode(false)} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${!urlMode ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>
                  <span className="flex items-center gap-1.5"><Upload className="w-3 h-3"/>Upload File</span>
                </button>
              </div>
            </div>

            {urlMode ? (
              <input value={form.url} onChange={e => up('url', e.target.value)}
                placeholder="https://youtube.com/embed/... or https://drive.google.com/..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60 font-mono" />
            ) : (
              <div>
                <input type="file" ref={fileRef} onChange={handleFile} className="hidden"
                  accept="video/*,audio/*,image/*,.pdf,.zip,.docx,.pptx,.xlsx" />
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-6 text-center cursor-pointer transition-all group"
                >
                  {form.fileName ? (
                    <div className="space-y-1">
                      <p className="text-white font-medium text-sm">{form.fileName}</p>
                      <p className="text-slate-500 text-xs">{form.fileSize}</p>
                      <p className="text-amber-400 text-xs mt-2">Click to replace</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-slate-600 mx-auto group-hover:text-amber-400 transition-colors" />
                      <p className="text-slate-400 text-sm font-medium">Click to upload file</p>
                      <p className="text-slate-600 text-xs">Video, PDF, Audio, Image, ZIP, DOCX, PPTX</p>
                    </div>
                  )}
                </div>
                {form.fileName && (
                  <div className="mt-2 flex items-center gap-2 bg-amber-950/20 border border-amber-500/20 rounded-xl px-4 py-3 text-xs text-amber-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>File URL is temporary (browser session only). For permanent hosting, use a URL link to Google Drive, Dropbox, or your CDN instead.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Thumbnail Image URL</label>
            <input value={form.thumbnail} onChange={e => up('thumbnail', e.target.value)}
              placeholder="https://... (optional preview image)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60 font-mono" />
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Duration</label>
              <input value={form.duration} onChange={e => up('duration', e.target.value)}
                placeholder="e.g. 20 mins or 1:25:00"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Access Level</label>
              <select value={form.access} onChange={e => up('access', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60">
                {ACCESS_TYPES.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>
          </div>

          {/* Assignment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Assign to Level</label>
              <select value={form.levelId} onChange={e => up('levelId', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60">
                <option value="">— Unassigned —</option>
                {(levels ?? []).map(l => (
                  <option key={l.id} value={l.id}>{l.levelNumber}: {l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Assign to Lesson</label>
              <select value={form.lessonId} onChange={e => up('lessonId', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60">
                <option value="">— Unassigned —</option>
                {(levels ?? []).find(l => l.id === form.levelId)?.lessons?.map(ls => (
                  <option key={ls.id} value={ls.id}>{ls.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tags (comma separated)</label>
            <input
              value={(form.tags ?? []).join(', ')}
              onChange={e => up('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
              placeholder="e.g. presence, body-language, capstone"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60"
            />
          </div>

          {/* Published toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <p className="text-white text-sm font-semibold">Published</p>
              <p className="text-slate-500 text-xs">Visible to enrolled students</p>
            </div>
            <button
              onClick={() => up('published', !form.published)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.published ? 'bg-amber-500' : 'bg-slate-700'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.published ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-5 border-t border-slate-800">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-sm font-medium transition-all">Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> {form.id ? 'Update Content' : 'Add Content'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Assignment View — content grouped by level ────────────────────────────────
function AssignmentView({ content, levels }) {
  const unassigned = content.filter(c => !c.levelId);

  return (
    <div className="space-y-6">
      {levels.map(level => {
        const levelContent = content.filter(c => c.levelId === level.id);
        if (levelContent.length === 0) return null;
        return (
          <div key={level.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-3">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white text-sm">{level.levelNumber}: {level.name}</span>
              <span className="ml-auto text-slate-500 text-xs">{levelContent.length} item{levelContent.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="p-4 space-y-2">
              {levelContent.map(item => {
                const tc = getTypeConfig(item.type);
                const lesson = level.lessons?.find(l => l.id === item.lessonId);
                return (
                  <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 bg-slate-950/60 rounded-xl">
                    <tc.icon className={`w-4 h-4 ${tc.color} shrink-0`} />
                    <span className="text-white text-sm flex-1 truncate">{item.title}</span>
                    {lesson && <span className="text-slate-600 text-xs truncate max-w-[200px]">{lesson.title}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${tc.bg} ${tc.border} ${tc.color} shrink-0`}>{tc.label}</span>
                    {!item.published && <span className="text-xs text-slate-500">Draft</span>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {unassigned.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-3">
            <FolderOpen className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-400 text-sm">Unassigned Content</span>
            <span className="ml-auto text-slate-500 text-xs">{unassigned.length} item{unassigned.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="p-4 space-y-2">
            {unassigned.map(item => {
              const tc = getTypeConfig(item.type);
              return (
                <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 bg-slate-950/60 rounded-xl">
                  <tc.icon className={`w-4 h-4 ${tc.color} shrink-0`} />
                  <span className="text-white text-sm flex-1 truncate">{item.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${tc.bg} ${tc.border} ${tc.color} shrink-0`}>{tc.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Panel ────────────────────────────────────────────────────────────────
export default function ContentPanel({ data, save, reset }) {
  const content = data.content ?? [];
  const levels  = data.levels  ?? [];

  const [search, setSearch]     = useState('');
  const [filterType, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid | list | assign
  const [modal, setModal]       = useState(null);  // null | 'add' | item object
  const [showFilter, setShowFilter] = useState(false);
  const [filterAccess, setFilterAccess] = useState('all');

  const saveContent = (updated) => save('content', updated);

  const handleSave = async (item) => {
    const exists = content.find(c => c.id === item.id);
    const updated = exists
      ? content.map(c => c.id === item.id ? item : c)
      : [...content, item];
    saveContent(updated);
    setModal(null);
    await saveCourseContentToSupabase(item);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this content item?')) return;
    saveContent(content.filter(c => c.id !== id));
    await deleteCourseContentFromSupabase(id);
  };

  const handleTogglePublish = async (id) => {
    const target = content.find(c => c.id === id);
    if (!target) return;
    const updatedItem = { ...target, published: !target.published };
    saveContent(content.map(c => c.id === id ? updatedItem : c));
    await saveCourseContentToSupabase(updatedItem);
  };

  // Filtered content
  const filtered = content.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.description || '').toLowerCase().includes(search.toLowerCase());
    const matchType   = filterType === 'all' || c.type === filterType;
    const matchAccess = filterAccess === 'all' || c.access === filterAccess;
    return matchSearch && matchType && matchAccess;
  });

  // Stats
  const stats = {
    total:     content.length,
    published: content.filter(c => c.published).length,
    videos:    content.filter(c => c.type === 'video').length,
    pdfs:      content.filter(c => c.type === 'pdf' || c.type === 'worksheet').length,
    free:      content.filter(c => c.access === 'free').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Course Content Library</h2>
          <p className="text-slate-500 text-sm mt-1">Manage all course files, videos, PDFs, worksheets, and resources</p>
        </div>
        <button
          onClick={() => setModal({ ...BLANK_ITEM })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Content
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total Items',  value: stats.total,     color: 'text-white' },
          { label: 'Published',    value: stats.published,  color: 'text-green-400' },
          { label: 'Videos',       value: stats.videos,     color: 'text-blue-400' },
          { label: 'Docs & PDFs',  value: stats.pdfs,       color: 'text-red-400' },
          { label: 'Free Preview', value: stats.free,       color: 'text-amber-400' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-0.5 uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search content..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-slate-600"
          />
        </div>

        {/* Type filter */}
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${filterType === 'all' ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' : 'border-slate-700 text-slate-500 hover:text-white'}`}>
            All
          </button>
          {CONTENT_TYPES.map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border flex items-center gap-1.5 ${filterType === t.id ? `${t.bg} ${t.border} ${t.color}` : 'border-slate-700 text-slate-500 hover:text-white'}`}>
              <t.icon className="w-3.5 h-3.5"/>{t.label.split('/')[0]}
            </button>
          ))}
        </div>

        {/* View mode */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 ml-auto">
          {[
            { id: 'grid', icon: Grid },
            { id: 'list', icon: List },
            { id: 'assign', icon: Layers },
          ].map(v => (
            <button key={v.id} onClick={() => setViewMode(v.id)}
              className={`p-1.5 rounded-lg transition-all ${viewMode === v.id ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-white'}`}>
              <v.icon className="w-4 h-4"/>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {content.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-slate-800 rounded-2xl">
          <FolderOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-white font-bold text-lg mb-2">No content yet</p>
          <p className="text-slate-500 text-sm mb-6">Start by adding your first video, PDF, or resource</p>
          <button onClick={() => setModal({ ...BLANK_ITEM })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all">
            <Plus className="w-4 h-4" /> Add First Content Item
          </button>
        </div>
      ) : viewMode === 'assign' ? (
        <AssignmentView content={content} levels={levels} />
      ) : viewMode === 'list' ? (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <p className="text-center text-slate-500 py-12">No items match your search.</p>
          ) : filtered.map(item => (
            <ContentCard key={item.id} item={item} viewMode="list"
              onEdit={i => setModal(i)}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => (
            <ContentCard key={item.id} item={item} viewMode="grid"
              onEdit={i => setModal(i)}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
            />
          ))}
          {/* Add card */}
          <button
            onClick={() => setModal({ ...BLANK_ITEM })}
            className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-amber-400 transition-all min-h-[200px]"
          >
            <Plus className="w-8 h-8" />
            <span className="text-sm font-medium">Add Content</span>
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal !== null && (
        <ContentModal
          item={modal}
          levels={levels}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
