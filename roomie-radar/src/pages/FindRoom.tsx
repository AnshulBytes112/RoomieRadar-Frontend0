// src/pages/FindRoom.tsx
import { useState, useEffect } from "react";
import AddListingModal from "../components/AddListingModal.tsx";
import type { NewListingInput } from "../components/AddListingModal.tsx";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, DollarSign, Home, Heart, Eye, Users, BedDouble, Bath, Maximize } from "lucide-react";
import { getAllRooms, searchRooms, addToFavorites, createRoomListing } from "../api";

// Updated interface to match backend Room entity exactly
interface Room {
  id: number;
  title: string;
  location: string;
  price: number; // Changed from string to number to match backend int
  area: string;
  bedrooms: number;
  bathrooms: number;
  type: "Private" | "Shared" | "Studio" | "Hostel"
  images: string[];
  tags: string[];
  description?: string;
  amenities?: string[];
  availaibleFrom?: string; // Note: Backend has typo "availaibleFrom"
  deposit?: string;
  maintenance?: string;
  parking?: boolean;
  petFriendly?: boolean;
  furnished?: boolean;
  contactNumber?: string;
  contactEmail?: string;

  postedBy?: {
    id: number;
    name: string;
    email: string;
  };
}

const FindRoom = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState({
    location: "",
    budget: "",
    roomType: "",
    bedrooms: "",
    bathrooms: "",
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching all rooms from API...");
        const fetchedRooms = await getAllRooms();
        console.log("Fetched rooms:", fetchedRooms);
        setRooms(fetchedRooms);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError("Failed to load rooms. Please check your connection and try again.");
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleSearch = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const filters = {
        location: searchFilters.location || undefined,
        budget: searchFilters.budget || undefined,
        roomType: searchFilters.roomType || undefined,
        bedrooms: searchFilters.bedrooms ? parseInt(searchFilters.bedrooms) : undefined,
        bathrooms: searchFilters.bathrooms ? parseInt(searchFilters.bathrooms) : undefined,
      };

      console.log("Searching with filters:", filters);
      const results = await searchRooms(filters);
      console.log("Search results:", results);
      setRooms(results);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Search failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (roomId: number) => {
    if (!user) {
      navigate("/login");
    } else {
      navigate(`/room/${roomId}`);
    }
  };

  const handleAddToFavorites = async (roomId: number) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      console.log(`Adding room ${roomId} to favorites`);
      const result = await addToFavorites(roomId);
      console.log("Added to favorites:", result);
      // Optional: Add a toast notification here
    } catch (err) {
      console.error("Failed to add to favorites:", err);
      setError("Failed to add to favorites. Please try again.");
    }
  };

  const handleClearFilters = () => {
    setSearchFilters({
      location: "",
      budget: "",
      roomType: "",
      bedrooms: "",
      bathrooms: "",
    });
    const fetchAllRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedRooms = await getAllRooms();
        setRooms(fetchedRooms);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError("Failed to load rooms. Please check your connection and try again.");
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllRooms();
  };

  // Fixed handleAddRoom function to match backend entity
  const handleAddRoom = async (listing: NewListingInput) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      console.log("Creating new room with data:", listing);

      // Convert NewListingInput to match backend Room entity exactly
      const roomPayload = {
        title: listing.title,
        location: listing.location,
        price: Number(listing.price), // Convert to number for backend int
        area: listing.area ?? "",
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        images: listing.images,
        tags: listing.tags,
        type: listing.type,
        // Optional fields - only include if they exist
        ...(listing.description && { description: listing.description }),
        ...(listing.amenities && { amenities: listing.amenities }),
        // Map availableFrom to backend typo availaibleFrom
        ...(listing.availableFrom && { availaibleFrom: listing.availableFrom }),
        ...(listing.deposit && { deposit: listing.deposit }),
        ...(listing.maintenance && { maintenance: listing.maintenance }),
        ...(listing.parking !== undefined && { parking: listing.parking }),
        ...(listing.petFriendly !== undefined && { petFriendly: listing.petFriendly }),
        ...(listing.furnished !== undefined && { furnished: listing.furnished }),
        ...(listing.contactNumber && { contactNumber: listing.contactNumber }),
        ...(listing.contactEmail && { contactEmail: listing.contactEmail }),
      };

      console.log("Sending room payload to API:", roomPayload);
      const newRoom = await createRoomListing(roomPayload);
      console.log("Room created successfully:", newRoom);

      // Add new room to the top of the list
      setRooms((prevRooms) => [newRoom, ...prevRooms]);
      setShowAddModal(false);
    } catch (err: any) {
      console.error("Failed to create room:", err);

      // Better error handling
      let errorMessage = "Failed to create room. Please try again.";
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0c1d] pt-24 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12"
        >
          <div>
            <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
              Elite <span className="text-gradient">Spaces</span>
            </h1>
            <p className="text-xl text-gray-400 font-light">Discover hand-picked premium listings in your favorite neighborhoods.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white font-bold transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center gap-3"
          >
            <Home className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            List Your Room
          </button>
        </motion.div>

        <AddListingModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddRoom}
        />

        {/* Search & Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-10 rounded-[2.5rem] mb-16 shadow-2xl border-white/5 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 opacity-50" />

          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 glass-card rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Refine Your Search</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-400 ml-1 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" /> Location
              </label>
              <input
                type="text"
                placeholder="Where to?"
                value={searchFilters.location}
                onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                className="w-full px-5 py-4 glass-card rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all bg-white/5 text-white placeholder-gray-500 border-white/5"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-400 ml-1 uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-purple-500" /> Monthly Budget
              </label>
              <select
                value={searchFilters.budget}
                onChange={(e) => setSearchFilters({ ...searchFilters, budget: e.target.value })}
                className="w-full px-5 py-4 glass-card rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all bg-[#1a1a3a] text-white border-white/5 appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#0c0c1d]">Any budget</option>
                <option value="5000-10000" className="bg-[#0c0c1d]">₹5,000 - ₹10,000</option>
                <option value="10000-15000" className="bg-[#0c0c1d]">₹10,000 - ₹15,000</option>
                <option value="15000-25000" className="bg-[#0c0c1d]">₹15,000 - ₹25,000</option>
                <option value="25000+" className="bg-[#0c0c1d]">₹25,000+</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-400 ml-1 uppercase tracking-widest flex items-center gap-2">
                <Home className="w-4 h-4 text-pink-500" /> Room Type
              </label>
              <select
                value={searchFilters.roomType}
                onChange={(e) => setSearchFilters({ ...searchFilters, roomType: e.target.value })}
                className="w-full px-5 py-4 glass-card rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all bg-[#1a1a3a] text-white border-white/5 appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#0c0c1d]">Any type</option>
                <option value="Private" className="bg-[#0c0c1d]">Private Room</option>
                <option value="Shared" className="bg-[#0c0c1d]">Shared Room</option>
                <option value="Studio" className="bg-[#0c0c1d]">Studio Apartment</option>
                <option value="Hostel" className="bg-[#0c0c1d]">Hostel/PG</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-400 ml-1 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-500" /> Bedrooms
              </label>
              <select
                value={searchFilters.bedrooms}
                onChange={(e) => setSearchFilters({ ...searchFilters, bedrooms: e.target.value })}
                className="w-full px-5 py-4 glass-card rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all bg-[#1a1a3a] text-white border-white/5 appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#0c0c1d]">Any</option>
                <option value="1" className="bg-[#0c0c1d]">1 Bed</option>
                <option value="2" className="bg-[#0c0c1d]">2 Beds</option>
                <option value="3" className="bg-[#0c0c1d]">3 Beds</option>
                <option value="4+" className="bg-[#0c0c1d]">4+ Beds</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-xl shadow-blue-900/30 flex-1 md:flex-none"
            >
              {loading ? "Searching..." : "Apply Filters"}
            </button>
            <button
              onClick={handleClearFilters}
              disabled={loading}
              className="px-10 py-4 glass-card rounded-2xl text-gray-300 font-bold transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50 flex-1 md:flex-none"
            >
              Reset
            </button>
          </div>
        </motion.div>

        {loading && (
          <div className="text-center py-32">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-8 shadow-2xl shadow-blue-500/20"></div>
            <p className="text-2xl text-gray-400 font-light animate-pulse">Curating your results...</p>
          </div>
        )}

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="glass-card border-red-500/20 px-10 py-12 rounded-[2.5rem] max-w-xl mx-auto shadow-2xl">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-ping" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Something went wrong</h3>
              <p className="text-gray-400 mb-10 font-light">{error}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-4 bg-red-600/20 border border-red-500/30 text-red-100 rounded-2xl hover:bg-red-600/30 transition-all font-bold"
                >
                  Refresh
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-8 py-4 glass-card text-gray-300 rounded-2xl hover:bg-white/10 transition-all font-bold"
                >
                  Retry
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {!loading && !error && (
          <div className="pb-24">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-between items-center mb-10"
            >
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  <span className="text-gradient">{rooms.length}</span> Spaces Available
                </h2>
                <p className="text-gray-500 font-medium">Results based on your elite preferences</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {rooms.map((room, i) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-[2rem] overflow-hidden group hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2 shadow-2xl relative"
                >
                  {/* Image Section */}
                  <div className="relative h-72 bg-white/5 overflow-hidden">
                    <img
                      src={room.images[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"}
                      alt={room.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0c0c1d] to-transparent" />

                    <div className="absolute top-6 left-6">
                      <span className="px-4 py-2 glass-card rounded-full text-xs font-black uppercase tracking-widest text-white border-white/20 shadow-xl">
                        {room.type}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToFavorites(room.id)}
                      className="absolute top-6 right-6 p-3 glass-card rounded-full hover:bg-white transition-all group/fav active:scale-90"
                    >
                      <Heart className="w-5 h-5 text-white group-hover/fav:text-red-500 transition-colors" />
                    </button>
                  </div>

                  {/* Content Section */}
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-black text-white leading-tight mb-2 truncate group-hover:text-blue-400 transition-colors">
                          {room.title}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span className="truncate uppercase tracking-wider font-bold">{room.location}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-3xl font-black text-white tracking-tight">₹{room.price.toLocaleString()}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">
                          {room.type === "Hostel" ? "Per Year" : "Per Month"}
                        </div>
                      </div>
                    </div>

                    {/* Room Details Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-8 p-4 glass-card bg-white/5 rounded-2xl border-white/5">
                      <div className="flex flex-col items-center gap-1">
                        <BedDouble className="w-5 h-5 text-blue-400" />
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">{room.bedrooms} Bed</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 border-x border-white/10 px-2">
                        <Bath className="w-5 h-5 text-purple-400" />
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">{room.bathrooms} Bath</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 text-center">
                        <Maximize className="w-5 h-5 text-pink-400" />
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider truncate w-full px-1">{room.area}</span>
                      </div>
                    </div>

                    {/* Posted By */}
                    {room.postedBy && (
                      <div className="flex items-center gap-4 mb-8 p-3 glass-card border-none bg-white/5 rounded-2xl group/user">
                        <div className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-blue-400 font-bold uppercase overflow-hidden shadow-xl border-white/20">
                          {room.postedBy.name.charAt(0)}
                        </div>
                        <div className="text-xs">
                          <div className="font-black text-white uppercase tracking-wider">{room.postedBy.name}</div>
                          <div className="text-gray-500 font-bold uppercase tracking-widest text-[9px] mt-0.5">Verified Host</div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-auto">
                      <button
                        onClick={() => handleViewDetails(room.id)}
                        className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all hover:from-blue-500 hover:to-purple-500 active:scale-95 shadow-lg shadow-blue-900/20 flex items-center justify-center gap-3"
                      >
                        <Eye className="w-5 h-5" />
                        View
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {rooms.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32"
              >
                <div className="w-24 h-24 glass-card rounded-[2rem] flex items-center justify-center mx-auto mb-10">
                  <Home className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4">No results found</h3>
                <p className="text-xl text-gray-500 font-light mb-12">Adjust your filters to see more premium spaces.</p>
                <button
                  onClick={handleClearFilters}
                  className="px-10 py-5 bg-white text-midnight font-black uppercase tracking-widest rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl"
                >
                  Clear All
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );

};

export default FindRoom;