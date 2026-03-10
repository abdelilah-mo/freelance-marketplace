import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiRequest } from '../lib/api.js'

const statusClass = {
  pending: 'bg-amber-50 text-amber-700',
  in_progress: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
  paid: 'bg-emerald-50 text-emerald-700',
}

function formatLabel(label) {
  return label.replaceAll('_', ' ')
}

function DashboardPage() {
  const { token, user } = useAuth()
  const [payload, setPayload] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const loadDashboard = useCallback(async () => {
    try {
      const response = await apiRequest('/dashboard', { token })
      setPayload(response)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }, [token])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const updateOrderStatus = async (orderId, status) => {
    setBusyId(`order-${orderId}`)

    try {
      await apiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        token,
        body: { status },
      })
      await loadDashboard()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusyId(null)
    }
  }

  const payForOrder = async (orderId) => {
    setBusyId(`payment-${orderId}`)

    try {
      const response = await apiRequest(`/orders/${orderId}/checkout`, {
        method: 'POST',
        token,
      })

      window.location.href = response.data.checkout_url
    } catch (requestError) {
      setError(requestError.message)
      setBusyId(null)
    }
  }

  if (!payload) {
    return <p className="status-banner">{error || 'Loading dashboard...'}</p>
  }

  return (
    <div className="space-y-8">
      <section className="surface-card bg-gradient-to-r from-white to-brand-50/70 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="section-kicker">Dashboard</span>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-slate-950">
              Welcome back, {user.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Track your services, orders, and account activity from one workspace tailored to your role.
            </p>
          </div>

          {(user.role === 'freelancer' || user.role === 'admin') && (
            <Link className="btn-primary" to="/services/new">Publish a new service</Link>
          )}
        </div>
      </section>

      {error && <p className="status-banner status-banner-error">{error}</p>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(payload.stats || {}).map(([key, value]) => (
          <article className="stat-card" key={key}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{formatLabel(key)}</p>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      {payload.role === 'freelancer' && (
        <>
          <section className="surface-card p-8">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <span className="section-kicker">Services</span>
                <h2 className="mt-3 font-display text-2xl font-semibold text-slate-950">Your services</h2>
              </div>
            </div>

            <div className="grid gap-4">
              {(payload.services || []).map((service) => (
                <article className="list-card" key={service.id}>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-slate-950">{service.title}</p>
                    <p className="text-sm text-slate-500">
                      {service.category?.name} | ${Number(service.price).toFixed(2)}
                    </p>
                  </div>
                  <Link className="btn-secondary" to={`/services/${service.id}/edit`}>Edit</Link>
                </article>
              ))}
            </div>
          </section>

          <section className="surface-card p-8">
            <div className="mb-5">
              <span className="section-kicker">Orders</span>
              <h2 className="mt-3 font-display text-2xl font-semibold text-slate-950">Orders received</h2>
            </div>

            <div className="grid gap-4">
              {(payload.orders || []).map((order) => (
                <article className="list-card" key={order.id}>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-slate-950">{order.service?.title}</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      <span>{order.client?.name}</span>
                      <span className={`pill ${statusClass[order.status] || 'bg-slate-100 text-slate-600'}`}>
                        {formatLabel(order.status)}
                      </span>
                      <span className={`pill ${statusClass[order.payment?.status] || 'bg-slate-100 text-slate-600'}`}>
                        payment {order.payment?.status || 'pending'}
                      </span>
                    </div>
                  </div>
                  <select
                    className="field-input lg:w-52"
                    disabled={busyId === `order-${order.id}`}
                    value={order.status}
                    onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                  >
                    <option value="pending">pending</option>
                    <option value="in_progress">in progress</option>
                    <option value="completed">completed</option>
                  </select>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {payload.role === 'client' && (
        <section className="surface-card p-8">
          <div className="mb-5">
            <span className="section-kicker">Orders</span>
            <h2 className="mt-3 font-display text-2xl font-semibold text-slate-950">Your orders</h2>
          </div>

          <div className="grid gap-4">
            {(payload.orders || []).map((order) => (
              <article className="list-card" key={order.id}>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-slate-950">{order.service?.title}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <span className={`pill ${statusClass[order.status] || 'bg-slate-100 text-slate-600'}`}>
                      {formatLabel(order.status)}
                    </span>
                    <span className="pill bg-slate-100 text-slate-700">${Number(order.total_amount).toFixed(2)}</span>
                    <span className={`pill ${statusClass[order.payment?.status] || 'bg-slate-100 text-slate-600'}`}>
                      payment {order.payment?.status || 'pending'}
                    </span>
                  </div>
                </div>

                {order.payment?.status !== 'paid' ? (
                  <button
                    className="btn-primary"
                    disabled={busyId === `payment-${order.id}`}
                    onClick={() => payForOrder(order.id)}
                  >
                    {busyId === `payment-${order.id}` ? 'Redirecting...' : 'Pay now'}
                  </button>
                ) : (
                  <span className="pill bg-emerald-50 text-emerald-700">Paid</span>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {payload.role === 'admin' && (
        <section className="surface-card p-8">
          <span className="section-kicker">Administration</span>
          <h2 className="mt-3 font-display text-2xl font-semibold text-slate-950">Marketplace controls</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Review the platform-wide moderation tools from the admin area while keeping marketplace flows unchanged.
          </p>
          <div className="mt-6">
            <Link className="btn-primary" to="/admin">Open admin dashboard</Link>
          </div>
        </section>
      )}
    </div>
  )
}

export default DashboardPage
