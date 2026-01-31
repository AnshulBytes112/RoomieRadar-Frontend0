import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiHome } from "react-icons/fi";
import { deleteRoomListing, fetchUserListings, createRoomListing, updateRoomListing } from "../api";
import AddListingModal, { type NewListingInput } from "../components/AddListingModal";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../hooks/useToast";

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
    
    // Confirm dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        roomId: number | null;
        roomTitle: string;
    }>({
        isOpen: false,
        roomId: null,
        roomTitle: '',
    });
    
    // Toast hook
    const { toast, showSuccessToast, showErrorToast, showInfoToast, hideToast } = useToast();

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

    const handleDelete = (id: number, title: string) => {
        // Open custom confirmation dialog
        setConfirmDialog({
            isOpen: true,
            roomId: id,
            roomTitle: title,
        });
    };

    const confirmDelete = async () => {
        if (!confirmDialog.roomId) return;

        // Show loading toast
        showInfoToast("Deleting listing...", 0, true);

        try {
            await deleteRoomListing(confirmDialog.roomId);
            setListings(prev => prev.filter(room => room.id !== confirmDialog.roomId));
            // Hide loading toast and show success
            hideToast();
            showSuccessToast("Listing deleted successfully!");
        } catch (err) {
            console.error("Failed to delete room:", err);
            // Hide loading toast and show error
            hideToast();
            showErrorToast("Failed to delete listing. Please try again.");
        } finally {
            // Close dialog
            setConfirmDialog({
                isOpen: false,
                roomId: null,
                roomTitle: '',
            });
        }
    };

    const cancelDelete = () => {
        setConfirmDialog({
            isOpen: false,
            roomId: null,
            roomTitle: '',
        });
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
                showSuccessToast("Listing updated successfully!");
            } else {
                await createRoomListing(submissionData as any);
                showSuccessToast("Listing created successfully!");
            }

            await fetchMyListings();
            setIsModalOpen(false);
            setEditingRoom(null);
        } catch (err) {
            console.error("Failed to save listing:", err);
            showErrorToast("Failed to save listing. Please check the console for details.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0c0c1d] pt-20 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background blobs for depth - softer */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] mix-blend-screen animate-blob" />
                <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px] mix-blend-screen animate-blob animation-delay-2000" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                            My <span className="text-blue-400">Listings</span>
                        </h1>
                        <p className="text-lg text-gray-400">Manage your property listings and connect with potential tenants</p>
                    </div>
                    <button
                        onClick={() => { setEditingRoom(null); setIsModalOpen(true); }}
                        className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white font-medium transition-all hover:from-blue-400 hover:to-blue-500 hover:scale-105 flex items-center gap-2 shadow-lg"
                    >
                        <FiPlus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        Add New Listing
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-32">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-lg text-gray-400">Loading your listings...</p>
                    </div>
                ) : error ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <div className="glass-card border-red-500/20 px-8 py-10 rounded-2xl max-w-md mx-auto">
                            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiHome className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Error Loading Listings</h3>
                            <p className="text-gray-400 mb-6 text-sm">{error}</p>
                            <button onClick={fetchMyListings} className="px-6 py-2 bg-red-600/20 border border-red-500/30 text-red-100 rounded-xl hover:bg-red-600/30 transition-all font-medium text-sm">Try Again</button>
                        </div>
                    </motion.div>
                ) : listings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-32 glass-card rounded-2xl border-white/5 border-dashed"
                    >
                        <div className="mx-auto w-16 h-16 glass-card rounded-full flex items-center justify-center mb-6 border-white/10">
                            <FiHome className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">No Listings Yet</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">Start by adding your first property listing to reach potential tenants.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-8 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-all"
                        >
                            Create Your First Listing
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                        <AnimatePresence>
                            {listings.map((room, i) => (
                                <motion.div
                                    key={room.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card rounded-xl overflow-hidden group hover:border-blue-500/20 transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={room.images?.[0] || 'https://images.unsplash.com/photo-1522771753033-6a586611f23c?w=800&q=80'}
                                            alt={room.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c1d]/80 to-transparent" />
                                        <div className="absolute top-4 right-4 px-3 py-1 glass-card rounded-lg text-sm font-medium text-white">
                                            ₹{room.price.toLocaleString()}/mo
                                        </div>
                                        <div className="absolute bottom-4 left-4 px-3 py-1 glass-card rounded-lg text-white text-xs font-medium uppercase">
                                            {room.type}
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-white leading-tight mb-2 truncate group-hover:text-blue-400 transition-colors cursor-pointer" onClick={() => navigate(`/room/${room.id}`)}>
                                            {room.title}
                                        </h3>

                                        <div className="flex items-center text-gray-400 mb-4 text-sm">
                                            <FiMapPin className="w-4 h-4 mr-2 text-pink-400 flex-shrink-0" />
                                            <span className="truncate font-medium">{room.location}</span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 mb-6 p-3 glass-card bg-white/5 rounded-lg">
                                            <div className="text-center">
                                                <div className="text-blue-400 font-bold text-sm">{room.bedrooms}</div>
                                                <div className="text-[9px] font-medium text-gray-500 uppercase">Beds</div>
                                            </div>
                                            <div className="text-center border-x border-white/10 px-2">
                                                <div className="text-purple-400 font-bold text-sm">{room.bathrooms}</div>
                                                <div className="text-[9px] font-medium text-gray-500 uppercase">Baths</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-pink-400 font-bold text-sm truncate px-1">{room.area}</div>
                                                <div className="text-[9px] font-medium text-gray-500 uppercase">Area</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(room)}
                                                className="flex-1 flex items-center justify-center gap-2 h-10 glass-card bg-white/5 text-blue-400 rounded-lg hover:bg-white/10 transition-all font-medium text-sm"
                                            >
                                                <FiEdit2 className="w-3 h-3" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(room.id, room.title)}
                                                className="flex-1 flex items-center justify-center gap-2 h-10 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all font-medium text-sm"
                                            >
                                                <FiTrash2 className="w-3 h-3" />
                                                Delete
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
                
                {/* Toast Notification */}
                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    showLoading={toast.showLoading}
                    onClose={hideToast}
                />
                
                {/* Custom Confirmation Dialog */}
                <ConfirmDialog
                    isOpen={confirmDialog.isOpen}
                    title="Delete Listing"
                    message={`Are you sure you want to delete "${confirmDialog.roomTitle}"? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    type="danger"
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            </div>
        </div>
    );
};

export default MyListings;
