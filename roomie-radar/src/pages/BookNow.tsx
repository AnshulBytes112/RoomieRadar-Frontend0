import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  checkInDate: string;
}

interface Room {
  id: string;
  title: string;
  description: string;
  price: number;
  posterEmail: string;
  posterName: string;
}

const BookNow: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      checkInDate: ''
    }
  });

  // Mock room data - in a real app, fetch from API or context
  const room: Room | undefined = roomId ? {
    id: roomId,
    title: 'Cozy Shared Room in Downtown',
    description: 'A comfortable room in a shared apartment with great amenities.',
    price: 800,
    posterEmail: 'room_poster@example.com',
    posterName: 'John Doe'
  } : undefined;

  if (!room) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4"
      >
        <h1 className="text-4xl font-extrabold mb-8">Room Not Found</h1>
        <button
          onClick={() => navigate('/find-room')}
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold py-3 px-6 rounded-xl hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300"
        >
          Back to Rooms
        </button>
      </motion.div>
    );
  }

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Simulate API call to send request to room poster
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would send an email/notification to the poster
      console.log('Request sent to poster:', {
        roomId: room.id,
        requester: data,
        poster: { name: room.posterName, email: room.posterEmail }
      });
      
      // Mock successful request - in reality, wait for poster approval
      setSubmitStatus('success');
      reset();
    } catch (error) {
      console.error('Error sending request:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate('/find-room');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4"
    >
      <div className="w-full max-w-2xl">
        {/* Room Details Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-700/50 mb-8"
        >
          <h1 className="text-3xl font-extrabold mb-2">Request to Book: {room.title}</h1>
          <p className="text-gray-300 mb-4">{room.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-yellow-400">${room.price}/month</span>
            <span className="text-sm text-gray-400">Posted by {room.posterName}</span>
          </div>
        </motion.div>

        {/* Request Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-700/50"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Send Booking Request</h2>
          <p className="text-gray-400 mb-6 text-center">
            Your request will be sent to {room.posterName} for approval. They will review and respond to you.
          </p>
          
          {submitStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/20 border border-green-500 text-green-300 p-4 rounded-lg mb-6"
            >
              <p className="font-medium">Request sent successfully! {room.posterName} will contact you soon.</p>
            </motion.div>
          )}
          
          {submitStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6"
            >
              <p className="font-medium">Error sending request. Please try again.</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Your Full Name *
              </label>
              <input
                id="name"
                type="text"
                className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-600 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                placeholder="Enter your full name"
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
                aria-invalid={errors.name ? 'true' : 'false'}
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Your Email *
              </label>
              <input
                id="email"
                type="email"
                className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-600 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                placeholder="Enter your email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Invalid email address'
                  }
                })}
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium">
                Your Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-600 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                placeholder="Enter your phone number (optional)"
                {...register('phone', {
                  pattern: {
                    value: /^[\+]?[1-9][\d]{0,15}$/,
                    message: 'Invalid phone number'
                  }
                })}
              />
              {errors.phone && (
                <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="checkInDate" className="block text-sm font-medium">
                Preferred Check-in Date *
              </label>
              <input
                id="checkInDate"
                type="date"
                className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-600 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                {...register('checkInDate', {
                  required: 'Check-in date is required',
                  validate: value => {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return selectedDate >= today || 'Check-in date cannot be in the past';
                  }
                })}
                aria-invalid={errors.checkInDate ? 'true' : 'false'}
              />
              {errors.checkInDate && (
                <p className="text-red-400 text-sm mt-1">{errors.checkInDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium">
                Message to Room Owner (optional)
              </label>
              <textarea
                id="message"
                rows={4}
                className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-600 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 resize-none"
                placeholder="Tell the room owner why you're interested and any questions you have..."
                {...register('message', {
                  maxLength: {
                    value: 500,
                    message: 'Message cannot exceed 500 characters'
                  }
                })}
              />
              {errors.message && (
                <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>
              )}
            </div>

            <div className="flex gap-4">
              <motion.button
                type="button"
                onClick={handleGoBack}
                className="flex-1 bg-gray-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:bg-gray-700 focus:ring-2 focus:ring-yellow-500"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back to Rooms
              </motion.button>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:from-yellow-500 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? 'Sending Request...' : 'Send Booking Request'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BookNow;