import React, { useState, useEffect } from 'react';
import {
  Loader2, AlertTriangle, AlertCircle, RefreshCw, WifiOff, Clock, Lock, ShieldAlert,
  FileText, Search, CreditCard, UploadCloud, DownloadCloud, CheckCircle2, Shield,
  Smartphone, Monitor, Sparkles, Layers, ArrowLeft
} from 'lucide-react';

/* ==========================================================================
   LOADING STATES
   ========================================================================== */

/** 1. Initial Page Loading */
export function InitialPageLoader({ message = 'Initializing TH3ORY Masterclass Environment...' }) {
  return (
    <div className="fixed inset-0 z-[99999] bg-[#05070e] text-white flex flex-col items-center justify-center p-6 space-y-6">
      <div className="relative flex items-center justify-center">
        <div className="w-20 h-20 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
        <div className="absolute w-12 h-12 rounded-full border-4 border-cyan-500/20 border-b-cyan-500 animate-spin-reverse" />
        <span className="absolute text-sm font-black tracking-widest text-amber-400">T3</span>
      </div>
      <div className="text-center space-y-2 max-w-sm">
        <h3 className="text-lg font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-cyan-400 to-indigo-400 uppercase">
          TH3ORY
        </h3>
        <p className="text-xs font-mono text-slate-400 animate-pulse">{message}</p>
      </div>
    </div>
  );
}

/** 2. Content Skeleton Loader */
export function ContentSkeletonLoader({ count = 3, type = 'card' }) {
  return (
    <div className="space-y-4 w-full animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 ${
            type === 'table' ? 'flex items-center justify-between space-y-0 py-4' : ''
          }`}
        >
          {type === 'table' ? (
            <>
              <div className="h-4 bg-slate-800 rounded w-1/4" />
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-4 bg-slate-800 rounded w-1/6" />
              <div className="h-8 bg-slate-800 rounded-lg w-20" />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="h-5 bg-slate-800 rounded-md w-1/3" />
                <div className="h-4 bg-slate-800 rounded-full w-16" />
              </div>
              <div className="h-3 bg-slate-800/80 rounded w-full" />
              <div className="h-3 bg-slate-800/80 rounded w-4/5" />
              <div className="pt-2 flex items-center gap-3">
                <div className="h-8 bg-slate-800 rounded-xl w-24" />
                <div className="h-8 bg-slate-800/50 rounded-xl w-24" />
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/** 3. Button Loading State */
export function ButtonLoadingState({ text = 'Processing...', className = '' }) {
  return (
    <span className={`inline-flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className="w-4 h-4 animate-spin text-current" />
      <span>{text}</span>
    </span>
  );
}

/** 4. Form Submission Loading */
export function FormSubmissionLoader({ title = 'Submitting Request', subtitle = 'Please wait while we verify details...' }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-center space-y-4 shadow-2xl backdrop-blur-md">
      <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-white tracking-wide">{title}</h4>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

/** 5. Infinite Scroll / Load More */
export function InfiniteScrollLoader({ label = 'Fetching additional items...' }) {
  return (
    <div className="py-6 text-center flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
      <span>{label}</span>
    </div>
  );
}

/** 6. Image Loading Placeholder */
export function ImageSkeleton({ className = 'w-full h-48 rounded-2xl' }) {
  return (
    <div className={`bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse flex items-center justify-center ${className}`}>
      <Layers className="w-8 h-8 text-slate-700 opacity-40" />
    </div>
  );
}

/** 7. File Upload Progress */
export function FileUploadProgress({ fileName, progress = 45, onCancel }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-mono text-slate-300">
          <UploadCloud className="w-4 h-4 text-cyan-400 animate-bounce" />
          <span className="truncate max-w-[200px]">{fileName}</span>
        </div>
        <span className="font-bold text-cyan-400">{progress}%</span>
      </div>

      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
        <div className="bg-gradient-to-r from-cyan-500 to-amber-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {onCancel && (
        <div className="text-right">
          <button onClick={onCancel} className="text-[10px] text-rose-400 hover:text-rose-300 font-mono underline">
            Cancel Upload
          </button>
        </div>
      )}
    </div>
  );
}

/** 8. File Download Progress */
export function FileDownloadProgress({ fileName, progress = 70, onCancel }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-mono text-slate-300">
          <DownloadCloud className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="truncate max-w-[200px]">{fileName}</span>
        </div>
        <span className="font-bold text-amber-400">{progress}%</span>
      </div>

      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
        <div className="bg-gradient-to-r from-amber-500 to-cyan-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {onCancel && (
        <div className="text-right">
          <button onClick={onCancel} className="text-[10px] text-slate-400 hover:text-slate-200 font-mono underline">
            Cancel Download
          </button>
        </div>
      )}
    </div>
  );
}

/** 9. Data Refresh Indicator */
export function DataRefreshIndicator({ refreshing = true }) {
  if (!refreshing) return null;
  return (
    <div className="w-full bg-cyan-950/80 border-b border-cyan-500/30 text-cyan-300 px-4 py-1.5 text-[11px] font-mono flex items-center justify-center gap-2 animate-pulse">
      <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
      <span>Refreshing live dataset from Supabase server...</span>
    </div>
  );
}

/** 10. Background Processing Loader */
export function BackgroundProcessingLoader({ title = 'Processing Certificate Task...', status = 'Queued' }) {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
        <Sparkles className="w-5 h-5 animate-spin" />
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="text-xs font-bold text-white truncate">{title}</h5>
        <p className="text-[10px] font-mono text-indigo-300">{status}</p>
      </div>
    </div>
  );
}

/* ==========================================================================
   ERROR STATES
   ========================================================================== */

/** Network & Connectivity */
export function NoInternetBanner({ onRetry }) {
  return (
    <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500/40 text-rose-100 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <WifiOff className="w-5 h-5 text-rose-400 shrink-0" />
        <div className="text-xs">
          <p className="font-bold">No Internet Connection</p>
          <p className="opacity-80">Check your network connection and try again.</p>
        </div>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="px-3 py-1.5 bg-rose-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-rose-400 shrink-0">
          Retry
        </button>
      )}
    </div>
  );
}

export function RequestTimeoutCard({ onRetry }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 text-center space-y-4">
      <Clock className="w-10 h-10 text-amber-400 mx-auto" />
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-white">Request Timeout</h4>
        <p className="text-xs text-slate-400">The server took too long to respond. Please try again.</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl">
          Retry Request
        </button>
      )}
    </div>
  );
}

export function APIRequestFailedCard({ message = 'Failed to load data from endpoint.', onRetry }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-rose-500/30 text-center space-y-4">
      <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-white">API Request Failed</h4>
        <p className="text-xs text-slate-400">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-xl">
          Try Again
        </button>
      )}
    </div>
  );
}

/** Authentication & Authorization */
export function Unauthorized401Modal({ onLoginRedirect }) {
  return (
    <div className="p-8 rounded-3xl bg-slate-900 border border-amber-500/30 text-center space-y-5 max-w-md mx-auto">
      <Lock className="w-12 h-12 text-amber-400 mx-auto" />
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-white">401 — Unauthorized Access</h3>
        <p className="text-xs text-slate-400">You must be signed in with a valid student enrollment code to view this page.</p>
      </div>
      {onLoginRedirect && (
        <button onClick={onLoginRedirect} className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl">
          Sign In Now
        </button>
      )}
    </div>
  );
}

export function Forbidden403Card() {
  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-rose-500/30 text-center space-y-3">
      <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto" />
      <h4 className="text-sm font-bold text-white">403 — Access Forbidden</h4>
      <p className="text-xs text-slate-400">You do not have administrative permissions to view this panel.</p>
    </div>
  );
}

export function SessionExpiredNotice({ onRelogin }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-950 border border-amber-500/40 text-center space-y-4">
      <Clock className="w-10 h-10 text-amber-400 mx-auto" />
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-white">Session Expired</h4>
        <p className="text-xs text-slate-400">Your 24-hour security session has ended. Please sign in again.</p>
      </div>
      {onRelogin && (
        <button onClick={onRelogin} className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400">
          Sign In Again
        </button>
      )}
    </div>
  );
}

/** Page Errors */
export function NotFound404Page({ onHome }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="relative">
        <span className="text-8xl font-black text-slate-800 tracking-tighter">404</span>
        <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-amber-400">Page Not Found</span>
      </div>
      <p className="text-xs text-slate-400 max-w-sm">
        The masterclass resource or page you requested does not exist or has been moved.
      </p>
      {onHome && (
        <button onClick={onHome} className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </button>
      )}
    </div>
  );
}

export function ServerError500Card({ onRetry }) {
  return (
    <div className="p-8 rounded-3xl bg-slate-900 border border-rose-500/30 text-center space-y-4">
      <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
      <div className="space-y-1">
        <h3 className="text-base font-bold text-white">500 — Internal Server Error</h3>
        <p className="text-xs text-slate-400">An unexpected error occurred on our serverless backend.</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-xl">
          Reload Endpoint
        </button>
      )}
    </div>
  );
}

export function MaintenanceModeBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 text-slate-950 px-4 py-3 text-xs font-bold flex items-center justify-center gap-3 shadow-xl">
      <AlertTriangle className="w-5 h-5 shrink-0" />
      <span>Maintenance Mode Active: The platform is currently undergoing scheduled performance updates.</span>
    </div>
  );
}

/** Form Errors */
export function ValidationErrorBox({ errors = [] }) {
  if (!errors || errors.length === 0) return null;
  return (
    <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs space-y-1">
      <div className="font-bold flex items-center gap-1.5 text-rose-400">
        <AlertCircle className="w-4 h-4" /> Please fix the following errors:
      </div>
      <ul className="list-disc list-inside space-y-0.5 opacity-90 pl-1">
        {errors.map((err, i) => (
          <li key={i}>{err}</li>
        ))}
      </ul>
    </div>
  );
}

export function DuplicateEntryNotice({ message = 'An item or account with this detail already exists.' }) {
  return (
    <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2.5">
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function SubmissionFailedAlert({ message = 'Form submission failed.', onRetry }) {
  return (
    <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-100 text-xs flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="px-3 py-1 bg-rose-500 text-slate-950 font-bold text-[10px] rounded-lg hover:bg-rose-400 shrink-0">
          Retry
        </button>
      )}
    </div>
  );
}

/** Payment & Transactions */
export function PaymentFailedCard({ message = 'Your payment transaction was declined or cancelled.', onTryAgain }) {
  return (
    <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center space-y-4">
      <CreditCard className="w-10 h-10 text-rose-400 mx-auto" />
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-white">Payment Declined</h4>
        <p className="text-xs text-slate-300">{message}</p>
      </div>
      {onTryAgain && (
        <button onClick={onTryAgain} className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-xl">
          Try Different Payment Method
        </button>
      )}
    </div>
  );
}

/** File Handling */
export function FileUploadErrorCard({ message = 'File upload failed. Check file size limit (Max 10MB).' }) {
  return (
    <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-3">
      <UploadCloud className="w-5 h-5 text-rose-400 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/** Search & Data */
export function NoSearchResultsCard({ query = '', onReset }) {
  return (
    <div className="py-12 text-center space-y-3">
      <Search className="w-10 h-10 text-slate-600 mx-auto" />
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-300">No Results Found</h4>
        <p className="text-xs text-slate-500">
          No matches found for {query ? <span className="text-amber-400 font-mono">"{query}"</span> : 'current filters'}.
        </p>
      </div>
      {onReset && (
        <button onClick={onReset} className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-lg">
          Reset Search
        </button>
      )}
    </div>
  );
}

export function EmptyStateCard({ title = 'No Data Available', message = 'No records have been created yet.' }) {
  return (
    <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-3xl p-6 space-y-3">
      <FileText className="w-10 h-10 text-slate-600 mx-auto" />
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-300">{title}</h4>
        <p className="text-xs text-slate-500">{message}</p>
      </div>
    </div>
  );
}

/* ==========================================================================
   SUCCESS STATES
   ========================================================================== */

export function SuccessStateAlert({ title = 'Action Completed Successfully', message }) {
  return (
    <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-100 flex items-center gap-3">
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      <div className="text-xs">
        <h5 className="font-bold">{title}</h5>
        {message && <p className="opacity-90">{message}</p>}
      </div>
    </div>
  );
}
