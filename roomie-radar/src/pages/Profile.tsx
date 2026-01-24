import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiShield, FiCamera } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { getCurrentUser, updateUserProfile, uploadImage, updateRoommateProfile, createRoommateProfile } from "../api";

const Profile = () => {
    const { } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        username: "",
        role: "",
        avatar: "",
        roommateProfileId: null as number | null
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const userData = await getCurrentUser();
            if (userData) {
                setFormData({
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    username: userData.username || "",
                    role: userData.role || "",
                    avatar: userData.roomateProfile?.avatar || "",
                    roommateProfileId: userData.roomateProfile?.id || null
                });
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
            setError("Could not load profile data.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        try {
            setUploading(true);
            const file = e.target.files[0];
            const response = await uploadImage(file);

            // Assuming response contains the URL in 'url' field, adapt based on API response
            // api.ts uploadImage returns json. If Backend returns directly the url string or object
            // Let's assume response.url or response (if it's the url string).
            // Checking Backend: UploadController usually returns url. 
            // If ambiguous, console.log first. But for now assuming standard.
            // If the backend returns { url: "..." }
            const imageUrl = response.url || response;

            setFormData(prev => ({
                ...prev,
                avatar: imageUrl
            }));
            setSuccess("Image uploaded! Click Save to apply changes.");
        } catch (err) {
            console.error("Image upload failed", err);
            setError("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            // 1. Update User Basic Info
            await updateUserProfile({
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            });

            // 2. Update Roommate Profile (Avatar) if changed
            if (formData.avatar) {
                if (formData.roommateProfileId) {
                    await updateRoommateProfile(formData.roommateProfileId, {
                        avatar: formData.avatar,
                        name: formData.name // Keep name in sync
                        // Add other fields if needed to preserve them, but PUT might replace.
                        // Ideally backend handles partial updates or we fetch-merge-update.
                        // RoommateService.updateRoommate does set fields if not null. 
                    });
                } else {
                    // Create if doesn't exist just for the avatar?
                    const newProfile = await createRoommateProfile({
                        name: formData.name,
                        age: 0, // Default
                        occupation: "Not specified",
                        lifestyle: [],
                        budget: "0",
                        location: "Not specified",
                        bio: "Created via Profile",
                        interests: [],
                        avatar: formData.avatar
                    });
                    setFormData(prev => ({ ...prev, roommateProfileId: newProfile.id }));
                }
            }

            setSuccess("Profile updated successfully!");
            setIsEditing(false);
            fetchProfile(); // Refresh data
        } catch (err: any) {
            setError(err.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="min-h-screen bg-[#0c0c1d] pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background blobs for depth */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
                <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="glass-card rounded-[2.5rem] shadow-2xl overflow-hidden border-white/5"
                >
                    {/* Header / Banner */}
                    <div className="relative h-64 bg-gray-900 overflow-hidden">
                        {/* Abstract Gradient Pattern */}
                        <div className="absolute inset-0 bg-gradient-premium opacity-80"></div>
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0c0c1d] to-transparent"></div>

                        <div className="absolute -bottom-16 left-12">
                            <div className="relative group">
                                <div className="w-40 h-40 rounded-[2.5rem] border-4 border-[#0c0c1d] bg-midnight-light flex items-center justify-center text-5xl font-black text-white overflow-hidden shadow-2xl relative">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <span className="uppercase text-gradient">{formData.name?.charAt(0) || "U"}</span>
                                    )}

                                    {/* Overlay for upload hint */}
                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <FiCamera className="text-white w-10 h-10" />
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-[2.5rem] z-10"
                                            title="Change Profile Picture"
                                        />
                                        <div className="absolute bottom-2 right-2 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:scale-110 transition-all shadow-xl shadow-blue-900/40">
                                            {uploading ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <FiCamera className="w-5 h-5" />
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-24 pb-12 px-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">{formData.name}</h1>
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">@{formData.username}</span>
                                    <div className="h-1 w-1 rounded-full bg-gray-600" />
                                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                                        {formData.role}
                                    </span>
                                </div>
                            </div>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="group flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all shadow-xl font-black uppercase tracking-widest text-[10px]"
                                >
                                    <FiEdit2 className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            fetchProfile(); // Reset changes
                                        }}
                                        className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all font-black uppercase tracking-widest text-[10px]"
                                    >
                                        <FiX className="w-4 h-4" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-500 hover:to-purple-500 transition-all shadow-xl shadow-blue-900/40 font-black uppercase tracking-widest text-[10px] disabled:opacity-50"
                                    >
                                        <FiSave className="w-4 h-4" />
                                        {loading ? "Syncing..." : "Save Changes"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 p-5 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/20 text-sm font-medium"
                            >
                                {error}
                            </motion.div>
                        )}

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8 p-5 bg-green-500/10 text-green-400 rounded-2xl border border-green-500/20 text-sm font-medium"
                            >
                                {success}
                            </motion.div>
                        )}

                        {/* Profile Details Form */}
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Left Column */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/10 pb-4 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                    Identity Details
                                </h3>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Full Name</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FiUser className="text-gray-500 group-focus-within/input:text-blue-400 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`pl-11 w-full rounded-2xl border ${isEditing ? 'border-white/10 bg-white/5 focus:ring-2 focus:ring-blue-500/50' : 'border-transparent bg-white/[0.02]'} py-4 transition-all outline-none text-white font-medium`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Email Address</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FiMail className="text-gray-500 group-focus-within/input:text-purple-400 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`pl-11 w-full rounded-2xl border ${isEditing ? 'border-white/10 bg-white/5 focus:ring-2 focus:ring-purple-500/50' : 'border-transparent bg-white/[0.02]'} py-4 transition-all outline-none text-white font-medium`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Phone Number</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FiPhone className="text-gray-500 group-focus-within/input:text-pink-400 transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`pl-11 w-full rounded-2xl border ${isEditing ? 'border-white/10 bg-white/5 focus:ring-2 focus:ring-pink-500/50' : 'border-transparent bg-white/[0.02]'} py-4 transition-all outline-none text-white font-medium`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Account Info / System Info */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/10 pb-4 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                    Access Control
                                </h3>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Unique ID (Username)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FiShield className="text-gray-600" />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.username}
                                            disabled
                                            className="pl-11 w-full rounded-2xl border border-transparent bg-white/[0.01] text-gray-600 py-4 cursor-not-allowed font-black"
                                            title="Username cannot be changed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Global Role</label>
                                    <div className="w-full rounded-2xl border border-transparent bg-white/[0.01] text-gray-600 py-4 px-6 cursor-not-allowed font-black uppercase tracking-widest">
                                        {formData.role}
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="pt-6">
                                        <button type="button" className="text-xs font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-8">
                                            Update Security Credentials
                                        </button>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );

};

export default Profile;
