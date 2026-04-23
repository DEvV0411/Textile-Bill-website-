'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Plus, Trash2, CheckCircle, AlertCircle, Save, 
  Phone, Mail, MapPin, User, ArrowRight, CreditCard,
  Briefcase, ShieldCheck
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { Customer, CustomerGroup, PaymentTerms, RegType } from '@/lib/types';
import { 
  generateId, generateCustomerCode, 
  GSTIN_REGEX, PAN_REGEX, getStateCodeFromGSTIN 
} from '@/lib/utils';
import toast from 'react-hot-toast';

type FormErrors = Partial<Record<string, string>>;

interface CustomerFormProps {
  customer: Customer | null;
  onClose: () => void;
}

// ─── Styled Components ────────────────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      {children}
      {error && (
        <motion.p initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
          className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1 ml-1">
          <AlertCircle size={12} /> {error}
        </motion.p>
      )}
    </div>
  );
}

function Input({ value, onChange, placeholder, className, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string; type?: string }) {
  return (
    <input 
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:bg-white outline-none transition-all font-medium ${className}`}
    />
  );
}

function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select 
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:bg-white outline-none transition-all appearance-none cursor-pointer font-medium"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ArrowRight size={14} className="rotate-90" />
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function emptyCustomer(code: string): Customer {
  return {
    id: generateId(), code, legalName: '', tradeName: '', group: 'Wholesale',
    phone: '', altPhone: '', email: '', city: '', state: 'Gujarat', pinCode: '',
    gstin: '', pan: '', stateCode: '', regType: 'Regular', creditLimit: 0,
    creditPeriod: 30, overdueRate: 18, priceList: 'Wholesale A',
    paymentTerms: '30 days', broker: '', billingAddresses: [],
    shippingAddresses: [], contacts: [], outstanding: 0, status: 'Active',
    lastTransaction: null,
  };
}

// ─── Main Form ────────────────────────────────────────────────────────────────
export default function CustomerForm({ customer, onClose }: CustomerFormProps) {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'details' | 'legal' | 'addresses' | 'contacts'>('details');
  const [form, setForm] = useState<Customer>(customer || emptyCustomer(generateCustomerCode(state.customers.length + 1)));
  const [errors, setErrors] = useState<FormErrors>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to top when tab changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.legalName.trim()) e.legalName = 'Business name is required';
    if (!form.phone.trim()) e.phone = 'Primary contact is required';
    if (form.gstin && !GSTIN_REGEX.test(form.gstin)) e.gstin = 'Invalid GSTIN format';
    if (form.pan && !PAN_REGEX.test(form.pan)) e.pan = 'Invalid PAN format';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      if (customer?.id) dispatch({ type: 'UPDATE_CUSTOMER', payload: form });
      else dispatch({ type: 'ADD_CUSTOMER', payload: { ...form, id: generateId() } });
      toast.success(customer?.id ? 'Customer updated!' : 'New customer added!');
      onClose();
    } else {
      setActiveTab('details'); // Switch to details to show errors
      toast.error('Check required fields');
    }
  };

  const set = <K extends keyof Customer>(key: K, val: Customer[K]) => setForm(f => ({ ...f, [key]: val }));

  const handleGSTINChange = (v: string) => {
    const gstin = v.toUpperCase();
    const stateCode = getStateCodeFromGSTIN(gstin);
    setForm(f => ({ ...f, gstin, stateCode: stateCode || f.stateCode }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
      />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="w-screen max-w-[560px] bg-white shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="px-8 py-7 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase">
                  {customer?.id ? 'Edit Client' : 'New Client'}
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {form.code || 'Drafting Mode'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-8 flex border-b border-slate-100 bg-slate-50/50 overflow-x-auto no-scrollbar whitespace-nowrap">
            {[
              { id: 'details', label: 'Basic Info', icon: <Briefcase size={14} /> },
              { id: 'legal', label: 'GST & Legal', icon: <ShieldCheck size={14} /> },
              { id: 'addresses', label: 'Locations', icon: <MapPin size={14} /> },
              { id: 'contacts', label: 'Contacts', icon: <Phone size={14} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-5 text-[10px] font-bold uppercase tracking-widest transition-all relative inline-flex ${
                  activeTab === tab.id ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="formTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
                )}
              </button>
            ))}
          </div>

          {/* Form Area */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {activeTab === 'details' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="sm:col-span-2">
                    <Field label="Legal Entity Name" error={errors.legalName}>
                      <Input value={form.legalName} onChange={v => set('legalName', v)} placeholder="As registered with Ministry" />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Trade Name / Brand">
                      <Input value={form.tradeName} onChange={v => set('tradeName', v)} placeholder="Public brand name" />
                    </Field>
                  </div>
                  <Field label="Primary Phone" error={errors.phone}>
                    <Input value={form.phone} onChange={v => set('phone', v)} placeholder="10-digit number" />
                  </Field>
                  <Field label="Email Address">
                    <Input value={form.email} onChange={v => set('email', v)} placeholder="official@company.com" />
                  </Field>
                  <Field label="Client Group">
                    <Select value={form.group} options={['Wholesale', 'Retail', 'Export']} onChange={v => set('group', v as CustomerGroup)} />
                  </Field>
                  <Field label="Agent / Broker">
                    <Input value={form.broker} onChange={v => set('broker', v)} placeholder="Independent Agent Name" />
                  </Field>
                  <Field label="Payment Terms">
                    <Select value={form.paymentTerms} options={['Immediate', '15 days', '30 days', '45 days', '60 days']} onChange={v => set('paymentTerms', v as PaymentTerms)} />
                  </Field>
                </div>
              )}

              {activeTab === 'legal' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="sm:col-span-2">
                    <Field label="GST Identification Number" error={errors.gstin}>
                      <div className="relative">
                        <Input value={form.gstin} onChange={handleGSTINChange} className="uppercase font-mono" placeholder="24AAAAA0000A1Z5" />
                        {GSTIN_REGEX.test(form.gstin) && <CheckCircle size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />}
                      </div>
                    </Field>
                  </div>
                  <Field label="Permanent Account Number (PAN)" error={errors.pan}>
                    <Input value={form.pan} onChange={v => set('pan', v.toUpperCase())} className="uppercase font-mono" placeholder="ABCDE1234F" />
                  </Field>
                  <Field label="Registration Type">
                    <Select value={form.regType} options={['Regular', 'Composition', 'Unregistered', 'SEZ']} onChange={v => set('regType', v as RegType)} />
                  </Field>
                  <div className="sm:col-span-2 p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-widest">
                      <CreditCard size={16} /> Credit Configuration
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <Field label="Credit Limit (₹)">
                        <Input value={String(form.creditLimit)} type="number" onChange={v => set('creditLimit', Number(v))} />
                      </Field>
                      <Field label="Interest Rate (%)">
                        <Input value={String(form.overdueRate)} type="number" onChange={v => set('overdueRate', Number(v))} />
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  {form.billingAddresses.map((addr, idx) => (
                    <div key={addr.id} className="premium-card p-6 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-slate-400" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Billing Location</span>
                        </div>
                        <button onClick={() => {
                          const list = [...form.billingAddresses];
                          list.splice(idx, 1);
                          set('billingAddresses', list);
                        }} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                      </div>
                      <p className="text-xs font-bold text-slate-900">{addr.line1}</p>
                      <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-tighter">{addr.city}, {addr.state} - {addr.pinCode}</p>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const addr = { id: generateId(), line1: '', line2: '', city: '', state: 'Gujarat', pinCode: '', label: 'Office' as const };
                      set('billingAddresses', [...form.billingAddresses, addr]);
                    }}
                    className="w-full py-5 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    <Plus size={18} /> Add New Location
                  </button>
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="space-y-6">
                  {form.contacts.map((contact, idx) => (
                    <div key={contact.id} className="premium-card p-6 group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <User size={16} />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Contact Person</span>
                        </div>
                        <button onClick={() => {
                          const list = [...form.contacts];
                          list.splice(idx, 1);
                          set('contacts', list);
                        }} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase">{contact.name}</h4>
                      <p className="text-[10px] font-medium text-slate-500 mt-1">{contact.role || 'Partner'}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900"><Phone size={12} /> {contact.phone}</div>
                        {contact.email && <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400"><Mail size={12} /> {contact.email}</div>}
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => set('contacts', [...form.contacts, { id: generateId(), name: 'New Contact', role: '', phone: '', email: '', whatsapp: true }])}
                    className="w-full py-5 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    <Plus size={18} /> Add Contact Representative
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sticky Footer */}
          <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <button onClick={onClose} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900">Discard Changes</button>
            <button onClick={handleSave} className="btn-primary min-w-[200px] !h-11 text-sm">
              <Save size={18} />
              Save Client
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
