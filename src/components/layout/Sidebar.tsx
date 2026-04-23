'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, Package, BarChart3, Settings,
  ChevronRight, Menu, Zap, LogOut
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { AppState, AppAction, Page } from '@/lib/types';
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

function SidebarContent({ state, navigate, dispatch, onCloseMobile }: { 
  state: AppState; 
  navigate: (p: Page) => void; 
  dispatch: React.Dispatch<AppAction>;
  onCloseMobile: () => void;
}) {
  const handleNav = (page: Page) => {
    navigate(page);
    onCloseMobile();
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="flex items-center gap-4 px-7 py-8 border-b border-slate-100">
        <div className="relative group">
          <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden p-1.5">
            <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain invert" />
          </div>
        </div>
        <div>
          <h1 className="text-slate-900 font-bold text-lg tracking-tight leading-none uppercase">Textile Portal</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
            Admin <span className="text-slate-300">|</span> Dashboard
          </p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto no-scrollbar">
        {NAV_ITEMS.map(({ page, icon, label }) => {
          const active = state.currentPage === page;
          return (
            <motion.button
              key={page}
              onClick={() => handleNav(page)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-bold transition-all duration-200 relative group overflow-hidden',
                active
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <span className={cn('relative z-10 transition-transform duration-200', active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600')}>
                {icon}
              </span>
              <span className="relative z-10 flex-1 text-left tracking-tight uppercase text-xs">{label}</span>
              {active && <ChevronRight size={14} className="relative z-10 opacity-60" />}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div className="p-5 mt-auto">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 group hover:border-slate-200 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                A
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 text-xs font-bold truncate">Admin User</p>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-tighter mt-0.5">Manager Account</p>
            </div>
            <button 
              onClick={() => dispatch({ type: 'LOGOUT' })}
              className="text-slate-300 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { state, navigate, dispatch } = useApp();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 fixed left-0 top-0 bottom-0 z-40 shadow-2xl overflow-hidden">
        <SidebarContent 
          state={state} 
          navigate={navigate} 
          dispatch={dispatch} 
          onCloseMobile={onCloseMobile} 
        />
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
              <SidebarContent 
                state={state} 
                navigate={navigate} 
                dispatch={dispatch} 
                onCloseMobile={onCloseMobile} 
              />
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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 safe-area-pb shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around py-3">
        {primaryNav.map(({ page, icon, label }) => {
          const active = state.currentPage === page;
          return (
            <button
              key={page}
              onClick={() => navigate(page)}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 transition-all relative',
                active ? 'text-slate-900' : 'text-slate-400'
              )}
            >
              {active && (
                <motion.div 
                  layoutId="activeDot"
                  className="absolute -top-3 w-1.5 h-1.5 bg-slate-900 rounded-full" 
                />
              )}
              <div className={cn('transition-transform duration-300', active && 'scale-110')}>
                {icon}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-tighter">{label}</span>
            </button>
          );
        })}
        <button
          onClick={onMenuOpen}
          className="flex flex-col items-center gap-1 px-3 py-1 text-slate-400"
        >
          <Menu size={20} />
          <span className="text-[9px] font-bold uppercase tracking-tighter">More</span>
        </button>
      </div>
    </div>
  );
}
