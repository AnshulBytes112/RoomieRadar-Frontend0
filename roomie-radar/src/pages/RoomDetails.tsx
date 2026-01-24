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
  type: "Private" | "Shared" | "Studio" | "Hostel";
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

  // NEW: Handle Book Now button click
  const handleBookNow = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!room) {
      alert("Room data not available");
      return;
    }
    // Navigate to the BookNow page with the room ID
    navigate(`/book-now/${room.id}`);
  };

  // Fixed formatPrice function to handle both string and number types
  const formatPrice = (price: string | number | undefined): string => {
    if (!price && price !== 0) return "0";

    // Convert to string first
    const priceStr = String(price);

    // Remove currency symbols and '/month' text if present
    return priceStr.replace(/₹/g, '').replace(/\/month/g, '').replace(/,/g, '').replace(/\/year/g, '').trim();
  };

  // Helper function to format price for display
  const displayPrice = (
    price: string | number | undefined,
    roomType: RoomListing["type"] | undefined
  ): string => {
    if (!price && price !== 0) return "Not specified";

    const numPrice =
      typeof price === "number"
        ? price
        : parseInt(String(price).replace(/[^\d]/g, ""), 10);

    if (isNaN(numPrice)) return "Not specified";

    let formattedPrice = `₹${numPrice.toLocaleString()}`;

    if (roomType === "Hostel") {
      return `${formattedPrice}/year`;
    } else {
      return `${formattedPrice}/month`;
    }
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
    <div className="min-h-screen pt-24 bg-[#0c0c1d] pb-20 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/5 mb-12">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <button
            onClick={() => navigate('/find-room')}
            className="flex items-center gap-3 text-gray-500 hover:text-white mb-8 transition-colors group font-black uppercase tracking-widest text-[10px]"
          >
            <div className="w-8 h-8 glass-card rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-all border-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            Back to Collection
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-none">
                {room.title || 'Elite Space'}
              </h1>
              <div className="flex items-center gap-4 text-gray-400">
                <div className="w-10 h-10 glass-card rounded-xl flex items-center justify-center border-none">
                  <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold uppercase tracking-widest">{room.location || 'Unknown Coordinates'}</span>
              </div>
            </div>

            <div className="lg:text-right">
              <div className="text-6xl font-black text-white tracking-tighter mb-2">
                {displayPrice(room.price, room.type).split('/')[0]}
                <span className="text-lg font-black text-gray-500 uppercase tracking-widest ml-4">
                  / {room.type === 'Hostel' ? 'Year' : 'Month'}
                </span>
              </div>
              <div className="flex flex-wrap lg:justify-end gap-3">
                <span className="px-4 py-2 glass-card rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 border-none">{room.bedrooms} BHK</span>
                <span className="px-4 py-2 glass-card rounded-full text-[10px] font-black uppercase tracking-widest text-purple-400 border-none">{room.area}</span>
                <span className="px-4 py-2 glass-card rounded-full text-[10px] font-black uppercase tracking-widest text-pink-400 border-none">{room.type}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Images and Basic Info */}
          <div className="lg:col-span-2 space-y-12">
            {/* Main Image Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-[3rem] overflow-hidden shadow-2xl border-white/5 group"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <img
                  src={room.images && room.images.length > 0 ? room.images[currentImageIndex] : '/placeholder.jpg'}
                  alt={room.title || 'Room Image'}
                  className="w-full h-full object-cover cursor-zoom-in transition-transform duration-700 group-hover:scale-105"
                  onClick={() => openGallery(currentImageIndex)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c1d]/50 to-transparent" />

                <div className="absolute top-8 right-8 flex gap-4">
                  <button
                    onClick={toggleWishlist}
                    className="p-4 glass-card rounded-2xl hover:bg-white transition-all group/wish border-none shadow-2xl"
                  >
                    <svg className={`w-6 h-6 ${isInWishlist ? 'fill-red-500 stroke-red-500' : 'stroke-white group-hover/wish:stroke-red-500'} transition-colors`} fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Image Strip */}
              {room.images && room.images.length > 1 && (
                <div className="p-8 bg-white/5 border-t border-white/5">
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {room.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`flex-shrink-0 w-28 h-28 rounded-2xl overflow-hidden transition-all duration-300 ${idx === currentImageIndex ? 'ring-4 ring-blue-500 scale-105 shadow-2xl shadow-blue-500/20' : 'opacity-40 hover:opacity-100'
                          }`}
                      >
                        <img src={img || '/placeholder.jpg'} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Navigation Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-[3rem] overflow-hidden border-white/5"
            >
              <div className="flex px-10 border-b border-white/5 bg-white/[0.02]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-8 py-8 text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id ? 'text-blue-400' : 'text-gray-500 hover:text-white'
                      }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-12">
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-12"
                  >
                    <div className="p-10 glass-card bg-white/5 border-none rounded-[2.5rem]">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Property Manifesto</h4>
                      <p className="text-2xl text-white font-light leading-relaxed">
                        {room.description || 'This elite space is waiting to be defined by its next resident. Every detail is curated for an exceptional living experience.'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8 ml-2">Space Characteristics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                          { val: room.bedrooms, label: 'Sleep Areas', color: 'text-blue-400' },
                          { val: room.bathrooms, label: 'Bath Areas', color: 'text-purple-400' },
                          { val: room.area, label: 'Dimensions', color: 'text-pink-400' },
                          { val: room.type, label: 'Architecture', color: 'text-orange-400' }
                        ].map((stat, i) => (
                          <div key={i} className="p-8 glass-card bg-white/5 border-none rounded-3xl text-center hover:bg-white/10 transition-colors">
                            <div className={`text-2xl font-black mb-2 ${stat.color}`}>{stat.val || 'N/A'}</div>
                            <div className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8 ml-2">Identity Markers</h4>
                      <div className="flex flex-wrap gap-3">
                        {(room.tags || []).map(tag => (
                          <span key={tag} className="px-6 py-3 glass-card bg-white/5 border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'amenities' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-12"
                  >
                    <div>
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-8 ml-2">Elite Amenities</h4>
                      {room.amenities && room.amenities.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {room.amenities.map((amenity, idx) => (
                            <div key={idx} className="flex items-center gap-6 p-6 glass-card bg-white/5 border-none rounded-3xl group hover:bg-white/10 transition-all">
                              <div className="w-10 h-10 glass-card rounded-xl flex items-center justify-center border-none bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <span className="text-white font-bold uppercase tracking-widest text-xs">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 px-2 font-medium italic">Standard amenities included in base configuration.</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { label: 'Vehicle Storage', status: room.parking },
                        { label: 'Fauna Inclusive', status: room.petFriendly },
                        { label: 'Fully Configured', status: room.furnished }
                      ].map((feat, i) => (
                        <div key={i} className="flex items-center gap-4 p-6 glass-card bg-white/5 border-none rounded-3xl">
                          <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${feat.status ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`} />
                          <span className="text-gray-400 font-black uppercase tracking-widest text-[9px]">{feat.label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'location' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-12"
                  >
                    <div className="p-10 glass-card bg-white/5 border-none rounded-[3rem]">
                      <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Zone Coordinates</h4>
                      <p className="text-3xl text-white font-black tracking-tight mb-4">{room.location || 'Encrypted Location'}</p>
                      <p className="text-gray-400 font-medium leading-relaxed uppercase tracking-widest text-xs">Strategically positioned in the heart of the city's premium district.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="p-10 glass-card bg-blue-500/5 border-none rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-blue-500/20 group-hover:text-blue-500/40 transition-colors">
                          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" /></svg>
                        </div>
                        <h5 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6">Transit Hubs</h5>
                        <ul className="space-y-4 text-white font-bold text-sm tracking-widest">
                          <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> VANTAGE METRO – 500M</li>
                          <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> CENTRAL TERMINAL – 1.2KM</li>
                          <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> PRIVATE HELIPAD – AVALIABLE</li>
                        </ul>
                      </div>
                      <div className="p-10 glass-card bg-purple-500/5 border-none rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 text-purple-500/20 group-hover:text-purple-500/40 transition-colors">
                          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                        </div>
                        <h5 className="text-[11px] font-black text-purple-400 uppercase tracking-[0.3em] mb-6">Essential Access</h5>
                        <ul className="space-y-4 text-white font-bold text-sm tracking-widest">
                          <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> ELITE MEDICAL CENTER – 2KM</li>
                          <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> THE GRAND PLAZA – 800M</li>
                          <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> INTERNATIONAL ACADEMY – 4KM</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'contact' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-12"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-8 glass-card bg-white/5 border-none rounded-3xl flex items-center gap-6 group hover:bg-white/10 transition-all">
                        <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center border-none bg-blue-500/10 text-blue-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Secure Line</p>
                          <p className="text-xl font-black text-white">{room.contactNumber || 'REDACTED'}</p>
                        </div>
                      </div>
                      <div className="p-8 glass-card bg-white/5 border-none rounded-3xl flex items-center gap-6 group hover:bg-white/10 transition-all">
                        <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center border-none bg-purple-500/10 text-purple-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Encrypted Mail</p>
                          <p className="text-xl font-black text-white truncate max-w-[200px]">{room.contactEmail || 'REDACTED'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 pt-10">
                      <button
                        onClick={handleContactOwner}
                        className="flex-1 h-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:from-blue-500 hover:to-blue-600 transition-all shadow-2xl shadow-blue-900/40"
                      >
                        Initiate Audio Link
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
                        className="flex-1 h-20 glass-card bg-white/5 border-white/10 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-xs hover:bg-white/10 transition-all"
                      >
                        Transmit Text Signal
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Pricing and Quick Info */}
          <div className="lg:col-span-1 space-y-10">
            {/* Action Panel */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-10 rounded-[3rem] border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.5)] bg-gradient-to-b from-white/[0.05] to-transparent sticky top-32"
            >
              <div className="mb-12">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Financial Matrix</h4>
                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Monthly Rent</span>
                    <span className="text-2xl font-black text-white">{displayPrice(room.price, room.type).split('/')[0]}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Security Escrow</span>
                    <span className="text-2xl font-black text-white">{displayAmount(room.deposit)}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Maintenance</span>
                    <span className="text-2xl font-black text-white">{displayAmount(room.maintenance)}</span>
                  </div>
                </div>

                <div className="mt-12 p-8 glass-card bg-blue-500/10 border-blue-500/20 rounded-[2rem] text-center">
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Total Activation Cost</div>
                  <div className="text-5xl font-black text-white tracking-tighter">
                    ₹{(() => {
                      const rent = parseInt(formatPrice(room.price)) || 0;
                      const deposit = parseInt(formatPrice(room.deposit)) || 0;
                      return (rent + deposit).toLocaleString();
                    })()}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleBookNow}
                  className="w-full h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-xs hover:scale-[1.02] transition-all shadow-2xl shadow-purple-900/40 active:scale-95"
                >
                  Book Experience
                </button>
                <button
                  onClick={handleScheduleVisit}
                  className="w-full h-16 glass-card bg-white/5 border-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all"
                >
                  Schedule Inspection
                </button>
                <button
                  onClick={handleContactOwner}
                  className="w-full h-16 glass-card border-none bg-blue-500/10 text-blue-400 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-500/20 transition-all"
                >
                  Direct Manifest Contact
                </button>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="p-4 glass-card bg-white/5 border-none rounded-2xl text-center">
                  <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Availability</div>
                  <div className="text-xs font-bold text-white uppercase">{room.availableFrom || 'ASAP'}</div>
                </div>
                <div className="p-4 glass-card bg-white/5 border-none rounded-2xl text-center">
                  <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Verification</div>
                  <div className="text-xs font-bold text-green-400 uppercase">Trusted</div>
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