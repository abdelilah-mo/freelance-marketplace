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
    return <p className="status-banner error">{error}</p>
  }

  if (!service) {
    return <p className="status-banner">Loading service...</p>
  }

  const canOrder = user?.role === 'client' || user?.role === 'admin'
  const canEdit = user?.role === 'admin' || user?.id === service.freelancer_id

  return (
    <div className="details-layout">
      <section className="details-panel">
        <span className="eyebrow">{service.category?.name}</span>
        <h1>{service.title}</h1>
        <p className="lead-copy">{service.description}</p>

        <div className="detail-metrics">
          <div>
            <strong>${Number(service.price).toFixed(2)}</strong>
            <span>Starting price</span>
          </div>
          <div>
            <strong>{service.delivery_days} days</strong>
            <span>Delivery time</span>
          </div>
          <div>
            <strong>{service.freelancer?.name}</strong>
            <span>Freelancer</span>
          </div>
        </div>

        <div className="action-row">
          {canOrder && <Link className="primary-button" to={`/services/${service.id}/order`}>Order service</Link>}
          {!user && <Link className="primary-button" to="/login">Login to order</Link>}
          {canEdit && <Link className="ghost-button" to={`/services/${service.id}/edit`}>Edit service</Link>}
        </div>
      </section>

      <aside className="sidebar-card">
        {service.image_url ? (
          <img className="detail-image" src={service.image_url} alt={service.title} />
        ) : (
          <div className="detail-image placeholder">{service.category?.name}</div>
        )}
      </aside>
    </div>
  )
}

export default ServiceDetailsPage
