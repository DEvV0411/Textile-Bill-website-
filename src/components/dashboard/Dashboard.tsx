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

function KPICard({ title, value, prefix = '', suffix = '', icon, gradient, change, compact, delay = 0 }: KPICardProps) {
  const displayValue = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className="premium-card p-6 group cursor-pointer relative overflow-hidden"
    >
      {/* Decorative Blob */}
      <div className={cn("absolute -right-4 -top-4 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500", gradient)} />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", gradient)}>
              {icon}
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-brand-text-muted">{title}</span>
          </div>
          
          <div>
            <h3 className="text-3xl font-serif font-black text-brand-text-dark tabular-nums flex items-baseline gap-1">
              <span className="text-violet-600/40 text-xl font-bold">{prefix}</span>
              {compact ? formatINRCompact(displayValue).replace('₹', '') : displayValue.toLocaleString('en-IN')}
              <span className="text-sm font-bold text-brand-text-muted">{suffix}</span>
            </h3>
            
            {change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-tighter",
                change >= 0 ? "text-emerald-500" : "text-red-500"
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
    <div className="premium-card overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-violet-50/30">
        <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-brand-text-dark">Recent Invoices</h3>
        <button onClick={() => navigate('invoice')} className="text-[10px] font-black uppercase tracking-widest text-violet-600 hover:text-violet-700 transition-colors">
          View All →
        </button>
      </div>
      
      <div className="divide-y divide-gray-50">
        {recent.length === 0 ? (
          <div className="text-center py-16 text-brand-text-muted">
            <FileText size={40} className="mx-auto mb-4 opacity-10" />
            <p className="text-xs font-bold uppercase tracking-widest">No activity found</p>
          </div>
        ) : (
          recent.map((inv, i) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-5 hover:bg-gray-50/80 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-brand-text-dark uppercase tracking-tight truncate">{inv.number}</p>
                <p className="text-[10px] font-bold text-brand-text-muted mt-0.5 truncate uppercase tracking-tighter">{inv.customerName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-serif font-black text-brand-text-dark italic">{formatINRCompact(inv.total)}</p>
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
    DRAFT: 'bg-gray-100 text-gray-500',
    ISSUED: 'bg-violet-100 text-violet-600',
    PAID: 'bg-emerald-100 text-emerald-600',
    'PART-PAID': 'bg-amber-100 text-amber-600',
    CANCELLED: 'bg-red-100 text-red-500',
    Active: 'bg-emerald-100 text-emerald-600',
    Inactive: 'bg-gray-100 text-gray-500',
    Overdue: 'bg-red-100 text-red-600',
  };
  return (
    <span className={cn(
      "status-badge inline-flex",
      small ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-[11px]",
      map[status] || 'bg-gray-100 text-gray-600'
    )}>
      <div className={cn("w-1 h-1 rounded-full", map[status]?.split(' ')[1].replace('text-', 'bg-'))} />
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
        { label: 'Total Customers', value: totalCustomers, icon: <Users size={16} />, color: 'bg-violet-50 text-violet-600' },
        { label: 'Overdue Accounts', value: overdueCount, icon: <Clock size={16} />, color: 'bg-red-50 text-red-500' },
        { label: 'Low Stock Items', value: lowStockCount, icon: <ShoppingBag size={16} />, color: 'bg-amber-50 text-amber-500' },
      ].map((s, i) => (
        <div key={i} className="premium-card p-5 flex items-center gap-4">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", s.color)}>
            {s.icon}
          </div>
          <div>
            <p className="text-2xl font-serif font-black text-brand-text-dark">{s.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted mt-0.5">{s.label}</p>
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
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-brand-text-dark">Overview</h2>
          <p className="text-brand-text-muted text-xs sm:text-sm mt-1">Quick summary of your textile business performance.</p>
        </div>
        <div className="flex items-center justify-center sm:justify-start gap-2 bg-white px-4 py-2 rounded-2xl border border-brand-border shadow-sm self-center sm:self-auto">
          <Calendar size={14} className="text-violet-500" />
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-text-dark">Today, {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Today's Sales"
          value={todaySales}
          prefix="₹"
          icon={<IndianRupee size={18} />}
          gradient="bg-gradient-to-r from-violet-500 to-purple-600"
          change={12}
          compact
          delay={0}
        />
        <KPICard
          title="Outstanding"
          value={totalOutstanding}
          prefix="₹"
          icon={<IndianRupee size={18} />}
          gradient="bg-gradient-to-r from-amber-500 to-orange-500"
          change={-5}
          compact
          delay={0.1}
        />
        <KPICard
          title="Invoices Today"
          value={invoicesToday}
          icon={<FileText size={18} />}
          gradient="bg-gradient-to-r from-indigo-500 to-blue-600"
          change={8}
          delay={0.2}
        />
        <KPICard
          title="Overdue Items"
          value={state.customers.filter(c => c.status === 'Overdue').length}
          icon={<Clock size={18} />}
          gradient="bg-gradient-to-r from-red-500 to-rose-600"
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
          <div className="premium-card p-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-brand-text-dark mb-6 flex items-center gap-2">
              <div className="w-1 h-4 bg-amber-500 rounded-full" />
              Top Debtors
            </h3>
            
            <div className="space-y-6">
              {[...state.customers]
                .filter(c => c.outstanding > 0)
                .sort((a, b) => b.outstanding - a.outstanding)
                .slice(0, 5)
                .map((c) => (
                  <div key={c.id} className="flex items-center gap-4 group">
                    <div className="w-9 h-9 rounded-full bg-brand-main flex items-center justify-center text-[11px] font-black text-brand-text-muted group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors uppercase">
                      {c.legalName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-brand-text-dark truncate uppercase tracking-tight">{c.legalName}</p>
                      <p className="text-[9px] font-bold text-brand-text-muted mt-0.5 uppercase tracking-widest">{c.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-serif font-black text-brand-text-dark italic">{formatINRCompact(c.outstanding)}</p>
                    </div>
                  </div>
                ))}
              {state.customers.filter(c => c.outstanding > 0).length === 0 && (
                <div className="text-center py-10 italic text-brand-text-muted text-xs">No pending dues</div>
              )}
            </div>
            
            <button className="w-full mt-8 py-3 rounded-2xl border border-violet-100 text-violet-600 text-[10px] font-black uppercase tracking-widest hover:bg-violet-50 transition-all">
              Full Statement →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
