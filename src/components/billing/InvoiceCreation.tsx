'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Trash2, Save, Search, Users,
  CheckCircle, FileText, Zap
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { 
  InvoiceLine, InvoiceType, Invoice, 
  InvoiceStatus
} from '@/lib/types';
import { 
  formatINR, amountToWords, generateInvoiceNumber, today, generateId,
  cn, formatDate, formatINRCompact, creditUsagePercent
} from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Main Invoice Creation ──────────────────────────────────────────────────
export default function InvoiceCreation() {
  const { state, dispatch, navigate } = useApp();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(state.recentCustomerIds[0] || '');
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('Tax Invoice');
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [notes, setNotes] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateLine = (id: string, updates: Partial<InvoiceLine>) => {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l;
      const nl = { ...l, ...updates };
      const taxable = nl.qtyPrimary * nl.rate;
      const gst = (taxable * nl.gstRate) / 100;
      return {
        ...nl,
        taxableAmount: taxable,
        gstAmount: gst,
        lineTotal: taxable + gst,
        cgst: gst / 2,
        sgst: gst / 2
      };
    }));
  };

  const selectedCustomer = state.customers.find(c => c.id === selectedCustomerId);

  // ─── Calculations ──────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const subtotal = lines.reduce((acc, l) => acc + l.taxableAmount, 0);
    const totalDiscount = lines.reduce((acc, l) => acc + l.discount, 0);
    const cgst = lines.reduce((acc, l) => acc + l.cgst, 0);
    const sgst = lines.reduce((acc, l) => acc + l.sgst, 0);
    const igst = lines.reduce((acc, l) => acc + l.igst, 0);
    const freight = 0;
    const total = subtotal + cgst + sgst + igst + freight;
    const roundOff = Math.round(total) - total;
    return { subtotal, totalDiscount, cgst, sgst, igst, freight, roundOff, total: Math.round(total) };
  }, [lines]);

  const handleIssue = (finalStatus: InvoiceStatus, overrideType?: InvoiceType) => {
    if (!selectedCustomerId) return toast.error('Please select a customer');
    if (lines.length === 0) return toast.error('Add at least one item');
    
    const type = overrideType || invoiceType;
    setSaving(true);
    
    setTimeout(() => {
      const invoice: Invoice = {
        id: generateId(),
        number: generateInvoiceNumber(state.invoiceCounter),
        type,
        customerId: selectedCustomerId,
        customerName: selectedCustomer!.legalName,
        customerGSTIN: selectedCustomer!.gstin,
        customerState: selectedCustomer!.state,
        lines,
        ...totals,
        status: finalStatus,
        irn: null,
        terms: 'Payment due within 30 days',
        transporter: '',
        vehicleNo: '',
        paymentTerms: selectedCustomer!.paymentTerms,
        bankAccount: 'HDFC Bank - 50100123456789',
        notes,
        payments: [],
        createdAt: new Date().toISOString(),
        issuedAt: finalStatus === 'ISSUED' ? new Date().toISOString() : null,
        sentAt: null,
        viewedAt: null,
        paidAt: null,
      };

      dispatch({ type: 'ADD_INVOICE', payload: invoice });
      dispatch({ type: 'INCREMENT_INVOICE_COUNTER' });
      setSaving(false);
      toast.success(`${type} generated successfully! 📑`);
      navigate('dashboard');
    }, 800);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:h-[calc(100vh-140px)] lg:overflow-hidden pb-20 lg:pb-0">
      {/* LEFT: Customer Selection */}
      <div className="w-full lg:w-80 flex flex-col gap-6 lg:overflow-y-auto custom-scrollbar lg:pr-2">
        <div className="premium-card p-6 space-y-6 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-text-dark">Entity Select</h3>
            <Users size={16} className="text-violet-600" />
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
              <select
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-violet-500/10 focus:bg-white appearance-none transition-all"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">Select Entity...</option>
                {state.customers.map(c => (
                  <option key={c.id} value={c.id}>{c.legalName}</option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-violet-600 rounded-3xl text-white shadow-xl shadow-violet-500/30"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xs font-black uppercase shadow-inner">
                    {selectedCustomer.legalName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black uppercase truncate">{selectedCustomer.legalName}</p>
                    <p className="text-[10px] text-violet-200 font-bold uppercase tracking-widest mt-0.5">{selectedCustomer.city}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-violet-200">Outstanding</span>
                    <span className="text-sm font-serif font-black italic">{formatINRCompact(selectedCustomer.outstanding)}</span>
                  </div>
                  <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${creditUsagePercent(selectedCustomer.outstanding, selectedCustomer.creditLimit)}%` }}
                      className="h-full bg-white rounded-full shadow-[0_0_8px_#fff]"
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter opacity-60">
                    <span>Used Credit</span>
                    <span>Limit: {formatINRCompact(selectedCustomer.creditLimit)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          <div className="pt-4 border-t border-gray-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted mb-3">Recently Active</p>
            <div className="flex flex-wrap gap-2">
              {state.recentCustomerIds.slice(0, 4).map(id => {
                const c = state.customers.find(cust => cust.id === id);
                if (!c) return null;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedCustomerId(id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all",
                      selectedCustomerId === id 
                        ? "bg-violet-100 text-violet-600 border-violet-200" 
                        : "bg-gray-50 text-gray-400 border border-transparent hover:border-gray-200"
                    )}
                  >
                    {c.legalName.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="premium-card p-6 bg-white/50 backdrop-blur-sm">
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-text-dark mb-4">Internal Memo</h3>
          <textarea
            placeholder="Notes for internal reference..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs outline-none focus:bg-white focus:ring-4 focus:ring-violet-500/5 transition-all resize-none"
          />
        </div>
      </div>

      {/* MAIN: Itemization */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <div className="premium-card flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-serif font-black text-brand-text-dark uppercase tracking-tight">Draft Transaction</h2>
              <p className="text-[10px] font-black text-brand-text-muted uppercase tracking-widest mt-1">
                {generateInvoiceNumber(state.invoiceCounter)} • {formatDate(today())}
              </p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-2xl">
              {(['Tax Invoice', 'Estimate'] as InvoiceType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setInvoiceType(t)}
                  className={cn(
                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    invoiceType === t ? "bg-white text-violet-600 shadow-sm" : "text-brand-text-muted hover:text-brand-text-dark"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className="premium-table">
              <thead>
                <tr>
                  <th className="w-12">#</th>
                  <th>Product / SKU Details</th>
                  <th className="text-center w-24">Qty (M)</th>
                  <th className="text-center w-20">Qty (P)</th>
                  <th className="text-right w-28">Rate</th>
                  <th className="text-right w-32">Total</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lines.map((line, idx) => (
                  <tr key={line.id} className="group">
                    <td className="py-4 px-6 text-[10px] font-black text-gray-300">{idx + 1}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                          {line.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-brand-text-dark uppercase truncate max-w-[180px]">{line.name}</p>
                          <p className="text-[10px] font-bold text-brand-text-muted mt-0.5 tracking-tighter uppercase">{line.variant} • HSN {line.hsn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center tabular-nums">
                      <input 
                        type="number"
                        value={line.qtyPrimary || ''}
                        onChange={(e) => updateLine(line.id, { qtyPrimary: Number(e.target.value) })}
                        className="w-16 bg-transparent text-center text-xs font-bold text-brand-text-dark outline-none focus:bg-violet-50 rounded p-1 transition-all"
                        placeholder="0"
                      />
                    </td>
                    <td className="py-4 px-6 text-center tabular-nums">
                      <input 
                        type="number"
                        value={line.qtySecondary || ''}
                        onChange={(e) => updateLine(line.id, { qtySecondary: Number(e.target.value) })}
                        className="w-16 bg-transparent text-center text-xs text-brand-text-muted outline-none focus:bg-violet-50 rounded p-1 transition-all"
                        placeholder="0"
                      />
                    </td>
                    <td className="py-4 px-6 text-right tabular-nums">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-[10px] text-gray-300">₹</span>
                        <input 
                          type="number"
                          value={line.rate || ''}
                          onChange={(e) => updateLine(line.id, { rate: Number(e.target.value) })}
                          className="w-20 bg-transparent text-right text-xs font-bold text-brand-text-dark outline-none focus:bg-violet-50 rounded p-1 transition-all"
                          placeholder="0.00"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right tabular-nums text-xs font-black text-violet-600 italic">
                      ₹{line.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => setLines(lines.filter(l => l.id !== line.id))}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={7} className="p-6">
                    <div className="relative">
                      {!showProductSearch ? (
                        <button 
                          onClick={() => setShowProductSearch(true)}
                          className="w-full py-4 border-2 border-dashed border-violet-100 rounded-3xl flex items-center justify-center gap-3 text-violet-600 text-xs font-black uppercase tracking-widest hover:bg-violet-50 transition-all group"
                        >
                          <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Add Product from Catalog
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400" size={18} />
                            <input
                              autoFocus
                              type="text"
                              placeholder="Search product by name, code or HSN..."
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  setShowProductSearch(false);
                                  setProductSearch('');
                                }
                              }}
                              className="w-full pl-12 pr-4 py-4 bg-violet-50/50 border-2 border-violet-100 rounded-3xl text-sm font-bold text-brand-text-dark outline-none focus:border-violet-400 focus:bg-white transition-all"
                            />
                            <button 
                              onClick={() => { setShowProductSearch(false); setProductSearch(''); }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-violet-600 hover:text-violet-800"
                            >
                              Cancel
                            </button>
                          </div>

                          {productSearch.trim() && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-white border border-violet-100 rounded-3xl shadow-xl overflow-hidden max-h-64 overflow-y-auto custom-scrollbar"
                            >
                              {state.products
                                .filter(p => 
                                  p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                                  p.code.toLowerCase().includes(productSearch.toLowerCase()) ||
                                  p.hsn.includes(productSearch)
                                )
                                .map(product => (
                                  <button
                                    key={product.id}
                                    onClick={() => {
                                      const newLine: InvoiceLine = {
                                        id: generateId(),
                                        productId: product.id,
                                        sku: product.code,
                                        name: product.name,
                                        variant: 'Standard',
                                        hsn: product.hsn,
                                        qtyPrimary: 0,
                                        qtySecondary: 0,
                                        rate: product.sellingRate,
                                        discount: 0,
                                        taxableAmount: 0,
                                        gstRate: product.gstRate,
                                        cgst: 0,
                                        sgst: 0,
                                        igst: 0,
                                        gstAmount: 0,
                                        lineTotal: 0
                                      };
                                      setLines([...lines, newLine]);
                                      setShowProductSearch(false);
                                      setProductSearch('');
                                    }}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-violet-50 transition-colors border-b border-gray-50 last:border-0"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-xs font-black text-gray-400">
                                        {product.name.charAt(0)}
                                      </div>
                                      <div className="text-left">
                                        <p className="text-xs font-black text-brand-text-dark uppercase">{product.name}</p>
                                        <p className="text-[10px] font-bold text-brand-text-muted mt-0.5 tracking-widest">{product.code} • HSN {product.hsn}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-black text-violet-600 italic">₹{product.sellingRate.toLocaleString('en-IN')}</p>
                                      <p className="text-[9px] font-bold text-brand-text-muted mt-0.5">GST {product.gstRate}%</p>
                                    </div>
                                  </button>
                                ))}
                              {state.products.filter(p => 
                                p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                                p.code.toLowerCase().includes(productSearch.toLowerCase())
                              ).length === 0 && (
                                <div className="p-12 text-center">
                                  <p className="text-xs font-bold text-brand-text-muted italic">No products found matching &quot;{productSearch}&quot;</p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="p-6 border-t border-gray-50 bg-gray-50/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setLines([])} className="px-4 py-2 rounded-xl border border-red-100 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-50 transition-all">Clear All</button>
              <button className="px-4 py-2 rounded-xl border border-gray-200 text-gray-400 text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all">Save Template</button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => handleIssue('DRAFT')}
                className="btn-ghost h-[40px] px-4 text-xs"
              >
                <Save size={16} /> Save Draft
              </button>
              <button 
                onClick={() => handleIssue('ISSUED', 'Draft Invoice')}
                className="btn-secondary h-[40px] px-4 text-xs"
              >
                <FileText size={16} /> Draft Invoice
              </button>
              <button 
                disabled={saving}
                onClick={() => handleIssue('ISSUED', 'Tax Invoice')}
                className="btn-primary h-[40px] px-6 text-xs min-w-[140px]"
              >
                {saving ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Zap size={16} /></motion.div>
                ) : (
                  <>
                    <CheckCircle size={16} /> 
                    <span className="uppercase tracking-tighter">FINAL INVOICE</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Totals & Summary */}
      <div className="lg:w-72 flex flex-col gap-6">
        <div className="premium-card p-8 space-y-8 bg-white/50 backdrop-blur-sm sticky top-0">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-brand-text-muted">
              <span>Subtotal</span>
              <span className="font-serif tabular-nums text-brand-text-dark">{formatINR(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-brand-text-muted">
              <span>Total Discount</span>
              <span className="font-serif tabular-nums text-emerald-500">-{formatINR(totals.totalDiscount)}</span>
            </div>
            
            <div className="pt-4 border-t border-dashed border-gray-100 space-y-3">
              <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase">
                <span>CGST (Central)</span>
                <span className="tabular-nums">{formatINR(totals.cgst)}</span>
              </div>
              <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase">
                <span>SGST (State)</span>
                <span className="tabular-nums">{formatINR(totals.sgst)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-brand-text-muted pt-4 border-t border-gray-100">
              <span>Round Off</span>
              <span className="font-serif tabular-nums text-brand-text-dark">{totals.roundOff.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-brand-text-dark/5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted mb-2 text-center">Grand Total</p>
            <motion.h4 
              key={totals.total}
              initial={{ scale: 1.1, color: '#7C3AED' }}
              animate={{ scale: 1, color: '#1E1B4B' }}
              className="text-4xl font-serif font-black text-center tabular-nums leading-none"
            >
              <span className="text-violet-600 text-xl font-bold align-top mr-1">₹</span>
              {totals.total.toLocaleString('en-IN')}
            </motion.h4>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-[10px] font-bold text-gray-400 text-center leading-relaxed">
            {amountToWords(totals.total)}
          </div>
        </div>
      </div>
    </div>
  );
}
