import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Eye, Search, Filter, RefreshCw, UserPlus, X, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { sendConnectionRequest, searchRoommates, getConversations, getSentRequests, getPendingConnections } from "../api";
import { useAuth } from "../contexts/AuthContext";
import Toast from "../components/ui/Toast";
import type { ToastType } from "../components/ui/Toast";
import { PixelGrid } from "../components/ui";

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
  housingStatus?: string;
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
    size: 9,
    totalPages: 0,
    totalElements: 0,
  });
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: ToastType }>({
    isVisible: false,
    message: '',
    type: 'success'
  });
  const [connectedUserIds, setConnectedUserIds] = useState<Set<number>>(new Set());
  const [sentRequestUserIds, setSentRequestUserIds] = useState<Set<number>>(new Set());
  const [pendingReceivedUserIds, setPendingReceivedUserIds] = useState<Set<number>>(new Set());

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
      setError('Failed to fetch roommate profiles.');
      setRoommateProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRoommates(0);
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    try {
      const [conversations, sent, inbox] = await Promise.all([
        getConversations(),
        getSentRequests(),
        getPendingConnections()
      ]);

      const connectedIds = new Set<number>();
      conversations.forEach((convo: any) => {
        if (convo.otherParticipant?.id) connectedIds.add(convo.otherParticipant.id);
      });
      setConnectedUserIds(connectedIds);

      const sentIds = new Set<number>();
      sent.forEach((req: any) => {
        if (req.status === 'PENDING') sentIds.add(req.toUserId);
      });
      setSentRequestUserIds(sentIds);

      const incomingIds = new Set<number>();
      inbox.forEach((req: any) => {
        if (req.status === 'PENDING') incomingIds.add(req.fromUserId);
      });
      setPendingReceivedUserIds(incomingIds);
    } catch (err) { }
  };


  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchRoommates(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setActiveFilters({ ageRange: "any", lifestyle: "any", budget: "any", location: "any", gender: "any" });
    setSearchQuery("");
  };

  const handleConnect = async (profile: RoommateProfile) => {
    if (!user) { navigate('/login'); return; }
    try {
      await sendConnectionRequest(profile.userId, "Hi! I'd like to connect with you.");
      setToast({ isVisible: true, message: `Request sent to ${profile.name}`, type: 'success' });
      fetchConnections();
    } catch (err: any) {
      setToast({ isVisible: true, message: err.message || 'Connection failed', type: 'error' });
    }
  };

  const canViewDetails = (profile?: RoommateProfile | null) => {
    if (!profile) return false;
    return connectedUserIds.has(profile.userId);
  };

  const getConnectionStatus = (userId: number) => {
    if (connectedUserIds.has(userId)) return 'CONNECTED';
    if (sentRequestUserIds.has(userId)) return 'SENT';
    if (pendingReceivedUserIds.has(userId)) return 'INCOMING';
    return 'NONE';
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return "text-trae-green border-trae-green/20 bg-trae-green/5";
    if (score >= 80) return "text-blue-400 border-blue-400/20 bg-blue-400/5";
    return "text-gray-500 border-white/5 bg-white/5";
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-16 sm:pt-28 relative overflow-hidden font-sans text-white">
      <PixelGrid />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-left mb-12"
        >
          <div className="text-trae-green font-mono text-[10px] mb-3 uppercase tracking-[0.2em] font-bold">Find Roommates</div>
          <h1 className="text-4xl md:text-6xl font-black mb-5 tracking-tighter leading-tight">
            Find Your <span className="text-trae-green">Circle.</span>
          </h1>
          <p className="text-[13px] text-gray-500 max-w-xl font-medium leading-relaxed uppercase tracking-widest">
            Connect with like-minded individuals and build living relations.
          </p>
        </motion.div>

        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] mb-12 shadow-xl"
          >
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search name, occupation, personality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-5 py-3.5 bg-white/[0.02] border border-white/10 rounded-xl focus:border-trae-green/50 transition-all text-[12px] font-medium placeholder-gray-700"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
            </div>

            <div className="flex justify-between items-center mb-6 px-1">
              <h3 className="text-[8px] font-mono uppercase tracking-[0.2em] text-gray-700 font-black">Filter Results</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-trae-green font-black text-[9px] uppercase tracking-widest hover:text-emerald-400 transition-colors"
              >
                <Filter className="w-3 h-3" />
                {showFilters ? "Show Less" : "Show More Filters"}
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8"
                >
                  {[
                    { label: 'Age Range', key: 'ageRange', opts: ['any', '18-25', '26-35', '36+'] },
                    { label: 'Gender', key: 'gender', opts: ['any', 'male', 'female', 'other'] },
                    { label: 'Lifestyle', key: 'lifestyle', opts: ['any', 'Quiet', 'Social', 'Active', 'Creative'] },
                    { label: 'Budget', key: 'budget', opts: ['any', '₹15k', '₹20k', '₹25k'] },
                    { label: 'Location', key: 'location', opts: ['any', 'Koramangala', 'Indiranagar', 'Whitefield'] }
                  ].map((filter) => (
                    <div key={filter.key} className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-gray-700 ml-1">{filter.label}</label>
                      <select
                        value={activeFilters[filter.key as keyof typeof activeFilters]}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="w-full px-3 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl focus:border-trae-green/50 transition-all appearance-none cursor-pointer text-[11px] font-bold"
                      >
                        {filter.opts.map(opt => (
                          <option key={opt} value={opt} className="bg-[#0a0a0a]">{opt}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap gap-3 mt-2">
              <button onClick={() => fetchRoommates(0)} className="px-6 h-14 sm:h-12 bg-trae-green text-black font-black uppercase tracking-widest text-[11px] sm:text-[9px] rounded-xl hover:bg-emerald-400 transition-all flex items-center gap-2">
                <RefreshCw className="w-5 h-5 sm:w-4 sm:h-4" /> Refresh List
              </button>
              <button onClick={clearFilters} className="px-6 h-14 sm:h-12 bg-white/5 border border-white/10 text-gray-500 font-black uppercase tracking-widest text-[11px] sm:text-[9px] rounded-xl hover:text-white transition-all">
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="text-center py-32">
            <div className="w-10 h-10 border-2 border-trae-green border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-[10px] text-gray-600 font-mono uppercase tracking-[0.3em] font-bold animate-pulse">Finding Roommates...</p>
          </div>
        ) : (
          <div className="pb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {roommateProfiles.map((profile, i) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden group hover:border-trae-green/30 transition-all duration-500 shadow-xl flex flex-col"
                >
                  <div className="relative h-32 bg-white/[0.02] flex items-center justify-center border-b border-white/5">
                    <div className="relative group/avatar">
                      <div className="w-20 h-20 rounded-2xl bg-[#050505] border-2 border-white/10 shadow-xl overflow-hidden flex items-center justify-center transition-all group-hover/avatar:scale-105">
                        {profile.avatar ? (
                          <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl font-black text-trae-green uppercase">{profile.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0a0a0a] ${profile.isOnline ? 'bg-trae-green shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-700 animate-pulse'}`}></div>
                    </div>
                    <div className={`absolute top-3 right-3 px-2 py-0.5 border rounded-md text-[7px] font-black uppercase tracking-widest ${getCompatibilityColor(profile.compatibility)}`}>
                      {profile.compatibility}% Match
                    </div>
                  </div>

                  <div className="p-5 flex-grow flex flex-col">
                    <div className="mb-4">
                      <h3 className="text-lg font-black text-white leading-tight tracking-tight group-hover:text-trae-green transition-colors truncate">
                        {profile.name}, {profile.age}
                      </h3>
                      <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest">{profile.occupation || 'Member'}</p>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 text-[9px] mb-4 font-black uppercase tracking-widest">
                      <MapPin className="w-3 h-3 text-trae-green opacity-50" />
                      <span className="truncate">{profile.location}</span>
                    </div>

                    <p className="text-gray-500 font-regular text-[11px] mb-6 line-clamp-2 italic leading-relaxed">"{profile.bio}"</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {profile.lifestyle.slice(0, 2).map((trait, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white/5 border border-white/5 text-gray-600 rounded text-[7px] font-black uppercase tracking-widest">
                          {trait}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2.5 mt-auto">
                      {(() => {
                        const status = getConnectionStatus(profile.userId);
                        if (status === 'CONNECTED') {
                          return (
                            <button
                              onClick={() => navigate('/messages')}
                              className="flex-1 h-13 sm:h-11 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[11px] sm:text-[9px] rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                              <Zap className="w-4 h-4 text-trae-green" /> Chat
                            </button>
                          );
                        }
                        if (status === 'SENT') {
                          return (
                            <button
                              disabled
                              className="flex-1 h-13 sm:h-11 bg-white/5 border border-white/5 text-gray-600 font-black uppercase tracking-widest text-[11px] sm:text-[9px] rounded-xl flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                            >
                              <RefreshCw className="w-4 h-4 animate-spin-slow" /> Pending
                            </button>
                          );
                        }
                        if (status === 'INCOMING') {
                          return (
                            <button
                              onClick={() => navigate('/connections')}
                              className="flex-1 h-13 sm:h-11 bg-trae-green/20 border border-trae-green/30 text-trae-green font-black uppercase tracking-widest text-[11px] sm:text-[9px] rounded-xl hover:bg-trae-green/30 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            >
                              <UserPlus className="w-5 h-5 sm:w-4 sm:h-4" /> Respond
                            </button>
                          );
                        }
                        return (
                          <button
                            onClick={() => handleConnect(profile)}
                            className="flex-1 h-13 sm:h-11 bg-trae-green text-black font-black uppercase tracking-widest text-[11px] sm:text-[9px] rounded-xl hover:bg-emerald-400 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            <UserPlus className="w-5 h-5 sm:w-4 sm:h-4" /> Connect
                          </button>
                        );
                      })()}
                      <button
                        onClick={() => {
                          if (!canViewDetails(profile)) {
                            setToast({ isVisible: true, message: 'Please connect to view profile details', type: 'error' });
                          }
                          setSelectedProfile(profile);
                        }}
                        className="w-13 h-13 sm:w-11 sm:h-11 bg-white/5 border border-white/10 text-gray-600 rounded-xl flex items-center justify-center hover:text-white transition-all active:scale-95"
                      >
                        <Eye className="w-5 h-5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12 pb-10">
                <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 0} className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-600 disabled:opacity-20 hover:text-white transition-all"><ChevronLeft className="w-4 h-4" /></button>
                <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{pagination.page + 1} / {pagination.totalPages}</span>
                <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages - 1} className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-600 disabled:opacity-20 hover:text-white transition-all"><ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#050505]/95 backdrop-blur-xl" onClick={() => setSelectedProfile(null)} />
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 sm:p-10 max-w-lg w-full relative shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-trae-green/20 to-transparent" />
              <button onClick={() => setSelectedProfile(null)} className="absolute top-6 right-6 text-gray-700 hover:text-white transition-colors"><X className="w-5 h-5" /></button>

              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-24 h-24 rounded-3xl bg-[#050505] border-2 border-white/10 shadow-2xl flex items-center justify-center overflow-hidden">
                  {selectedProfile.avatar ? (
                    <img src={selectedProfile.avatar} alt={selectedProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-trae-green uppercase">{selectedProfile.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{selectedProfile.name}, {selectedProfile.age}</h3>
                  <p className="text-trae-green font-mono text-[9px] uppercase tracking-widest font-black mt-1">{selectedProfile.occupation}</p>
                </div>

                {canViewDetails(selectedProfile) ? (
                  <div className="w-full space-y-6 text-left">
                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl italic text-[13px] text-gray-400 leading-relaxed font-medium">"{selectedProfile.bio}"</div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest ml-1">Lifestyle</p>
                        <div className="flex flex-wrap gap-2">{selectedProfile.lifestyle.map(s => <span key={s} className="px-2 py-1 bg-trae-green/5 text-trae-green text-[7px] font-black uppercase rounded border border-trae-green/10">{s}</span>)}</div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest ml-1">Interests</p>
                        <div className="flex flex-wrap gap-2">{selectedProfile.interests.map(s => <span key={s} className="px-2 py-1 bg-blue-500/5 text-blue-400 text-[7px] font-black uppercase rounded border border-blue-500/10">{s}</span>)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-10">
                    <div className="w-12 h-12 bg-trae-green/5 border border-trae-green/10 rounded-2xl flex items-center justify-center mx-auto mb-6"><Zap className="w-6 h-6 text-trae-green opacity-40" /></div>
                    <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">Profile details are private. Connect with them to view more.</p>
                    {(() => {
                      const status = getConnectionStatus(selectedProfile!.userId);
                      if (status === 'SENT') {
                        return (
                          <button disabled className="mt-8 px-10 py-4 bg-white/5 border border-white/5 text-gray-600 font-black uppercase tracking-widest text-[10px] rounded-xl opacity-50 cursor-not-allowed">Request Pending</button>
                        );
                      }
                      if (status === 'INCOMING') {
                        return (
                          <button onClick={() => navigate('/connections')} className="mt-8 px-10 py-4 bg-trae-green/20 border border-trae-green/30 text-trae-green font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-trae-green/30 transition-all">Respond to Request</button>
                        );
                      }
                      return (
                        <button onClick={() => handleConnect(selectedProfile!)} className="mt-8 px-10 py-4 bg-trae-green text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-emerald-400 transition-all shadow-xl">Connect Now</button>
                      );
                    })()}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
    </div>
  );
};

export default FindRoommate;