import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userLogin } from "../api";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
  // When a new user logs in, their credentials are verified and they are redirected to the main page.
    e.preventDefault();
    setError("");
    try {
      const result = await userLogin({ username, password });
      if (result && result.token && result.user) {
        login(result.token, result.user);
        navigate("/");
      } else {
        setError(result?.message || "Invalid credentials.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-full max-w-md flex flex-col items-center">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-6">Sign In</h2>
        <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg"
            required
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold text-lg shadow hover:from-indigo-600 hover:to-pink-600 transition-all duration-200"
          >
            Log In
          </button>
          <div className="mt-6 text-center text-gray-700 text-sm">
            <span>Don't have an account? <a href="/register" className="text-pink-600 font-bold">Register</a></span>
          </div>
        </form>
        <div className="mt-6 text-center text-gray-700 text-sm"></div>
      </div>
    </div>
  );
};

export default Login;
