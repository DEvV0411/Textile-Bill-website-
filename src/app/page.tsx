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
      <div className="min-h-screen bg-[#0F0C29]">
        <Toaster position="top-right" />
        <LoginPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 selection:bg-violet-100 selection:text-violet-700">
      <Toaster position="top-right" />
      
      {/* Navigation */}
      <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
      
      {/* Main Content Area */}
      <main className="lg:pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
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
