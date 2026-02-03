import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, RotateCcw } from 'lucide-react';
import { PixelGrid } from '../components/ui';

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden px-6 font-sans">
      <PixelGrid />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-[#0a0a0a] border border-red-500/20 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />

          <div className="w-16 h-16 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
          </div>

          <div className="text-red-500 font-mono text-[9px] uppercase font-black tracking-widest mb-3">Unauthorized Access</div>
          <h1 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Access Denied.</h1>

          <p className="text-gray-600 mb-10 font-medium leading-relaxed uppercase tracking-widest text-[9px] max-w-[240px] mx-auto">
            You don't have permission to access this page.
          </p>

          {user && (
            <div className="mb-10 p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
              <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest mb-1.5">User Role</p>
              <p className="text-lg font-black text-trae-green uppercase tracking-widest">{user.role}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Link
              to="/"
              className="h-14 flex items-center justify-center gap-3 bg-white/[0.02] border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Home
            </Link>
            <Link
              to="/login"
              className="h-14 flex items-center justify-center gap-3 bg-trae-green text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-emerald-400 transition-all shadow-xl shadow-trae-green/5"
            >
              <RotateCcw className="w-4 h-4" /> Sign In
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[7px] font-mono text-gray-800 font-black uppercase tracking-widest">Secure Connection</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
