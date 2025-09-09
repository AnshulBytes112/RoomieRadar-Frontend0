import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userRegister } from "../api";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await userRegister({ 
        username, 
        name, 
        email, 
        password,
        phone
      });
      if (result && (result.success || result.user)) {
        navigate("/login");
      } else {
        setError(result?.message || "Registration failed.");
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500">
      <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-full max-w-md flex flex-col items-center">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 mb-6">Register</h2>
        <form className="w-full flex flex-col gap-4" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg"
            required
          />
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg"
            required
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg"
            required
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold text-lg shadow hover:from-pink-600 hover:to-indigo-600 transition-all duration-200"
          >
            Register
          </button>
        </form>
        <div className="mt-6 text-center text-gray-700 text-sm">
          <span>Already have an account? <a href="/login" className="text-indigo-600 font-bold">Login</a></span>
        </div>
      </div>
    </div>
  );
};

export default Register;
