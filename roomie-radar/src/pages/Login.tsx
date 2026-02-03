import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userLogin } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { FiUser, FiLock, FiUsers, FiShield, FiMapPin, FiArrowRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { PixelGrid } from "../components/ui";
import { Rocket } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await userLogin({ username, password });
      if (result && result.token && result.user) {
        login(result.token, result.user);
        navigate("/");
      } else {
        setError(result?.message || "Invalid credentials.");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen flex bg-[#050505] overflow-hidden font-sans">
      <PixelGrid />

      {/* Left Side - Hero/Info */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-center px-16 xl:px-24 z-10 border-r border-white/5 bg-[#050505]/50 backdrop-blur-3xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-xl"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 mb-12 group">
            <div className="w-10 h-10 bg-trae-green rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12">
              <Rocket className="w-5.5 h-5.5 text-black fill-current" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">RoomieRadar</span>
          </Link>

          {/* Main Content */}
          <div className="space-y-10">
            <div>
              <div className="text-trae-green font-mono text-sm mb-3 font-bold uppercase tracking-widest">Secure Login</div>
              <h1 className="text-5xl xl:text-7xl font-black mb-6 leading-tight tracking-tighter text-white">
                Back to <br /> <span className="text-trae-green">The Flow.</span>
              </h1>
              <p className="text-base text-gray-500 max-w-md font-medium leading-relaxed">
                Connect with compatible flatmates through our AI-driven matching and secure platform.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {[
                { icon: FiUsers, color: 'text-trae-green', title: 'Verified Profiles', desc: 'Secure community with manual verification' },
                { icon: FiMapPin, color: 'text-blue-400', title: 'Prime Hubs', desc: 'Top rooms in strategic locations' },
                { icon: FiShield, color: 'text-emerald-400', title: 'Deep Trust', desc: 'Enterprise-grade security and privacy' }
              ].map((feat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center space-x-4 group"
                >
                  <div className={`w-12 h-12 bg-white/[0.03] border border-white/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:border-trae-green/30 transition-all duration-300`}>
                    <feat.icon className={`${feat.color} text-xl`} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white mb-0.5 uppercase tracking-tight">{feat.title}</h3>
                    <p className="text-gray-600 text-[11px] font-medium">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Status Indicator */}
            <div className="pt-10 border-t border-white/5 flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 bg-trae-green rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest font-bold">Status: Ready to connect</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 lg:px-16 z-10">
        <motion.div
          className="max-w-md w-full"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <div className="w-9 h-9 bg-trae-green rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-black fill-current" />
            </div>
            <span className="text-xl font-black text-white tracking-tighter">RoomieRadar</span>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-trae-green/20 via-teal-400/40 to-blue-500/20" />

            <div className="mb-8 text-left">
              <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">Sign In</h2>
              <p className="text-xs text-gray-600 font-medium">Continue your journey with RoomieRadar</p>
            </div>

            <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-5"
              onSubmit={handleLogin}
            >
              {error && (
                <motion.div
                  className="bg-red-500/5 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-trae-green/60 font-black ml-1">Username</label>
                <div className="relative group/input">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-trae-green transition-colors w-4.5 h-4.5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:border-trae-green/50 transition-all text-white placeholder-gray-700 text-[13px] font-medium"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-trae-green/60 font-black">Password</label>
                  <Link to="/forgot-password" className="text-[9px] font-black text-gray-600 hover:text-white transition-colors uppercase tracking-widest">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group/input">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-trae-green transition-colors w-4.5 h-4.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:border-trae-green/50 transition-all text-white placeholder-gray-700 text-[13px] font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </motion.div>

              <motion.button
                type="submit"
                className="w-full h-14 rounded-xl bg-trae-green text-black font-black uppercase tracking-widest text-[11px] shadow-xl shadow-trae-green/5 hover:bg-emerald-400 transition-all duration-300 flex items-center justify-center gap-2 group/btn mt-4"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span>Sign In</span>
                <FiArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </motion.button>
            </motion.form>

            <div className="mt-10 text-center border-t border-white/5 pt-8">
              <p className="text-gray-600 font-medium text-[11px] uppercase tracking-wider">
                Don't have an account?{' '}
                <Link to="/register" className="text-white font-black hover:text-trae-green transition-colors ml-1">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom links */}
          <div className="mt-8 flex items-center justify-center gap-6 text-gray-700 font-mono text-[8px] uppercase tracking-widest font-black">
            <span>© 2026 RoomieRadar</span>
            <span>Secure & Private</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
