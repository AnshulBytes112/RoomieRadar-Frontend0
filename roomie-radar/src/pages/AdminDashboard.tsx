import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getAllRooms, getAllRoommates, getUserStats } from '../api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalRoommates: 0,
    totalUsers: 0,
    totalBookings: 0,
  });
  const [recentRooms, setRecentRooms] = useState<any[]>([]);
  const [recentRoommates, setRecentRoommates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [rooms, roommates, userStats] = await Promise.all([
          getAllRooms(),
          getAllRoommates(),
          getUserStats(),
        ]);

        setRecentRooms(rooms.slice(0, 5));
        setRecentRoommates(roommates.slice(0, 5));
        setStats({
          totalRooms: rooms.length,
          totalRoommates: roommates.length,
          totalUsers: userStats?.totalUsers || 0,
          totalBookings: userStats?.totalBookings || 0,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0c1d]">
        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-8 shadow-2xl shadow-blue-500/20"></div>
        <p className="text-2xl text-gray-400 font-light animate-pulse uppercase tracking-[0.2em]">Accessing Core...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c1d] pb-24 relative overflow-hidden">
      {/* Background blobs for depth */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight uppercase mb-4">
            System <span className="text-gradient">Control</span>
          </h1>
          <p className="text-xl text-gray-500 font-light uppercase tracking-widest">Operator: {user?.name}</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { label: 'Asset Nodes', value: stats.totalRooms, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Citizen Profiles', value: stats.totalRoommates, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0', color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Total Entities', value: stats.totalUsers, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z', color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Transmission Log', value: stats.totalBookings, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-orange-400', bg: 'bg-orange-500/10' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 rounded-[2.5rem] border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className={`p-5 rounded-2xl ${item.bg} ${item.color} shadow-2xl transition-transform group-hover:scale-110`}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-3xl font-black text-white tracking-tighter">{item.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-10 rounded-[3rem] border-white/5 shadow-2xl"
          >
            <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-wide">Recent Influx: Nodes</h3>
            <div className="space-y-4">
              {recentRooms.map((room: any, index: number) => (
                <div key={index} className="flex items-center gap-5 p-5 glass-card bg-white/5 border-none rounded-[2rem] hover:bg-white/10 transition-colors group">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-[1.2rem] flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-white uppercase tracking-wider truncate text-sm">{room.title || `Node ${room.id}`}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{room.location || 'ZONE: UNKNOWN'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-blue-400 tracking-tighter">₹{room.price || '0'}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-10 rounded-[3rem] border-white/5 shadow-2xl"
          >
            <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-wide">Recent Influx: Entities</h3>
            <div className="space-y-4">
              {recentRoommates.map((roommate: any, index: number) => (
                <div key={index} className="flex items-center gap-5 p-5 glass-card bg-white/5 border-none rounded-[2rem] hover:bg-white/10 transition-colors group">
                  <div className="w-14 h-14 bg-green-500/10 rounded-[1.2rem] flex items-center justify-center text-green-400 group-hover:bg-green-500/20">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-white uppercase tracking-wider truncate text-sm">{roommate.name || `EN-ID: ${roommate.id}`}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{roommate.occupation || 'FUNCTION: UNSET'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-green-400 tracking-tighter">{roommate.age || '?'}</p>
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Cycles</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
