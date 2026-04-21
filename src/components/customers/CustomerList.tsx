'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ChevronUp, ChevronDown, Eye, Edit2, FileText, Users } from 'lucide-react';
import { useApp } from '@/lib/store';
import { Customer } from '@/lib/types';
import { formatINRCompact, formatDate, creditUsagePercent, cn } from '@/lib/utils';
import { StatusBadge } from '@/components/dashboard/Dashboard';
import CustomerForm from './CustomerForm';

type FilterChip = 'All' | 'Overdue' | 'Active' | 'Inactive';
type SortKey = 'code' | 'legalName' | 'city' | 'outstanding' | 'lastTransaction';
type SortDir = 'asc' | 'desc';


// ─── Sort Button ──────────────────────────────────────────────────────────────
function SortBtn({ label, sortKey, current, dir, onClick }: {
  label: string; sortKey: SortKey; current: SortKey; dir: SortDir;
  onClick: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <button
      onClick={() => onClick(sortKey)}
      className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${active ? 'text-violet-600' : 'text-gray-500 hover:text-gray-700'}`}
    >
      {label}
      {active ? (dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
    </button>
  );
}

// ─── Main Customer List ───────────────────────────────────────────────────────
export default function CustomerList() {
  const { state, navigate, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterChip>('All');
  const [sortKey, setSortKey] = useState<SortKey>('code');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const PAGE_SIZE = 10;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let list = state.customers;
    if (filter !== 'All') list = list.filter(c => c.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.legalName.toLowerCase().includes(q) ||
        c.tradeName.toLowerCase().includes(q) ||
        c.gstin.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let av: string | number = '', bv: string | number = '';
      if (sortKey === 'code') { av = a.code; bv = b.code; }
      else if (sortKey === 'legalName') { av = a.legalName; bv = b.legalName; }
      else if (sortKey === 'city') { av = a.city; bv = b.city; }
      else if (sortKey === 'outstanding') { av = a.outstanding; bv = b.outstanding; }
      else if (sortKey === 'lastTransaction') { av = a.lastTransaction || ''; bv = b.lastTransaction || ''; }
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === 'asc' ? av - (bv as number) : (bv as number) - av;
    });
    return list;
  }, [state.customers, filter, search, sortKey, sortDir]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const handleEdit = (c: Customer) => { setEditCustomer(c); setShowForm(true); };
  const handleNewInvoice = (c: Customer) => {
    dispatch({ type: 'SET_RECENT_CUSTOMER', payload: c.id });
    navigate('invoice');
  };

  const FILTER_CHIPS: FilterChip[] = ['All', 'Active', 'Overdue', 'Inactive'];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-black text-brand-text-dark uppercase tracking-tight">Customers</h2>
          <p className="text-brand-text-muted text-sm mt-1">Total {state.customers.length} business entities onboarded.</p>
        </div>
        <button 
          onClick={() => { setEditCustomer(null); setShowForm(true); }}
          className="btn-primary"
        >
          <Plus size={18} />
          Add New Customer
        </button>
      </div>

      {/* Filters Bar */}
      <div className="premium-card p-4 flex flex-col sm:flex-row gap-4 bg-white/50 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search by name, GSTIN, phone, city..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-brand-border rounded-2xl text-sm focus:ring-4 focus:ring-violet-500/5 focus:border-violet-400 outline-none transition-all"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-2xl overflow-x-auto no-scrollbar whitespace-nowrap">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => { setFilter(chip); setPage(1); }}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                filter === chip ? "bg-white text-violet-600 shadow-sm" : "text-brand-text-muted hover:text-brand-text-dark"
              )}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="premium-table">
            <thead>
              <tr>
                <th><SortBtn label="Customer Details" sortKey="legalName" current={sortKey} dir={sortDir} onClick={handleSort} /></th>
                <th className="hidden lg:table-cell"><span className="text-xs font-black uppercase tracking-widest text-violet-600">GSTIN</span></th>
                <th className="hidden md:table-cell"><SortBtn label="Location" sortKey="city" current={sortKey} dir={sortDir} onClick={handleSort} /></th>
                <th className="text-right"><SortBtn label="Outstanding" sortKey="outstanding" current={sortKey} dir={sortDir} onClick={handleSort} /></th>
                <th className="text-center">Status</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.map((c, i) => (
                <motion.tr 
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group"
                >
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-violet-50 flex items-center justify-center text-xs font-black text-violet-600 shadow-inner group-hover:scale-110 transition-transform">
                        {c.legalName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-brand-text-dark uppercase tracking-tight">{c.legalName}</p>
                        <p className="text-[10px] font-bold text-brand-text-muted mt-0.5 tracking-widest">{c.code} • {c.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 hidden lg:table-cell">
                    <span className="text-[11px] font-mono font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                      {c.gstin || 'No GSTIN'}
                    </span>
                  </td>
                  <td className="py-5 px-6 hidden md:table-cell text-xs font-bold text-brand-text-dark uppercase tracking-tighter">
                    {c.city}
                  </td>
                  <td className="py-5 px-6 text-right font-serif font-black text-brand-text-dark italic">
                    {formatINRCompact(c.outstanding)}
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex justify-center">
                      <StatusBadge status={c.status} />
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(c)}
                        className="p-2 text-violet-600 hover:bg-violet-50 rounded-xl transition-all"
                        title="Edit Customer"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleNewInvoice(c)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                        title="New Invoice"
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-violet-200 blur-3xl opacity-20 rounded-full scale-150 animate-pulse"></div>
                <Users size={80} className="text-violet-200 relative z-10" />
              </div>
              <h3 className="text-lg font-serif font-black text-brand-text-dark uppercase tracking-widest">No clients found</h3>
              <p className="text-brand-text-muted text-xs mt-2 max-w-xs">We couldn&apos;t find any customers matching your current search or filters.</p>
              <button 
                onClick={() => { setSearch(''); setFilter('All'); }}
                className="mt-6 text-[10px] font-black uppercase tracking-widest text-violet-600 border-b border-violet-200 pb-1 hover:border-violet-600 transition-all"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-gray-200 text-gray-400 disabled:opacity-30 hover:bg-white hover:text-violet-600 hover:border-violet-200 transition-all"
              >
                <ChevronUp size={16} className="-rotate-90" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "w-8 h-8 rounded-xl text-xs font-black transition-all",
                    page === p 
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" 
                      : "text-brand-text-muted hover:bg-white hover:text-violet-600"
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-gray-200 text-gray-400 disabled:opacity-30 hover:bg-white hover:text-violet-600 hover:border-violet-200 transition-all"
              >
                <ChevronUp size={16} className="rotate-90" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <CustomerForm
            customer={editCustomer}
            onClose={() => { setShowForm(false); setEditCustomer(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
