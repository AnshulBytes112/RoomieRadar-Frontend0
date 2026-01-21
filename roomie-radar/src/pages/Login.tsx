import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userLogin } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { FiUser, FiLock, FiHome, FiCheckCircle, FiUsers, FiShield, FiMapPin } from "react-icons/fi";
import { motion } from "framer-motion";

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
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

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
                Find Your Perfect Roommate
              </h1>
              <p className="text-xl text-gray-600 max-w-lg">
                Join thousands of students and professionals who found their ideal living situation through RoomieRadar.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiUsers className="text-sky-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">Verified Roommates</h3>
                  <p className="text-gray-600">All roommates are verified for your safety and peace of mind</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="text-sky-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">Prime Locations</h3>
                  <p className="text-gray-600">Find rooms in the best neighborhoods near your workplace or college</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiShield className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-gray-900">Secure Platform</h3>
                  <p className="text-gray-600">Your data and transactions are protected with enterprise-grade security</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div>
                <div className="text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-gray-600">Properties</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">98%</div>
                <div className="text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
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
                Welcome Back
              </motion.h1>
              <motion.p 
                className="text-gray-600"
                variants={itemVariants}
              >
                Sign in to your RoomieRadar account
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
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Sign in to your RoomieRadar account</p>
              </motion.div>

              <motion.form 
                className="space-y-6" 
                onSubmit={handleLogin}
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

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500" />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
                    Forgot password?
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="pt-2">
                  <motion.button
                    type="submit"
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-lg font-medium transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign In
                  </motion.button>
                </motion.div>
              </motion.form>

              <motion.div 
                className="mt-8 text-center"
                variants={itemVariants}
              >
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-sky-600 hover:text-sky-700 font-medium">
                    Sign up
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

export default Login;
