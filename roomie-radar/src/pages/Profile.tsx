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
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    {/* Header / Banner */}
                    <div className="relative h-48 bg-gray-900 overflow-hidden">
                        {/* Abstract Gradient Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 opacity-90"></div>
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/50 to-transparent"></div>

                        <div className="absolute -bottom-16 left-8">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400 overflow-hidden shadow-2xl relative">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="uppercase text-gray-400">{formData.name?.charAt(0) || "U"}</span>
                                    )}

                                    {/* Overlay for upload hint */}
                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <FiCamera className="text-white w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full z-10"
                                            title="Change Profile Picture"
                                        />
                                        <div className="absolute bottom-0 right-0 p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-all shadow-lg transform translate-x-1/4 translate-y-1/4">
                                            {uploading ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <FiCamera className="w-4 h-4" />
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 pb-8 px-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{formData.name}</h1>
                                <p className="text-gray-500 flex items-center gap-2 mt-1">
                                    @{formData.username}
                                    <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold capitalize border border-sky-200">
                                        {formData.role}
                                    </span>
                                </p>
                            </div>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm font-medium"
                                >
                                    <FiEdit2 className="w-4 h-4" />
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            fetchProfile(); // Reset changes
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm font-medium"
                                    >
                                        <FiX className="w-4 h-4" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors shadow-sm font-medium disabled:opacity-70"
                                    >
                                        <FiSave className="w-4 h-4" />
                                        {loading ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                                {success}
                            </div>
                        )}

                        {/* Profile Details Form */}
                        <form className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiUser className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`pl-10 w-full rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent' : 'border-transparent bg-gray-50'} py-2.5 transition-all outline-none`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiMail className="text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`pl-10 w-full rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent' : 'border-transparent bg-gray-50'} py-2.5 transition-all outline-none`}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiPhone className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`pl-10 w-full rounded-lg border ${isEditing ? 'border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-transparent' : 'border-transparent bg-gray-50'} py-2.5 transition-all outline-none`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Account Info / System Info */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Account Details</h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiShield className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.username}
                                            disabled
                                            className="pl-10 w-full rounded-lg border border-transparent bg-gray-100 text-gray-500 py-2.5 cursor-not-allowed"
                                            title="Username cannot be changed"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Role</label>
                                    <input
                                        type="text"
                                        value={formData.role.toUpperCase()}
                                        disabled
                                        className="w-full rounded-lg border border-transparent bg-gray-100 text-gray-500 py-2.5 px-4 cursor-not-allowed"
                                    />
                                </div>

                                {/* Future: Password Reset Section */}
                                {isEditing && (
                                    <div className="pt-4">
                                        <button type="button" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
                                            Change Password?
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
