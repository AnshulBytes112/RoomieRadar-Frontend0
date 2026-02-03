import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  Search,
  ShieldCheck,
  Users,
  Zap,
  Heart,
  ArrowRight
} from "lucide-react"

import Footer from "@/components/Footer"
import { Link, useNavigate } from "react-router-dom"
import { addToFavorites } from "../api"
import { useAuth } from "../contexts/AuthContext"
import { PixelGrid } from "@/components/ui"

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  const handleGetStarted = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/find-room');
    }
  };

  const handleViewDetails = (roomId: number) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/room/${roomId}`);
    }
  };

  const handleAddToFavorites = async (roomId: number) => {
    if (!user) {
      navigate('/login');
    } else {
      try {
        await addToFavorites(roomId);
        alert("Added to favorites!");
      } catch (err) {
        console.error('Error adding to favorites:', err);
        alert('Failed to add to favorites. Please try again.');
      }
    }
  };

  const featuredRooms = [
    {
      id: 1,
      title: "Modern 2BHK in Koramangala",
      location: "Koramangala, Bangalore",
      price: "₹25,000/month",
      area: "1200 sq ft",
      bedrooms: 2,
      bathrooms: 2,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 2,
      title: "Cozy 1BHK near Tech Park",
      location: "Electronic City, Bangalore",
      price: "₹18,000/month",
      area: "800 sq ft",
      bedrooms: 1,
      bathrooms: 1,
      image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 3,
      title: "Luxury 3BHK with Balcony",
      location: "Indiranagar, Bangalore",
      price: "₹45,000/month",
      area: "1800 sq ft",
      bedrooms: 3,
      bathrooms: 3,
      image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 4,
      title: "Studio Apartment in City Center",
      location: "MG Road, Bangalore",
      price: "₹22,000/month",
      area: "600 sq ft",
      bedrooms: 1,
      bathrooms: 1,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    }
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: "100% Manual Verification",
      desc: "Every listing is verified by our core team.",
      tag: "CORE_ENGINE_VERIFICATION_ACTIVE",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1073&q=80"
    },
    {
      icon: Users,
      title: "AI-Powered Matching",
      desc: "Our algorithm matches lifestyles, not just budgets.",
      tag: "NEURAL_LINK_MATCHING_ACTIVE",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80"
    },
    {
      icon: Zap,
      title: "Instant Booking",
      desc: "Secure your spot in minutes with digital lease signing.",
      tag: "FAST_PATH_BOOKING_READY",
      image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden font-sans">
      <PixelGrid />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/40 to-[#050505] z-10" />
          <div className="absolute top-[15%] left-[10%] w-[35%] h-[50%] bg-trae-green/5 rounded-full blur-[100px] animate-blob" />
          <div className="absolute bottom-[15%] right-[10%] w-[35%] h-[50%] bg-blue-600/5 rounded-full blur-[100px] animate-blob animation-delay-2000" />
        </div>

        <div className="relative z-20 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 text-[10px] border border-trae-green/20 text-trae-green backdrop-blur-md bg-trae-green/5 rounded-full uppercase tracking-[0.2em] font-black">
              <Zap className="w-3 h-3" /> #1 Roommate Radar in Bangalore
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[0.95] tracking-tighter">
              Discover Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-trae-green via-teal-400 to-blue-500">Better Life.</span>
            </h1>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              Join thousands of happy roommates. We connect you with verified listings and compatible flatmates with precision and speed.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="h-16 sm:h-14 px-10 sm:px-8 rounded-xl bg-trae-green text-black hover:bg-emerald-400 shadow-xl shadow-trae-green/20 transition-all duration-300 font-black uppercase tracking-widest text-[11px] sm:text-xs flex items-center gap-2.5"
              >
                Find a Room <Search className="w-5 h-5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110" />
              </button>
              <button
                onClick={() => navigate('/find-roommate')}
                className="h-16 sm:h-14 px-10 sm:px-8 rounded-xl text-white border border-white/20 hover:bg-white/5 backdrop-blur-sm transition-all duration-300 font-black uppercase tracking-widest text-[11px] sm:text-xs flex items-center gap-2.5"
              >
                Find Roommates <ArrowRight className="w-5 h-5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20 relative bg-[#050505]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
            <div className="max-w-xl">
              <div className="text-trae-green font-mono text-sm mb-3 font-bold uppercase tracking-widest">Our Features</div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-5 tracking-tighter">
                Verified Every Step.
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                Our platform integrates seamlessly into your workflow, collaborating with you to maximize safety and efficiency.
              </p>
            </div>
            <Link to="/find-room" className="group flex items-center text-trae-green hover:text-emerald-400 font-black uppercase tracking-widest text-[10px] transition-colors">
              View All Listings <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRooms.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="group relative bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden hover:border-trae-green/30 transition-all duration-500 shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={room.image}
                    alt={room.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-transparent to-transparent" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToFavorites(room.id);
                    }}
                    className="absolute top-3 left-3 p-2.5 rounded-lg bg-black/40 hover:bg-trae-green/20 backdrop-blur-md text-white transition-colors border border-white/10"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-black text-white mb-2 truncate group-hover:text-trae-green transition-colors">{room.title}</h3>
                  <div className="flex items-center text-gray-500 text-[11px] mb-6 font-bold uppercase tracking-widest">
                    <MapPin className="w-3.5 h-3.5 mr-1.5 text-trae-green" />
                    {room.location}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-xl font-black text-white">{room.price.split('/')[0]}</span>
                    <button
                      className="px-5 h-11 bg-white/5 hover:bg-trae-green hover:text-black border border-white/10 text-white font-black uppercase tracking-widest text-[10px] rounded-lg transition-all flex items-center justify-center"
                      onClick={() => handleViewDetails(room.id)}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Section */}
      <section className="bg-[#0a0a0a] border-y border-white/5 relative py-24 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-trae-green font-mono text-sm mb-3 font-bold uppercase tracking-widest">Why Choose Us</div>
              <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tighter">
                Live <span className="text-trae-green">Autonomously</span>
              </h2>
              <p className="text-gray-500 text-base mb-10 leading-relaxed font-regular">
                Roomie Radar is your personal living assistant. We don't just find rooms; we help you find the people you'll thrive with.
              </p>

              <div className="space-y-6">
                {features.map((item, i) => (
                  <motion.div
                    key={i}
                    className={`flex gap-5 p-4 rounded-2xl transition-all duration-500 cursor-pointer ${activeFeature === i ? 'bg-white/5 border border-white/10 shadow-2xl translate-x-2' : 'opacity-40 hover:opacity-60'}`}
                    onClick={() => setActiveFeature(i)}
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${activeFeature === i ? 'bg-trae-green text-black scale-110 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-trae-green/5 border border-trae-green/10 text-trae-green'}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-base font-black mb-1 uppercase tracking-tight transition-colors duration-500 ${activeFeature === i ? 'text-white' : 'text-gray-400'}`}>{item.title}</h4>
                      <p className="text-gray-600 text-xs font-medium">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative aspect-square sm:h-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, y: -15 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full bg-[#050505] rounded-[2.5rem] overflow-hidden border border-white/10 relative group shadow-[0_40px_100px_rgba(0,0,0,0.5)] flex flex-col"
                >
                  <div className="relative h-[65%] w-full overflow-hidden">
                    <motion.img
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 0.8 }}
                      transition={{ duration: 1.4, ease: "easeOut" }}
                      src={features[activeFeature].image}
                      className="absolute inset-0 w-full h-full object-cover"
                      alt={features[activeFeature].title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
                  </div>

                  <div className="flex-1 p-10 sm:p-12 flex flex-col justify-center bg-[#050505]">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-trae-green shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />
                        <span className="text-trae-green font-mono text-[9px] tracking-[0.4em] uppercase font-black">
                          {features[activeFeature].tag}
                        </span>
                      </div>
                      <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-3">
                        {features[activeFeature].title}
                      </h3>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Decorative Glow */}
              <div className="absolute -inset-20 bg-trae-green/5 rounded-full blur-[120px] pointer-events-none opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#050505] border-b border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Users", value: "50k+" },
              { label: "Rooms Listed", value: "10k+" },
              { label: "Cities", value: "100+" },
              { label: "Rating", value: "4.8/5" }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-5xl font-black text-white mb-1 tracking-tighter">
                  {stat.value}
                </div>
                <div className="text-trae-green/50 font-mono text-[9px] uppercase tracking-widest font-black">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 relative overflow-hidden text-center bg-[#050505]">
        <div className="container mx-auto px-6 relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter">
            Ready to <span className="text-trae-green">Radar?</span>
          </h2>
          <p className="text-base text-gray-500 mb-12 max-w-xl mx-auto font-medium">
            Join the fastest growing roommate community. Live better, together.
          </p>
          <button
            onClick={handleGetStarted}
            className="h-16 px-12 rounded-xl text-xs bg-trae-green text-black hover:bg-emerald-400 shadow-xl shadow-trae-green/10 transition-all hover:scale-105 font-black uppercase tracking-widest"
          >
            Get Started Now
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home
