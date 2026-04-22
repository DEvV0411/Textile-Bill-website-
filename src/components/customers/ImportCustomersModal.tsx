'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, FileText, Loader2, Download } from 'lucide-react';
import { useApp } from '@/lib/store';
import { Customer, CustomerGroup, RegType, CustomerStatus, PaymentTerms } from '@/lib/types';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

// PDF.js will be dynamically loaded to avoid SSR issues

interface ImportCustomersModalProps {
  onClose: () => void;
}

export default function ImportCustomersModal({ onClose }: ImportCustomersModalProps) {
  const { dispatch } = useApp();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importPreview, setImportPreview] = useState<Partial<Customer>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<unknown>) => {
        const customers = (results.data as Record<string, unknown>[]).map((row) => ({
          id: crypto.randomUUID(),
          code: (row.Code as string) || (row.code as string) || `CUST-${Math.floor(Math.random() * 10000)}`,
          legalName: (row['Legal Name'] as string) || (row.legalName as string) || (row.Name as string) || (row.name as string) || 'Unknown',
          tradeName: (row['Trade Name'] as string) || (row.tradeName as string) || (row['Legal Name'] as string) || (row.Name as string) || 'Unknown',
          group: ((row.Group as string) || 'Wholesale') as CustomerGroup,
          phone: (row.Phone as string) || (row.phone as string) || '',
          altPhone: (row['Alt Phone'] as string) || '',
          email: (row.Email as string) || (row.email as string) || '',
          city: (row.City as string) || (row.city as string) || '',
          state: (row.State as string) || (row.state as string) || '',
          pinCode: (row.PinCode as string) || (row.pinCode as string) || '',
          gstin: (row.GSTIN as string) || (row.gstin as string) || '',
          pan: (row.PAN as string) || (row.pan as string) || '',
          stateCode: (row['State Code'] as string) || '',
          regType: ((row['Reg Type'] as string) || 'Unregistered') as RegType,
          creditLimit: parseFloat((row['Credit Limit'] as string) || '0'),
          creditPeriod: parseInt((row['Credit Period'] as string) || '0'),
          overdueRate: parseFloat((row['Overdue Rate'] as string) || '0'),
          priceList: (row['Price List'] as string) || 'Default',
          paymentTerms: ((row['Payment Terms'] as string) || '30 days') as PaymentTerms,
          broker: (row.Broker as string) || '',
          billingAddresses: [],
          shippingAddresses: [],
          contacts: [],
          outstanding: parseFloat((row.Outstanding as string) || '0'),
          status: 'Active' as CustomerStatus,
          lastTransaction: null,
        }));
        setImportPreview(customers);
      },
      error: (err: Error) => {
        toast.error('Failed to parse CSV: ' + err.message);
      }
    });
  };

  const processPDF = async (file: File) => {
    setIsLoading(true);
    try {
      // Dynamic import to avoid SSR 'DOMMatrix' error
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: unknown) => (item as { str: string }).str)
          .join(' ');
        fullText += pageText + '\n';
      }

      const foundCustomers: Partial<Customer>[] = [];
      
      const gstinRegex = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/g;
      const phoneRegex = /[6-9]\d{9}/g;
      
      const gstins = Array.from(fullText.matchAll(gstinRegex)).map(m => m[0]);
      const phones = Array.from(fullText.matchAll(phoneRegex)).map(m => m[0]);
      
      if (gstins.length > 0) {
        gstins.forEach((gst, idx) => {
          foundCustomers.push({
            id: crypto.randomUUID(),
            legalName: `Detected Client ${idx + 1}`,
            gstin: gst,
            phone: phones[idx] || '',
            status: 'Active',
            code: `CUST-${Math.floor(Math.random() * 10000)}`,
          } as Partial<Customer>);
        });
      }

      if (foundCustomers.length === 0) {
        toast.error('Automatic extraction failed. Please use CSV mapping for PDF documents.');
      } else {
        setImportPreview(foundCustomers);
        toast.success(`Heuristic scan found ${foundCustomers.length} clients`);
      }
    } catch (err: unknown) {
      toast.error('Extraction Error: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.csv')) {
      processCSV(file);
    } else if (file.name.endsWith('.pdf')) {
      processPDF(file);
    } else {
      toast.error('Supported formats: CSV, PDF');
    }
  };

  const handleImport = () => {
    if (importPreview.length === 0) return;
    
    const finalCustomers: Customer[] = importPreview.map(c => ({
      id: c.id || crypto.randomUUID(),
      code: c.code || `CUST-${Math.floor(Math.random() * 10000)}`,
      legalName: c.legalName || 'Unknown',
      tradeName: c.tradeName || c.legalName || 'Unknown',
      group: c.group || 'Wholesale',
      phone: c.phone || '',
      altPhone: c.altPhone || '',
      email: c.email || '',
      city: c.city || '',
      state: c.state || '',
      pinCode: c.pinCode || '',
      gstin: c.gstin || '',
      pan: c.pan || '',
      stateCode: c.stateCode || '',
      regType: c.regType || 'Unregistered',
      creditLimit: c.creditLimit || 0,
      creditPeriod: c.creditPeriod || 0,
      overdueRate: c.overdueRate || 0,
      priceList: c.priceList || 'Default',
      paymentTerms: c.paymentTerms || '30 days',
      broker: c.broker || '',
      billingAddresses: c.billingAddresses || [],
      shippingAddresses: c.shippingAddresses || [],
      contacts: c.contacts || [],
      outstanding: c.outstanding || 0,
      status: c.status || 'Active',
      lastTransaction: c.lastTransaction || null,
    }));

    dispatch({ type: 'BULK_ADD_CUSTOMERS', payload: finalCustomers });
    toast.success(`Import complete: ${finalCustomers.length} clients added`);
    onClose();
  };

  const downloadSample = () => {
    const csvContent = "data:text/csv;charset=utf-8,Code,Legal Name,Trade Name,Group,Phone,Email,City,State,PinCode,GSTIN,PAN\nC001,Example Textiles,ExText,Wholesale,9876543210,info@example.com,Mumbai,Maharashtra,400001,27AAAAA0000A1Z5,ABCDE1234F";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customer_import_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Bulk Import</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">Synchronize your existing client database via CSV or PDF.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-300 hover:text-rose-500">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {importPreview.length === 0 ? (
            <div className="space-y-8">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) {
                    if (file.name.endsWith('.csv')) processCSV(file);
                    else if (file.name.endsWith('.pdf')) processPDF(file);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center gap-6 transition-all cursor-pointer
                  ${isDragging ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-900 hover:bg-slate-50'}
                `}
              >
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  {isLoading ? <Loader2 size={32} className="animate-spin text-slate-900" /> : <Upload size={32} />}
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-900 uppercase tracking-tight">Drop files to upload</p>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Supports .CSV and .PDF formats</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.pdf"
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <FileText size={18} className="text-slate-900" />
                    </div>
                    <span className="font-bold text-slate-900 uppercase tracking-tight">CSV Standards</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium uppercase tracking-tighter">
                    Highest precision. Use our schema for automated field mapping and validation.
                  </p>
                  <button 
                    onClick={downloadSample}
                    className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-900 uppercase tracking-widest hover:underline"
                  >
                    <Download size={14} />
                    Download Schema
                  </button>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                      <FileText size={18} className="text-slate-900" />
                    </div>
                    <span className="font-bold text-slate-900 uppercase tracking-tight">OCR Scanning</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium uppercase tracking-tighter">
                    Heuristic extraction for PDF ledgers. Manual verification is recommended.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 uppercase tracking-tight">Data Preview ({importPreview.length} items)</h4>
                <button 
                  onClick={() => setImportPreview([])}
                  className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline"
                >
                  Discard & Re-upload
                </button>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-widest">Legal Name</th>
                      <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-widest">GSTIN</th>
                      <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-widest">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importPreview.slice(0, 10).map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-900 uppercase">{c.legalName}</td>
                        <td className="px-6 py-4 text-slate-500 font-mono font-bold uppercase">{c.gstin || 'N/A'}</td>
                        <td className="px-6 py-4 text-slate-500 font-bold uppercase">{c.city || 'LOCAL'}</td>
                      </tr>
                    ))}
                    {importPreview.length > 10 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                          + {importPreview.length - 10} additional entries
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button onClick={onClose} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Abort</button>
          <button 
            onClick={handleImport}
            disabled={importPreview.length === 0 || isLoading}
            className="btn-primary !h-11 px-10 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm & Import
          </button>
        </div>
      </motion.div>
    </div>
  );
}
