import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoommateProfile } from "../api";
import { useAuth } from "../contexts/AuthContext";

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
    bio: "",
    interests: "",
    avatar: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      bio: formData.bio,
      interests: formData.interests
        .split(",")
        .map(s => s.trim())
        .filter(Boolean),
      avatar:
        formData.avatar ||
        "https://images.unsplash.com/photo-1511367469-f85a21fda167?w=150&h=150&fit=crop&crop=face"
    };

    console.log("Submitting payload:", payload);

    try {
      await createRoommateProfile(payload);
      alert("Profile created successfully!");
      navigate("/find-roommate");
    } catch (err: any) {
      setError(err.message || "Failed to create profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-xl w-full border border-gray-100">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-8">
          Create Your Roommate Profile
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-lg text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <label className="block">
            <span className="text-gray-700 font-semibold">Full Name</span>
            <input
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-semibold">Age</span>
            <input
              name="age"
              type="number"
              min={18}
              max={100}
              value={formData.age}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500"
              placeholder="Your age"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-semibold">Occupation</span>
            <input
              name="occupation"
              type="text"
              value={formData.occupation}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500"
              placeholder="Your occupation"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-semibold">Lifestyle (comma separated)</span>
            <input
              name="lifestyle"
              type="text"
              value={formData.lifestyle}
              onChange={handleChange}
              placeholder="e.g. Quiet, Clean, Studious"
              className="mt-1 block w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-semibold">Budget</span>
            <input
              name="budget"
              type="text"
              value={formData.budget}
              onChange={handleChange}
              placeholder="Your budget range"
              className="mt-1 block w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-semibold">Location</span>
            <input
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              placeholder="Preferred location"
              className="mt-1 block w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-semibold">Bio</span>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              className="mt-1 block w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500"
              rows={4}
            ></textarea>
          </label>

          <label className="block">
            <span className="text-gray-700 font-semibold">Interests (comma separated)</span>
            <input
              name="interests"
              type="text"
              value={formData.interests}
              onChange={handleChange}
              placeholder="e.g. Reading, Yoga, Cooking"
              className="mt-1 block w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="block">
            <span className="text-gray-700 font-semibold">Avatar URL</span>
            <input
              name="avatar"
              type="url"
              value={formData.avatar ||  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"}
              onChange={handleChange}
              placeholder="Link to your profile picture"
              className="mt-1 block w-full rounded-lg border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-6 py-3 rounded-lg font-semibold text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            } transition-colors duration-300`}
          >
            {loading ? "Creating Profile..." : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProfile;
