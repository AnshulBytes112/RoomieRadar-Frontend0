import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type RoomCardProps = {
  room: {
    id: number;
    title: string;
    location: string;
    price: string;
    area: string;
    bedrooms: number;
    bathrooms: number;
    images: string[];
    tags: string[];
  };
  onOpenGallery: (startIndex: number) => void;
  canManage?: boolean;
  onDelete?: () => void;
};

const RoomCard = ({ room, onOpenGallery, canManage, onDelete }: RoomCardProps) => {
  const [hoveredIndex, setHoveredIndex] = useState(0);
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 overflow-hidden"
    >
      <div className="relative">
        <div className="aspect-[4/3] w-full overflow-hidden">
          <img
            src={room.images[hoveredIndex]}
            alt={room.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex gap-2">
            {room.images.slice(0, 4).map((img, idx) => (
              <button
                key={img}
                className={`w-10 h-10 rounded-lg overflow-hidden border ${idx === hoveredIndex ? 'border-white ring-2 ring-white/80' : 'border-white/50'}`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onFocus={() => setHoveredIndex(idx)}
                onClick={() => onOpenGallery(idx)}
                aria-label={`Preview image ${idx + 1}`}
              >
                <img src={img} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <button
            onClick={() => onOpenGallery(hoveredIndex)}
            className="px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs font-medium backdrop-blur hover:bg-black/70"
          >
            View Gallery
          </button>
        </div>

        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800 border border-gray-200">{room.bedrooms} BHK</span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white">Featured</span>
          {canManage && (
            <button
              onClick={onDelete}
              className="px-2 py-1 rounded-lg bg-red-600/90 text-white text-xs font-semibold hover:bg-red-600"
              aria-label="Delete listing"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{room.title}</h3>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(room.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                {room.location}
              </a>
            </p>
          </div>
          <div className="text-right">
            <div className="text-indigo-600 font-extrabold">{room.price}</div>
            <div className="text-xs text-gray-500">{room.area}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 my-4 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <span>{room.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
            <span>{room.bathrooms} Bath</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
            <span>{room.price}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {room.tags.map(tag => (
            <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">{tag}</span>
          ))}
        </div>

        <div className="mt-5 flex gap-3">
          <button 
            onClick={() => navigate(`/room/${room.id}`)}
            className="flex-1 py-2.5 rounded-xl border border-indigo-300 bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition"
          >
            View Details
          </button>
          <button 
            onClick={() => {
              // Navigate to room details page to see contact information
              navigate(`/room/${room.id}`);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-pink-600 transition"
          >
            Contact
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomCard;
