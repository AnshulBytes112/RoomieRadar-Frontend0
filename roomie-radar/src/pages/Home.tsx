import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom"
import Carousel from "../components/Carousel"
import { fetchRoomDetails, searchRoommates, addToFavorites } from "../api"

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

  const handleBookRoom = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/booknow');
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

  const handleTryAPI = async (apiCall: () => Promise<any>) => {
    if (!user) {
      navigate('/login');
    } else {
      try {
        const result = await apiCall();
        alert("API called successfully! See console.");
        console.log(result);
      } catch (err) {
        console.error('API call failed:', err);
        alert('API call failed. Please try again.');
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
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 2,
      title: "Cozy 1BHK near Tech Park",
      location: "Electronic City, Bangalore",
      price: "₹18,000/month",
      area: "800 sq ft",
      bedrooms: 1,
      bathrooms: 1,
      image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
      id: 3,
      title: "Luxury 3BHK with Balcony",
      location: "Indiranagar, Bangalore",
      price: "₹45,000/month",
      area: "1800 sq ft",
      bedrooms: 3,
      bathrooms: 3,
      image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
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
  <div className="min-h-screen transition-colors duration-300 bg-[#0c0c1d] text-white">
      {/* Carousel Section */}
      <div className="mb-16">
        <Carousel />
      </div>

      {/* Rooms in Bangalore Section */}
      <div className="max-w-7xl mx-auto px-6 mb-20 ">
        {/* Section Header */}
        <div className="text-center mb-12">
<h2 className="text-5xl md:text-4xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-white via-yellow-200 to-orange-200 bg-clip-text text-transparent drop-shadow-2xl">
            Rooms in Bangalore
</h2>
          <p className="text-xl text-white-600 max-w-2xl mx-auto transition-colors duration-300">
            Discover the perfect accommodation in India's tech capital. From cozy studios to luxury apartments, find your ideal home.
          </p>
          <button
            className="mt-6 px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
            onClick={handleGetStarted}
          >
            Get Started
          </button>
        </div>

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {featuredRooms.map((room) => (
            <div key={room.id} className="bg-black rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-700 text-white">
              <div className="flex flex-col lg:flex-row h-full">
                {/* Room Image */}
                <div className="lg:w-2/5 h-64 lg:h-auto overflow-hidden">
                  <img 
                    src={room.image} 
                    alt={room.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Room Details */}
                <div className="lg:w-3/5 p-6 flex flex-col justify-between text-white">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">
                      {room.title}
                    </h3>
                    <p className="text-white mb-4 flex items-center transition-colors duration-300">
                      <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {room.location}
                    </p>
                    
                    {/* Room Specifications */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-white">{room.bedrooms} BHK</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="text-white">{room.area}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                        </svg>
                        <span className="text-white">{room.bathrooms} Bath</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        <span className="text-white">{room.price}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* View Details & Book Room Buttons */}
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      className="w-full py-2 px-4 rounded-lg border border-blue-700 bg-blue-900 text-white font-medium text-sm hover:bg-blue-800 hover:border-blue-400 transition-all duration-200"
                      onClick={() => handleViewDetails(room.id)}
                    >
                      View Details
                    </button>
                    <button
                      className="w-full py-2 px-4 rounded-lg border border-green-700 bg-green-900 text-white font-medium text-sm hover:bg-green-800 hover:border-green-400 transition-all duration-200"
                      onClick={handleBookRoom}
                    >
                      Book Room
                    </button>
                    <button
                      className="w-full py-2 px-4 rounded-lg border border-purple-700 bg-purple-900 text-white font-medium text-sm hover:bg-purple-800 hover:border-purple-400 transition-all duration-200"
                      onClick={() => handleAddToFavorites(room.id)}
                    >
                      Add to Favorites
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center">
          <Link 
            to="/find-room"
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <span>View More Rooms</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto px-6 mb-20 ">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white-800 mb-6 transition-colors duration-300">
            Welcome to RoomieRadar
          </h2>
          <p className="text-xl text-white-600 max-w-3xl mx-auto mb-12 transition-colors duration-300">
            Your trusted platform for finding the perfect accommodation and roommates in Bangalore. 
            Whether you're a student, professional, or newcomer to the city, we've got you covered.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-[#181836] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:-translate-y-2 border border-gray-700 text-white">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors duration-300">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 transition-colors duration-300">Find Your Perfect Room</h3>
            <p className="text-gray-300 transition-colors duration-300">
              Browse through thousands of verified listings with detailed information, photos, and virtual tours.
            </p>
            <button
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300"
              onClick={() => handleTryAPI(() => fetchRoomDetails(featuredRooms[0].id))}
            >Try Room API</button>
          </div>

          <div className="bg-[#181836] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:-translate-y-2 border border-gray-700 text-white">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors duration-300">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 transition-colors duration-300">Connect with Roommates</h3>
            <p className="text-gray-300 transition-colors duration-300">
              Find compatible roommates based on lifestyle, preferences, and compatibility scores.
            </p>
            <button
              className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300"
              onClick={() => handleTryAPI(() => searchRoommates())}
            >Try Roommate API</button>
          </div>

          <div className="bg-[#181836] p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center group hover:-translate-y-2 border border-gray-700 text-white">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors duration-300">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 transition-colors duration-300">Verified & Secure</h3>
            <p className="text-gray-300 transition-colors duration-300">
              All listings are verified and secure. Your safety and satisfaction are our top priorities.
            </p>
            <button
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300"
              onClick={() => handleTryAPI(() => addToFavorites(featuredRooms[0].id))}
            >Try Favorites API</button>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-white transition-colors duration-300">24/7 Support</h4>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-white transition-colors duration-300">Instant Booking</h4>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-white transition-colors duration-300">Favorites</h4>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="font-semibold text-white transition-colors duration-300">Fast Search</h4>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
