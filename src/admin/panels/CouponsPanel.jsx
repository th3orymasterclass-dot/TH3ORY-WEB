import React, { useState } from 'react';
import {
  Tag, Plus, Search, CheckCircle2, XCircle, Edit3, Trash2,
  Copy, ExternalLink, RefreshCw, Users, Percent, DollarSign,
  Calendar, ShieldCheck, Building2, ChevronRight, BarChart3, AlertCircle, X
} from 'lucide-react';
import { getCoupons, saveCoupons, defaultCoupons } from '../../data/adminData';

export default function CouponsPanel({ save, enrollments = [] }) {
  const [coupons, setCoupons] = useState(() => getCoupons());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [activeTab, setActiveTab] = useState('coupons'); // 'coupons' | 'track'

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    affiliation: '',
    discountType: 'percentage', // 'percentage' | 'fixed'
    discountValue: 20,
    partnerContact: '',
    description: '',
    validUntil: '2027-12-31',
    maxUses: 100,
    isActive: true,
    targetPlan: 'all',
  });

  const persistCoupons = (updatedList) => {
    setCoupons(updatedList);
    try {
      localStorage.setItem('th3ory_admin_coupons', JSON.stringify(updatedList));
      save('coupons', updatedList);
    } catch (err) {
      console.error('Error saving coupons:', err);
    }
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      affiliation: '',
      discountType: 'percentage',
      discountValue: 20,
      partnerContact: '',
      description: '',
      validUntil: '2027-12-31',
      maxUses: 100,
      isActive: true,
      targetPlan: 'all',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      affiliation: coupon.affiliation || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || 20,
      partnerContact: coupon.partnerContact || '',
      description: coupon.description || '',
      validUntil: coupon.validUntil || '',
      maxUses: coupon.maxUses || '',
      isActive: coupon.isActive ?? true,
      targetPlan: coupon.targetPlan || 'all',
    });
    setIsModalOpen(true);
  };

  const handleSaveCoupon = (e) => {
    e.preventDefault();
    const cleanCode = formData.code.trim().toUpperCase();
    if (!cleanCode) {
      alert('Please specify a valid coupon code.');
      return;
    }
    if (!formData.affiliation.trim()) {
      alert('Please specify an affiliation partner name.');
      return;
    }

    if (editingCoupon) {
      // Update existing
      const updated = coupons.map(c => c.id === editingCoupon.id ? {
        ...c,
        code: cleanCode,
        affiliation: formData.affiliation.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        partnerContact: formData.partnerContact.trim(),
        description: formData.description.trim(),
        validUntil: formData.validUntil,
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        isActive: Boolean(formData.isActive),
        targetPlan: formData.targetPlan,
      } : c);
      persistCoupons(updated);
    } else {
      // Check duplicate code
      if (coupons.some(c => c.code.toUpperCase() === cleanCode)) {
        alert(`Coupon code '${cleanCode}' already exists! Please use a unique code.`);
        return;
      }
      const newCoupon = {
        id: `c_${Date.now()}`,
        code: cleanCode,
        affiliation: formData.affiliation.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        partnerContact: formData.partnerContact.trim(),
        description: formData.description.trim(),
        validUntil: formData.validUntil,
        maxUses: formData.maxUses ? Number(formData.maxUses) : null,
        usedCount: 0,
        isActive: Boolean(formData.isActive),
        targetPlan: formData.targetPlan,
        createdAt: new Date().toISOString(),
      };
      persistCoupons([newCoupon, ...coupons]);
    }

    setIsModalOpen(false);
  };

  const toggleCouponActive = (id) => {
    const updated = coupons.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c);
    persistCoupons(updated);
  };

  const handleDeleteCoupon = (id, code) => {
    if (confirm(`Are you sure you want to delete coupon '${code}'?`)) {
      const updated = coupons.filter(c => c.id !== id);
      persistCoupons(updated);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all custom offer coupons to system defaults?')) {
      persistCoupons(defaultCoupons);
    }
  };

  const handleCopyLink = (code) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://th3ory.online';
    const link = `${origin}/enroll?coupon=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Metrics Calculations
  const activeCount = coupons.filter(c => c.isActive).length;
  const affiliationPartners = new Set(coupons.map(c => c.affiliation)).size;
  const totalUsages = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  // Filtered Coupons
  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.affiliation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true :
                          statusFilter === 'active' ? c.isActive : !c.isActive;
    return matchesSearch && matchesStatus;
  });

  // Tracked Enrollments matching Affiliation coupons
  const affiliationEnrollments = enrollments.filter(e => e.coupon_code && e.coupon_code !== 'NONE');

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Custom Offers & Affiliations</h1>
            <span className="text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
              RAZORPAY LIVE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Create, manage, and track custom discount offer coupons for colleges, institutional partners, and affiliate programs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Defaults
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Create Custom Offer
          </button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Custom Offers</span>
            <Tag className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{activeCount} <span className="text-xs text-slate-500 font-normal">/ {coupons.length} Total</span></p>
          <p className="text-[11px] text-emerald-400 font-semibold">Live in Razorpay Window</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Affiliation Partners</span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{affiliationPartners}</p>
          <p className="text-[11px] text-slate-400">Institutions & Communities</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Usages Tracked</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-300">{totalUsages}</p>
          <p className="text-[11px] text-slate-400">Applications Across Cohorts</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Affiliation Enrollments</span>
            <BarChart3 className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-sky-400">{affiliationEnrollments.length}</p>
          <p className="text-[11px] text-slate-400">Tracked Student Applications</p>
        </div>
      </div>

      {/* Tab Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('coupons')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'coupons' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" /> Managed Offers ({coupons.length})
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'track' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Affiliation Tracker ({affiliationEnrollments.length})
          </button>
        </div>

        {activeTab === 'coupons' && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search offer or affiliation..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: MANAGED OFFERS TABLE */}
      {activeTab === 'coupons' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Coupon Code & Link</th>
                  <th className="px-4 py-3.5">Affiliation Partner</th>
                  <th className="px-4 py-3.5">Discount Offer</th>
                  <th className="px-4 py-3.5">Target Plan</th>
                  <th className="px-4 py-3.5">Usages / Limit</th>
                  <th className="px-4 py-3.5">Validity</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      No custom offer coupons found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((coupon) => {
                    const isExpired = coupon.validUntil && new Date(coupon.validUntil) < new Date();
                    const isMaxedOut = coupon.maxUses && coupon.usedCount >= coupon.maxUses;
                    const isLive = coupon.isActive && !isExpired && !isMaxedOut;

                    return (
                      <tr key={coupon.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* Code & Direct Checkout Link */}
                        <td className="px-4 py-4 font-mono font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 text-xs">
                              {coupon.code}
                            </span>
                            <button
                              onClick={() => handleCopyLink(coupon.code)}
                              title="Copy direct shareable checkout link"
                              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedCode === coupon.code && (
                              <span className="text-[10px] font-sans text-emerald-400 font-bold animate-pulse">Link Copied!</span>
                            )}
                          </div>
                          {coupon.description && (
                            <p className="text-[10px] font-sans font-normal text-slate-400 mt-1 line-clamp-1">
                              {coupon.description}
                            </p>
                          )}
                        </td>

                        {/* Affiliation Partner */}
                        <td className="px-4 py-4 font-semibold text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{coupon.affiliation || 'General'}</span>
                          </div>
                          {coupon.partnerContact && (
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{coupon.partnerContact}</p>
                          )}
                        </td>

                        {/* Discount */}
                        <td className="px-4 py-4 font-bold text-emerald-400">
                          {coupon.discountType === 'percentage' ? (
                            <span className="flex items-center gap-1">
                              <Percent className="w-3 h-3" /> {coupon.discountValue}% OFF
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" /> ₹{coupon.discountValue?.toLocaleString('en-IN')} OFF
                            </span>
                          )}
                        </td>

                        {/* Target Plan */}
                        <td className="px-4 py-4 uppercase text-[10px] font-bold text-slate-400">
                          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                            {coupon.targetPlan || 'ALL'}
                          </span>
                        </td>

                        {/* Usages */}
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-200">
                            {coupon.usedCount || 0} / {coupon.maxUses || '∞'}
                          </div>
                          {coupon.maxUses && (
                            <div className="w-20 bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                              <div
                                className="bg-amber-500 h-full rounded-full"
                                style={{ width: `${Math.min(100, ((coupon.usedCount || 0) / coupon.maxUses) * 100)}%` }}
                              />
                            </div>
                          )}
                        </td>

                        {/* Validity */}
                        <td className="px-4 py-4 text-slate-400 text-[11px]">
                          {coupon.validUntil ? (
                            <span className={isExpired ? 'text-red-400 font-semibold' : ''}>
                              {new Date(coupon.validUntil).toLocaleDateString()}
                            </span>
                          ) : 'No Expiry'}
                        </td>

                        {/* Status Toggle */}
                        <td className="px-4 py-4">
                          <button
                            onClick={() => toggleCouponActive(coupon.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border transition-all ${
                              isLive
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                            }`}
                          >
                            {isLive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {isLive ? 'ACTIVE' : isExpired ? 'EXPIRED' : 'INACTIVE'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(coupon)}
                              title="Edit Offer"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                              title="Delete Offer"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AFFILIATION TRACKER TABLE */}
      {activeTab === 'track' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" /> Tracked Affiliation Enrollments
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live audit log of all student applications enrolled using custom affiliation coupon codes.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Order ID & Date</th>
                  <th className="px-4 py-3.5">Student Name & Email</th>
                  <th className="px-4 py-3.5">Affiliation Partner</th>
                  <th className="px-4 py-3.5">Coupon Applied</th>
                  <th className="px-4 py-3.5">Discount (%)</th>
                  <th className="px-4 py-3.5">Amount Paid</th>
                  <th className="px-4 py-3.5">Gateway</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {affiliationEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No student enrollments recorded with custom affiliation coupons yet. Test an enrollment using a coupon like HARVARD30!
                    </td>
                  </tr>
                ) : (
                  affiliationEnrollments.map((enr, i) => (
                    <tr key={enr.id || i} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-400">
                        {enr.order_id || enr.orderId}
                        <p className="text-[10px] font-sans font-normal text-slate-500 mt-0.5">
                          {enr.created_at ? new Date(enr.created_at).toLocaleDateString() : 'Recent'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-white block">{enr.name || enr.studentName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{enr.email || enr.studentEmail}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-amber-400">
                        {enr.affiliation_name || enr.affiliationName || 'Affiliate Partner'}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-amber-300">
                        {enr.coupon_code || enr.couponCode}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-400">
                        {enr.discount_percentage ? `${enr.discount_percentage}% OFF` : 'Discounted'}
                      </td>
                      <td className="px-4 py-3 font-bold text-white">
                        {enr.currency === 'INR' ? '₹' : '$'}{enr.amount_paid || enr.price || enr.totalAmount}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300 uppercase">
                          {enr.gateway || 'Razorpay'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingCoupon ? 'Edit Custom Offer Coupon' : 'Create Custom Offer Coupon'}
                  </h3>
                  <p className="text-xs text-slate-400">Configure affiliation referral parameters for Razorpay checkout.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              
              {/* Coupon Code */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HARVARD30, SUMMER50"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Affiliation Partner */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Affiliation / Partner Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Harvard Alumni Network, IIT Delhi Lab"
                  value={formData.affiliation}
                  onChange={e => setFormData({ ...formData, affiliation: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Partner Contact */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Partner Contact Email / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="alumni@harvard.edu"
                  value={formData.partnerContact}
                  onChange={e => setFormData({ ...formData, partnerContact: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="percentage">Percentage (%) OFF</option>
                    <option value="fixed">Fixed Amount (₹ / $) OFF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min={1}
                    placeholder={formData.discountType === 'percentage' ? '20 (%)' : '5000 (INR)'}
                    value={formData.discountValue}
                    onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-emerald-400 font-bold placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Target Plan & Max Uses */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Target Plan Restriction
                  </label>
                  <select
                    value={formData.targetPlan}
                    onChange={e => setFormData({ ...formData, targetPlan: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">All Plans</option>
                    <option value="masterclass">Masterclass Only</option>
                    <option value="pro">Pro Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Max Usage Limit
                  </label>
                  <input
                    type="number"
                    placeholder="100 (or empty = ∞)"
                    value={formData.maxUses}
                    onChange={e => setFormData({ ...formData, maxUses: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Valid Until (Expiration Date)
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Description / Note
                </label>
                <textarea
                  rows={2}
                  placeholder="Internal notes regarding this partnership or promo campaign..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold text-white">Enable Offer for Live Razorpay Checkout</span>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              {/* Modal Submit Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 uppercase tracking-wider"
                >
                  {editingCoupon ? 'Save Changes' : 'Create Custom Offer'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
