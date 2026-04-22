'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ChevronUp, ChevronDown, Edit2, FileText, Users, Upload } from 'lucide-react';
import { useApp } from '@/lib/store';
import { Customer } from '@/lib/types';
import { formatINRCompact, cn } from '@/lib/utils';
import { StatusBadge } from '@/components/dashboard/Dashboard';
import CustomerForm from './CustomerForm';
import ImportCustomersModal from './ImportCustomersModal';

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
      className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${active ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
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
  const [showImport, setShowImport] = useState(false);
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
          <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">Customers</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage your client database and credit terms.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowImport(true)}
            className="btn-ghost !h-11 px-6 text-xs"
          >
            <Upload size={18} />
            Bulk Import
          </button>
          <button 
            onClick={() => { setEditCustomer(null); setShowForm(true); }}
            className="btn-primary !h-11 px-6 text-xs"
          >
            <Plus size={18} />
            Add Customer
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="premium-card p-4 flex flex-col sm:flex-row gap-4 bg-white border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, GSTIN, phone, city..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all font-medium"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex bg-slate-50 p-1 rounded-xl overflow-x-auto no-scrollbar whitespace-nowrap border border-slate-200">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => { setFilter(chip); setPage(1); }}
              className={cn(
                "px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                filter === chip ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-900"
              )}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="premium-card overflow-hidden border-slate-200">
        <div className="overflow-x-auto no-scrollbar">
          <table className="premium-table">
            <thead>
              <tr>
                <th><SortBtn label="Customer Details" sortKey="legalName" current={sortKey} dir={sortDir} onClick={handleSort} /></th>
                <th className="hidden lg:table-cell"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">GSTIN Identification</span></th>
                <th className="hidden md:table-cell"><SortBtn label="Location" sortKey="city" current={sortKey} dir={sortDir} onClick={handleSort} /></th>
                <th className="text-right"><SortBtn label="Outstanding" sortKey="outstanding" current={sortKey} dir={sortDir} onClick={handleSort} /></th>
                <th className="text-center">Status</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.map((c, i) => (
                <motion.tr 
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group"
                >
                  <td data-label="Customer" className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-900 transition-all group-hover:bg-slate-900 group-hover:text-white">
                        {c.legalName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900 uppercase tracking-tight">{c.legalName}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">{c.code} • {c.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td data-label="GSTIN" className="py-5 px-6 hidden lg:table-cell">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg uppercase tabular-nums">
                      {c.gstin || 'NO-GST-REG'}
                    </span>
                  </td>
                  <td data-label="Location" className="py-5 px-6 hidden md:table-cell text-xs font-bold text-slate-900 uppercase tracking-tighter">
                    {c.city}
                  </td>
                  <td data-label="Outstanding" className="py-5 px-6 text-right font-bold text-slate-900 tabular-nums">
                    {formatINRCompact(c.outstanding)}
                  </td>
                  <td data-label="Status" className="py-5 px-6">
                    <div className="flex justify-center">
                      <StatusBadge status={c.status} />
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center justify-end gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(c)}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                        title="Edit Customer"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleNewInvoice(c)}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
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
                <Users size={80} className="text-slate-100 relative z-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest">No clients found</h3>
              <p className="text-slate-400 text-xs mt-2 max-w-xs font-medium uppercase tracking-tighter">We couldn&apos;t find any customers matching your current search or filters.</p>
              <button 
                onClick={() => { setSearch(''); setFilter('All'); }}
                className="mt-8 text-[10px] font-bold uppercase tracking-widest text-slate-900 bg-slate-100 px-6 py-2.5 rounded-xl hover:bg-slate-200 transition-all"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Page {page} of {totalPages} • {filtered.length} Results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 disabled:opacity-30 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm"
              >
                <ChevronUp size={16} className="-rotate-90" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "w-10 h-10 rounded-xl text-xs font-bold transition-all border",
                      page === p 
                        ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                        : "bg-white text-slate-400 border-slate-200 hover:text-slate-900 hover:border-slate-900"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 disabled:opacity-30 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm"
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
        {showImport && (
          <ImportCustomersModal
            onClose={() => setShowImport(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
