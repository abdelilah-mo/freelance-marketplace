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
    <section className="auth-card">
      <div>
        <span className="eyebrow">Login</span>
        <h1>Access your marketplace account</h1>
        <p>Demo users are seeded with the password <code>password</code>.</p>
      </div>

      <form className="stack-md" onSubmit={handleSubmit}>
        <input
          className="field"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        />
        <input
          className="field"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
        />
        {error && <p className="status-banner error">{error}</p>}
        <button className="primary-button" disabled={loading} type="submit">
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>

      <p className="muted-copy">
        Need an account? <Link to="/register">Create one</Link>
      </p>
    </section>
  )
}

export default LoginPage
