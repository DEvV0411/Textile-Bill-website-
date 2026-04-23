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

import ProductForm from './ProductForm';

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
      <td data-label="Item / SKU" className="py-5 px-6">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
            isLow ? "bg-rose-50 text-rose-500 border border-rose-100" : "bg-slate-50 text-slate-900 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white"
          )}>
            <Package size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{product.name}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-widest uppercase">{product.code} • HSN {product.hsn}</p>
          </div>
        </div>
      </td>
      <td data-label="Category" className="py-5 px-6">
        <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-200">
          {product.category}
        </span>
      </td>
      <td data-label="On-Hand" className="py-5 px-6 text-right">
        <div>
          <p className={cn("text-xs font-bold tabular-nums", isLow ? "text-rose-600" : "text-slate-900")}>
            {product.currentStock.toLocaleString('en-IN')} <span className="text-[10px] font-medium opacity-60">MTR</span>
          </p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
            ~{Math.round(product.currentStock / product.conversionRatio)} {product.secondaryUnit}S
          </p>
        </div>
      </td>
      <td data-label="Lots" className="py-5 px-6 text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-900 text-[10px] font-bold uppercase rounded-lg border border-slate-200">
          <Warehouse size={10} />
          {product.lotCount} Lots
        </div>
      </td>
      <td data-label="Health" className="py-5 px-6 text-right">
        {isLow ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase rounded-lg border border-rose-100">
            <AlertCircle size={10} />
            CRITICAL
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-lg border border-emerald-100">
            <TrendingUp size={10} />
            HEALTHY
          </div>
        )}
      </td>
      <td className="py-5 px-6">
        <div className="flex items-center justify-end lg:opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all">
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
  const [showProductModal, setShowProductModal] = useState(false);

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
          <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">Inventory</h2>
          <p className="text-slate-500 text-sm mt-1">Manage physical stock, lots, and warehouse levels.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowProductModal(true)}
            className="btn-ghost !h-11 px-5 w-full sm:w-auto border border-slate-200"
          >
            <Plus size={18} />
            Add Product SKU
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary !h-11 w-full sm:w-auto text-sm">
            <Warehouse size={18} />
            Stock Inward
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="premium-card p-6 flex items-center gap-4 bg-slate-900 text-white shadow-xl border-slate-900">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
            <Box size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold">{state.products.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Total SKU Items</p>
          </div>
        </div>
        
        <div className="premium-card p-6 flex items-center gap-4 border-rose-100 bg-white">
          <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-lg">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-rose-600">{lowStockCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-400">Low Stock Alerts</p>
          </div>
        </div>

        <div className="premium-card p-6 flex items-center gap-4 border-slate-200 bg-white">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 border border-slate-200">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">₹4.2M</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Valuation at Cost</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="premium-card p-4 flex flex-col sm:flex-row gap-4 bg-white border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search products by name or SKU code..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-6 py-3 rounded-xl bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-md">
          <Filter size={16} /> Advanced Filter
        </button>
      </div>

      {/* Main Table */}
      <div className="premium-card overflow-hidden border-slate-200">
        <div className="overflow-x-auto no-scrollbar">
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
            <tbody className="divide-y divide-slate-50">
              {filtered.map((product, i) => (
                <StockItem key={product.id} product={product} index={i} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="relative mb-6">
                      <ShoppingBag size={80} className="text-slate-100 mx-auto" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-widest">No products found</h3>
                    <p className="text-slate-400 text-xs mt-2 font-medium">Adjust your filters or add a new SKU to the catalog.</p>
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
          <StockInwardModal onClose={() => setShowAddModal(false)} />
        )}
        {showProductModal && (
          <ProductForm onClose={() => setShowProductModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function StockInwardModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useApp();
  const [productId, setProductId] = useState(state.products[0]?.id || '');
  const [qty, setQty] = useState('');
  const [rate, setRate] = useState('');
  const [warehouse, setWarehouse] = useState('Main Godown');

  const handleSave = () => {
    if (!productId || !qty || !rate) return toast.error('All fields are required');
    
    const lot = {
      id: 'LOT-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      lotNo: 'LOT-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      productId,
      productName: state.products.find(p => p.id === productId)?.name || '',
      supplierId: 's-new',
      supplierName: 'New Supplier',
      quantity: Number(qty),
      costRate: Number(rate),
      warehouse,
      date: new Date().toISOString().split('T')[0],
    };

    dispatch({ type: 'ADD_LOT', payload: lot });
    toast.success('Inventory updated! 📦');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Stock Purchase Inward</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Generating New Lot ID</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Plus size={28} className="rotate-45" /></button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Select Catalog Product</label>
            <select 
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all cursor-pointer"
            >
              {state.products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Quantity (Mtrs)</label>
              <input 
                type="number" 
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all" 
                placeholder="0.00" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Cost Rate / Mtr</label>
              <input 
                type="number" 
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all" 
                placeholder="₹ 0.00" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Warehouse Destination</label>
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              {['Main Godown', 'Showroom', 'Factory'].map(w => (
                <button 
                  key={w} 
                  onClick={() => setWarehouse(w)}
                  className={cn(
                    "flex-1 min-w-[100px] py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all",
                    warehouse === w 
                      ? "border-slate-900 text-slate-900 bg-slate-50" 
                      : "border-slate-200 text-slate-400 hover:border-slate-400"
                  )}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50/50 flex items-center justify-between border-t border-slate-100">
          <button onClick={onClose} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900">Discard</button>
          <button 
            onClick={handleSave}
            className="btn-primary !h-11 px-12 text-sm"
          >
            <Save size={18} />
            Record Inward
          </button>
        </div>
      </motion.div>
    </div>
  );
}
