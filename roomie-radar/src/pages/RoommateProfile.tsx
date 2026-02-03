import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Eye, Zap, MessageSquare, ChevronLeft, Shield, UserPlus } from "lucide-react";
import { getConversations, getRoommateProfileById, sendConnectionRequest } from "../api";
import { useAuth } from "../contexts/AuthContext";
import Toast from "../components/ui/Toast";
import type { ToastType } from "../components/ui/Toast";
import { PixelGrid } from "../components/ui";

interface RoommateProfileData {
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
  avatar: string;
  housingStatus?: string;
}

const RoommateProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<RoommateProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectedUserIds, setConnectedUserIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: ToastType }>({
    isVisible: false,
    message: "",
    type: "success"
  });

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getRoommateProfileById(Number(id));
        setProfile(data);
      } catch (err) {
        setError("Couldn't load profile details.");
      } finally {
        setLoading(false);
      }
    };
    const fetchConnections = async () => {
      try {
        const conversations = await getConversations();
        const ids = new Set<number>();
        conversations.forEach((convo: any) => {
          if (convo.otherParticipant?.id) ids.add(convo.otherParticipant.id);
        });
        setConnectedUserIds(ids);
      } catch (err) { }
    };
    fetchProfile();
    fetchConnections();
  }, [id]);

  const getHousingLabel = (status?: string) => {
    if (status === "has-room") return "Has a room";
    if (status === "seeking-room") return "Looking for a room";
    if (status === "has-roommate") return "Looking for a roommate";
    return "Searching";
  };

  const canViewDetails = () => profile && connectedUserIds.has(profile.userId);

  const handleConnect = async () => {
    if (!user) { navigate("/login"); return; }
    if (!profile) return;
    try {
      await sendConnectionRequest(profile.userId, "Hi! I'd like to connect with you.");
      setToast({ isVisible: true, message: `Request sent to ${profile.name.toUpperCase()}`, type: "success" });
    } catch (err: any) {
      setToast({ isVisible: true, message: err.message || "Connection failed", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex flex-col items-center justify-center bg-[#050505] font-sans">
        <div className="w-10 h-10 border-2 border-trae-green border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-[0.3em] font-bold animate-pulse">Loading Profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-[#050505]">
        <div className="text-center bg-[#0a0a0a] border border-red-500/20 p-8 rounded-[2rem] max-w-lg mx-auto shadow-xl">
          <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">Profile Not Found</h3>
          <p className="text-xs text-gray-600 mb-8 font-medium">{error || 'The user profile you requested is unavailable.'}</p>
          <button onClick={() => navigate("/find-roommate")} className="px-8 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[9px]">Back to roommates</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-16 sm:pt-28 pb-20 px-6 relative overflow-hidden font-sans text-white">
      <PixelGrid />

      <div className="max-w-[900px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <button
            onClick={() => navigate("/find-roommate")}
            className="flex items-center gap-2.5 text-gray-700 hover:text-trae-green mb-8 transition-all group font-black uppercase tracking-widest text-[9px]"
          >
            <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to Roommates
          </button>
          <div className="text-trae-green font-mono text-[10px] mb-3 uppercase tracking-[0.2em] font-bold">Roommate Profile</div>
          <h1 className="text-4xl md:text-6xl font-black mb-5 tracking-tighter leading-tight">
            {profile.name}. <span className="text-trae-green">{profile.age}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1.5 bg-trae-green/5 border border-trae-green/20 rounded-lg">
              <span className="text-[8px] font-black text-trae-green uppercase tracking-widest">{profile.occupation || 'Professional'}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <MapPin className="w-3 h-3 text-blue-400 opacity-60" />
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{profile.location}</span>
            </div>
            <div className="px-3 py-1.5 bg-purple-500/5 border border-purple-500/20 rounded-lg">
              <span className="text-[8px] font-black text-purple-400 uppercase tracking-widest">{getHousingLabel(profile.housingStatus)}</span>
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Identity Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem] shadow-xl flex flex-col md:flex-row items-center gap-8 group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-trae-green/20 to-transparent" />

            <div className="w-36 h-36 rounded-3xl overflow-hidden border-2 border-white/10 group-hover:border-trae-green/30 transition-all duration-700 flex-shrink-0">
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
            </div>
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <p className="text-trae-green font-mono text-[9px] uppercase font-black tracking-widest mb-2 opacity-50">About Me</p>
                <p className="text-xl font-medium text-gray-300 leading-relaxed italic">"{profile.bio || 'Hello! I am looking for a great roommate to share a space with.'}"</p>
              </div>
              {!canViewDetails() && (
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <button onClick={handleConnect} className="px-6 py-3 bg-trae-green text-black rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-xl">
                    <UserPlus className="w-3.5 h-3.5" /> Express Interest
                  </button>
                  <button className="px-6 py-3 bg-white/5 border border-white/10 text-gray-600 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 cursor-not-allowed">
                    <Shield className="w-3.5 h-3.5" /> Message User
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {canViewDetails() ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem] shadow-xl space-y-6">
                  <div className="flex items-center gap-3 text-trae-green/80">
                    <Zap className="w-4 h-4" />
                    <h3 className="text-sm font-black uppercase tracking-tight">Lifestyle</h3>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {profile.lifestyle.map((trait, i) => (
                      <span key={i} className="px-3.5 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[8px] font-black uppercase tracking-widest text-gray-400">{trait}</span>
                    ))}
                  </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem] shadow-xl space-y-6">
                  <div className="flex items-center gap-3 text-blue-400/80">
                    <Eye className="w-4 h-4" />
                    <h3 className="text-sm font-black uppercase tracking-tight">Interests</h3>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {profile.interests.map((interest, i) => (
                      <span key={i} className="px-3.5 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[8px] font-black uppercase tracking-widest text-gray-400">{interest}</span>
                    ))}
                  </div>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-trae-green/5 border border-trae-green/10 rounded-2xl flex items-center justify-center">
                    <Shield className="w-7 h-7 text-trae-green/80" />
                  </div>
                  <div>
                    <p className="text-trae-green font-mono text-[9px] uppercase font-black tracking-widest mb-1 opacity-50">Budget</p>
                    <p className="text-3xl font-black text-white tracking-tighter uppercase">{profile.budget}</p>
                  </div>
                </div>
                <button onClick={() => navigate("/messages")} className="w-full md:w-auto h-14 px-8 bg-trae-green text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all shadow-xl shadow-trae-green/10 active:scale-95 flex items-center justify-center gap-3">
                  <MessageSquare className="w-4 h-4" /> Send Message
                </button>
              </motion.div>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/[0.02] border border-white/5 p-16 rounded-[2.5rem] text-center backdrop-blur-3xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-trae-green/[0.03] to-transparent pointer-events-none" />
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-105 transition-transform">
                <Shield className="w-8 h-8 text-trae-green opacity-40" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-3">Profile Hidden</h3>
              <p className="text-gray-600 font-medium max-w-xs mx-auto leading-relaxed uppercase tracking-widest text-[9px]">Connect with this user to see their full profile and interests.</p>
              <div className="mt-10 flex justify-center gap-4">
                <button onClick={handleConnect} className="px-8 py-4 bg-trae-green text-black rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-emerald-400 transition-all active:scale-95 shadow-xl">Connect Now</button>
                <button onClick={() => navigate("/find-roommate")} className="px-8 py-4 bg-white/5 border border-white/10 text-gray-500 rounded-xl font-black uppercase tracking-widest text-[9px] hover:text-white transition-all">Go Back</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
    </div>
  );
};

export default RoommateProfile;
