import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info';
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = 'danger',
    isLoading = false
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                    >
                        {/* Decorative background gradient */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-trae-green/20 to-transparent" />

                        <div className="flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${type === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-trae-green/10 border-trae-green/20 text-trae-green'}`}>
                                <AlertCircle className="w-8 h-8" />
                            </div>

                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-3 leading-tight">
                                {title}
                            </h3>

                            <p className="text-gray-500 text-xs font-medium leading-relaxed mb-10 max-w-[280px]">
                                {message}
                            </p>

                            <div className="flex flex-col w-full gap-3">
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 ${type === 'danger' ? 'bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-500/10' : 'bg-trae-green text-black hover:bg-emerald-400 shadow-xl shadow-trae-green/10'} active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : confirmText}
                                </button>

                                <button
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {cancelText}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
