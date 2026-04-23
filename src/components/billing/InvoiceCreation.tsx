'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Trash2, Save, Search, Users,
  CheckCircle, FileText, Zap, Printer
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
import { SELLER_STATE } from '@/lib/mockData';
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
  const [transporter, setTransporter] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [dispatchDate, setDispatchDate] = useState(today());
  const [ewayBillNo, setEwayBillNo] = useState<string | null>(null);

  const selectedCustomer = state.customers.find(c => c.id === selectedCustomerId);
  const isInterState = selectedCustomer && selectedCustomer.state !== SELLER_STATE;

  // ─── Keyboard Shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle search on 'S' key if not typing in an input
      if ((e.key === 's' || e.key === 'S') && 
          !(e.target instanceof HTMLInputElement) && 
          !(e.target instanceof HTMLTextAreaElement)) {
        setShowProductSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateLine = (id: string, updates: Partial<InvoiceLine>) => {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l;
      const nl = { ...l, ...updates };
      const taxable = nl.qtyPrimary * nl.rate;
      const gstTotal = (taxable * nl.gstRate) / 100;
      
      return {
        ...nl,
        taxableAmount: taxable,
        gstAmount: gstTotal,
        lineTotal: taxable + gstTotal,
        cgst: isInterState ? 0 : gstTotal / 2,
        sgst: isInterState ? 0 : gstTotal / 2,
        igst: isInterState ? gstTotal : 0
      };
    }));
  };

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

  const handleGenerateEWayBill = () => {
    if (!transporter || !vehicleNo) return toast.error('Transporter and Vehicle details required');
    if (totals.total < 50000) return toast.error('E-Way Bill not mandatory for amounts below ₹50,000');
    
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Syncing with GST Portal...',
        success: () => {
          setEwayBillNo(Math.floor(100000000000 + Math.random() * 900000000000).toString());
          return 'E-Way Bill Generated! 🚛';
        },
        error: 'Portal Sync Failed',
      }
    );
  };

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
        irn: type === 'Tax Invoice' ? `IRN-${generateId().substring(0, 12).toUpperCase()}` : null,
        ewayBillNo,
        dispatchDate,
        terms: 'Payment due within 30 days. No returns after 7 days.',
        transporter,
        vehicleNo,
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
      <div className="w-full lg:w-80 flex flex-col gap-6 lg:overflow-y-auto no-scrollbar lg:pr-2">
        <div className="premium-card p-6 space-y-6 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Entity Selection</h3>
            <Users size={16} className="text-slate-400" />
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <select
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white appearance-none transition-all cursor-pointer"
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
                className="p-5 bg-slate-900 rounded-2xl text-white shadow-xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold uppercase border border-white/10">
                    {selectedCustomer.legalName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase truncate">{selectedCustomer.legalName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{selectedCustomer.city}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Outstanding</span>
                    <span className="text-sm font-bold italic tabular-nums">{formatINRCompact(selectedCustomer.outstanding)}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${creditUsagePercent(selectedCustomer.outstanding, selectedCustomer.creditLimit)}%` }}
                      className="h-full bg-white rounded-full"
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold uppercase tracking-tighter opacity-50">
                    <span>Used Credit</span>
                    <span>Limit: {formatINRCompact(selectedCustomer.creditLimit)}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Recently Active</p>
            <div className="flex flex-wrap gap-2">
              {state.recentCustomerIds.slice(0, 4).map(id => {
                const c = state.customers.find(cust => cust.id === id);
                if (!c) return null;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedCustomerId(id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tighter transition-all border",
                      selectedCustomerId === id 
                        ? "bg-slate-900 text-white border-slate-900" 
                        : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400"
                    )}
                  >
                    {c.legalName.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="premium-card p-6 bg-white border-slate-200">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4">Internal Memo</h3>
          <textarea
            placeholder="Notes for internal reference..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all resize-none font-medium"
          />
        </div>

        <div className="premium-card p-6 space-y-4 bg-white border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Logistics</h3>
            <Zap size={14} className={cn(ewayBillNo ? "text-emerald-500" : "text-slate-300")} />
          </div>
          
          <div className="space-y-3">
            <input 
              type="text"
              placeholder="Transporter Name"
              value={transporter}
              onChange={e => setTransporter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold uppercase outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
            />
            <input 
              type="text"
              placeholder="Vehicle Number"
              value={vehicleNo}
              onChange={e => setVehicleNo(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold uppercase outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
            />
            <input 
              type="date"
              value={dispatchDate}
              onChange={e => setDispatchDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold uppercase outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
            />
          </div>

          {totals.total >= 50000 && !ewayBillNo && (
            <button 
              onClick={handleGenerateEWayBill}
              className="w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
            >
              Generate E-Way Bill
            </button>
          )}

          {ewayBillNo && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <p className="text-[8px] font-bold uppercase text-emerald-600 tracking-widest">E-Way Bill Active</p>
              <p className="text-[11px] font-bold text-emerald-900 mt-1 tabular-nums">{ewayBillNo}</p>
            </div>
          )}
        </div>
      </div>

      {/* MAIN: Itemization */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <div className="premium-card flex-1 flex flex-col overflow-hidden border-slate-200">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 uppercase tracking-tight">Draft Transaction</h2>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {generateInvoiceNumber(state.invoiceCounter)} • {formatDate(today())}
                </p>
              </div>
              <button 
                onClick={() => setShowProductSearch(true)}
                className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all border border-slate-100"
                title="Search Product (S)"
              >
                <Search size={18} />
              </button>
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
              {(['Tax Invoice', 'Estimate'] as InvoiceType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setInvoiceType(t)}
                  className={cn(
                    "flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all",
                    invoiceType === t ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {lines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6 border border-slate-100">
                  <FileText size={32} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">No Items Added</h4>
                <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter max-w-[180px] mb-8">Select fabrics from the catalog to begin drafting this invoice.</p>
                <button 
                  onClick={() => setShowProductSearch(true)}
                  className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95"
                >
                  <Search size={16} /> Search & Add Product
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm mb-6">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Product Details</th>
                        <th className="text-center">Primary (Mtr)</th>
                        <th className="text-center sm:table-cell hidden">Secondary (Pcs)</th>
                        <th className="text-right">Rate</th>
                        <th className="text-right">Subtotal</th>
                        <th className="w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                    {lines.map((line, idx) => (
                      <tr key={line.id} className="group transition-all">
                        <td data-label="S.No" className="py-4 px-6 text-xs font-bold text-slate-400 tabular-nums">
                          {idx + 1}
                        </td>
                        <td data-label="Product" className="py-4 px-6">
                          <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{line.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">HSN: {line.hsn}</p>
                        </td>
                        <td data-label="Primary" className="py-4 px-6 text-center tabular-nums">
                          <input 
                            type="number"
                            value={line.qtyPrimary || ''}
                            onChange={(e) => updateLine(line.id, { qtyPrimary: Number(e.target.value) })}
                            className="w-20 bg-transparent text-center text-xs font-bold text-slate-900 outline-none focus:bg-slate-50 rounded p-1 transition-all"
                            placeholder="0.00"
                          />
                        </td>
                        <td data-label="Secondary" className="py-4 px-6 text-center tabular-nums sm:table-cell hidden">
                          <input 
                            type="number"
                            value={line.qtySecondary || ''}
                            onChange={(e) => updateLine(line.id, { qtySecondary: Number(e.target.value) })}
                            className="w-16 bg-transparent text-center text-xs text-slate-400 outline-none focus:bg-slate-50 rounded p-1 transition-all"
                            placeholder="0"
                          />
                        </td>
                        <td data-label="Rate" className="py-4 px-6 text-right tabular-nums">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-[10px] text-slate-300">₹</span>
                            <input 
                              type="number"
                              value={line.rate || ''}
                              onChange={(e) => updateLine(line.id, { rate: Number(e.target.value) })}
                              className="w-20 bg-transparent text-right text-xs font-bold text-slate-900 outline-none focus:bg-slate-50 rounded p-1 transition-all"
                              placeholder="0.00"
                            />
                          </div>
                        </td>
                        <td data-label="Subtotal" className="py-4 px-6 text-right tabular-nums text-xs font-bold text-slate-900 italic">
                          {formatINR(line.lineTotal)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-end">
                            <button 
                              onClick={() => setLines(lines.filter(l => l.id !== line.id))}
                              className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all lg:opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                
              {/* Tax & Calculation Breakdown */}
                <div className="p-6 bg-slate-50/30 flex justify-between gap-8 border-b border-slate-100">
                  <div className="flex-1">
                    <button 
                      onClick={() => setShowProductSearch(true)}
                      className="flex items-center gap-2 text-[10px] font-bold text-slate-900 uppercase tracking-widest hover:bg-slate-100 px-4 py-2 rounded-xl transition-all border border-slate-200"
                    >
                      <Plus size={14} /> Add Another Item
                    </button>
                  </div>
                  <div className="w-64 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Taxable Amount</span>
                      <span className="text-xs font-bold text-slate-900 tabular-nums">₹{totals.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {isInterState ? (
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">IGST (Inter-State)</span>
                        <span className="text-xs font-bold text-emerald-700 tabular-nums">₹{totals.igst.toLocaleString('en-IN')}</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">CGST (Central)</span>
                          <span className="text-xs font-bold text-slate-900 tabular-nums">₹{totals.cgst.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">SGST (State)</span>
                          <span className="text-xs font-bold text-slate-900 tabular-nums">₹{totals.sgst.toLocaleString('en-IN')}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setLines([])} className="px-4 py-2 rounded-lg border border-slate-200 text-rose-600 text-[9px] font-bold uppercase tracking-widest hover:bg-rose-50 hover:border-rose-200 transition-all">Clear All</button>
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-500 text-[9px] font-bold uppercase tracking-widest hover:bg-white hover:border-slate-300 transition-all">Save Template</button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => handleIssue('DRAFT')}
                className="btn-ghost !h-10 px-4 text-xs"
              >
                <Save size={16} /> Save Draft
              </button>
              <button 
                onClick={() => handleIssue('ISSUED', 'Draft Invoice')}
                className="btn-secondary !h-10 px-4 text-xs"
              >
                <FileText size={16} /> Draft Invoice
              </button>
              <button 
                onClick={() => {
                  toast.success('Preparing high-fidelity print...');
                  setTimeout(() => window.print(), 500);
                }}
                className="btn-ghost !h-10 px-4 text-xs"
              >
                <Printer size={16} /> Print
              </button>
              <button 
                disabled={saving}
                onClick={() => handleIssue('ISSUED', 'Tax Invoice')}
                className="btn-primary !h-10 px-6 text-xs min-w-[140px]"
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

        {/* Product Catalog Search Overlay */}
        {showProductSearch && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                <Search className="text-slate-400" size={20} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search fabric name, code or HSN..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-300"
                />
                <button 
                  onClick={() => { setShowProductSearch(false); setProductSearch(''); }}
                  className="text-[10px] font-bold uppercase text-slate-400 hover:text-slate-900 tracking-widest"
                >
                  ESC to Close
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto no-scrollbar">
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
                      className="w-full px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-sm font-bold text-slate-900 border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all">
                          {product.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{product.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-1 tracking-widest uppercase">{product.code} • HSN {product.hsn}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-bold text-slate-900 tabular-nums italic">₹{product.sellingRate.toLocaleString('en-IN')}</p>
                        <p className={cn(
                          "text-[9px] font-bold mt-1 uppercase tracking-tighter",
                          product.currentStock < product.lowStockThreshold ? "text-rose-500" : "text-emerald-600"
                        )}>
                          Stock: {product.currentStock} {product.primaryUnit}s
                        </p>
                      </div>
                    </button>
                  ))}
                {state.products.filter(p => 
                  p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                  p.code.toLowerCase().includes(productSearch.toLowerCase())
                ).length === 0 && (
                  <div className="p-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-3xl mx-auto flex items-center justify-center text-slate-200 mb-6 border border-slate-100">
                      <Search size={28} />
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No matching fabrics found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* RIGHT: Totals & Summary */}
      <div className="lg:w-72 flex flex-col gap-6">
        <div className="premium-card p-8 space-y-8 bg-white border-slate-200 shadow-sm sticky top-0">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span>Subtotal</span>
              <span className="tabular-nums text-slate-900 font-bold">{formatINR(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span>Total Discount</span>
              <span className="tabular-nums text-emerald-600 font-bold">-{formatINR(totals.totalDiscount)}</span>
            </div>
            
            <div className="pt-4 border-t border-dashed border-slate-100 space-y-3">
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase">
                <span>CGST (Central)</span>
                <span className="tabular-nums">{formatINR(totals.cgst)}</span>
              </div>
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase">
                <span>SGST (State)</span>
                <span className="tabular-nums">{formatINR(totals.sgst)}</span>
              </div>
              {totals.igst > 0 && (
                <div className="flex justify-between items-center text-[9px] font-bold text-emerald-600 uppercase">
                  <span>IGST (Inter-State)</span>
                  <span className="tabular-nums">{formatINR(totals.igst)}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500 pt-4 border-t border-slate-100">
              <span>Round Off</span>
              <span className="tabular-nums text-slate-900 font-bold">{totals.roundOff.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-slate-900/5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 text-center">Grand Total</p>
            <motion.h4 
              key={totals.total}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold text-center tabular-nums leading-none text-slate-900"
            >
              <span className="text-slate-400 text-xl font-bold align-top mr-1">₹</span>
              {totals.total.toLocaleString('en-IN')}
            </motion.h4>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 italic text-[10px] font-bold text-slate-400 text-center leading-relaxed">
            {amountToWords(totals.total)}
          </div>
        </div>
      </div>
      {/* Print Template (Hidden from UI, visible only in Print) */}
      {selectedCustomer && (
        <PrintTemplate 
          customer={selectedCustomer}
          invoice={{
            id: 'temp',
            number: generateInvoiceNumber(state.invoiceCounter),
            type: invoiceType,
            customerId: selectedCustomerId,
            customerName: selectedCustomer.legalName,
            customerGSTIN: selectedCustomer.gstin,
            customerState: selectedCustomer.state,
            lines,
            ...totals,
            status: 'DRAFT',
            irn: null,
            ewayBillNo,
            dispatchDate,
            terms: 'Payment due within 30 days. No returns after 7 days.',
            transporter,
            vehicleNo,
            paymentTerms: selectedCustomer.paymentTerms,
            bankAccount: 'HDFC Bank - 50100123456789',
            notes,
            payments: [],
            createdAt: new Date().toISOString(),
            issuedAt: null,
            sentAt: null,
            viewedAt: null,
            paidAt: null,
          }}
        />
      )}
    </div>
  );
}

import PrintTemplate from './PrintTemplate';
