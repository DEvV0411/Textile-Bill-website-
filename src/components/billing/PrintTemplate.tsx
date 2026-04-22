'use client';

import { Invoice, Customer } from '@/lib/types';
import { formatINR, formatDate, amountToWords } from '@/lib/utils';
import { SELLER_STATE } from '@/lib/mockData';

interface PrintTemplateProps {
  invoice: Invoice;
  customer: Customer | undefined;
}

export default function PrintTemplate({ invoice, customer }: PrintTemplateProps) {
  const isInterState = customer && customer.state !== SELLER_STATE;

  return (
    <div id="invoice-print-template" className="hidden print:block p-10 bg-white text-black font-serif">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Tax Invoice</h1>
          <p className="text-xs mt-1 font-bold">Original for Recipient</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-black uppercase">Rathi Textiles Pvt Ltd</h2>
          <p className="text-[10px] leading-tight">
            12, Ring Road, Textile Market,<br />
            Surat, Gujarat - 395003<br />
            GSTIN: <span className="font-bold">24AABCR1234A1Z5</span><br />
            State: Gujarat (24)
          </p>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-10 mt-8 py-6 border-b border-black">
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">Billed To:</p>
          <p className="text-sm font-black uppercase">{invoice.customerName}</p>
          <p className="text-[10px] leading-relaxed mt-1">
            {customer?.billingAddresses[0]?.line1}, {customer?.billingAddresses[0]?.line2}<br />
            {customer?.city}, {customer?.state} - {customer?.pinCode}<br />
            GSTIN: <span className="font-bold">{invoice.customerGSTIN || 'N/A'}</span><br />
            State: {invoice.customerState} ({customer?.stateCode})
          </p>
        </div>
        <div className="text-right grid grid-cols-2 gap-y-2">
          <span className="text-[10px] font-bold uppercase">Invoice No:</span>
          <span className="text-xs font-black">{invoice.number}</span>
          <span className="text-[10px] font-bold uppercase">Date:</span>
          <span className="text-xs font-bold">{formatDate(invoice.createdAt)}</span>
          <span className="text-[10px] font-bold uppercase">Dispatch:</span>
          <span className="text-xs font-bold">{invoice.dispatchDate || 'N/A'}</span>
          <span className="text-[10px] font-bold uppercase">Vehicle No:</span>
          <span className="text-xs font-bold">{invoice.vehicleNo || 'N/A'}</span>
          {invoice.ewayBillNo && (
            <>
              <span className="text-[10px] font-bold uppercase">E-Way Bill:</span>
              <span className="text-xs font-bold">{invoice.ewayBillNo}</span>
            </>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mt-8 border-collapse">
        <thead>
          <tr className="border-y border-black bg-slate-50">
            <th className="py-2 px-2 text-[10px] font-black uppercase text-left border-x border-black w-8">#</th>
            <th className="py-2 px-4 text-[10px] font-black uppercase text-left border-x border-black">Description of Goods</th>
            <th className="py-2 px-2 text-[10px] font-black uppercase text-center border-x border-black w-20">HSN</th>
            <th className="py-2 px-2 text-[10px] font-black uppercase text-center border-x border-black w-16">Qty (M)</th>
            <th className="py-2 px-2 text-[10px] font-black uppercase text-center border-x border-black w-16">Qty (P)</th>
            <th className="py-2 px-2 text-[10px] font-black uppercase text-right border-x border-black w-24">Rate</th>
            <th className="py-2 px-2 text-[10px] font-black uppercase text-right border-x border-black w-32">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line, idx) => (
            <tr key={idx} className="border-b border-black">
              <td className="py-2 px-2 text-[10px] border-x border-black text-center">{idx + 1}</td>
              <td className="py-2 px-4 text-xs font-bold border-x border-black uppercase">{line.name}</td>
              <td className="py-2 px-2 text-[10px] border-x border-black text-center">{line.hsn}</td>
              <td className="py-2 px-2 text-[10px] border-x border-black text-center font-bold">{line.qtyPrimary.toFixed(2)}</td>
              <td className="py-2 px-2 text-[10px] border-x border-black text-center">{line.qtySecondary}</td>
              <td className="py-2 px-2 text-[10px] border-x border-black text-right">{line.rate.toFixed(2)}</td>
              <td className="py-2 px-2 text-[10px] border-x border-black text-right font-bold">{line.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
          {/* Fill empty space */}
          {Array.from({ length: Math.max(0, 8 - invoice.lines.length) }).map((_, i) => (
            <tr key={`empty-${i}`} className="h-8 border-b border-black">
              <td className="border-x border-black"></td>
              <td className="border-x border-black"></td>
              <td className="border-x border-black"></td>
              <td className="border-x border-black"></td>
              <td className="border-x border-black"></td>
              <td className="border-x border-black"></td>
              <td className="border-x border-black"></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-y border-black font-black">
            <td colSpan={3} className="py-2 px-4 text-[10px] uppercase text-right border-x border-black">Total</td>
            <td className="py-2 px-2 text-[10px] text-center border-x border-black">{invoice.lines.reduce((s, l) => s + l.qtyPrimary, 0).toFixed(2)}</td>
            <td className="py-2 px-2 text-[10px] text-center border-x border-black">{invoice.lines.reduce((s, l) => s + l.qtySecondary, 0)}</td>
            <td className="border-x border-black"></td>
            <td className="py-2 px-2 text-xs text-right border-x border-black">{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        </tfoot>
      </table>

      {/* Totals Breakdown */}
      <div className="grid grid-cols-2 gap-10 mt-4">
        <div className="space-y-4">
          <div className="p-4 border border-black rounded-lg">
            <p className="text-[10px] font-bold uppercase underline mb-2">Amount in Words:</p>
            <p className="text-[10px] font-black uppercase italic">{amountToWords(invoice.total)} Only</p>
          </div>
          <div className="p-4 border border-black rounded-lg">
            <p className="text-[10px] font-bold uppercase underline mb-2">Bank Details:</p>
            <p className="text-[10px] leading-relaxed">
              Bank: <span className="font-black uppercase">HDFC BANK</span><br />
              A/C No: <span className="font-black">501002341234</span><br />
              IFSC: <span className="font-black uppercase">HDFC0001234</span><br />
              Branch: <span className="font-black uppercase">Ring Road, Surat</span>
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] px-2 py-1">
            <span className="uppercase font-bold">Total Taxable Amount:</span>
            <span className="font-black tabular-nums">{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          {isInterState ? (
            <div className="flex justify-between items-center text-[10px] px-2 py-1">
              <span className="uppercase font-bold">IGST Total:</span>
              <span className="font-black tabular-nums">{invoice.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center text-[10px] px-2 py-1">
                <span className="uppercase font-bold">CGST Total:</span>
                <span className="font-black tabular-nums">{invoice.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] px-2 py-1">
                <span className="uppercase font-bold">SGST Total:</span>
                <span className="font-black tabular-nums">{invoice.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </>
          )}
          <div className="flex justify-between items-center text-[10px] px-2 py-1">
            <span className="uppercase font-bold">Round Off:</span>
            <span className="font-black tabular-nums">{invoice.roundOff.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-lg bg-black text-white px-4 py-3 rounded-lg mt-4">
            <span className="font-black uppercase text-sm">Grand Total:</span>
            <span className="font-black tabular-nums">₹{invoice.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Terms & Footer */}
      <div className="mt-10 grid grid-cols-2 gap-10">
        <div>
          <p className="text-[10px] font-bold uppercase underline mb-2">Terms & Conditions:</p>
          <p className="text-[8px] leading-relaxed italic text-slate-600">
            1. Goods once sold will not be taken back.<br />
            2. Interest @18% will be charged if not paid within 30 days.<br />
            3. Subject to Surat Jurisdiction.
          </p>
        </div>
        <div className="text-center pt-10">
          <p className="text-[10px] font-bold uppercase mb-12">For Rathi Textiles Pvt Ltd</p>
          <div className="w-40 h-px bg-black mx-auto mb-2" />
          <p className="text-[10px] font-bold uppercase">Authorized Signatory</p>
        </div>
      </div>
    </div>
  );
}
