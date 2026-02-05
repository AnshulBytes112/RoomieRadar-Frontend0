import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userRegister, verifyOtp, resendOtp } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { FiUser, FiLock, FiMail, FiPhone, FiArrowRight, FiUsers, FiShield, FiMapPin, FiCheckCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import { PixelGrid } from "../components/ui";
import { Rocket } from "lucide-react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await userRegister({
        name,
        email,
        password,
        phone
      });
      if (result && (result.success || result.message?.includes("OTP"))) {
        setShowOtp(true);
      } else {
        setError(result?.message || "Registration failed.");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await verifyOtp(email, otp);
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Verification failed. Please check the OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await resendOtp(email);
      // Optional: show a success message
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 10
      }
    }
  } as const;

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
              <div className="text-trae-green font-mono text-sm mb-3 font-bold uppercase tracking-widest">Create Account</div>
              <h1 className="text-5xl xl:text-7xl font-black mb-6 leading-tight tracking-tighter text-white">
                Start your <br /> <span className="text-trae-green">Adventure.</span>
              </h1>
              <p className="text-base text-gray-500 max-w-md font-medium leading-relaxed">
                Join our exclusive community of verified roommates and find your perfect living space today.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {[
                { icon: FiUsers, color: 'text-trae-green', title: 'Smart Matching', desc: 'Connect with people who share your vibe' },
                { icon: FiMapPin, color: 'text-blue-400', title: 'Elite Spaces', desc: 'Premium listings in the heart of the city' },
                { icon: FiShield, color: 'text-emerald-400', title: 'Zero Risk', desc: 'Fully verified hosts and secure payments' }
              ].map((feat, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
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
              <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest font-bold">Status: Ready to sign up</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Register Form */}
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

            {!showOtp ? (
              <>
                <div className="mb-6 text-left">
                  <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">Join Us</h2>
                  <p className="text-xs text-gray-600 font-medium">Create your RoomieRadar identity</p>
                </div>

                <motion.form
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                  onSubmit={handleRegister}
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

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-trae-green/60 font-black ml-1">Full Name</label>
                    <div className="relative group/input">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-trae-green transition-colors w-4 h-4" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:border-trae-green/50 transition-all text-white text-[13px] placeholder-gray-700 font-medium"
                        placeholder="Full Name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-trae-green/60 font-black ml-1">Email Address</label>
                    <div className="relative group/input">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-blue-400 transition-colors w-4 h-4" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:border-trae-green/50 transition-all text-white placeholder-gray-700 text-[13px] font-medium"
                        placeholder="Enter email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-trae-green/60 font-black ml-1">Phone Number (Optional)</label>
                    <div className="relative group/input">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-orange-400 transition-colors w-4 h-4" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:border-trae-green/50 transition-all text-white placeholder-gray-700 text-[13px] font-medium"
                        placeholder="Enter phone"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-trae-green/60 font-black ml-1">Password</label>
                    <div className="relative group/input">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-trae-green transition-colors w-4 h-4" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:border-trae-green/50 transition-all text-white placeholder-gray-700 text-[13px] font-medium"
                        placeholder="Create password"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-14 rounded-xl bg-trae-green text-black font-black uppercase tracking-widest text-[11px] shadow-xl shadow-trae-green/5 hover:bg-emerald-400 transition-all duration-300 flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <span>{isLoading ? "Processing..." : "Sign Up"}</span>
                      <FiArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </motion.button>
                  </div>
                </motion.form>
              </>
            ) : (
              <>
                <div className="mb-6 text-left">
                  <div className="w-12 h-12 bg-trae-green/10 rounded-2xl flex items-center justify-center mb-4">
                    <FiMail className="text-trae-green text-2xl" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">Verify Email</h2>
                  <p className="text-xs text-gray-600 font-medium">We've sent a 6-digit code to <span className="text-white font-bold">{email}</span></p>
                </div>

                <motion.form
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                  onSubmit={handleVerifyOtp}
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

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-trae-green/60 font-black ml-1">Verification Code</label>
                    <div className="relative group/input">
                      <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-trae-green transition-colors w-4 h-4" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-11 pr-4 py-4 bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:border-trae-green/50 transition-all text-white text-2xl tracking-[0.5em] font-black placeholder-gray-800 text-center"
                        placeholder="000000"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <motion.button
                      type="submit"
                      disabled={isLoading || otp.length !== 6}
                      className="w-full h-14 rounded-xl bg-trae-green text-black font-black uppercase tracking-widest text-[11px] shadow-xl shadow-trae-green/5 hover:bg-emerald-400 transition-all duration-300 flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <span>{isLoading ? "Verifying..." : "Verify & Complete"}</span>
                      <FiCheckCircle className="w-4 h-4" />
                    </motion.button>

                    <button
                      type="button"
                      onClick={handleResend}
                      className="w-full text-[10px] font-bold text-gray-600 hover:text-white transition-colors uppercase tracking-widest text-center"
                    >
                      Didn't receive the code? <span className="text-trae-green">Resend</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowOtp(false)}
                      className="w-full text-[9px] font-medium text-gray-700 hover:text-gray-400 transition-colors uppercase tracking-[0.2em] text-center"
                    >
                      ← Back to details
                    </button>
                  </div>
                </motion.form>
              </>
            )}

            <div className="mt-8 text-center border-t border-white/5 pt-6">
              <p className="text-gray-600 font-medium text-[11px] uppercase tracking-wider">
                Active ID?{' '}
                <Link to="/login" className="text-white font-black hover:text-trae-green transition-colors ml-1">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
