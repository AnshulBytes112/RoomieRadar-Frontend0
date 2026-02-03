import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GalleryModal from "../components/GalleryModal.tsx";
import { fetchRoomDetails, addToFavorites, removeFromFavorites, checkIfFavorited } from "../api";
import { useAuth } from "../contexts/AuthContext";
import { PixelGrid } from "../components/ui";
import { MapPin, Heart, Share2, Phone, ChevronLeft, BedDouble, Bath, Maximize, CheckCircle2, Zap, ShieldCheck, Car, Dog, Armchair, Info, Check, X, Mail, FileText, ScrollText } from "lucide-react";

type RoomListing = {
  id: number;
  title: string;
  location: string;
  price: string | number;
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
  availaibleFrom?: string; // Support backend typo
  deposit?: string | number;
  maintenance?: string | number;
  parking?: boolean;
  petFriendly?: boolean;
  furnished?: boolean;
  contactNumber?: string;
  contactEmail?: string;
  totalOccupancy?: number;
  occupiedCount?: number;
  houseRules?: string;
  houseDetails?: string;
  postedBy?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    occupation?: string;
    roomateProfile?: {
      avatar?: string;
      occupation?: string;
    }
  };
};

const RoomDetails = ({ room: initialRoom }: { room?: RoomListing }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<RoomListing | null>(initialRoom || null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      if (room && !loading) return;
      try {
        setLoading(true);
        setError(null);
        const roomId = parseInt(id || "0", 10);
        if (!roomId) { setError("Invalid room ID"); return; }
        const fetchedRoom = await fetchRoomDetails(roomId);
        setRoom(fetchedRoom);
        if (user) {
          try {
            const isFavorited = await checkIfFavorited(roomId);
            setIsInWishlist(isFavorited);
          } catch (err) { setIsInWishlist(false); }
        }
      } catch (err) {
        setError("Failed to fetch room details.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id, user]);

  const toggleWishlist = async () => {
    if (!user) { navigate("/login"); return; }
    if (!room) return;
    try {
      if (isInWishlist) { await removeFromFavorites(room.id); setIsInWishlist(false); }
      else { await addToFavorites(room.id); setIsInWishlist(true); }
    } catch (err) { alert("Wishlist sync failed."); }
  };

  const handleBookNow = () => {
    if (!user) { navigate("/login"); return; }
    if (!room) return;
    navigate(`/book-now/${room.id}`);
  };

  const displayPrice = (price: string | number | undefined): string => {
    if (!price && price !== 0) return "N/A";
    const numPrice = typeof price === "number" ? price : parseInt(String(price).replace(/[^\d]/g, ""), 10);
    if (isNaN(numPrice)) return "N/A";
    return `₹${numPrice.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex flex-col items-center justify-center bg-[#050505] font-sans">
        <div className="w-10 h-10 border-2 border-trae-green border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[11px] text-gray-600 font-mono uppercase tracking-[0.3em] font-black animate-pulse">Loading Room Details...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-[#050505]">
        <div className="text-center bg-[#0a0a0a] border border-white/5 p-10 rounded-[2rem] shadow-xl max-w-lg mx-auto">
          <Zap className="w-10 h-10 text-red-500/40 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Room Not Found</h3>
          <p className="text-sm text-gray-600 mb-8 font-medium">{error || 'This listing is no longer available.'}</p>
          <button onClick={() => navigate('/find-room')} className="px-8 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[11px]">Back to Search</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-28 bg-[#050505] pb-32 relative overflow-hidden font-sans text-white">
      <PixelGrid />

      <div className="max-w-[1100px] mx-auto px-6 relative z-10">
        <button
          onClick={() => navigate('/find-room')}
          className="flex items-center gap-2 text-gray-700 hover:text-trae-green mb-8 transition-all group font-black uppercase tracking-widest text-[11px]"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-trae-green font-mono text-[10px] mb-2 uppercase tracking-[0.2em] font-bold">Room Details</div>
              <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tighter leading-tight uppercase">
                {room.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-600 mb-6 font-bold uppercase tracking-widest text-[11px]">
                <MapPin className="w-4 h-4 text-trae-green" />
                {room.location}
              </div>

              <div className="flex flex-wrap gap-2.5">
                {[
                  { icon: BedDouble, val: `${room.bedrooms} BHK`, color: 'text-blue-400' },
                  { icon: Maximize, val: room.area, color: 'text-purple-400' },
                  { icon: Bath, val: `${room.bathrooms} Baths`, color: 'text-teal-400' }
                ].map((item, i) => (
                  <span key={i} className={`px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.color} flex items-center gap-2`}>
                    <item.icon className="w-4 h-4" /> {item.val}
                  </span>
                ))}
                <span className="px-3 py-1.5 bg-trae-green/10 border border-trae-green/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-trae-green">{room.type}</span>
                {room.totalOccupancy && (
                  <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-400">
                    Occupancy: {room.occupiedCount}/{room.totalOccupancy} occupied
                  </span>
                )}
              </div>
            </motion.div>

            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0a0a0a] rounded-[2rem] overflow-hidden border border-white/5 shadow-xl relative group"
            >
              <div className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden">
                <img
                  src={room.images?.[currentImageIndex] || 'https://images.unsplash.com/photo-1522771753033-6a586611f23c'}
                  alt={room.title}
                  className="w-full h-full object-cover transition-transform duration-700 opacity-80 group-hover:opacity-100 cursor-pointer"
                  onClick={() => setIsGalleryOpen(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={toggleWishlist} className={`p-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl hover:bg-trae-green hover:text-black transition-all ${isInWishlist ? 'text-trae-green fill-current' : ''}`}>
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white hover:text-black transition-all">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 flex gap-2">
                  {room.images?.slice(0, 4).map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-8 bg-trae-green' : 'w-3 bg-white/20'}`} />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Description & House Details */}
              <div className="space-y-8">
                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-trae-green/10 to-transparent" />
                  <h4 className="text-[11px] font-mono text-gray-700 font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-trae-green" /> Room Overview
                  </h4>
                  <p className="text-[15px] text-gray-400 font-medium leading-relaxed italic mb-8">
                    "{room.description || 'A comfortable living space located in a prime area.'}"
                  </p>

                  {room.houseDetails && (
                    <div className="mt-6 pt-6 border-t border-white/5">
                      <h5 className="text-[10px] font-black text-trae-green uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" /> Detailed Description
                      </h5>
                      <p className="text-[14px] text-gray-400 leading-relaxed font-medium">
                        {room.houseDetails}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/5">
                    {[
                      { icon: Car, label: 'Parking', value: room.parking },
                      { icon: Dog, label: 'Pets', value: room.petFriendly },
                      { icon: Armchair, label: 'Furnished', value: room.furnished },
                    ].map((char) => (
                      <div key={char.label} className={`flex items-center gap-2.5 ${char.value ? 'text-trae-green' : 'text-gray-700'}`}>
                        {char.value ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 opacity-30" />}
                        <span className="text-[9px] font-black uppercase tracking-widest">{char.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* House Rules Card - Updated to match System_Overview style */}
                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-trae-green/20 to-transparent" />
                  <h4 className="text-[11px] font-mono text-gray-700 font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <ScrollText className="w-4 h-4 text-trae-green" /> House Rules
                  </h4>
                  {room.houseRules ? (
                    <div className="space-y-4">
                      <p className="text-[15px] text-gray-400 font-medium leading-relaxed italic">
                        "{room.houseRules}"
                      </p>
                      <div className="pt-4 border-t border-white/5 flex items-center gap-2 text-[9px] font-black text-trae-green uppercase tracking-widest">
                        <ShieldCheck className="w-3.5 h-3.5" /> Please follow these rules
                      </div>
                    </div>
                  ) : (
                    <p className="text-[12px] text-gray-600 italic">No specific house rules specified. Please respect the property.</p>
                  )}
                </div>
              </div>

              {/* Infrastructure & Amenities */}
              <div className="space-y-8">
                <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                  <h4 className="text-[11px] font-mono text-gray-700 font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-trae-green" /> Amenities
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {room.amenities && room.amenities.length > 0 ? (
                      room.amenities.map((am, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl group hover:border-trae-green/20 transition-all">
                          <CheckCircle2 className="w-3.5 h-3.5 text-trae-green opacity-40 group-hover:opacity-100 transition-opacity" />
                          <span className="text-white font-bold uppercase tracking-widest text-[10px] truncate">{am}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-700 uppercase font-black tracking-widest">Basic Amenities</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 space-y-6">
              <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-trae-green/20 to-transparent" />

                <div className="mb-8">
                  <h4 className="text-[11px] font-black text-gray-700 uppercase tracking-[0.3em] mb-3">Pricing Details</h4>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black text-white uppercase tracking-tighter">{displayPrice(room.price)}</span>
                    <span className="px-2.5 py-1 bg-trae-green/10 text-trae-green text-[10px] font-black uppercase tracking-widest rounded border border-trae-green/20">Available</span>
                  </div>
                  <p className="text-[10px] font-mono font-bold text-gray-600 uppercase tracking-widest">Rental Cycle: Monthly</p>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                      <p className="text-[9px] font-mono text-gray-700 mb-1 uppercase font-black">Security Deposit</p>
                      <p className="font-bold text-white text-[11px]">{displayPrice(room.deposit)}</p>
                    </div>
                    <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                      <p className="text-[9px] font-mono text-gray-700 mb-1 uppercase font-black">Maintenance</p>
                      <p className="font-bold text-white text-[11px]">{displayPrice(room.maintenance)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                      <p className="text-[9px] font-mono text-gray-700 mb-1 uppercase font-black">Available From</p>
                      <p className="font-bold text-white text-[11px] uppercase truncate">{room.availableFrom || room.availaibleFrom || 'Now'}</p>
                    </div>
                    <div className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                      <p className="text-[9px] font-mono text-gray-700 mb-1 uppercase font-black">Room ID</p>
                      <p className="font-bold text-gray-500 text-[11px]">#RM-{room.id}</p>
                    </div>
                  </div>
                </div>

                <button onClick={handleBookNow} className="w-full h-16 bg-trae-green text-black rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-emerald-400 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2.5">
                  <Zap className="w-4 h-4" /> Book This Room
                </button>
              </div>

              <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] shadow-xl">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                  <div className="w-14 h-14 rounded-2xl bg-[#050505] border border-white/10 flex items-center justify-center overflow-hidden">
                    {room.postedBy?.avatar ? (
                      <img src={room.postedBy.avatar} alt={room.postedBy.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5 text-xl font-black text-trae-green uppercase">
                        {(room.postedBy?.name || 'O').charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-700 uppercase tracking-widest mb-1">Listing owner</div>
                    <div className="text-lg font-black text-white uppercase tracking-tighter leading-none hover:text-trae-green cursor-pointer transition-colors" onClick={() => navigate(`/user/${room.postedBy?.id}`)}>
                      {room.postedBy?.name || 'Verified Member'}
                    </div>
                    {room.postedBy?.occupation && (
                      <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1.5">
                        {room.postedBy.occupation}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <button
                    onClick={() => navigate(`/user/${room.postedBy?.id}`)}
                    className="w-full py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-[9px] font-black text-white uppercase tracking-widest hover:bg-white/5 transition-all"
                  >
                    View Full Profile
                  </button>
                </div>

                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1 opacity-50 mb-5">Contact Protocol</p>

                <div className="space-y-3">
                  <a
                    href={`tel:${room.contactNumber}`}
                    className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl group/item hover:border-trae-green/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:bg-trae-green group-hover/item:text-black transition-all">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Call Now</p>
                      <p className="text-xs font-bold text-white group-hover/item:text-trae-green transition-colors">{room.contactNumber || 'Not Provided'}</p>
                    </div>
                  </a>

                  <a
                    href={`mailto:${room.contactEmail}`}
                    className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl group/item hover:border-blue-500/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:bg-blue-500 group-hover/item:text-white transition-all">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Send Email</p>
                      <p className="text-xs font-bold text-white group-hover/item:text-blue-400 transition-colors truncate max-w-[150px]">{room.contactEmail || 'Not Provided'}</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="p-6 bg-trae-green/5 border border-trae-green/10 rounded-[2rem] flex items-start gap-4">
                <Info className="w-4 h-4 text-trae-green mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                  <span className="text-trae-green font-black uppercase">Note:</span> Security deposit and maintenance fees will be confirmed during the booking process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Price Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-t border-white/5 lg:hidden">
        <div className="px-6 h-18 flex items-center justify-between max-w-[1100px] mx-auto">
          <div>
            <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">Monthly Rent</p>
            <p className="text-xl font-black text-white">{displayPrice(room.price)}</p>
          </div>
          <button
            onClick={handleBookNow}
            className="px-8 h-12 bg-trae-green text-black rounded-xl font-black uppercase tracking-widest text-[11px] hover:bg-emerald-400 transition-all shadow-lg active:scale-95"
          >
            Book Now
          </button>
        </div>
      </div>

      {isGalleryOpen && room.images && (
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