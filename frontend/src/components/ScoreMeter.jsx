import { motion } from 'framer-motion'

function scoreTone(score) {
  if (score >= 80) return 'from-emerald-400 to-emerald-200'
  if (score >= 60) return 'from-sky-400 to-sky-200'
  if (score >= 40) return 'from-amber-400 to-amber-200'
  return 'from-rose-400 to-rose-200'
}

export default function ScoreMeter({ score }) {
  const width = Math.max(0, Math.min(100, score))

  return (
    <div className="w-full">
      <div className="flex items-end justify-between">
        <div className="text-sm font-semibold text-white">Match Score</div>
        <div className="text-2xl font-bold text-white tabular-nums">{width}%</div>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className={`h-full rounded-full bg-gradient-to-r ${scoreTone(width)}`}
        />
      </div>
      <div className="mt-2 text-xs text-slate-300">
        Higher scores mean your resume aligns better with the target role in skills, keywords, and overall relevance.
      </div>
    </div>
  )
}
