'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Search, Plus, Warehouse, AlertCircle,
  TrendingUp, ShoppingBag, 
  ChevronRight, Box, Filter, History, Save
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Stock Item Card ─────────────────────────────────────────────────────────
function StockItem({ product, index }: { product: Product; index: number }) {
  const isLow = product.currentStock < product.lowStockThreshold;

  return (
    <motion.tr 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <td className="py-5 px-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform",
            isLow ? "bg-red-50 text-red-500" : "bg-violet-50 text-violet-600"
          )}>
            <Package size={18} />
          </div>
          <div>
            <p className="text-xs font-black text-brand-text-dark uppercase tracking-tight">{product.name}</p>
            <p className="text-[10px] font-bold text-brand-text-muted mt-0.5 tracking-widest uppercase">{product.code} • HSN {product.hsn}</p>
          </div>
        </div>
      </td>
      <td className="py-5 px-6">
        <span className="px-2.5 py-1 bg-gray-100 text-brand-text-muted text-[10px] font-black uppercase tracking-widest rounded-lg">
          {product.category}
        </span>
      </td>
      <td className="py-5 px-6 text-right">
        <div>
          <p className={cn("text-xs font-black tabular-nums", isLow ? "text-red-500" : "text-brand-text-dark")}>
            {product.currentStock.toLocaleString('en-IN')} <span className="text-[10px] font-bold opacity-60">MTR</span>
          </p>
          <p className="text-[9px] font-bold text-brand-text-muted uppercase tracking-tighter mt-0.5">
            ~{Math.round(product.currentStock / product.conversionRatio)} {product.secondaryUnit}S
          </p>
        </div>
      </td>
      <td className="py-5 px-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 text-violet-600 text-[10px] font-black uppercase rounded-lg">
          <Warehouse size={10} />
          {product.lotCount} Lots
        </div>
      </td>
      <td className="py-5 px-6 text-right">
        {isLow ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-500 text-[10px] font-black uppercase rounded-lg">
            <AlertCircle size={10} />
            CRITICAL
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg">
            <TrendingUp size={10} />
            HEALTHY
          </div>
        )}
      </td>
      <td className="py-5 px-6">
        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 text-violet-600 hover:bg-violet-50 rounded-xl transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

// ─── Inventory Overview ───────────────────────────────────────────────────────
export default function InventoryOverview() {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = state.products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = state.products.filter(p => p.currentStock < p.lowStockThreshold).length;

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-black text-brand-text-dark uppercase tracking-tight">Inventory</h2>
          <p className="text-brand-text-muted text-sm mt-1">Manage physical stock, lots, and warehouse levels.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button className="btn-ghost px-5 w-full sm:w-auto">
            <History size={18} />
            Stock Ledger
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary w-full sm:w-auto">
            <Plus size={18} />
            Purchase Inward
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="premium-card p-6 flex items-center gap-4 bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl shadow-violet-500/20">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Box size={24} />
          </div>
          <div>
            <p className="text-2xl font-serif font-black">{state.products.length}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total SKU Items</p>
          </div>
        </div>
        
        <div className="premium-card p-6 flex items-center gap-4 border-red-100 bg-red-50/30">
          <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-2xl font-serif font-black text-red-600">{lowStockCount}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Low Stock Alerts</p>
          </div>
        </div>

        <div className="premium-card p-6 flex items-center gap-4 border-emerald-100 bg-emerald-50/30">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-2xl font-serif font-black text-emerald-600">₹4.2M</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Valuation at Cost</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="premium-card p-4 flex flex-col sm:flex-row gap-4 bg-white/50 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search products by name or SKU code..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-brand-border rounded-2xl text-sm focus:ring-4 focus:ring-violet-500/5 focus:border-violet-400 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-6 py-3 rounded-2xl bg-gray-100 text-brand-text-dark text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-200 transition-all">
          <Filter size={16} /> Advanced Filter
        </button>
      </div>

      {/* Main Table */}
      <div className="premium-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Item / SKU Code</th>
                <th>Category</th>
                <th className="text-right">On-Hand Stock</th>
                <th className="text-center">Batches / Lots</th>
                <th className="text-right">Stock Health</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((product, i) => (
                <StockItem key={product.id} product={product} index={i} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="relative mb-6">
                      <ShoppingBag size={80} className="text-violet-100 mx-auto" />
                    </div>
                    <h3 className="text-lg font-serif font-black text-brand-text-dark uppercase tracking-widest">No products found</h3>
                    <p className="text-brand-text-muted text-xs mt-2">Adjust your filters or add a new SKU to the catalog.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-brand-sidebar/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-serif font-black text-brand-text-dark uppercase tracking-tight">Stock Purchase Inward</h3>
                  <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest mt-1">Generating New Lot ID</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-300 hover:text-red-500"><Plus size={28} className="rotate-45" /></button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Select Catalog Product</label>
                  <select className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-400 transition-all">
                    {state.products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Quantity (Mtrs)</label>
                    <input type="number" className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-400 transition-all" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Cost Rate / Mtr</label>
                    <input type="number" className="w-full h-12 px-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-400 transition-all" placeholder="₹ 0.00" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-brand-text-muted uppercase tracking-widest ml-1">Warehouse Destination</label>
                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                    {['Main Godown', 'Showroom', 'Factory'].map(w => (
                      <button key={w} className="flex-1 min-w-[100px] py-3 rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-brand-text-muted hover:border-violet-200 hover:text-violet-600 transition-all">{w}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
                <button onClick={() => setShowAddModal(false)} className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Discard</button>
                <button 
                  onClick={() => {
                    toast.success('Inventory updated! 📦');
                    setShowAddModal(false);
                  }}
                  className="btn-primary px-12"
                >
                  <Save size={18} />
                  Record Inward
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
