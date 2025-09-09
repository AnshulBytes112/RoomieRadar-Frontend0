import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const navigate = useNavigate()
  const { user, logout, isAdmin, isStudent } = useAuth()

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // Toggle dark mode class on document
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

  return (
    <nav  className={`fixed top-1 left-6 right-6 z-50 transition-all duration-500 ease-out bg-none ${
        isScrolled
          ? 'bg-slate-800/40 backdrop-blur-xl shadow-2xl border border-slate-500/30 rounded-3xl'
  : 'bg-slate-900/80 backdrop-blur-lg shadow-md rounded-3xl'
    }`}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-14">
        <Link 
  to="/" 
  className={`text-2xl font-extrabold transition-all duration-500 ease-out ${
    isScrolled ? 'text-white hover:text-gray-300' : 'text-white hover:text-gray-300'
  }`}
>
  RoomieRadar
</Link>

          
          <div className="flex space-x-8">
            <Link 
              to="/" 
              className={`font-semibold text-base transition-all duration-500 ease-out ${
                isScrolled 
                  ? 'text-gray-200 hover:text-white' 
                  : 'text-gray-200 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/find-room" 
              className={`font-semibold text-base transition-all duration-500 ease-out ${
                isScrolled 
                  ? 'text-gray-200 hover:text-white' 
                  : 'text-gray-200 hover:text-white'
              }`}
            >
              Find Room
            </Link>
            <Link 
              to="/find-roommate" 
              className={`font-semibold text-base transition-all duration-500 ease-out ${
                isScrolled 
                  ? 'text-gray-200 hover:text-white' 
                  : 'text-gray-200 hover:text-white'
              }`}
            >
              Find Roommate
            </Link>
            {!user ? (
              <>
                <Link
                  to="/login"
                  className={`font-semibold text-base transition-all duration-500 ease-out ${
                    isScrolled
                      ? 'text-blue-300 hover:text-white'
                      : 'text-blue-300 hover:text-white'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`font-semibold text-base transition-all duration-500 ease-out ${
                    isScrolled
                      ? 'text-green-300 hover:text-white'
                      : 'text-green-300 hover:text-white'
                  }`}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`font-semibold text-base transition-all duration-500 ease-out ${
                      isScrolled
                        ? 'text-purple-300 hover:text-white'
                        : 'text-purple-300 hover:text-white'
                    }`}
                  >
                    Admin
                  </Link>
                )}
                {isStudent && (
                  <Link
                    to="/find-room"
                    className={`font-semibold text-base transition-all duration-500 ease-out ${
                      isScrolled
                        ? 'text-gray-200 hover:text-white'
                        : 'text-gray-200 hover:text-white'
                    }`}
                  >
                    Find Room
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none ${
                isDarkMode 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                  : 'bg-gray-600 hover:bg-gray-500 text-white'
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
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

            {/* Profile Section - Only show if user is logged in */}
            {user && (
              <div className="relative">
                <button
                  onClick={toggleProfile}
                  className={`flex items-center space-x-2 transition-all duration-500 ease-out focus:outline-none ${
                    isScrolled 
                      ? 'text-gray-200 hover:text-white' 
                      : 'text-gray-200 hover:text-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ease-out ${
                    isScrolled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-600 hover:bg-gray-500'
                  }`}>
                    <svg className={`w-5 h-5 transition-all duration-500 ease-out ${
                      isScrolled ? 'text-white' : 'text-white'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className={`hidden md:block font-semibold text-base transition-all duration-500 ease-out ${
                    isScrolled ? 'text-gray-200' : 'text-gray-200'
                  }`}>
                    {user.name}
                  </span>
                  <span className={`hidden md:block text-xs transition-all duration-500 ease-out ${
                    isScrolled ? 'text-gray-400' : 'text-gray-400'
                  }`}>
                    ({user.role})
                  </span>
                  <svg 
                    className={`w-4 h-4 transition-all duration-500 ease-out ${isProfileOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black/95 backdrop-blur-xl rounded-2xl shadow-2xl py-2 z-50 border border-gray-500/40">
                  <div className="px-4 py-2 border-b border-gray-500/50">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-gray-300">{user.email}</p>
                    <p className="text-xs text-purple-300 capitalize">{user.role}</p>
                  </div>
                  
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-800/50 transition-all duration-300 hover:text-white"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>My Profile</span>
                    </div>
                  </Link>

                  <Link
                    to="/my-listings"
                    className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-800/50 transition-all duration-300 hover:text-white"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span>My Listings</span>
                    </div>
                  </Link>

                  <Link
                    to="/favorites"
                    className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-800/50 transition-all duration-300 hover:text-white"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>Favorites</span>
                    </div>
                  </Link>

                  <Link
                    to="/messages"
                    className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-800/50 transition-all duration-300 hover:text-white"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Messages</span>
                    </div>
                  </Link>

                  <div className="border-t border-gray-500/50 my-1"></div>

                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-800/50 transition-all duration-300 hover:text-white"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Settings</span>
                    </div>
                  </Link>

                  <Link
                    to="/help"
                    className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-800/50 transition-all duration-300 hover:text-white"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Help & Support</span>
                    </div>
                  </Link>

                  <div className="border-t border-gray-500/50 my-1"></div>

                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/30 transition-all duration-300 hover:text-red-300"
                    onClick={() => {
                      setIsProfileOpen(false)
                      logout()
                      navigate('/login')
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </div>
                  </button>
                </div>
              )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </nav>
  )
}

export default Navbar