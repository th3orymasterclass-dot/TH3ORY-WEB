import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Mail, Phone, MapPin, Globe, Check, 
  RotateCcw, ShieldCheck, Clock, Share2 
} from 'lucide-react';
import { defaultContact } from '../../data/courseData';

export default function ContactPanel({ data, save, reset, themeMode = 'dark' }) {
  const isDark = themeMode === 'dark';
  const initial = data?.contact || defaultContact;

  const [d, setD] = useState(initial);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (data?.contact) {
      setD(data.contact);
    }
  }, [data?.contact]);

  const update = (key, val) => setD(prev => ({ ...prev, [key]: val }));
  const updateSocial = (network, val) => {
    setD(prev => ({
      ...prev,
      socials: { ...(prev.socials || {}), [network]: val }
    }));
  };

  const handleSave = () => {
    save('contact', d);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset Contact and Footer information to defaults?')) {
      reset('contact');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <MessageSquare className="w-3.5 h-3.5" /> Studio & Contact Settings
            </div>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Contact, Studio & Footer
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Configure contact channels, support emails, office location, studio bio, social links, and footer disclaimers.
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all hover:scale-105"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved Live!' : 'Save Contact'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Production Studio Bio & Tagline */}
      <div className={`p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-base font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Production House & Brand Info
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Production Company Name
            </label>
            <input
              type="text"
              value={d.companyName || ''}
              onChange={e => update('companyName', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Department / Discipline
            </label>
            <input
              type="text"
              value={d.department || ''}
              onChange={e => update('department', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-bold text-amber-400 ${
                isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-300'
              }`}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Platform Overview Description
            </label>
            <textarea
              rows={3}
              value={d.description || ''}
              onChange={e => update('description', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Contact Channels */}
      <div className={`p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-base font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Communication Channels & Office
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              General Inquiry Email
            </label>
            <input
              type="email"
              value={d.email || ''}
              onChange={e => update('email', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Student Support Email
            </label>
            <input
              type="email"
              value={d.supportEmail || ''}
              onChange={e => update('supportEmail', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-amber-400' : 'bg-slate-50 border-slate-300 text-amber-600'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Phone / Helpline
            </label>
            <input
              type="text"
              value={d.phone || ''}
              onChange={e => update('phone', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              WhatsApp Support Number
            </label>
            <input
              type="text"
              value={d.whatsapp || ''}
              onChange={e => update('whatsapp', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono text-emerald-400 ${
                isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-300'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Office / Studio Location
            </label>
            <input
              type="text"
              value={d.address || ''}
              onChange={e => update('address', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Operating / Support Hours
            </label>
            <input
              type="text"
              value={d.hours || ''}
              onChange={e => update('hours', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Social Media Links & Footer Disclaimer */}
      <div className={`p-6 rounded-2xl border space-y-4 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
        <h3 className={`text-base font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Social Media Handles & Footer Disclaimer
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              LinkedIn Profile / Page
            </label>
            <input
              type="url"
              value={d.socials?.linkedin || ''}
              onChange={e => updateSocial('linkedin', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              YouTube Channel
            </label>
            <input
              type="url"
              value={d.socials?.youtube || ''}
              onChange={e => updateSocial('youtube', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Instagram Handle
            </label>
            <input
              type="url"
              value={d.socials?.instagram || ''}
              onChange={e => updateSocial('instagram', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              X / Twitter Profile
            </label>
            <input
              type="url"
              value={d.socials?.twitter || ''}
              onChange={e => updateSocial('twitter', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Footer Copyright & Disclaimer
            </label>
            <input
              type="text"
              value={d.footerDisclaimer || ''}
              onChange={e => update('footerDisclaimer', e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-700'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
