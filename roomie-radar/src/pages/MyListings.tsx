import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, MapPin, Home, BedDouble, Bath, Maximize, Eye } from "lucide-react";
import { deleteRoomListing, fetchUserListings, createRoomListing, updateRoomListing } from "../api";
import AddListingModal, { type NewListingInput } from "../components/AddListingModal";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../hooks/useToast";
import { PixelGrid } from "../components/ui";

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
    houseRules?: string;
    houseDetails?: string;
}

const MyListings = () => {
    const [listings, setListings] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);

    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        roomId: number | null;
        roomTitle: string;
    }>({
        isOpen: false,
        roomId: null,
        roomTitle: '',
    });

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
            // Failed to load your listings.
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number, title: string) => {
        setConfirmDialog({
            isOpen: true,
            roomId: id,
            roomTitle: title,
        });
    };

    const confirmDelete = async () => {
        if (!confirmDialog.roomId) return;
        showInfoToast("Deleting listing...", 0, true);
        try {
            await deleteRoomListing(confirmDialog.roomId);
            setListings(prev => prev.filter(room => room.id !== confirmDialog.roomId));
            hideToast();
            showSuccessToast("Listing deleted successfully!");
        } catch (err) {
            hideToast();
            showErrorToast("Failed to delete listing.");
        } finally {
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
            showErrorToast("Failed to save listing.");
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] pt-16 sm:pt-28 pb-20 px-6 relative overflow-hidden font-sans text-white">
            <PixelGrid />

            <div className="max-w-[1100px] mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <div className="text-trae-green font-mono text-[10px] mb-3 uppercase tracking-[0.2em] font-bold">Manage Listings</div>
                        <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tighter leading-tight">
                            My <span className="text-trae-green">Listings.</span>
                        </h2>
                        <p className="text-[13px] text-gray-500 font-medium max-w-xl leading-relaxed">View and manage your property listings and see how they're performing.</p>
                    </div>
                    <button
                        onClick={() => { setEditingRoom(null); setIsModalOpen(true); }}
                        className="group relative px-6 py-3 bg-trae-green rounded-xl text-black font-black uppercase tracking-widest text-[9px] flex items-center gap-2.5 transition-all hover:bg-emerald-400 hover:scale-105 active:scale-95 shadow-xl shadow-trae-green/5"
                    >
                        <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                        Add New Listing
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-32">
                        <div className="w-10 h-10 border-2 border-trae-green border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-[0.3em] font-bold animate-pulse">Loading your listings...</p>
                    </div>
                ) : listings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] shadow-2xl"
                    >
                        <div className="w-16 h-16 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Home className="w-8 h-8 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tighter">No Listings Found</h3>
                        <p className="text-[11px] text-gray-600 mb-8 font-medium uppercase tracking-widest">Start by creating your first property listing to share it with others.</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[9px] rounded-xl hover:bg-white hover:text-black transition-all"
                        >
                            Create Your First Listing
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                        {listings.map((room, i) => (
                            <motion.div
                                key={room.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-[#0a0a0a] border border-white/5 rounded-[1.5rem] overflow-hidden group hover:border-trae-green/30 transition-all duration-500 shadow-xl flex flex-col"
                            >
                                <div className="relative h-44 overflow-hidden bg-white/5">
                                    <img
                                        src={room.images?.[0] || 'https://images.unsplash.com/photo-1522771753033-6a586611f23c?w=800&q=80'}
                                        alt={room.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                                    <div className="absolute top-3 right-3 px-2 py-1 bg-trae-green rounded-lg text-black text-[9px] font-black uppercase tracking-widest shadow-xl">
                                        ₹{room.price.toLocaleString()}
                                    </div>
                                    <div className="absolute bottom-3 left-3 px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-[8px] font-black uppercase tracking-[0.2em]">
                                        {room.type}
                                    </div>
                                </div>

                                <div className="p-6 flex-grow flex flex-col">
                                    <h3 className="text-lg font-black text-white leading-tight mb-2 tracking-tight group-hover:text-trae-green transition-colors cursor-pointer truncate uppercase" onClick={() => navigate(`/room/${room.id}`)}>
                                        {room.title}
                                    </h3>

                                    <div className="flex items-center text-gray-600 mb-6 text-[10px] gap-2 font-bold uppercase tracking-widest">
                                        <MapPin className="w-3.5 h-3.5 text-trae-green opacity-60" />
                                        <span className="truncate">{room.location}</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mb-6">
                                        {[
                                            { icon: BedDouble, val: `${room.bedrooms} BHK`, color: 'text-trae-green' },
                                            { icon: Bath, val: `${room.bathrooms} BT`, color: 'text-blue-500' },
                                            { icon: Maximize, val: room.area, color: 'text-purple-500' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="p-2.5 bg-white/[0.02] rounded-xl border border-white/5 flex flex-col items-center gap-1">
                                                <item.icon className="w-3.5 h-3.5 text-gray-700" />
                                                <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest truncate w-full text-center">{item.val}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2.5 mt-auto">
                                        <button
                                            onClick={() => handleEdit(room)}
                                            className="flex-1 h-11 bg-white/5 border border-white/5 text-gray-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            Update
                                        </button>
                                        <button
                                            onClick={() => handleDelete(room.id, room.title)}
                                            className="w-11 h-11 bg-red-500/5 border border-red-500/10 text-red-500/60 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all active:scale-95"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => navigate(`/room/${room.id}`)}
                                            className="w-11 h-11 bg-white/5 border border-white/5 text-gray-600 rounded-xl flex items-center justify-center hover:text-trae-green transition-all active:scale-95"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
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

                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    showLoading={toast.showLoading}
                    onClose={hideToast}
                />

                <ConfirmDialog
                    isOpen={confirmDialog.isOpen}
                    title="Delete Listing"
                    message={`Are you sure you want to delete "${confirmDialog.roomTitle}"? This action cannot be undone.`}
                    confirmText="Delete Listing"
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
