import { useEffect, useState } from 'react'
import ServiceCard from '../components/ServiceCard.jsx'
import { apiRequest } from '../lib/api.js'

const defaultFilters = {
  q: '',
  category: '',
  minPrice: '',
  maxPrice: '',
  sort: 'latest',
}

function HomePage() {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState(defaultFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      try {
        const [servicesPayload, categoriesPayload] = await Promise.all([
          apiRequest(`/services?${new URLSearchParams({
            q: filters.q,
            category: filters.category,
            min_price: filters.minPrice,
            max_price: filters.maxPrice,
            sort: filters.sort,
          })}`),
          apiRequest('/categories'),
        ])

        setServices(servicesPayload.data || [])
        setCategories(categoriesPayload.data || [])
        setError('')
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [filters])

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <div className="surface-card overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-brand-700 p-8 text-white sm:p-10">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            Freelance marketplace
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Hire proven freelancers or turn your expertise into a premium service.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">
            Explore a clean marketplace experience inspired by modern hiring platforms, with fast search, polished service cards, and a smooth order flow.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              className="btn-primary bg-white text-slate-950 hover:bg-slate-100"
              onClick={() => document.getElementById('services-grid')?.scrollIntoView({ behavior: 'smooth' })}
              type="button"
            >
              Browse services
            </button>
            <button
              className="btn-secondary border-white/20 bg-white/10 text-white hover:border-white/40 hover:bg-white/15 hover:text-white"
              onClick={() => setFilters(defaultFilters)}
              type="button"
            >
              Reset filters
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {[
            ['Clients', 'Compare services by category, price, and delivery time.'],
            ['Freelancers', 'Showcase work with a stronger storefront and better CTA layout.'],
            ['Payments', 'Keep the same Stripe or mock checkout workflow already wired to the API.'],
          ].map(([title, copy]) => (
            <div className="surface-card p-6" key={title}>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">{title}</p>
              <p className="mt-3 text-lg font-semibold text-slate-950">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="section-kicker">Marketplace search</span>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-slate-950">
              Find the right service quickly
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Use category, budget, and sorting filters to narrow the catalog.
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[2fr_1.2fr_1fr_1fr_1fr]">
          <input
            className="field-input"
            placeholder="Search services"
            value={filters.q}
            onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
          />

          <select
            className="field-input"
            value={filters.category}
            onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            className="field-input"
            type="number"
            min="0"
            placeholder="Min price"
            value={filters.minPrice}
            onChange={(event) => setFilters((current) => ({ ...current, minPrice: event.target.value }))}
          />

          <input
            className="field-input"
            type="number"
            min="0"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(event) => setFilters((current) => ({ ...current, maxPrice: event.target.value }))}
          />

          <select
            className="field-input"
            value={filters.sort}
            onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}
          >
            <option value="latest">Latest</option>
            <option value="price_asc">Price: Low to high</option>
            <option value="price_desc">Price: High to low</option>
          </select>
        </div>
      </section>

      {error && <p className="status-banner status-banner-error">{error}</p>}
      {loading && <p className="status-banner">Loading services...</p>}

      <section className="space-y-5" id="services-grid">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="section-kicker">Services</span>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-950">
              Curated offers from freelancers
            </h2>
          </div>
          <p className="text-sm text-slate-500">{services.length} services available</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {!loading && services.length === 0 && (
            <p className="status-banner md:col-span-2 xl:col-span-3">No services matched the current filters.</p>
          )}
          {services.map((service) => <ServiceCard key={service.id} service={service} />)}
        </div>
      </section>
    </div>
  )
}

export default HomePage
