import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GalleryModal from "../components/GalleryModal.tsx";
import { fetchRoomDetails, addToFavorites, removeFromFavorites, checkIfFavorited } from "../api";
import { useAuth } from "../contexts/AuthContext";

type RoomListing = {
  id: number;
  title: string;
  location: string;
  price: string | number; // Updated to handle both string and number
  area: string;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  tags: string[];
  type: "Private" | "Shared" | "Studio";
  ownerId?: string;
  description?: string;
  amenities?: string[];
  availableFrom?: string;
  deposit?: string | number; // Updated to handle both string and number
  maintenance?: string | number; // Updated to handle both string and number
  parking?: boolean;
  petFriendly?: boolean;
  furnished?: boolean;
  contactNumber?: string;
  contactEmail?: string;
};

const RoomDetails = ({ room: initialRoom }: { room?: RoomListing }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<RoomListing | null>(initialRoom || null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'location' | 'contact'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      if (room) {
        // Already have room from navigation state
        if (user) {
          try {
            const isFavorited = await checkIfFavorited(room.id);
            setIsInWishlist(isFavorited);
          } catch (err) {
            console.error("Error checking wishlist status:", {
              error: err,
              roomId: room.id,
              response: err instanceof Error ? err.message : 'Unknown error'
            });
            // Don't show error to user for wishlist check failure
            setIsInWishlist(false); // Fallback to false if check fails
          }
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const roomId = parseInt(id || "0", 10);
        if (!roomId) {
          setError("Invalid room ID");
          return;
        }

        const fetchedRoom = await fetchRoomDetails(roomId);
        setRoom(fetchedRoom);

        if (user) {
          try {
            const isFavorited = await checkIfFavorited(roomId);
            setIsInWishlist(isFavorited);
          } catch (err) {
            console.error("Error checking wishlist status for fetched room:", {
              error: err,
              roomId,
              response: err instanceof Error ? err.message : 'Unknown error'
            });
            // Don't show error to user for wishlist check failure
            setIsInWishlist(false); // Fallback to false if check fails
          }
        }
      } catch (err) {
        console.error("Error fetching room details:", {
          error: err,
          roomId: id
        });
        setError("Failed to fetch room details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id, user, room]);

  const toggleWishlist = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!room) {
      alert("No room data available");
      return;
    }
    try {
      if (isInWishlist) {
        await removeFromFavorites(room.id);
        setIsInWishlist(false);
      } else {
        await addToFavorites(room.id);
        setIsInWishlist(true);
      }
    } catch (err) {
      console.error("Error updating wishlist:", err);
      alert("Failed to update wishlist. Please try again.");
    }
  };

  const handleContactOwner = () => {
    if (!user) {
      navigate("/login");
    } else if (room?.contactNumber) {
      window.open(`tel:${room.contactNumber}`, '_self');
    } else {
      alert("Contact number not available");
    }
  };

  const handleScheduleVisit = () => {
    if (!user) {
      navigate("/login");
    } else if (room?.title) {
      alert(`Scheduling visit for ${room.title}. This feature will be implemented soon!`);
    } else {
      alert("Room data not available");
    }
  };

  // Fixed formatPrice function to handle both string and number types
  const formatPrice = (price: string | number | undefined): string => {
    if (!price && price !== 0) return "0";
    
    // Convert to string first
    const priceStr = String(price);
    
    // Remove currency symbols and '/month' text if present
    return priceStr.replace(/₹/g, '').replace(/\/month/g, '').replace(/,/g, '').trim();
  };

  // Helper function to format price for display
  const displayPrice = (price: string | number | undefined): string => {
    if (!price && price !== 0) return "Not specified";
    
    const numPrice = typeof price === 'number' ? price : parseInt(String(price).replace(/[^\d]/g, ''), 10);
    if (isNaN(numPrice)) return "Not specified";
    
    return `₹${numPrice.toLocaleString()}/month`;
  };

  // Helper function to format deposit/maintenance for display
  const displayAmount = (amount: string | number | undefined): string => {
    if (!amount && amount !== 0) return "Not specified";
    
    const numAmount = typeof amount === 'number' ? amount : parseInt(String(amount).replace(/[^\d]/g, ''), 10);
    if (isNaN(numAmount)) return "Not specified";
    
    return `₹${numAmount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Room</h3>
          <p className="text-gray-600 mb-4">{error || 'Room not found'}</p>
          <button
            onClick={() => navigate('/find-room')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const openGallery = (startIndex: number) => {
    setCurrentImageIndex(startIndex);
    setIsGalleryOpen(true);
  };

  // Define tabs with explicit typing using 'as const'
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'location', label: 'Location' },
    { id: 'contact', label: 'Contact' }
  ] as const;

  return (
    <div className="min-h-screen pt-24 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/find-room')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Search
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{room.title || 'Room Title'}</h1>
              <p className="text-lg text-gray-600 flex items-center gap-2 mt-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {room.location || 'Unknown Location'}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-indigo-600">{displayPrice(room.price)}</div>
              <div className="text-gray-600">{room.area || 'N/A'} • {room.bedrooms || 0} BHK • {room.type || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Basic Info */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6"
            >
              <div className="relative aspect-[4/3] w-full">
                <img
                  src={room.images && room.images.length > 0 ? room.images[currentImageIndex] : '/placeholder.jpg'}
                  alt={room.title || 'Room Image'}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openGallery(currentImageIndex)}
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/90 text-gray-800 border border-gray-200">
                    {room.type || 'N/A'}
                  </span>
                </div>
              </div>
              
              {/* Thumbnail Navigation */}
              {room.images && room.images.length > 1 && (
                <div className="p-4">
                  <div className="flex gap-2 overflow-x-auto">
                    {room.images.map((img, idx) => (
                      <button
                        key={img || idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          idx === currentImageIndex ? 'border-indigo-500' : 'border-gray-200'
                        }`}
                      >
                        <img src={img || '/placeholder.jpg'} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-600 leading-relaxed">{room.description || 'No description available'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">{room.bedrooms || 0}</div>
                        <div className="text-sm text-gray-600">Bedrooms</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">{room.bathrooms || 0}</div>
                        <div className="text-sm text-gray-600">Bathrooms</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">{room.area || 'N/A'}</div>
                        <div className="text-sm text-gray-600">Area</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">{room.type || 'N/A'}</div>
                        <div className="text-sm text-gray-600">Type</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {(room.tags || []).map(tag => (
                          <span key={tag} className="px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700 border border-indigo-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'amenities' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Amenities</h3>
                      {room.amenities && room.amenities.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {room.amenities.map((amenity, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-700">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No amenities listed</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Features</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${room.parking ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-gray-700">Parking Available</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${room.petFriendly ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-gray-700">Pet Friendly</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${room.furnished ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-gray-700">Furnished</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'location' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 font-medium">{room.location || 'Unknown Location'}</p>
                        <p className="text-gray-600 text-sm mt-1">Prime location with excellent connectivity</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Nearby Places</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Transportation</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Metro Station - 500m</li>
                            <li>• Bus Stop - 200m</li>
                            <li>• Auto Stand - 100m</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Essentials</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Supermarket - 300m</li>
                            <li>• Hospital - 1km</li>
                            <li>• Schools - 800m</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <div>
                            <p className="font-medium text-gray-900">{room.contactNumber || 'Not available'}</p>
                            <p className="text-sm text-gray-600">Phone Number</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <div>
                            <p className="font-medium text-gray-900">{room.contactEmail || 'Not available'}</p>
                            <p className="text-sm text-gray-600">Email Address</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="flex gap-3">
                        <button 
                          onClick={handleContactOwner}
                          className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                        >
                          Call Now
                        </button>
                        <button 
                          onClick={() => {
                            if (!user) {
                              navigate('/login');
                            } else if (room.contactEmail) {
                              window.open(`mailto:${room.contactEmail}?subject=Inquiry about ${room.title || 'Room'}`, '_self');
                            } else {
                              alert("Email address not available");
                            }
                          }}
                          className="flex-1 py-3 px-4 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium"
                        >
                          Send Message
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Pricing and Quick Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Pricing Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Pricing Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Rent</span>
                    <span className="font-semibold text-gray-900">{displayPrice(room.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security Deposit</span>
                    <span className="font-semibold text-gray-900">{displayAmount(room.deposit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maintenance</span>
                    <span className="font-semibold text-gray-900">{displayAmount(room.maintenance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available From</span>
                    <span className="font-semibold text-gray-900">{room.availableFrom || 'Not specified'}</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Move-in Cost</span>
                    <span className="text-indigo-600">
                      ₹{(() => {
                        const rent = parseInt(formatPrice(room.price)) || 0;
                        const deposit = parseInt(formatPrice(room.deposit)) || 0;
                        return (rent + deposit).toLocaleString();
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-gray-700">{room.bedrooms || 0} Bedroom{room.bedrooms !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span className="text-gray-700">{room.bathrooms || 0} Bathroom{room.bathrooms !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span className="text-gray-700">{room.area || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-gray-700">{room.type || 'N/A'} Room</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="space-y-3">
                  <button 
                    onClick={handleContactOwner}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-lg hover:from-indigo-600 hover:to-pink-600 transition font-medium"
                  >
                    Contact Owner
                  </button>
                  <button 
                    onClick={handleScheduleVisit}
                    className="w-full py-3 px-4 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-medium"
                  >
                    Schedule Visit
                  </button>
                  <button 
                    onClick={toggleWishlist}
                    className={`w-full py-3 px-4 border rounded-lg transition font-medium ${
                      isInWishlist 
                        ? 'border-green-600 text-green-600 hover:bg-green-50' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {isInWishlist ? 'Remove from Wishlist' : 'Save to Wishlist'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {isGalleryOpen && room.images && room.images.length > 0 && (
        <GalleryModal
          images={room.images}
          startIndex={currentImageIndex}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}
    </div>
  );
};

export default RoomDetails;