import Footer from "@/components/Footer"
import { Link, useNavigate } from "react-router-dom"
import { addToFavorites } from "../api"
import { useAuth } from "../contexts/AuthContext"
import { Badge, Button, ScrollStack, ScrollStackItem, CardDescription, CardTitle } from "@/components/ui"
import { motion } from "framer-motion"
import {
  MapPin,
  Search,
  ShieldCheck,
  Users,
  Zap,
  Heart,
  ArrowRight,
  BedDouble,
  Bath,
  Maximize
} from "lucide-react"

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
        const fav = await addToFavorites(roomId);
        alert("Added to favorites! See console.");
        console.log(fav);
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
  ]

  return (
    <div className="min-h-screen bg-[#0c0c1d] text-white overflow-hidden font-sans">

      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden pt-28 md:pt-0">
        {/* Background Gradients & Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c0c1d]/60 to-[#0c0c1d] z-10" />
          <img
            src="https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-40 scale-105 animate-slow-zoom"
          />
          <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen animate-blob" />
          <div className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm border-blue-500/50 text-blue-200 backdrop-blur-md bg-blue-900/20 rounded-full uppercase tracking-widest font-semibold">
              #1 Room Finding App in Bangalore
            </Badge>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight tracking-tight">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Perfect Space</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
              Join thousands of happy roommates in Bangalore. We connect you with verified listings and compatible flatmates seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="h-14 px-8 text-lg rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-900/50 transition-all duration-300 hover:scale-105"
              >
                Detailed Search <Search className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="h-14 px-8 text-lg rounded-full text-white border border-white/20 hover:bg-white/10 hover:text-white backdrop-blur-sm transition-all duration-300"
              >
                List a Room <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Listings (Grid Layout) */}
      <section className="py-24 relative bg-[#0c0c1d]">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-8 md:mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400 mb-4">
                Featured Rooms
              </h2>
              <p className="text-gray-400 text-lg">Curated listings just for you</p>
            </div>
            <Link to="/find-room" className="hidden md:flex items-center text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              View All <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-8">
            {featuredRooms.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-[#181836]/50 border border-white/10 rounded-xl overflow-hidden group hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20 backdrop-blur-sm h-full flex flex-col">
                  <div className="relative h-32 md:h-64 overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToFavorites(room.id);
                      }}
                      className="absolute top-2 left-2 p-1.5 rounded-full bg-black/40 hover:bg-white/20 backdrop-blur-md text-white transition-colors"
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-3 md:p-5 flex-grow">
                    <div className="flex flex-col mb-1 md:mb-3">
                      <CardTitle className="text-xs md:text-xl font-bold text-white mb-0.5 line-clamp-1">{room.title}</CardTitle>
                      <p className="text-sm md:text-2xl font-black text-blue-400">{room.price.split('/')[0]}</p>
                    </div>

                    <CardDescription className="flex items-center text-gray-400 mb-2 md:mb-4 text-[9px] md:text-base">
                      <MapPin className="h-2.5 w-2.5 md:h-4 md:w-4 mr-1 text-blue-400" />
                      {room.location}
                    </CardDescription>

                    <div className="grid grid-cols-3 gap-1 md:gap-2 text-[7px] md:text-sm text-gray-300">
                      <div className="flex items-center gap-1 bg-white/5 py-0.5 md:py-1 px-1 md:px-2 rounded">
                        <BedDouble className="h-2.5 w-2.5 md:h-4 md:w-4 text-blue-400" />
                        <span>{room.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/5 py-0.5 md:py-1 px-1 md:px-2 rounded">
                        <Bath className="h-2.5 w-2.5 md:h-4 md:w-4 text-blue-400" />
                        <span>{room.bathrooms}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/5 py-0.5 md:py-1 px-1 md:px-2 rounded">
                        <Maximize className="h-2.5 w-2.5 md:h-4 md:w-4 text-blue-400" />
                        <span>{room.area.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 md:p-5 pt-0">
                    <Button className="w-full h-7 md:h-10 text-[9px] md:text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none shadow-md" onClick={() => handleViewDetails(room.id)}>
                      Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link to="/find-room" className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              View All Rooms <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us with ScrollStack (Features) */}
      <section className="bg-[#0F0F24] relative pb-[15rem] md:pb-[32rem]">
        <div className="container mx-auto px-6 pt-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border-purple-500/20">Why RoomieRadar?</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">More Than Just Listings</h2>
            <p className="text-gray-400 text-lg">We create connections that last. Swipe to see what makes us special.</p>
          </div>

          <div className="w-full max-w-6xl mx-auto">
            <ScrollStack useWindowScroll={true} itemStackDistance={80} stackPosition="25%">
              {/* Card 1: Verified via Background Checks */}
              <ScrollStackItem itemClassName="bg-[#1e1b4b] bg-gradient-to-br from-blue-900 to-slate-900 border-blue-500/20 overflow-hidden">
                <div className="flex flex-col-reverse md:flex-row h-full">
                  <div className="w-full md:w-1/2 md:p-8 flex flex-col justify-center text-left">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-blue-500/10">
                      <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
                    </div>
                    <h3 className="text-xl md:text-3xl font-bold text-white mb-3 md:mb-4">100% Verified Listings</h3>
                    <p className="text-sm md:text-lg text-gray-300 mb-4 md:mb-6 leading-relaxed">
                      We take safety seriously. Every host and room on our platform undergoes a strict manual verification process.
                    </p>
                    <ul className="space-y-2 md:space-y-3 text-xs md:text-gray-400">
                      <li className="flex items-center"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3" /> Identity verification checks</li>
                      <li className="flex items-center"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3" /> Property ownership validation</li>
                      <li className="flex items-center"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3" /> Scam-free guarantee</li>
                    </ul>
                  </div>
                  <div className="w-full md:w-1/2 relative h-32 md:h-auto overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1e1b4b] to-transparent z-10" />
                    <img
                      src="https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80"
                      alt="Security Check"
                      className="w-full h-full object-cover opacity-80"
                    />
                  </div>
                </div>
              </ScrollStackItem>

              {/* Card 2: AI Compatibility */}
              <ScrollStackItem itemClassName="bg-[#2e1065] bg-gradient-to-br from-purple-900 to-fuchsia-900 border-purple-500/20 overflow-hidden">
                <div className="flex flex-col-reverse md:flex-row h-full">
                  <div className="w-full md:w-1/2 md:p-8 flex flex-col justify-center text-left">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-500/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-purple-500/10">
                      <Users className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl md:text-3xl font-bold text-white mb-3 md:mb-4">Compatible Roommates</h3>
                    <p className="text-sm md:text-lg text-gray-300 mb-4 md:mb-6 leading-relaxed">
                      Living with someone is personal. Our AI matches you based on lifestyle, habits, and personality traits.
                    </p>
                    <ul className="space-y-2 md:space-y-3 text-xs md:text-gray-400">
                      <li className="flex items-center"><div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3" /> Lifestyle & habit matching</li>
                      <li className="flex items-center"><div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3" /> Chat before you book</li>
                      <li className="flex items-center"><div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3" /> Community events & meetups</li>
                    </ul>
                  </div>
                  <div className="w-full md:w-1/2 relative h-32 md:h-auto overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2e1065] to-transparent z-10" />
                    <img
                      src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80"
                      alt="Friends hanging out"
                      className="w-full h-full object-cover opacity-80"
                    />
                  </div>
                </div>
              </ScrollStackItem>

              {/* Card 3: Instant Booking */}
              <ScrollStackItem itemClassName="bg-[#431407] bg-gradient-to-br from-orange-900 to-red-900 border-orange-500/20 overflow-hidden">
                <div className="flex flex-col-reverse md:flex-row h-full">
                  <div className="w-full md:w-1/2 md:p-8 flex flex-col justify-center text-left">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500/20 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-orange-500/10">
                      <Zap className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
                    </div>
                    <h3 className="text-xl md:text-3xl font-bold text-white mb-3 md:mb-4">Instant Booking</h3>
                    <p className="text-sm md:text-lg text-gray-300 mb-4 md:mb-6 leading-relaxed">
                      Found the one? Secure it instantly using our safe payment gateway. No waiting for approvals.
                    </p>
                    <ul className="space-y-2 md:space-y-3 text-xs md:text-gray-400">
                      <li className="flex items-center"><div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-3" /> Secure payment hold</li>
                      <li className="flex items-center"><div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-3" /> 24-hour refund policy</li>
                      <li className="flex items-center"><div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-3" /> Digital lease signing</li>
                    </ul>
                  </div>
                  <div className="w-full md:w-1/2 relative h-32 md:h-auto overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#431407] to-transparent z-10" />
                    <img
                      src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1073&q=80"
                      alt="Digital Booking"
                      className="w-full h-full object-cover opacity-80"
                    />
                  </div>
                </div>
              </ScrollStackItem>
            </ScrollStack>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-t border-white/5 bg-[#0c0c1d] relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-black text-white mb-2">50k+</div>
              <div className="text-gray-500 font-medium tracking-wide">Active Users</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-white mb-2">10k+</div>
              <div className="text-gray-500 font-medium tracking-wide">Rooms Listed</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-white mb-2">100+</div>
              <div className="text-gray-500 font-medium tracking-wide">Cities</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-white mb-2">4.8/5</div>
              <div className="text-gray-500 font-medium tracking-wide">App Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-purple-900/40 z-0" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Ready to find your new home?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Join the fastest growing roommate community in India today.</p>
          <Button size="lg" onClick={handleGetStarted} className="h-16 px-10 rounded-full text-lg bg-white text-blue-900 hover:bg-blue-50 hover:text-blue-950 shadow-xl transition-all hover:scale-105 font-bold">
            Get Started Now
          </Button>
        </div>
      </section>

      <Footer />

    </div>
  )
}

export default Home
