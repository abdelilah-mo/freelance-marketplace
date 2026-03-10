import { Link } from 'react-router-dom'

function ServiceCard({ service }) {
  return (
    <article className="service-card">
      <div className="service-card-image">
        {service.image_url ? (
          <img src={service.image_url} alt={service.title} />
        ) : (
          <div className="service-card-placeholder">{service.category?.name?.slice(0, 2) || 'SV'}</div>
        )}
      </div>

      <div className="service-card-body">
        <div className="service-card-meta">
          <span>{service.category?.name}</span>
          <strong>${Number(service.price).toFixed(0)}</strong>
        </div>

        <h3>{service.title}</h3>
        <p>{service.description}</p>

        <div className="service-card-footer">
          <div>
            <strong>{service.freelancer?.name}</strong>
            <small>{service.delivery_days} day delivery</small>
          </div>

          <Link className="inline-link" to={`/services/${service.id}`}>
            View details
          </Link>
        </div>
      </div>
    </article>
  )
}

export default ServiceCard
