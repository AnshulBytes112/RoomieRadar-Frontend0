import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getPendingConnections, getSentRequests, acceptConnectionRequest, rejectConnectionRequest } from '../api';

const Connections = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
    const [inboxRequests, setInboxRequests] = useState<any[]>([]);
    const [sentRequests, setSentRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [inbox, sent] = await Promise.all([
                getPendingConnections(),
                getSentRequests()
            ]);
            setInboxRequests(inbox);
            setSentRequests(sent);
        } catch (error) {
            console.error('Failed to fetch connections:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAccept = async (id: number) => {
        try {
            setActionLoading(id);
            await acceptConnectionRequest(id);
            await fetchData(); // Refresh
        } catch (error) {
            console.error('Failed to accept request:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: number) => {
        try {
            setActionLoading(id);
            await rejectConnectionRequest(id);
            await fetchData(); // Refresh
        } catch (error) {
            console.error('Failed to reject request:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const tabs = [
        { id: 'inbox', label: 'Incoming Signals', count: inboxRequests.length },
        { id: 'sent', label: 'Transmitted Requests', count: sentRequests.length },
    ];

    return (
        <div className="min-h-screen bg-[#0c0c1d] pb-24 relative overflow-hidden">
            {/* Background blobs for depth */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
                <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
            </div>

            <div className="max-w-5xl mx-auto px-6 pt-32 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight uppercase mb-4">
                        Connection <span className="text-gradient">Matrix</span>
                    </h1>
                    <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xs">Manage your synchronization requests</p>
                </motion.div>

                {/* Tab Switcher */}
                <div className="flex gap-4 mb-10">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`relative px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all overflow-hidden ${activeTab === tab.id
                                    ? 'text-white'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white/5 border border-white/10 rounded-2xl -z-10"
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-3">
                                {tab.label}
                                <span className={`px-2 py-0.5 rounded-md text-[8px] ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500'}`}>
                                    {tab.count}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 animate-pulse">Scanning frequencies...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        <AnimatePresence mode="wait">
                            {(activeTab === 'inbox' ? inboxRequests : sentRequests).length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="glass-card p-20 rounded-[3rem] text-center border-white/5"
                                >
                                    <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px]">No active signals in this sector.</p>
                                </motion.div>
                            ) : (
                                (activeTab === 'inbox' ? inboxRequests : sentRequests).map((request, idx) => (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="glass-card p-8 rounded-[2.5rem] border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row items-center gap-8 group"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 p-0.5 shadow-2xl group-hover:scale-105 transition-transform">
                                            <div className="w-full h-full rounded-full bg-[#0c0c1d] flex items-center justify-center overflow-hidden">
                                                <span className="text-2xl font-black text-white">{(activeTab === 'inbox' ? request.fromUsername : request.toUsername)?.[0]?.toUpperCase()}</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 text-center md:text-left">
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
                                                {activeTab === 'inbox' ? request.fromUsername : request.toUsername}
                                            </h3>
                                            <p className="text-gray-400 text-sm italic font-medium leading-relaxed max-w-xl">
                                                "{request.message || 'Transmission initiated without data payload.'}"
                                            </p>
                                            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-1 rounded">
                                                    ID: {request.id}
                                                </span>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/10 px-2 py-1 rounded border border-blue-400/20">
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </span>
                                                {activeTab === 'sent' && (
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border ${request.status === 'PENDING' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
                                                            request.status === 'ACCEPTED' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
                                                                'text-red-400 bg-red-400/10 border-red-400/20'
                                                        }`}>
                                                        {request.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {activeTab === 'inbox' && (
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => handleReject(request.id)}
                                                    disabled={actionLoading === request.id}
                                                    className="h-14 px-8 rounded-2xl bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 font-black uppercase tracking-widest text-[10px] transition-all border border-transparent hover:border-red-500/20 disabled:opacity-50"
                                                >
                                                    Decline
                                                </button>
                                                <button
                                                    onClick={() => handleAccept(request.id)}
                                                    disabled={actionLoading === request.id}
                                                    className="h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-purple-900/40 disabled:opacity-50"
                                                >
                                                    Accept signal
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Connections;
