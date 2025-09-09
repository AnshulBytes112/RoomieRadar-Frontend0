// src/pages/FindRoom.tsx
import { useState, useEffect } from "react";
import AddListingModal from "../components/AddListingModal.tsx";
import type { NewListingInput } from "../components/AddListingModal.tsx";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, DollarSign, Home, Heart, Eye } from "lucide-react";
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
    <div className="min-h-screen pt-24 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow hover:from-pink-600 hover:to-indigo-600 transition-all duration-200"
        >
          List a New Room
        </button>
      </div>
      
      <AddListingModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddRoom}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Find Your Perfect Room
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover amazing rooms and apartments that match your lifestyle and budget. 
            From cozy studios to luxury apartments, find your next home today.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-12 border border-white/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <Search className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Search Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                type="text"
                placeholder="City or neighborhood"
                value={searchFilters.location}
                onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
<span className="w-4 h-4 inline-block">₹</span>
                Budget
              </label>
              <select 
                value={searchFilters.budget}
                onChange={(e) => setSearchFilters({ ...searchFilters, budget: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Any budget</option>
                <option value="5000-10000">₹5000 - ₹10000</option>
                <option value="10000-15000">₹10001 - ₹15000</option>
                <option value="15000-20000">₹15001 - ₹20000</option>
                <option value="20000+">₹20001+</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Home className="w-4 h-4" />
                Room Type
              </label>
              <select 
                value={searchFilters.roomType}
                onChange={(e) => setSearchFilters({ ...searchFilters, roomType: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Any type</option>
                <option value="Private">Private room</option>
                <option value="Shared">Shared room</option>
                <option value="Studio">Studio</option>
                <option value="Hostel">Hostel</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Bedrooms</label>
              <select 
                value={searchFilters.bedrooms}
                onChange={(e) => setSearchFilters({ ...searchFilters, bedrooms: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Any</option>
                <option value="0">Studio</option>
                <option value="1">1 bedroom</option>
                <option value="2">2 bedrooms</option>
                <option value="3+">3+ bedrooms</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Bathrooms</label>
              <select 
                value={searchFilters.bathrooms}
                onChange={(e) => setSearchFilters({ ...searchFilters, bathrooms: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Any</option>
                <option value="1">1 bathroom</option>
                <option value="2">2 bathrooms</option>
                <option value="3+">3+ bathrooms</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Searching..." : "Search Rooms"}
            </button>
            <button 
              onClick={handleClearFilters}
              disabled={loading}
              className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear Filters
            </button>
          </div>
        </motion.div>

        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading rooms...</p>
          </div>
        )}

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-semibold">Error</span>
              </div>
              <p>{error}</p>
              <div className="flex gap-3 mt-4 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    const fetchRooms = async () => {
                      try {
                        setLoading(true);
                        const fetchedRooms = await getAllRooms();
                        setRooms(fetchedRooms);
                      } catch (err) {
                        setError("Failed to load rooms. Please check your connection and try again.");
                      } finally {
                        setLoading(false);
                      }
                    };
                    fetchRooms();
                  }}
                  className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">
                {rooms.length} Room{rooms.length !== 1 ? "s" : ""} Found
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={room.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500"}
                      alt={room.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => handleAddToFavorites(room.id)}
                        className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                      >
                        <Heart className="w-5 h-5 text-gray-600 hover:text-red-500" />
                      </button>
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {room.type}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {room.title}
                      </h4>
                      <div className="text-right">
                        {/* Updated to handle number price from backend */}
                        <div className="text-2xl font-bold text-blue-600">₹{room.price}</div>
                        <div className="text-sm text-gray-500">
  {room.type === "Hostel" ? "per year" : "per month"}
</div>

                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{room.location}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span>{room.bedrooms} bed{room.bedrooms !== 1 ? "s" : ""}</span>
                      <span>•</span>
                      <span>{room.bathrooms} bath{room.bathrooms !== 1 ? "s" : ""}</span>
                      <span>•</span>
                      <span>{room.area}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {room.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleViewDetails(room.id)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {rooms.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Home className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No rooms found</h3>
                <p className="text-gray-500">Try adjusting your search filters to find more results.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FindRoom;