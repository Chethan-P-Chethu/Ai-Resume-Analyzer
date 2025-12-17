import { ChevronRight, FileText, Layers } from 'lucide-react'

export default function Sidebar({ activeFeature, onFeatureChange }) {
  const features = [
    { key: 'analyze', label: 'Analyze', icon: FileText },
    { key: 'compare', label: 'Compare', icon: Layers },
  ]

  return (
    <div className="w-64 rounded-2xl border border-white/10 bg-slate-950/25 p-4 space-y-2">
      <h2 className="text-sm font-semibold text-white mb-4">Features</h2>
      <nav className="space-y-1">
        {features.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => onFeatureChange(f.key)}
            className={
              'w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition ' +
              (activeFeature === f.key
                ? 'border-emerald-400/40 bg-emerald-500/20 text-white'
                : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10')
            }
          >
            <f.icon className="h-4 w-4" />
            <span>{f.label}</span>
            {activeFeature === f.key && <ChevronRight className="ml-auto h-4 w-4" />}
          </button>
        ))}
      </nav>
    </div>
  )
}
