'use client';

import { useState } from 'react';
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
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Settings saved successfully! ✅');
    }, 1000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-10">
      {/* Sidebar Nav */}
      <div className="lg:w-64 flex-shrink-0">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Portal Settings</h3>
          </div>
          <nav className="p-2 flex lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar gap-1">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "flex-shrink-0 lg:flex-shrink w-auto lg:w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap",
                  activeSection === s.id 
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
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
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-8"
        >
          {/* BUSINESS PROFILE */}
          {activeSection === 'business' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-serif font-black text-brand-text-dark uppercase tracking-tight">Business Profile</h3>
                <p className="text-sm text-brand-text-muted mt-1">This information will appear on your issued invoices and reports.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 p-6 bg-violet-50/30 rounded-3xl border border-violet-100">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl bg-white border-2 border-dashed border-violet-200 flex flex-col items-center justify-center text-violet-400 cursor-pointer hover:bg-violet-50 hover:border-violet-400 transition-all group shadow-sm">
                      <Plus size={24} />
                      <span className="text-[10px] font-black uppercase mt-2">Brand Logo</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-brand-text-dark uppercase tracking-tight">Company Identity</h4>
                    <p className="text-xs text-brand-text-muted mt-1 leading-relaxed">Your logo will be optimized for PDF generation.<br/>PNG, SVG or WEBP (Max 2MB)</p>
                  </div>
                </div>

                <Field label="Legal Entity Name">
                  <Input defaultValue="Rathi Textiles Pvt Ltd" />
                </Field>
                <Field label="Trade Name / Brand">
                  <Input defaultValue="Rathi Fabrics" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Registered Office Address">
                    <textarea 
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-3xl text-sm font-bold text-brand-text-dark focus:ring-4 focus:ring-violet-500/5 focus:border-violet-400 outline-none h-28 resize-none transition-all"
                      defaultValue="12, Ring Road, Textile Market, Surat, Gujarat - 395003"
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* TAXATION */}
          {activeSection === 'taxation' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-serif font-black text-brand-text-dark uppercase tracking-tight">Taxation & Legal</h3>
                <p className="text-sm text-brand-text-muted mt-1">Compliance details for GST and Income Tax filings.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <Field label="GSTIN (Primary)">
                  <Input defaultValue="24AABCR1234A1Z5" className="font-mono uppercase" />
                </Field>
                <Field label="PAN (Corporate)">
                  <Input defaultValue="AABCR1234A" className="font-mono uppercase" />
                </Field>
                <Field label="LUT Number (For Exports)">
                  <Input placeholder="Enter LUT number if applicable" />
                </Field>
                <Field label="E-Way Bill Username">
                  <Input defaultValue="rathitex_surat" />
                </Field>
              </div>
            </div>
          )}

          {/* BANKING */}
          {activeSection === 'banking' && (
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Banking & Payments</h3>
                  <p className="text-sm text-gray-400">Manage bank accounts for payment collections.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-violet-50 text-violet-600 rounded-xl text-xs font-bold hover:bg-violet-100">
                  <Plus size={14} /> Add Account
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-6 border border-violet-100 bg-violet-50/30 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <Building2 size={24} className="text-violet-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">HDFC Bank</h4>
                      <p className="text-xs text-gray-400">A/C: 501002341234 • IFSC: HDFC0001234</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-violet-600 text-white text-[10px] font-black rounded uppercase">Default</span>
                    <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BILLING DEFAULTS */}
          {activeSection === 'billing' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Billing Defaults</h3>
                <p className="text-sm text-gray-400">Configure standard invoice settings and terms.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Invoice Prefix">
                  <Input defaultValue="INV/2026/" />
                </Field>
                <Field label="Next Invoice Number">
                  <Input defaultValue="0001" type="number" />
                </Field>
                <Field label="Default Tax State">
                  <Input defaultValue="Gujarat" />
                </Field>
                <Field label="Default Currency">
                  <Input defaultValue="INR (₹)" disabled />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Standard Terms & Conditions">
                    <textarea 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-violet-500/10 outline-none h-32 resize-none"
                      defaultValue="1. Goods once sold will not be taken back.&#10;2. Interest @18% will be charged if not paid within 30 days.&#10;3. Subject to Surat Jurisdiction."
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex justify-end gap-4">
            <button className="px-6 py-2.5 text-sm font-bold text-gray-400 hover:text-gray-600">
              Discard Changes
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-violet-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : (
                <>
                  <Save size={18} />
                  Save Portal Settings
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
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      {...props}
      className={cn(
        "w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-brand-text-dark outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-400 focus:bg-white transition-all disabled:opacity-50",
        props.className
      )}
    />
  );
}
