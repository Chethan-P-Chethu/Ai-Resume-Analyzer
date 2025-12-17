import { motion } from 'framer-motion'
import { FileUp } from 'lucide-react'

export default function FileDropzone({ file, onPick }) {
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
        <div className="text-sm font-semibold text-white">Upload your resume (PDF)</div>
        <div className="mt-1 text-xs text-slate-300">
          {file ? `Selected: ${file.name}` : 'Click to choose a file'}
        </div>
      </div>
      <div className="text-xs text-slate-400">Tip: text-based PDFs work best (not scanned images).</div>
    </motion.label>
  )
}
