import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutGrid, LogOut, Menu, X, Rocket, Bookmark, User } from "lucide-react"

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navigate = useNavigate()
  const { user, logout, isAdmin, isStudent } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/find-room", label: "Find Room" },
    { to: "/find-roommate", label: "Find Roommate" },
  ]

  const authLinks = !user ? [
    { to: "/login", label: "Log in", variant: "ghost" },
    { to: "/register", label: "Download", variant: "trae" },
  ] : [
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
    ...((isStudent || isAdmin) ? [
      { to: "/connections", label: "Connections" },
      { to: "/messages", label: "Messages" },
    ] : []),
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-[1400px] mx-auto px-6 h-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-trae-green rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12">
              <Rocket className="w-5 h-5 text-black fill-current" />
            </div>
            <span className="text-xl font-black text-white tracking-tighter">RoomieRadar</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-8 border-r border-white/10 pr-8 mr-4">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {!user ? (
                <>
                  <Link to="/login" className="text-sm font-semibold text-gray-400 hover:text-white px-4 py-2 transition-colors">
                    Log in
                  </Link>
                  <Link to="/register" className="text-sm font-bold bg-trae-green text-black px-5 py-2 rounded-lg hover:bg-emerald-400 transition-all">
                    Get Started
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-6">
                  {authLinks.map((link) => (
                    <Link key={link.to} to={link.to} className="text-sm font-semibold text-gray-400 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  ))}

                  <div className="relative group/avatar-btn">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="w-10 h-10 rounded-full bg-[#0a0a0a] border border-white/10 p-0.5 hover:border-trae-green/50 transition-all duration-300 overflow-hidden relative group"
                    >
                      {user.roomateProfile?.avatar ? (
                        <img src={user.roomateProfile.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5 text-xs font-black text-trae-green uppercase rounded-full">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-trae-green/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    {/* Pulsing Status Dot */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#050505] rounded-full flex items-center justify-center pointer-events-none">
                      <div className="w-2 h-2 bg-trae-green rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                    </div>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-4 w-56 bg-[#0a0a0a] border border-white/5 rounded-xl shadow-2xl py-2 z-50"
                        >
                          <div className="px-4 py-2 border-b border-white/5 mb-2">
                            <p className="text-sm font-bold text-white mb-0.5">{user.name}</p>
                            <p className="text-xs text-trae-green font-mono uppercase tracking-widest">{user.role}</p>
                          </div>
                          <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors" onClick={() => setIsProfileOpen(false)}>
                            <User className="w-4 h-4" /> Profile
                          </Link>
                          <Link to="/my-listings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors" onClick={() => setIsProfileOpen(false)}>
                            <LayoutGrid className="w-4 h-4" /> My Listings
                          </Link>
                          <Link to="/my-bookings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors" onClick={() => setIsProfileOpen(false)}>
                            <Bookmark className="w-4 h-4" /> My Bookings
                          </Link>
                          <button
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 transition-colors font-medium"
                            onClick={() => { logout(); navigate('/login'); }}
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#050505] p-6 pt-24"
          >
            <div className="flex flex-col gap-8">
              {[...navLinks, ...authLinks].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-3xl font-black text-white tracking-tighter"
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); navigate('/login'); }}
                  className="text-3xl font-black text-red-500 tracking-tighter text-left"
                >
                  Sign Out
                </button>
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