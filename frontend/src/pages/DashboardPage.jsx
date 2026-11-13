import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowUpRight, Boxes, PackageCheck, TentTree, UsersRound } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/auth'
import { Badge, Card, ErrorState, Loading, PageHeader, Table } from '../components/ui'

const number = new Intl.NumberFormat()

function StatCard({ title, value, icon: Icon, to }) {
  return <Card className="group p-5"><div className="flex items-start justify-between"><span className="grid size-12 place-items-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-200"><Icon size={23} /></span><Link to={to} className="rounded-lg p-1.5 text-slate-300 transition group-hover:bg-sky-50 group-hover:text-sky-600"><ArrowUpRight size={18} /></Link></div><p className="mt-5 text-sm font-medium text-slate-500">{title}</p><strong className="mt-1 block text-3xl font-black tracking-tight text-black">{number.format(value || 0)}</strong></Card>
}

function DistributionChart({ distributions }) {
  const points = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(); date.setDate(date.getDate() - (6 - index));
      return { key: date.toLocaleDateString('en-CA'), label: date.toLocaleDateString(undefined, { weekday: 'short' }), value: 0 }
    })
    distributions.forEach((item) => { const day = days.find((value) => String(item.distribution_date).startsWith(value.key)); if (day) day.value += 1 })
    const max = Math.max(...days.map((day) => day.value), 1)
    return days.map((day, index) => ({ ...day, x: 25 + index * 55, y: 150 - (day.value / max) * 115 }))
  }, [distributions])
  const line = points.map((point) => `${point.x},${point.y}`).join(' ')
  return <div className="mt-4"><svg viewBox="0 0 380 185" className="h-52 w-full" role="img" aria-label="Distributions over the last seven days"><defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0284c7" stopOpacity=".28"/><stop offset="1" stopColor="#0284c7" stopOpacity="0"/></linearGradient></defs>{[35,73,111,150].map((y) => <line key={y} x1="25" x2="355" y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4"/>)}<polygon points={`${line} 355,150 25,150`} fill="url(#chart-fill)"/><polyline points={line} fill="none" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>{points.map((point) => <g key={point.key}><circle cx={point.x} cy={point.y} r="4" fill="white" stroke="#0284c7" strokeWidth="3"/><text x={point.x} y="176" textAnchor="middle" fontSize="10" fill="#64748b">{point.label}</text></g>)}</svg></div>
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [state, setState] = useState({ loading: true, error: '', report: {}, inventory: [], distributions: [], requests: [], refugeeTotal: 0, familyTotal: 0 })
  const load = useCallback(async () => {
    setState((value) => ({ ...value, loading: true, error: '' }))
    try {
      const canReport = ['Administrator', 'Manager'].includes(user.role_name)
      const [inventory, distributions, requests, report, refugees, families] = await Promise.all([
        api('/inventory'), api('/distributions'), api('/resource-requests'), canReport ? api('/reports/dashboard') : Promise.resolve({ data: {} }),
        api('/refugees?limit=1'), api('/families?limit=1'),
      ])
      setState({ loading: false, error: '', report: report.data, inventory: inventory.data, distributions: distributions.data, requests: requests.data, refugeeTotal: refugees.pagination?.total || refugees.data.length, familyTotal: families.pagination?.total || families.data.length })
    } catch (error) { setState((value) => ({ ...value, loading: false, error: error.message })) }
  }, [user.role_name])
  useEffect(() => { load() }, [load])

  if (state.loading) return <Loading label="Preparing dashboard…" />
  const today = new Date().toLocaleDateString('en-CA')
  const lowStock = state.inventory.filter((item) => Boolean(item.is_low_stock))
  const stats = {
    refugees: state.report.active_refugees ?? state.refugeeTotal,
    families: state.report.families ?? state.familyTotal,
    resources: state.inventory.filter((item) => Number(item.quantity_available) > 0).length,
    distributed: state.distributions.filter((item) => String(item.distribution_date).startsWith(today)).length,
  }
  const recent = state.distributions.slice(0, 6)
  const sufficient = state.inventory.filter((item) => !item.is_low_stock).length
  const lowPercent = state.inventory.length ? Math.round((lowStock.length / state.inventory.length) * 100) : 0

  return <>
    <PageHeader title={`Good day, ${user.first_name}`} description={`${user.role_name} dashboard · live operational overview`} />
    {state.error && <ErrorState message={state.error} onRetry={load} />}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard title="Active Refugees" value={stats.refugees} icon={UsersRound} to="/refugees"/><StatCard title="Total Families" value={stats.families} icon={TentTree} to="/families"/><StatCard title="Available Resources" value={stats.resources} icon={Boxes} to="/inventory"/><StatCard title="Distributed Today" value={stats.distributed} icon={PackageCheck} to="/distributions"/></div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
      <Card className="p-5"><div><h2 className="font-bold text-black">Distribution Overview</h2><p className="text-xs text-slate-400">Last seven days</p></div><DistributionChart distributions={state.distributions}/></Card>
      <Card className="p-5"><h2 className="font-bold text-black">Resource Stock Status</h2><div className="mt-8 flex flex-col items-center gap-7 sm:flex-row sm:justify-center"><div className="grid size-40 place-items-center rounded-full" style={{ background: `conic-gradient(#0284c7 0 ${100-lowPercent}%, #f59e0b ${100-lowPercent}% 100%)` }}><div className="grid size-24 place-items-center rounded-full bg-white text-center"><span><strong className="block text-3xl text-black">{state.inventory.length}</strong><small className="text-slate-400">Resources</small></span></div></div><div className="space-y-3 text-sm"><p><i className="mr-2 inline-block size-3 rounded-sm bg-sky-600"/><b>{sufficient}</b> Sufficient</p><p><i className="mr-2 inline-block size-3 rounded-sm bg-amber-500"/><b>{lowStock.length}</b> Low stock</p></div></div></Card>
    </div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
      <Card><div className="flex items-center justify-between border-b border-slate-200 p-5"><h2 className="font-bold text-black">Recent Distributions</h2><Link to="/distributions" className="text-sm font-bold text-sky-600">View all</Link></div><Table rows={recent} keyField="distribution_id" columns={[{key:'distribution_date',label:'Date',render:(row)=>String(row.distribution_date).slice(0,10)},{key:'refugee_name',label:'Refugee',render:(row)=><span className="font-semibold text-black">{row.refugee_name}</span>},{key:'item_count',label:'Items'},{key:'distributed_by_username',label:'Distributed by'}]} /></Card>
      <Card><div className="flex items-center justify-between border-b border-slate-200 p-5"><h2 className="font-bold text-black">Low Stock Alerts</h2><Badge tone={lowStock.length ? 'amber' : 'green'}>{lowStock.length}</Badge></div><div className="divide-y divide-slate-100">{lowStock.slice(0,5).map((item)=><div key={item.resource_id} className="flex items-center gap-3 p-4"><span className="grid size-9 place-items-center rounded-xl bg-amber-50 text-amber-600"><AlertTriangle size={18}/></span><span className="min-w-0"><strong className="block truncate text-sm text-black">{item.resource_name}</strong><small className="text-slate-500">{item.quantity_available} {item.unit} remaining</small></span></div>)}{!lowStock.length&&<div className="p-8 text-center text-sm text-slate-400">All resources are above minimum stock.</div>}</div></Card>
    </div>
  </>
}
