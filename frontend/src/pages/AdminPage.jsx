import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { apiRequest } from '../lib/api.js'

const statusClass = {
  pending: 'bg-amber-50 text-amber-700',
  in_progress: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
}

function AdminPage() {
  const { token } = useAuth()
  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [services, setServices] = useState([])
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')

  const loadAdmin = useCallback(async () => {
    try {
      const [statsPayload, usersPayload, servicesPayload, ordersPayload] = await Promise.all([
        apiRequest('/admin/dashboard', { token }),
        apiRequest('/admin/users', { token }),
        apiRequest('/admin/services', { token }),
        apiRequest('/admin/orders', { token }),
      ])

      setStats(statsPayload.stats || {})
      setUsers(usersPayload.data || [])
      setServices(servicesPayload.data || [])
      setOrders(ordersPayload.data || [])
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }, [token])

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      try {
        const [statsPayload, usersPayload, servicesPayload, ordersPayload] = await Promise.all([
          apiRequest('/admin/dashboard', { token }),
          apiRequest('/admin/users', { token }),
          apiRequest('/admin/services', { token }),
          apiRequest('/admin/orders', { token }),
        ])

        if (cancelled) {
          return
        }

        setStats(statsPayload.stats || {})
        setUsers(usersPayload.data || [])
        setServices(servicesPayload.data || [])
        setOrders(ordersPayload.data || [])
        setError('')
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message)
        }
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [token])

  const toggleUserStatus = async (account) => {
    await apiRequest(`/admin/users/${account.id}`, {
      method: 'PATCH',
      token,
      body: { is_active: !account.is_active },
    })
    await loadAdmin()
  }

  const deleteUser = async (accountId) => {
    await apiRequest(`/admin/users/${accountId}`, {
      method: 'DELETE',
      token,
    })
    await loadAdmin()
  }

  const toggleService = async (service) => {
    await apiRequest(`/admin/services/${service.id}`, {
      method: 'PATCH',
      token,
      body: { is_active: !service.is_active },
    })
    await loadAdmin()
  }

  const updateOrder = async (orderId, status) => {
    await apiRequest(`/admin/orders/${orderId}`, {
      method: 'PATCH',
      token,
      body: { status },
    })
    await loadAdmin()
  }

  return (
    <div className="space-y-8">
      <section className="surface-card bg-gradient-to-r from-slate-950 to-brand-700 p-8 text-white">
        <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
          Admin
        </span>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">Marketplace control room</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">
          Moderate accounts, services, and orders through a more structured admin layout without changing the underlying backend behavior.
        </p>
      </section>

      {error && <p className="status-banner status-banner-error">{error}</p>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(stats).map(([key, value]) => (
          <article className="stat-card" key={key}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{key.replaceAll('_', ' ')}</p>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      <section className="surface-card p-8">
        <div className="mb-5">
          <span className="section-kicker">Users</span>
          <h2 className="mt-3 font-display text-2xl font-semibold text-slate-950">Manage users</h2>
        </div>
        <div className="grid gap-4">
          {users.map((account) => (
            <article className="list-card" key={account.id}>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-slate-950">{account.name}</p>
                <p className="text-sm text-slate-500">{account.email}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="pill bg-slate-100 text-slate-700">{account.role}</span>
                  <span className={`pill ${account.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {account.is_active ? 'active' : 'disabled'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="btn-secondary" onClick={() => toggleUserStatus(account)}>
                  {account.is_active ? 'Disable' : 'Enable'}
                </button>
                <button className="btn-danger" onClick={() => deleteUser(account.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card p-8">
        <div className="mb-5">
          <span className="section-kicker">Services</span>
          <h2 className="mt-3 font-display text-2xl font-semibold text-slate-950">Manage services</h2>
        </div>
        <div className="grid gap-4">
          {services.map((service) => (
            <article className="list-card" key={service.id}>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-slate-950">{service.title}</p>
                <p className="text-sm text-slate-500">
                  {service.freelancer?.name} | ${Number(service.price).toFixed(2)}
                </p>
                <span className={`pill ${service.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                  {service.is_active ? 'active' : 'hidden'}
                </span>
              </div>
              <button className="btn-secondary" onClick={() => toggleService(service)}>
                {service.is_active ? 'Hide' : 'Activate'}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card p-8">
        <div className="mb-5">
          <span className="section-kicker">Orders</span>
          <h2 className="mt-3 font-display text-2xl font-semibold text-slate-950">Manage orders</h2>
        </div>
        <div className="grid gap-4">
          {orders.map((order) => (
            <article className="list-card" key={order.id}>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-slate-950">{order.service?.title}</p>
                <p className="text-sm text-slate-500">
                  {order.client?.name} to {order.freelancer?.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className={`pill ${statusClass[order.status] || 'bg-slate-100 text-slate-700'}`}>
                    {order.status.replaceAll('_', ' ')}
                  </span>
                  <span className="pill bg-slate-100 text-slate-700">
                    payment {order.payment?.status || 'pending'}
                  </span>
                </div>
              </div>
              <select
                className="field-input lg:w-52"
                value={order.status}
                onChange={(event) => updateOrder(order.id, event.target.value)}
              >
                <option value="pending">pending</option>
                <option value="in_progress">in progress</option>
                <option value="completed">completed</option>
              </select>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default AdminPage
