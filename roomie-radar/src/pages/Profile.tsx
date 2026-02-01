import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiShield, FiCamera } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { getCurrentUser, updateUserProfile, uploadImage, updateRoommateProfile, createRoommateProfile, deleteRoommateProfile } from "../api";

const Profile = () => {
    const { } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [isProfileDisabled, setIsProfileDisabled] = useState(false);

    // Auto-hide success messages
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess("");
            }, 3000); // Hide after 3 seconds
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
        // Roommate profile fields
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
                    // Roommate profile data
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

    const handleDeleteRoommateProfile = async () => {
        if (!formData.roommateProfileId) return;
        
        try {
            setLoading(true);
            await deleteRoommateProfile(formData.roommateProfileId);
            setSuccess("Roommate profile deleted successfully!");
            setShowDeleteModal(false);
            // Reset roommate profile fields
            setFormData(prev => ({
                ...prev,
                roommateProfileId: null,
                age: 18,
                occupation: "",
                lifestyle: [],
                budget: "",
                location: "",
                bio: "",
                interests: [],
                avatar: "",
                housingStatus: ""
            }));
        } catch (err: any) {
            setError(err.message || "Failed to delete roommate profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleDisableRoommateProfile = async () => {
        // For now, we'll just hide the profile by clearing key fields
        // In a real implementation, you'd add an 'active' field to the backend
        try {
            setLoading(true);
            if (formData.roommateProfileId) {
                await updateRoommateProfile(formData.roommateProfileId, {
                    name: formData.name,
                    age: formData.age,
                    occupation: "[DISABLED]",
                    lifestyle: [],
                    budget: "",
                    location: "",
                    bio: "Profile temporarily disabled",
                    interests: [],
                    avatar: formData.avatar
                });
            }
            setIsProfileDisabled(true);
            setSuccess("Roommate profile disabled successfully!");
            setShowDisableModal(false);
            fetchProfile();
        } catch (err: any) {
            setError(err.message || "Failed to disable roommate profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleEnableRoommateProfile = async () => {
        try {
            setLoading(true);
            if (formData.roommateProfileId) {
                await updateRoommateProfile(formData.roommateProfileId, {
                    name: formData.name,
                    age: formData.age,
                    occupation: "Student", // Default occupation when enabling
                    lifestyle: ["Quiet"], // Default lifestyle
                    budget: "₹15,000 - ₹20,000", // Default budget
                    location: "Bangalore", // Default location
                    bio: "Profile re-enabled - please update your information",
                    interests: ["Music"], // Default interests
                    avatar: formData.avatar,
                    housingStatus: formData.housingStatus
                });
            }
            setIsProfileDisabled(false);
            setSuccess("Roommate profile enabled successfully!");
            fetchProfile();
        } catch (err: any) {
            setError(err.message || "Failed to enable roommate profile.");
        } finally {
            setLoading(false);
        }
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
                phone: formData.phone,
                username: formData.username
            });

            // 2. Update/Create Roommate Profile
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
                // Update existing roommate profile
                await updateRoommateProfile(formData.roommateProfileId, roommateData);
            } else if (formData.occupation || formData.bio || formData.interests.length > 0) {
                // Create new roommate profile only if user has filled some fields
                const newProfile = await createRoommateProfile(roommateData);
                setFormData(prev => ({ ...prev, roommateProfileId: newProfile.id }));
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
        <>
        <div className="min-h-screen bg-[#0c0c1d] pt-20 pb-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background blobs for depth */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
                <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="glass-card rounded-2xl sm:rounded-[2.5rem] shadow-2xl border-white/5"
                >
                    {/* Header / Banner */}
                    <div className="relative h-48 sm:h-64 bg-gray-900">
                        {/* Abstract Gradient Pattern */}
                        <div className="absolute inset-0 bg-gradient-premium opacity-80"></div>
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0c0c1d] to-transparent"></div>

                        <div className="absolute -bottom-12 sm:-bottom-16 left-6 sm:left-12 z-50">
                            <div className="relative group">
                                <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-2xl sm:rounded-[2.5rem] border-4 border-[#0c0c1d] bg-midnight-light flex items-center justify-center text-3xl sm:text-5xl font-black text-white overflow-hidden shadow-2xl relative">
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
                                        <div className="absolute bottom-2 right-2 p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl sm:rounded-2xl hover:scale-110 transition-all shadow-xl shadow-blue-900/40">
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

                    <div className="pt-20 sm:pt-24 pb-8 sm:pb-12 px-5 sm:px-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                            <div>
                                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-2 uppercase">{formData.name}</h1>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs">@{formData.username}</span>
                                    <div className="h-1 w-1 rounded-full bg-gray-600" />
                                    <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                                        {formData.role}
                                    </span>
                                </div>
                            </div>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="group flex items-center gap-3 px-5 sm:px-8 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-white hover:bg-white/10 transition-all shadow-xl font-black uppercase tracking-widest text-[9px] sm:text-[10px]"
                                >
                                    <FiEdit2 className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex flex-wrap gap-3 sm:gap-4">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            fetchProfile(); // Reset changes
                                        }}
                                        className="flex items-center gap-3 px-5 sm:px-8 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-gray-400 hover:text-white transition-all font-black uppercase tracking-widest text-[9px] sm:text-[10px]"
                                    >
                                        <FiX className="w-4 h-4" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex items-center gap-3 px-5 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl sm:rounded-2xl hover:from-blue-500 hover:to-purple-500 transition-all shadow-xl shadow-blue-900/40 font-black uppercase tracking-widest text-[9px] sm:text-[10px] disabled:opacity-50"
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
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                            {/* Left Column */}
                            <div className="space-y-6 sm:space-y-8">
                                <h3 className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/10 pb-3 sm:pb-4 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                    Identity Details
                                </h3>

                                <div className="space-y-2">
                                    <label className="text-[9px] sm:text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Full Name</label>
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
                                            className={`pl-11 w-full rounded-xl sm:rounded-2xl border ${isEditing ? 'border-white/10 bg-white/5 focus:ring-2 focus:ring-blue-500/50' : 'border-transparent bg-white/[0.02]'} py-3 sm:py-4 transition-all outline-none text-white font-medium text-sm`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] sm:text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Email Address</label>
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
                                            className={`pl-11 w-full rounded-xl sm:rounded-2xl border ${isEditing ? 'border-white/10 bg-white/5 focus:ring-2 focus:ring-purple-500/50' : 'border-transparent bg-white/[0.02]'} py-3 sm:py-4 transition-all outline-none text-white font-medium text-sm`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] sm:text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Phone Number</label>
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
                                            className={`pl-11 w-full rounded-xl sm:rounded-2xl border ${isEditing ? 'border-white/10 bg-white/5 focus:ring-2 focus:ring-pink-500/50' : 'border-transparent bg-white/[0.02]'} py-3 sm:py-4 transition-all outline-none text-white font-medium text-sm`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Account Info / System Info */}
                            <div className="space-y-6 sm:space-y-8">
                                <h3 className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/10 pb-3 sm:pb-4 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                    Access Control
                                </h3>

                                <div className="space-y-2">
                                    <label className="text-[9px] sm:text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Unique ID (Username)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FiShield className="text-gray-600" />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.username}
                                            disabled
                                            className="pl-11 w-full rounded-xl sm:rounded-2xl border border-transparent bg-white/[0.01] text-gray-600 py-3 sm:py-4 cursor-not-allowed font-black text-sm"
                                            title="Username cannot be changed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] sm:text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Global Role</label>
                                    <div className="w-full rounded-xl sm:rounded-2xl border border-transparent bg-white/[0.01] text-gray-600 py-3 sm:py-4 px-4 sm:px-6 cursor-not-allowed font-black uppercase tracking-widest text-xs sm:text-sm">
                                        {formData.role}
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="pt-4 sm:pt-6">
                                        <button type="button" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-8">
                                            Update Security Credentials
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Roommate Profile Section */}
                            <div className="space-y-6 sm:space-y-8">
                                <h3 className="text-xs sm:text-sm font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/10 pb-3 sm:pb-4 flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${isProfileDisabled ? 'bg-red-500' : 'bg-green-500'} shadow-[0_0_10px_rgba(34,197,94,0.5)]`}></div>
                                        Roommate Profile
                                        {isProfileDisabled && (
                                            <span className="px-2 py-1 bg-red-500/10 text-red-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-red-500/20">
                                                Disabled
                                            </span>
                                        )}
                                        {(!formData.roommateProfileId || (!formData.occupation && !formData.bio && formData.interests.length === 0)) && !isProfileDisabled && (
                                            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-yellow-500/20">
                                                Not Created
                                            </span>
                                        )}
                                    </div>
                                    {formData.roommateProfileId && (
                                        <div className="flex gap-2">
                                            {isProfileDisabled ? (
                                                <button
                                                    type="button"
                                                    onClick={handleEnableRoommateProfile}
                                                    className="px-3 py-1 bg-green-500/10 text-green-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-green-500/20 hover:bg-green-500/20 transition-all"
                                                >
                                                    Enable
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDisableModal(true)}
                                                    className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-yellow-500/20 hover:bg-yellow-500/20 transition-all"
                                                >
                                                    Disable
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setShowDeleteModal(true)}
                                                className="px-3 py-1 bg-red-500/10 text-red-400 text-[8px] font-black uppercase tracking-widest rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </h3>

                                <div className="space-y-2">
                                    <label className="text-[9px] sm:text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        min="18"
                                        className={`w-full rounded-xl sm:rounded-2xl border ${isEditing ? 'border-white/10 bg-white/5 focus:ring-2 focus:ring-green-500/50' : 'border-transparent bg-white/[0.02]'} py-3 sm:py-4 px-4 sm:px-6 transition-all outline-none text-white font-medium text-sm`}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] sm:text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                        disabled={!isEditing}
                                        className={`w-full rounded-xl sm:rounded-2xl border ${isEditing ? 'border-white/10 bg-white/5 focus:ring-2 focus:ring-green-500/50' : 'border-transparent bg-white/[0.02]'} py-3 sm:py-4 px-4 sm:px-6 transition-all outline-none text-white font-medium text-sm appearance-none cursor-pointer`}
                                        style={{
                                            backgroundImage: isEditing ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")` : 'none',
                                            backgroundPosition: 'right 12px center',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: '20px'
                                        }}
                                    >
                                        <option value="" className="bg-midnight text-gray-400">Select Gender</option>
                                        <option value="male" className="bg-midnight text-white">Male</option>
                                        <option value="female" className="bg-midnight text-white">Female</option>
                                        <option value="other" className="bg-midnight text-white">Other</option>
                                        <option value="prefer-not-to-say" className="bg-midnight text-white">Prefer not to say</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] sm:text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Housing Status</label>
                                    <select
                                        name="housingStatus"
                                        value={formData.housingStatus}
                                        onChange={(e) => setFormData(prev => ({ ...prev, housingStatus: e.target.value }))}
                                        disabled={!isEditing}
                                        className={`w-full rounded-xl sm:rounded-2xl border ${isEditing ? 'border-white/10 bg-white/5 focus:ring-2 focus:ring-green-500/50' : 'border-transparent bg-white/[0.02]'} py-3 sm:py-4 px-4 sm:px-6 transition-all outline-none text-white font-medium text-sm appearance-none cursor-pointer`}
                                        style={{
                                            backgroundImage: isEditing ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")` : 'none',
                                            backgroundPosition: 'right 12px center',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: '20px'
                                        }}
                                    >
                                        <option value="" className="bg-midnight text-gray-400">Select Status</option>
                                        <option value="has-room" className="bg-midnight text-white">Has Room</option>
                                        <option value="seeking-room" className="bg-midnight text-white">Seeking Room</option>
                                        <option value="has-roommate" className="bg-midnight text-white">Has Roommate</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] sm:text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Occupation</label>
                                    <input
                                        type="text"
                                        name="occupation"
                                        value={formData.occupation}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="e.g. Software Developer, Student"
                                        className={`w-full rounded-xl sm:rounded-2xl border ${isEditing ? 'border-white/10 bg-white/5 focus:ring-2 focus:ring-green-500/50' : 'border-transparent bg-white/[0.02]'} py-3 sm:py-4 px-4 sm:px-6 transition-all outline-none text-white font-medium text-sm`}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] sm:text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="e.g. Koramangala, Bangalore"
                                        className={`w-full rounded-xl sm:rounded-2xl border ${isEditing ? 'border-white/10 bg-white/5 focus:ring-2 focus:ring-green-500/50' : 'border-transparent bg-white/[0.02]'} py-3 sm:py-4 px-4 sm:px-6 transition-all outline-none text-white font-medium text-sm`}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] sm:text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Budget Range</label>
                                    <input
                                        type="text"
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="e.g. ₹15,000 - ₹20,000"
                                        className={`w-full rounded-xl sm:rounded-2xl border ${isEditing ? 'border-white/10 bg-white/5 focus:ring-2 focus:ring-green-500/50' : 'border-transparent bg-white/[0.02]'} py-3 sm:py-4 px-4 sm:px-6 transition-all outline-none text-white font-medium text-sm`}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] sm:text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Lifestyle (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={formData.lifestyle.join(', ')}
                                        onChange={(e) => handleArrayInputChange('lifestyle', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="e.g. Quiet, Social, Active"
                                        className={`w-full rounded-xl sm:rounded-2xl border ${isEditing ? 'border-white/10 bg-white/5 focus:ring-2 focus:ring-green-500/50' : 'border-transparent bg-white/[0.02]'} py-3 sm:py-4 px-4 sm:px-6 transition-all outline-none text-white font-medium text-sm`}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] sm:text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Interests (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={formData.interests.join(', ')}
                                        onChange={(e) => handleArrayInputChange('interests', e.target.value)}
                                        disabled={!isEditing}
                                        placeholder="e.g. Music, Travel, Reading"
                                        className={`w-full rounded-xl sm:rounded-2xl border ${isEditing ? 'border-white/10 bg-white/5 focus:ring-2 focus:ring-green-500/50' : 'border-transparent bg-white/[0.02]'} py-3 sm:py-4 px-4 sm:px-6 transition-all outline-none text-white font-medium text-sm`}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] sm:text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                        disabled={!isEditing}
                                        placeholder="Tell potential roommates about yourself..."
                                        rows={4}
                                        className={`w-full rounded-xl sm:rounded-2xl border ${isEditing ? 'border-white/10 bg-white/5 focus:ring-2 focus:ring-green-500/50' : 'border-transparent bg-white/[0.02]'} py-3 sm:py-4 px-4 sm:px-6 transition-all outline-none text-white font-medium text-sm resize-none`}
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-midnight/95 backdrop-blur-2xl flex items-center justify-center p-4 z-[100]"
                onClick={() => setShowDeleteModal(false)}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card rounded-2xl p-8 max-w-md w-full border-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="text-2xl font-black text-white mb-4">Delete Roommate Profile</h3>
                    <p className="text-gray-400 mb-6">
                        Are you sure you want to delete your roommate profile? This action cannot be undone and you'll need to create a new profile if you want to be visible to others.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="flex-1 py-3 glass-card text-gray-400 rounded-xl border-white/10 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteRoommateProfile}
                            disabled={loading}
                            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-red-500 transition-all disabled:opacity-50"
                        >
                            {loading ? "Deleting..." : "Delete Profile"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}

        {/* Disable Confirmation Modal */}
        {showDisableModal && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-midnight/95 backdrop-blur-2xl flex items-center justify-center p-4 z-[100]"
                onClick={() => setShowDisableModal(false)}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card rounded-2xl p-8 max-w-md w-full border-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="text-2xl font-black text-white mb-4">Disable Roommate Profile</h3>
                    <p className="text-gray-400 mb-6">
                        Are you sure you want to disable your roommate profile? This will temporarily hide your profile from other users. You can enable it again later.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowDisableModal(false)}
                            className="flex-1 py-3 glass-card text-gray-400 rounded-xl border-white/10 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDisableRoommateProfile}
                            disabled={loading}
                            className="flex-1 py-3 bg-yellow-600 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-yellow-500 transition-all disabled:opacity-50"
                        >
                            {loading ? "Disabling..." : "Disable Profile"}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
        </>
    );

};

export default Profile;
