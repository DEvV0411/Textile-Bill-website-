'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, CreditCard, Bell, Shield, 
  Printer, Save, Plus, Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const SECTIONS = [
  { id: 'business', label: 'Business Profile', icon: <Building2 size={18} /> },
  { id: 'taxation', label: 'Taxation & Legal', icon: <Shield size={18} /> },
  { id: 'banking', label: 'Banking & Payments', icon: <CreditCard size={18} /> },
  { id: 'billing', label: 'Billing Defaults', icon: <Printer size={18} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
];

export default function SettingsPortal() {
  const [activeSection, setActiveSection] = useState('business');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSection]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Settings saved successfully! ✅');
    }, 1000);
  };

  return (
    <div ref={scrollRef} className="flex flex-col lg:flex-row gap-8 pb-10">
      {/* Sidebar Nav */}
      <div className="lg:w-64 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Portal Settings</h3>
          </div>
          <nav className="p-2 flex lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar gap-1">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "flex-shrink-0 lg:flex-shrink w-auto lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap",
                  activeSection === s.id 
                    ? "bg-slate-900 text-white shadow-md" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10"
        >
          {/* BUSINESS PROFILE */}
          {activeSection === 'business' && (
            <div className="space-y-10">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Business Profile</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">This information will appear on your issued invoices and reports.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-8 p-8 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex flex-col items-center justify-center overflow-hidden p-2 shadow-sm group-hover:border-slate-900 transition-all">
                      <img src="/images/logo.png" alt="Current Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:bg-black transition-all">
                      <Plus size={16} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">Company Identity</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium uppercase tracking-tighter">Your logo will be optimized for PDF generation.<br/>PNG, SVG or WEBP (Max 2MB)</p>
                  </div>
                </div>

                <Field label="Legal Entity Name">
                  <Input defaultValue="SidZsol Technologies" />
                </Field>
                <Field label="Trade Name / Brand">
                  <Input defaultValue="SidZsol" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Registered Office Address">
                    <textarea 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none h-28 resize-none transition-all uppercase"
                      defaultValue="Level 5, Textile Innovation Park, Hazira Road, Surat, Gujarat - 395010"
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* TAXATION */}
          {activeSection === 'taxation' && (
            <div className="space-y-10">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Taxation & Legal</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">Compliance details for GST and Income Tax filings.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <Field label="GSTIN (Primary)">
                  <Input defaultValue="24SIDZS1234Z1Z5" className="font-mono uppercase" />
                </Field>
                <Field label="PAN (Corporate)">
                  <Input defaultValue="SIDZS1234Z" className="font-mono uppercase" />
                </Field>
                <Field label="LUT Number (For Exports)">
                  <Input placeholder="Enter LUT number if applicable" className="uppercase" />
                </Field>
                <Field label="E-Way Bill Username">
                  <Input defaultValue="rathitex_surat" className="lowercase" />
                </Field>
              </div>
            </div>
          )}

          {/* BANKING */}
          {activeSection === 'banking' && (
            <div className="space-y-10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Banking & Payments</h3>
                  <p className="text-sm text-slate-500 mt-1 font-medium">Manage bank accounts for payment collections.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-md">
                  <Plus size={14} /> Add Account
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-6 border border-slate-200 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm">
                      <Building2 size={24} className="text-slate-900" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">HDFC Bank</h4>
                      <p className="text-xs text-slate-400 font-bold tabular-nums">A/C: 501002341234 • IFSC: HDFC0001234</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest border border-slate-900">Default</span>
                    <button className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BILLING DEFAULTS */}
          {activeSection === 'billing' && (
            <div className="space-y-10">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Billing Defaults</h3>
                <p className="text-sm text-slate-500 mt-1 font-medium">Configure standard invoice settings and terms.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <Field label="Invoice Prefix">
                  <Input defaultValue="INV/2026/" className="uppercase" />
                </Field>
                <Field label="Next Invoice Number">
                  <Input defaultValue="0001" type="number" />
                </Field>
                <Field label="Default Tax State">
                  <Input defaultValue="Gujarat" className="uppercase" />
                </Field>
                <Field label="Default Currency">
                  <Input defaultValue="INR (₹)" disabled className="bg-slate-100" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Standard Terms & Conditions">
                    <textarea 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:bg-white outline-none h-32 resize-none transition-all uppercase tracking-tight leading-relaxed"
                      defaultValue="1. Goods once sold will not be taken back.&#10;2. Interest @18% will be charged if not paid within 30 days.&#10;3. Subject to Surat Jurisdiction."
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
            <button className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
              Discard Changes
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-10 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-xl hover:bg-black transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      {...props}
      className={cn(
        "w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all disabled:opacity-50",
        props.className
      )}
    />
  );
}
