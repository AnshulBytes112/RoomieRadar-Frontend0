import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getAllRooms, getAllRoommates, getUserStats } from '../api';
import { PixelGrid } from '../components/ui';
import { Building2, Users, FileText, Zap, Activity, Shield, Box, Server } from 'lucide-react';

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
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-[#050505] font-sans">
        <div className="w-12 h-12 border-2 border-trae-green border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-sm text-gray-500 font-mono uppercase tracking-[0.3em] font-bold animate-pulse">Accessing_Core_Systems...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-20 sm:pt-28 pb-20 px-6 relative overflow-hidden font-sans text-white">
      <PixelGrid />

      <div className="max-w-[1200px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="text-trae-green font-mono text-xs mb-3 uppercase tracking-[0.2em] font-bold">[07] ADMINISTRATIVE_ROOT</div>
          <h1 className="text-4xl md:text-6xl font-black mb-5 tracking-tighter leading-tight">
            System <span className="text-trae-green">Control.</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-trae-green/10 border border-trae-green/20 rounded-lg">
              <Shield className="w-3.5 h-3.5 text-trae-green" />
              <span className="text-[10px] font-black text-trae-green uppercase tracking-widest">Operator: {user?.name}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Status: Operational</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { label: 'ASSET_NODES', value: stats.totalRooms, icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/5' },
            { label: 'CITIZEN_PROFILES', value: stats.totalRoommates, icon: Users, color: 'text-trae-green', bg: 'bg-trae-green/5' },
            { label: 'TOTAL_ENTITIES', value: stats.totalUsers, icon: Server, color: 'text-purple-400', bg: 'bg-purple-500/5' },
            { label: 'SIGNAL_TRAFFIC', value: stats.totalBookings, icon: FileText, color: 'text-orange-400', bg: 'bg-orange-500/5' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2rem] shadow-xl group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 text-white opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
                <item.icon className="w-16 h-16" />
              </div>

              <div className="flex items-center gap-4 relative">
                <div className={`w-12 h-12 rounded-xl ${item.bg} border border-white/5 flex items-center justify-center ${item.color} group-hover:scale-105 transition-transform duration-500`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">{item.label}</p>
                  <p className="text-2xl font-black text-white tracking-tighter">{item.value.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Asset Influx */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-xl relative"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Node_Influx</h3>
              <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-[7px] font-black text-blue-400 uppercase tracking-widest">REAL_TIME</div>
            </div>

            <div className="space-y-3">
              {recentRooms.map((room: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-all group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-black transition-all flex-shrink-0">
                    <Box className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white uppercase tracking-wider truncate text-xs">{room.title || `Node_#${room.id}`}</p>
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-0.5 truncate">{room.location}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-black text-trae-green tracking-tighter">₹{room.price}</p>
                    <p className="text-[7px] font-black text-gray-700 uppercase tracking-widest flex items-center justify-end gap-1">
                      <Zap className="w-2 h-2" /> VAL_EST
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Entity Influx */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] shadow-xl relative"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Entity_Scan</h3>
              <div className="px-2 py-0.5 bg-trae-green/10 border border-trae-green/20 rounded-md text-[7px] font-black text-trae-green uppercase tracking-widest">INCOMING</div>
            </div>

            <div className="space-y-3">
              {recentRoommates.map((roommate: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-all group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-trae-green group-hover:bg-trae-green group-hover:text-black transition-all flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white uppercase tracking-wider truncate text-xs">{roommate.name || `EN_#${roommate.id}`}</p>
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-0.5 truncate">{roommate.occupation || 'GEN_LABOR'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-black text-white tracking-tighter">{roommate.age}</p>
                    <p className="text-[7px] font-black text-gray-700 uppercase tracking-widest">CYCLES</p>
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
