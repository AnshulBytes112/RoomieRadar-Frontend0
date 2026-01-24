import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Eye } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { getAllRoommates, sendConnectionRequest, searchRoommates } from "../api";
import { useAuth } from "../contexts/AuthContext";

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
    location: "any"
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<RoommateProfile | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roommateProfiles, setRoommateProfiles] = useState<RoommateProfile[]>([]);

  // Fetch roommate profiles from API on component mount
  useEffect(() => {
    const fetchRoommates = async () => {
      try {
        setLoading(true);
        const fetched = await getAllRoommates();
        const filtered = fetched.filter((profile: RoommateProfile) => profile.id !== user?.id);
        setRoommateProfiles(filtered);
        setError(null);
      } catch (err) {
        console.error('Error fetching roommates:', err);
        setError('Failed to fetch roommate profiles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoommates();
  }, [user]);

  const filteredProfiles = roommateProfiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.occupation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAge = activeFilters.ageRange === "any" ||
      (activeFilters.ageRange === "18-25" && profile.age >= 18 && profile.age <= 25) ||
      (activeFilters.ageRange === "26-35" && profile.age >= 26 && profile.age <= 35) ||
      (activeFilters.ageRange === "36+" && profile.age >= 36);

    const matchesLifestyle = activeFilters.lifestyle === "any" ||
      profile.lifestyle.includes(activeFilters.lifestyle);

    const matchesBudget = activeFilters.budget === "any" ||
      profile.budget.includes(activeFilters.budget);

    const matchesLocation = activeFilters.location === "any" ||
      profile.location.includes(activeFilters.location);

    return matchesSearch && matchesAge && matchesLifestyle && matchesBudget && matchesLocation;
  });

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
      location: "any"
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
      alert(`Connection request sent to ${profile.name}! They'll get back to you soon.`);
    } catch (err) {
      console.error('Error sending connection request:', err);
      alert('Failed to send connection request. Please try again.');
    }
  };

  const handleFindRoommates = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const filters = {
        ageRange: activeFilters.ageRange !== "any" ? activeFilters.ageRange : undefined,
        lifestyle: activeFilters.lifestyle !== "any" ? activeFilters.lifestyle : undefined,
        budget: activeFilters.budget !== "any" ? activeFilters.budget : undefined,
        location: activeFilters.location !== "any" ? activeFilters.location : undefined,
        occupation: searchQuery || undefined
      };
      const fetchedRoommates = await searchRoommates(filters);
      setRoommateProfiles(fetchedRoommates);
      setError(null);
    } catch (err) {
      console.error('Error searching roommates:', err);
      setError('Failed to search for roommates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return "text-green-400 bg-green-400/10";
    if (score >= 80) return "text-blue-400 bg-blue-400/10";
    if (score >= 70) return "text-yellow-400 bg-yellow-400/10";
    return "text-gray-400 bg-white/5";
  };

  return (
    <div className="min-h-screen bg-[#0c0c1d] pt-24 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[30%] -right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-pink-600/10 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-6xl md:text-7xl font-black mb-8 tracking-tight">
            Find Your <span className="text-gradient">Circle.</span>
          </h1>
          <p className="text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
            Connect with like-minded individuals and build <br />living relationships that truly matter.
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
            className="glass-card p-10 rounded-[2.5rem] mb-20 shadow-2xl border-white/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 opacity-50" />

            {/* Search Bar */}
            <div className="relative mb-12">
              <input
                type="text"
                placeholder="Search name, occupation, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-10 py-6 text-xl glass-card rounded-3xl focus:border-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 bg-white/5 text-white placeholder-gray-500"
              />
              <svg className="absolute right-10 top-1/2 transform -translate-y-1/2 w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Toggle */}
            <div className="flex justify-between items-center mb-8 px-2">
              <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                Advanced <span className="text-gradient">Filters</span>
              </h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="group flex items-center gap-3 px-6 py-3 glass-card rounded-2xl text-blue-400 hover:text-blue-300 transition-all border-none"
              >
                <span className="font-bold uppercase tracking-widest text-xs">{showFilters ? "Collapse" : "Expand"}</span>
                <svg className={`w-5 h-5 transform transition-transform duration-500 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="grid md:grid-cols-4 gap-8 mb-10 overflow-hidden"
                >
                  {[
                    { label: 'Age Range', key: 'ageRange', opts: ['any', '18-25', '26-35', '36+'] },
                    { label: 'Lifestyle', key: 'lifestyle', opts: ['any', 'Quiet', 'Social', 'Active', 'Creative', 'Clean'] },
                    { label: 'Budget Range', key: 'budget', opts: ['any', '₹15,000', '₹20,000', '₹22,000'] },
                    { label: 'Location', key: 'location', opts: ['any', 'Koramangala', 'Indiranagar', 'Whitefield', 'MG Road'] }
                  ].map((filter) => (
                    <div key={`filter-${filter.key}`} className="space-y-3">
                      <label className="text-xs font-black text-gray-500 ml-1 uppercase tracking-widest">{filter.label}</label>
                      <select
                        value={activeFilters[filter.key as keyof typeof activeFilters]}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="w-full px-5 py-4 glass-card rounded-2xl focus:border-blue-500/50 focus:outline-none transition-all bg-[#1a1a3a] text-white border-white/5 appearance-none cursor-pointer"
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
                <h3 className="text-4xl font-black text-white tracking-tight">
                  <span className="text-gradient">{filteredProfiles.length}</span> Roommates
                </h3>
                <p className="text-gray-500 font-medium">Synced with your lifestyle preferences</p>
              </div>
            </div>

            {/* Roommate Cards Grid */}
            {filteredProfiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {filteredProfiles.map((profile) => (
                  <motion.div
                    key={`profile-${profile.id}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-[2.5rem] hover:shadow-[0_20px_60px_-15px_rgba(37,99,235,0.1)] transition-all duration-700 transform hover:-translate-y-2 border-white/5 overflow-hidden group"
                  >
                    {/* Profile Header */}
                    <div className="relative p-10 bg-white/[0.03] border-b border-white/5">
                      <div className="absolute top-0 right-0 p-8">
                        <div className={`px-4 py-2 glass-card rounded-full text-[10px] font-black uppercase tracking-widest ${getCompatibilityColor(profile.compatibility)} shadow-xl border-none`}>
                          {profile.compatibility}% Match
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="relative flex-shrink-0">
                          <img
                            src={profile.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
                            alt={profile.name}
                            className="w-28 h-28 rounded-3xl object-cover border-2 border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-2xl border-4 border-[#0c0c1d] shadow-xl ${profile.isOnline ? 'bg-green-500 bg-gradient-to-br from-green-400 to-green-600' : 'bg-gray-600'
                            }`}></div>
                        </div>
                        <div>
                          <h3 className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">
                            {profile.name}, {profile.age}
                          </h3>
                          <p className="text-purple-400 font-black uppercase tracking-widest text-[10px] my-2">{profile.occupation}</p>
                          <div className="flex items-center gap-2 text-gray-500">
                            <MapPin className="w-4 h-4 text-pink-500" />
                            <span className="text-sm font-bold uppercase tracking-wider">{profile.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profile Content */}
                    <div className="p-10 space-y-10">
                      <p className="text-gray-400 text-lg font-light leading-relaxed mb-4">"{profile.bio}"</p>

                      <div className="grid grid-cols-2 gap-8">
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

                      {/* Action Buttons */}
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleConnect(profile)}
                          className="flex-1 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:from-blue-500 hover:to-purple-500 transition-all shadow-xl shadow-blue-900/40 active:scale-95"
                        >
                          Send Invitation
                        </button>
                        <button
                          onClick={() => setSelectedProfile(profile)}
                          className="px-6 py-5 glass-card text-gray-400 hover:text-white rounded-2xl border-none hover:bg-white/10 transition-all font-bold group/eye"
                        >
                          <Eye className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
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
                onClick={() => navigate('/create-profile')}
                className="px-12 py-5 glass-card text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all border-white/20"
              >
                Create Profile
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
          className="fixed inset-0 bg-midnight/90 backdrop-blur-xl flex items-center justify-center p-6 z-[100]"
          onClick={() => setSelectedProfile(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="glass-card rounded-[3rem] p-12 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-[0_30px_100px_rgba(0,0,0,0.5)] border-white/10 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProfile(null)}
              className="absolute top-8 right-8 w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-all border-none"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <img
                  src={selectedProfile.avatar}
                  alt={selectedProfile.name}
                  className="w-40 h-40 rounded-[2.5rem] object-cover border-4 border-white/10 shadow-2xl"
                />
                <div className="text-center md:text-left">
                  <h3 className="text-5xl font-black text-white tracking-tight mb-3">{selectedProfile.name}, {selectedProfile.age}</h3>
                  <p className="text-2xl text-gradient font-black uppercase tracking-[0.2em] text-sm mb-4">{selectedProfile.occupation}</p>
                  <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400">
                    <MapPin className="text-pink-500 w-5 h-5" />
                    <span className="text-lg font-bold uppercase tracking-widest">{selectedProfile.location}</span>
                  </div>
                </div>
              </div>

              <div className="p-10 glass-card bg-white/5 border-none rounded-[2.5rem]">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Manifesto</h4>
                <p className="text-2xl text-white font-light leading-relaxed">"{selectedProfile.bio}"</p>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
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
    </div>
  );
};

export default FindRoommate;