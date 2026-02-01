import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserBookings, cancelBooking, updateBooking } from '../api';
import ConfirmDialog from '../components/ConfirmDialog';

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
  const [error, setError] = useState<string | null>(null);
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
        console.error('Error fetching bookings:', err);
        setError('Failed to load your bookings');
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
      setConfirmDialog({ isOpen: false, bookingId: null, bookingTitle: '' });
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(null);
    }
  };

  const cancelConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, bookingId: null, bookingTitle: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'CONFIRMED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'CANCELLED': return 'bg-white/5 text-gray-500 border-white/10';
      case 'SCHEDULE_INSPECTION': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-white/5 text-gray-500 border-white/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-[#0c0c1d]">
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-8 shadow-2xl shadow-blue-500/20"></div>
        <p className="text-2xl text-gray-400 font-light animate-pulse uppercase tracking-[0.2em]">Syncing Bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-[#0c0c1d] px-4 sm:px-6">
        <div className="glass-card p-8 sm:p-12 rounded-2xl sm:rounded-[3rem] text-center max-w-xl w-full border-red-500/20 shadow-2xl">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-ping" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 sm:mb-4">Transmission Lost</h3>
          <p className="text-sm sm:text-base text-gray-400 mb-8 sm:mb-10 font-light">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 sm:px-10 sm:py-4 bg-red-600/20 border border-red-500/30 text-red-100 rounded-xl sm:rounded-2xl hover:bg-red-600/30 transition-all font-black uppercase tracking-widest text-[10px]"
          >
            Reconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-32 bg-[#0c0c1d] relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 pb-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 sm:mb-20"
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-3 sm:mb-6 tracking-tight">
            My <span className="text-gradient">Bookings</span>
          </h1>
          <p className="text-sm sm:text-xl md:text-2xl text-gray-400 font-light max-w-2xl leading-relaxed">
            Elegantly track your pending experiences and secured living spaces.
          </p>
        </motion.div>

        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 sm:py-32 glass-card rounded-2xl sm:rounded-[3rem] border-dashed border-white/5"
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 glass-card rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 border-white/10 shadow-2xl">
              <svg className="w-14 h-14 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-3 sm:mb-4">Void Archive</h2>
            <p className="text-sm sm:text-xl text-gray-500 mb-8 sm:mb-12 font-light">Your journey hasn't started yet. Let's find your first elite space.</p>
            <button
              onClick={() => navigate('/find-room')}
              className="px-8 py-4 sm:px-12 sm:py-5 bg-white text-midnight rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 shadow-2xl transition-all"
            >
              Browse Experiences
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-6 sm:gap-10">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card group p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[3rem] border-white/5 hover:border-blue-500/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/10 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-blue-500 to-purple-500 opacity-20" />

                <div className="flex flex-col md:flex-row items-start justify-between gap-6 sm:gap-10">
                  <div className="flex-1 space-y-4 sm:space-y-6">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight group-hover:text-blue-400 transition-colors uppercase">
                        {booking.room.title}
                      </h3>
                      <span className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] border shadow-xl ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 glass-card rounded-lg flex items-center justify-center border-white/10">
                        <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <span className="font-bold uppercase tracking-widest text-[10px] sm:text-sm">{booking.room.location}</span>
                    </div>

                    <div className="text-2xl sm:text-4xl font-black text-white tracking-tighter">
                      ₹{booking.room.price.toLocaleString()}
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-600 ml-2 sm:ml-3">per month</span>
                    </div>
                  </div>

                  {booking.room.images && booking.room.images.length > 0 && (
                    <div className="relative group/img flex-shrink-0">
                      <img
                        src={booking.room.images[0]}
                        alt={booking.room.title}
                        className="w-full sm:w-40 h-40 sm:h-40 rounded-2xl sm:rounded-[2rem] object-cover border-2 border-white/5 shadow-2xl group-hover/img:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-blue-500/10 rounded-2xl sm:rounded-[2rem] opacity-0 group-hover/img:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 my-6 sm:my-10 p-4 sm:p-6 glass-card bg-white/5 border-none rounded-2xl sm:rounded-[2rem]">
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Check-in</p>
                    <p className="font-bold text-white text-sm sm:text-lg">{new Date(booking.checkInDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Requested On</p>
                    <p className="font-bold text-white text-sm sm:text-lg">{new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Booking ID</p>
                    <p className="font-bold text-white text-sm sm:text-lg">#RM-{booking.id.toString().padStart(4, '0')}</p>
                  </div>
                </div>

                {booking.message && (
                  <div className="mb-6 sm:mb-10">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 sm:mb-4 ml-1">Transmission Message</p>
                    <p className="text-gray-400 font-light italic text-sm sm:text-lg leading-relaxed glass-card bg-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border-none border-l-4 border-blue-500/50">
                      "{booking.message}"
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-white/5">
                  <button
                    onClick={() => navigate(`/room/${booking.room.id}`)}
                    className="flex-1 h-12 sm:h-14 glass-card bg-white/5 text-blue-400 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border-none"
                  >
                    View Experience
                  </button>
                  {booking.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id, booking.room.title)}
                      disabled={cancelling === booking.id}
                      className="flex-1 h-12 sm:h-14 bg-red-500/10 text-red-500 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      {cancelling === booking.id ? 'Cancelling...' : 'Purge Request'}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Purge Booking Request"
        message={`Are you sure you want to cancel your booking for "${confirmDialog.bookingTitle}"? This action cannot be undone and the room owner will be notified of your cancellation.`}
        confirmText="Purge Request"
        cancelText="Keep Booking"
        type="danger"
        onConfirm={confirmCancelBooking}
        onCancel={cancelConfirmDialog}
      />
    </div>
  );
};

export default MyBookings;