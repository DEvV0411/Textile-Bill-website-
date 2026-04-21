'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, User, ArrowRight, Zap } from 'lucide-react';
import { useApp } from '@/lib/store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { dispatch } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock authentication - in a real app this would be an API call
    setTimeout(() => {
      if (username === 'admin' && password === 'admin') {
        dispatch({ type: 'LOGIN' });
        toast.success('Welcome back, Admin! 👋');
      } else {
        toast.error('Invalid credentials. Please try again.');
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0C29] p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/20 mb-6 group">
              <Zap size={32} className="text-white fill-white/20 group-hover:scale-110 transition-transform" />
            </div>
            <h1 className="text-white font-serif font-black text-3xl tracking-tight uppercase">Textile Portal</h1>
            <p className="text-violet-300/50 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Advanced Enterprise Control</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-violet-300/40 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400 group-focus-within:text-violet-300 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-violet-300/40 uppercase tracking-widest ml-1">Secure Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-violet-400 group-focus-within:text-violet-300 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="hidden" />
                <div className="w-4 h-4 rounded bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-violet-500/50 transition-colors">
                  <div className="w-1.5 h-1.5 bg-violet-500 rounded-full opacity-0"></div>
                </div>
                <span className="text-[10px] font-bold text-violet-300/40 uppercase tracking-widest">Remember device</span>
              </label>
              <button type="button" className="text-[10px] font-bold text-violet-400 hover:text-violet-300 uppercase tracking-widest transition-colors">Forgot Credentials?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Access Terminal <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-center gap-2">
            <Shield size={14} className="text-violet-500/40" />
            <p className="text-[9px] font-bold text-violet-300/20 uppercase tracking-[0.2em]">End-to-End Encrypted Session</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
