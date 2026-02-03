import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Edit2, Save, LogOut, Heart, Zap, Camera, Trash2, Settings, Layout } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getCurrentUser, updateUserProfile, uploadImage, updateRoommateProfile, createRoommateProfile, deleteRoommateProfile } from "../api";
import { PixelGrid } from "../components/ui";

const Profile = () => {
    const { logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isProfileDisabled, setIsProfileDisabled] = useState(false);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        username: "",
        role: "",
        avatar: "",
        roommateProfileId: null as number | null,
        age: 18,
        occupation: "",
        lifestyle: [] as string[],
        budget: "",
        location: "",
        bio: "",
        interests: [] as string[],
        gender: "",
        housingStatus: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const userData = await getCurrentUser();
            if (userData) {
                const isDisabled = userData.roomateProfile?.occupation === "[DISABLED]";
                setIsProfileDisabled(isDisabled || false);

                setFormData({
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    username: userData.username || "",
                    role: userData.role || "",
                    avatar: userData.roomateProfile?.avatar || "",
                    roommateProfileId: userData.roomateProfile?.id || null,
                    age: userData.roomateProfile?.age || 18,
                    occupation: userData.roomateProfile?.occupation || "",
                    lifestyle: userData.roomateProfile?.lifestyle || [],
                    budget: userData.roomateProfile?.budget || "",
                    location: userData.roomateProfile?.location || "",
                    bio: userData.roomateProfile?.bio || "",
                    interests: userData.roomateProfile?.interests || [],
                    gender: userData.roomateProfile?.gender || "",
                    housingStatus: userData.roomateProfile?.housingStatus || ""
                });
            }
        } catch (err) {
            setError("Could not load profile data.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "age" ? Number(value) : value
        }));
    };

    const handleArrayInputChange = (field: 'lifestyle' | 'interests', value: string) => {
        const arrayValue = value.split(',').map(s => s.trim()).filter(Boolean);
        setFormData(prev => ({
            ...prev,
            [field]: arrayValue
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        try {
            setUploading(true);
            const file = e.target.files[0];
            const response = await uploadImage(file);
            const imageUrl = response.url || response;
            setFormData(prev => ({ ...prev, avatar: imageUrl }));
            setSuccess("Image uploaded!");
        } catch (err) {
            setError("Failed to upload image.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            await updateUserProfile({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                username: formData.username
            });

            const roommateData = {
                name: formData.name,
                age: formData.age,
                occupation: formData.occupation,
                lifestyle: formData.lifestyle,
                budget: formData.budget,
                location: formData.location,
                bio: formData.bio,
                interests: formData.interests,
                avatar: formData.avatar,
                gender: formData.gender,
                housingStatus: formData.housingStatus
            };

            if (formData.roommateProfileId) {
                await updateRoommateProfile(formData.roommateProfileId, roommateData);
            } else if (formData.occupation || formData.bio) {
                const newProfile = await createRoommateProfile(roommateData);
                setFormData(prev => ({ ...prev, roommateProfileId: newProfile.id }));
            }

            setSuccess("Profile updated successfully!");
            setIsEditing(false);
            fetchProfile();
        } catch (err: any) {
            setError(err.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProfile = async () => {
        if (!formData.roommateProfileId) return;
        try {
            setLoading(true);
            await deleteRoommateProfile(formData.roommateProfileId);
            setSuccess("Deleted successfully!");
            setShowDeleteModal(false);
            fetchProfile();
        } catch (err: any) {
            setError("Delete failed.");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formData.name) {
        return (
            <div className="min-h-screen pt-16 flex flex-col items-center justify-center bg-[#050505]">
                <div className="w-10 h-10 border-2 border-trae-green border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-mono font-black text-gray-600 tracking-[0.3em] uppercase animate-pulse">Loading Profile...</p>
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
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12"
                >
                    <div>
                        <div className="text-trae-green font-mono text-[10px] mb-2 uppercase tracking-[0.2em] font-bold">Account Profile</div>
                        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-tight">
                            {isEditing ? 'Edit' : 'My'} <span className="text-trae-green">Profile.</span>
                        </h1>
                        <p className="text-sm text-gray-500 font-medium max-w-xl">
                            {isEditing ? 'Update your personal information and profile details.' : 'Manage your account and roommate profile details.'}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-white hover:text-black transition-all active:scale-95 flex items-center gap-2"
                            >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setIsEditing(false); fetchProfile(); }}
                                    className="px-6 py-3.5 bg-white/5 border border-white/10 text-gray-600 rounded-xl font-black uppercase tracking-widest text-[9px] hover:text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-6 py-3.5 bg-trae-green text-black rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-emerald-400 transition-all active:scale-95 flex items-center gap-2 shadow-xl"
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    Save Changes
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group text-center">
                            <div className="relative inline-block mb-6">
                                <div className="w-36 h-36 rounded-3xl bg-white/5 border-2 border-white/10 overflow-hidden shadow-xl relative group/avatar mx-auto">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl font-black text-gray-800 uppercase">{formData.name?.charAt(0)}</div>
                                    )}

                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                                            <Camera className="w-8 h-8 text-trae-green" />
                                            <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                    )}
                                </div>

                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl">
                                        <div className="w-8 h-8 border-2 border-trae-green border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>

                            <h3 className="text-2xl font-black text-white tracking-tighter mb-1 uppercase truncate">{formData.name}</h3>
                            <p className="text-trae-green font-mono text-[9px] font-bold uppercase tracking-[0.2em] mb-6">@{formData.username}</p>

                            <div className="flex flex-wrap justify-center gap-2 mb-8">
                                <span className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest text-blue-400">{formData.role}</span>
                                {formData.roommateProfileId && !isProfileDisabled && (
                                    <span className="px-2.5 py-1 bg-trae-green/10 border border-trae-green/20 rounded-lg text-[8px] font-black uppercase tracking-widest text-trae-green">Verified Profile</span>
                                )}
                            </div>

                            <div className="space-y-2.5">
                                <button className="w-full h-12 bg-white/5 text-gray-600 rounded-xl font-black uppercase tracking-widest text-[8px] flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white transition-all">
                                    <Settings className="w-3.5 h-3.5" /> Security
                                </button>
                                <button onClick={() => logout()} className="w-full h-12 bg-red-500/10 text-red-500 rounded-xl font-black uppercase tracking-widest text-[8px] flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all">
                                    <LogOut className="w-3.5 h-3.5" /> Log Out
                                </button>
                            </div>
                        </div>

                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] shadow-lg">
                            <h4 className="text-[9px] font-mono text-gray-600 font-black uppercase tracking-[0.3em] mb-5">Account Activity</h4>
                            <div className="space-y-3.5">
                                {[
                                    { label: 'Connections', val: '24 Nodes', icon: Layout },
                                    { label: 'Favorites', val: '12 Items', icon: Heart },
                                    { label: 'Last Active', val: '2m ago', icon: Zap }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <item.icon className="w-3.5 h-3.5 text-trae-green opacity-40" />
                                            <span className="text-[9px] font-bold text-gray-700 uppercase tracking-widest">{item.label}</span>
                                        </div>
                                        <span className="text-[9px] font-black text-white uppercase tracking-widest">{item.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Section 1: Core Metadata */}
                        <div className="bg-[#0a0a0a] border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-xl">
                            <h4 className="text-[9px] font-mono text-gray-600 font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                                Account Information
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { label: 'Full Name', name: 'name', val: formData.name, icon: User },
                                    { label: 'Email Address', name: 'email', val: formData.email, icon: Mail },
                                    { label: 'Phone Number', name: 'phone', val: formData.phone, icon: Phone }
                                ].map((field) => (
                                    <div key={field.name} className="space-y-2">
                                        <label className="text-[9px] font-mono text-gray-700 font-black uppercase tracking-widest ml-1">{field.label}</label>
                                        <div className={`relative flex items-center ${!isEditing && 'opacity-60'}`}>
                                            <field.icon className="absolute left-4.5 w-4.5 h-4.5 text-trae-green opacity-30" />
                                            <input
                                                type="text"
                                                name={field.name}
                                                value={field.val}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-trae-green/50 outline-none transition-all font-bold text-white tracking-widest text-[13px]"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section 2: Persona Module */}
                        <div className="bg-[#0a0a0a] border border-white/5 p-8 md:p-10 rounded-[2.5rem] shadow-xl relative">
                            {formData.roommateProfileId && (
                                <button onClick={() => setShowDeleteModal(true)} className="absolute top-8 right-8 w-10 h-10 bg-red-500/5 text-red-500/40 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}

                            <h4 className="text-[9px] font-mono text-gray-600 font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-trae-green shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                Roommate Profile
                            </h4>

                            <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-mono text-gray-700 font-black uppercase tracking-widest ml-1">Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4.5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-trae-green/50 outline-none transition-all font-black text-white text-[13px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-mono text-gray-700 font-black uppercase tracking-widest ml-1">Current Status</label>
                                    <select
                                        name="housingStatus"
                                        value={formData.housingStatus}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4.5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-trae-green/50 outline-none transition-all font-bold text-white appearance-none text-[13px]"
                                    >
                                        <option value="" className="bg-[#0a0a0a]">Select...</option>
                                        <option value="has-room" className="bg-[#0a0a0a]">Has Space</option>
                                        <option value="seeking-room" className="bg-[#0a0a0a]">Seeking Space</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-mono text-gray-700 font-black uppercase tracking-widest ml-1">Occupation</label>
                                    <input
                                        type="text"
                                        name="occupation"
                                        value={formData.occupation}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4.5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-trae-green/50 outline-none transition-all font-bold text-white tracking-widest uppercase text-[12px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-mono text-gray-700 font-black uppercase tracking-widest ml-1">Preferred Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-4.5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-trae-green/50 outline-none transition-all font-bold text-white tracking-widest uppercase text-[12px]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 mb-8">
                                <label className="text-[9px] font-mono text-gray-700 font-black uppercase tracking-widest ml-1">About Me</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    rows={4}
                                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-trae-green/50 outline-none transition-all font-medium text-gray-300 leading-relaxed resize-none text-[13px] italic"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-mono text-gray-700 font-black uppercase tracking-widest ml-1">Lifestyle</label>
                                    <input
                                        type="text"
                                        placeholder="Quiet, Social..."
                                        value={formData.lifestyle.join(', ')}
                                        onChange={(e) => handleArrayInputChange('lifestyle', e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4.5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-trae-green/50 outline-none transition-all font-bold text-white text-[12px]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-mono text-gray-700 font-black uppercase tracking-widest ml-1">Interests</label>
                                    <input
                                        type="text"
                                        placeholder="Tech, Art..."
                                        value={formData.interests.join(', ')}
                                        onChange={(e) => handleArrayInputChange('interests', e.target.value)}
                                        disabled={!isEditing}
                                        className="w-full px-4.5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:border-trae-green/50 outline-none transition-all font-bold text-white text-[12px]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {(error || success) && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className={`fixed bottom-8 right-8 px-6 py-3 rounded-xl border font-black uppercase tracking-widest text-[9px] z-[200] shadow-2xl ${error ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-trae-green/10 border-trae-green/30 text-trae-green'}`}
                    >
                        {error || success}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#050505]/95 backdrop-blur-xl"
                            onClick={() => setShowDeleteModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0a0a0a] border border-white/10 p-10 rounded-[2.5rem] max-w-sm w-full shadow-2xl relative text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">Delete Profile?</h3>
                            <p className="text-[13px] text-gray-600 font-medium mb-10 leading-relaxed">This action will permanently delete your roommate profile and remove you from searches.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-white/5 text-gray-700 rounded-xl font-black uppercase tracking-widest text-[9px] hover:text-white transition-all">Cancel</button>
                                <button onClick={handleDeleteProfile} className="flex-1 py-4 bg-red-500 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-red-600 transition-all">Delete Profile</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
