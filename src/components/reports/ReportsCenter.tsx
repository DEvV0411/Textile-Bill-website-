'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, ArrowUpRight, 
  ArrowDownRight, Calendar, Download, Filter
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { formatINR, formatINRCompact, formatDate, cn } from '@/lib/utils';

export default function ReportsCenter() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'customers' | 'inventory'>('overview');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // ─── Metrics ───────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const totalSales = state.invoices.reduce((acc, inv) => acc + inv.total, 0);
    const totalOutstanding = state.customers.reduce((acc, c) => acc + c.outstanding, 0);
    const totalCollections = totalSales - totalOutstanding; // Simplified
    
    return [
      { label: 'Total Sales', value: formatINRCompact(totalSales), trend: '+12%', up: true, icon: <TrendingUp size={20} className="text-slate-900" /> },
      { label: 'Outstanding', value: formatINRCompact(totalOutstanding), trend: '+5%', up: false, icon: <ArrowUpRight size={20} className="text-rose-500" /> },
      { label: 'Collections', value: formatINRCompact(totalCollections), trend: '+8%', up: true, icon: <ArrowDownRight size={20} className="text-emerald-600" /> },
      { label: 'Active Clients', value: state.customers.filter(c => c.status === 'Active').length, trend: '0%', up: true, icon: <Users size={20} className="text-slate-900" /> },
    ];
  }, [state.invoices, state.customers]);

  // ─── Top Customers ─────────────────────────────────────────────────────────
  const topCustomers = useMemo(() => {
    return [...state.customers]
      .sort((a, b) => b.outstanding - a.outstanding)
      .slice(0, 5);
  }, [state.customers]);

  // ─── Recent Sales ──────────────────────────────────────────────────────────
  const recentInvoices = useMemo(() => {
    return [...state.invoices]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [state.invoices]);

  // ─── Chart Data ────────────────────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const totals = Array(12).fill(0);
    
    state.invoices.forEach(inv => {
      const date = new Date(inv.createdAt);
      if (date.getFullYear() === currentYear) {
        totals[date.getMonth()] += inv.total;
      }
    });

    const max = Math.max(...totals, 100000);
    return totals.map(t => ({ amount: t, height: (t / max) * 100 }));
  }, [state.invoices]);

  return (
    <div ref={scrollRef} className="space-y-8 pb-10 overflow-y-auto h-full no-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">Reports Hub</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Real-time analytics and financial health overview.</p>
        </div>
        <div className="flex flex-row sm:flex-row gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Calendar size={14} /> {new Date().getFullYear()} Forecast
          </button>
          <button 
            onClick={() => {
              const csv = [
                ['Invoice #', 'Customer', 'Date', 'Amount', 'Status'],
                ...state.invoices.map(inv => [inv.number, inv.customerName, inv.createdAt.split('T')[0], inv.total, inv.status])
              ].map(r => r.join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-black transition-all"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                {m.icon}
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${m.up ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                {m.trend}
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{m.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Revenue Forecast ({new Date().getFullYear()})</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real Revenue</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-3 pt-4">
            {monthlyData.map((d, i) => (
              <div key={i} className="flex-1 group relative">
                <motion.div 
                   initial={{ height: 0 }}
                   animate={{ height: `${d.height}%` }}
                   transition={{ delay: i * 0.05, duration: 1 }}
                   className={cn(
                     "w-full bg-slate-900 rounded-t-lg group-hover:bg-black transition-all cursor-pointer shadow-md",
                     d.amount === 0 && "h-[2px] bg-slate-100"
                   )}
                />
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-10 shadow-xl border border-white/10">
                  {formatINRCompact(d.amount)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-6 px-1">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
              <span key={m} className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{m}</span>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-8">Top Debtors</h3>
          <div className="space-y-6">
            {topCustomers.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-900">
                    {c.legalName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[140px] uppercase">{c.legalName}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{c.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900 tabular-nums">{formatINRCompact(c.outstanding)}</p>
                  <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tighter">{c.status}</p>
                </div>
              </div>
            ))}
            {topCustomers.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-10 italic font-medium">No data available</p>
            )}
          </div>
          <button className="w-full mt-10 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-all">
            View All Debtors
          </button>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Recent Transactions</h3>
          <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <Filter size={16} className="text-slate-400" />
          </button>
        </div>
        <div ref={scrollRef} className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="py-4 px-8">Invoice #</th>
                <th className="py-4 px-8">Customer</th>
                <th className="py-4 px-8">Date</th>
                <th className="py-4 px-8 text-right">Amount</th>
                <th className="py-4 px-8 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td data-label="Invoice #" className="py-5 px-8 text-xs font-bold text-slate-900">{inv.number}</td>
                  <td data-label="Customer" className="py-5 px-8 text-xs font-bold text-slate-900 uppercase">{inv.customerName}</td>
                  <td data-label="Date" className="py-5 px-8 text-xs text-slate-400 font-medium">{formatDate(inv.createdAt)}</td>
                  <td data-label="Amount" className="py-5 px-8 text-xs font-bold text-slate-900 text-right tabular-nums">{formatINR(inv.total)}</td>
                  <td data-label="Status" className="py-5 px-8 text-center">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                      inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      inv.status === 'PART-PAID' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs italic font-medium">
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
