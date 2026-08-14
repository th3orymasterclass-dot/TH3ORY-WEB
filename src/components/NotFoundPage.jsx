import React from 'react';
import { Home, Search, ArrowLeft } from 'lucide-react';
import Logo from './Logo';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        <a href="#" className="inline-block">
          <Logo className="h-10 mx-auto" />
        </a>

        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 tracking-tighter">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-extrabold text-white">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            The page or module route you are looking for does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="#"
            className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Go To Homepage
          </a>

          <a
            href="/#/student"
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
          >
            Student Login
          </a>
        </div>
      </div>
    </div>
  );
}
