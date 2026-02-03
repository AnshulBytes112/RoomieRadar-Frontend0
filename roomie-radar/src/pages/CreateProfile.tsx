import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createRoommateProfile } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { User, Briefcase, Smile, Heart, Target, Sparkles, Zap, Shield, ChevronRight } from 'lucide-react';
import { PixelGrid } from "../components/ui";

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

  const inputClasses = "w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-trae-green/50 transition-all outline-none text-white placeholder-gray-700 font-bold text-[13px] tracking-widest";
  const labelClasses = "flex items-center gap-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-600 mb-2.5 ml-1";

  const sections = [
    {
      title: "Basic Information",
      icon: <User className="w-3.5 h-3.5 text-trae-green" />,
      fields: [
        { name: "name", label: "Full Name", type: "text", placeholder: "Enter your name...", required: true },
        { name: "age", label: "Your Age", type: "number", placeholder: "18", required: true, min: 18 },
        { name: "occupation", label: "What do you do? (Occupation)", type: "text", placeholder: "e.g. Software Engineer" }
      ]
    },
    {
      title: "Room Preferences",
      icon: <Target className="w-3.5 h-3.5 text-blue-400" />,
      fields: [
        { name: "location", label: "Preferred Location", type: "text", placeholder: "e.g. Koramangala, Bangalore" },
        { name: "budget", label: "Monthly Budget (₹)", type: "text", placeholder: "e.g. 15,000" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] pt-16 sm:pt-28 pb-20 px-6 relative overflow-hidden font-sans text-white">
      <PixelGrid />

      <div className="max-w-[900px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="text-trae-green font-mono text-[10px] mb-3 uppercase tracking-[0.2em] font-bold">Profile Setup</div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-tight">
            Create <span className="text-trae-green">Your Profile.</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-trae-green/5 border border-trae-green/20 rounded-lg">
              <Shield className="w-3 h-3 text-trae-green/80" />
              <span className="text-[8px] font-black text-trae-green uppercase tracking-widest">Profile: Verified</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <Zap className="w-3 h-3 text-blue-400/80" />
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Connection: Secure</span>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 bg-red-500/5 border border-red-500/20 text-red-500 rounded-2xl text-center font-black uppercase tracking-widest text-[9px]"
            >
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((section, idx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem] shadow-xl space-y-6"
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {section.icon}
                  </div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">{section.title}</h3>
                </div>

                {section.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
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

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-xl space-y-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className={labelClasses}>What is your current status?</label>
                <div className="relative">
                  <select
                    name="housingStatus"
                    value={formData.housingStatus}
                    onChange={handleChange}
                    className={`${inputClasses} appearance-none cursor-pointer`}
                  >
                    <option value="" className="bg-[#0a0a0a]">Select your status...</option>
                    <option value="has-room" className="bg-[#0a0a0a]">I have a room</option>
                    <option value="seeking-room" className="bg-[#0a0a0a]">I am looking for a room</option>
                    <option value="has-roommate" className="bg-[#0a0a0a]">I am looking for a roommate</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Profile Photo Link (Avatar URL)</label>
                <input
                  name="avatar"
                  type="url"
                  value={formData.avatar}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className={labelClasses}>
                  <Smile className="w-3 h-3 text-trae-green" /> Lifestyle & Habits
                </label>
                <input
                  name="lifestyle"
                  type="text"
                  value={formData.lifestyle}
                  onChange={handleChange}
                  placeholder="Quiet, Social, Organized..."
                  className={inputClasses}
                />
                <p className="text-[7px] font-bold text-gray-700 mt-1.5 ml-1 uppercase tracking-[0.2em]">Separate with commas</p>
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>
                  <Heart className="w-3 h-3 text-pink-500" /> Interests & Hobbies
                </label>
                <input
                  name="interests"
                  type="text"
                  value={formData.interests}
                  onChange={handleChange}
                  placeholder="Gaming, Tech, Travel..."
                  className={inputClasses}
                />
                <p className="text-[7px] font-bold text-gray-700 mt-1.5 ml-1 uppercase tracking-[0.2em]">Separate with commas</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClasses}>
                <Briefcase className="w-3 h-3 text-trae-green" /> About You (Bio)
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell others about yourself..."
                className={`${inputClasses} min-h-[140px] resize-none pt-6`}
              ></textarea>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-black transition-all transform hover:scale-[1.01] active:scale-[0.98] shadow-xl flex items-center justify-center gap-4 ${loading
                  ? "bg-gray-800 cursor-not-allowed opacity-50"
                  : "bg-trae-green shadow-trae-green/10 hover:bg-emerald-400"
                  }`}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Profile...</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Complete Profile
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateProfile;
