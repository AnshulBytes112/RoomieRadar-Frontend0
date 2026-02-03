import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const navigate = useNavigate()
  const { user, logout, isAdmin, isStudent } = useAuth()

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { to: "/", label: "Home", color: "text-gray-200" },
    { to: "/find-room", label: "Find Room", color: "text-gray-200" },
    { to: "/find-roommate", label: "Find Roommate", color: "text-gray-200" },
  ]

  const authLinks = !user ? [
    { to: "/login", label: "Login", color: "text-blue-300" },
    { to: "/register", label: "Register", color: "text-green-300" },
  ] : [
    ...(isAdmin ? [{ to: "/admin", label: "Admin", color: "text-purple-300" }] : []),
    ...((isStudent || isAdmin) ? [
      { to: "/connections", label: "Connections", color: "text-gray-200" },
      { to: "/messages", label: "Messages", color: "text-blue-300" },
    ] : []),
  ]

  return (
    <>
      <nav className={`fixed top-1 left-6 right-6 z-50 transition-all duration-500 ease-out ${isScrolled
        ? 'bg-slate-800/40 backdrop-blur-xl shadow-2xl border border-slate-500/30 rounded-3xl'
        : 'bg-slate-900/80 backdrop-blur-lg shadow-md rounded-3xl'
        }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <Link
              to="/"
              className="text-2xl font-extrabold text-white hover:text-gray-300 transition-all"
            >
              RoomieRadar
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex space-x-8">
              {[...navLinks, ...authLinks].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`font-semibold text-base transition-all duration-300 ${link.color} hover:text-white`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isDarkMode
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-gray-600 hover:bg-gray-500 text-white'
                  }`}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m6.75-6.75l.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M17.657 6.343l-.707-.707M6.343 17.657l-.707.707M12 13a1 1 0 11-2 0 1 1 0 012 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Profile - Desktop only */}
              {user && (
                <div className="relative hidden md:block">
                  <button
                    onClick={toggleProfile}
                    className="flex items-center space-x-2 text-gray-200 hover:text-white transition-all focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-base">{user.name}</span>
                    <svg className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-black/95 backdrop-blur-xl rounded-2xl shadow-2xl py-2 z-50 border border-gray-500/40"
                      >
                        <div className="px-4 py-2 border-b border-gray-500/50">
                          <p className="text-sm font-semibold text-white">{user.name}</p>
                          <p className="text-xs text-purple-300 capitalize">{user.role}</p>
                        </div>
                        <Link to="/profile" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-800/50 hover:text-white" onClick={() => setIsProfileOpen(false)}>My Profile</Link>
                        <Link to="/my-listings" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-800/50 hover:text-white" onClick={() => setIsProfileOpen(false)}>My Listings</Link>
                        <Link to="/my-bookings" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-800/50 hover:text-white" onClick={() => setIsProfileOpen(false)}>My Bookings</Link>
                        <button
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/30"
                          onClick={() => { logout(); navigate('/login'); }}
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Hamburger Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-white transition-all"
              >
                {isMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-[#0c0c1d] flex flex-col p-12 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-16">
              <span className="text-3xl font-black text-white tracking-tight">Roomie<span className="text-gradient">Radar</span></span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col space-y-8">
              {[...navLinks, ...authLinks].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl font-black text-gray-500 hover:text-white transition-all"
                >
                  {link.label}
                </Link>
              ))}

              {user && (
                <>
                  <div className="pt-8 border-t border-white/5">
                    <p className="text-sm font-medium text-gray-400 mb-4">Account</p>
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-xl font-medium text-gray-300 hover:text-white mb-4"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/my-listings"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-xl font-medium text-gray-300 hover:text-white mb-4"
                    >
                      My Listings
                    </Link>
                    <Link
                      to="/my-bookings"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-xl font-medium text-gray-300 hover:text-white mb-4"
                    >
                      My Bookings
                    </Link>
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="text-2xl font-black text-red-500/50 hover:text-red-500 text-left pt-8 border-t border-white/5"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close profile dropdown */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
      )}
    </>
  )
}

export default Navbar