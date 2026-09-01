import React from 'react';
import { Camera, User, Trophy, Shield, Sparkles } from 'lucide-react';

const SIZE_CLASSES = {
  xs: { box: 'w-6 h-6 text-[10px]', icon: 'w-3 h-3', ring: 'ring-1' },
  sm: { box: 'w-8 h-8 text-xs', icon: 'w-4 h-4', ring: 'ring-1.5' },
  md: { box: 'w-10 h-10 text-sm font-bold', icon: 'w-5 h-5', ring: 'ring-2' },
  lg: { box: 'w-14 h-14 text-base font-black', icon: 'w-7 h-7', ring: 'ring-2' },
  xl: { box: 'w-20 h-20 text-xl font-black', icon: 'w-9 h-9', ring: 'ring-2' },
  '2xl': { box: 'w-24 h-24 text-2xl font-black', icon: 'w-11 h-11', ring: 'ring-4' },
  '3xl': { box: 'w-32 h-32 text-3xl font-black', icon: 'w-14 h-14', ring: 'ring-4' }
};

const ROLE_THEMES = {
  student: {
    gradient: 'from-amber-500 via-amber-600 to-yellow-500',
    ring: 'ring-amber-500/40',
    border: 'border-amber-500/50',
    text: 'text-slate-950',
    icon: User,
    badgeBg: 'bg-amber-500 text-slate-950'
  },
  ambassador: {
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    ring: 'ring-yellow-400/50',
    border: 'border-yellow-400/60',
    text: 'text-slate-950',
    icon: Trophy,
    badgeBg: 'bg-yellow-400 text-slate-950'
  },
  team: {
    gradient: 'from-indigo-500 via-purple-600 to-indigo-700',
    ring: 'ring-indigo-500/40',
    border: 'border-indigo-500/50',
    text: 'text-white',
    icon: Shield,
    badgeBg: 'bg-indigo-600 text-white'
  },
  admin: {
    gradient: 'from-rose-500 via-purple-600 to-indigo-600',
    ring: 'ring-rose-500/40',
    border: 'border-rose-500/50',
    text: 'text-white',
    icon: Sparkles,
    badgeBg: 'bg-rose-500 text-white'
  }
};

export default function ProfileAvatar({
  src = '',
  name = 'User',
  role = 'student', // 'student' | 'ambassador' | 'team' | 'admin'
  size = 'md',
  editable = false,
  onClick = null,
  showStatus = false,
  className = '',
  title = ''
}) {
  const sizeConfig = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const roleTheme = ROLE_THEMES[role] || ROLE_THEMES.student;
  const initial = (name || 'U').trim()[0].toUpperCase();

  const isClickable = Boolean(onClick || editable);

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl select-none ${
        isClickable ? 'cursor-pointer group' : ''
      } ${className}`}
      title={title || (editable ? `Change ${name}'s Profile Picture` : name)}
    >
      <div
        className={`${sizeConfig.box} rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 shadow-md ${
          src ? 'bg-slate-900 border border-slate-700/60' : `bg-gradient-to-br ${roleTheme.gradient} ${roleTheme.border}`
        } ${roleTheme.ring} ${isClickable ? 'group-hover:scale-105 group-hover:shadow-lg' : ''}`}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              // Graceful fallback to initial if image fails loading
              e.target.style.display = 'none';
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Fallback Initials Display */}
        <div
          className={`w-full h-full flex items-center justify-center font-extrabold ${roleTheme.text}`}
          style={{ display: src ? 'none' : 'flex' }}
        >
          {initial}
        </div>

        {/* Editable Overlay */}
        {editable && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white">
            <Camera className={`${sizeConfig.icon} text-white drop-shadow-md`} />
          </div>
        )}
      </div>

      {/* Optional Status Indicator Badge */}
      {showStatus && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full shadow-xs ring-1 ring-emerald-400/50" />
      )}
    </div>
  );
}
