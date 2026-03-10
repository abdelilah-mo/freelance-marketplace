import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiRequest } from '../lib/api.js'

function OrderPage() {
  const { serviceId } = useParams()
  const { token } = useAuth()
  const [service, setService] = useState(null)
  const [requirements, setRequirements] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    apiRequest(`/services/${serviceId}`)
      .then((payload) => setService(payload.data))
      .catch((requestError) => setError(requestError.message))
  }, [serviceId])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      const orderPayload = await apiRequest('/orders', {
        method: 'POST',
        token,
        body: {
          service_id: serviceId,
          requirements,
        },
      })

      const checkoutPayload = await apiRequest(`/orders/${orderPayload.data.id}/checkout`, {
        method: 'POST',
        token,
      })

      window.location.href = checkoutPayload.data.checkout_url
    } catch (requestError) {
      setError(requestError.message)
      setSubmitting(false)
    }
  }

  if (!service) {
    return <p className="status-banner">{error || 'Loading order form...'}</p>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.85fr]">
      <section className="surface-card p-8">
        <div className="space-y-2">
          <span className="section-kicker">Order service</span>
          <h1 className="section-title">Order {service.title}</h1>
          <p className="text-sm text-slate-500">
            Add your brief and continue directly to checkout. The backend order and payment flow remains unchanged.
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <textarea
            className="field-input min-h-56"
            placeholder="Describe your project requirements"
            rows="7"
            value={requirements}
            onChange={(event) => setRequirements(event.target.value)}
          />

          {error && <p className="status-banner status-banner-error">{error}</p>}

          <button className="btn-primary w-full sm:w-auto" disabled={submitting} type="submit">
            {submitting ? 'Preparing checkout...' : `Continue to payment - $${Number(service.price).toFixed(2)}`}
          </button>
        </form>
      </section>

      <aside className="surface-card h-fit p-8">
        <div className="space-y-4">
          <span className="section-kicker">{service.category?.name}</span>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-950">{service.title}</h2>
          <p className="text-sm leading-7 text-slate-600">{service.description}</p>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-50 p-5">
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Freelancer</span>
              <strong className="text-slate-950">{service.freelancer?.name}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery</span>
              <strong className="text-slate-950">{service.delivery_days} days</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Total</span>
              <strong className="text-brand-700">${Number(service.price).toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

export default OrderPage
