import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, UserRoundPlus } from 'lucide-react'
import { api } from '../api/client'
import { useApiData } from '../api/useApiData'
import { Button, Card, Dialog, ErrorState, Field, inputClass, Loading, PageHeader, StatusBadge, Table } from '../components/ui'

const blank = { refugee_code: '', family_id: '', first_name: '', last_name: '', gender: '', date_of_birth: '', nationality: '', country_of_origin: '', arrival_date: new Date().toLocaleDateString('en-CA'), phone: '', special_needs: '', status: 'Active' }

export default function RefugeesPage() {
  const { data, loading, error, load } = useApiData('/refugees?limit=100')
  const { data: families } = useApiData('/families?limit=100')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => { if (!open) { setEditing(null); setForm(blank); setFormError('') } }, [open])
  const rows = useMemo(() => data.filter((item) => `${item.refugee_code} ${item.first_name} ${item.last_name} ${item.nationality}`.toLowerCase().includes(search.toLowerCase())), [data, search])
  function edit(row) { setEditing(row); setForm(Object.fromEntries(Object.keys(blank).map((key) => [key, row[key] ?? '']))); setOpen(true) }
  async function submit(event) {
    event.preventDefault(); setSaving(true); setFormError('')
    try {
      await api(editing ? `/refugees/${editing.refugee_id}` : '/refugees', { method: editing ? 'PATCH' : 'POST', body: form })
      setOpen(false); await load()
    } catch (err) { setFormError(err.message) } finally { setSaving(false) }
  }

  return <>
    <PageHeader title="Refugee Management" description="Register, search, and maintain beneficiary records." action={<Button onClick={() => setOpen(true)}><Plus size={18}/>Register refugee</Button>}/>
    <Card><div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="relative w-full max-w-md"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input className={`${inputClass} pl-10`} placeholder="Search by name, code, or nationality" value={search} onChange={(event)=>setSearch(event.target.value)}/></div><span className="text-sm text-slate-500">{rows.length} refugees</span></div>{loading?<Loading/>:error?<ErrorState message={error} onRetry={load}/>:<Table rows={rows} keyField="refugee_id" columns={[{key:'refugee_code',label:'Refugee ID',render:(row)=><b className="text-sky-700">{row.refugee_code}</b>},{key:'first_name',label:'Name',render:(row)=><span className="font-semibold text-black">{row.first_name} {row.last_name}</span>},{key:'gender',label:'Gender'},{key:'nationality',label:'Nationality'},{key:'arrival_date',label:'Arrival date'},{key:'status',label:'Status',render:(row)=><StatusBadge status={row.status}/>},{key:'actions',label:'',render:(row)=><button onClick={()=>edit(row)} className="rounded-lg p-2 text-slate-400 hover:bg-sky-50 hover:text-sky-600" aria-label="Edit"><Pencil size={17}/></button>}]} />}</Card>
    <Dialog open={open} onClose={()=>setOpen(false)} title={editing?'Edit refugee':'Register refugee'}>
      <form onSubmit={submit}><div className="grid gap-4 sm:grid-cols-2">
        <Field label="Refugee ID"><input className={inputClass} value={form.refugee_code} onChange={(e)=>setForm({...form,refugee_code:e.target.value})} required/></Field>
        <Field label="Family"><select className={inputClass} value={form.family_id} onChange={(e)=>setForm({...form,family_id:e.target.value})} required><option value="">Select family</option>{families.map((family)=><option key={family.family_id} value={family.family_id}>{family.family_code} — {family.head_name}</option>)}</select></Field>
        <Field label="First name"><input className={inputClass} value={form.first_name} onChange={(e)=>setForm({...form,first_name:e.target.value})} required/></Field>
        <Field label="Last name"><input className={inputClass} value={form.last_name} onChange={(e)=>setForm({...form,last_name:e.target.value})} required/></Field>
        <Field label="Gender"><select className={inputClass} value={form.gender} onChange={(e)=>setForm({...form,gender:e.target.value})}><option value="">Not specified</option><option>Male</option><option>Female</option><option>Other</option></select></Field>
        <Field label="Date of birth"><input type="date" className={inputClass} value={form.date_of_birth} onChange={(e)=>setForm({...form,date_of_birth:e.target.value})}/></Field>
        <Field label="Nationality"><input className={inputClass} value={form.nationality} onChange={(e)=>setForm({...form,nationality:e.target.value})}/></Field>
        <Field label="Country of origin"><input className={inputClass} value={form.country_of_origin} onChange={(e)=>setForm({...form,country_of_origin:e.target.value})}/></Field>
        <Field label="Arrival date"><input type="date" className={inputClass} value={form.arrival_date} onChange={(e)=>setForm({...form,arrival_date:e.target.value})} required/></Field>
        <Field label="Phone"><input className={inputClass} value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/></Field>
        <Field label="Status"><select className={inputClass} value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}><option>Active</option><option>Transferred</option><option>Returned</option></select></Field>
        <Field label="Special needs"><textarea className={`${inputClass} min-h-24 py-3`} value={form.special_needs} onChange={(e)=>setForm({...form,special_needs:e.target.value})}/></Field>
      </div>{formError&&<p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{formError}</p>}<div className="mt-6 flex justify-end gap-3"><Button variant="secondary" onClick={()=>setOpen(false)}>Cancel</Button><Button type="submit" disabled={saving}><UserRoundPlus size={18}/>{saving?'Saving…':'Save refugee'}</Button></div></form>
    </Dialog>
  </>
}
