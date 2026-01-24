import { Route, Routes, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { AuthProvider } from "./contexts/AuthContext"
import Navbar from "./components/Navbar"
import ProtectedRoute from "./components/ProtectedRoute"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import FindRoom from "./pages/FindRoom"
import FindRoommate from "./pages/FindRoommate"
import RoomDetails from "./pages/RoomDetails"
import BookNow from "./pages/BookNow"
import AdminDashboard from "./pages/AdminDashboard"
import Unauthorized from "./pages/Unauthorized"
import AddListingModal, { type NewListingInput } from "./components/AddListingModal"
import ForgotPassword from './pages/ForgotPassword';
import CreateProfile from "./pages/CreateProfile"
import MyBookings from "./pages/MyBookings"
import MyListings from "./pages/MyListings"
import Profile from "./pages/Profile"
import Messages from "./pages/Messages"
import Connections from "./pages/Connections"
function App() {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/register', '/unauthorized'];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0c0c1d]">
        {showNavbar && <Navbar />}
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
            <Route path="/unauthorized" element={<PageWrapper><Unauthorized /></PageWrapper>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/create-profile" element={<ProtectedRoute requiredRoles={['student', 'admin']}><PageWrapper><CreateProfile /></PageWrapper></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute requiredRoles={['student', 'admin']}><PageWrapper><MyBookings /></PageWrapper></ProtectedRoute>} />
            <Route path="/profile" element={
              <ProtectedRoute requiredRoles={['student', 'admin']}>
                <PageWrapper><Profile /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute requiredRoles={['student', 'admin']}>
                <PageWrapper><Messages /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/connections" element={
              <ProtectedRoute requiredRoles={['student', 'admin']}>
                <PageWrapper><Connections /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/my-listings" element={<ProtectedRoute requiredRoles={['student', 'admin']}><PageWrapper><MyListings /></PageWrapper></ProtectedRoute>} />
            <Route path="/add-listing" element={<ProtectedRoute requiredRoles={['student', 'admin']}><PageWrapper><AddListingModal isOpen={false} onClose={function (): void {
              throw new Error("Function not implemented.")
            }} onSubmit={function (listing: NewListingInput): Promise<void> {
              throw new Error("Function not implemented.")
            }} /></PageWrapper></ProtectedRoute>} />
            {/* Protected Routes */}
            <Route
              path="/find-room"
              element={
                <ProtectedRoute requiredRoles={['student', 'admin']}>
                  <PageWrapper><FindRoom /></PageWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/:id"
              element={
                // <ProtectedRoute requiredRoles={['student', 'admin']}>
                <PageWrapper><RoomDetails /></PageWrapper>
                // </ProtectedRoute>
              }
            />
            <Route
              path="/find-roommate"
              element={
                <ProtectedRoute requiredRoles={['student', 'admin']}>
                  <PageWrapper><FindRoommate /></PageWrapper>
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-now/:roomId"
              element={
                <ProtectedRoute requiredRoles={['student', 'admin']}>
                  <BookNow />
                </ProtectedRoute>
              }
            />

            {/* Admin Only Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <PageWrapper><AdminDashboard /></PageWrapper>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>
    </AuthProvider>
  )
}

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
)

export default App
