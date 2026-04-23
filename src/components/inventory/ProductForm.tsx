'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Box, Hash, Tag, Layers, Percent } from 'lucide-react';
import { useApp } from '@/lib/store';
import { Product, GSTRate } from '@/lib/types';
import toast from 'react-hot-toast';

interface ProductFormProps {
  onClose: () => void;
}

export default function ProductForm({ onClose }: ProductFormProps) {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState<Partial<Product>>({
    code: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    category: 'Cotton',
    hsn: '5208',
    gstRate: 5,
    primaryUnit: 'Meters',
    secondaryUnit: 'Pieces',
    conversionRatio: 20,
    currentStock: 0,
    lotCount: 0,
    lowStockThreshold: 100,
    costRate: 0,
    sellingRate: 0,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return toast.error('Name and Code are required');

    const newProduct: Product = {
      ...formData as Product,
      id: 'p-' + Math.random().toString(36).substring(2, 9),
      currentStock: 0,
      lotCount: 0,
    };

    dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
    toast.success('New Product Catalogued! 📦');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Add New SKU</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium uppercase tracking-tighter">Register a new product variant in your inventory catalog.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-300 hover:text-rose-500">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          {/* Identity Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <Box size={18} className="text-slate-400" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Identity</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Super Soft Cotton Silk"
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">SKU / Item Code</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Category</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all appearance-none"
                  >
                    <option>Cotton</option>
                    <option>Silk</option>
                    <option>Linen</option>
                    <option>Polyester</option>
                    <option>Embroidery</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">HSN Code</label>
                <input
                  type="text"
                  value={formData.hsn}
                  onChange={e => setFormData({ ...formData, hsn: e.target.value })}
                  placeholder="5208"
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">GST Rate (%)</label>
                <div className="relative">
                  <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <select
                    value={formData.gstRate}
                    onChange={e => setFormData({ ...formData, gstRate: parseInt(e.target.value) as GSTRate })}
                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all appearance-none"
                  >
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Logistics Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <Layers size={18} className="text-slate-400" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Unit & Scaling</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Primary Unit</label>
                <select
                  value={formData.primaryUnit}
                  onChange={e => setFormData({ ...formData, primaryUnit: e.target.value })}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all appearance-none"
                >
                  <option>Meters</option>
                  <option>Yards</option>
                  <option>Kgs</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Secondary Unit</label>
                <select
                  value={formData.secondaryUnit}
                  onChange={e => setFormData({ ...formData, secondaryUnit: e.target.value })}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all appearance-none"
                >
                  <option>Pieces</option>
                  <option>Rolls</option>
                  <option>Bundles</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Ratio (Mtr/Pc)</label>
                <input
                  type="number"
                  value={formData.conversionRatio}
                  onChange={e => setFormData({ ...formData, conversionRatio: parseFloat(e.target.value) })}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <Tag size={18} className="text-slate-400" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Default Pricing</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Purchase Rate (₹)</label>
                <input
                  type="number"
                  value={formData.costRate}
                  onChange={e => setFormData({ ...formData, costRate: parseFloat(e.target.value) })}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Standard Selling (₹)</label>
                <input
                  type="number"
                  value={formData.sellingRate}
                  onChange={e => setFormData({ ...formData, sellingRate: parseFloat(e.target.value) })}
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        </form>

        <div className="p-8 border-t border-slate-100 bg-slate-50 flex items-center justify-between sticky bottom-0 z-10">
          <button onClick={onClose} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Discard</button>
          <button 
            onClick={handleSave}
            className="btn-primary !h-12 px-12 text-sm"
          >
            <Save size={18} />
            Register SKU
          </button>
        </div>
      </motion.div>
    </div>
  );
}
