import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'

// Enhanced Alert Component
export const Alert = ({ type = 'info', message, onClose }) => {
  const styles = {
    error: 'bg-red-500/10 border-red-500/20 text-red-400',
    success: 'bg-green-500/10 border-green-500/20 text-green-400',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
  }

  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    info: Info,
    warning: AlertCircle
  }

  const Icon = icons[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${styles[type]} p-4 rounded-xl border backdrop-blur-sm flex items-start gap-3 shadow-lg`}
    >
      <Icon size={20} className="flex-shrink-0 mt-0.5" />
      <p className="flex-1 text-sm">{message}</p>
      {onClose && (
        <button onClick={onClose} className="hover:opacity-70 transition-opacity">
          <X size={16} />
        </button>
      )}
    </motion.div>
  )
}

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', text }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${sizes[size]} border-4 border-purple-500/30 border-t-purple-500 rounded-full`}
      />
      {text && <p className="text-sm text-[var(--text-secondary)]">{text}</p>}
    </div>
  )
}

// Progress Bar Component
export const ProgressBar = ({ value, max = 100, label, color = 'purple' }) => {
  const percentage = (value / max) * 100

  const colors = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500'
  }

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-primary)]">{label}</span>
          <span className="text-[var(--text-secondary)]">{value}/{max}</span>
        </div>
      )}
      <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${colors[color]} rounded-full`}
        />
      </div>
    </div>
  )
}

// Badge Component
export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const variants = {
    default: 'bg-gray-500/10 text-gray-300 border-gray-500/20',
    success: 'bg-green-500/10 text-green-400 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}

// Card Component
export const Card = ({ children, className = '', hover = false }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.02 } : {}}
      className={`glass-panel rounded-xl p-6 ${className}`}
    >
      {children}
    </motion.div>
  )
}

// Stat Card Component
export const StatCard = ({ icon: Icon, label, value, trend, color = 'purple' }) => {
  const colors = {
    purple: 'from-purple-500 to-blue-500',
    green: 'from-green-500 to-emerald-500',
    amber: 'from-amber-500 to-yellow-500',
    red: 'from-red-500 to-pink-500'
  }

  return (
    <Card hover className="relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${colors[color]} bg-opacity-10`}>
            {Icon && <Icon size={20} className="text-white" />}
          </div>
          {trend && (
            <span className={`text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{value}</p>
        <p className="text-sm text-[var(--text-secondary)]">{label}</p>
      </div>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors[color]} opacity-5 rounded-full -mr-16 -mt-16`} />
    </Card>
  )
}

// Skeleton Loader
export const Skeleton = ({ width = '100%', height = '20px', className = '' }) => {
  return (
    <div
      className={`skeleton rounded ${className}`}
      style={{ width, height }}
    />
  )
}

// Empty State Component
export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel p-12 rounded-xl text-center flex flex-col items-center justify-center min-h-[400px]"
    >
      <div className="w-24 h-24 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
        {Icon && <Icon className="h-10 w-10 text-[var(--text-secondary)] opacity-40" />}
      </div>
      <h3 className="text-xl font-semibold text-[var(--text-primary)] opacity-80 mb-2">{title}</h3>
      <p className="text-[var(--text-secondary)] opacity-60 max-w-md mb-6">{description}</p>
      {action}
    </motion.div>
  )
}

// Tooltip Component
export const Tooltip = ({ children, content, position = 'top' }) => {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  return (
    <div className="relative group inline-block">
      {children}
      <div className={`absolute ${positions[position]} invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50`}>
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
          {content}
        </div>
      </div>
    </div>
  )
}

// Toggle Switch Component
export const Toggle = ({ enabled, onChange, label }) => {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className="flex items-center gap-3 group"
    >
      <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
        enabled ? 'bg-purple-500' : 'bg-gray-600'
      }`}>
        <motion.div
          animate={{ x: enabled ? 20 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
        />
      </div>
      {label && <span className="text-sm text-[var(--text-primary)] group-hover:text-purple-400 transition-colors">{label}</span>}
    </button>
  )
}
