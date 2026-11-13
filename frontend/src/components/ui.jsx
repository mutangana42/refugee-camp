import { X } from 'lucide-react'

export function Card({ children, className = '' }) {
  return <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>
}

export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function Button({ children, variant = 'primary', className = '', type = 'button', ...props }) {
  const variants = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-200',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-200',
  }
  return (
    <button type={type} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Badge({ children, tone = 'slate' }) {
  const tones = {
    sky: 'bg-sky-50 text-sky-700 ring-sky-200', green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200', red: 'bg-red-50 text-red-700 ring-red-200',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  }
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${tones[tone] || tones.slate}`}>{children}</span>
}

export function StatusBadge({ status }) {
  const tone = ({ Active: 'green', Available: 'green', Approved: 'green', Completed: 'sky', Pending: 'amber',
    Inactive: 'slate', Occupied: 'sky', Maintenance: 'amber', Rejected: 'red', Transferred: 'amber', Returned: 'slate' })[status]
  return <Badge tone={tone}>{status}</Badge>
}

export function Field({ label, children, hint }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span>{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {hint && <span className="mt-1 block text-xs font-normal text-slate-400">{hint}</span>}
    </label>
  )
}

export const inputClass = 'min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-black outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100';

export function Dialog({ open, onClose, title, children, size = 'max-w-2xl' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" className={`my-8 w-full ${size} rounded-2xl bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-black">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-black" aria-label="Close"><X size={20} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export function Loading({ label = 'Loading data…' }) {
  return <div className="grid min-h-52 place-items-center text-sm text-slate-500"><span className="flex items-center gap-3"><i className="size-5 animate-spin rounded-full border-2 border-slate-200 border-t-sky-600" />{label}</span></div>
}

export function ErrorState({ message, onRetry }) {
  return <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><p>{message}</p>{onRetry && <button className="mt-2 font-bold underline" onClick={onRetry}>Try again</button>}</div>
}

export function EmptyState({ message = 'No records found.' }) {
  return <div className="grid min-h-40 place-items-center p-6 text-sm text-slate-400">{message}</div>
}

export function Table({ columns, rows, keyField, empty = 'No records found.' }) {
  if (!rows?.length) return <EmptyState message={empty} />
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead><tr className="border-b border-slate-200 bg-slate-50/80">{columns.map((column) => <th key={column.key} className="whitespace-nowrap px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">{column.label}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{rows.map((row, index) => (
          <tr key={`${row[keyField] ?? 'row'}-${index}`} className="transition hover:bg-sky-50/40">{columns.map((column) => <td key={column.key} className="px-5 py-3.5 text-slate-700">{column.render ? column.render(row) : row[column.key] ?? '—'}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  )
}
