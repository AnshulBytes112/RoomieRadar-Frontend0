import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Eye } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { getAllRoommates, sendConnectionRequest, searchRoommates, getCurrentUser } from "../api";
import { useAuth } from "../contexts/AuthContext";
import Toast from "../components/ui/Toast";
import type { ToastType } from "../components/ui/Toast";

interface RoommateProfile {
  id: number;
  userId: number;
  name: string;
  age: number;
  occupation: string;
  lifestyle: string[];
  budget: string;
  location: string;
  bio: string;
  interests: string[];
  compatibility: number;
  avatar: string;
  isOnline: boolean;
  lastActive: string;
}

const FindRoommate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFilters, setActiveFilters] = useState({
    ageRange: "any",
    lifestyle: "any",
    budget: "any",
    location: "any",
    gender: "any"
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<RoommateProfile | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roommateProfiles, setRoommateProfiles] = useState<RoommateProfile[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: ToastType }>({
    isVisible: false,
    message: '',
    type: 'success'
  });
  const [hasRoommateProfile, setHasRoommateProfile] = useState(false);

  const fetchRoommates = async (page = 0) => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        ageRange: activeFilters.ageRange !== "any" ? activeFilters.ageRange : undefined,
        lifestyle: activeFilters.lifestyle !== "any" ? activeFilters.lifestyle : undefined,
        budget: activeFilters.budget !== "any" ? activeFilters.budget : undefined,
        location: activeFilters.location !== "any" ? activeFilters.location : undefined,
        occupation: searchQuery || undefined,
        gender: activeFilters.gender !== "any" ? activeFilters.gender : undefined,
        page,
        size: pagination.size,
      };

      const response = await searchRoommates(filters);

      if (response && response.content) {
        const filtered = response.content.filter((profile: RoommateProfile) => profile.userId !== user?.id);
        setRoommateProfiles(filtered);
        setPagination(prev => ({
          ...prev,
          page: response.number,
          totalPages: response.totalPages,
          totalElements: response.totalElements
        }));
      } else {
        setRoommateProfiles([]);
      }
    } catch (err) {
      console.error('Error fetching roommates:', err);
      setError('Failed to fetch roommate profiles. Please try again later.');
      setRoommateProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRoommates(0);
      checkUserRoommateProfile();
    }
  }, [user]); // Removed activeFilters and searchQuery from deps to avoid auto-refetch on every keypress

  const checkUserRoommateProfile = async () => {
    try {
      const userData = await getCurrentUser();
      if (userData && userData.roomateProfile) {
        setHasRoommateProfile(true);
      }
    } catch (err) {
      console.error('Error checking user roommate profile:', err);
    }
  };

  const handleSearch = () => {
    fetchRoommates(0);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchRoommates(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Client-side filtering is replaced by backend search
  const filteredProfiles = roommateProfiles;

  const handleFilterChange = (filterType: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setActiveFilters({
      ageRange: "any",
      lifestyle: "any",
      budget: "any",
      location: "any",
      gender: "any"
    });
    setSearchQuery("");
  };

  const handleConnect = async (profile: RoommateProfile) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await sendConnectionRequest(profile.userId, "Hi! I'd like to connect with you.");
      setToast({
        isVisible: true,
        message: `Connection request sent to ${profile.name}! They'll get back to you soon.`,
        type: 'success'
      });
    } catch (err: any) {
      console.error('Error sending connection request:', err);
      setToast({
        isVisible: true,
        message: err.message || 'Failed to send connection request. Please try again.',
        type: 'error'
      });
    }
  };

  const handleFindRoommates = () => {
    fetchRoommates(0);
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return "text-green-400 bg-green-400/10";
    if (score >= 80) return "text-blue-400 bg-blue-400/10";
    if (score >= 70) return "text-yellow-400 bg-yellow-400/10";
    return "text-gray-400 bg-white/5";
  };

  return (
    <div className="min-h-screen bg-[#0c0c1d] pt-20 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 md:mb-20"
        >
          <h1 className="text-4xl md:text-7xl font-black mb-6 md:mb-8 tracking-tight px-4">
            Find Your <span className="text-gradient">Circle.</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed px-6">
            Connect with like-minded individuals and build living relationships that truly matter.
          </p>
        </motion.div>

        {/* Loading & Error States scaled to theme */}
        {loading && (
          <div className="text-center py-32">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-8 shadow-2xl shadow-blue-500/20"></div>
            <p className="text-2xl text-gray-400 font-light animate-pulse tracking-wide">Scanning for compatibility...</p>
          </div>
        )}

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="glass-card border-red-500/20 px-10 py-12 rounded-[2.5rem] max-w-xl mx-auto shadow-2xl">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-ping" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Connection interrupted</h3>
              <p className="text-gray-400 mb-10 font-light leading-relaxed">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-10 py-4 bg-red-600/20 border border-red-500/30 text-red-100 rounded-2xl hover:bg-red-600/30 transition-all font-bold group flex items-center gap-3 mx-auto"
              >
                Sync again
              </button>
            </div>
          </motion.div>
        )}

        {/* Search and Filters Section */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] mb-12 md:mb-20 shadow-2xl border-white/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 opacity-50" />

            {/* Search Bar */}
            <div className="relative mb-8 md:mb-12">
              <input
                type="text"
                placeholder="Search name, occupation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 md:px-10 py-4 md:py-6 text-lg md:text-xl glass-card rounded-2xl md:rounded-3xl focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 bg-white/5 text-white placeholder-gray-500"
              />
              <svg className="absolute right-6 md:right-10 top-1/2 transform -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Toggle */}
            <div className="flex justify-between items-center mb-6 md:mb-8 px-2">
              <h2 className="text-xl md:text-3xl font-black text-white tracking-tight flex items-center gap-4">
                Advanced <span className="text-gradient hidden sm:inline">Filters</span>
              </h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="group flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 glass-card rounded-xl md:rounded-2xl text-blue-400 hover:text-blue-300 transition-all border-none"
              >
                <span className="font-bold uppercase tracking-widest text-[10px] md:text-xs">{showFilters ? "Collapse" : "Expand"}</span>
                <svg className={`w-4 h-4 md:w-5 md:h-5 transform transition-transform duration-500 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-8 md:mb-10 overflow-hidden"
                >
                  {[
                    { label: 'Age Range', key: 'ageRange', opts: ['any', '18-25', '26-35', '36+'] },
                    { label: 'Gender', key: 'gender', opts: ['any', 'male', 'female', 'other', 'prefer-not-to-say'] },
                    { label: 'Lifestyle', key: 'lifestyle', opts: ['any', 'Quiet', 'Social', 'Active', 'Creative', 'Clean'] },
                    { label: 'Budget Range', key: 'budget', opts: ['any', '₹15,000', '₹20,000', '₹22,000'] },
                    { label: 'Location', key: 'location', opts: ['any', 'Koramangala', 'Indiranagar', 'Whitefield', 'MG Road'] }
                  ].map((filter) => (
                    <div key={`filter-${filter.key}`} className="space-y-2 md:space-y-3">
                      <label className="text-[10px] font-black text-gray-500 ml-1 uppercase tracking-widest">{filter.label}</label>
                      <select
                        value={activeFilters[filter.key as keyof typeof activeFilters]}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="w-full px-4 md:px-5 py-3 md:py-4 glass-card rounded-xl md:rounded-2xl focus:border-blue-500/50 focus:outline-none transition-all bg-[#1a1a3a] text-white border-white/5 appearance-none cursor-pointer text-sm"
                      >
                        {filter.opts.map(opt => (
                          <option key={`${filter.key}-${opt}`} value={opt} className="bg-[#0c0c1d]">{opt}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={clearFilters}
                className="px-10 py-4 glass-card rounded-2xl text-gray-400 font-bold tracking-widest uppercase text-xs hover:bg-white/10 transition-all border-none"
              >
                Clear All
              </button>
              <button
                onClick={handleFindRoommates}
                className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:from-blue-500 hover:to-purple-500 transition-all shadow-xl shadow-blue-900/40 active:scale-95 flex items-center gap-3"
              >
                Find Roommates
              </button>
            </div>
          </motion.div>
        )}

        {/* Results Section */}
        {!loading && !error && (
          <div className="mb-24 px-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
              <div>
                <h3 className="text-xl md:text-4xl font-black text-white tracking-tight">
                  <span className="text-gradient">{pagination.totalElements}</span> Roommates
                </h3>
                <p className="text-xs md:text-base text-gray-500 font-medium">Page {pagination.page + 1} of {pagination.totalPages}</p>
              </div>
            </div>

            {/* Roommate Cards Grid */}
            {filteredProfiles.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-10">
                  {filteredProfiles.map((profile) => (
                    <motion.div
                      key={`profile-${profile.id}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card rounded-2xl md:rounded-[2.5rem] hover:shadow-[0_20px_60px_-15px_rgba(37,99,235,0.1)] transition-all duration-700 transform hover:-translate-y-2 border-white/5 overflow-hidden group flex flex-col"
                    >
                      {/* Profile Header */}
                      <div className="relative p-3 md:p-10 bg-white/[0.03] border-b border-white/5">
                        <div className="absolute top-0 right-0 p-2 md:p-8">
                          <div className={`px-2 md:px-4 py-1 md:py-2 glass-card rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest ${getCompatibilityColor(profile.compatibility)} shadow-xl border-none`}>
                            {profile.compatibility}%
                          </div>
                        </div>

                        <div className="flex flex-col items-center text-center">
                          <div className="relative flex-shrink-0 mb-2 md:mb-0">
                            <img
                              src={profile.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
                              alt={profile.name}
                              className="w-16 h-16 md:w-28 md:h-28 rounded-2xl md:rounded-[2rem] object-cover border-2 border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 md:w-8 md:h-8 rounded-full md:rounded-2xl border-2 md:border-4 border-[#0c0c1d] shadow-xl ${profile.isOnline ? 'bg-green-500 bg-gradient-to-br from-green-400 to-green-600' : 'bg-gray-600'
                              }`}></div>
                          </div>
                          <div className="w-full">
                            <h3 className="text-xs md:text-3xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight truncate w-full">
                              {profile.name}, {profile.age}
                            </h3>
                            <p className="text-purple-400 font-black uppercase tracking-widest text-[7px] md:text-[10px] my-0.5 md:my-2 truncate">{profile.occupation}</p>
                            <div className="flex items-center justify-center gap-1 md:gap-2 text-gray-500">
                              <MapPin className="w-2.5 h-2.5 md:w-4 md:h-4 text-pink-500" />
                              <span className="text-[7px] md:text-sm font-bold uppercase tracking-wider truncate max-w-[80px] md:max-w-none">{profile.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Profile Content */}
                      <div className="p-3 md:p-10 flex-grow flex flex-col justify-between">
                        <div className="hidden md:block space-y-6 md:space-y-10">
                          <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed line-clamp-3">"{profile.bio}"</p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                            <div>
                              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Lifestyle</h4>
                              <div className="flex flex-wrap gap-2">
                                {profile.lifestyle.slice(0, 3).map((trait, idx) => (
                                  <span key={`lifestyle-${profile.id}-${idx}`} className="px-3 py-1.5 glass-card bg-white/5 border-white/5 text-blue-300 rounded-xl text-[10px] font-black uppercase tracking-wider">
                                    {trait}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Interests</h4>
                              <div className="flex flex-wrap gap-2">
                                {profile.interests.slice(0, 3).map((interest, idx) => (
                                  <span key={`interest-${profile.id}-${idx}`} className="px-3 py-1.5 glass-card bg-white/5 border-white/5 text-purple-300 rounded-xl text-[10px] font-black uppercase tracking-wider">
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-6 glass-card border-none bg-white/5 rounded-3xl">
                            <div>
                              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Max Budget</h4>
                              <p className="text-2xl font-black text-white">{profile.budget}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Last Active</p>
                              <p className="text-sm font-bold text-gray-400">{profile.lastActive}</p>
                            </div>
                          </div>
                        </div>

                        {/* Mobile Only Content - Minimized */}
                        <div className="block md:hidden mb-2">
                          <div className="flex justify-center flex-wrap gap-1 mb-2">
                            {profile.lifestyle.slice(0, 2).map((trait, idx) => (
                              <span key={`mob-lifestyle-${profile.id}-${idx}`} className="px-1.5 py-0.5 glass-card bg-white/5 border-white/5 text-blue-300 rounded-md text-[6px] font-bold uppercase tracking-wider">
                                {trait}
                              </span>
                            ))}
                          </div>
                          <div className="text-center">
                            <p className="text-[9px] font-bold text-white">{profile.budget}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 md:gap-4 mt-auto">
                          <button
                            onClick={() => handleConnect(profile)}
                            className="flex-1 py-2 md:py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-xs hover:from-blue-500 hover:to-purple-500 transition-all shadow-xl shadow-blue-900/40 active:scale-95"
                          >
                            Connect
                          </button>
                          <button
                            onClick={() => setSelectedProfile(profile)}
                            className="px-3 md:px-6 py-2 md:py-5 glass-card text-gray-400 hover:text-white rounded-lg md:rounded-2xl border-none hover:bg-white/10 transition-all font-bold group/eye"
                          >
                            <Eye className="w-4 h-4 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-12 pb-12">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 0}
                      className="px-6 py-3 glass-card rounded-xl text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all font-bold uppercase tracking-wider text-sm"
                    >
                      Previous
                    </button>
                    <div className="text-white font-black text-lg">
                      {pagination.page + 1} <span className="text-gray-500 text-sm font-medium">/ {pagination.totalPages}</span>
                    </div>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages - 1}
                      className="px-6 py-3 glass-card rounded-xl text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all font-bold uppercase tracking-wider text-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32"
              >
                <div className="w-24 h-24 glass-card rounded-[2rem] flex items-center justify-center mx-auto mb-10">
                  <span className="text-4xl">🔎</span>
                </div>
                <h3 className="text-3xl font-black text-white mb-4">No explorers found</h3>
                <p className="text-xl text-gray-500 font-light mb-12">Try expanding your search parameters to find new matches.</p>
                <button
                  onClick={clearFilters}
                  className="px-12 py-5 bg-white text-midnight font-black uppercase tracking-widest rounded-2xl transition-all hover:scale-105 active:scale-95"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}

          </div>
        )}

        {/* CTA Section */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="glass-card mb-24 p-16 rounded-[3rem] text-center border-white/10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-premium opacity-[0.05]" />
            <div className="absolute -top-[50%] -right-[20%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen" />

            <h3 className="text-5xl font-black text-white mb-6 relative">Ready to <span className="text-gradient">Co-live?</span></h3>
            <p className="text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed relative">
              Join the most exclusive roommate community and <br />redefine your living experience.
            </p>
            <div className="flex flex-wrap gap-6 justify-center relative">
              <button
                onClick={() => navigate('/find-room')}
                className="px-12 py-5 bg-white text-midnight rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-2xl"
              >
                Browse Rooms
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="px-12 py-5 glass-card text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all border-white/20"
              >
                {hasRoommateProfile ? 'Edit Profile' : 'Create Profile'}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-midnight/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-6 z-[100]"
          onClick={() => setSelectedProfile(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="glass-card rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-white/10 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProfile(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 w-10 h-10 md:w-12 md:h-12 glass-card rounded-xl md:rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-all border-none"
            >
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-8 md:space-y-12">
              <div className="flex flex-col items-center gap-6 md:gap-10">
                <img
                  src={selectedProfile.avatar}
                  alt={selectedProfile.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] md:rounded-[2.5rem] object-cover border-4 border-white/10 shadow-2xl"
                />
                <div className="text-center">
                  <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">{selectedProfile.name}, {selectedProfile.age}</h3>
                  <p className="text-gradient font-black uppercase tracking-[0.2em] text-[10px] md:text-sm mb-4">{selectedProfile.occupation}</p>
                  <div className="flex items-center justify-center gap-3 text-gray-400">
                    <MapPin className="text-pink-500 w-4 h-4 md:w-5 md:h-5" />
                    <span className="text-base md:text-lg font-bold uppercase tracking-widest">{selectedProfile.location}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-10 glass-card bg-white/5 border-none rounded-[1.5rem] md:rounded-[2.5rem]">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 md:mb-6">Manifesto</h4>
                <p className="text-lg md:text-2xl text-white font-light leading-relaxed">"{selectedProfile.bio}"</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">Lifestyles</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedProfile.lifestyle.map((trait, idx) => (
                      <span key={`modal-lifestyle-${selectedProfile.id}-${idx}`} className="px-6 py-3 glass-card bg-blue-500/10 border-blue-500/20 text-blue-300 rounded-2xl text-sm font-black uppercase tracking-widest">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">Interests</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedProfile.interests.map((interest, idx) => (
                      <span key={`modal-interest-${selectedProfile.id}-${idx}`} className="px-6 py-3 glass-card bg-purple-500/10 border-purple-500/20 text-purple-300 rounded-2xl text-sm font-black uppercase tracking-widest">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-6 pt-8">
                <button
                  onClick={() => handleConnect(selectedProfile)}
                  className="flex-1 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:from-blue-500 hover:to-purple-500 transition-all shadow-2xl shadow-blue-900/40"
                >
                  Confirm Connection
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      {/* Toast Notification */}
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
};

export default FindRoommate;