import { Bell, CheckCheck, PackageOpen } from 'lucide-react'
import { api } from '../api/client'
import { useApiData } from '../api/useApiData'
import { Button, Card, ErrorState, Loading, PageHeader } from '../components/ui'

export default function NotificationsPage() {
  const { data, loading, error, load } = useApiData('/notifications')

  async function markRead(id) {
    await api(`/notifications/${id}/read`, { method: 'PATCH' })
    await load()
  }

  async function markAllRead() {
    await api('/notifications/read-all', { method: 'PATCH' })
    await load()
  }

  return <>
    <PageHeader title="Notifications" description="Stock alerts and operational updates for your account." action={<Button variant="secondary" onClick={markAllRead} disabled={!data.some((item) => !item.is_read)}><CheckCheck size={17}/>Mark all read</Button>} />
    <Card>{loading ? <Loading /> : error ? <ErrorState message={error} onRetry={load} /> : data.length ? <div className="divide-y divide-slate-100">{data.map((item) => <button key={item.notification_id} onClick={() => !item.is_read && markRead(item.notification_id)} className={`flex w-full gap-4 p-5 text-left transition hover:bg-sky-50/50 ${item.is_read ? 'opacity-60' : ''}`}><span className={`grid size-11 shrink-0 place-items-center rounded-xl ${item.is_read ? 'bg-slate-100 text-slate-500' : 'bg-sky-100 text-sky-700'}`}><Bell size={20}/></span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-4"><strong className="text-sm text-black">{item.title}</strong><small className="whitespace-nowrap text-slate-400">{String(item.created_at).slice(0,16)}</small></span><span className="mt-1 block text-sm text-slate-500">{item.message}</span></span>{!item.is_read && <i className="mt-2 size-2 shrink-0 rounded-full bg-sky-600"/>}</button>)}</div> : <div className="grid min-h-64 place-items-center text-center"><div><PackageOpen className="mx-auto text-slate-300" size={44}/><p className="mt-3 text-sm text-slate-400">No notifications yet.</p></div></div>}</Card>
  </>
}
