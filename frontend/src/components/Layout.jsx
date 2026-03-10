import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink className="brand" to="/">
          <span className="brand-mark">FM</span>
          <div>
            <strong>Freelance Marketplace</strong>
            <span>Laravel API + React client</span>
          </div>
        </NavLink>

        <nav className="topbar-nav">
          <NavLink to="/">Discover</NavLink>
          {user && <NavLink to="/dashboard">Dashboard</NavLink>}
          {(user?.role === 'freelancer' || user?.role === 'admin') && <NavLink to="/services/new">Create Service</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
        </nav>

        <div className="topbar-actions">
          {user ? (
            <>
              <div className="user-chip">
                <span>{user.name}</span>
                <small>{user.role}</small>
              </div>
              <button className="ghost-button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink className="ghost-button" to="/login">Login</NavLink>
              <NavLink className="primary-button" to="/register">Join now</NavLink>
            </>
          )}
        </div>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
