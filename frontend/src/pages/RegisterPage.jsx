import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'client',
    headline: '',
    bio: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      await register(form)
      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="surface-card p-8 sm:p-10">
        <span className="section-kicker">Why join</span>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-slate-950">
          Launch your freelance profile or hire talent in minutes.
        </h1>
        <div className="mt-8 space-y-4">
          {[
            'Clients can browse services and pay through Stripe or mock checkout.',
            'Freelancers can publish offers, edit listings, and manage incoming orders.',
            'Each account gets a focused dashboard based on role.',
          ].map((item) => (
            <div className="flex items-start gap-3" key={item}>
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-600" />
              <p className="text-sm leading-7 text-slate-600">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-card p-8 sm:p-10">
        <div className="space-y-2">
          <span className="section-kicker">Register</span>
          <h2 className="section-title text-3xl">Create a client or freelancer account</h2>
        </div>

        <form className="mt-8 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <input
            className="field-input"
            placeholder="Full name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            className="field-input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <select
            className="field-input"
            value={form.role}
            onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
          >
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
          </select>
          <input
            className="field-input"
            placeholder="Headline"
            value={form.headline}
            onChange={(event) => setForm((current) => ({ ...current, headline: event.target.value }))}
          />
          <textarea
            className="field-input min-h-32 sm:col-span-2"
            placeholder="Short bio"
            value={form.bio}
            onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
          />
          <input
            className="field-input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />
          <input
            className="field-input"
            type="password"
            placeholder="Confirm password"
            value={form.password_confirmation}
            onChange={(event) => setForm((current) => ({ ...current, password_confirmation: event.target.value }))}
          />
          {error && <p className="status-banner status-banner-error sm:col-span-2">{error}</p>}
          <button className="btn-primary w-full sm:col-span-2" disabled={loading} type="submit">
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500">
          Already registered? <Link className="font-semibold text-brand-700" to="/login">Login</Link>
        </p>
      </div>
    </section>
  )
}

export default RegisterPage
