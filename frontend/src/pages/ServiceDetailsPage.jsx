import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiRequest } from '../lib/api.js'

function ServiceDetailsPage() {
  const { serviceId } = useParams()
  const { user } = useAuth()
  const [service, setService] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest(`/services/${serviceId}`)
      .then((payload) => {
        setService(payload.data)
        setError('')
      })
      .catch((requestError) => setError(requestError.message))
  }, [serviceId])

  if (error) {
    return <p className="status-banner status-banner-error">{error}</p>
  }

  if (!service) {
    return <p className="status-banner">Loading service...</p>
  }

  const canOrder = user?.role === 'client' || user?.role === 'admin'
  const canEdit = user?.role === 'admin' || user?.id === service.freelancer_id

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
      <section className="space-y-6">
        <div className="surface-card overflow-hidden">
          <div className="aspect-[16/9] bg-gradient-to-br from-brand-50 via-sky-50 to-slate-100">
            {service.image_url ? (
              <img className="h-full w-full object-cover" src={service.image_url} alt={service.title} />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl font-display font-semibold text-brand-700">
                {service.category?.name?.slice(0, 2)}
              </div>
            )}
          </div>
          <div className="space-y-5 p-8">
            <span className="section-kicker">{service.category?.name}</span>
            <div>
              <h1 className="section-title">{service.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{service.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Starting price</p>
                <p className="mt-2 text-2xl font-extrabold text-slate-950">${Number(service.price).toFixed(2)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Delivery</p>
                <p className="mt-2 text-2xl font-extrabold text-slate-950">{service.delivery_days} days</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Freelancer</p>
                <p className="mt-2 text-lg font-bold text-slate-950">{service.freelancer?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="surface-card sticky top-28 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Ready to order</p>
          <p className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">${Number(service.price).toFixed(2)}</p>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Clear pricing, focused scope, and a direct checkout flow designed for quick conversions.
          </p>

          <div className="mt-6 space-y-3">
            {canOrder && <Link className="btn-primary w-full" to={`/services/${service.id}/order`}>Order service</Link>}
            {!user && <Link className="btn-primary w-full" to="/login">Login to order</Link>}
            {canEdit && <Link className="btn-secondary w-full" to={`/services/${service.id}/edit`}>Edit service</Link>}
          </div>

          <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Category</span>
              <strong className="text-slate-950">{service.category?.name}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery</span>
              <strong className="text-slate-950">{service.delivery_days} days</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Seller</span>
              <strong className="text-slate-950">{service.freelancer?.name}</strong>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default ServiceDetailsPage
