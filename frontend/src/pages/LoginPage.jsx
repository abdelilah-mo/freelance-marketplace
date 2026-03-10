import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      await login(form)
      navigate(location.state?.from || '/dashboard')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="surface-card flex flex-col justify-between bg-gradient-to-br from-brand-700 via-brand-600 to-sky-500 p-8 text-white">
        <div className="space-y-6">
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
            Welcome back
          </span>
          <div className="space-y-3">
            <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Manage freelance work with a cleaner workflow.
            </h1>
            <p className="max-w-md text-sm leading-7 text-white/80">
              Sign in to continue browsing services, managing orders, and working from your personalized dashboard.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
          <p className="text-sm text-white/80">Demo credentials</p>
          <p className="mt-2 text-lg font-semibold">Password: <code>password</code></p>
        </div>
      </div>

      <div className="surface-card p-8 sm:p-10">
        <div className="space-y-2">
          <span className="section-kicker">Login</span>
          <h2 className="section-title text-3xl">Access your marketplace account</h2>
          <p className="text-sm text-slate-500">Clients, freelancers, and admins all sign in here.</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input
            className="field-input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <input
            className="field-input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          {error && <p className="status-banner status-banner-error">{error}</p>}
          <button className="btn-primary w-full" disabled={loading} type="submit">
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          Need an account? <Link className="font-semibold text-brand-700" to="/register">Create one</Link>
        </p>
      </div>
    </section>
  )
}

export default LoginPage
