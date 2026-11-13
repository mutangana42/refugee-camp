import { useState } from 'react'
import { Search } from 'lucide-react'
import { queryString } from '../api/client'
import { useApiData } from '../api/useApiData'
import { Card, ErrorState, inputClass, Loading, PageHeader, Table } from '../components/ui'

export default function AuditPage(){
  const [search,setSearch]=useState(''); const [submitted,setSubmitted]=useState(''); const {data,loading,error,load}=useApiData(`/audit-logs${queryString({search:submitted,limit:100})}`)
  return <><PageHeader title="Audit Logs" description="Review security events and material changes across the system."/><Card><form className="border-b border-slate-200 p-4" onSubmit={(event)=>{event.preventDefault();setSubmitted(search)}}><div className="relative max-w-md"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input className={`${inputClass} pl-10`} placeholder="Search action or table" value={search} onChange={(e)=>setSearch(e.target.value)}/></div></form>{loading?<Loading/>:error?<ErrorState message={error} onRetry={load}/>:<Table rows={data} keyField="log_id" columns={[{key:'action_date',label:'Date',render:(row)=>String(row.action_date).slice(0,19)},{key:'action',label:'Action',render:(row)=><b className="text-black">{row.action.replaceAll('_',' ')}</b>},{key:'table_name',label:'Area'},{key:'record_id',label:'Record ID'},{key:'user_id',label:'User ID'},{key:'details',label:'Details',render:(row)=>row.details?JSON.stringify(row.details):'—'}]}/>}</Card></>
}
