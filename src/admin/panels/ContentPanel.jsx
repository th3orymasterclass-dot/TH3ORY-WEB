import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Save, Plus, Trash2, Edit3, X, Upload, Link2, Search,
  Play, FileText, Image, Music, Archive, BookOpen, HelpCircle,
  CheckCircle2, Clock, Eye, EyeOff, Download, Filter,
  AlertCircle, Video, File, ChevronDown, Tag, Lock, Unlock,
  FolderOpen, Grid, List, Layers, ExternalLink, HardDrive
} from 'lucide-react';
import { saveCourseContentToSupabase, deleteCourseContentFromSupabase } from '../../services/supabaseService';
import { parseGoogleDriveUrl } from '../../utils/gdriveHelper';

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
  uploadedAt: null, thumbnail: '', storageType: 'url',
  gdriveFileId: '', gdriveEmbedUrl: '', gdriveDownloadUrl: ''
};

function getTypeConfig(typeId) {
  return CONTENT_TYPES.find(t => t.id === typeId) || CONTENT_TYPES[0];
}

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

  const gdrive = parseGoogleDriveUrl(item.url);
  const isDrive = gdrive.isGDrive || item.storageType === 'gdrive';

  if (viewMode === 'list') {
    return (
      <div className={`flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-all ${!item.published ? 'opacity-60' : ''}`}>
        <div className={`w-10 h-10 rounded-xl ${tc.bg} border ${tc.border} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${tc.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white font-semibold text-sm truncate">{item.title || 'Untitled'}</p>
            {isDrive && (
              <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <HardDrive className="w-3 h-3" /> GDrive
              </span>
            )}
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
          {isDrive && (
            <a href={gdrive.embedUrl || item.url} target="_blank" rel="noreferrer" title="Stream View from Google Drive" className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-950/40 transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
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
        {item.thumbnail || (isDrive && gdrive.thumbnailUrl) ? (
          <img src={item.thumbnail || gdrive.thumbnailUrl} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
        ) : (
          <Icon className={`w-12 h-12 ${tc.color} opacity-40`} />
        )}
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button onClick={() => onEdit(item)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"><Edit3 className="w-4 h-4"/></button>
          {isDrive && (
            <a href={gdrive.viewUrl || item.url} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors" title="Open Google Drive">
              <ExternalLink className="w-4 h-4"/>
            </a>
          )}
          <button onClick={() => onDelete(item.id)} className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"><Trash2 className="w-4 h-4"/></button>
        </div>
        {/* Status badges */}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tc.bg} ${tc.border} ${tc.color}`}>{tc.label}</span>
          {isDrive && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
              <HardDrive className="w-3 h-3" /> GDrive
            </span>
          )}
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
  const [sourceTab, setSourceTab] = useState('gdrive'); // 'gdrive' | 'url' | 'upload'
  const fileRef = useRef();

  const up = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleDriveUrlInput = (urlVal) => {
    const parsed = parseGoogleDriveUrl(urlVal);
    if (parsed.isGDrive) {
      setForm(f => ({
        ...f,
        url: parsed.embedUrl,
        storageType: 'gdrive',
        gdriveFileId: parsed.fileId,
        gdriveEmbedUrl: parsed.embedUrl,
        gdriveDownloadUrl: parsed.downloadUrl,
        thumbnail: f.thumbnail || parsed.thumbnailUrl,
      }));
    } else {
      setForm(f => ({ ...f, url: urlVal, storageType: 'url' }));
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm(f => ({
      ...f,
      url,
      storageType: 'local',
      fileName: file.name,
      fileSize: formatBytes(file.size),
      title: f.title || file.name.replace(/\.[^/.]+$/, ''),
      type: file.type.startsWith('video/') ? 'video'
          : file.type === 'application/pdf' ? 'pdf'
          : file.type.startsWith('audio/') ? 'audio'
          : file.type.startsWith('image/') ? 'image'
          : file.name.endsWith('.zip') ? 'archive'
          : f.type,
    }));
  };

  const handleSave = () => {
    if (!form.title.trim()) return alert('Please enter a title.');
    if (!form.url.trim()) return alert('Please add a Google Drive link, URL, or upload a file.');
    onSave({
      ...form,
      id: form.id || `c_${Date.now()}`,
      uploadedAt: form.uploadedAt || new Date().toISOString(),
    });
  };

  const tc = getTypeConfig(form.type);
  const parsedDrive = parseGoogleDriveUrl(form.url);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
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

          {/* Storage Source Selector */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digital Storage Source *</label>
              <div className="ml-auto flex gap-1 bg-slate-950 border border-slate-700 rounded-lg p-0.5">
                <button onClick={() => setSourceTab('gdrive')} className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${sourceTab === 'gdrive' ? 'bg-blue-500 text-white' : 'text-slate-500 hover:text-white'}`}>
                  <HardDrive className="w-3.5 h-3.5"/> Google Drive
                </button>
                <button onClick={() => setSourceTab('url')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${sourceTab === 'url' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>
                  <Link2 className="w-3.5 h-3.5"/> Web URL
                </button>
                <button onClick={() => setSourceTab('upload')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${sourceTab === 'upload' ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>
                  <Upload className="w-3.5 h-3.5"/> File
                </button>
              </div>
            </div>

            {sourceTab === 'gdrive' && (
              <div className="space-y-3">
                <div className="relative">
                  <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <input
                    value={form.url}
                    onChange={e => handleDriveUrlInput(e.target.value)}
                    placeholder="Paste Google Drive Shareable Link (e.g. https://drive.google.com/file/d/.../view)"
                    className="w-full bg-slate-950 border border-blue-500/40 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-400 font-mono"
                  />
                </div>
                {parsedDrive.isGDrive ? (
                  <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-blue-400" /> Valid Google Drive Digital Storage File Detected!
                    </div>
                    <p className="text-slate-300"><strong>File ID:</strong> <code className="text-blue-300 font-mono">{parsedDrive.fileId}</code></p>
                    <p className="text-slate-300"><strong>Embed Stream URL:</strong> <code className="text-slate-400 font-mono">{parsedDrive.embedUrl}</code></p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    💡 Tip: Paste any Google Drive link set to <em>"Anyone with the link can view"</em>. It will be auto-formatted for high-speed streaming and direct download.
                  </p>
                )}
              </div>
            )}

            {sourceTab === 'url' && (
              <input value={form.url} onChange={e => up('url', e.target.value)}
                placeholder="https://youtube.com/embed/... or https://cdn.example.com/file.mp4"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60 font-mono" />
            )}

            {sourceTab === 'upload' && (
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
              </div>
            )}
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Thumbnail Image URL</label>
            <input value={form.thumbnail} onChange={e => up('thumbnail', e.target.value)}
              placeholder="https://... (auto-generated if using Google Drive)"
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

// ─── Assignment View ──────────────────────────────────────────────────────────
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
                const isDrive = parseGoogleDriveUrl(item.url).isGDrive;
                return (
                  <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 bg-slate-950/60 rounded-xl">
                    <tc.icon className={`w-4 h-4 ${tc.color} shrink-0`} />
                    <span className="text-white text-sm flex-1 truncate">{item.title}</span>
                    {isDrive && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                        <HardDrive className="w-3 h-3" /> GDrive
                      </span>
                    )}
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

// ─── Dedicated Google Drive Course Storage Folder Manager ─────────────────────
function GoogleDriveFolderManager({ data, save }) {
  const currentFolderUrl = data.gdriveFolderUrl || 'https://drive.google.com/drive/folders/1TH3ORY_Masterclass_Course_Content_Master_Folder';
  const [folderUrlInput, setFolderUrlInput] = useState(currentFolderUrl);
  const [isEditing, setIsEditing] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const parsed = parseGoogleDriveUrl(folderUrlInput);

  const handleSaveFolder = () => {
    save('gdriveFolderUrl', folderUrlInput.trim());
    setIsEditing(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(folderUrlInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const subfolders = [
    { title: '01 - Video Teasers & Trailers', path: '📁 /Videos/Trailers', icon: Video, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
    { title: '02 - Core Curriculum Video Lessons', path: '📁 /Videos/Lessons', icon: Play, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    { title: '03 - Workbooks, PDFs & Cheatsheets', path: '📁 /Documents/Workbooks', icon: FileText, color: 'text-red-400 bg-red-500/10 border-red-500/30' },
    { title: '04 - Audio Stems & Practice Files', path: '📁 /Audio/Soundpacks', icon: Music, color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  ];

  return (
    <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-5 space-y-4 relative overflow-hidden shadow-lg shadow-blue-950/20">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
            <HardDrive className="w-5 h-5"/>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-base">Dedicated Master Google Drive Course Folder</h3>
              <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <FolderOpen className="w-3 h-3" /> Live Storage Folder
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> th3orymasterclass@gmail.com
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">Central repository for all course videos, lesson assets, workbooks, and digital streams synced to <strong className="text-emerald-400">th3orymasterclass@gmail.com</strong></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFolderModal(true)}
            className="px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 hover:bg-blue-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5"/> Browse Folder Live
          </button>
          <a
            href={parsed.viewUrl || folderUrlInput}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5"/> Open in Drive
          </a>
          <button
            onClick={() => setIsEditing(v => !v)}
            className="p-1.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Configure Master Folder Link"
          >
            <Edit3 className="w-4 h-4"/>
          </button>
        </div>
      </div>

      {/* Editor Drawer */}
      {isEditing && (
        <div className="p-4 bg-slate-950 rounded-xl border border-blue-500/30 space-y-3">
          <label className="block text-xs font-bold text-blue-400 uppercase tracking-wider">Configure Master Google Drive Folder URL or Folder ID</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={folderUrlInput}
              onChange={e => setFolderUrlInput(e.target.value)}
              placeholder="e.g. https://drive.google.com/drive/folders/1TH3ORY_Masterclass_Course_Content_Master_Folder"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSaveFolder}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5"/> Save Folder Link
            </button>
          </div>
          {parsed.fileId && (
            <p className="text-[11px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3"/> Active Folder ID Detected: <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono text-white">{parsed.fileId}</code>
            </p>
          )}
        </div>
      )}

      {/* Dedicated Course Subdirectories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {subfolders.map((sf, idx) => (
          <div key={idx} className="p-3 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center gap-2.5 transition-all">
            <div className={`p-2 rounded-lg border ${sf.color}`}>
              <sf.icon className="w-4 h-4"/>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-bold truncate">{sf.title}</p>
              <p className="text-slate-500 text-[10px] font-mono truncate">{sf.path}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Embedded Live Google Drive Folder Viewer Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowFolderModal(false)}>
          <div className="w-full max-w-5xl bg-slate-900 border border-blue-500/40 rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{height:'82vh'}} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                  <HardDrive className="w-5 h-5"/>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Dedicated Google Drive Master Folder Browser</h3>
                  <p className="text-slate-500 text-xs font-mono">{folderUrlInput}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleCopyLink} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1">
                  {copied ? '✓ Copied!' : 'Copy Folder Link'}
                </button>
                <a href={parsed.viewUrl || folderUrlInput} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-bold flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5"/> Open in Drive
                </a>
                <button onClick={() => setShowFolderModal(false)} className="text-slate-500 hover:text-white p-1 ml-2"><X className="w-5 h-5"/></button>
              </div>
            </div>
            <div className="flex-1 bg-slate-950 p-2">
              <iframe
                src={parsed.embedUrl || `https://drive.google.com/embeddedfolderview?id=${parsed.fileId || '1TH3ORY_Masterclass_Course_Content_Master_Folder'}#grid`}
                title="Google Drive Master Course Folder"
                className="w-full h-full border-0 rounded-xl"
                allow="autoplay; fullscreen"
              />
            </div>
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
  const [viewMode, setViewMode] = useState('grid');
  const [modal, setModal]       = useState(null);
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

  const filtered = content.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || (c.description || '').toLowerCase().includes(search.toLowerCase());
    const matchType   = filterType === 'all' || c.type === filterType || (filterType === 'gdrive' && parseGoogleDriveUrl(c.url).isGDrive);
    const matchAccess = filterAccess === 'all' || c.access === filterAccess;
    return matchSearch && matchType && matchAccess;
  });

  const stats = {
    total:     content.length,
    published: content.filter(c => c.published).length,
    videos:    content.filter(c => c.type === 'video').length,
    gdrive:    content.filter(c => parseGoogleDriveUrl(c.url).isGDrive || c.storageType === 'gdrive').length,
    free:      content.filter(c => c.access === 'free').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            Course Content Library <span className="text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1"><HardDrive className="w-3 h-3"/> GDrive Storage Ready</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage course materials, videos, PDFs, and digital workbooks backed by Google Drive</p>
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
          { label: 'Total Items',   value: stats.total,     color: 'text-white' },
          { label: 'Published',     value: stats.published,  color: 'text-green-400' },
          { label: 'Videos',        value: stats.videos,     color: 'text-blue-400' },
          { label: 'Google Drive',  value: stats.gdrive,     color: 'text-blue-400' },
          { label: 'Free Preview',  value: stats.free,       color: 'text-amber-400' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-slate-500 text-xs mt-0.5 uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Dedicated Google Drive Master Storage Folder Section */}
      <GoogleDriveFolderManager data={data} save={save} />

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search content..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-slate-600"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${filterType === 'all' ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' : 'border-slate-700 text-slate-500 hover:text-white'}`}>
            All
          </button>
          <button onClick={() => setFilter('gdrive')}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border flex items-center gap-1.5 ${filterType === 'gdrive' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400 font-bold' : 'border-slate-700 text-slate-500 hover:text-white'}`}>
            <HardDrive className="w-3.5 h-3.5"/> GDrive Storage
          </button>
          {CONTENT_TYPES.map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border flex items-center gap-1.5 ${filterType === t.id ? `${t.bg} ${t.border} ${t.color}` : 'border-slate-700 text-slate-500 hover:text-white'}`}>
              <t.icon className="w-3.5 h-3.5"/>{t.label.split('/')[0]}
            </button>
          ))}
        </div>

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
          <p className="text-slate-500 text-sm mb-6">Start by adding your first Google Drive video, PDF, or worksheet</p>
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
          <button
            onClick={() => setModal({ ...BLANK_ITEM })}
            className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-amber-400 transition-all min-h-[200px]"
          >
            <Plus className="w-8 h-8" />
            <span className="text-sm font-medium">Add Content</span>
          </button>
        </div>
      )}

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
