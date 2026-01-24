import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c1d] relative overflow-hidden px-6">
      {/* Background blobs for depth */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
      </div>

      <div className="glass-card shadow-2xl rounded-[3rem] p-12 w-full max-w-md text-center relative z-10 border-white/5">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-2xl">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tight">Access Denied</h1>
        <p className="text-gray-500 mb-8 font-black uppercase tracking-widest text-[10px]">
          Protocol violation detected. Permission level insufficient.
        </p>
        {user && (
          <div className="mb-10 p-5 glass-card bg-white/5 border-none rounded-2xl">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Your Identity Level</p>
            <p className="text-xl font-black text-blue-400 uppercase tracking-tight">{user.role}</p>
          </div>
        )}
        <div className="space-y-4">
          <Link
            to="/"
            className="block h-16 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:scale-105 transition-all shadow-2xl shadow-purple-900/40"
          >
            Return to Nexus
          </Link>
          <Link
            to="/login"
            className="block h-16 flex items-center justify-center border-2 border-white/5 text-gray-400 hover:text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl transition-all"
          >
            Re-authenticate
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;

