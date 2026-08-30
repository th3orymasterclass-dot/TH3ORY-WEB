import React, { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Phone, Briefcase, MapPin, Calendar, Lock, Save,
  CheckCircle2, ShieldCheck, Sparkles, RefreshCw, Crown, Award, KeyRound,
  Upload, Image as ImageIcon, Trash2, AlertCircle
} from 'lucide-react';
import { updateStudentProfileInSupabase } from '../../services/supabaseService';

const AVATAR_THEMES = [
  { id: 'violet', label: 'Violet Glow', gradient: 'from-[#7C5CFC] to-[#6344E0]' },
  { id: 'gold', label: 'Cognitive Gold', gradient: 'from-amber-500 to-yellow-600' },
  { id: 'emerald', label: 'Emerald Master', gradient: 'from-emerald-500 to-teal-700' },
  { id: 'cyan', label: 'Neon Cyan', gradient: 'from-cyan-500 to-blue-600' },
  { id: 'rose', label: 'Royal Rose', gradient: 'from-rose-500 to-pink-700' },
];

const PROFESSIONS = [
  'Student', 'Recent Graduate', 'Marketing Professional', 'Sales Professional',
  'Entrepreneur / Founder', 'Executive / Manager', 'Consultant', 'Freelancer',
  'Teacher / Educator', 'Healthcare Professional', 'Engineer / Developer',
  'Finance / Accounting', 'Legal Professional', 'HR / People Operations',
  'Artist / Creative', 'Coach / Mentor', 'Content Creator', 'Other',
];

export default function ProfilePanel({ profile, onProfileUpdate }) {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    profession: profile?.profession || 'Student',
    bio: profile?.bio || '',
    country: profile?.country || 'India',
    dob: profile?.dob || '',
    avatarTheme: profile?.avatar || 'violet',
  });

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadNotice, setUploadNotice] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        profession: profile.profession || 'Student',
        bio: profile.bio || '',
        country: profile.country || 'India',
        dob: profile.dob || '',
        avatarTheme: profile.avatar || 'violet',
      });
    }
  }, [profile]);

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errorMsg) setErrorMsg('');
  };

  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setUploadNotice('');

    // 1. Validate File Extension / Mimetype (.jpg, .jpeg)
    const validTypes = ['image/jpeg', 'image/jpg'];
    const filename = file.name.toLowerCase();
    const isValidExt = filename.endsWith('.jpg') || filename.endsWith('.jpeg');

    if (!validTypes.includes(file.type) && !isValidExt) {
      setErrorMsg('Invalid image format! Only JPG and JPEG files (.jpg, .jpeg) are supported.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Validate File Size (Under 256 KB = 262,144 bytes)
    const MAX_BYTES = 256 * 1024;
    if (file.size > MAX_BYTES) {
      const fileSizeKb = (file.size / 1024).toFixed(1);
      setErrorMsg(`File size exceeds 256 KB limit (${fileSizeKb} KB selected). Please choose an image under 256 KB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadingAvatar(true);

    try {
      // Read file content as Base64 Data URL
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Content = event.target?.result;
        if (!base64Content) {
          setErrorMsg('Failed to process image file.');
          setUploadingAvatar(false);
          return;
        }

        // Upload to Vercel Blob via /api/upload-blob endpoint
        const cleanEmail = (form.email || 'student').replace(/[^a-zA-Z0-9]/g, '_');
        const blobFilename = `avatars/avatar_${cleanEmail}_${Date.now()}.jpg`;
        const studentToken = typeof window !== 'undefined'
          ? (sessionStorage.getItem('th3ory_student_token') || localStorage.getItem('th3ory_student_token') || sessionStorage.getItem('th3ory_admin_token') || localStorage.getItem('th3ory_admin_token'))
          : '';

        const res = await fetch('/api/upload-blob', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(studentToken ? { 'Authorization': `Bearer ${studentToken}` } : {})
          },
          body: JSON.stringify({
            filename: blobFilename,
            content: base64Content,
            contentType: 'image/jpeg'
          })
        });

        setUploadingAvatar(false);

        if (res.ok) {
          const blobData = await res.json();
          if (blobData.success && blobData.url) {
            handleChange('avatarTheme', blobData.url);
            setUploadNotice('Custom JPEG avatar uploaded to Vercel Blob storage successfully!');
            setTimeout(() => setUploadNotice(''), 4000);
          } else {
            // Local Data URL fallback
            handleChange('avatarTheme', base64Content);
            setUploadNotice('Avatar updated successfully!');
            setTimeout(() => setUploadNotice(''), 4000);
          }
        } else {
          // Fallback to Data URL
          handleChange('avatarTheme', base64Content);
          setUploadNotice('Avatar updated successfully!');
          setTimeout(() => setUploadNotice(''), 4000);
        }
      };

      reader.onerror = () => {
        setErrorMsg('Error reading image file.');
        setUploadingAvatar(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('[Avatar Upload Exception]:', err);
      setErrorMsg('Failed to upload custom avatar image.');
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrorMsg('Full Name cannot be empty.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSavedSuccess(false);

    const payload = {
      ...profile,
      name: form.name.trim(),
      phone: form.phone.trim(),
      profession: form.profession,
      bio: form.bio.trim(),
      country: form.country.trim(),
      dob: form.dob,
      avatar: form.avatarTheme,
    };

    const res = await updateStudentProfileInSupabase(payload);
    setSaving(false);

    if (res.success) {
      setSavedSuccess(true);
      if (onProfileUpdate) {
        onProfileUpdate(res.profile || payload);
      }
      setTimeout(() => setSavedSuccess(false), 3500);
    } else {
      setErrorMsg(res.error || 'Failed to update profile. Please try again.');
    }
  };

  const isCustomImage = form.avatarTheme && (form.avatarTheme.startsWith('http') || form.avatarTheme.startsWith('data:'));
  const activeTheme = AVATAR_THEMES.find(t => t.id === form.avatarTheme) || AVATAR_THEMES[0];
  const initialLetter = (form.name || profile?.name || 'S')[0].toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#7C5CFC]/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar Preview */}
            <div className={`w-20 h-20 rounded-2xl ${isCustomImage ? 'bg-slate-950' : `bg-gradient-to-br ${activeTheme.gradient}`} flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-[#7C5CFC]/20 shrink-0 border-2 border-white/20 overflow-hidden relative group`}>
              {isCustomImage ? (
                <img src={form.avatarTheme} alt="Student Avatar" className="w-full h-full object-cover" />
              ) : (
                initialLetter
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl font-black font-brand text-white tracking-tight">{form.name || 'Student Profile'}</h2>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> {profile?.plan || 'TH3ORY Masterclass'}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> {profile?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleSave}
              disabled={saving || uploadingAvatar}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#7C5CFC] to-[#6344E0] hover:from-[#6c4ce0] hover:to-[#5233d0] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#7C5CFC]/25 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-3 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl px-5 py-3.5 text-emerald-400 text-xs font-bold animate-fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Profile changes saved and synchronized across your session &amp; Supabase database!</span>
        </div>
      )}

      {uploadNotice && (
        <div className="flex items-center gap-3 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl px-5 py-3.5 text-emerald-400 text-xs font-bold animate-fade-in shadow-lg">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{uploadNotice}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 bg-rose-950/60 border border-rose-500/40 rounded-2xl px-5 py-3.5 text-rose-400 text-xs font-bold animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Personal Info (2 Cols) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#7C5CFC]" /> Personal Details
            </h3>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#7C5CFC] transition-colors"
                />
              </div>
            </div>

            {/* Email (Read-Only) */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                <span>Email Address (Primary Account)</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-normal">
                  <Lock className="w-3 h-3 text-emerald-400" /> Locked Identifier
                </span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={form.email}
                  className="w-full bg-slate-950/60 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2.5 text-slate-400 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone & Profession Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => handleChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#7C5CFC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Profession / Role</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={form.profession}
                    onChange={e => handleChange('profession', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#7C5CFC]"
                  >
                    {PROFESSIONS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Country & DOB Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Country / Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={form.country}
                    onChange={e => handleChange('country', e.target.value)}
                    placeholder="e.g. India, United States"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#7C5CFC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Date of Birth</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={form.dob}
                    onChange={e => handleChange('dob', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#7C5CFC]"
                  />
                </div>
              </div>
            </div>

            {/* Bio / Learning Objectives */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bio &amp; Cognitive Learning Objective</label>
              <textarea
                rows={3}
                value={form.bio}
                onChange={e => handleChange('bio', e.target.value)}
                placeholder="Share your primary goal for mastering TH3ORY behavioral frameworks..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-white text-xs focus:outline-none focus:border-[#7C5CFC] resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Avatar Customization & Credentials Security Card */}
        <div className="space-y-6">
          
          {/* Avatar Upload & Theme Selection Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Custom Avatar Image
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Vercel Blob</span>
            </h3>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/jpg,.jpg,.jpeg"
              onChange={handleAvatarFileSelect}
              className="hidden"
            />

            {/* Vercel Blob Image Upload Trigger Box */}
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-[#7C5CFC] bg-slate-950 rounded-2xl p-4 text-center cursor-pointer transition-all hover:bg-slate-950/80 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#7C5CFC]/15 text-[#7C5CFC] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  {uploadingAvatar ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                </div>
                <p className="text-white font-bold text-xs">
                  {uploadingAvatar ? 'Uploading to Vercel Blob...' : 'Upload Custom JPEG Avatar'}
                </p>
                <p className="text-[#64748B] text-[11px] mt-1">
                  Format: <span className="text-slate-300 font-semibold">JPG / JPEG</span> • Size limit: <span className="text-amber-400 font-semibold">Max 256 KB</span>
                </p>
              </div>

              {isCustomImage && (
                <button
                  type="button"
                  onClick={() => handleChange('avatarTheme', 'violet')}
                  className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Custom Image (Reset to Preset)
                </button>
              )}
            </div>

            {/* Preset Color Themes Divider */}
            <div className="pt-2 border-t border-slate-800/80">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Or Choose Color Gradient Theme</p>
              <div className="grid grid-cols-1 gap-2">
                {AVATAR_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleChange('avatarTheme', theme.id)}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs font-bold ${
                      form.avatarTheme === theme.id
                        ? 'bg-slate-950 border-[#7C5CFC] shadow-md shadow-[#7C5CFC]/10 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${theme.gradient} shrink-0`} />
                      <span>{theme.label}</span>
                    </div>
                    {form.avatarTheme === theme.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#7C5CFC]" />}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Account Credentials Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Enrollment Access Info
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Enrolled Plan:</span>
                <strong className="text-amber-400 font-bold">{profile?.plan || 'TH3ORY Masterclass'}</strong>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" /> Access PIN / Code:
                </span>
                <strong className="text-white font-mono font-bold">●●●●●●●●</strong>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Database Sync:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Supabase Realtime
                </span>
              </div>
            </div>
          </div>

        </div>

      </form>
    </div>
  );
}
