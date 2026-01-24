import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiHome } from "react-icons/fi";
import { deleteRoomListing, fetchUserListings, createRoomListing, updateRoomListing } from "../api";
import AddListingModal, { type NewListingInput } from "../components/AddListingModal";

interface Room {
    id: number;
    title: string;
    location: string;
    price: number;
    images: string[];
    type: string;
    bedrooms: number;
    bathrooms: number;
    area: string;
    // Add other fields as needed for the card
}

const MyListings = () => {
    const [listings, setListings] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchMyListings();
    }, []);

    const fetchMyListings = async () => {
        try {
            setLoading(true);
            const data = await fetchUserListings();
            setListings(data);
        } catch (err) {
            console.error("Error fetching my listings:", err);
            setError("Failed to load your listings. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;

        try {
            await deleteRoomListing(id);
            setListings(prev => prev.filter(room => room.id !== id));
        } catch (err) {
            console.error("Failed to delete room:", err);
            alert("Failed to delete listing.");
        }
    };

    const handleEdit = (room: Room) => {
        setEditingRoom(room);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingRoom(null);
    };

    const handleModalSubmit = async (data: NewListingInput) => {
        try {
            // Map frontend data to backend structure, handling the typo in backend 'availaibleFrom'
            const submissionData = {
                ...data,
                availaibleFrom: data.availableFrom,
            };

            if (editingRoom) {
                await updateRoomListing(editingRoom.id, submissionData);
            } else {
                await createRoomListing(submissionData as any);
            }

            await fetchMyListings();
            setIsModalOpen(false);
            setEditingRoom(null);
        } catch (err) {
            console.error("Failed to save listing:", err);
            alert("Failed to save listing. Please check the console for details.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0c0c1d] pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background blobs for depth */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
                <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                    <div>
                        <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
                            My <span className="text-gradient">Collection</span>
                        </h1>
                        <p className="text-xl text-gray-400 font-light">Elegantly manage your curated room listings and experiences.</p>
                    </div>
                    <button
                        onClick={() => { setEditingRoom(null); setIsModalOpen(true); }}
                        className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white font-bold transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center gap-3"
                    >
                        <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        New Artifact
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-32">
                        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-8 shadow-2xl shadow-blue-500/20"></div>
                        <p className="text-2xl text-gray-400 font-light animate-pulse">Retrieving your portfolio...</p>
                    </div>
                ) : error ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <div className="glass-card border-red-500/20 px-10 py-12 rounded-[2.5rem] max-w-xl mx-auto shadow-2xl">
                            <h3 className="text-2xl font-black text-white mb-4">Sync Error</h3>
                            <p className="text-gray-400 mb-8 font-light">{error}</p>
                            <button onClick={fetchMyListings} className="px-8 py-3 bg-red-600/20 border border-red-500/30 text-red-100 rounded-2xl hover:bg-red-600/30 transition-all font-bold">Retry Sync</button>
                        </div>
                    </motion.div>
                ) : listings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-32 glass-card rounded-[3rem] border-white/5 border-dashed"
                    >
                        <div className="mx-auto w-24 h-24 glass-card rounded-full flex items-center justify-center mb-8 border-white/10 shadow-2xl">
                            <FiHome className="w-10 h-10 text-gray-500" />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-4">Emtpy Portfolio</h3>
                        <p className="text-xl text-gray-500 mb-12 max-w-md mx-auto font-light">You haven't added any spaces to your collection yet. Start building your presence today.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-10 py-5 bg-white text-midnight font-black uppercase tracking-widest rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl"
                        >
                            Create First Listing
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
                        <AnimatePresence>
                            {listings.map((room, i) => (
                                <motion.div
                                    key={room.id}
                                    layout
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card rounded-[2.5rem] overflow-hidden group hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2 shadow-2xl"
                                >
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={room.images?.[0] || 'https://images.unsplash.com/photo-1522771753033-6a586611f23c?w=800&q=80'}
                                            alt={room.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c1d] to-transparent opacity-60" />
                                        <div className="absolute top-6 right-6 glass-card px-4 py-2 rounded-2xl text-sm font-black text-white shadow-xl border-white/20">
                                            ₹{room.price.toLocaleString()}/mo
                                        </div>
                                        <div className="absolute bottom-6 left-6 glass-card px-4 py-2 rounded-xl text-white text-[10px] font-black uppercase tracking-widest border-white/20">
                                            {room.type}
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <h3 className="text-2xl font-black text-white leading-tight mb-3 truncate group-hover:text-blue-400 transition-colors cursor-pointer" onClick={() => navigate(`/room/${room.id}`)}>
                                            {room.title}
                                        </h3>

                                        <div className="flex items-center text-gray-500 mb-6 text-sm">
                                            <FiMapPin className="w-4 h-4 mr-2 text-pink-500 flex-shrink-0" />
                                            <span className="truncate font-bold uppercase tracking-wider text-[11px]">{room.location}</span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 mb-8 p-4 glass-card bg-white/5 rounded-2xl border-white/5 border-none">
                                            <div className="text-center">
                                                <div className="text-blue-400 font-black text-sm">{room.bedrooms}</div>
                                                <div className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Beds</div>
                                            </div>
                                            <div className="text-center border-x border-white/10 px-2">
                                                <div className="text-purple-400 font-black text-sm">{room.bathrooms}</div>
                                                <div className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Baths</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-pink-400 font-black text-sm truncate px-1">{room.area}</div>
                                                <div className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Area</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4 border-t border-white/5">
                                            <button
                                                onClick={() => handleEdit(room)}
                                                className="flex-1 flex items-center justify-center gap-3 h-12 glass-card bg-white/5 text-blue-400 rounded-2xl hover:bg-white/10 transition-all font-black uppercase tracking-widest text-[10px] border-none"
                                            >
                                                <FiEdit2 className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(room.id)}
                                                className="flex-1 flex items-center justify-center gap-3 h-12 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 transition-all font-black uppercase tracking-widest text-[10px]"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                                Purge
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                <AddListingModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onSubmit={handleModalSubmit}
                    // @ts-ignore
                    initialData={editingRoom}
                    isEditing={!!editingRoom}
                />
            </div>
        </div>
    );
};

export default MyListings;
