// src/pages/FindRoom.tsx
import { useState, useEffect } from "react";
import AddListingModal from "../components/AddListingModal.tsx";
import type { NewListingInput } from "../components/AddListingModal.tsx";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, DollarSign, Home, Heart, Eye, Users, Wifi, Car } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Find Your Perfect Space</h1>
              <p className="text-gray-600 mt-1">Real rooms from real people</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              List Your Room
            </button>
          </div>
        </div>
      </div>
      
      <AddListingModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddRoom}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Search className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">What are you looking for?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                placeholder="Enter area or city"
                value={searchFilters.location}
                onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Monthly Budget
              </label>
              <select 
                value={searchFilters.budget}
                onChange={(e) => setSearchFilters({ ...searchFilters, budget: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any budget</option>
                <option value="5000-10000">₹5,000 - ₹10,000</option>
                <option value="10000-15000">₹10,000 - ₹15,000</option>
                <option value="15000-25000">₹15,000 - ₹25,000</option>
                <option value="25000+">₹25,000+</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Home className="w-4 h-4 inline mr-1" />
                Room Type
              </label>
              <select 
                value={searchFilters.roomType}
                onChange={(e) => setSearchFilters({ ...searchFilters, roomType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any type</option>
                <option value="Private">Private Room</option>
                <option value="Shared">Shared Room</option>
                <option value="Studio">Studio Apartment</option>
                <option value="Hostel">Hostel/Paying Guest</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
              <select 
                value={searchFilters.bedrooms}
                onChange={(e) => setSearchFilters({ ...searchFilters, bedrooms: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4+">4+ Bedrooms</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
            >
              {loading ? "Searching..." : "Search"}
            </button>
            <button 
              onClick={handleClearFilters}
              disabled={loading}
              className="border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-colors duration-200"
            >
              Clear
            </button>
          </div>
        </div>

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
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {rooms.length} {rooms.length === 1 ? 'Room' : 'Rooms'} Available
              </h2>
              <div className="text-sm text-gray-600">
                Showing all available spaces in your area
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Image Section */}
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={room.images[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"}
                      alt={room.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                        {room.type}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToFavorites(room.id)}
                      className="absolute top-3 right-3 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                    </button>
                  </div>

                  {/* Content Section */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 text-base leading-tight">
                        {room.title}
                      </h3>
                      <div className="text-right ml-2">
                        <div className="text-lg font-bold text-gray-900">₹{room.price.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          {room.type === "Hostel" ? "per year" : "per month"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{room.location}</span>
                    </div>

                    {/* Room Details */}
                    <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Home className="w-3 h-3" />
                        {room.bedrooms} bed{room.bedrooms !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {room.bathrooms} bath{room.bathrooms !== 1 ? "s" : ""}
                      </span>
                      <span>{room.area}</span>
                    </div>

                    {/* Amenities Preview */}
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        {room.amenities.slice(0, 3).map((amenity, index) => (
                          <span key={index} className="text-xs text-gray-500">
                            {amenity === "WiFi" && <Wifi className="w-3 h-3 inline" />}
                            {amenity === "Parking" && <Car className="w-3 h-3 inline" />}
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="text-xs text-gray-400">+{room.amenities.length - 3} more</span>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {room.tags && room.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {room.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Posted By */}
                    {room.postedBy && (
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                        <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                        <div className="text-xs text-gray-600">
                          <div className="font-medium">{room.postedBy.name}</div>
                          <div className="text-gray-400">Listed by owner</div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(room.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleAddToFavorites(room.id)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {rooms.length === 0 && (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Home className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
                <p className="text-gray-600 text-sm">Try adjusting your search filters or browse all available rooms.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindRoom;