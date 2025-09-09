import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

const Carousel = () => {
  // Simulated authentication check (replace with real auth logic)
  const isAuthenticated = !!localStorage.getItem('userToken');
  const handleGetStarted = () => {
    if (!isAuthenticated) {
      window.location.href = '/login'; // or '/signin'
    } else {
      window.location.href = '/find-room';
    }
  };
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const slides = [
    {
      id: 1,
      title: "Find Your Perfect Home",
      description: "Discover amazing rooms and apartments in Bangalore's best neighborhoods",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 2,
      title: "Connect with Roommates",
      description: "Find compatible roommates who share your lifestyle and preferences",
      image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 3,
      title: "Verified & Secure",
      description: "All listings are verified and secure for your peace of mind",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    }
  ]

  const goToSlide = useCallback((slideIndex: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentSlide(slideIndex)
    setTimeout(() => setIsTransitioning(false), 600)
  }, [isTransitioning])

  const goToNext = useCallback(() => {
    if (isTransitioning) return
    goToSlide((currentSlide + 1) % slides.length)
  }, [currentSlide, slides.length, goToSlide, isTransitioning])

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return
    goToSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1)
  }, [currentSlide, slides.length, goToSlide, isTransitioning])

  useEffect(() => {
    const interval = setInterval(goToNext, 5000)
    return () => clearInterval(interval)
  }, [goToNext])

  return (
    <div className="relative h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
    key={currentSlide}
    custom={currentSlide}
    initial={{ x: 300, opacity: 0 }}        // start off-screen right
    animate={{ x: 0, opacity: 1 }}          // slide into place
    exit={{ x: -300, opacity: 0 }}          // slide out to left
    transition={{ duration: 0.6, ease: "easeInOut" }}
    className="absolute inset-0"
  > 
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 bg-gradient-to-r from-white via-yellow-200 to-orange-200 bg-clip-text text-transparent drop-shadow-2xl"
            >
              {slides[currentSlide].title}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-2xl md:text-3xl lg:text-4xl font-light mb-12 max-w-4xl bg-gradient-to-r from-gray-200 to-gray-300 bg-clip-text text-transparent"
            >
              {slides[currentSlide].description}
            </motion.p>

            {/* Get Started Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mb-20"
            >
              <button
                className="bg-white/20 backdrop-blur-lg border border-white/30 text-white font-bold py-4 px-8 rounded-2xl text-xl hover:bg-white/30 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
                onClick={handleGetStarted}
              >
                Get Started
              </button>
            </motion.div>
          </div>

          {/* Floating Decorative Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 1.0 }}
            className="absolute bottom-40 right-20 w-24 h-24 bg-yellow-400/20 rounded-full backdrop-blur-sm"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 1.2 }}
            className="absolute top-1/2 right-1/4 w-16 h-16 bg-orange-400/20 rounded-full backdrop-blur-sm"
          ></motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        disabled={isTransitioning}
        className="absolute left-8 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-lg text-white p-4 rounded-full hover:bg-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-20"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        disabled={isTransitioning}
        className="absolute right-8 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-lg text-white p-4 rounded-full hover:bg-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-20"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            disabled={isTransitioning}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            } disabled:cursor-not-allowed`}
          />
        ))}
      </div>
    </div>
  )
}

export default Carousel
