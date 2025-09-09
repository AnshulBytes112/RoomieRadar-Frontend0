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

function App() {
  const location = useLocation();
  const hideNavbarRoutes = ['/login', '/register', '/unauthorized'];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);
  
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        {showNavbar && <Navbar />}
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
            <Route path="/unauthorized" element={<PageWrapper><Unauthorized /></PageWrapper>} />
            <Route path="/add-listing" element={<ProtectedRoute requiredRoles={['student', 'admin']}><PageWrapper><AddListingModal isOpen={false} onClose={function (): void {
              throw new Error("Function not implemented.")
            } } onSubmit={function (listing: NewListingInput): Promise<void> {
              throw new Error("Function not implemented.")
            } } /></PageWrapper></ProtectedRoute>} />
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
              path="/booknow" 
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
