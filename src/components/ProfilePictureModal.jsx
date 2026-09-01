import React, { useState, useRef } from 'react';
import {
  X, Upload, Image as ImageIcon, Trash2, Check, Sparkles,
  Camera, Link as LinkIcon, ShieldCheck, Database, HardDrive,
  RefreshCw, AlertCircle, Info, User, Trophy, Shield
} from 'lucide-react';
import {
  AVATAR_PRESETS,
  processImageFile,
  setStudentAvatar,
  setAmbassadorAvatar,
  setTeamMemberAvatar,
  getStudentAvatarKey,
  getAmbassadorAvatarKey,
  getTeamMemberAvatarKey
} from '../utils/profileStorageEngine';
import {
  saveStudentProfilePictureToSupabase,
  saveAmbassadorProfilePictureToSupabase,
  saveTeamMemberProfilePictureToSupabase
} from '../services/supabaseService';
import ProfileAvatar from './ProfileAvatar';

export default function ProfilePictureModal({
  isOpen,
  onClose,
  currentAvatar = '',
  userName = 'User',
  userRole = 'student', // 'student' | 'ambassador' | 'team'
  userIdentifier = '', // email, ambassadorCode, or memberId
  themeMode = 'dark',
  onAvatarUpdated = null
}) {
  if (!isOpen) return null;

  const isLight = themeMode === 'light';
  const fileInputRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState(currentAvatar || '');
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'presets' | 'url'
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Compute memory segmentation namespace
  const memoryPartitionKey = userRole === 'student'
    ? getStudentAvatarKey(userIdentifier)
    : userRole === 'ambassador'
    ? getAmbassadorAvatarKey(userIdentifier)
    : getTeamMemberAvatarKey(userIdentifier);

  const roleMeta = {
    student: {
      title: 'Student Profile Picture',
      subtitle: 'Personalize your learning workspace & certificate profile',
      icon: User,
      badge: 'Student Account',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
    },
    ambassador: {
      title: 'Campus Ambassador Profile Picture',
      subtitle: 'Build credibility across your campus marketing network',
      icon: Trophy,
      badge: 'Campus Ambassador',
      badgeColor: 'bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 border-yellow-400/30'
    },
    team: {
      title: 'Team Officer Profile Picture',
      subtitle: 'Display your official operational avatar across portal rosters',
      icon: Shield,
      badge: 'Team Operations',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30'
    }
  }[userRole] || {
    title: 'Update Profile Picture',
    subtitle: 'Upload a custom photo or choose a preset',
    icon: User,
    badge: 'Account Profile',
    badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const compressedDataUrl = await processImageFile(file, 480, 0.85);
      setPreviewUrl(compressedDataUrl);
      setSuccessMessage('Photo processed and compressed ready for saving!');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to process selected image file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const compressedDataUrl = await processImageFile(file, 480, 0.85);
      setPreviewUrl(compressedDataUrl);
      setSuccessMessage('Photo dropped and compressed ready for saving!');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to process dropped image file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setErrorMessage('Please enter a valid image URL.');
      return;
    }
    setPreviewUrl(urlInput.trim());
    setSuccessMessage('Image URL applied to preview!');
    setErrorMessage('');
  };

  const handleSelectPreset = (presetUrl) => {
    setPreviewUrl(presetUrl);
    setSuccessMessage('Preset avatar selected!');
    setErrorMessage('');
  };

  const handleRemovePhoto = () => {
    setPreviewUrl('');
    setUrlInput('');
    setSuccessMessage('Avatar cleared. Initials default will be used.');
    setErrorMessage('');
  };

  const handleSaveAvatar = async () => {
    setIsSaving(true);
    setErrorMessage('');

    try {
      // 1. Partitioned memory & local storage write
      if (userRole === 'student') {
        setStudentAvatar(userIdentifier, previewUrl);
        await saveStudentProfilePictureToSupabase(userIdentifier, previewUrl);
      } else if (userRole === 'ambassador') {
        setAmbassadorAvatar(userIdentifier, previewUrl);
        await saveAmbassadorProfilePictureToSupabase(userIdentifier, previewUrl);
      } else if (userRole === 'team') {
        setTeamMemberAvatar(userIdentifier, previewUrl);
        await saveTeamMemberProfilePictureToSupabase(userIdentifier, previewUrl);
      }

      if (onAvatarUpdated) {
        onAvatarUpdated(previewUrl);
      }

      setSuccessMessage('Profile picture synchronized and saved successfully!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save profile picture to database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden z-10 transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        {/* Header Bar */}
        <div className={`p-6 border-b flex items-start justify-between gap-4 ${
          isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800/80 bg-slate-950/40'
        }`}>
          <div className="flex items-center gap-3.5 min-w-0">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${roleMeta.badgeColor}`}>
              <roleMeta.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-lg truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {roleMeta.title}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${roleMeta.badgeColor}`}>
                  {roleMeta.badge}
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {roleMeta.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Live Avatar Preview & User Meta */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center gap-5 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className="relative group">
              <ProfileAvatar
                src={previewUrl}
                name={userName}
                role={userRole}
                size="2xl"
                showStatus={true}
              />
              {previewUrl && (
                <button
                  onClick={handleRemovePhoto}
                  className="absolute -top-2 -right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer"
                  title="Remove custom photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="text-center sm:text-left min-w-0 flex-1">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-500 mb-0.5">
                Active Live Preview
              </p>
              <h4 className={`text-lg font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {userName}
              </h4>
              <p className={`text-xs font-mono truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {userIdentifier || 'account-id'}
              </p>

              {/* Memory Segmentation Badge */}
              <div className="mt-2.5 flex items-center justify-center sm:justify-start gap-1.5 text-[10px] text-slate-500 font-mono">
                <Database className="w-3 h-3 text-indigo-400" />
                <span className="truncate">Partition: {memoryPartitionKey}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className={`flex rounded-xl p-1 border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            {[
              { id: 'upload', label: 'Upload File', icon: Upload },
              { id: 'presets', label: 'Preset Avatars', icon: Sparkles },
              { id: 'url', label: 'Image URL', icon: LinkIcon }
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? isLight
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'bg-slate-800 text-white shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content 1: File Upload & Drag-and-Drop */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                  dragOver
                    ? 'border-amber-500 bg-amber-500/10'
                    : isLight
                    ? 'border-slate-300 hover:border-amber-500/60 bg-slate-50 hover:bg-slate-100/80'
                    : 'border-slate-700 hover:border-amber-500/60 bg-slate-950/40 hover:bg-slate-950/80'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-3">
                  {isProcessing ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>

                <p className={`font-bold text-sm mb-1 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  {isProcessing ? 'Optimizing photo...' : 'Click to upload or drag & drop'}
                </p>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  PNG, JPG, WebP, GIF, or SVG (Up to 10MB)
                </p>
              </div>
            </div>
          )}

          {/* Tab Content 2: Preset Avatars */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Select a high-resolution persona portrait archetype:
              </p>
              <div className="grid grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = previewUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`group relative rounded-2xl p-1.5 border transition-all text-left flex flex-col items-center cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-500/40 bg-amber-500/10'
                          : isLight
                          ? 'border-slate-200 hover:border-slate-300 bg-white'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-14 h-14 rounded-xl object-cover mb-1.5 group-hover:scale-105 transition-transform"
                      />
                      <span className="text-[10px] font-bold text-center leading-tight truncate w-full">
                        {preset.category}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Content 3: Direct URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className={`block text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Paste Image Direct URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.example.com/avatar.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 focus:border-amber-500 text-slate-900'
                      : 'bg-slate-950 border-slate-800 focus:border-amber-500 text-white'
                  }`}
                />
                <button
                  onClick={handleApplyUrl}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                >
                  Apply
                </button>
              </div>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-800/80 bg-slate-950/40'
        }`}>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>End-to-End Realtime Synchronized</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              disabled={isSaving}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isLight
                  ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  : 'border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}
            >
              Cancel
            </button>

            <button
              onClick={handleSaveAvatar}
              disabled={isSaving || isProcessing}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Save & Sync Photo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
