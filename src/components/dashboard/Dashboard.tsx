'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, IndianRupee, FileText, Users, ShoppingBag, Clock, Calendar } from 'lucide-react';
import { useApp } from '@/lib/store';
import { formatINRCompact, cn } from '@/lib/utils';

// ─── Count-Up Hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = null;
    const animate = (now: number) => {
      if (!startTime.current) startTime.current = now;
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * ease));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return value;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ReactNode;
  gradient: string;
  change?: number;
  compact?: boolean;
  delay?: number;
}

function KPICard({ title, value, prefix = '', suffix = '', icon, change, compact, delay = 0 }: KPICardProps) {
  const displayValue = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="premium-card p-6 group cursor-pointer border-slate-200"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 text-slate-900 border border-slate-100 shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
              {icon}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{title}</span>
          </div>
          
          <div>
            <h3 className="text-3xl font-bold text-slate-900 tabular-nums flex items-baseline gap-1">
              <span className="text-slate-400 text-xl font-bold">{prefix}</span>
              {compact ? formatINRCompact(displayValue).replace('₹', '') : displayValue.toLocaleString('en-IN')}
              <span className="text-sm font-bold text-slate-400">{suffix}</span>
            </h3>
            
            {change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-tighter",
                change >= 0 ? "text-emerald-600" : "text-rose-600"
              )}>
                {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{Math.abs(change)}% vs last month</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Recent Activity ──────────────────────────────────────────────────────────
function RecentActivity() {
  const { state, navigate } = useApp();
  const recent = state.invoices.slice(-6).reverse();

  return (
    <div className="premium-card overflow-hidden border-slate-200 shadow-sm">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-900">Recent Invoices</h3>
        <button onClick={() => navigate('invoice')} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">
          View All →
        </button>
      </div>
      
      <div className="divide-y divide-slate-50">
        {recent.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <FileText size={40} className="mx-auto mb-4 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest">No activity found</p>
          </div>
        ) : (
          recent.map((inv, i) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-tight truncate">{inv.number}</p>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5 truncate uppercase tracking-tighter">{inv.customerName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 italic">{formatINRCompact(inv.total)}</p>
                <div className="mt-1">
                  <StatusBadge status={inv.status} small />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status, small }: { status: string; small?: boolean }) {
  const map: Record<string, string> = {
    DRAFT: 'border-slate-200 bg-slate-50 text-slate-500',
    ISSUED: 'border-blue-200 bg-blue-50 text-blue-600',
    PAID: 'border-emerald-200 bg-emerald-50 text-emerald-600',
    'PART-PAID': 'border-amber-200 bg-amber-50 text-amber-600',
    CANCELLED: 'border-rose-200 bg-rose-50 text-rose-500',
    Active: 'border-emerald-200 bg-emerald-50 text-emerald-600',
    Inactive: 'border-slate-200 bg-slate-50 text-slate-500',
    Overdue: 'border-rose-200 bg-rose-50 text-rose-600',
  };
  return (
    <span className={cn(
      "status-badge inline-flex border",
      small ? "px-2 py-0.5 text-[9px] rounded" : "px-3 py-1 text-[11px] rounded-md",
      map[status] || 'bg-slate-50 text-slate-600'
    )}>
      {status}
    </span>
  );
}

// ─── Quick Stats Bar ──────────────────────────────────────────────────────────
function QuickStats() {
  const { state } = useApp();
  const totalCustomers = state.customers.length;
  const overdueCount = state.customers.filter(c => c.status === 'Overdue').length;
  const lowStockCount = state.products.filter(p => p.currentStock < p.lowStockThreshold).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {[
        { label: 'Total Customers', value: totalCustomers, icon: <Users size={16} />, color: 'bg-slate-100 text-slate-900' },
        { label: 'Overdue Accounts', value: overdueCount, icon: <Clock size={16} />, color: 'bg-rose-50 text-rose-600' },
        { label: 'Low Stock Items', value: lowStockCount, icon: <ShoppingBag size={16} />, color: 'bg-amber-50 text-amber-600' },
      ].map((s, i) => (
        <div key={i} className="premium-card p-5 flex items-center gap-4 border-slate-200 shadow-sm">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100", s.color)}>
            {s.icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { state } = useApp();

  const todaySales = state.invoices
    .filter(inv => inv.issuedAt?.startsWith(new Date().toISOString().split('T')[0]))
    .reduce((s, inv) => s + inv.total, 0);


  const totalOutstanding = state.customers.reduce((s, c) => s + c.outstanding, 0);
  const invoicesToday = state.invoices.filter(
    inv => inv.createdAt.startsWith(new Date().toISOString().split('T')[0])
  ).length;

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Real-time summary of textile business metrics.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl border border-slate-200 shadow-sm">
          <Calendar size={14} className="text-slate-400" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Today, {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Today's Sales"
          value={todaySales}
          prefix="₹"
          icon={<IndianRupee size={18} />}
          gradient=""
          change={12}
          compact
          delay={0}
        />
        <KPICard
          title="Outstanding"
          value={totalOutstanding}
          prefix="₹"
          icon={<IndianRupee size={18} />}
          gradient=""
          change={-5}
          compact
          delay={0.1}
        />
        <KPICard
          title="Invoices Today"
          value={invoicesToday}
          icon={<FileText size={18} />}
          gradient=""
          change={8}
          delay={0.2}
        />
        <KPICard
          title="Overdue Items"
          value={state.customers.filter(c => c.status === 'Overdue').length}
          icon={<Clock size={18} />}
          gradient=""
          change={2}
          delay={0.3}
        />
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <RecentActivity />
        </div>

        <div className="lg:col-span-5 space-y-8">
          {/* Top Debtors */}
          <div className="premium-card p-6 border-slate-200 shadow-sm">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-900 mb-8 flex items-center gap-2">
              <div className="w-1 h-4 bg-slate-900 rounded-full" />
              Top Debtors
            </h3>
            
            <div className="space-y-6">
              {[...state.customers]
                .filter(c => c.outstanding > 0)
                .sort((a, b) => b.outstanding - a.outstanding)
                .slice(0, 5)
                .map((c) => (
                  <div key={c.id} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-[11px] font-bold text-slate-500 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all uppercase">
                      {c.legalName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate uppercase tracking-tight">{c.legalName}</p>
                      <p className="text-[9px] font-medium text-slate-500 mt-0.5 uppercase tracking-widest">{c.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900 italic">{formatINRCompact(c.outstanding)}</p>
                    </div>
                  </div>
                ))}
              {state.customers.filter(c => c.outstanding > 0).length === 0 && (
                <div className="text-center py-10 italic text-slate-400 text-xs">No pending dues</div>
              )}
            </div>
            
            <button className="w-full mt-10 h-11 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">
              Full Statement →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
