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
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });
  const [searchFilters, setSearchFilters] = useState({
    location: "",
    budget: "",
    roomType: "",
    bedrooms: "",
    bathrooms: "",
  });

  const fetchRooms = async (page = 0) => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        location: searchFilters.location || undefined,
        budget: searchFilters.budget || undefined,
        roomType: searchFilters.roomType || undefined,
        bedrooms: searchFilters.bedrooms ? parseInt(searchFilters.bedrooms) : undefined,
        bathrooms: searchFilters.bathrooms ? parseInt(searchFilters.bathrooms) : undefined,
        page,
        size: pagination.size,
      };

      console.log("Fetching rooms with filters:", filters);
      const response = await searchRooms(filters);
      console.log("Fetched rooms response:", response);

      if (response && response.content) {
        setRooms(response.content);
        setPagination(prev => ({
          ...prev,
          page: response.number,
          totalPages: response.totalPages,
          totalElements: response.totalElements
        }));
      } else {
        setRooms([]);
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError("Failed to load rooms. Please check your connection and try again.");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(0);
  }, []); // Initial load

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchRooms(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearch = () => {
    fetchRooms(0);
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
    // We need to trigger a fetch after state update, but state updates are async.
    // Ideally use useEffect or pass reset filters directly.
    // For simplicity, we'll reset and call fetch with empty filters manually.
    setLoading(true);
    getAllRooms(0, 10).then(response => {
      if (response && response.content) {
        setRooms(response.content);
        setPagination(prev => ({
          ...prev,
          page: response.number,
          totalPages: response.totalPages,
          totalElements: response.totalElements
        }));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
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
    <div className="min-h-screen bg-[#0c0c1d] pt-20 sm:pt-24 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6 mb-8 sm:mb-12"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 sm:mb-4 tracking-tight">
              Elite <span className="text-gradient">Spaces</span>
            </h1>
            <p className="text-sm sm:text-base md:text-xl text-gray-400 font-light">Discover hand-picked premium listings in your favorite neighborhoods.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="group relative px-5 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl text-white font-bold transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center gap-2 sm:gap-3 text-sm"
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
          className="glass-card p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[2.5rem] mb-8 sm:mb-16 shadow-2xl border-white/5 relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 opacity-50" />

          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 glass-card rounded-xl flex items-center justify-center">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">Refine Your Search</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-10">
            <div className="space-y-3">
              <label className="text-[10px] sm:text-sm font-bold text-gray-400 ml-1 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" /> Location
              </label>
              <input
                type="text"
                placeholder="Where to?"
                value={searchFilters.location}
                onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                className="w-full px-4 py-3 sm:px-5 sm:py-4 glass-card rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all bg-white/5 text-white placeholder-gray-500 border-white/5 text-sm"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] sm:text-sm font-bold text-gray-400 ml-1 uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" /> Monthly Budget
              </label>
              <select
                value={searchFilters.budget}
                onChange={(e) => setSearchFilters({ ...searchFilters, budget: e.target.value })}
                className="w-full px-4 py-3 sm:px-5 sm:py-4 glass-card rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all bg-[#1a1a3a] text-white border-white/5 appearance-none cursor-pointer text-sm"
              >
                <option value="" className="bg-[#0c0c1d]">Any budget</option>
                <option value="5000-10000" className="bg-[#0c0c1d]">₹5,000 - ₹10,000</option>
                <option value="10000-15000" className="bg-[#0c0c1d]">₹10,000 - ₹15,000</option>
                <option value="15000-25000" className="bg-[#0c0c1d]">₹15,000 - ₹25,000</option>
                <option value="25000+" className="bg-[#0c0c1d]">₹25,000+</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] sm:text-sm font-bold text-gray-400 ml-1 uppercase tracking-widest flex items-center gap-2">
                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500" /> Room Type
              </label>
              <select
                value={searchFilters.roomType}
                onChange={(e) => setSearchFilters({ ...searchFilters, roomType: e.target.value })}
                className="w-full px-4 py-3 sm:px-5 sm:py-4 glass-card rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all bg-[#1a1a3a] text-white border-white/5 appearance-none cursor-pointer text-sm"
              >
                <option value="" className="bg-[#0c0c1d]">Any type</option>
                <option value="Private" className="bg-[#0c0c1d]">Private Room</option>
                <option value="Shared" className="bg-[#0c0c1d]">Shared Room</option>
                <option value="Studio" className="bg-[#0c0c1d]">Studio Apartment</option>
                <option value="Hostel" className="bg-[#0c0c1d]">Hostel/PG</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] sm:text-sm font-bold text-gray-400 ml-1 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" /> Bedrooms
              </label>
              <select
                value={searchFilters.bedrooms}
                onChange={(e) => setSearchFilters({ ...searchFilters, bedrooms: e.target.value })}
                className="w-full px-4 py-3 sm:px-5 sm:py-4 glass-card rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all bg-[#1a1a3a] text-white border-white/5 appearance-none cursor-pointer text-sm"
              >
                <option value="" className="bg-[#0c0c1d]">Any</option>
                <option value="1" className="bg-[#0c0c1d]">1 Bed</option>
                <option value="2" className="bg-[#0c0c1d]">2 Beds</option>
                <option value="3" className="bg-[#0c0c1d]">3 Beds</option>
                <option value="4+" className="bg-[#0c0c1d]">4+ Beds</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 sm:px-10 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl text-white font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-xl shadow-blue-900/30 flex-1 md:flex-none text-sm"
            >
              {loading ? "Searching..." : "Apply Filters"}
            </button>
            <button
              onClick={handleClearFilters}
              disabled={loading}
              className="px-6 py-3 sm:px-10 sm:py-4 glass-card rounded-xl sm:rounded-2xl text-gray-300 font-bold transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50 flex-1 md:flex-none text-sm"
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
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 sm:mb-8"
            >
              <div>
                <h2 className="text-lg sm:text-xl md:text-3xl font-black text-white tracking-tight">
                  <span className="text-gradient">{pagination.totalElements}</span> Spaces
                </h2>
                <p className="text-[10px] sm:text-xs md:text-base text-gray-500 font-medium">Page {pagination.page + 1} of {pagination.totalPages}</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {rooms.map((room, i) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-2xl overflow-hidden group hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-1 shadow-xl relative flex flex-col"
                >
                  {/* Image Section */}
                  <div className="relative h-40 sm:h-48 lg:h-64 bg-white/5 overflow-hidden">
                    <img
                      src={room.images[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"}
                      alt={room.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0c0c1d] to-transparent" />

                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4">
                      <span className="px-2 py-1 sm:px-3 sm:py-1.5 glass-card rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white border-white/20 shadow-xl">
                        {room.type}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToFavorites(room.id);
                      }}
                      className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 sm:p-3 glass-card rounded-full hover:bg-white transition-all group/fav active:scale-90"
                    >
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover/fav:text-red-500 transition-colors" />
                    </button>
                  </div>

                  {/* Content Section */}
                  <div className="p-4 sm:p-6 flex-grow flex flex-col">
                    <div className="flex flex-col mb-1 md:mb-6">
                      <h3 className="text-base sm:text-lg font-black text-white leading-tight mb-1 truncate group-hover:text-blue-400 transition-colors order-1">
                        {room.title}
                      </h3>
                      <div className="text-lg sm:text-xl font-black text-blue-400 sm:text-white tracking-tight order-2">₹{room.price.toLocaleString()}</div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400 text-[10px] sm:text-xs mb-3">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                      <span className="truncate uppercase tracking-wider font-bold">{room.location}</span>
                    </div>

                    {/* Room Details Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4 p-2 sm:p-3 glass-card bg-white/5 rounded-xl border-white/5">
                      <div className="flex flex-col items-center gap-0.5 md:gap-1">
                        <BedDouble className="w-4 h-4 text-blue-400" />
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider text-center">{room.bedrooms} Bed</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5 border-x border-white/10 px-1">
                        <Bath className="w-4 h-4 text-purple-400" />
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider text-center">{room.bathrooms} Bath</span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5 text-center">
                        <Maximize className="w-4 h-4 text-pink-400" />
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider truncate w-full px-0.5">{room.area}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={() => handleViewDetails(room.id)}
                        className="flex-1 h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all hover:from-blue-500 hover:to-purple-500 active:scale-95 shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 0}
                  className="px-6 py-3 glass-card rounded-xl text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all font-bold uppercase tracking-wider text-sm"
                >
                  Previous
                </button>
                <div className="text-white font-black text-lg">
                  {pagination.page + 1} <span className="text-gray-500 text-sm font-medium">/ {pagination.totalPages}</span>
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages - 1}
                  className="px-6 py-3 glass-card rounded-xl text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all font-bold uppercase tracking-wider text-sm"
                >
                  Next
                </button>
              </div>
            )}

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