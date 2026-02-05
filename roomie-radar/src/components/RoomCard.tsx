import React from 'react';
import { MapPin, Bath, BedDouble, Maximize, Heart, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface RoomCardProps {
  room: {
    id: number;
    title: string;
    location: string;
    price: number;
    area: string;
    bedrooms: number;
    bathrooms: number;
    images: string[];
    tags: string[];
    type: string;
    genderPreference?: string;
    postedBy?: {
      id: number;
      name: string;
      avatar?: string;
      deleted?: boolean;
    };
  };
  onOpenGallery?: (id: number) => void;
  onBooking?: (id: number) => void;
  onFavorite?: (id: number) => void;
  isFavorited?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onOpenGallery,
  onFavorite,
  isFavorited = false
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onOpenGallery) {
      onOpenGallery(room.id);
    } else {
      navigate(`/room/${room.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] overflow-hidden group hover:border-trae-green/30 transition-all duration-500 shadow-xl flex flex-col h-full"
    >
      {room.postedBy && (
        <div
          className="bg-[#050505] px-4 py-3 border-b border-white/5 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/user/${room.postedBy?.id}`);
          }}
        >
          {room.postedBy.avatar ? (
            <img
              src={room.postedBy.avatar}
              alt={room.postedBy.name}
              className="w-7 h-7 rounded-lg object-cover border border-white/10"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-trae-green/10 flex items-center justify-center text-[10px] font-black text-trae-green uppercase border border-trae-green/20">
              {room.postedBy.name.charAt(0)}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-none mb-0.5">
              {room.postedBy.deleted ? 'Account Deactivated' : 'Posted by'}
            </span>
            <span className="text-[11px] font-black text-white uppercase tracking-tighter group-hover:text-trae-green transition-colors">
              {room.postedBy.deleted ? 'Deleted User' : room.postedBy.name}
            </span>
          </div>
        </div>
      )}

      {/* Image Section */}
      <div
        className="relative h-48 sm:h-56 bg-white/5 overflow-hidden cursor-pointer"
        onClick={handleCardClick}
      >
        <img
          src={room.images[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"}
          alt={room.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-transparent to-transparent pointer-events-none" />

        <div className="absolute top-3 left-3 flex items-center">
          <span className="px-3 py-1.5 bg-trae-green rounded-lg text-black text-[10px] font-black uppercase tracking-widest shadow-lg">
            {room.type}
          </span>
          {room.genderPreference && (
            <span className="ml-2 px-3 py-1.5 bg-pink-500 rounded-lg text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
              {room.genderPreference === 'Any' ? 'Any Gender' : `${room.genderPreference} Only`}
            </span>
          )}
        </div>

        {onFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(room.id);
            }}
            className={`absolute top-3 right-3 p-2.5 backdrop-blur-md border border-white/10 rounded-xl transition-all group/fav active:scale-90 ${isFavorited
              ? 'bg-trae-green text-black border-trae-green'
              : 'bg-black/40 text-white hover:bg-trae-green hover:text-black hover:border-trae-green'
              }`}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : 'group-hover/fav:fill-current'}`} />
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h3
            className="text-xl font-black text-white leading-tight tracking-tight group-hover:text-trae-green transition-colors truncate cursor-pointer pr-2"
            onClick={handleCardClick}
          >
            {room.title}
          </h3>
          <div className="text-xl font-black text-white tracking-tighter flex-shrink-0">
            ₹{room.price.toLocaleString()}
            <span className="text-[10px] text-gray-500 font-bold uppercase ml-1">/Mo</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-500 text-[11px] mb-6">
          <MapPin className="w-3.5 h-3.5 text-trae-green" />
          <span className="uppercase tracking-widest font-bold truncate">{room.location}</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-8">
          <div className="flex flex-col gap-1.5 p-3 bg-white/5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
            <BedDouble className="w-4 h-4 text-trae-green/80" />
            <span className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-widest">{room.bedrooms} Bed</span>
          </div>
          <div className="flex flex-col gap-1.5 p-3 bg-white/5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
            <Bath className="w-4 h-4 text-blue-400/80" />
            <span className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-widest">{room.bathrooms} Bath</span>
          </div>
          <div className="flex flex-col gap-1.5 p-3 bg-white/5 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
            <Maximize className="w-4 h-4 text-purple-400/80" />
            <span className="text-[8px] font-mono font-bold text-gray-500 uppercase tracking-widest truncate">{room.area}</span>
          </div>
        </div>

        <button
          onClick={handleCardClick}
          className="w-full h-12 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white hover:text-black hover:border-white active:scale-95 flex items-center justify-center gap-2 group/btn"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
      </div>
    </motion.div >
  );
};

export default RoomCard;
