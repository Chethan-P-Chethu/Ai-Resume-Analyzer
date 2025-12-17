export default function Tabs({ tabs, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={
              'rounded-full px-4 py-2 text-xs font-semibold border transition shadow-sm ' +
              (active
                ? 'bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500 text-white border-transparent'
                : 'bg-slate-950/30 text-slate-200 border-white/10 hover:border-white/20 hover:bg-slate-900/30')
            }
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
