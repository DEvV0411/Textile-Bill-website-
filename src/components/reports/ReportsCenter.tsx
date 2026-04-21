'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Users, ArrowUpRight, 
  ArrowDownRight, Calendar, Download, Filter
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { formatINR, formatINRCompact, formatDate } from '@/lib/utils';

export default function ReportsCenter() {
  const { state } = useApp();

  // ─── Metrics ───────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const totalSales = state.invoices.reduce((acc, inv) => acc + inv.total, 0);
    const totalOutstanding = state.customers.reduce((acc, c) => acc + c.outstanding, 0);
    const totalCollections = totalSales - totalOutstanding; // Simplified
    
    return [
      { label: 'Total Sales', value: formatINRCompact(totalSales), trend: '+12%', up: true, icon: <TrendingUp size={20} className="text-violet-500" /> },
      { label: 'Outstanding', value: formatINRCompact(totalOutstanding), trend: '+5%', up: false, icon: <ArrowUpRight size={20} className="text-red-500" /> },
      { label: 'Collections', value: formatINRCompact(totalCollections), trend: '+8%', up: true, icon: <ArrowDownRight size={20} className="text-emerald-500" /> },
      { label: 'Active Clients', value: state.customers.filter(c => c.status === 'Active').length, trend: '0%', up: true, icon: <Users size={20} className="text-indigo-500" /> },
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

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports Hub</h2>
          <p className="text-gray-500 text-sm">Real-time analytics and financial health overview.</p>
        </div>
        <div className="flex flex-row sm:flex-row gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-white border border-gray-200 rounded-xl text-[10px] sm:text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <Calendar size={14} /> Last 30 Days
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-violet-600 text-white rounded-xl text-[10px] sm:text-xs font-bold shadow-lg shadow-violet-500/20 hover:bg-violet-700 transition-all">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-gray-50 rounded-2xl">
                {m.icon}
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${m.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {m.trend}
              </span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{m.label}</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{m.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Chart Placeholder */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Revenue Forecast</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                <span className="text-[10px] text-gray-400 font-bold">This Year</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gray-200" />
                <span className="text-[10px] text-gray-400 font-bold">Last Year</span>
              </div>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 pt-4">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
              <div key={i} className="flex-1 group relative">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.05, duration: 1 }}
                  className="w-full bg-gradient-to-t from-violet-600 to-indigo-400 rounded-t-lg group-hover:from-violet-500 group-hover:to-indigo-300 transition-all cursor-pointer shadow-lg shadow-violet-500/10"
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  ₹{h * 10}k
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 px-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
              <span key={m} className="text-[10px] font-bold text-gray-300 uppercase">{m}</span>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Top Debtors</h3>
          <div className="space-y-5">
            {topCustomers.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600">
                    {c.legalName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900 truncate max-w-[120px]">{c.legalName}</p>
                    <p className="text-[10px] text-gray-400">{c.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-gray-900">{formatINRCompact(c.outstanding)}</p>
                  <p className="text-[10px] text-red-500 font-bold">{c.status}</p>
                </div>
              </div>
            ))}
            {topCustomers.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-10 italic">No data available</p>
            )}
          </div>
          <button className="w-full mt-6 py-2 border border-violet-100 text-violet-600 text-[10px] font-black uppercase rounded-xl hover:bg-violet-50 transition-all">
            View All Debtors
          </button>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Recent Transactions</h3>
          <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <Filter size={16} className="text-gray-400" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="py-4 px-6">Invoice #</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-xs font-mono font-bold text-violet-600">{inv.number}</td>
                  <td className="py-4 px-6 text-xs font-bold text-gray-900">{inv.customerName}</td>
                  <td className="py-4 px-6 text-xs text-gray-400">{formatDate(inv.createdAt)}</td>
                  <td className="py-4 px-6 text-xs font-black text-gray-900 text-right">{formatINR(inv.total)}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
                      inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 
                      inv.status === 'PART-PAID' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-xs italic">
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
