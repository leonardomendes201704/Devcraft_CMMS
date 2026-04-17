import { useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { login } from '../../shared/api/auth'
import { setAccessToken, setSessionUser } from '../../shared/auth/session'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@cmms.local')
  const [password, setPassword] = useState('Naotemsenha0(')

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (result) => {
      setAccessToken(result.accessToken)
      setSessionUser(result.user)
      navigate('/app/home', { replace: true })
    },
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    loginMutation.mutate({
      email: email.trim(),
      password,
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_20%_10%,#f2fbff_0%,#e9f3ff_50%,#dbe8ff_100%)] px-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl shadow-slate-300/50">
        <p className="text-xs uppercase tracking-[0.18em] text-sky-700">Devcraft CMMS</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-600">Use the master admin credentials to access the platform.</p>

        <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Email</span>
            <input
              className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-slate-700">Password</span>
            <input
              className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {loginMutation.isError ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">Invalid credentials.</p>
          ) : null}

          <button
            className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}
