import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const navLinkClass = ({ isActive }) => (
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-brand-50 text-brand-700'
      : 'text-slate-600 hover:bg-white hover:text-slate-900'
  }`
)

function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen pb-10">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="page-container flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <NavLink className="flex items-center gap-3" to="/">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-base font-bold text-white shadow-lg shadow-brand-600/25">
                FM
              </span>
              <div>
                <p className="font-display text-lg font-semibold text-slate-950">Freelance Marketplace</p>
                <p className="text-sm text-slate-500">Find talent. Ship faster.</p>
              </div>
            </NavLink>

            {user && (
              <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-right lg:block">
                <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{user.role}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <nav className="flex flex-wrap items-center gap-2">
              <NavLink className={navLinkClass} to="/">Home</NavLink>
              <NavLink className={navLinkClass} to="/services">Services</NavLink>
              {user && <NavLink className={navLinkClass} to="/dashboard">Dashboard</NavLink>}
              {(user?.role === 'freelancer' || user?.role === 'admin') && (
                <NavLink className={navLinkClass} to="/services/new">Create Service</NavLink>
              )}
              {user?.role === 'admin' && <NavLink className={navLinkClass} to="/admin">Admin</NavLink>}
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <button className="btn-secondary" onClick={handleLogout}>Logout</button>
              ) : (
                <>
                  <NavLink className="btn-secondary" to="/login">Login</NavLink>
                  <NavLink className="btn-primary" to="/register">Register</NavLink>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="page-container py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
