import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getAllRoommates, sendConnectionRequest } from "../api";
import { useAuth } from "../contexts/AuthContext";

interface RoommateProfile {
  id: number;
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
        const fetchedRoommates = await getAllRoommates();
        setRoommateProfiles(fetchedRoommates);
        setError(null);
      } catch (err) {
        console.error('Error fetching roommates:', err);
        setError('Failed to fetch roommate profiles. Please try again later.');
        // Fallback to sample data for development
        setRoommateProfiles([
          {
            id: 1,
            name: "Sarah Chen",
            age: 24,
            occupation: "Graduate Student",
            lifestyle: ["Quiet", "Clean", "Studious"],
            budget: "₹15,000 - ₹25,000",
            location: "Koramangala, Bangalore",
            bio: "Computer Science graduate student looking for a quiet, clean roommate who respects study time. I prefer a peaceful environment and enjoy reading, coding, and occasional yoga.",
            interests: ["Technology", "Reading", "Yoga", "Cooking"],
            compatibility: 95,
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
            isOnline: true,
            lastActive: "2 minutes ago"
          },
          {
            id: 2,
            name: "Mike Rodriguez",
            age: 28,
            occupation: "Software Engineer",
            lifestyle: ["Social", "Active", "Clean"],
            budget: "₹20,000 - ₹35,000",
            location: "Indiranagar, Bangalore",
            bio: "Software engineer who enjoys cooking, hiking, and social gatherings. Looking for someone with similar interests who values cleanliness and good communication.",
            interests: ["Cooking", "Hiking", "Music", "Travel"],
            compatibility: 88,
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            isOnline: false,
            lastActive: "1 hour ago"
          },
          {
            id: 3,
            name: "Priya Sharma",
            age: 26,
            occupation: "UX Designer",
            lifestyle: ["Creative", "Organized", "Pet-friendly"],
            budget: "₹18,000 - ₹30,000",
            location: "Whitefield, Bangalore",
            bio: "Creative professional who loves art, design, and animals. I'm organized and looking for a roommate who appreciates creativity and doesn't mind my cat.",
            interests: ["Art", "Design", "Animals", "Photography"],
            compatibility: 92,
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            isOnline: true,
            lastActive: "5 minutes ago"
          },
          {
            id: 4,
            name: "Alex Thompson",
            age: 25,
            occupation: "Marketing Executive",
            lifestyle: ["Extroverted", "Fitness-oriented", "Social"],
            budget: "₹22,000 - ₹40,000",
            location: "MG Road, Bangalore",
            bio: "Marketing professional who loves fitness, networking, and trying new restaurants. Looking for someone with similar interests who enjoys an active social life.",
            interests: ["Fitness", "Networking", "Food", "Travel"],
            compatibility: 85,
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            isOnline: false,
            lastActive: "3 hours ago"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoommates();
  }, []);

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
      await sendConnectionRequest(profile.id, "Hi! I'd like to connect with you.");
      alert(`Connection request sent to ${profile.name}! They'll get back to you soon.`);
    } catch (err) {
      console.error('Error sending connection request:', err);
      alert('Failed to send connection request. Please try again.');
    }
  };

  const handleFindRoommates = () => {
    if (!user) {
      navigate('/login');
    } else {
      alert("Searching for compatible roommates... This feature will be implemented soon!");
    }
  };

  const handleCreateProfile = () => {
    if (!user) {
      navigate('/login');
    } else {
      alert("Create your roommate profile... This feature will be implemented soon!");
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  return (
    <div className="min-h-screen pt-24 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Find Your Perfect Roommate
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Connect with compatible roommates based on lifestyle, preferences, and compatibility scores. 
            Build meaningful living relationships that last.
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading roommate profiles...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Profiles</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search and Filters Section */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-8 mb-12 border border-gray-100"
          >
            {/* Search Bar */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search by name, occupation, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none transition-all duration-300"
              />
              <svg className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Toggle */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Advanced Filters</h2>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
                <svg className={`w-5 h-5 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-4 gap-6 mb-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Age Range</label>
                  <select
                    value={activeFilters.ageRange}
                    onChange={(e) => handleFilterChange('ageRange', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300"
                  >
                    <option value="any">Any age</option>
                    <option value="18-25">18-25 years</option>
                    <option value="26-35">26-35 years</option>
                    <option value="36+">36+ years</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Lifestyle</label>
                  <select
                    value={activeFilters.lifestyle}
                    onChange={(e) => handleFilterChange('lifestyle', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300"
                  >
                    <option value="any">Any lifestyle</option>
                    <option value="Quiet">Quiet</option>
                    <option value="Social">Social</option>
                    <option value="Active">Active</option>
                    <option value="Creative">Creative</option>
                    <option value="Clean">Clean</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Budget Range</label>
                  <select
                    value={activeFilters.budget}
                    onChange={(e) => handleFilterChange('budget', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300"
                  >
                    <option value="any">Any budget</option>
                    <option value="₹15,000">₹15,000 - ₹25,000</option>
                    <option value="₹20,000">₹20,000 - ₹35,000</option>
                    <option value="₹22,000">₹22,000 - ₹40,000</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Location</label>
                  <select
                    value={activeFilters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-300"
                  >
                    <option value="any">Any location</option>
                    <option value="Koramangala">Koramangala</option>
                    <option value="Indiranagar">Indiranagar</option>
                    <option value="Whitefield">Whitefield</option>
                    <option value="MG Road">MG Road</option>
                  </select>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
              >
                Clear All Filters
              </button>
              <button
                onClick={handleFindRoommates}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                Find Roommates
              </button>
            </div>
          </motion.div>
        )}

        {/* Results Section */}
        {!loading && !error && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {filteredProfiles.length} Compatible Roommates Found
              </h3>
              <div className="text-gray-600">
                Showing {filteredProfiles.length} of {roommateProfiles.length} profiles
              </div>
            </div>

            {/* Roommate Cards Grid */}
            {filteredProfiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {filteredProfiles.map((profile, index) => (
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden group"
                  >
                    {/* Profile Header */}
                    <div className="relative p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img
                              src={profile.avatar}
                              alt={profile.name}
                              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                            />
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                              profile.isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                              {profile.name}, {profile.age}
                            </h3>
                            <p className="text-gray-600 font-medium">{profile.occupation}</p>
                            <p className="text-sm text-gray-500">{profile.location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${getCompatibilityColor(profile.compatibility)}`}>
                            {profile.compatibility}% Match
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{profile.lastActive}</p>
                        </div>
                      </div>
                    </div>

                    {/* Profile Content */}
                    <div className="p-6">
                      <p className="text-gray-700 mb-6 leading-relaxed">{profile.bio}</p>
                      
                      {/* Lifestyle Tags */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Lifestyle</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.lifestyle.map((trait, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Interests */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Interests</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.interests.map((interest, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Budget */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Budget Range</h4>
                        <p className="text-lg font-bold text-green-600">{profile.budget}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleConnect(profile)}
                          className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                        >
                          Connect Now
                        </button>
                        <button
                          onClick={() => setSelectedProfile(profile)}
                          className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
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
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Roommates Found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria to find more matches.</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300"
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-center text-white"
          >
            <h3 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Roommate?</h3>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of people who have found their ideal living companions through RoomieRadar.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate('/find-room')}
                className="px-8 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-all duration-300 font-medium"
              >
                Browse Rooms
              </button>
              <button
                onClick={handleCreateProfile}
                className="px-8 py-3 border-2 border-white text-white rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 font-medium"
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedProfile(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-800">{selectedProfile.name}'s Profile</h2>
              <button
                onClick={() => setSelectedProfile(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src={selectedProfile.avatar}
                  alt={selectedProfile.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{selectedProfile.name}, {selectedProfile.age}</h3>
                  <p className="text-gray-600 font-medium">{selectedProfile.occupation}</p>
                  <p className="text-gray-500">{selectedProfile.location}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">About</h4>
                <p className="text-gray-700 leading-relaxed">{selectedProfile.bio}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Lifestyle</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.lifestyle.map((trait, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.interests.map((interest, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => handleConnect(selectedProfile)}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium"
                >
                  Connect Now
                </button>
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
                >
                  Close
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
