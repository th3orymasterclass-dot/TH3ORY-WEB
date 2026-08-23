import React, { useState } from 'react';
import { ShoppingBag, Search, Filter, Calendar, CreditCard, User, Mail, Phone, MapPin, CheckCircle, Clock, FileText, X, DollarSign } from 'lucide-react';

export default function EnrollmentsPanel({ enrollments = [], themeMode = 'dark' }) {
  const [search, setSearch] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('ALL');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);

  const isDark = themeMode === 'dark';

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
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Student Enrollments & Sales</h2>
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border ${
              isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE REALTIME DB
            </span>
          </div>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Real-time student transactions synced directly from Supabase</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`border rounded-2xl p-5 shadow-xs ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Verified Enrollments</p>
          <p className={`text-3xl font-black font-mono mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalCount}</p>
        </div>

        <div className={`border rounded-2xl p-5 shadow-xs ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>INR Revenue (Razorpay)</p>
          <p className="text-3xl font-black font-mono mt-1 text-emerald-600">₹{totalRevenueINR.toLocaleString('en-IN')}</p>
        </div>

        <div className={`border rounded-2xl p-5 shadow-xs ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>USD Revenue (Stripe/PayPal)</p>
          <p className="text-3xl font-black font-mono mt-1 text-emerald-600">${totalRevenueUSD.toLocaleString()} USD</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className={`border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="relative w-full sm:w-80">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, order ID..."
            className={`w-full border rounded-xl pl-9 pr-4 py-2 text-xs transition-all ${
              isDark ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <select
            value={gatewayFilter}
            onChange={e => setGatewayFilter(e.target.value)}
            className={`border rounded-xl px-3 py-2 text-xs transition-all ${
              isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          >
            <option value="ALL">All Gateways</option>
            <option value="RAZORPAY">Razorpay</option>
            <option value="STRIPE">Stripe</option>
            <option value="PAYPAL">PayPal</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={`border rounded-2xl p-5 shadow-xs ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-mono">
            No enrollment records match your search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b uppercase font-mono text-[10px] ${
                  isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
                }`}>
                  <th className="p-3">Student</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Enrollment Code</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Gateway</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-slate-200 text-slate-700'}`}>
                {filtered.map((item) => (
                  <tr key={item.id || item.order_id} className={isDark ? 'hover:bg-slate-800/30 transition-colors' : 'hover:bg-slate-50 transition-colors'}>
                    <td className={`p-3 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name || 'Anonymous Student'}</td>
                    <td className="p-3 font-mono text-indigo-600 font-semibold">{item.email}</td>
                    <td className="p-3 font-mono text-amber-500 font-bold">{item.enrollment_code || item.order_id?.slice(0, 8) || 'N/A'}</td>
                    <td className="p-3 font-mono font-bold text-emerald-600">
                      {item.currency === 'INR' ? `₹${item.amount_paid}` : `$${item.amount_paid} USD`}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        item.gateway === 'Razorpay' || item.gateway === 'RAZORPAY'
                          ? 'bg-blue-500/20 text-blue-600 border-blue-500/30'
                          : 'bg-purple-500/20 text-purple-600 border-purple-500/30'
                      }`}>
                        {item.gateway || 'Razorpay'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      {new Date(item.enrolled_at || item.created_at || Date.now()).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedEnrollment(item)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                      >
                        View Full
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedEnrollment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-indigo-500/40' : 'bg-white border-indigo-200'
          }`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-700/50">
              <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <FileText className="w-4 h-4 text-indigo-500" />
                Student Enrollment Receipt
              </h3>
              <button
                onClick={() => setSelectedEnrollment(null)}
                className={`p-1 rounded-lg ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-4 rounded-xl border font-mono text-xs space-y-2 ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <p><strong className="text-slate-500">Student Name:</strong> {selectedEnrollment.name}</p>
              <p><strong className="text-slate-500">Student Email:</strong> {selectedEnrollment.email}</p>
              <p><strong className="text-slate-500">Phone:</strong> {selectedEnrollment.phone || 'N/A'}</p>
              <p><strong className="text-slate-500">Profession:</strong> {selectedEnrollment.profession || 'N/A'}</p>
              <p><strong className="text-slate-500">Order ID:</strong> {selectedEnrollment.order_id || 'N/A'}</p>
              <p><strong className="text-slate-500">Payment Gateway:</strong> {selectedEnrollment.gateway || 'Razorpay'}</p>
              <p><strong className="text-slate-500">Amount Paid:</strong> {selectedEnrollment.currency === 'INR' ? `₹${selectedEnrollment.amount_paid}` : `$${selectedEnrollment.amount_paid} USD`}</p>
              <p><strong className="text-slate-500">Enrollment Date:</strong> {new Date(selectedEnrollment.enrolled_at || selectedEnrollment.created_at || Date.now()).toLocaleString()}</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedEnrollment(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
