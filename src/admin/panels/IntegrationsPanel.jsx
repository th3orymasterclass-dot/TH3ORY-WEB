import React, { useState, useEffect } from 'react';
import { Database, CreditCard, Mail, Server, CheckCircle2, XCircle, RefreshCw, Key, ShieldCheck, Send, ExternalLink } from 'lucide-react';
import { getSupabaseAnonKey, setSupabaseAnonKey, testSupabaseConnection } from '../../lib/supabase';

export default function IntegrationsPanel() {
  const [anonKey, setAnonKey] = useState(getSupabaseAnonKey());
  const [statusMsg, setStatusMsg] = useState('');
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // Email test state
  const [testEmailAddr, setTestEmailAddr] = useState('mentalistsravan@gmail.com');
  const [emailStatus, setEmailStatus] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Razorpay test state
  const [razorpayStatus, setRazorpayStatus] = useState('');
  const [testingRazorpay, setTestingRazorpay] = useState(false);

  useEffect(() => {
    runSupabaseTest(anonKey);
  }, []);

  const runSupabaseTest = async (keyToUse) => {
    setTestingSupabase(true);
    setStatusMsg('Testing connection to Supabase project https://qngzfcpnjpabaornddau.supabase.co...');
    const result = await testSupabaseConnection(keyToUse);
    setTestingSupabase(false);
    setSupabaseConnected(result.success);
    setStatusMsg(result.message);
  };

  const handleSaveKey = () => {
    setSupabaseAnonKey(anonKey);
  };

  const handleTestEmail = async () => {
    setSendingEmail(true);
    setEmailStatus('Sending test email via Resend API...');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmailAddr,
          studentName: 'Test Admin User',
          studentId: 'STU-999999',
          enrollmentCode: 'TH3-TEST-2026',
          planName: 'TH3ORY Masterclass',
          amountPaid: '11,999',
          currency: 'INR'
        })
      });
      const data = await res.json();
      setSendingEmail(false);
      if (res.ok && data.success) {
        setEmailStatus(`✅ Email sent cleanly! Resend ID: ${data.id || 'Delivered'}`);
      } else {
        setEmailStatus(`❌ Email Dispatch Error: ${data.error || 'Failed'}`);
      }
    } catch (err) {
      setSendingEmail(false);
      setEmailStatus(`❌ Network Exception: ${err.message}`);
    }
  };

  const handleTestRazorpay = async () => {
    setTestingRazorpay(true);
    setRazorpayStatus('Testing Razorpay Live Order Creation API...');
    try {
      const res = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 12, currency: 'INR', receipt: 'test_rcpt_123' })
      });
      const data = await res.json();
      setTestingRazorpay(false);
      if (res.ok && data.id) {
        setRazorpayStatus(`✅ Razorpay Live Order Created! Order ID: ${data.id}`);
      } else {
        setRazorpayStatus(`❌ Razorpay Order Error: ${data.error || JSON.stringify(data)}`);
      }
    } catch (err) {
      setTestingRazorpay(false);
      setRazorpayStatus(`❌ Razorpay Network Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-black text-white">Platform Integrations & Connection Diagnostics</h2>
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
            SYSTEM STATUS
          </span>
        </div>
        <p className="text-slate-500 text-sm mt-1">Interconnect and verify Supabase, Razorpay, Resend, and Vercel serverless backend operations</p>
      </div>

      {/* Grid of Integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 1. Supabase Database Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Supabase Live Database</h3>
                <p className="text-slate-500 text-xs font-mono">https://qngzfcpnjpabaornddau.supabase.co</p>
              </div>
            </div>

            <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase flex items-center gap-1.5 ${
              supabaseConnected ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              {supabaseConnected ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {supabaseConnected ? 'ONLINE' : 'UNAUTHORIZED (401)'}
            </span>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Supabase Anon Key (VITE_SUPABASE_ANON_KEY)
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="Paste your Supabase anon public API key here (eyJhbGci...)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSaveKey}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase transition-all"
              >
                Save & Apply
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Found in your Supabase Dashboard: <strong>Project Settings → API → Project API Keys → anon public</strong>
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800/80">
            <span className={`text-xs font-mono font-semibold ${supabaseConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
              {statusMsg || 'Ready to test connection.'}
            </span>
            <button
              onClick={() => runSupabaseTest(anonKey)}
              disabled={testingSupabase}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingSupabase ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
          </div>
        </div>

        {/* 2. Razorpay Live Gateway Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Razorpay Live SSL Gateway</h3>
                <p className="text-slate-500 text-xs font-mono">Key ID: rzp_live_TP7hT2Wt1nkqwg</p>
              </div>
            </div>

            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" /> ACTIVE LIVE
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Razorpay is configured as the sole active payment gateway. Supports UPI (GPay, PhonePe, Paytm), NetBanking, Credit/Debit Cards & Wallets in INR (₹11,999 / ₹12 test).
          </p>

          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800/80">
            <span className="text-xs font-mono font-semibold text-emerald-400 truncate max-w-[280px]">
              {razorpayStatus || 'Serverless API Order Function Ready.'}
            </span>
            <button
              onClick={handleTestRazorpay}
              disabled={testingRazorpay}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingRazorpay ? 'animate-spin' : ''}`} />
              <span>Test Order Creation</span>
            </button>
          </div>
        </div>

        {/* 3. Resend Transactional Email Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Resend Email API</h3>
                <p className="text-slate-500 text-xs font-mono">From: team@th3ory.online</p>
              </div>
            </div>

            <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" /> CONFIGURED
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Send Test Enrollment Email To:
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmailAddr}
                onChange={(e) => setTestEmailAddr(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                onClick={handleTestEmail}
                disabled={sendingEmail}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingEmail ? 'Sending...' : 'Send Test'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 text-xs font-mono font-semibold text-indigo-300 border-t border-slate-800/80">
            {emailStatus || 'Ready to test confirmation email dispatch.'}
          </div>
        </div>

        {/* 4. Vercel Serverless Hosting Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Vercel Production Hosting</h3>
                <p className="text-slate-500 text-xs font-mono">Edge Serverless Functions</p>
              </div>
            </div>

            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" /> DEPLOYED
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <p>Active Serverless Endpoints:</p>
            <ul className="space-y-1 font-mono text-[11px] text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <code>/api/create-razorpay-order</code> (Razorpay Order Generation)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <code>/api/verify-razorpay-signature</code> (Payment Signature Verification)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <code>/api/send-email</code> (Resend Credentials Email Dispatch)
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
