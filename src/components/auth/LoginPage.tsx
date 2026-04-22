'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, User, ArrowRight, Zap, Eye, EyeOff, Globe } from 'lucide-react';
import { useApp } from '@/lib/store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { dispatch } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        dispatch({ type: 'LOGIN' });
        toast.success('Access Granted. Welcome, Admin.');
      } else {
        toast.error('Identity Verification Failed');
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#020617] overflow-hidden">
      {/* LEFT SIDE: Immersive Branding */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden group">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] group-hover:scale-110"
          style={{ backgroundImage: 'url("/images/login-bg.png")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#020617] via-[#020617]/40 to-transparent" />
        
        <div className="relative z-10 p-20 flex flex-col justify-between w-full h-full">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <Zap size={24} className="text-white fill-white/20" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest leading-none">Antigravity</h2>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Industrial Intelligence</p>
            </div>
          </motion.div>

          <div className="max-w-xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-6xl font-black text-white leading-[1.1] mb-6"
            >
              The Next Era of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Textile Management</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-white/60 text-lg font-medium leading-relaxed"
            >
              Precision billing, real-time inventory, and administrative control in a high-performance workspace.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="flex items-center gap-8"
          >
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-white/40" />
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Global Export Ready</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield size={16} className="text-white/40" />
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Bank-Grade Encryption</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center p-8 lg:p-24 bg-slate-50 relative">
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-3">
           <Zap size={20} className="text-slate-900" />
           <span className="text-slate-900 font-black uppercase tracking-tighter">Textile Portal</span>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Portal Access</h3>
            <p className="text-slate-500 font-medium">Verify your credentials to enter the administrative environment.</p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Personnel ID</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-900 text-sm outline-none focus:border-slate-900 transition-all font-bold placeholder:text-slate-200 placeholder:font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Secure Keyphrase</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-slate-900 text-sm outline-none focus:border-slate-900 transition-all font-bold placeholder:text-slate-200 placeholder:font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
               <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded-md border-2 border-slate-200 text-slate-900 focus:ring-0 cursor-pointer" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Remember Node</span>
               </label>
               <button type="button" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Emergency Reset</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full bg-slate-900 hover:bg-black text-white h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] active:scale-[0.98] transition-all flex items-center justify-center overflow-hidden disabled:opacity-50"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3"
                  >
                    Enter Workspace <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </form>

          <p className="mt-12 text-[10px] text-center font-bold text-slate-300 uppercase tracking-[0.3em]">
            © 2026 Antigravity Systems. V2.4 Stable
          </p>
        </div>
      </div>
    </div>
  );
}
