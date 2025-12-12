import { useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, AlertCircle, Plus, X, Info, TrendingUp, Lightbulb, Download, Sparkles, Target, Award } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts'
import { Alert, LoadingSpinner, Badge, Card, EmptyState, StatCard } from './UIComponents'

export default function StudentDashboard() {
  const [resume, setResume] = useState(null)
  const [jds, setJds] = useState([{ id: 1, file: null, text: '' }])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleAddJd = () => {
    setJds([...jds, { id: Date.now(), file: null, text: '' }])
  }

  const handleRemoveJd = (id) => {
    if (jds.length > 1) {
      setJds(jds.filter(jd => jd.id !== id))
    }
  }

  const handleJdFileChange = (id, file) => {
    setJds(jds.map(jd => jd.id === id ? { ...jd, file } : jd))
  }

  const handleAnalyze = async () => {
    if (!resume) {
      setError('Please upload a resume')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    setResults([])
    setUploadProgress(0)

    try {
      const newResults = []
      const totalJds = jds.length
      
      for (let i = 0; i < totalJds; i++) {
        const jd = jds[i]
        setUploadProgress(Math.round(((i + 1) / totalJds) * 100))
        
        const formData = new FormData()
        formData.append('resume', resume)
        if (jd.file) {
          formData.append('jd', jd.file)
        } else if (jd.text) {
          formData.append('jd_text_input', jd.text)
        }

        const response = await axios.post('/api/analyze-resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        newResults.push({ 
          ...response.data, 
          jdId: jd.id, 
          jdName: jd.file ? jd.file.name : `Job Description ${jds.indexOf(jd) + 1}` 
        })
      }
      setResults(newResults)
      setSuccess('Analysis completed successfully!')
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const getBestMatch = () => {
    if (results.length === 0) return null
    return results.reduce((best, current) => 
      current.ats_score > best.ats_score ? current : best
    )
  }

  const getAverageScore = () => {
    if (results.length === 0) return 0
    const sum = results.reduce((acc, r) => acc + r.ats_score, 0)
    return Math.round(sum / results.length)
  }

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
              <Sparkles className="text-purple-400" size={32} />
              ATS Analysis Dashboard
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">Optimize your resume for multiple job opportunities</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHelp(!showHelp)}
            className="glass-button px-5 py-2.5 rounded-xl flex items-center gap-2 text-[var(--text-primary)] text-sm font-medium shadow-lg"
          >
            <Info size={18} />
            {showHelp ? 'Hide Guide' : 'How it works'}
          </motion.button>
        </div>

        {/* Stats Cards */}
        {results.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            <StatCard
              icon={Target}
              label="Jobs Analyzed"
              value={results.length}
              color="purple"
            />
            <StatCard
              icon={Award}
              label="Average Score"
              value={`${getAverageScore()}%`}
              trend={getAverageScore() > 50 ? 5 : -5}
              color="amber"
            />
            <StatCard
              icon={TrendingUp}
              label="Best Match"
              value={`${getBestMatch()?.ats_score}%`}
              color="green"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}
        {success && (
          <Alert type="success" message={success} onClose={() => setSuccess('')} />
        )}
      </AnimatePresence>

      {/* Help Section */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass-panel p-8 rounded-2xl overflow-hidden border-2 border-purple-500/20"
          >
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <Lightbulb className="text-amber-400" size={24} />
              Understanding ATS Scoring
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Applicant Tracking Systems (ATS) filter resumes based on keywords, skills, and formatting. 
              Our tool compares your resume against specific job descriptions to calculate a match score.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-5 rounded-xl border border-green-500/20"
              >
                <div className="text-2xl font-bold text-green-400 mb-2">45%</div>
                <span className="font-bold text-green-300">Skill Match</span>
                <p className="text-[var(--text-secondary)] text-sm mt-2">Presence of required technical and soft skills.</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-5 rounded-xl border border-blue-500/20"
              >
                <div className="text-2xl font-bold text-blue-400 mb-2">35%</div>
                <span className="font-bold text-blue-300">Keyword Density</span>
                <p className="text-[var(--text-secondary)] text-sm mt-2">Frequency of relevant terms from the JD.</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-5 rounded-xl border border-purple-500/20"
              >
                <div className="text-2xl font-bold text-purple-400 mb-2">20%</div>
                <span className="font-bold text-purple-300">Experience</span>
                <p className="text-[var(--text-secondary)] text-sm mt-2">Years of experience mentioned vs required.</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-6 rounded-2xl shadow-xl"
          >
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2">
              <Upload size={22} className="text-purple-400" /> Upload Resume
            </h3>
            <div className="border-2 border-dashed border-purple-500/30 rounded-2xl p-10 text-center hover:border-purple-500/60 transition-all relative group bg-gradient-to-br from-purple-500/5 to-transparent">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setResume(e.target.files[0])}
              />
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FileText className="mx-auto h-14 w-14 text-purple-400 mb-4" />
              </motion.div>
              <p className="mt-4 text-base font-semibold text-[var(--text-primary)]">
                {resume ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle size={18} className="text-green-400" />
                    {resume.name}
                  </span>
                ) : (
                  "Drop your resume here or click to browse"
                )}
              </p>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">Supports PDF, DOCX, TXT</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 rounded-2xl shadow-xl"
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <FileText size={22} className="text-blue-400" /> Job Descriptions
              </h3>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAddJd} 
                className="p-2 hover:bg-purple-500/20 rounded-xl transition-colors border border-purple-500/30" 
                title="Add another JD"
              >
                <Plus size={20} className="text-purple-400" />
              </motion.button>
            </div>
            
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
              {jds.map((jd, index) => (
                <motion.div 
                  key={jd.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-5 rounded-xl border border-blue-500/20 relative hover:border-blue-500/40 transition-all"
                >
                  {jds.length > 1 && (
                    <motion.button 
                      whileHover={{ scale: 1.2, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveJd(jd.id)}
                      className="absolute top-3 right-3 text-[var(--text-secondary)] hover:text-red-400 transition-colors bg-black/20 rounded-full p-1"
                    >
                      <X size={16} />
                    </motion.button>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="info" size="sm">Role #{index + 1}</Badge>
                  </div>
                  <input
                    type="file"
                    className="block w-full text-sm text-[var(--text-secondary)] file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30 cursor-pointer transition-all"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => handleJdFileChange(jd.id, e.target.files[0])}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full glass-button py-5 rounded-2xl font-bold text-lg text-[var(--text-primary)] shadow-2xl hover:shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Analyzing... {uploadProgress}%
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Analyze All Matches
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {results.length > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-8 rounded-2xl shadow-xl border border-purple-500/20"
            >
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <TrendingUp size={24} className="text-purple-400"/> 
                Job Suitability Comparison
              </h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={results}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                    <XAxis 
                      dataKey="jdName" 
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                      axisLine={false} 
                      tickLine={false} 
                      domain={[0, 100]} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)', borderRadius: '12px', padding: '12px' }} 
                      cursor={{ stroke: 'var(--glass-border)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ats_score" 
                      name="ATS Score" 
                      stroke="#c084fc" 
                      strokeWidth={4} 
                      dot={{ fill: '#c084fc', r: 6, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {results.length === 0 && !loading && (
            <EmptyState
              icon={Upload}
              title="Ready to Analyze"
              description="Upload your resume and one or more job descriptions to see how well you match."
            />
          )}

          {results.map((result, idx) => {
            const chartData = [
              { subject: 'Skills', A: result.match_details["Skill Match"], fullMark: 100 },
              { subject: 'Keywords', A: result.match_details["Keyword Density"], fullMark: 100 },
              { subject: 'Experience', A: result.match_details["Experience Match"], fullMark: 100 },
            ];

            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-panel p-6 rounded-xl"
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-[var(--text-primary)]">{result.jdName}</h3>
                  <div className="flex items-center gap-2 bg-black/5 dark:bg-white/10 px-4 py-2 rounded-full">
                    <span className="text-sm text-[var(--text-secondary)]">Overall Score</span>
                    <span className={`text-xl font-bold ${
                      result.ats_score > 70 ? 'text-green-600 dark:text-green-400' : 
                      result.ats_score > 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                    }`}>{result.ats_score}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Graphs */}
                  <div className="space-y-6">
                    <div className="h-[250px] w-full bg-black/5 dark:bg-white/5 rounded-xl p-4 relative">
                      <p className="absolute top-2 left-4 text-xs text-[var(--text-secondary)] uppercase tracking-wider">Performance Breakdown</p>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                          <PolarGrid stroke="var(--glass-border)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar
                            name="Score"
                            dataKey="A"
                            stroke="#8884d8"
                            strokeWidth={2}
                            fill="#8884d8"
                            fillOpacity={0.4}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                            itemStyle={{ color: 'var(--text-primary)' }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl">
                      <h4 className="text-sm font-medium text-[var(--text-primary)] opacity-80 mb-3 flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-600 dark:text-blue-400" /> Analysis Insights
                      </h4>
                      <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                        <p>• <strong>Experience:</strong> You have {result.match_details["Resume Experience"]} vs required {result.match_details["Required Experience"]}.</p>
                        <p>• <strong>Keywords:</strong> Your resume matches {result.match_details["Keyword Density"]}% of the job context.</p>
                        <p>• <strong>Skills:</strong> You possess {result.match_details["Matched Skills"].length} out of {result.match_details["Matched Skills"].length + (result.suggestions[0]?.includes("Missing") ? 5 : 0)} critical skills.</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Suggestions & Details */}
                  <div className="space-y-6">
                    <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-xl">
                      <h4 className="text-sm font-bold text-amber-700 dark:text-amber-200 mb-3 flex items-center gap-2">
                        <Lightbulb size={18} /> Top Suggestions
                      </h4>
                      <ul className="space-y-3">
                        {result.suggestions.map((suggestion, i) => (
                          <li key={i} className="text-sm text-[var(--text-primary)] opacity-80 flex items-start gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 mt-1.5 flex-shrink-0" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-[var(--text-primary)] opacity-80 mb-3 flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400" /> Matched Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.match_details["Matched Skills"].length > 0 ? (
                          result.match_details["Matched Skills"].map((skill, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-md bg-green-500/10 text-green-700 dark:text-green-300 text-xs border border-green-500/20">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-[var(--text-secondary)] opacity-60 text-sm italic">No direct skill matches found</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  )
}
