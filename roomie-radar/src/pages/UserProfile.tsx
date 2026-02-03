import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Zap, MessageSquare, ChevronLeft, Shield, User, Mail, Briefcase, Calendar } from "lucide-react";
import { getProfileByUserId, fetchRoomsByUserId, sendConnectionRequest, getConversations } from "../api";
import { useAuth } from "../contexts/AuthContext";
import Toast from "../components/ui/Toast";
import type { ToastType } from "../components/ui/Toast";
import { PixelGrid } from "../components/ui";
import RoomCard from "../components/RoomCard";

interface UserProfileData {
    userId: number;
    name: string;
    email: string;
    username: string;
    phone?: string;
    avatar?: string;
    age?: number;
    occupation?: string;
    lifestyle?: string[];
    budget?: string;
    location?: string;
    bio?: string;
    interests?: string[];
    housingStatus?: string;
    hasRoommateProfile: boolean;
}

const UserProfile = () => {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: ToastType }>({
        isVisible: false,
        message: "",
        type: "success"
    });

    useEffect(() => {
        if (!userId) return;
        const fetchData = async () => {
            try {
                setLoading(true);
                const [profileData, roomsData] = await Promise.all([
                    getProfileByUserId(Number(userId)),
                    fetchRoomsByUserId(Number(userId))
                ]);
                setProfile(profileData);
                setRooms(roomsData);

                // Check connection
                const conversations = await getConversations();
                const connected = conversations.some((convo: any) =>
                    convo.otherParticipant?.id === Number(userId)
                );
                setIsConnected(connected);

            } catch (err: any) {
                setError(err.message || "Couldn't load profile details.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    const handleConnect = async () => {
        if (!currentUser) { navigate("/login"); return; }
        if (!profile) return;
        try {
            await sendConnectionRequest(profile.userId, "Hi! I saw your room listing and would like to connect.");
            setToast({ isVisible: true, message: `Request sent to ${profile.name.toUpperCase()}`, type: "success" });
        } catch (err: any) {
            setToast({ isVisible: true, message: err.message || "Connection failed", type: "error" });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-16 flex flex-col items-center justify-center bg-[#050505] font-sans">
                <div className="w-10 h-10 border-2 border-trae-green border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="text-[10px] text-gray-600 font-mono uppercase tracking-[0.3em] font-bold animate-pulse">Loading User Profile...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen pt-16 flex items-center justify-center bg-[#050505]">
                <div className="text-center bg-[#0a0a0a] border border-red-500/20 p-8 rounded-[2rem] max-w-lg mx-auto shadow-xl">
                    <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">Profile Not Found</h3>
                    <p className="text-xs text-gray-600 mb-8 font-medium">{error || 'The user profile you requested is unavailable.'}</p>
                    <button onClick={() => navigate(-1)} className="px-8 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[9px]">Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] pt-16 sm:pt-28 pb-20 px-6 relative overflow-hidden font-sans text-white">
            <PixelGrid />

            <div className="max-w-[1000px] mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2.5 text-gray-700 hover:text-trae-green mb-8 transition-all group font-black uppercase tracking-widest text-[9px]"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                        Back
                    </button>

                    <div className="flex flex-col md:flex-row gap-10 items-start">
                        {/* Left: Basic Info */}
                        <div className="w-full md:w-80 space-y-6">
                            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group text-center">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-trae-green/20 to-transparent" />

                                <div className="w-40 h-40 rounded-3xl overflow-hidden border-2 border-white/10 mx-auto mb-6 group-hover:border-trae-green/30 transition-all duration-700">
                                    <img src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=10b981&color=fff`} alt={profile.name} className="w-full h-full object-cover" />
                                </div>

                                <h1 className="text-3xl font-black mb-2 tracking-tighter uppercase tabular-nums">
                                    {profile.name}
                                </h1>

                                <div className="flex justify-center gap-2 mb-6">
                                    {profile.age && (
                                        <span className="px-3 py-1 bg-trae-green/5 border border-trae-green/20 rounded-lg text-[8px] font-black text-trae-green uppercase tracking-widest">
                                            {profile.age} Years
                                        </span>
                                    )}
                                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black text-gray-500 uppercase tracking-widest">
                                        Verified
                                    </span>
                                </div>

                                <div className="space-y-3 pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <Briefcase className="w-4 h-4 text-trae-green opacity-70" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest truncate">{profile.occupation || 'Professional'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <MapPin className="w-4 h-4 text-blue-400 opacity-70" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest truncate">{profile.location || 'Location Not Set'}</span>
                                    </div>
                                    {isConnected && (
                                        <div className="flex items-center gap-3 text-gray-400">
                                            <Mail className="w-4 h-4 text-purple-400 opacity-70" />
                                            <span className="text-[10px] font-bold tracking-widest truncate">{profile.email || 'Visible to contacts'}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 space-y-3">
                                    {!isConnected ? (
                                        <button onClick={handleConnect} className="w-full py-4 bg-trae-green text-black rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-emerald-400 transition-all shadow-xl shadow-trae-green/10 active:scale-95">
                                            Connect to View Details
                                        </button>
                                    ) : (
                                        <button onClick={() => navigate("/messages")} className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-white/10 transition-all active:scale-95">
                                            <MessageSquare className="w-4 h-4 inline-block mr-2" /> Message
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Trust & Verification */}
                            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] shadow-xl">
                                <h4 className="text-[9px] font-black text-gray-700 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                                    <Shield className="w-3 h-3 text-trae-green" /> Trust Score
                                </h4>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                                    <div className="h-full bg-trae-green w-[85%]" />
                                </div>
                                <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Profile Completion: 85%</p>
                            </div>
                        </div>

                        {/* Right: Detailed content */}
                        <div className="flex-1 space-y-8">
                            {/* Bio */}
                            <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-trae-green/20 to-transparent" />
                                <h4 className="text-[10px] font-mono text-gray-700 font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <User className="w-4 h-4 text-trae-green" /> Biography
                                </h4>
                                <p className="text-xl font-medium text-gray-300 leading-relaxed italic">
                                    "{profile.bio || "Hello! I'm a friendly individual looking for a great housing situation."}"
                                </p>
                            </div>

                            {/* Traits grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem] shadow-xl space-y-6">
                                    <div className="flex items-center gap-3 text-trae-green/80">
                                        <Zap className="w-4 h-4" />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest">Lifestyle</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2.5">
                                        {profile.lifestyle && profile.lifestyle.length > 0 ? profile.lifestyle.map((trait, i) => (
                                            <span key={i} className="px-3.5 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[8px] font-black uppercase tracking-widest text-gray-400">{trait}</span>
                                        )) : <span className="text-[8px] text-gray-700 uppercase font-black tracking-widest">No traits listed</span>}
                                    </div>
                                </div>
                                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem] shadow-xl space-y-6">
                                    <div className="flex items-center gap-3 text-blue-400/80">
                                        <Zap className="w-4 h-4" />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest">Interests</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2.5">
                                        {profile.interests && profile.interests.length > 0 ? profile.interests.map((interest, i) => (
                                            <span key={i} className="px-3.5 py-1.5 bg-white/5 border border-white/5 rounded-xl text-[8px] font-black uppercase tracking-widest text-gray-400">{interest}</span>
                                        )) : <span className="text-[8px] text-gray-700 uppercase font-black tracking-widest">No interests listed</span>}
                                    </div>
                                </div>
                            </div>

                            {/* User's Listings */}
                            <div>
                                <h3 className="text-2xl font-black mb-6 tracking-tighter uppercase flex items-center gap-3">
                                    <Calendar className="w-6 h-6 text-trae-green" /> Listings by {profile.name}
                                </h3>
                                {rooms.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {rooms.map(room => (
                                            <RoomCard
                                                key={room.id}
                                                room={room}
                                                onOpenGallery={() => navigate(`/room/${room.id}`)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white/5 border border-white/10 p-12 rounded-[2rem] text-center">
                                        <p className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">No active listings found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <Toast isVisible={toast.isVisible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
        </div>
    );
};

export default UserProfile;
