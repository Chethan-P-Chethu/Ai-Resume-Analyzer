import { motion } from 'framer-motion'
import { FileUp } from 'lucide-react'

export default function CompareDropzone({ file, onPick, onRemove }) {
  return (
    <motion.label
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 px-6 py-8 text-center hover:border-slate-500"
    >
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onPick(f)
        }}
      />
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60 group-hover:border-slate-600">
        <FileUp className="h-6 w-6 text-slate-200" />
      </div>
      <div>
        <div className="text-sm font-semibold text-white">Upload another resume (PDF)</div>
        <div className="mt-1 text-xs text-slate-300">
          {file ? `Selected: ${file.name}` : 'Click to choose a file'}
        </div>
      </div>
      {file && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onRemove()
          }}
          className="absolute top-2 right-2 rounded-full border border-rose-500/20 bg-rose-500/10 p-1 text-xs font-semibold text-rose-200 hover:bg-rose-500/20"
        >
          ×
        </button>
      )}
      <div className="text-xs text-slate-400">Compare against the current winner</div>
    </motion.label>
  )
}
