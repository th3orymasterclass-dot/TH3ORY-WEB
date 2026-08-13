import React, { useState } from 'react';
import { ShoppingBag, Search, Filter, Calendar, CreditCard, User, Mail, Phone, MapPin, CheckCircle, Clock, FileText, X, DollarSign } from 'lucide-react';

export default function EnrollmentsPanel({ enrollments = [] }) {
  const [search, setSearch] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('ALL');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  // Financial calculations
  const totalCount = enrollments.length;
  
  const totalRevenueINR = enrollments.reduce((sum, item) => {
    if (item.currency === 'INR') return sum + Number(item.amount_paid || 0);
    return sum;
  }, 0);

  const totalRevenueUSD = enrollments.reduce((sum, item) => {
    if (item.currency === 'USD' || !item.currency) return sum + Number(item.amount_paid || 0);
    return sum;
  }, 0);

  const filtered = enrollments.filter(e => {
    const q = search.toLowerCase();
    const matchSearch =
      (e.name || '').toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q) ||
      (e.order_id || '').toLowerCase().includes(q) ||
      (e.enrollment_code || '').toLowerCase().includes(q);

    const matchGateway =
      gatewayFilter === 'ALL' ||
      (e.gateway || '').toUpperCase() === gatewayFilter.toUpperCase();

    return matchSearch && matchGateway;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white">Student Enrollments & Sales</h2>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE REALTIME DB
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Real-time student transactions synced directly from Supabase</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">
            <span>Total Revenue (INR)</span>
            <span className="text-amber-400 font-bold">₹</span>
          </div>
          <div className="text-3xl font-black text-amber-400">
            ₹{totalRevenueINR.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">From INR transactions</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">
            <span>Total Revenue (USD)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            ${totalRevenueUSD.toLocaleString()} USD
          </div>
          <p className="text-[11px] text-slate-500 mt-1">From USD transactions</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">
            <span>Enrolled Students</span>
            <User className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-400">
            {totalCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Confirmed course purchases</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, email, order ID, or code..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={gatewayFilter}
            onChange={(e) => setGatewayFilter(e.target.value)}
            className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900 text-white">All Gateways</option>
            <option value="RAZORPAY" className="bg-slate-900 text-white">Razorpay</option>
            <option value="STRIPE" className="bg-slate-900 text-white">Stripe</option>
            <option value="PAYPAL" className="bg-slate-900 text-white">PayPal</option>
          </select>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Student Details</th>
                <th className="py-3.5 px-4">Plan Name</th>
                <th className="py-3.5 px-4">Amount Paid</th>
                <th className="py-3.5 px-4">Gateway</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                    No enrollments found matching search filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-xs font-bold text-amber-400">{item.order_id || 'ORD-LIVE'}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-sm">{item.name || 'Anonymous Student'}</div>
                      <div className="text-xs text-slate-400">{item.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-medium text-xs bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
                        {item.plan_name || 'TH3ORY Masterclass'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 font-mono">
                      {item.currency === 'INR' ? '₹' : '$'}{Number(item.amount_paid || 0).toLocaleString('en-IN')} {item.currency || 'USD'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${
                        (item.gateway || '').toLowerCase() === 'razorpay'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                      }`}>
                        {item.gateway || 'Razorpay'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedEnrollment(item)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enrollment Details Popup Modal */}
      {selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Enrollment Record Details</h3>
              </div>
              <button
                onClick={() => setSelectedEnrollment(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              {[
                ['Order ID', selectedEnrollment.order_id],
                ['Student Name', selectedEnrollment.name],
                ['Email', selectedEnrollment.email],
                ['Phone', selectedEnrollment.phone || 'N/A'],
                ['Country', selectedEnrollment.country || 'N/A'],
                ['Profession', selectedEnrollment.profession || 'N/A'],
                ['Plan', selectedEnrollment.plan_name],
                ['Amount Paid', `${selectedEnrollment.currency === 'INR' ? '₹' : '$'}${selectedEnrollment.amount_paid} ${selectedEnrollment.currency}`],
                ['Gateway', selectedEnrollment.gateway],
                ['Unique Code', selectedEnrollment.enrollment_code],
                ['Date Enrolled', selectedEnrollment.created_at ? new Date(selectedEnrollment.created_at).toLocaleString() : 'N/A'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-slate-800/60 last:border-0">
                  <span className="text-slate-500">{k}:</span>
                  <span className="text-white font-semibold text-right truncate max-w-[240px]">{v}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedEnrollment(null)}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
