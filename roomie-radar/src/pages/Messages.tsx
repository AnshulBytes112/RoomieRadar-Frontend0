import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getConversations, getMessages, sendMessage } from '../api';

const Messages = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedConvo, setSelectedConvo] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
            // Setup polling for messages
            if (pollingRef.current) clearInterval(pollingRef.current);
            pollingRef.current = setInterval(() => {
                fetchMessages(selectedConvo.id);
            }, 3000);
        }
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
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
        <div className="h-screen bg-[#0c0c1d] pt-20 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-full md:w-80 border-r border-white/5 flex flex-col glass-card bg-[#0c0c1d]/50">
                <div className="p-6 border-b border-white/5">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Signals</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Active Communication Lines</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">No active links.</p>
                        </div>
                    ) : (
                        conversations.map((convo) => (
                            <button
                                key={convo.id}
                                onClick={() => setSelectedConvo(convo)}
                                className={`w-full p-6 text-left border-b border-white/5 transition-all outline-none ${selectedConvo?.id === convo.id ? 'bg-white/5 border-r-2 border-r-blue-500' : 'hover:bg-white/[0.02]'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-800 flex items-center justify-center font-black text-white shadow-xl">
                                        {convo.otherParticipant?.name?.[0]?.toUpperCase() || 'E'}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-black text-white uppercase tracking-wider text-xs truncate">{convo.otherParticipant?.name}</h4>
                                            <span className="text-[8px] text-gray-500 font-bold">{convo.lastMessageAt ? new Date(convo.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-medium truncate italic">
                                            {convo.lastMessage?.content || 'Awaiting transmission...'}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative">
                <AnimatePresence mode="wait">
                    {!selectedConvo ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center p-8 text-center"
                        >
                            <div className="w-24 h-24 bg-blue-500/5 rounded-full flex items-center justify-center mb-6 border border-blue-500/10 shadow-2xl">
                                <svg className="w-10 h-10 text-blue-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-gray-700 uppercase tracking-widest mb-2">Select a Terminal</h3>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">Ready for signal synchronization</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 glass-card bg-[#0c0c1d]/30 flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <span className="text-xl font-black text-blue-500">{selectedConvo.otherParticipant?.name?.[0].toUpperCase()}</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-wider">{selectedConvo.otherParticipant?.name}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Active Sync</span>
                                    </div>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.senderId === user?.id; // Assuming user.id exists in context
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                        >
                                            <div className={`max-w-[70%] p-5 rounded-2xl font-medium text-sm leading-relaxed shadow-2xl ${isMe
                                                    ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-900/40'
                                                    : 'glass-card bg-white/5 border-white/5 text-gray-200 rounded-tl-none'
                                                }`}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-2 px-1">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <form onSubmit={handleSend} className="p-8 border-t border-white/5 bg-[#0c0c1d]/50 backdrop-blur-xl">
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="text"
                                        placeholder="ENTER PAYLOAD DATA..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="flex-1 h-14 bg-white/[0.03] border border-white/5 rounded-2xl px-6 font-bold text-xs uppercase tracking-widest text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-gray-700"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSending || !newMessage.trim()}
                                        className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-purple-900/40 disabled:opacity-50"
                                    >
                                        {isSending ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
        </div>
    );
};

export default Messages;
