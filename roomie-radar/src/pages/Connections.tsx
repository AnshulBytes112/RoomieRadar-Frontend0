import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPendingConnections, getSentRequests, acceptConnectionRequest, rejectConnectionRequest } from '../api';
import { PixelGrid } from '../components/ui';
import { Radio, Send, Check, X, Clock, Wifi } from 'lucide-react';

const Connections = () => {
    const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
    const [inboxRequests, setInboxRequests] = useState<any[]>([]);
    const [sentRequests, setSentRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const fetchData = async (isBackground = false) => {
        try {
            if (!isBackground) setIsLoading(true);
            const [inbox, sent] = await Promise.all([
                getPendingConnections(),
                getSentRequests()
            ]);
            setInboxRequests(inbox);
            setSentRequests(sent);
        } catch (error) {
            console.error('Failed to fetch connections:', error);
        } finally {
            if (!isBackground) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        pollingRef.current = setInterval(() => fetchData(true), 5000);
        return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }, []);

    const handleAccept = async (id: number) => {
        try {
            setActionLoading(id);
            await acceptConnectionRequest(id);
            await fetchData();
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
            await fetchData();
        } catch (error) {
            console.error('Failed to reject request:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const tabs = [
        { id: 'inbox', label: 'Incoming Requests', count: inboxRequests.length, icon: Radio },
        { id: 'sent', label: 'Sent Requests', count: sentRequests.length, icon: Send },
    ];

    return (
        <div className="min-h-screen bg-[#050505] pt-16 sm:pt-28 pb-20 px-6 relative overflow-hidden font-sans text-white">
            <PixelGrid />

            <div className="max-w-[900px] mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="text-trae-green font-mono text-xs mb-3 uppercase tracking-[0.2em] font-bold">Connection Management</div>
                    <h1 className="text-4xl md:text-6xl font-black mb-5 tracking-tighter leading-tight">
                        My <span className="text-trae-green">Connections.</span>
                    </h1>
                    <p className="text-sm text-gray-500 font-medium max-w-xl">
                        Manage your connection requests and connect with potential roommates.
                    </p>
                </motion.div>

                <div className="flex gap-4 mb-10 overflow-x-auto scrollbar-hide pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-3.5 px-6 py-3.5 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all relative whitespace-nowrap overflow-hidden ${activeTab === tab.id ? 'text-black bg-trae-green shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'text-gray-500 bg-white/5 border border-white/5 hover:border-white/10 hover:text-white'}`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                            <span className={`px-2 py-0.5 rounded-lg text-[7px] ${activeTab === tab.id ? 'bg-black text-trae-green' : 'bg-white/5 text-gray-600'}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <div className="w-12 h-12 border-2 border-trae-green border-t-transparent rounded-full animate-spin mb-6"></div>
                        <p className="text-[9px] font-mono font-black uppercase tracking-[0.3em] text-gray-600 animate-pulse">Loading...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence mode="wait">
                            {(activeTab === 'inbox' ? inboxRequests : sentRequests).length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-[#0a0a0a] border border-white/5 p-16 sm:p-24 rounded-[2rem] text-center shadow-2xl"
                                >
                                    <Wifi className="w-12 h-12 text-gray-800 mx-auto mb-6 opacity-20" />
                                    <p className="text-gray-600 font-mono font-black uppercase tracking-[0.3em] text-[10px]">No active connection requests.</p>
                                </motion.div>
                            ) : (
                                (activeTab === 'inbox' ? inboxRequests : sentRequests).map((request, idx) => (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[1.5rem] flex flex-col sm:flex-row items-center gap-6 group hover:border-trae-green/30 transition-all duration-500 shadow-2xl"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-trae-green/50 transition-all duration-500">
                                            {(activeTab === 'inbox' ? request.fromAvatar : request.toAvatar) ? (
                                                <img
                                                    src={activeTab === 'inbox' ? request.fromAvatar : request.toAvatar}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <span className="text-xl font-black text-white uppercase group-hover:text-trae-green transition-colors">
                                                    {(activeTab === 'inbox' ? (request.fromName || request.fromUsername) : (request.toName || request.toUsername))?.[0]?.toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1 text-center sm:text-left min-w-0">
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1 group-hover:text-trae-green transition-colors truncate">
                                                {activeTab === 'inbox' ? (request.fromName || request.fromUsername) : (request.toName || request.toUsername)}
                                            </h3>
                                            <p className="text-gray-500 text-[13px] font-medium leading-relaxed italic truncate">
                                                "{request.message || 'Wants to connect with you.'}"
                                            </p>
                                            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-3">
                                                <div className="flex items-center gap-2 text-[7px] font-black uppercase tracking-widest text-gray-600">
                                                    <Clock className="w-2.5 h-2.5" />
                                                    {new Date(request.createdAt).toLocaleDateString()}
                                                </div>
                                                {activeTab === 'sent' && (
                                                    <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${request.status === 'PENDING' ? 'text-yellow-400 bg-yellow-400/5 border-yellow-400/20' : request.status === 'ACCEPTED' ? 'text-trae-green bg-trae-green/5 border-trae-green/20' : 'text-red-500 bg-red-500/5 border-red-500/20'}`}>
                                                        {request.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {activeTab === 'inbox' && (
                                            <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                                                <button
                                                    onClick={() => handleReject(request.id)}
                                                    disabled={actionLoading === request.id}
                                                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 text-gray-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center flex-shrink-0"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleAccept(request.id)}
                                                    disabled={actionLoading === request.id}
                                                    className="h-12 px-6 rounded-xl bg-trae-green text-black font-black uppercase tracking-widest text-[8px] hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-xl flex-1 sm:flex-none"
                                                >
                                                    <Check className="w-3.5 h-3.5" /> Accept Request
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
