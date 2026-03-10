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
    <section className="auth-card">
      <div>
        <span className="eyebrow">Register</span>
        <h1>Create a client or freelancer account</h1>
      </div>

      <form className="stack-md" onSubmit={handleSubmit}>
        <input
          className="field"
          placeholder="Full name"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
        />
        <input
          className="field"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        />
        <select
          className="field"
          value={form.role}
          onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
        >
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
        </select>
        <input
          className="field"
          placeholder="Headline"
          value={form.headline}
          onChange={(event) => setForm((current) => ({ ...current, headline: event.target.value }))}
        />
        <textarea
          className="field textarea"
          placeholder="Short bio"
          value={form.bio}
          onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
        />
        <input
          className="field"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
        />
        <input
          className="field"
          type="password"
          placeholder="Confirm password"
          value={form.password_confirmation}
          onChange={(event) => setForm((current) => ({ ...current, password_confirmation: event.target.value }))}
        />
        {error && <p className="status-banner error">{error}</p>}
        <button className="primary-button" disabled={loading} type="submit">
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="muted-copy">
        Already registered? <Link to="/login">Login</Link>
      </p>
    </section>
  )
}

export default RegisterPage
