import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { resetPassword } from "../api";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiShield, FiArrowRight, FiCheck } from "react-icons/fi";
import { PixelGrid } from "../components/ui";
import { Rocket } from "lucide-react";

const ResetPassword = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialEmail = queryParams.get("email") || "";

    const [email, setEmail] = useState(initialEmail);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const result = await resetPassword({ email, otp, newPassword });
            if (result && result.success) {
                setMessage("Password reset successfully. You can now log in.");
                setIsSuccess(true);
                setTimeout(() => {
                    navigate("/login");
                }, 3000);
            } else {
                setError(result?.message || "Failed to reset password. Please try again.");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden px-6 font-sans">
            <PixelGrid />

            {/* Decorative background blobs */}
            <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] bg-trae-green/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-blue-600/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md z-10"
            >
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center gap-2.5 mb-8 group">
                        <div className="w-9 h-9 bg-trae-green rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12">
                            <Rocket className="w-5 h-5 text-black fill-current" />
                        </div>
                        <span className="text-xl font-black text-white tracking-tighter">RoomieRadar</span>
                    </Link>
                </div>

                <div className="bg-[#0a0a0a] border border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-trae-green/20 to-transparent" />

                    <h2 className="text-2xl font-black text-white mb-3 tracking-tighter text-center uppercase">
                        {isSuccess ? "Success" : "Complete Reset"}
                    </h2>

                    {!isSuccess ? (
                        <form className="flex flex-col gap-5 mt-6" onSubmit={handleSubmit}>
                            <p className="text-center text-gray-600 text-[11px] font-medium leading-relaxed px-4 uppercase tracking-widest">
                                Enter the security code sent to your email and choose a new password.
                            </p>

                            <div className="space-y-2">
                                <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-trae-green/60 font-black ml-1">Email Address</label>
                                <div className="relative group/input">
                                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-trae-green transition-colors w-4.5 h-4.5" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:border-trae-green/50 transition-all text-white placeholder-gray-700 text-[13px] font-medium"
                                        placeholder="Enter email"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-trae-green/60 font-black ml-1">Security Code (OTP)</label>
                                <div className="relative group/input">
                                    <FiShield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-trae-green transition-colors w-4.5 h-4.5" />
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:border-trae-green/50 transition-all text-white placeholder-gray-700 text-[13px] font-medium"
                                        placeholder="Enter 6-digit code"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-trae-green/60 font-black ml-1">New Password</label>
                                <div className="relative group/input">
                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-trae-green transition-colors w-4.5 h-4.5" />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:border-trae-green/50 transition-all text-white placeholder-gray-700 text-[13px] font-medium"
                                        placeholder="Min 8 characters"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-trae-green/60 font-black ml-1">Confirm Password</label>
                                <div className="relative group/input">
                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within/input:text-trae-green transition-colors w-4.5 h-4.5" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-white/[0.02] border border-white/10 rounded-xl focus:outline-none focus:border-trae-green/50 transition-all text-white placeholder-gray-700 text-[13px] font-medium"
                                        placeholder="Confirm new password"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-red-500 text-[11px] font-black uppercase tracking-widest text-center bg-red-500/5 p-3.5 rounded-xl border border-red-500/20">
                                    {error}
                                </div>
                            )}

                            <motion.button
                                type="submit"
                                disabled={loading}
                                className={`w-full h-14 rounded-xl bg-trae-green text-black font-black uppercase tracking-widest text-[11px] shadow-xl shadow-trae-green/5 flex items-center justify-center gap-2 mt-2 transition-all duration-300 ${loading
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-emerald-400"
                                    }`}
                                whileHover={!loading ? { scale: 1.01 } : {}}
                                whileTap={!loading ? { scale: 0.99 } : {}}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    <>
                                        <span>Update Password</span>
                                        <FiArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center gap-6 mt-6">
                            <div className="w-14 h-14 bg-trae-green/5 rounded-2xl flex items-center justify-center border border-trae-green/10">
                                <FiCheck className="w-7 h-7 text-trae-green" />
                            </div>

                            <div className="space-y-4 text-center">
                                <p className="text-trae-green font-black uppercase tracking-widest text-xs px-2">
                                    {message}
                                </p>

                                <p className="text-gray-600 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                                    Redirecting you to the login zone. Prepare for entry.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 w-full mt-4">
                                <button
                                    onClick={() => navigate("/login")}
                                    className="h-12 rounded-xl bg-trae-green text-black font-black uppercase tracking-widest text-[9px] transition-all duration-200"
                                >
                                    Log In Now
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
