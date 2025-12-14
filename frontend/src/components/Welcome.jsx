import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export default function Welcome({ onContinue }) {
  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
      <div className="relative min-h-screen overflow-hidden">
        {/* Subtle overlays for readability; the static background image is set on <body> */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/15" />
        </div>

        {/* Top bars + hero */}
        <div className="relative z-10">
          {/* Hero center */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="min-h-[70vh] flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.08 }}
                className="w-full text-center"
              >
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight">
                  Resume Analysis
                  <span className="block">That Recruiters Trust</span>
                </h1>

                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 160, opacity: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.25 }}
                  className="mx-auto mt-5 h-1 rounded-full bg-[var(--accent-amber)]/90"
                />

                <p className="mt-6 text-white/80 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                  Get an ATS-style score, identify gaps, and receive focused improvements that fit your role.
                </p>

                <div className="mt-10 flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onContinue}
                    className="rounded-md px-6 py-3 font-semibold text-sm tracking-wide border border-white/20 bg-[var(--accent-amber-cta)] hover:bg-[var(--accent-amber-cta-hover)] text-black shadow-lg"
                  >
                    CONTINUE TO LOGIN
                    <ArrowRight size={16} className="inline-block ml-2 -mt-0.5" />
                  </motion.button>
                </div>

                <div className="mt-10 mx-auto grid gap-3 max-w-xl text-left">
                  <Feature>ATS scoring with clear breakdown</Feature>
                  <Feature>Actionable improvements to boost match</Feature>
                  <Feature>Separate student and recruiter flows</Feature>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Feature({ children }) {
  return (
    <div className="flex items-start gap-3 text-white/90">
      <div className="mt-0.5">
        <CheckCircle2 size={18} className="text-white/75" />
      </div>
      <div className="leading-relaxed">{children}</div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-xs text-[var(--text-secondary)]">{label}</div>
      <div className="text-sm font-semibold text-[var(--text-primary)]">{value}</div>
    </div>
  )
}

