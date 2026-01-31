import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userRegister } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { FiUser, FiLock, FiMail, FiPhone, FiArrowRight, FiHome, FiCheckCircle, FiUsers, FiShield, FiMapPin } from "react-icons/fi";
import { motion } from "framer-motion";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  // Remove unused login since we're not using it after registration
  useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await userRegister({
        username,
        name,
        email,
        password,
        phone
      });
      if (result && (result.success || result.user)) {
        navigate("/login");
      } else {
        setError(result?.message || "Registration failed.");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
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
    <div className="min-h-screen flex bg-[#0c0c1d] overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
      </div>

      {/* Left Side - Hero/Info */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-center px-24 z-10 transition-all duration-700">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 mb-16 group">
            <div className="w-14 h-14 glass-card rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <FiHome className="text-blue-400 text-3xl" />
            </div>
            <span className="text-4xl font-black text-white tracking-tight">Roomie<span className="text-gradient">Radar</span></span>
          </Link>

          {/* Main Content */}
          <div className="space-y-12">
            <div>
              <h1 className="text-6xl font-black mb-6 leading-tight text-white">
                Start your <br /> next <span className="text-gradient">Adventure.</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-lg font-light leading-relaxed">
                Join our exclusive community of verified roommates and find your perfect living space today.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-8">
              {[
                { icon: FiUsers, color: 'text-blue-400', title: 'Smart Matching', desc: 'Connect with people who share your vibe' },
                { icon: FiMapPin, color: 'text-purple-400', title: 'Elite Spaces', desc: 'Premium listings in the heart of the city' },
                { icon: FiShield, color: 'text-pink-400', title: 'Zero Risk', desc: 'Fully verified hosts and secure payments' }
              ].map((feat, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="flex items-center space-x-6 group"
                >
                  <div className={`w-14 h-14 glass-card rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <feat.icon className={`${feat.color} text-2xl`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{feat.title}</h3>
                    <p className="text-gray-400 font-light">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-12 pt-12 border-t border-white/10">
              {[
                { val: '10K+', label: 'Happy Users' },
                { val: '500+', label: 'Properties' },
                { val: '95%', label: 'Match Rate' }
              ].map((stat, i) => (
                <div key={i}>
                  <div className="text-3xl font-black text-white mb-1 tracking-tight">{stat.val}</div>
                  <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 sm:px-12 lg:px-24 z-10">
        <motion.div
          className="max-w-md w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Main Container */}
          <div className="glass-card p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Join Us</h2>
              <p className="text-gray-400 font-light">Create your RoomieRadar account</p>
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
                  className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300 ml-1 uppercase tracking-wider">Username</label>
                  <div className="relative group/input">
                    <FiUser className="absolute left-3 top-3.5 text-gray-400 group-focus-within/input:text-blue-400 transition-colors w-4 h-4" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 glass-card rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all bg-white/5 text-white text-sm placeholder-gray-500"
                      placeholder="Username"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300 ml-1 uppercase tracking-wider">Full Name</label>
                  <div className="relative group/input">
                    <FiUser className="absolute left-3 top-3.5 text-gray-400 group-focus-within/input:text-blue-400 transition-colors w-4 h-4" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 glass-card rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all bg-white/5 text-white text-sm placeholder-gray-500"
                      placeholder="Full Name"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <label className="text-xs font-semibold text-gray-300 ml-1 uppercase tracking-wider">Email Address</label>
                <div className="relative group/input">
                  <FiMail className="absolute left-4 top-4 text-gray-400 group-focus-within/input:text-purple-400 transition-colors w-4 h-4" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 glass-card rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all bg-white/5 text-white placeholder-gray-500"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <label className="text-xs font-semibold text-gray-300 ml-1 uppercase tracking-wider">Phone Number</label>
                <div className="relative group/input">
                  <FiPhone className="absolute left-4 top-4 text-gray-400 group-focus-within/input:text-pink-400 transition-colors w-4 h-4" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 glass-card rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all bg-white/5 text-white placeholder-gray-500"
                    placeholder="Enter your phone"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-1">
                <label className="text-xs font-semibold text-gray-300 ml-1 uppercase tracking-wider">Password</label>
                <div className="relative group/input">
                  <FiLock className="absolute left-4 top-4 text-gray-400 group-focus-within/input:text-blue-400 transition-colors w-4 h-4" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 glass-card rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all bg-white/5 text-white placeholder-gray-500"
                    placeholder="Create password"
                    required
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-4">
                <motion.button
                  type="submit"
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg shadow-xl shadow-blue-900/40 transition-all duration-300 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Create Account</span>
                  <FiArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </motion.form>

            <div className="mt-8 text-center">
              <p className="text-gray-400 font-light">
                Already have an account?{' '}
                <Link to="/login" className="text-white font-bold hover:text-blue-400 transition-colors underline underline-offset-8">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-10 flex items-center justify-center space-x-8 text-gray-500">
            <div className="flex items-center space-x-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
              <FiShield className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Secure</span>
            </div>
            <div className="flex items-center space-x-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
              <FiCheckCircle className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Verified</span>
            </div>
            <div className="flex items-center space-x-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
              <FiUsers className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Trusted</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

};

export default Register;
