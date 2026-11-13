import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { api } from '../api/client'
import { useAuth } from '../context/auth'
import Logo from './Logo'
import {
  Bell, ChevronDown, ClipboardList, FileBarChart, Gauge, HandHeart, LogOut, Menu,
  PackageCheck, ShieldCheck, TentTree, Users, UserRound, UsersRound, Warehouse, X,
} from 'lucide-react'

const items = [
  { to: '/', label: 'Dashboard', icon: Gauge },
  { to: '/refugees', label: 'Refugee Management', icon: UsersRound, roles: ['Administrator', 'Manager', 'Volunteer'] },
  { to: '/families', label: 'Family Management', icon: Users, roles: ['Administrator', 'Manager'] },
  { to: '/camp', label: 'Camp Management', icon: TentTree, roles: ['Administrator', 'Manager'] },
  { to: '/requests', label: 'Resource Requests', icon: ClipboardList, roles: ['Administrator', 'Manager', 'Volunteer', 'Donor'] },
  { to: '/inventory', label: 'Inventory Management', icon: Warehouse, roles: ['Administrator', 'Manager', 'Volunteer'] },
  { to: '/donors', label: 'Donor Management', icon: HandHeart, roles: ['Administrator', 'Manager', 'Donor'] },
  { to: '/distributions', label: 'Distribution Management', icon: PackageCheck, roles: ['Administrator', 'Manager', 'Volunteer'] },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/reports', label: 'Reports', icon: FileBarChart, roles: ['Administrator', 'Manager'] },
  { to: '/users', label: 'User Management', icon: UserRound, roles: ['Administrator'] },
  { to: '/audit', label: 'Audit Logs', icon: ShieldCheck, roles: ['Administrator'] },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const navItems = useMemo(() => items.filter((item) => !item.roles || item.roles.includes(user.role_name)), [user.role_name])
  const current = navItems.find((item) => item.to === location.pathname)?.label || 'Dashboard'

  useEffect(() => {
    setOpen(false)
    api('/notifications').then(({ data }) => setUnread(data.filter((item) => !item.is_read).length)).catch(() => {})
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-slate-50">
      {open && <button className="fixed inset-0 z-30 bg-black/40 lg:hidden" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5"><Logo /><button className="rounded-lg p-2 text-slate-500 lg:hidden" onClick={() => setOpen(false)}><X /></button></div>
        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `group flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition ${isActive ? 'bg-sky-600 text-white shadow-md shadow-sky-200' : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'}`}>
              <Icon size={19} strokeWidth={1.9} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="grid size-10 place-items-center rounded-full bg-sky-600 text-sm font-bold text-white">{user.first_name?.[0]}{user.last_name?.[0]}</span><span className="min-w-0"><strong className="block truncate text-sm text-black">{user.first_name} {user.last_name}</strong><small className="block truncate text-xs text-slate-500">{user.role_name}</small></span></div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3"><button className="rounded-xl border border-slate-200 p-2.5 text-slate-600 lg:hidden" onClick={() => setOpen(true)}><Menu size={20} /></button><div><h2 className="font-bold text-black">{current}</h2><p className="hidden text-xs text-slate-400 sm:block">Refugee Camp Resource Distribution System</p></div></div>
          <div className="flex items-center gap-2">
            <Link to="/notifications" className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100" aria-label="Notifications"><Bell size={20} />{unread > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-sky-600 ring-2 ring-white" />}</Link>
            <div className="relative">
              <button className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-slate-100" onClick={() => setProfileOpen((value) => !value)}><span className="grid size-8 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">{user.first_name?.[0]}{user.last_name?.[0]}</span><span className="hidden text-left sm:block"><strong className="block max-w-32 truncate text-xs text-black">{user.first_name} {user.last_name}</strong><small className="text-[10px] text-slate-500">{user.role_name}</small></span><ChevronDown size={15} className="text-slate-400" /></button>
              {profileOpen && <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"><button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut size={17} />Sign out</button></div>}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 sm:p-7"><Outlet /></main>
      </div>
    </div>
  )
}
