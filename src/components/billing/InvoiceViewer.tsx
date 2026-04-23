'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Printer, Download, Share2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Invoice } from '@/lib/types';
import { formatINR, formatDate, amountToWords, cn } from '@/lib/utils';
import { StatusBadge } from '@/components/dashboard/Dashboard';

interface InvoiceViewerProps {
  invoice: Invoice;
  onClose: () => void;
}

export default function InvoiceViewer({ invoice, onClose }: InvoiceViewerProps) {
  const isTaxInvoice = invoice.type === 'Tax Invoice';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto no-scrollbar print:p-0 print:bg-white print:backdrop-blur-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 print:shadow-none print:border-none print:w-full print:max-w-none print:m-0"
      >
        {/* Actions Bar (Hidden on print) */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-[110] print:hidden">
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose} 
              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-100 rounded-xl transition-all text-slate-600 hover:text-rose-600 font-bold text-xs uppercase tracking-widest"
            >
              <X size={20} />
              Back
            </button>
            <div className="h-6 w-[1px] bg-slate-200 mx-1" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{invoice.type}</span>
              <span className="text-xs font-bold text-slate-900 mt-1">{invoice.number}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="btn-ghost !h-10 px-4 text-xs border border-slate-200">
              <Printer size={16} />
              Print
            </button>
            <button className="btn-primary !h-10 px-6 text-xs">
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="flex-1 overflow-y-auto p-10 sm:p-16 space-y-12 bg-white print:p-0 print:overflow-visible">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img src="/images/logo.png" alt="SidZsol" className="h-12 w-auto" />
                <div className="h-8 w-[1px] bg-slate-200" />
                <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">SidZsol Technologies</h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Textile Division • Admin Portal</p>
                </div>
              </div>
              
              <div className="space-y-1 max-w-xs">
                <p className="text-xs font-bold text-slate-900 uppercase">Registered Office:</p>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed uppercase tracking-tighter">
                  Plot No. 44, GIDC Apparel Park, SEZ, Surat, Gujarat - 395023
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase">GSTIN:</span>
                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">24AAAAA0000A1Z5</span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-6">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">{invoice.type}</h2>
                <div className="flex sm:justify-end">
                   <StatusBadge status={invoice.status} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:justify-items-end">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Doc No:</p>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{invoice.number}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date:</p>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{formatDate(invoice.createdAt)}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Place of Supply:</p>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{invoice.customerState}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-b border-slate-100 py-10">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Billed To:</p>
              <div className="space-y-2">
                <p className="text-xl font-black text-slate-900 uppercase tracking-tighter">{invoice.customerName}</p>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-bold text-slate-400">GSTIN:</span>
                   <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{invoice.customerGSTIN || 'UNREGISTERED'}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed uppercase tracking-tighter max-w-xs">
                  {invoice.customerState}, India
                </p>
              </div>
            </div>
            
            {invoice.transporter && (
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Dispatch Details:</p>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Transporter</p>
                    <p className="text-xs font-bold text-slate-900 uppercase">{invoice.transporter}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Vehicle No</p>
                    <p className="text-xs font-bold text-slate-900 uppercase font-mono">{invoice.vehicleNo}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">E-Way Bill</p>
                    <p className="text-xs font-bold text-emerald-600 uppercase font-mono">{invoice.ewayBillNo || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="space-y-6">
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-slate-200">
                     <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">S.No</th>
                     <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product / HSN</th>
                     <th className="pb-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</th>
                     <th className="pb-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Rate</th>
                     <th className="pb-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">GST %</th>
                     <th className="pb-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {invoice.lines.map((line, idx) => (
                     <tr key={line.id}>
                       <td className="py-5 text-xs font-bold text-slate-400 tabular-nums">{idx + 1}</td>
                       <td className="py-5">
                         <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{line.name}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest">HSN: {line.hsn}</p>
                       </td>
                       <td className="py-5 text-right">
                         <p className="text-xs font-bold text-slate-900 tabular-nums">{line.qtyPrimary.toLocaleString()} MTR</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{line.qtySecondary} PCS</p>
                       </td>
                       <td className="py-5 text-right text-xs font-bold text-slate-900 tabular-nums">{formatINR(line.rate)}</td>
                       <td className="py-5 text-right text-xs font-bold text-slate-600 tabular-nums">{line.gstRate}%</td>
                       <td className="py-5 text-right text-xs font-bold text-slate-900 tabular-nums">{formatINR(line.taxableAmount)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>

          {/* Totals Summary */}
          <div className="flex flex-col sm:flex-row justify-between gap-10 pt-10 border-t-2 border-slate-900">
            <div className="flex-1 space-y-6">
               <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount in Words:</p>
                 <p className="text-xs font-bold text-slate-900 uppercase italic leading-relaxed">
                   Rupees {amountToWords(invoice.total)} Only.
                 </p>
               </div>
               
               <div className="p-6 bg-slate-50 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Payment Terms & Notes</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-tighter">
                    {invoice.terms}
                  </p>
               </div>
            </div>

            <div className="w-full sm:w-80 bg-slate-900 text-white rounded-3xl p-10 space-y-6 shadow-xl">
               <div className="space-y-4 border-b border-white/10 pb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Taxable Total</span>
                    <span className="text-sm font-bold tabular-nums">{formatINR(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total GST</span>
                    <span className="text-sm font-bold tabular-nums">{formatINR(invoice.cgst + invoice.sgst + invoice.igst)}</span>
                  </div>
               </div>
               
               <div className="space-y-1">
                 <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Grand Total</p>
                 <h4 className="text-4xl font-black tabular-nums tracking-tighter italic">{formatINR(invoice.total)}</h4>
               </div>

               <div className="pt-4">
                  <div className="flex items-center gap-2 text-white/60">
                    <AlertCircle size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Includes Round-Off of {formatINR(invoice.roundOff)}</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Footer / Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 pt-16">
             <div className="space-y-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Details:</p>
               <div className="text-[10px] font-bold text-slate-600 uppercase leading-relaxed">
                 Account: {invoice.bankAccount}<br />
                 IFSC: HDFC0001234 • Branch: Surat
               </div>
             </div>
             <div className="text-right space-y-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Signatory</p>
                <div className="h-10" />
                <p className="text-xs font-bold text-slate-900 uppercase">For SidZsol Technologies</p>
             </div>
          </div>

          {/* Bottom Action (Hidden on print) */}
          <div className="pt-20 pb-10 flex justify-center print:hidden">
             <button 
               onClick={onClose}
               className="btn-ghost !h-12 px-12 border border-slate-200 text-xs font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
             >
               Close Document
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
