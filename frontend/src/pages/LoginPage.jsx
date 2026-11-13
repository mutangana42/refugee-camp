import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'
import { useAuth } from '../context/auth'
import Logo from '../components/Logo'
import { Button, inputClass } from '../components/ui'

export default function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  if (user) return <Navigate to="/" replace />

  async function submit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(form.username.trim(), form.password)
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-sky-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-24 -top-24 size-96 rounded-full border-[70px] border-white/10" />
        <div className="absolute -bottom-40 -right-20 size-[34rem] rounded-full bg-sky-500" />
        <div className="relative flex items-center gap-3"><span className="rounded-xl bg-white p-2 text-sky-600"><ShieldCheck size={28} /></span><strong className="text-lg">Secure Humanitarian Operations</strong></div>
        <div className="relative max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[.24em] text-sky-100">Resource distribution</p>
          <h1 className="mt-4 text-5xl font-black leading-tight">Aid delivered with clarity, fairness, and accountability.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-sky-100">One secure workspace for refugee records, stock control, requests, and every distribution made in the camp.</p>
        </div>
        <p className="relative text-sm text-sky-100">Refugee Camp Resource Distribution System</p>
      </section>
      <section className="flex items-center justify-center bg-slate-50 px-5 py-10">
        <div className="w-full max-w-md">
          <Logo />
          <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-9">
            <h2 className="text-3xl font-black tracking-tight text-black">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">Sign in with your assigned system account.</p>
            {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <form className="mt-7 space-y-5" onSubmit={submit}>
              <label className="block text-sm font-semibold text-slate-700">Username<div className="relative mt-2"><UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input className={`${inputClass} pl-11`} autoComplete="username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="Enter your username" required /></div></label>
              <label className="block text-sm font-semibold text-slate-700">Password<div className="relative mt-2"><LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input className={`${inputClass} px-11`} type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter your password" required /><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-black" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
              <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</Button>
            </form>
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">Access is monitored and recorded for accountability.</p>
        </div>
      </section>
    </main>
  )
}
