import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchRoomDetails, bookRoom } from '../api';
import { PixelGrid } from '../components/ui';
import { ChevronLeft, Info, Send, Calendar, User, Mail, Phone, MessageSquare, CheckCircle2, Lock } from 'lucide-react';

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
      phone: user?.phone || '',
      message: '',
      checkInDate: '',
      sendEmailConfirmation: true
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        message: '',
        checkInDate: '',
        sendEmailConfirmation: true
      });
    }
  }, [user, reset]);

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
        setError('Failed to load room details.');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  const formatPrice = (price: string | number | undefined): string => {
    if (!price && price !== 0) return "N/A";
    const numPrice = typeof price === "number" ? price : parseInt(String(price).replace(/[^\d]/g, ""), 10);
    if (isNaN(numPrice)) return "N/A";
    return `₹${numPrice.toLocaleString()}`;
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!user) { navigate('/login'); return; }
    if (!room) { setError('Room data not available'); return; }
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
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
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex flex-col items-center justify-center bg-[#050505] font-sans">
        <div className="w-12 h-12 border-2 border-trae-green border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-sm text-gray-500 font-mono uppercase tracking-[0.3em] font-bold animate-pulse">Loading Booking Details...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center bg-[#050505]">
        <div className="text-center bg-[#0a0a0a] border border-red-500/20 p-8 rounded-[2rem] max-w-lg mx-auto">
          <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter">Room Not Found</h3>
          <p className="text-sm text-gray-500 mb-8 font-medium">{error || 'The room you are looking for is unavailable.'}</p>
          <button onClick={() => navigate('/find-room')} className="px-8 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[9px]">Back to Search</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-16 sm:pt-28 pb-20 px-6 relative overflow-hidden font-sans text-white">
      <PixelGrid />

      <div className="max-w-[800px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <button
            onClick={() => navigate(`/room/${room.id}`)}
            className="flex items-center gap-2.5 text-gray-600 hover:text-trae-green mb-8 transition-all group font-black uppercase tracking-widest text-[9px]"
          >
            <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            Cancel
          </button>
          <div className="text-trae-green font-mono text-xs mb-3 uppercase tracking-[0.2em] font-bold">Booking Request</div>
          <h1 className="text-4xl md:text-5xl font-black mb-5 tracking-tighter leading-tight">
            Confirm your <span className="text-trae-green">Stay.</span>
          </h1>
        </motion.div>

        <div className="space-y-8">
          {/* Room Summary Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a0a] border border-white/5 p-6 sm:p-8 rounded-[2rem] shadow-xl relative overflow-hidden group"
          >
            <div className="flex flex-col sm:flex-row gap-8 items-center">
              <div className="w-full sm:w-48 aspect-square rounded-[1.5rem] overflow-hidden border border-white/10 flex-shrink-0">
                <img src={room.images[0]} alt={room.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="text-trae-green font-mono text-[9px] uppercase tracking-widest mb-1.5 font-black">Room ID // #RM-{room.id}</div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-3">{room.title}</h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 mb-5">
                  <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest text-blue-400">{room.location}</span>
                  <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[8px] font-black uppercase tracking-widest text-purple-400">{room.type}</span>
                </div>
                <div className="text-3xl font-black text-white tracking-tighter flex items-end gap-2 justify-center sm:justify-start">
                  {formatPrice(room.price)}
                  <span className="text-[10px] font-mono text-gray-600 font-bold mb-1">/ {room.type === 'Hostel' ? 'Year' : 'Month'}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0a0a0a] border border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-xl"
          >
            {submitStatus === 'success' ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-trae-green/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-trae-green/20">
                  <CheckCircle2 className="w-10 h-10 text-trae-green" />
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-3">Request Sent!</h3>
                <p className="text-sm text-gray-500 font-medium mb-10">Success. Redirecting to your bookings...</p>
                <div className="w-48 h-1.5 bg-white/5 rounded-full mx-auto overflow-hidden">
                  <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: 2 }} className="h-full bg-trae-green" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                <div className="p-5 bg-blue-400/5 border border-blue-400/10 rounded-2xl flex items-start gap-4">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium text-blue-400/80 leading-relaxed uppercase tracking-wider italic">
                    Great choice! The owner will be notified to review your booking request.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[
                    { name: 'name', label: 'Full Name', icon: User, type: 'text' },
                    { name: 'email', label: 'Email Address', icon: Mail, type: 'email' },
                    { name: 'phone', label: 'Phone Number', icon: Phone, type: 'tel' },
                    { name: 'checkInDate', label: 'Preferred Check-in Date', icon: Calendar, type: 'date' }
                  ].map((field) => {
                    const isPreFilled = (field.name === 'name' && !!user?.name) ||
                      (field.name === 'email' && !!user?.email) ||
                      (field.name === 'phone' && !!user?.phone);
                    return (
                      <div key={field.name} className="space-y-2.5">
                        <label className="text-[9px] font-mono font-black text-gray-600 uppercase tracking-widest ml-1">{field.label}</label>
                        <div className="relative flex items-center group">
                          <field.icon className={`absolute left-5 w-4.5 h-4.5 transition-colors ${isPreFilled ? 'text-trae-green' : 'text-gray-700 group-focus-within:text-trae-green'}`} />
                          <input
                            type={field.type}
                            readOnly={isPreFilled}
                            {...register(field.name as any, { required: field.name !== 'phone' ? `${field.label} is required` : false })}
                            className={`w-full pl-14 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-trae-green/50 outline-none transition-all font-bold text-white text-[13px] tracking-widest ${isPreFilled ? 'opacity-60 cursor-not-allowed' : ''}`}
                          />
                          {isPreFilled && <Lock className="absolute right-5 w-3.5 h-3.5 text-gray-700/50" />}
                        </div>
                        {(errors as any)[field.name] && <p className="text-[7px] font-black text-red-500 uppercase tracking-widest ml-1">{(errors as any)[field.name].message}</p>}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2.5">
                  <label className="text-[9px] font-mono font-black text-gray-600 uppercase tracking-widest ml-1">Add a Message (Optional)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-5 top-5 w-4.5 h-4.5 text-gray-700" />
                    <textarea
                      rows={3}
                      {...register('message')}
                      className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:border-trae-green/50 outline-none transition-all font-medium text-white text-[13px] leading-relaxed resize-none"
                      placeholder="Tell the owner a bit about yourself..."
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/[0.06] transition-all">
                  <input
                    type="checkbox"
                    {...register('sendEmailConfirmation')}
                    className="w-5 h-5 rounded bg-white/5 border-white/10 text-trae-green focus:ring-trae-green/50"
                  />
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Email Confirmation</p>
                    <p className="text-[8px] text-gray-700 font-medium uppercase tracking-widest mt-0.5">Send a copy of this request to my email</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/room/${room.id}`)}
                    className="flex-1 h-16 sm:h-14 bg-white/5 border border-white/10 text-gray-600 hover:text-white rounded-xl font-black uppercase tracking-[0.3em] text-[11px] sm:text-[9px] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[1.5] h-16 sm:h-14 bg-trae-green text-black rounded-xl font-black uppercase tracking-[0.3em] text-[11px] sm:text-[9px] hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? 'Sending...' : <><Send className="w-5 h-5 sm:w-4 sm:h-4" /> Confirm Booking</>}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookNow;