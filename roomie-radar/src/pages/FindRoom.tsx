// src/pages/FindRoom.tsx
import { useState, useEffect } from "react";
import AddListingModal from "../components/AddListingModal.tsx";
import type { NewListingInput } from "../components/AddListingModal.tsx";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, DollarSign, Home, Users, Bath, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { getAllRooms, searchRooms, addToFavorites, createRoomListing } from "../api";
import { PixelGrid } from "../components/ui";
import RoomCard from "../components/RoomCard";

interface Room {
  id: number;
  title: string;
  location: string;
  price: number;
  area: string;
  bedrooms: number;
  bathrooms: number;
  type: "Private" | "Shared" | "Studio" | "Hostel"
  images: string[];
  tags: string[];
  description?: string;
  amenities?: string[];
  availaibleFrom?: string;
  deposit?: string;
  maintenance?: string;
  parking?: boolean;
  petFriendly?: boolean;
  furnished?: boolean;
  contactNumber?: string;
  contactEmail?: string;
  houseRules?: string;
  houseDetails?: string;

  postedBy?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    occupation?: string;
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
    size: 9,
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
        bedrooms: searchFilters.bedrooms || undefined,
        bathrooms: searchFilters.bathrooms || undefined,
        page,
        size: pagination.size,
      };

      const response = await searchRooms(filters);

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
      setError("Failed to load rooms. Please check your connection and try again.");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(0);
  }, []);

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
      await addToFavorites(roomId);
    } catch (err) {
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
    setLoading(true);
    getAllRooms(0, 9).then(response => {
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

  const handleAddRoom = async (listing: NewListingInput) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const roomPayload = {
        title: listing.title,
        location: listing.location,
        price: Number(listing.price),
        area: listing.area ?? "",
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        images: listing.images,
        tags: listing.tags,
        type: listing.type,
        ...(listing.description && { description: listing.description }),
        ...(listing.amenities && { amenities: listing.amenities }),
        ...(listing.availableFrom && { availaibleFrom: listing.availableFrom }),
        ...(listing.deposit && { deposit: listing.deposit }),
        ...(listing.maintenance && { maintenance: listing.maintenance }),
        ...(listing.parking !== undefined && { parking: listing.parking }),
        ...(listing.petFriendly !== undefined && { petFriendly: listing.petFriendly }),
        ...(listing.furnished !== undefined && { furnished: listing.furnished }),
        ...(listing.contactNumber && { contactNumber: listing.contactNumber }),
        ...(listing.contactEmail && { contactEmail: listing.contactEmail }),
        ...(listing.houseRules && { houseRules: listing.houseRules }),
        ...(listing.houseDetails && { houseDetails: listing.houseDetails }),
      };

      const newRoom = await createRoomListing(roomPayload);
      setRooms((prevRooms) => [newRoom, ...prevRooms]);
      setShowAddModal(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to create room.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] pt-16 sm:pt-28 pb-20 relative overflow-hidden font-sans">
      <PixelGrid />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12"
        >
          <div>
            <div className="text-trae-green font-mono text-xs mb-3 uppercase tracking-[0.2em] font-bold">Search Rooms</div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter mb-4">
              Premium <span className="text-trae-green">Rooms.</span>
            </h1>
            <p className="text-sm text-gray-500 font-medium max-w-xl">Find the perfect place to stay from our curated collection of verified listings.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="group relative px-8 h-16 sm:h-14 bg-trae-green rounded-xl text-black font-black uppercase tracking-widest text-[11px] sm:text-[10px] flex items-center gap-2.5 transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95 shadow-xl"
          >
            <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
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
          transition={{ delay: 0.1 }}
          className="bg-[#0a0a0a] border border-white/5 p-6 md:p-8 rounded-[2rem] mb-12 shadow-xl relative group"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-trae-green/20 to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="space-y-2">
              <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-trae-green/60 font-black ml-1">Location</label>
              <div className="relative group/input">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-trae-green transition-colors w-4.5 h-4.5" />
                <input
                  type="text"
                  placeholder="Where to?"
                  value={searchFilters.location}
                  onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-trae-green/50 transition-all text-white placeholder-gray-700 text-[13px] font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-trae-green/60 font-black ml-1">Budget Range</label>
              <div className="relative group/input">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-trae-green transition-colors w-4.5 h-4.5" />
                <select
                  value={searchFilters.budget}
                  onChange={(e) => setSearchFilters({ ...searchFilters, budget: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-trae-green/50 transition-all text-white border-white/5 appearance-none cursor-pointer text-[13px] font-medium"
                >
                  <option value="" className="bg-[#0a0a0a]">Any budget</option>
                  <option value="5000-10000" className="bg-[#0a0a0a]">₹5k - ₹10k</option>
                  <option value="10000-15000" className="bg-[#0a0a0a]">₹10k - ₹15k</option>
                  <option value="15000-25000" className="bg-[#0a0a0a]">₹15k - ₹25k</option>
                  <option value="25000+" className="bg-[#0a0a0a]">₹25k+</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-trae-green/60 font-black ml-1">Room Type</label>
              <div className="relative group/input">
                <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-trae-green transition-colors w-4.5 h-4.5" />
                <select
                  value={searchFilters.roomType}
                  onChange={(e) => setSearchFilters({ ...searchFilters, roomType: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-trae-green/50 transition-all text-white appearance-none cursor-pointer text-[13px] font-medium"
                >
                  <option value="" className="bg-[#0a0a0a]">Any type</option>
                  <option value="Private" className="bg-[#0a0a0a]">Private</option>
                  <option value="Shared" className="bg-[#0a0a0a]">Shared</option>
                  <option value="Studio" className="bg-[#0a0a0a]">Studio</option>
                  <option value="Hostel" className="bg-[#0a0a0a]">Hostel</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-trae-green/60 font-black ml-1">Bedrooms</label>
              <div className="relative group/input">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-trae-green transition-colors w-4.5 h-4.5" />
                <select
                  value={searchFilters.bedrooms}
                  onChange={(e) => setSearchFilters({ ...searchFilters, bedrooms: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-trae-green/50 transition-all text-white appearance-none cursor-pointer text-[13px] font-medium"
                >
                  <option value="" className="bg-[#0a0a0a]">Any</option>
                  <option value="1" className="bg-[#0a0a0a]">1 Bed</option>
                  <option value="2" className="bg-[#0a0a0a]">2 Beds</option>
                  <option value="3" className="bg-[#0a0a0a]">3 Beds</option>
                  <option value="4+" className="bg-[#0a0a0a]">4+ Beds</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-trae-green/60 font-black ml-1">Bathrooms</label>
              <div className="relative group/input">
                <Bath className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-trae-green transition-colors w-4.5 h-4.5" />
                <select
                  value={searchFilters.bathrooms}
                  onChange={(e) => setSearchFilters({ ...searchFilters, bathrooms: e.target.value })}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-trae-green/50 transition-all text-white appearance-none cursor-pointer text-[13px] font-medium"
                >
                  <option value="" className="bg-[#0a0a0a]">Any</option>
                  <option value="1" className="bg-[#0a0a0a]">1 Bath</option>
                  <option value="2" className="bg-[#0a0a0a]">2 Baths</option>
                  <option value="3+" className="bg-[#0a0a0a]">3+ Baths</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-10 h-16 sm:h-14 bg-trae-green text-black font-black uppercase tracking-widest text-[11px] sm:text-[9px] rounded-xl transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group/btn shadow-xl"
            >
              <Search className="w-5 h-5 sm:w-4 sm:h-4 transition-transform group-hover/btn:scale-110" />
              {loading ? "Searching..." : "Search Now"}
            </button>
            <button
              onClick={handleClearFilters}
              disabled={loading}
              className="px-8 h-16 sm:h-14 bg-white/5 border border-white/10 text-gray-500 font-black uppercase tracking-widest text-[11px] sm:text-[9px] rounded-xl transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-50"
            >
              Clear Filters
            </button>
          </div>
        </motion.div>

        {loading && (
          <div className="text-center py-32">
            <div className="w-12 h-12 border-2 border-trae-green border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-sm text-gray-500 font-mono uppercase tracking-[0.3em] font-bold animate-pulse">Finding Rooms...</p>
          </div>
        )}

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="bg-[#0a0a0a] border border-red-500/20 px-8 py-10 rounded-[2rem] max-w-lg mx-auto shadow-xl">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-3.5 h-3.5 bg-red-500 rounded-full animate-ping" />
              </div>
              <h3 className="text-xl font-black text-white mb-3 tracking-tighter uppercase">Sync Error</h3>
              <p className="text-gray-500 mb-8 text-[13px] font-medium leading-relaxed">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3.5 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500/20 transition-all font-bold uppercase tracking-widest text-[9px]"
              >
                REBOOT_APP
              </button>
            </div>
          </motion.div>
        )}

        {!loading && !error && (
          <div className="pb-12">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tighter mb-1">
                  <span className="text-trae-green">{pagination.totalElements}</span> rooms found
                </h2>
                <p className="text-[12px] font-mono text-gray-400 uppercase tracking-[0.2em] font-bold">PAGE <span className="text-trae-green">{pagination.page + 1}</span> / {pagination.totalPages}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room, i) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onFavorite={(id) => handleAddToFavorites(id)}
                  onOpenGallery={() => handleViewDetails(room.id)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 0}
                  className="w-12 h-12 flex items-center justify-center bg-[#0a0a0a] border border-white/10 rounded-xl text-white disabled:opacity-10 hover:bg-trae-green hover:text-black transition-all active:scale-90 shadow-xl"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="bg-[#0a0a0a] border border-white/10 px-6 py-2.5 rounded-xl text-white font-mono font-black text-sm tracking-widest shadow-xl">
                  <span className="text-trae-green">{pagination.page + 1}</span> <span className="text-gray-700 mx-1">/</span> {pagination.totalPages}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages - 1}
                  className="w-12 h-12 flex items-center justify-center bg-[#0a0a0a] border border-white/10 rounded-xl text-white disabled:opacity-10 hover:bg-trae-green hover:text-black transition-all active:scale-90 shadow-xl"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div >
  );
};

export default FindRoom;