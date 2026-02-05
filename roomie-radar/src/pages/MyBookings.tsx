import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserBookings, cancelBooking } from '../api';
import ConfirmDialog from '../components/ConfirmDialog';
import { PixelGrid } from '../components/ui';
import { MapPin, Eye, Trash2, Rocket } from 'lucide-react';

interface Booking {
  id: number;
  room: {
    id: number;
    title: string;
    location: string;
    price: number;
    images?: string[];
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
  checkInDate: string;
  checkOutDate?: string;
  phone?: string;
  message?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'SCHEDULE_INSPECTION';
  createdAt: string;
}

const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    bookingId: number | null;
    bookingTitle: string;
  }>({
    isOpen: false,
    bookingId: null,
    bookingTitle: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getUserBookings();
        setBookings(data);
      } catch (err) {
        // Failed to load your bookings
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate]);

  const handleCancelBooking = (bookingId: number, bookingTitle: string) => {
    setConfirmDialog({
      isOpen: true,
      bookingId,
      bookingTitle
    });
  };

  const confirmCancelBooking = async () => {
    if (!confirmDialog.bookingId) return;

    try {
      setCancelling(confirmDialog.bookingId);
      await cancelBooking(confirmDialog.bookingId);
      setBookings(prev => prev.map(booking =>
        booking.id === confirmDialog.bookingId
          ? { ...booking, status: 'CANCELLED' }
          : booking
      ));
    } catch (err) {
      alert('Failed to cancel booking.');
    } finally {
      setCancelling(null);
      setConfirmDialog({ isOpen: false, bookingId: null, bookingTitle: '' });
    }
  };

  const cancelConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, bookingId: null, bookingTitle: '' });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-400 border-yellow-500/20 bg-yellow-400/5';
      case 'CONFIRMED': return 'text-trae-green border-trae-green/20 bg-trae-green/5';
      case 'CANCELLED': return 'text-gray-600 border-white/5 bg-white/5';
      case 'SCHEDULE_INSPECTION': return 'text-blue-400 border-blue-500/20 bg-blue-400/5';
      default: return 'text-gray-500 border-white/5 bg-white/5';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex flex-col items-center justify-center bg-[#050505] font-sans">
        <div className="w-10 h-10 border-2 border-trae-green border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-[10px] text-gray-600 font-mono uppercase tracking-[0.3em] font-bold animate-pulse">Loading Bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-28 bg-[#050505] relative overflow-hidden font-sans text-white">
      <PixelGrid />

      <div className="max-w-[800px] mx-auto px-6 relative z-10 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="text-trae-green font-mono text-[10px] mb-3 uppercase tracking-[0.2em] font-bold">My Bookings</div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-tight">
            My <span className="text-trae-green">Bookings.</span>
          </h1>
          <p className="text-sm text-gray-500 font-medium max-w-xl">
            Track your room bookings and future living spaces.
          </p>
        </motion.div>

        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-[#0a0a0a] border border-white/5 rounded-[2rem] shadow-xl"
          >
            <Rocket className="w-12 h-12 text-gray-800 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">No Bookings</h2>
            <p className="text-gray-600 mb-8 text-sm font-medium">You haven't made any bookings yet.</p>
            <button
              onClick={() => navigate('/find-room')}
              className="px-8 py-3.5 bg-trae-green text-black rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-emerald-400 transition-all active:scale-95 shadow-xl"
            >
              Browse Experiences
            </button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[1.5rem] hover:border-trae-green/20 transition-all duration-500 shadow-xl relative overflow-hidden group"
              >
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {booking.room.images && booking.room.images.length > 0 && (
                    <div className="w-full sm:w-32 h-32 flex-shrink-0 overflow-hidden rounded-2xl border border-white/5">
                      <img
                        src={booking.room.images[0]}
                        alt={booking.room.title}
                        className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="flex-1 w-full min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <h3 className="text-xl font-black text-white tracking-tight group-hover:text-trae-green transition-colors uppercase truncate pr-2">
                        {booking.room.title}
                      </h3>
                      <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 text-[11px] mb-5 font-bold uppercase tracking-widest truncate">
                      <MapPin className="w-3.5 h-3.5 text-trae-green" />
                      {booking.room.location}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                        <p className="text-[7px] font-mono font-black text-gray-700 uppercase tracking-widest mb-0.5">Price</p>
                        <p className="font-black text-white text-xs">₹{booking.room.price.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                        <p className="text-[7px] font-mono font-black text-gray-700 uppercase tracking-widest mb-0.5">Check-in</p>
                        <p className="font-bold text-white text-xs whitespace-nowrap">{new Date(booking.checkInDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                      </div>
                      <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                        <p className="text-[7px] font-mono font-black text-gray-700 uppercase tracking-widest mb-0.5">Booking ID</p>
                        <p className="font-bold text-gray-400 text-xs">#RM-{booking.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/room/${booking.room.id}`)}
                          className="flex-1 h-full bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white hover:text-black transition-all flex items-center justify-center group/btn"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {booking.status === 'PENDING' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id, booking.room.title)}
                            disabled={cancelling === booking.id}
                            className="w-10 h-full bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Cancel Booking"
        message={`Are you sure you want to cancel your booking for "${confirmDialog.bookingTitle}"?`}
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        type="danger"
        onConfirm={confirmCancelBooking}
        onCancel={cancelConfirmDialog}
      />
    </div>
  );
};

export default MyBookings;