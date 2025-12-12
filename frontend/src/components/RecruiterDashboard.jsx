import { useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Download, Users, Plus, X, Info, FileText, BarChart2, TrendingUp, Sparkles, Award, Target } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Alert, LoadingSpinner, Badge, Card, EmptyState, StatCard } from './UIComponents'

export default function RecruiterDashboard() {
  const [jds, setJds] = useState([{ id: 1, file: null }])
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([]) // Array of { jdName, rankings: [] }
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleAddJd = () => {
    setJds([...jds, { id: Date.now(), file: null }])
  }

  const handleRemoveJd = (id) => {
    if (jds.length > 1) {
      setJds(jds.filter(jd => jd.id !== id))
    }
  }

  const handleJdFileChange = (id, file) => {
    setJds(jds.map(jd => jd.id === id ? { ...jd, file } : jd))
  }

  const handleRank = async () => {
    const validJds = jds.filter(jd => jd.file)
    if (validJds.length === 0 || resumes.length === 0) {
      setError('Please upload at least one JD and one resume')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    setResults([])
    setUploadProgress(0)
    
    try {
      const allRankings = []
      const totalJds = validJds.length
      
      for (let i = 0; i < totalJds; i++) {
        const jd = validJds[i]
        setUploadProgress(Math.round(((i + 1) / totalJds) * 100))
        
        const formData = new FormData()
        formData.append('jd', jd.file)
        Array.from(resumes).forEach(file => {
          formData.append('resumes', file)
        })

        const response = await axios.post('/api/rank-candidates', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        allRankings.push({
          jdName: jd.file.name,
          rankings: response.data
        })
      }
      
      setResults(allRankings)
      setSuccess('Ranking completed successfully!')
    } catch (err) {
      setError(err.response?.data?.detail || 'Ranking failed')
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  const getTotalCandidates = () => {
    return resumes.length
  }

  const getTopScore = () => {
    if (results.length === 0) return 0
    const allScores = results.flatMap(r => r.rankings.map(rank => rank.ats_score))
    return Math.max(...allScores, 0)
  }

  const downloadCSV = (rankings, jdName) => {
    if (rankings.length === 0) return

    const headers = ['Candidate', 'ATS Score', 'Skill Match', 'Keyword Density', 'Matched Skills', 'Missing Skills']
    const csvContent = [
      headers.join(','),
      ...rankings.map(r => [
        r.candidate_name,
        r.ats_score,
        r.skill_match,
        r.keyword_density,
        `"${r.matched_skills}"`,
        `"${r.missing_skills}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `ranking_${jdName}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
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
              <Users className="text-blue-400" size={32} />
              Candidate Ranking System
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">Bulk analyze resumes against multiple job descriptions</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHelp(!showHelp)}
            className="glass-button px-5 py-2.5 rounded-xl flex items-center gap-2 text-[var(--text-primary)] text-sm font-medium shadow-lg"
          >
            <Info size={18} />
            {showHelp ? 'Hide Guide' : 'Guide'}
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
              icon={FileText}
              label="Job Roles"
              value={results.length}
              color="blue"
            />
            <StatCard
              icon={Users}
              label="Candidates"
              value={getTotalCandidates()}
              color="purple"
            />
            <StatCard
              icon={Award}
              label="Top Score"
              value={`${getTopScore()}%`}
              color="amber"
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

      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="glass-panel p-6 rounded-xl overflow-hidden"
          >
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">How Ranking Works</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">
              Upload one or more Job Descriptions (JDs) and a batch of candidate resumes. 
              The system will score every resume against every JD to find the best fit for each role.
            </p>
            <ul className="list-disc list-inside text-sm text-[var(--text-secondary)] space-y-1">
              <li>Scores are based on skill overlap, keyword frequency, and experience.</li>
              <li>Results are sorted by ATS Score (highest to lowest).</li>
              <li>You can export the ranking for each JD as a CSV file.</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* JDs Input */}
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <FileText size={20} /> Job Descriptions
              </h3>
              <button onClick={handleAddJd} className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors" title="Add another JD">
                <Plus size={20} className="text-[var(--text-primary)]" />
              </button>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {jds.map((jd, index) => (
                <motion.div 
                  key={jd.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-black/5 dark:bg-white/5 p-4 rounded-lg border border-black/10 dark:border-white/10 relative"
                >
                  {jds.length > 1 && (
                    <button 
                      onClick={() => handleRemoveJd(jd.id)}
                      className="absolute top-2 right-2 text-[var(--text-secondary)] hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <p className="text-sm font-medium text-[var(--text-primary)] opacity-80 mb-2">Role #{index + 1}</p>
                  <input
                    type="file"
                    className="block w-full text-sm text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black/10 dark:file:bg-white/10 file:text-[var(--text-primary)] hover:file:bg-black/20 dark:hover:file:bg-white/20 cursor-pointer"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => handleJdFileChange(jd.id, e.target.files[0])}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Resumes Input */}
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Users size={20} /> Candidates
            </h3>
            <div className="border-2 border-dashed border-slate-300 dark:border-white/20 rounded-xl p-8 text-center hover:border-slate-400 dark:hover:border-white/40 transition-colors relative group">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={(e) => setResumes(e.target.files)}
              />
              <Upload className="mx-auto h-12 w-12 text-[var(--text-secondary)] opacity-40 group-hover:text-[var(--text-primary)] transition-colors" />
              <p className="mt-4 text-sm font-medium text-[var(--text-primary)]">
                {resumes.length > 0 ? `${resumes.length} files selected` : "Upload candidate resumes"}
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)] opacity-40">Bulk upload supported</p>
            </div>
          </div>

          <button
            onClick={handleRank}
            disabled={loading}
            className="w-full glass-button py-4 rounded-xl font-bold text-lg text-[var(--text-primary)] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ranking Candidates...' : 'Analyze & Rank'}
          </button>
          
          {error && <p className="text-center text-red-600 dark:text-red-300 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-8">
          {results.length === 0 && !loading && (
            <div className="glass-panel p-12 rounded-xl text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="w-24 h-24 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Users className="h-10 w-10 text-[var(--text-secondary)] opacity-40" />
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-primary)] opacity-80">Waiting for Data</h3>
              <p className="text-[var(--text-secondary)] opacity-40 mt-2 max-w-md">
                Upload JDs and resumes to generate a ranked list of candidates.
              </p>
            </div>
          )}

          {results.map((resultGroup, groupIdx) => (
            <motion.div 
              key={groupIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIdx * 0.1 }}
              className="glass-panel rounded-xl overflow-hidden"
            >
              <div className="px-6 py-5 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-black/5 dark:bg-white/5">
                <h3 className="text-lg font-medium text-[var(--text-primary)]">Results for: <span className="text-amber-700 dark:text-amber-200">{resultGroup.jdName}</span></h3>
                <button
                  onClick={() => downloadCSV(resultGroup.rankings, resultGroup.jdName)}
                  className="glass-button px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-primary)] flex items-center gap-2"
                >
                  <Download size={16} />
                  Export CSV
                </button>
              </div>

              {/* Graph Section */}
              <div className="p-6 border-b border-black/10 dark:border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--text-primary)] opacity-80 mb-4 flex items-center gap-2">
                      <BarChart2 size={16} className="text-blue-600 dark:text-blue-400" /> Top 5 Candidates
                    </h4>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={resultGroup.rankings.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                          <XAxis 
                            dataKey="candidate_name" 
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) => val.split(' ')[0]}
                          />
                          <YAxis 
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                            cursor={{ fill: 'var(--glass-border)' }}
                          />
                          <Bar dataKey="ats_score" name="ATS Score" fill="#818cf8" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="skill_match" name="Skill Match" fill="#34d399" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-[var(--text-primary)] opacity-80 mb-4 flex items-center gap-2">
                      <TrendingUp size={16} className="text-purple-600 dark:text-purple-400" /> Score Trend (All Candidates)
                    </h4>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={resultGroup.rankings}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                          <XAxis 
                            dataKey="candidate_name" 
                            hide
                          />
                          <YAxis 
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                            axisLine={false}
                            tickLine={false}
                            domain={[0, 100]}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', color: 'var(--text-primary)' }}
                            cursor={{ stroke: 'var(--glass-border)' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="ats_score" 
                            name="ATS Score" 
                            stroke="#c084fc" 
                            strokeWidth={3} 
                            dot={{ fill: '#c084fc', r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-black/10 dark:divide-white/10">
                  <thead className="bg-black/5 dark:bg-white/5">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Rank</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Candidate</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">ATS Score</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Skill Match</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Missing Skills</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10 dark:divide-white/10 bg-transparent">
                    {resultGroup.rankings.map((result, idx) => (
                      <tr key={idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary)]">#{idx + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary)] opacity-80">{result.candidate_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            result.ats_score > 70 ? 'bg-green-500/10 text-green-700 dark:text-green-200 border border-green-500/20' : 
                            result.ats_score > 40 ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-200 border border-yellow-500/20' : 
                            'bg-red-500/10 text-red-700 dark:text-red-200 border border-red-500/20'
                          }`}>
                            {result.ats_score}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{result.skill_match}%</td>
                        <td className="px-6 py-4 text-sm text-[var(--text-secondary)] opacity-80 max-w-xs truncate" title={result.missing_skills}>
                          {result.missing_skills}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
