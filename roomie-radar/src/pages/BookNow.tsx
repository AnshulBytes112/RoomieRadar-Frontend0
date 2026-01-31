import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchRoomDetails, bookRoom } from '../api';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  checkInDate: string;
  sendEmailConfirmation: boolean;
}

interface Room {
  id: number;
  title: string;
  description: string;
  price: string | number;
  location: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  type: "Private" | "Shared" | "Studio" | "Hostel";
  images: string[];
  contactEmail?: string;
  contactNumber?: string;
}

const BookNow: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      message: '',
      checkInDate: '',
      sendEmailConfirmation: true
    }
  });

  // Fetch room details on component mount
  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) {
        setError('Invalid room ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const roomData = await fetchRoomDetails(parseInt(roomId, 10));
        setRoom(roomData);
      } catch (err) {
        console.error('Error fetching room details:', err);
        setError('Failed to load room details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  // Format price for display
  const formatPrice = (price: string | number | undefined): string => {
    if (!price && price !== 0) return "0";
    const numPrice = typeof price === "number" ? price : parseInt(String(price).replace(/[^\d]/g, ""), 10);
    if (isNaN(numPrice)) return "0";
    return `₹${numPrice.toLocaleString()}`;
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!room) {
      setError('Room data not available');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Call the booking API
      await bookRoom({
        roomId: room.id,
        name: data.name,
        email: data.email,
        phone: data.phone || user?.phone || '',
        checkInDate: data.checkInDate,
        message: data.message,
        sendEmailConfirmation: data.sendEmailConfirmation
      });

      setSubmitStatus('success');
      reset();

      // Redirect to bookings page after 2 seconds
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    } catch (error) {
      console.error('Error sending booking request:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    if (room) {
      navigate(`/room/${room.id}`);
    } else {
      navigate('/find-room');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading room details...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error || !room) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Room Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The room you\'re looking for doesn\'t exist or has been removed.'}</p>
          <button
            onClick={() => navigate('/find-room')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Rooms
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-[#0c0c1d] pb-20 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <button
            onClick={handleGoBack}
            className="flex items-center gap-3 text-gray-500 hover:text-white mb-8 transition-colors group font-black uppercase tracking-widest text-[10px]"
          >
            <div className="w-8 h-8 glass-card rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-all border-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            Back to Space
          </button>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight uppercase leading-none">
            Finalize <span className="text-gradient">Booking</span>
          </h1>
        </motion.div>

        {/* Room Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-card p-10 rounded-[3rem] border-white/5 mb-10 group overflow-hidden relative shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 opacity-20" />

          <div className="flex flex-col md:flex-row items-center gap-10">
            {room.images && room.images.length > 0 && (
              <div className="w-full md:w-56 h-56 flex-shrink-0">
                <img
                  src={room.images[0]}
                  alt={room.title}
                  className="w-full h-full rounded-[2.5rem] object-cover border-2 border-white/5 shadow-2xl group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            )}
            <div className="flex-1 space-y-4">
              <h2 className="text-3xl font-black text-white tracking-tight uppercase group-hover:text-blue-400 transition-colors">
                {room.title}
              </h2>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 glass-card rounded-full text-[10px] font-black uppercase tracking-widest text-pink-400 border-none">{room.location}</span>
                <span className="px-4 py-2 glass-card rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 border-none">{room.bedrooms} BHK</span>
                <span className="px-4 py-2 glass-card rounded-full text-[10px] font-black uppercase tracking-widest text-purple-400 border-none">{room.type}</span>
              </div>
              <div className="text-4xl font-black text-white tracking-tighter pt-2">
                {formatPrice(room.price)}
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-3">
                  / {room.type === "Hostel" ? "Year" : "Month"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Booking Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass-card p-12 rounded-[3.5rem] border-white/5 shadow-2xl"
        >
          {/* Informational Message */}
          <div className="mb-8 p-6 glass-card bg-blue-500/5 border border-blue-500/20 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium mb-2">
                  Booking requests help owners respond faster and do not require payment.
                </p>
              </div>
            </div>
          </div>

          {submitStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-10 bg-green-500/10 border border-green-500/20 p-8 rounded-[2.5rem] text-center"
            >
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <h3 className="text-2xl font-black text-white uppercase">Booking Request Sent</h3>
                <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold uppercase rounded-full">
                  Pending
                </span>
              </div>
              <p className="text-gray-400 font-medium tracking-wide mb-4">
                The owner usually responds within 24 hours.
              </p>
              <p className="text-gray-500 text-sm">
                You can track your request in "My Bookings".
              </p>
            </motion.div>
          )}

          {submitStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-10 bg-red-500/10 border border-red-500/20 p-8 rounded-[2.5rem] text-center"
            >
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01" />
                </svg>
              </div>
              <p className="text-red-400 font-black uppercase tracking-widest text-xs">Signal Failed</p>
              <p className="text-gray-400 mt-2">Could not establish booking link. Re-attempt required.</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Identity Confirmation</label>
                <div className="relative group/input">
                  <input
                    type="text"
                    className="w-full p-5 rounded-2xl bg-white/[0.02] border border-white/5 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all outline-none text-white font-bold"
                    placeholder="Candidate Full Name"
                    {...register('name', { required: 'Name is required' })}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Contact Protocol (Email)</label>
                <input
                  type="email"
                  className="w-full p-5 rounded-2xl bg-white/[0.02] border border-white/5 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all outline-none text-white font-bold"
                  placeholder="name@domain.com"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Comms Frequency (Phone)</label>
                <input
                  type="tel"
                  className="w-full p-5 rounded-2xl bg-white/[0.02] border border-white/5 focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all outline-none text-white font-bold"
                  placeholder="+91 XXXXX XXXXX"
                  {...register('phone')}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Activation Date</label>
                <input
                  type="date"
                  className="w-full p-5 rounded-2xl bg-white/[0.02] border border-white/5 focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all outline-none text-white font-bold"
                  {...register('checkInDate', { required: 'Check-in date is required' })}
                />
                {errors.checkInDate && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.checkInDate.message}</p>}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Direct Signal Message</label>
              <textarea
                rows={4}
                className="w-full p-6 rounded-3xl bg-white/[0.02] border border-white/5 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all outline-none text-white font-medium resize-none leading-relaxed"
                placeholder="Declare your intent and any special requirements for this elite space..."
                {...register('message', { maxLength: { value: 500, message: 'Message cannot exceed 500 characters' } })}
              />
              {errors.message && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-1">{errors.message.message}</p>}
            </div>

            {/* Email Confirmation Checkbox */}
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-6 glass-card bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all">
                <div className="flex items-center justify-center mt-1">
                  <input
                    type="checkbox"
                    id="sendEmailConfirmation"
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-0 focus:ring-offset-[#0c0c1d] cursor-pointer"
                    {...register('sendEmailConfirmation')}
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="sendEmailConfirmation" className="text-white font-medium cursor-pointer flex items-center gap-2">
                    Send email confirmation
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </label>
                  <p className="text-gray-500 text-sm mt-1">
                    Receive a confirmation email with your booking details and tracking information
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-6 pt-6">
              <button
                type="button"
                onClick={handleGoBack}
                className="flex-1 h-20 glass-card bg-white/5 border-white/10 text-gray-400 hover:text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] transition-all"
              >
                Abort Protocol
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-purple-900/40 disabled:opacity-50"
              >
                {isSubmitting ? 'Transmitting...' : 'Initiate Secure Booking'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default BookNow;