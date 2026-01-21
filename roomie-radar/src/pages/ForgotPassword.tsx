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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-full max-w-md flex flex-col items-center">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-6">
          {isSubmitted ? "Check Your Email" : "Reset Password"}
        </h2>
        
        {!isSubmitted ? (
          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="text-center text-gray-700 text-sm mb-4">
              Enter your email address and we'll send you instructions to reset your password.
            </div>
            
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg"
              required
              disabled={loading}
            />
            
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className={`mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold text-lg shadow transition-all duration-200 ${
                loading 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:from-indigo-600 hover:to-pink-600 transform hover:scale-105"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </div>
              ) : (
                "Send Reset Instructions"
              )}
            </button>
            
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors duration-200"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        ) : (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            {message && (
              <div className="text-green-600 text-center bg-green-50 p-4 rounded-xl text-sm leading-relaxed">
                {message}
              </div>
            )}
            
            <div className="text-center text-gray-600 text-sm">
              Didn't receive the email? Check your spam folder or try again in a few minutes.
            </div>
            
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                  setMessage("");
                  setError("");
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-lg shadow hover:from-purple-600 hover:to-indigo-600 transition-all duration-200"
              >
                Try Again
              </button>
              
              <button
                onClick={handleBackToLogin}
                className="px-6 py-3 rounded-xl border-2 border-indigo-300 text-indigo-600 font-bold text-lg hover:bg-indigo-50 transition-all duration-200"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;