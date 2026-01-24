import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result = await forgotPassword(email);
      if (result && result.success) {
        setMessage("Password reset instructions have been sent to your email address.");
        setIsSubmitted(true);
      } else {
        setError(result?.message || "Failed to send reset email. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0c1d] relative overflow-hidden px-6">
      {/* Background blobs for depth */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
      </div>

      <div className="glass-card shadow-2xl rounded-[3rem] p-12 w-full max-w-md flex flex-col items-center relative z-10 border-white/5">
        <h2 className="text-4xl font-black text-white mb-8 tracking-tight uppercase text-center">
          {isSubmitted ? "Signal Sent" : "Reset Key"}
        </h2>

        {!isSubmitted ? (
          <form className="w-full flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="text-center text-gray-500 text-sm font-medium tracking-wide uppercase px-4 leading-relaxed">
              Enter email to transmit reset instructions.
            </div>

            <input
              type="email"
              placeholder="ADDRESS@DOMAIN.COM"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-6 py-5 rounded-2xl bg-white/[0.02] border border-white/5 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all outline-none text-white font-bold placeholder-gray-600 text-center uppercase tracking-widest text-xs"
              required
              disabled={loading}
            />

            {error && (
              <div className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`group relative h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black uppercase tracking-[0.3em] transition-all duration-300 shadow-2xl shadow-purple-900/40 ${loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105 active:scale-95"
                } text-[10px]`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Transmitting...
                </div>
              ) : (
                "Send Reset Key"
              )}
            </button>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors duration-200"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        ) : (
          <div className="w-full flex flex-col items-center gap-8">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/20 shadow-2xl shadow-green-500/10">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            {message && (
              <div className="text-green-400 text-center font-bold uppercase tracking-widest text-[10px] leading-relaxed px-4">
                {message}
              </div>
            )}

            <div className="text-center text-gray-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
              Check spam folder if signal is not detected.
            </div>

            <div className="flex flex-col gap-4 w-full">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                  setMessage("");
                  setError("");
                }}
                className="h-16 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-white font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-200"
              >
                Re-transmit
              </button>

              <button
                onClick={handleBackToLogin}
                className="h-16 rounded-2xl border-2 border-white/5 text-gray-400 hover:text-white font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-200"
              >
                Target: Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;