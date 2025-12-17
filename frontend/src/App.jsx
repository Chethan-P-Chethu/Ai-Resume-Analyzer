import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  ListChecks,
  ShieldCheck,
  Sparkles,
  Target
} from 'lucide-react'

import { analyzeResume, analyzeCompare } from './api'
import { downloadAnalysisAsPDF } from './utils/pdfExportText';
import Card from './components/Card'
import FileDropzone from './components/FileDropzone'
import CompareDropzone from './components/CompareDropzone'
import ScoreMeter from './components/ScoreMeter'
import Sidebar from './components/Sidebar'
import Tabs from './components/Tabs'

function TextField({ label, value, onChange, placeholder }) {
  return (
    <div className="w-full">
      <label className="text-sm font-medium text-slate-200">{label}</label>
      <input
        className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 outline-none focus:border-slate-600 lg:px-6 lg:py-4"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

function SuggestionGroup({ title, subtitle, open, onToggle, onCopyAll, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/25">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
      >
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-slate-400">{subtitle}</div> : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onCopyAll()
            }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </button>
          {open ? <ChevronUp className="h-4 w-4 text-slate-300" /> : <ChevronDown className="h-4 w-4 text-slate-300" />}
        </div>
      </button>
      {open ? <div className="border-t border-white/10 px-4 py-4">{children}</div> : null}
    </div>
  )
}

function SuggestionItem({ text, checked, onToggle, onCopy }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/20 px-4 py-3">
      <button
        type="button"
        onClick={onToggle}
        className={
          'mt-0.5 h-5 w-5 shrink-0 rounded border transition ' +
          (checked ? 'border-emerald-400/40 bg-emerald-500/20' : 'border-white/15 bg-white/5 hover:bg-white/10')
        }
        aria-label={checked ? 'Mark suggestion as not done' : 'Mark suggestion as done'}
      />
      <div className={checked ? 'text-sm text-slate-400 line-through' : 'text-sm text-slate-200'}>{text}</div>
      <button
        type="button"
        onClick={onCopy}
        className="mt-0.5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10"
      >
        <Copy className="h-3.5 w-3.5" />
        Copy
      </button>
    </div>
  )
}

function Chip({ children, tone = 'neutral' }) {
  const toneClass =
    tone === 'good'
      ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-100'
      : tone === 'warn'
        ? 'border-amber-400/20 bg-amber-500/10 text-amber-100'
        : tone === 'bad'
          ? 'border-rose-400/20 bg-rose-500/10 text-rose-100'
          : 'border-white/10 bg-white/5 text-slate-200'

  return (
    <span
      className={
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold leading-none ' + toneClass
      }
    >
      {children}
    </span>
  )
}

function ChipList({ items, emptyText, tone = 'neutral', initialCount = 14 }) {
  const [expanded, setExpanded] = useState(false)
  const list = Array.isArray(items) ? items.filter(Boolean) : []
  if (list.length === 0) return <div className="text-sm text-slate-300">{emptyText}</div>

  const shown = expanded ? list : list.slice(0, initialCount)
  const remaining = Math.max(0, list.length - shown.length)

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {shown.map((x, idx) => (
          <Chip key={`${idx}-${x}`} tone={tone}>
            {x}
          </Chip>
        ))}
      </div>
      {list.length > initialCount ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-xs font-semibold text-slate-300 hover:text-white"
        >
          {expanded ? 'Show less' : `Show more (+${remaining})`}
        </button>
      ) : null}
    </div>
  )
}

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/30 px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-bold text-white tabular-nums">{value}%</div>
    </div>
  )
}

function InfoRow({ icon: Icon, title, children }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/40">
        <Icon className="h-4 w-4 text-slate-200" />
      </div>
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="mt-1 text-sm text-slate-300">{children}</div>
      </div>
    </div>
  )
}

function List({ items, emptyText }) {
  if (!items || items.length === 0) return <div className="text-sm text-slate-300">{emptyText}</div>
  return (
    <div className="space-y-2">
      {items.map((x, i) => (
        <div
          key={`${i}-${x}`}
          className="rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-3 text-sm text-slate-200"
        >
          {x}
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [jobTitle, setJobTitle] = useState('')
  const [file, setFile] = useState(null)
  const [file2, setFile2] = useState(null)
  const [tempFile, setTempFile] = useState(null)
  const [activeFeature, setActiveFeature] = useState('analyze')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [data2, setData2] = useState(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('overview')
  const [suggestionDone, setSuggestionDone] = useState({})
  const [suggestionOpen, setSuggestionOpen] = useState({
    skills: true,
    keywords: true,
    structure: true,
    content: true
  })

  const score = useMemo(() => data?.overall_score ?? 0, [data])
  const scoreBreakdown = useMemo(() => data?.scores || {}, [data])
  const gaps = useMemo(() => data?.gaps || {}, [data])
  const resume = useMemo(() => data?.resume || {}, [data])
  const job = useMemo(() => data?.job || {}, [data])

  useEffect(() => {
    setSuggestionDone({})
    setSuggestionOpen({ skills: true, keywords: true, structure: true, content: true })
  }, [data])

  const suggestionGroups = useMemo(() => {
    const items = Array.isArray(data?.suggestions) ? data.suggestions : []
    const groups = {
      skills: [],
      keywords: [],
      structure: [],
      content: []
    }

    for (const s of items) {
      const sl = String(s || '').toLowerCase()
      if (sl.includes('missing job skills') || (sl.includes('missing') && sl.includes('skills'))) {
        groups.skills.push(s)
      } else if (sl.includes('keyword')) {
        groups.keywords.push(s)
      } else if (sl.includes('projects section') || sl.includes('projects') || sl.includes('sections') || sl.includes('ats') || sl.includes('bullet')) {
        groups.structure.push(s)
      } else {
        groups.content.push(s)
      }
    }

    const out = [
      {
        key: 'skills',
        title: 'Skills alignment',
        subtitle: `${groups.skills.length} items`,
        items: groups.skills
      },
      {
        key: 'keywords',
        title: 'Keyword tuning',
        subtitle: `${groups.keywords.length} items`,
        items: groups.keywords
      },
      {
        key: 'structure',
        title: 'Structure / ATS formatting',
        subtitle: `${groups.structure.length} items`,
        items: groups.structure
      },
      {
        key: 'content',
        title: 'Content improvements',
        subtitle: `${groups.content.length} items`,
        items: groups.content
      }
    ]

    return out.filter((g) => g.items.length > 0)
  }, [data])

  async function onAnalyze() {
    setError('')
    setData(null)
    setData2(null)

    if (!jobTitle.trim()) {
      setError('Please enter a job title')
      return
    }
    if (jobTitle.trim().length < 2) {
      setError('Job title must be at least 2 characters long')
      return
    }
    if (!file) {
      setError('Please upload a PDF resume')
      return
    }

    setLoading(true)
    try {
      const res = await analyzeResume({ jobTitle, file })
      setData(res)
      setTab('overview')
    } catch (e) {
      setError(e?.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  async function onAnalyzeCompare() {
    setError('')
    setData(null)
    setData2(null)

    if (!jobTitle.trim()) {
      setError('Please enter a job title')
      return
    }
    if (jobTitle.trim().length < 2) {
      setError('Job title must be at least 2 characters long')
      return
    }
    if (!file) {
      setError('Please upload the first resume PDF')
      return
    }
    if (!file2) {
      setError('Please upload the second resume PDF')
      return
    }

    setLoading(true)
    try {
      const { data1, data2: res2 } = await analyzeCompare({ jobTitle, file1: file, file2 })
      setData(data1)
      setData2(res2)
    } catch (e) {
      setError(e?.message || 'Comparison failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-grid">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-240px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-500/25 to-indigo-500/0 blur-3xl" />
        <div className="absolute right-[-220px] top-[120px] h-[520px] w-[520px] rounded-full bg-gradient-to-b from-emerald-500/20 to-emerald-500/0 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="w-full lg:w-64 lg:flex-shrink-0">
            <Sidebar activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
          </div>
          <div className="flex-1 min-w-0">
            {activeFeature === 'analyze' && (
              <div>
                <motion.header
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col gap-3">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-800 bg-slate-900/40 px-4 py-2 text-xs text-slate-200 shadow-soft">
                      <Sparkles className="h-4 w-4" />
                      AI Resume Analyzer
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                      Upload your resume PDF. Get an ATS-style match score.
                    </h1>
                    <p className="max-w-2xl text-sm text-slate-300">
                      Enter a target job title. We extract skills/keywords, compute similarity, and highlight gaps + missing sections.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                    <div className="sm:col-span-1 lg:col-span-1">
                      <TextField
                        label="Job title"
                        value={jobTitle}
                        onChange={setJobTitle}
                        placeholder="e.g., Data Analyst"
                      />
                      <FileDropzone file={file} onPick={setFile} className="w-full" />
                    </div>
                  </div>
                </motion.header>

                <main className="mt-8">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <Card
                      title="Inputs"
                      subtitle="Enter job title. Then upload your resume PDF."
                    >
                      <div className="space-y-5">
                        <button
                          onClick={onAnalyze}
                          disabled={loading}
                          className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-soft hover:from-sky-400 hover:via-indigo-400 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {loading ? 'Analyzing…' : 'Analyze match'}
                        </button>

                        {error ? (
                          <div className="flex items-start gap-2 rounded-xl border border-rose-900/60 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
                            <AlertCircle className="mt-0.5 h-4 w-4" />
                            <div>{error}</div>
                          </div>
                        ) : null}

                        {!error && data ? (
                          <div className="flex items-start gap-2 rounded-xl border border-emerald-900/60 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
                            <BadgeCheck className="mt-0.5 h-4 w-4" />
                            <div>Analysis ready for: {data.job_title}</div>
                          </div>
                        ) : null}
                      </div>
                    </Card>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card
                      title="Analysis Results"
                      subtitle={data ? `Analysis for: ${data.job_title}` : 'Upload a resume to see analysis results.'}
                      className="mt-6"
                      action={
                        data && (
                          <button
                            onClick={() => downloadAnalysisAsPDF(data, data.job_title)}
                            className="ml-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10"
                            title="Download analysis as PDF"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M12 2l-5 5h10M12 2l5 5" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l4 4 4-4M7 17l4-4-4" />
                            </svg>
                          </button>
                        )
                      }
                    >
                      {data ? (
                        <div id="results-container" className="space-y-6">
                          {/* Prominent PDF Download Button */}
                          <div className="flex justify-end mb-4">
                            <button
                              onClick={() => downloadAnalysisAsPDF(data, data.job_title)}
                              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:from-sky-400 hover:via-indigo-400 hover:to-fuchsia-400 transition-all duration-200"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M12 2l-5 5h10M12 2l5 5" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l4 4 4-4M7 17l4-4-4" />
                              </svg>
                              Download PDF Report
                            </button>
                          </div>

                          <Tabs
                            value={tab}
                            onChange={setTab}
                            tabs={[
                              { value: 'overview', label: 'Overview' },
                              { value: 'skills', label: 'Skills' },
                              { value: 'keywords', label: 'Keywords' },
                              { value: 'sections', label: 'Sections' },
                              { value: 'market', label: 'Market Insights' },
                              { value: 'skill_gap', label: 'Skill Gap' },
                              { value: 'suggestions', label: 'Suggestions' }
                            ]}
                          />

                          {tab === 'overview' ? (
                            <div className="space-y-6">
                              <ScoreMeter score={score} />
                              <div className="grid gap-3 sm:grid-cols-2">
                                <MetricCard label="Similarity" value={scoreBreakdown.similarity || 0} />
                                <MetricCard label="Skill coverage" value={scoreBreakdown.skills || 0} />
                                <MetricCard label="Keyword match" value={scoreBreakdown.keywords || 0} />
                                <MetricCard label="Sections" value={scoreBreakdown.sections || 0} />
                              </div>

                              <div className="rounded-2xl border border-slate-800 bg-slate-950/30 px-4 py-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                  <ListChecks className="h-4 w-4" />
                                  Quick gaps
                                </div>
                                <div className="mt-2 text-sm text-slate-300">
                                  Missing skills: <span className="font-semibold text-slate-100">{(gaps.missing_skills || []).length}</span>
                                  <span className="mx-2 text-slate-600">|</span>
                                  Missing keywords: <span className="font-semibold text-slate-100">{(gaps.missing_keywords || []).length}</span>
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {tab === 'skills' ? (
                            <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
                              <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-4">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="text-sm font-semibold text-white">Job skills</div>
                                  <div className="text-xs font-semibold text-slate-400">{(job.skills || []).length}</div>
                                </div>
                                <div className="mt-3">
                                  <ChipList
                                    items={job.skills}
                                    emptyText="Not detected — try a more specific job title"
                                    tone="neutral"
                                  />
                                </div>
                              </div>

                              <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-4">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="text-sm font-semibold text-white">Resume skills</div>
                                  <div className="text-xs font-semibold text-slate-400">{(resume.skills || []).length}</div>
                                </div>
                                <div className="mt-3">
                                  <ChipList items={resume.skills} emptyText="Not detected — add a Skills section" tone="good" />
                                </div>
                              </div>

                              <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-4 sm:col-span-1 lg:col-span-2">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="text-sm font-semibold text-white">Missing skills</div>
                                  <div className="text-xs font-semibold text-slate-400">{(gaps.missing_skills || []).length}</div>
                                </div>
                                <div className="mt-3">
                                  <ChipList
                                    items={gaps.missing_skills}
                                    emptyText="Great — no missing skills detected"
                                    tone="warn"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {tab === 'keywords' ? (
                            <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
                              <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-4">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="text-sm font-semibold text-white">Job keywords</div>
                                  <div className="text-xs font-semibold text-slate-400">{(job.top_keywords || []).length}</div>
                                </div>
                                <div className="mt-3">
                                  <ChipList items={job.top_keywords} emptyText="Not detected" tone="neutral" />
                                </div>
                              </div>

                              <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-4">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="text-sm font-semibold text-white">Resume keywords</div>
                                  <div className="text-xs font-semibold text-slate-400">{(resume.top_keywords || []).length}</div>
                                </div>
                                <div className="mt-3">
                                  <ChipList items={resume.top_keywords} emptyText="Not detected" tone="good" />
                                </div>
                              </div>

                              <div className="rounded-2xl border border-white/10 bg-slate-950/25 px-4 py-4 sm:col-span-1 lg:col-span-2">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="text-sm font-semibold text-white">Missing keywords</div>
                                  <div className="text-xs font-semibold text-slate-400">{(gaps.missing_keywords || []).length}</div>
                                </div>
                                <div className="mt-3">
                                  <ChipList
                                    items={gaps.missing_keywords}
                                    emptyText="Great — no missing keywords detected"
                                    tone="warn"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {tab === 'sections' ? (
                            <div className="grid gap-3">
                              {Object.entries(resume.sections_present || {}).map(([k, v]) => (
                                <div
                                  key={k}
                                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-3"
                                >
                                  <div className="text-sm font-semibold text-white">{k}</div>
                                  <div className={v ? 'text-sm font-semibold text-emerald-200' : 'text-sm font-semibold text-amber-200'}>
                                    {v ? 'Present' : 'Missing'}
                                  </div>
                                </div>
                              ))}
                              <div className="pt-2 text-xs text-slate-400">
                                Tip: sections improve readability and ATS parsing. Projects + Experience + Skills are the biggest wins.
                              </div>
                            </div>
                          ) : null}

                          {tab === 'market' ? (
                            <div className="space-y-6">
                              {data.market_insights ? (
                                <>
                                  <div className="grid gap-4 lg:grid-cols-2">
                                    <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                                      <div className="text-sm font-semibold text-white mb-3">Market Demand</div>
                                      <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-300">Demand Score:</span>
                                          <span className="text-emerald-400 font-semibold">{data.market_insights.demand_score.toFixed(1)}/10</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-300">Growth Rate:</span>
                                          <span className="text-blue-400 font-semibold">+{(data.market_insights.growth_rate * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2">
                                          <div 
                                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full" 
                                            style={{ width: `${data.market_insights.demand_score * 10}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                                      <div className="text-sm font-semibold text-white mb-3">Salary Range</div>
                                      <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-300">Minimum:</span>
                                          <span className="text-emerald-400 font-semibold">
                                            ${data.market_insights.salary_range.min?.toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-300">Median:</span>
                                          <span className="text-blue-400 font-semibold">
                                            ${data.market_insights.salary_range.median?.toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-300">Maximum:</span>
                                          <span className="text-purple-400 font-semibold">
                                            ${data.market_insights.salary_range.max?.toLocaleString()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                                    <div className="text-sm font-semibold text-white mb-3">Trending Skills</div>
                                    <div className="flex flex-wrap gap-2">
                                      {data.market_insights.trending_skills.slice(0, 12).map((skill, idx) => (
                                        <Chip key={idx} tone="good" className="text-xs">{skill}</Chip>
                                      ))}
                                      {data.market_insights.trending_skills.length > 12 && (
                                        <span className="text-xs text-slate-400">
                                          +{data.market_insights.trending_skills.length - 12} more
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
                                    <div className="text-sm font-semibold text-white mb-3">Market Insights</div>
                                    <div className="space-y-2">
                                      {data.market_insights.market_insights.map((insight, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                          <div className="h-2 w-2 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />
                                          <span>{insight}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="text-sm text-slate-300">
                                  Market insights not available for this role.
                                </div>
                              )}
                            </div>
                          ) : null}

                          {tab === 'skill_gap' ? (
                            <div className="space-y-6">
                              {data.skill_gap_analysis ? (
                                <>
                                  {/* Skill Coverage Overview */}
                                  <div className="grid gap-4 lg:grid-cols-3">
                                    <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                                      <div className="text-sm font-semibold text-white mb-3">Skill Coverage</div>
                                      <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-slate-300">Coverage:</span>
                                          <span className="text-emerald-400 font-semibold">{data.skill_gap_analysis.skill_coverage_percentage}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2">
                                          <div 
                                            className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full" 
                                            style={{ width: `${data.skill_gap_analysis.skill_coverage_percentage}%` }}
                                          ></div>
                                        </div>
                                        <div className="text-xs text-slate-400">
                                          {data.skill_gap_analysis.total_matched} of {data.skill_gap_analysis.total_matched + data.skill_gap_analysis.total_missing} skills matched
                                        </div>
                                      </div>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                                      <div className="text-sm font-semibold text-white mb-3">Gap Severity</div>
                                      <div className="mt-2">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                          data.skill_gap_analysis.gap_analysis.overall_gap_severity === 'low' ? 'bg-emerald-900/40 text-emerald-300' :
                                          data.skill_gap_analysis.gap_analysis.overall_gap_severity === 'medium' ? 'bg-amber-900/40 text-amber-300' :
                                          'bg-rose-900/40 text-rose-300'
                                        }`}>
                                          {data.skill_gap_analysis.gap_analysis.overall_gap_severity.charAt(0).toUpperCase() + data.skill_gap_analysis.gap_analysis.overall_gap_severity.slice(1)} Priority Gap
                                        </span>
                                      </div>
                                    </div>

                                    <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                                      <div className="text-sm font-semibold text-white mb-3">Skills Status</div>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-emerald-400">Matched:</span>
                                          <span className="text-emerald-400 font-semibold">{data.skill_gap_analysis.total_matched}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-rose-400">Missing:</span>
                                          <span className="text-rose-400 font-semibold">{data.skill_gap_analysis.total_missing}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Missing Skills Breakdown */}
                                  <div className="grid gap-4 lg:grid-cols-2">
                                    <div className="rounded-2xl border border-rose-900/30 bg-rose-950/20 p-4">
                                      <div className="text-sm font-semibold text-white mb-3">
                                        Critical Missing Skills
                                        <span className="ml-2 text-xs text-rose-400">({data.skill_gap_analysis.missing_skills.critical.length})</span>
                                      </div>
                                      <div className="space-y-2">
                                        {data.skill_gap_analysis.missing_skills.critical.length > 0 ? (
                                          data.skill_gap_analysis.missing_skills.critical.map((skill, idx) => (
                                            <div key={idx} className="flex items-center justify-between rounded-lg border border-rose-800/50 bg-rose-900/20 px-3 py-2">
                                              <span className="text-sm text-rose-300">{skill}</span>
                                              <span className="text-xs text-rose-400">High Priority</span>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-sm text-emerald-300">No critical gaps!</div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="rounded-2xl border border-amber-900/30 bg-amber-950/20 p-4">
                                      <div className="text-sm font-semibold text-white mb-3">
                                        Important Missing Skills
                                        <span className="ml-2 text-xs text-amber-400">({data.skill_gap_analysis.missing_skills.important.length})</span>
                                      </div>
                                      <div className="space-y-2">
                                        {data.skill_gap_analysis.missing_skills.important.length > 0 ? (
                                          data.skill_gap_analysis.missing_skills.important.map((skill, idx) => (
                                            <div key={idx} className="flex items-center justify-between rounded-lg border border-amber-800/50 bg-amber-900/20 px-3 py-2">
                                              <span className="text-sm text-amber-300">{skill}</span>
                                              <span className="text-xs text-amber-400">Medium Priority</span>
                                            </div>
                                          ))
                                        ) : (
                                          <div className="text-sm text-emerald-300">No important gaps!</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Matched Skills */}
                                  {data.skill_gap_analysis.matched_skills.length > 0 && (
                                    <div className="rounded-2xl border border-emerald-900/30 bg-emerald-950/20 p-4">
                                      <div className="text-sm font-semibold text-white mb-3">
                                        Matched Skills
                                        <span className="ml-2 text-xs text-emerald-400">({data.skill_gap_analysis.matched_skills.length})</span>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {data.skill_gap_analysis.matched_skills.map((skill, idx) => (
                                          <Chip key={idx} tone="good" className="text-xs">{skill}</Chip>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Learning Recommendations */}
                                  {data.skill_gap_analysis.learning_recommendations.length > 0 && (
                                    <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
                                      <div className="text-sm font-semibold text-white mb-3">Learning Recommendations</div>
                                      <div className="space-y-4">
                                        {data.skill_gap_analysis.learning_recommendations.map((rec, idx) => (
                                          <div key={idx} className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
                                            <div className="flex items-start justify-between mb-2">
                                              <div>
                                                <div className="flex items-center gap-2">
                                                  <span className="text-sm font-semibold text-white">{rec.skill}</span>
                                                  <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${
                                                    rec.priority === 'critical' ? 'bg-rose-900/40 text-rose-300' :
                                                    'bg-amber-900/40 text-amber-300'
                                                  }`}>
                                                    {rec.priority}
                                                  </span>
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1">
                                                  {rec.estimated_time} • {rec.difficulty}
                                                </div>
                                              </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                              <div className="text-xs text-slate-300">Recommended Courses:</div>
                                              <div className="space-y-1">
                                                {rec.recommended_courses.map((course, courseIdx) => (
                                                  <div key={courseIdx} className="text-xs text-slate-200">• {course}</div>
                                                ))}
                                              </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                              <div className="text-xs text-slate-300">Platforms:</div>
                                              <div className="flex flex-wrap gap-1">
                                                {rec.platforms.map((platform, platformIdx) => (
                                                  <span key={platformIdx} className="inline-flex items-center rounded-md border border-slate-600 bg-slate-800/50 px-2 py-0.5 text-xs text-slate-200">
                                                    {platform}
                                                  </span>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-sm text-slate-300">
                                  Skill gap analysis not available for this role.
                                </div>
                              )}
                            </div>
                          ) : null}

                          {tab === 'suggestions' ? (
                            <div className="space-y-4">
                              {suggestionGroups.length ? (
                                <div className="space-y-4">
                                  {suggestionGroups.map((g) => {
                                    const open = !!suggestionOpen[g.key]
                                    const doneCount = g.items.reduce((acc, _, idx) => {
                                      const id = `${g.key}-${idx}`
                                      return acc + (suggestionDone[id] ? 1 : 0)
                                    }, 0)

                                    return (
                                      <SuggestionGroup
                                        key={g.key}
                                        title={g.title}
                                        subtitle={`${doneCount}/${g.items.length} done`}
                                        open={open}
                                        onToggle={() => setSuggestionOpen((s) => ({ ...s, [g.key]: !s[g.key] }))}
                                        onCopyAll={async () => {
                                          try {
                                            await navigator.clipboard.writeText(g.items.join('\n'))
                                          } catch {
                                            // ignore
                                          }
                                        }}
                                      >
                                        <div className="space-y-2">
                                          {g.items.map((text, idx) => {
                                            const id = `${g.key}-${idx}`
                                            const checked = !!suggestionDone[id]
                                            return (
                                              <SuggestionItem
                                                key={id}
                                                text={text}
                                                checked={checked}
                                                onToggle={() => setSuggestionDone((s) => ({ ...s, [id]: !s[id] }))}
                                                onCopy={async () => {
                                                  try {
                                                    await navigator.clipboard.writeText(text)
                                                  } catch {
                                                    // ignore
                                                  }
                                                }}
                                              />
                                            )
                                          })}
                                        </div>
                                      </SuggestionGroup>
                                    )
                                  })}
                                </div>
                              ) : (
                                <div className="text-sm text-slate-300">No suggestions available.</div>
                              )}

                              <div className="pt-2 text-xs text-slate-400">
                                Always be truthful: only add skills/keywords you actually have.
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-300">
                          Enter a job title and upload a resume PDF to generate your report.
                        </div>
                      )}
                    </Card>
                  </motion.div>
                </main>
              </div>
            )}

            {activeFeature === 'compare' && (
              <div>
                <motion.header
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex flex-col gap-3">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-800 bg-slate-900/40 px-4 py-2 text-xs text-slate-200 shadow-soft">
                      <Sparkles className="h-4 w-4" />
                      Compare Resumes
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                      Compare two resumes side-by-side
                    </h1>
                    <p className="max-w-2xl text-sm text-slate-300">
                      Enter a job title and upload two resumes to compare their scores, skills, and see which resume is better suited for the position.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <TextField
                        label="Job title"
                        value={jobTitle}
                        onChange={setJobTitle}
                        placeholder="e.g., Data Analyst"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="h-full">
                        <div className="text-sm font-medium text-slate-200 mb-2">First resume</div>
                        <FileDropzone file={file} onPick={setFile} />
                      </div>
                      <div className="h-full">
                        <div className="text-sm font-medium text-slate-200 mb-2">Second resume</div>
                        <CompareDropzone file={file2} onPick={setFile2} onRemove={() => setFile2(null)} />
                      </div>
                    </div>
                  </div>
                </motion.header>

                <main className="mt-8">
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <Card
                      title="Inputs"
                      subtitle="Enter job title and upload two resumes to compare."
                    >
                      <div className="space-y-5">
                        <button
                          onClick={onAnalyzeCompare}
                          disabled={loading || !file || !file2}
                          className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-soft hover:from-sky-400 hover:via-indigo-400 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {loading ? 'Analyzing…' : 'Compare resumes'}
                        </button>

                        {error ? (
                          <div className="flex items-start gap-2 rounded-xl border border-rose-900/60 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
                            <AlertCircle className="mt-0.5 h-4 w-4" />
                            <div>{error}</div>
                          </div>
                        ) : null}

                        {!error && data && data2 ? (
                          <div className="flex items-start gap-2 rounded-xl border border-emerald-900/60 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200">
                            <BadgeCheck className="mt-0.5 h-4 w-4" />
                            <div>Comparison ready for: {data.job_title}</div>
                          </div>
                        ) : null}
                      </div>
                    </Card>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card
                      title="Comparison Results"
                      subtitle={data && data2 ? `Comparing resumes for: ${data.job_title}` : 'Upload both resumes to see comparison results.'}
                      className="mt-6"
                      action={data && data2 && (
                        <button
                          onClick={() => downloadAnalysisAsPDF(data, data.job_title, data2, file2?.name)}
                          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:from-sky-400 hover:via-indigo-400 hover:to-fuchsia-400 transition-all duration-200"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M12 2l-5 5h10M12 2l5 5" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l4 4 4-4M7 17l4-4-4" />
                          </svg>
                          Download Comparison PDF
                        </button>
                      )}
                    >
                      {data && data2 ? (
                        <div className="space-y-4">
                          {/* Winner Declaration */}
                          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 px-4 py-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-white">Comparison Winner</h3>
                                <div className="text-sm text-slate-400">Job: {data.job_title}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-emerald-400">
                                  {data.overall_score > data2.overall_score ? 'Resume 1' : data2.overall_score > data.overall_score ? 'Resume 2' : 'Tie'}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {Math.abs(data.overall_score - data2.overall_score)}% difference
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Compact Comparison Grid */}
                          <div className="grid gap-4 lg:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <div className="text-sm font-semibold text-white">Resume 1</div>
                                  <div className="text-xs text-slate-400">{file?.name}</div>
                                </div>
                                <ScoreMeter score={data.overall_score || 0} />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <MetricCard label="Similarity" value={data.scores?.similarity || 0} />
                                <MetricCard label="Skills" value={data.scores?.skills || 0} />
                                <MetricCard label="Keywords" value={data.scores?.keywords || 0} />
                                <MetricCard label="Sections" value={data.scores?.sections || 0} />
                              </div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <div className="text-sm font-semibold text-white">Resume 2</div>
                                  <div className="text-xs text-slate-400">{file2?.name}</div>
                                </div>
                                <ScoreMeter score={data2.overall_score || 0} />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <MetricCard label="Similarity" value={data2.scores?.similarity || 0} />
                                <MetricCard label="Skills" value={data2.scores?.skills || 0} />
                                <MetricCard label="Keywords" value={data2.scores?.keywords || 0} />
                                <MetricCard label="Sections" value={data2.scores?.sections || 0} />
                              </div>
                            </div>
                          </div>

                          {/* Skills & Analysis Row */}
                          <div className="grid gap-4 lg:grid-cols-2">
                            {/* Skills Comparison */}
                            <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                              <div className="text-sm font-semibold text-white mb-3">Skills Comparison</div>
                              <div className="space-y-3">
                                <div>
                                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Resume 1</div>
                                  <div className="flex flex-wrap gap-1">
                                    {(data.resume?.skills || []).slice(0, 6).map((skill, idx) => (
                                      <Chip key={idx} tone="good" className="text-xs">{skill}</Chip>
                                    ))}
                                    {(data.resume?.skills || []).length > 6 && (
                                      <span className="text-xs text-slate-400">+{(data.resume?.skills || []).length - 6}</span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Resume 2</div>
                                  <div className="flex flex-wrap gap-1">
                                    {(data2.resume?.skills || []).slice(0, 6).map((skill, idx) => (
                                      <Chip key={idx} tone="good" className="text-xs">{skill}</Chip>
                                    ))}
                                    {(data2.resume?.skills || []).length > 6 && (
                                      <span className="text-xs text-slate-400">+{(data2.resume?.skills || []).length - 6}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Overlap Analysis */}
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
                              <div className="text-sm font-semibold text-white mb-3">Overlap Analysis</div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-300">Common skills:</span>
                                  <span className="text-emerald-400 font-semibold">
                                    {(() => {
                                      const skills1 = new Set(data.resume?.skills || [])
                                      const skills2 = new Set(data2.resume?.skills || [])
                                      const common = [...skills1].filter(skill => skills2.has(skill))
                                      return common.length
                                    })()}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-300">Unique to Resume 1:</span>
                                  <span className="text-blue-400 font-semibold">
                                    {(() => {
                                      const skills1 = new Set(data.resume?.skills || [])
                                      const skills2 = new Set(data2.resume?.skills || [])
                                      const unique = [...skills1].filter(skill => !skills2.has(skill))
                                      return unique.length
                                    })()}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-300">Unique to Resume 2:</span>
                                  <span className="text-purple-400 font-semibold">
                                    {(() => {
                                      const skills1 = new Set(data.resume?.skills || [])
                                      const skills2 = new Set(data2.resume?.skills || [])
                                      const unique = [...skills2].filter(skill => !skills1.has(skill))
                                      return unique.length
                                    })()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Recommendations */}
                          <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
                            <div className="text-sm font-semibold text-white mb-2">Quick Recommendations</div>
                            <div className="grid gap-2 sm:grid-cols-3">
                              <div className="flex items-center gap-2 text-xs text-slate-300">
                                <div className="h-2 w-2 rounded-full bg-emerald-400 flex-shrink-0" />
                                <span>
                                  {data.overall_score > data2.overall_score 
                                    ? 'Resume 1 is stronger' 
                                    : data2.overall_score > data.overall_score 
                                    ? 'Resume 2 is stronger'
                                    : 'Both are equally matched'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-300">
                                <div className="h-2 w-2 rounded-full bg-blue-400 flex-shrink-0" />
                                <span>
                                  {Math.abs(data.overall_score - data2.overall_score) > 20 
                                    ? 'Combine best elements'
                                    : 'Both well-aligned'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-300">
                                <div className="h-2 w-2 rounded-full bg-amber-400 flex-shrink-0" />
                                <span>Improve weaker resume</span>
                              </div>
                            </div>
                          </div>

                          {/* Add Another Resume Section */}
                          <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-4">
                            <div className="text-sm font-semibold text-white mb-3">Compare Another Resume</div>
                            <div className="space-y-3">
                              <div className="text-xs text-slate-400">
                                Upload a third resume to compare against the current winner
                              </div>
                              <CompareDropzone 
                                file={tempFile} 
                                onPick={(newFile) => {
                                  setTempFile(newFile);
                                }} 
                                onRemove={() => {
                                  setTempFile(null);
                                }}
                              />
                              <button
                                onClick={() => {
                                  // Replace the weaker resume with the new one and analyze
                                  if (tempFile) {
                                    if (data.overall_score >= data2.overall_score) {
                                      setFile2(tempFile);
                                      setData2(null);
                                    } else {
                                      setFile(tempFile);
                                      setData(null);
                                    }
                                    setTempFile(null);
                                    // Trigger analysis after a short delay to allow state to update
                                    setTimeout(() => {
                                      onAnalyzeCompare();
                                    }, 100);
                                  }
                                }}
                                disabled={!tempFile}
                                className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 px-3 py-2 text-sm font-semibold text-white shadow-soft hover:from-sky-400 hover:via-indigo-400 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {tempFile ? 'Replace & Analyze' : 'Upload Resume First'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-300">
                          Upload both resumes and enter a job title to generate comparison results.
                        </div>
                      )}
                    </Card>
                  </motion.div>
                </main>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
