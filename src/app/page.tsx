'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import Sidebar, { MobileBottomNav } from '@/components/layout/Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import CustomerList from '@/components/customers/CustomerList';
import InvoiceCreation from '@/components/billing/InvoiceCreation';
import InventoryOverview from '@/components/inventory/InventoryOverview';
import ReportsCenter from '@/components/reports/ReportsCenter';
import SettingsPortal from '@/components/settings/SettingsPortal';
import LoginPage from '@/components/auth/LoginPage';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { state } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderPage = () => {
    switch (state.currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'customers': return <CustomerList />;
      case 'invoice': return <InvoiceCreation />;
      case 'inventory': return <InventoryOverview />;
      case 'reports': 
        return <ReportsCenter />;
      case 'settings':
        return <SettingsPortal />;
      default: return <Dashboard />;
    }
  };

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Toaster position="top-right" />
        <LoginPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-slate-900 selection:text-white overflow-x-hidden">
      <Toaster position="top-right" />
      
      {/* Navigation */}
      <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
      
      {/* Main Content Area */}
      <main className="lg:pl-72 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentPage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileBottomNav onMenuOpen={() => setMobileMenuOpen(true)} />
    </div>
  );
}
