import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getConversations, getMessages, sendMessage } from '../api';
import { PixelGrid } from '../components/ui';
import { Search, Send, ArrowLeft, MoreVertical, Shield, Clock, Zap } from 'lucide-react';

const Messages = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConvo, setSelectedConvo] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatLastSeen = (lastActive?: string) => {
        if (!lastActive) return 'STATUS: OFFLINE';
        const last = new Date(lastActive);
        if (Number.isNaN(last.getTime())) return 'OFFLINE';
        const diffMs = Date.now() - last.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        if (diffMinutes < 1) return 'Online Now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    const fetchConversations = async () => {
        try {
            const data = await getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (convoId: number) => {
        try {
            const data = await getMessages(convoId);
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedConvo) {
            fetchMessages(selectedConvo.id);
            if (pollingRef.current) clearInterval(pollingRef.current);
            pollingRef.current = setInterval(() => fetchMessages(selectedConvo.id), 4000); // Slightly slower poll
        }
        return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }, [selectedConvo]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConvo || isSending) return;
        try {
            setIsSending(true);
            await sendMessage(selectedConvo.id, newMessage);
            setNewMessage('');
            await fetchMessages(selectedConvo.id);
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="h-screen bg-[#050505] pt-16 flex overflow-hidden font-sans text-white">
            <PixelGrid />

            {/* Sidebar / Conversation List */}
            <div className={`w-full md:w-80 border-r border-white/5 flex flex-col relative z-20 bg-[#050505] transition-all duration-500 ${selectedConvo ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-white/5 bg-[#0a0a0a]">
                    <div className="text-trae-green font-mono text-[10px] mb-3 uppercase tracking-[0.2em] font-bold">Recent Chats</div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">Messages.</h2>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600 group-focus-within:text-trae-green transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search names..."
                            className="w-full h-10 rounded-lg bg-white/5 border border-white/10 pl-11 pr-4 text-[9px] font-black uppercase tracking-widest text-white placeholder:text-gray-700 outline-none focus:border-trae-green/50 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-12">
                            <div className="w-8 h-8 border-2 border-trae-green border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-[7px] font-mono text-gray-700 uppercase tracking-widest animate-pulse">Loading Chats...</p>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center opacity-40">
                            <Zap className="w-10 h-10 text-gray-800 mx-auto mb-4" />
                            <p className="text-[9px] font-mono font-black uppercase tracking-[0.2em] text-gray-600">No recent messages.</p>
                        </div>
                    ) : (
                        conversations
                            .filter(convo => !searchQuery.trim() || convo.otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((convo) => (
                                <button
                                    key={convo.id}
                                    onClick={() => setSelectedConvo(convo)}
                                    className={`w-full p-6 text-left border-b border-white/5 transition-all relative group ${selectedConvo?.id === convo.id ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
                                >
                                    {selectedConvo?.id === convo.id && (
                                        <motion.div layoutId="convoActive" className="absolute left-0 top-0 bottom-0 w-1 bg-trae-green shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                    )}
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-lg text-white group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                                                {convo.otherParticipant?.avatar ? (
                                                    <img src={convo.otherParticipant.avatar} alt={convo.otherParticipant.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    convo.otherParticipant?.name?.[0]
                                                )}
                                            </div>
                                            {convo.otherParticipant?.isActive && (
                                                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-trae-green rounded-full border-2 border-[#050505] shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <h4 className="font-black text-white uppercase tracking-wider text-[10px] truncate">{convo.otherParticipant?.name}</h4>
                                                <span className="text-[7px] text-gray-600 font-mono">{convo.lastMessageAt ? new Date(convo.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                            </div>
                                            <p className="text-[9px] text-trae-green font-mono font-black tracking-widest mb-1 opacity-60 truncate">
                                                {convo.otherParticipant?.deleted ? 'DEACTIVATED' : (convo.otherParticipant?.isActive ? 'Online Now' : formatLastSeen(convo.otherParticipant?.lastActive))}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-[#050505]/50 relative transition-all duration-500 ${!selectedConvo ? 'hidden md:flex' : 'flex'}`}>
                {selectedConvo ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md relative z-10">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSelectedConvo(null)}
                                    className="md:hidden w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center overflow-hidden">
                                        {selectedConvo.otherParticipant?.avatar ? (
                                            <img src={selectedConvo.otherParticipant.avatar} alt={selectedConvo.otherParticipant.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-trae-green font-black text-sm uppercase">{selectedConvo.otherParticipant?.name?.[0]}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black text-white uppercase tracking-widest">{selectedConvo.otherParticipant?.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${selectedConvo.otherParticipant?.deleted ? 'bg-red-500' : (selectedConvo.otherParticipant?.isActive ? 'bg-trae-green shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-700')}`} />
                                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">{selectedConvo.otherParticipant?.deleted ? 'Deactivated' : (selectedConvo.otherParticipant?.isActive ? 'Active Now' : 'Away')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-trae-green/5 border border-trae-green/10 rounded-lg">
                                    <Shield className="w-3 h-3 text-trae-green opacity-50" />
                                    <span className="text-[7px] font-black text-trae-green uppercase tracking-widest">Secure Chat</span>
                                </div>
                                <button className="w-9 h-9 rounded-xl hover:bg-white/5 flex items-center justify-center text-gray-600 transition-colors">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                            <AnimatePresence initial={false}>
                                {messages.map((msg, i) => {
                                    const isMe = msg.senderId === user?.id;
                                    return (
                                        <motion.div
                                            key={msg.id || i}
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[80%] sm:max-w-[65%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                                <div className={`px-5 py-3 rounded-2xl text-[11px] font-medium leading-relaxed tracking-wide ${isMe
                                                    ? 'bg-trae-green text-black font-bold rounded-tr-none shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                                    : 'bg-white/5 border border-white/5 text-gray-200 rounded-tl-none'
                                                    }`}>
                                                    {msg.content}
                                                </div>
                                                <div className="flex items-center gap-2 px-2">
                                                    <span className="text-[7px] font-mono text-gray-700 font-bold uppercase tracking-widest">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {isMe && <Clock className="w-2 h-2 text-trae-green opacity-30" />}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="p-6 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/5">
                            <form onSubmit={handleSend} className="relative group">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder={selectedConvo.otherParticipant?.deleted ? "Cannot reply to a deactivated account" : "Type your message here..."}
                                    disabled={selectedConvo.otherParticipant?.deleted}
                                    className="w-full h-16 bg-white/5 border border-white/10 rounded-xl px-6 pr-20 outline-none focus:border-trae-green/50 transition-all font-bold text-white text-[13px] tracking-widest placeholder:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || isSending || selectedConvo.otherParticipant?.deleted}
                                    className="absolute right-2.5 top-2.5 w-11 h-11 bg-trae-green rounded-lg flex items-center justify-center text-black hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-30 disabled:hover:bg-trae-green"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                            <div className="mt-3 flex items-center justify-center gap-6 opacity-20">
                                <span className="text-[6px] font-mono font-black uppercase tracking-[0.4em]">Secure connection</span>
                                <span className="text-[6px] font-mono font-black uppercase tracking-[0.4em]">Ready</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
                        <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                            <Zap className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-[0.4em] text-white/50 mb-3">No Chat Selected</h3>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600 max-w-xs leading-relaxed">Choose a contact from the sidebar to start a conversation.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
