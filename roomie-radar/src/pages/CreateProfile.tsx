import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createRoommateProfile } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { User, Briefcase, MapPin, Smile, Heart, Target, Image as ImageIcon } from 'lucide-react';

const CreateProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    age: 18,
    occupation: "",
    lifestyle: "",
    budget: "",
    location: "",
    housingStatus: "",
    bio: "",
    interests: "",
    avatar: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "age" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: formData.name,
      age: formData.age,
      occupation: formData.occupation,
      lifestyle: formData.lifestyle
        .split(",")
        .map(s => s.trim())
        .filter(Boolean),
      budget: formData.budget,
      location: formData.location,
      housingStatus: formData.housingStatus,
      bio: formData.bio,
      interests: formData.interests
        .split(",")
        .map(s => s.trim())
        .filter(Boolean),
      avatar:
        formData.avatar ||
        "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&h=150&fit=crop&crop=face"
    };

    try {
      await createRoommateProfile(payload);
      navigate("/find-roommate");
    } catch (err: any) {
      setError(err.message || "Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-6 py-4 glass-card bg-white/[0.03] border-white/5 rounded-2xl focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-white placeholder-gray-600 font-bold text-sm tracking-wide";
  const labelClasses = "flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3 ml-1";

  const sections = [
    {
      title: "Archetype",
      icon: <User className="w-4 h-4" />,
      fields: [
        { name: "name", label: "Identity", type: "text", placeholder: "SYSTEM_NAME", required: true },
        { name: "age", label: "Cycle Count", type: "number", placeholder: "18", required: true, min: 18 },
        { name: "occupation", label: "Function", type: "text", placeholder: "Professional Role" }
      ]
    },
    {
      title: "Logistics",
      icon: <Target className="w-4 h-4" />,
      fields: [
        { name: "location", label: "Sector", type: "text", placeholder: "Core Location" },
        { name: "budget", label: "Resource Allocation", type: "text", placeholder: "Budget Range" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0c0c1d] pt-32 pb-24 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen animate-blob" />
        <div className="absolute top-[40%] -right-[10%] w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[150px] mix-blend-screen animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase mb-6">
            Initialize <span className="text-gradient">Profile.</span>
          </h1>
          <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">Configure your synchronization parameters</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 glass-card border-red-500/20 bg-red-500/5 text-red-400 rounded-[2rem] text-center font-black uppercase tracking-widest text-[10px]"
            >
              {error}
            </motion.div>
          )}

          {/* Grid Layout for sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {sections.map((section, idx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-wider">{section.title}</h3>
                </div>

                {section.fields.map((field) => (
                  <div key={field.name}>
                    <label className={labelClasses}>{field.label}</label>
                    <input
                      name={field.name}
                      type={field.type}
                      value={(formData as any)[field.name]}
                      onChange={handleChange}
                      required={field.required}
                      placeholder={field.placeholder}
                      className={inputClasses}
                    />
                  </div>
                ))}
              </motion.div>
            ))}
          </div>

          {/* Full Width Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <label className={labelClasses}>Housing Status</label>
                <select
                  name="housingStatus"
                  value={formData.housingStatus}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  <option value="" className="bg-midnight text-gray-400">Select Status</option>
                  <option value="has-room" className="bg-midnight text-white">Has Room</option>
                  <option value="seeking-room" className="bg-midnight text-white">Seeking Room</option>
                  <option value="has-roommate" className="bg-midnight text-white">Has Roommate</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <label className={labelClasses}>
                  <Smile className="w-3 h-3 text-blue-400" /> Behavior Traits
                </label>
                <input
                  name="lifestyle"
                  type="text"
                  value={formData.lifestyle}
                  onChange={handleChange}
                  placeholder="QUIET, CLEAN, SOCIAL..."
                  className={inputClasses}
                />
                <p className="text-[8px] font-bold text-gray-600 mt-2 ml-1 uppercase tracking-widest">Comma separated values</p>
              </div>
              <div>
                <label className={labelClasses}>
                  <Heart className="w-3 h-3 text-purple-400" /> Interests
                </label>
                <input
                  name="interests"
                  type="text"
                  value={formData.interests}
                  onChange={handleChange}
                  placeholder="CODING, YOGA, GAMING..."
                  className={inputClasses}
                />
                <p className="text-[8px] font-bold text-gray-600 mt-2 ml-1 uppercase tracking-widest">Comma separated values</p>
              </div>
            </div>

            <div>
              <label className={labelClasses}>
                <Briefcase className="w-3 h-3 text-pink-400" /> Manifesto
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="INPUT DATA PAYLOAD..."
                className={`${inputClasses} min-h-[160px] resize-none pt-6`}
              ></textarea>
            </div>

            <div className="pb-8 border-b border-white/5">
              <label className={labelClasses}>
                <ImageIcon className="w-3 h-3 text-green-400" /> Visual Identity
              </label>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 rounded-[2.5rem] glass-card border-white/10 overflow-hidden flex-shrink-0 group relative">
                  <img
                    src={formData.avatar || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=300&h=300&fit=crop&crop=face"}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <div className="flex-1 w-full">
                  <input
                    name="avatar"
                    type="url"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="HTTPS://SOURCE.IMAGE/URL"
                    className={inputClasses}
                  />
                  <p className="text-[8px] font-bold text-gray-600 mt-3 ml-1 uppercase tracking-widest">Leave empty for system default appearance</p>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.25em] text-sm text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl ${loading
                    ? "bg-gray-800 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-purple-900/40"
                  }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : "Create Identity"}
              </button>
            </div>
          </motion.div>
        </form>
      </div>

      <style>{`
        ::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
      `}</style>
    </div>
  );
};

export default CreateProfile;
