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
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
                        <p className="mt-2 text-gray-600">Manage your room listings and availability.</p>
                    </div>
                    <button
                        onClick={() => { setEditingRoom(null); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-1 font-semibold"
                    >
                        <FiPlus className="w-5 h-5" />
                        Add New Listing
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-red-100">
                        <p className="text-red-500">{error}</p>
                        <button onClick={fetchMyListings} className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium">Try Again</button>
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-dashed border-gray-300">
                        <div className="mx-auto w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                            <FiHome className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Listings Yet</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">You haven't posted any rooms yet. Start earning by listing your spare room today!</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
                        >
                            <FiPlus className="w-5 h-5" />
                            Create your first listing
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence>
                            {listings.map((room) => (
                                <motion.div
                                    key={room.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group border border-gray-100"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={room.images?.[0] || 'https://images.unsplash.com/photo-1522771753033-6a586611f23c?w=800&q=80'}
                                            alt={room.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-indigo-600 shadow-sm">
                                            ₹{room.price.toLocaleString()}/mo
                                        </div>
                                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-xs font-medium uppercase tracking-wider">
                                            {room.type}
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => navigate(`/room/${room.id}`)}>{room.title}</h3>
                                        </div>

                                        <div className="flex items-center text-gray-500 mb-4 text-sm">
                                            <FiMapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                            <span className="line-clamp-1">{room.location}</span>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl">
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-gray-900">{room.bedrooms}</span> Bed
                                            </div>
                                            <div className="w-px h-4 bg-gray-300"></div>
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-gray-900">{room.bathrooms}</span> Bath
                                            </div>
                                            <div className="w-px h-4 bg-gray-300"></div>
                                            <div className="flex items-center gap-1">
                                                <span className="font-bold text-gray-900">{room.area}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2 border-t border-gray-100">
                                            <button
                                                onClick={() => handleEdit(room)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors font-medium text-sm"
                                            >
                                                <FiEdit2 className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(room.id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* We need to update AddListingModal to support editing and initial data */}
                <AddListingModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    onSubmit={handleModalSubmit}
                    // @ts-ignore - Assuming we will add this prop next
                    initialData={editingRoom}
                    isEditing={!!editingRoom}
                />
            </div>
        </div>
    );
};

export default MyListings;
