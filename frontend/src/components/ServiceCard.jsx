import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function ServiceCard({ service }) {
  const { user } = useAuth()
  const actionHref = user?.role === 'client' || user?.role === 'admin'
    ? `/services/${service.id}/order`
    : user
      ? `/services/${service.id}`
      : '/login'

  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-100/50">
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-50 via-sky-50 to-slate-100">
        {service.image_url ? (
          <img
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            src={service.image_url}
            alt={service.title}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl font-display font-semibold text-brand-700">
            {service.category?.name?.slice(0, 2) || 'SV'}
          </div>
        )}
        <div className="absolute left-4 top-4 inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {service.category?.name}
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-xl font-semibold tracking-tight text-slate-950">
              {service.title}
            </h3>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Starting at</p>
              <p className="text-xl font-extrabold text-brand-700">${Number(service.price).toFixed(0)}</p>
            </div>
          </div>

          <p className="text-sm leading-6 text-slate-600">
            {service.description.length > 110
              ? `${service.description.slice(0, 110)}...`
              : service.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">{service.freelancer?.name}</p>
            <p className="text-sm text-slate-500">{service.delivery_days} day delivery</p>
          </div>

          <Link className="text-sm font-semibold text-brand-700 transition hover:text-brand-800" to={`/services/${service.id}`}>
            View details
          </Link>
        </div>

        <Link className="btn-primary w-full" to={actionHref}>
          Order Now
        </Link>
      </div>
    </article>
  )
}

export default ServiceCard
