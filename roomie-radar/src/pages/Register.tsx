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
    } catch (err) {
      setError("Registration failed. Please try again.");
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
    <div className="min-h-screen flex">
      {/* Left Side - Advertisement */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-50 to-sky-100 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%227%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-gray-800">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 mb-16">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <FiHome className="text-sky-600 text-2xl" />
            </div>
            <span className="text-3xl font-bold text-gray-900">RoomieRadar</span>
          </Link>

          {/* Main Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold mb-4 text-gray-900">
                Start Your Journey
              </h1>
              <p className="text-xl text-gray-600 max-w-lg">
                Create your account and join thousands who found their perfect living situation through RoomieRadar.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiUsers className="text-sky-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">Find Your Match</h3>
                  <p className="text-gray-600">Get matched with compatible roommates based on lifestyle and preferences</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="text-sky-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">Explore Locations</h3>
                  <p className="text-gray-600">Discover rooms in neighborhoods that fit your lifestyle and budget</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiShield className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">Safe & Secure</h3>
                  <p className="text-gray-600">Your information is protected with industry-leading security measures</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div>
                <div className="text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-gray-600">Happy Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-gray-600">Properties</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">95%</div>
                <div className="text-gray-600">Match Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 bg-white pt-16">
        <div className="min-h-screen flex items-center justify-center px-6">
          <motion.div 
            className="max-w-md w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Mobile Logo */}
            <motion.div 
              className="lg:hidden text-center mb-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Link to="/" className="inline-flex items-center justify-center w-16 h-16 bg-sky-500 rounded-2xl mb-4 mx-auto">
                <FiHome className="text-white text-2xl" />
              </Link>
              <motion.h1 
                className="text-3xl font-bold text-gray-900 mb-2"
                variants={itemVariants}
              >
                Create Account
              </motion.h1>
              <motion.p 
                className="text-gray-600"
                variants={itemVariants}
              >
                Join RoomieRadar today
              </motion.p>
            </motion.div>

            {/* Form Container */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Desktop Header */}
              <motion.div 
                className="hidden lg:block text-center mb-8"
                variants={itemVariants}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                <p className="text-gray-600">Join RoomieRadar today</p>
              </motion.div>

              <motion.form 
                className="space-y-4" 
                onSubmit={handleRegister}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {error && (
                  <motion.div 
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {error}
                  </motion.div>
                )}

                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm bg-gray-50"
                        placeholder="Username"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm bg-gray-50"
                        placeholder="Full Name"
                        required
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50"
                      placeholder="Enter your phone"
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50"
                      placeholder="Create password"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="pt-2">
                  <motion.button
                    type="submit"
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Create Account</span>
                    <FiArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              </motion.form>

              <motion.div 
                className="mt-8 text-center"
                variants={itemVariants}
              >
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-sky-600 hover:text-sky-700 font-medium">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div 
              className="mt-8 flex items-center justify-center space-x-6 text-gray-500"
              variants={itemVariants}
            >
              <div className="flex items-center space-x-2">
                <FiShield className="w-4 h-4" />
                <span className="text-xs">Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiCheckCircle className="w-4 h-4" />
                <span className="text-xs">Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <FiUsers className="w-4 h-4" />
                <span className="text-xs">Trusted</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
