import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 via-pink-500 to-purple-500">
      <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-full max-w-md text-center">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        {user && (
          <p className="text-sm text-gray-500 mb-6">
            Your role: <span className="font-semibold capitalize">{user.role}</span>
          </p>
        )}
        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
          >
            Go Home
          </Link>
          <Link
            to="/login"
            className="block w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            Login with Different Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;

