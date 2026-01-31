import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose: () => void;
}

const Toast = ({ message, type, isVisible, onClose }: ToastProps) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4"
                >
                    <div className={`glass-card p-4 rounded-[1.5rem] shadow-2xl flex items-center gap-4 ${type === 'success' ? 'border-green-500/20' : 'border-red-500/20'
                        }`}>
                        <div className={`p-2 rounded-xl flex-shrink-0 ${type === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'
                            }`}>
                            {type === 'success' ? (
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                                <XCircle className="w-6 h-6 text-red-500" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-white uppercase tracking-tight truncate">
                                {type === 'success' ? 'Transmission Success' : 'Signal Error'}
                            </p>
                            <p className="text-xs text-gray-400 font-medium line-clamp-2">
                                {message}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
