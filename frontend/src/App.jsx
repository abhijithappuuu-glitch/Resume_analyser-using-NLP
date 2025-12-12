import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Login from './components/Login'
import StudentDashboard from './components/StudentDashboard'
import RecruiterDashboard from './components/RecruiterDashboard'
import { LogOut, User, Sparkles } from 'lucide-react'

function App() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const location = useLocation()

  const handleLogin = (userData) => {
    setIsLoading(true)
    setTimeout(() => {
      setUser(userData)
      setIsLoading(false)
    }, 300)
  }

  const handleLogout = () => {
    setIsLoading(true)
    setTimeout(() => {
      setUser(null)
      setIsLoading(false)
    }, 200)
  }

  useEffect(() => {
    // Add subtle parallax effect on scroll
    const handleScroll = () => {
      const scrolled = window.scrollY
      const parallax = document.querySelector('.parallax-bg')
      if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.5}px)`
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen transition-colors duration-300 relative">
      {/* Animated Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="glass-panel sticky top-0 z-50 border-b-0 rounded-b-xl mx-4 mt-2 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
                <Sparkles className="text-white" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold gradient-text">
                  ResumeAI
                </span>
                <span className="text-xs text-[var(--text-secondary)] -mt-1">Smart Analysis</span>
              </div>
            </motion.div>
            <div className="flex items-center gap-4">
              {user && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-6"
                >
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 backdrop-blur-sm">
                    <User size={16} className="text-purple-400" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {user.user_name} <span className="text-purple-300 text-xs">({user.user_role})</span>
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-medium transition-all"
                  >
                    <LogOut size={16} />
                    Logout
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route 
              path="/" 
              element={
                !user ? (
                  <PageWrapper>
                    <Login onLogin={handleLogin} />
                  </PageWrapper>
                ) : user.user_role === 'student' ? (
                  <Navigate to="/student" />
                ) : (
                  <Navigate to="/recruiter" />
                )
              } 
            />
            <Route 
              path="/student" 
              element={
                user && user.user_role === 'student' ? (
                  <PageWrapper>
                    <StudentDashboard />
                  </PageWrapper>
                ) : <Navigate to="/" />
              } 
            />
            <Route 
              path="/recruiter" 
              element={
                user && user.user_role === 'recruiter' ? (
                  <PageWrapper>
                    <RecruiterDashboard />
                  </PageWrapper>
                ) : <Navigate to="/" />
              } 
            />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Decorative Elements */}
      <div className="parallax-bg fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  )
}

const PageWrapper = ({ children }) => (
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
