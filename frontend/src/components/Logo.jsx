import { TentTree } from 'lucide-react'

export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-600 text-white shadow-md shadow-sky-200"><TentTree size={23} /></span>
      {!compact && <span className="leading-tight"><strong className="block text-sm font-extrabold tracking-tight text-sky-700">REFUGEE CAMP</strong><small className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Resource Distribution System</small></span>}
    </div>
  )
}
