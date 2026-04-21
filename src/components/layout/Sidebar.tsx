'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, Package, BarChart3, Settings,
  ChevronRight, X, Menu, Zap, LogOut
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { Page } from '@/lib/types';
import { cn } from '@/lib/utils';

const NAV_ITEMS: { page: Page; icon: React.ReactNode; label: string }[] = [
  { page: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { page: 'customers', icon: <Users size={20} />, label: 'Customers' },
  { page: 'invoice', icon: <FileText size={20} />, label: 'New Invoice' },
  { page: 'inventory', icon: <Package size={20} />, label: 'Inventory' },
  { page: 'reports', icon: <BarChart3 size={20} />, label: 'Reports' },
  { page: 'settings', icon: <Settings size={20} />, label: 'Settings' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { state, navigate, dispatch } = useApp();

  const handleNav = (page: Page) => {
    navigate(page);
    onCloseMobile();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full glass-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-4 px-7 py-8 border-b border-white/5">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center shadow-xl">
            <Zap size={22} className="text-white fill-white/20" />
          </div>
        </div>
        <div>
          <h1 className="text-white font-serif font-black text-lg tracking-tight leading-none">Textile Portal</h1>
          <p className="text-violet-400/60 text-[10px] font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
            Powered by <span className="text-white">✦</span>
          </p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map(({ page, icon, label }) => {
          const active = state.currentPage === page;
          return (
            <motion.button
              key={page}
              onClick={() => handleNav(page)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 relative group overflow-hidden',
                active
                  ? 'text-white shadow-lg shadow-violet-500/20'
                  : 'text-indigo-200/60 hover:text-white'
              )}
            >
              {active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600"
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                />
              )}
              {active && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-full shadow-[0_0_12px_#fff]" />
              )}
              <span className={cn('relative z-10 transition-transform duration-300 group-hover:scale-110', active ? 'text-white' : 'text-violet-400/50 group-hover:text-violet-400')}>
                {icon}
              </span>
              <span className="relative z-10 flex-1 text-left tracking-tight">{label}</span>
              {active && <ChevronRight size={14} className="relative z-10 opacity-40" />}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div className="p-5 mt-auto">
        <div className="bg-white/5 rounded-3xl p-4 border border-white/5 backdrop-blur-sm group hover:bg-white/10 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-xs font-black text-white shadow-inner">
                A
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#1E1B4B] rounded-full shadow-sm"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">Admin User</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="bg-violet-500/20 text-violet-300 text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md">Manager</span>
              </div>
            </div>
            <button 
              onClick={() => dispatch({ type: 'LOGOUT' })}
              className="text-indigo-400/40 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 fixed left-0 top-0 bottom-0 z-40 shadow-2xl overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-brand-sidebar/60 backdrop-blur-md z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 z-50 lg:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Mobile Bottom Nav ─────────────────────────────────────────────────────────
export function MobileBottomNav({ onMenuOpen }: { onMenuOpen: () => void }) {
  const { state, navigate } = useApp();
  const primaryNav = NAV_ITEMS.slice(0, 4);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass-sidebar border-t border-white/5 safe-area-pb">
      <div className="flex items-center justify-around py-3">
        {primaryNav.map(({ page, icon, label }) => {
          const active = state.currentPage === page;
          return (
            <button
              key={page}
              onClick={() => navigate(page)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 transition-all relative',
                active ? 'text-violet-400' : 'text-indigo-300/50'
              )}
            >
              {active && (
                <motion.div 
                  layoutId="activeDot"
                  className="absolute -top-3 w-1.5 h-1.5 bg-violet-400 rounded-full shadow-[0_0_8px_rgba(167,139,250,0.8)]" 
                />
              )}
              <div className={cn('transition-transform duration-300', active && 'scale-110')}>
                {icon}
              </div>
              <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
            </button>
          );
        })}
        <button
          onClick={onMenuOpen}
          className="flex flex-col items-center gap-1 px-3 py-2 text-indigo-300/50"
        >
          <Menu size={20} />
          <span className="text-[9px] font-black uppercase tracking-tighter">More</span>
        </button>
      </div>
    </div>
  );
}
