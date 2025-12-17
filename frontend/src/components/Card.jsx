export default function Card({ title, subtitle, right, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/35 shadow-soft backdrop-blur ring-1 ring-white/5">
      {(title || subtitle || right) && (
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-slate-300">{subtitle}</p>}
          </div>
          {right ? <div className="shrink-0">{right}</div> : null}
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}
