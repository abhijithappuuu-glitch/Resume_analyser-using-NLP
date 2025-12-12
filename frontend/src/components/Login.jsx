import { useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { User, Mail, Lock, ArrowRight } from 'lucide-react'

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isLogin) {
        const response = await axios.post('/api/login', {
          email: formData.email,
          password: formData.password
        })
        onLogin(response.data)
      } else {
        const response = await axios.post('/api/register', formData)
        setSuccess(response.data.message)
        setIsLogin(true)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md glass-panel p-8 rounded-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">
            {isLogin ? 'Welcome Back' : 'Join ResumeAI'}
          </h2>
          <p className="mt-2 text-[var(--text-secondary)]">
            {isLogin ? 'Sign in to access your dashboard' : 'Create your account to get started'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-4"
            >
              <div className="relative">
                <User className="absolute left-3 top-3 text-[var(--text-secondary)] opacity-60" size={20} />
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full glass-input rounded-lg py-2.5 pl-10 pr-4 placeholder:text-[var(--text-secondary)] placeholder:opacity-50"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <select
                  name="role"
                  className="w-full glass-input rounded-lg py-2.5 px-4 appearance-none cursor-pointer"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="student" className="text-gray-900">Student</option>
                  <option value="recruiter" className="text-gray-900">Recruiter</option>
                </select>
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-[var(--text-secondary)] opacity-60" size={20} />
              <input
                name="email"
                type="email"
                required
                className="w-full glass-input rounded-lg py-2.5 pl-10 pr-4 placeholder:text-[var(--text-secondary)] placeholder:opacity-50"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-[var(--text-secondary)] opacity-60" size={20} />
              <input
                name="password"
                type="password"
                required
                className="w-full glass-input rounded-lg py-2.5 pl-10 pr-4 placeholder:text-[var(--text-secondary)] placeholder:opacity-50"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-200 text-sm text-center"
            >
              {error}
            </motion.div>
          )}
          
          {success && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-200 text-sm text-center"
            >
              {success}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full glass-button rounded-lg py-3 font-semibold text-[var(--text-primary)] flex items-center justify-center gap-2 group"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
