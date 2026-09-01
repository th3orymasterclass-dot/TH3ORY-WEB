import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, ChevronDown } from 'lucide-react';

/**
 * Reusable Action Dropdown / Mini Popup Component for table rows and subsections.
 * 
 * @param {Object} props
 * @param {Array} props.items - Array of action items: { label, icon: Icon, onClick, variant, disabled, divider }
 * @param {string} [props.label] - Optional text for button (e.g. 'Actions' or '•••')
 * @param {React.ReactNode} [props.icon] - Custom icon for trigger button
 * @param {string} [props.align='right'] - 'left' | 'right'
 * @param {boolean} [props.isDark=true] - Theme mode
 * @param {string} [props.buttonClassName] - Custom trigger button classes
 */
export default function ActionDropdown({
  items = [],
  label = 'Actions',
  icon,
  align = 'right',
  isDark = true,
  buttonClassName = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const getVariantStyles = (variant) => {
    switch (variant) {
      case 'danger':
        return isDark
          ? 'text-rose-400 hover:bg-rose-950/40 hover:text-rose-300'
          : 'text-rose-600 hover:bg-rose-50 hover:text-rose-700';
      case 'success':
        return isDark
          ? 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300'
          : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800';
      case 'warning':
        return isDark
          ? 'text-amber-400 hover:bg-amber-950/40 hover:text-amber-300'
          : 'text-amber-700 hover:bg-amber-50 hover:text-amber-800';
      case 'purple':
        return isDark
          ? 'text-purple-400 hover:bg-purple-950/40 hover:text-purple-300'
          : 'text-purple-700 hover:bg-purple-50 hover:text-purple-800';
      case 'primary':
        return isDark
          ? 'text-indigo-400 hover:bg-indigo-950/40 hover:text-indigo-300 font-semibold'
          : 'text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 font-semibold';
      default:
        return isDark
          ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900';
    }
  };

  const getIconColor = (variant) => {
    switch (variant) {
      case 'danger':  return 'text-rose-400';
      case 'success': return 'text-emerald-400';
      case 'warning': return 'text-amber-400';
      case 'purple':  return 'text-purple-400';
      case 'primary': return 'text-indigo-400';
      default:        return isDark ? 'text-slate-400' : 'text-slate-500';
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        className={buttonClassName || `px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 select-none cursor-pointer shadow-xs ${
          isOpen
            ? isDark
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
              : 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
            : isDark
              ? 'bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:border-slate-600'
              : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-300 hover:border-slate-400'
        }`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {icon || <MoreHorizontal className="w-3.5 h-3.5" />}
        {label && <span>{label}</span>}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Mini Popup / Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-1.5 w-48 sm:w-52 rounded-2xl border p-1.5 shadow-2xl z-50 transition-all origin-top-${align} ${
            isDark
              ? 'bg-slate-900/95 border-slate-700/80 backdrop-blur-xl shadow-black/80'
              : 'bg-white/95 border-slate-200 backdrop-blur-xl shadow-slate-900/20'
          }`}
          role="menu"
          aria-orientation="vertical"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-0.5">
            {items.map((item, idx) => {
              if (item.divider) {
                return (
                  <div
                    key={idx}
                    className={`my-1 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}
                  />
                );
              }

              const ItemIcon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={item.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    if (item.onClick) item.onClick();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 transition-all select-none cursor-pointer ${
                    item.disabled ? 'opacity-40 cursor-not-allowed' : getVariantStyles(item.variant)
                  }`}
                  role="menuitem"
                  title={item.title || item.label}
                >
                  {ItemIcon && (
                    <ItemIcon className={`w-4 h-4 shrink-0 ${getIconColor(item.variant)}`} />
                  )}
                  <span className="font-semibold truncate flex-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
