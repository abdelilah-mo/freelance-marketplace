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
    <div className="stack-xl">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Freelance marketplace</span>
          <h1>Buy services. Sell expertise. Run the whole flow through one Laravel API.</h1>
          <p>
            Browse curated gigs, filter by category and budget, then place an order with Stripe checkout or the built-in mock payment flow.
          </p>
        </div>

        <div className="hero-stats">
          <div>
            <strong>Client</strong>
            <span>Find and order specialized services fast.</span>
          </div>
          <div>
            <strong>Freelancer</strong>
            <span>Create gigs, manage incoming orders, and update progress.</span>
          </div>
          <div>
            <strong>Admin</strong>
            <span>Moderate users, services, and orders from one dashboard.</span>
          </div>
        </div>
      </section>

      <section className="filter-panel">
        <input
          className="field"
          placeholder="Search services"
          value={filters.q}
          onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
        />

        <select
          className="field"
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
          className="field"
          type="number"
          min="0"
          placeholder="Min price"
          value={filters.minPrice}
          onChange={(event) => setFilters((current) => ({ ...current, minPrice: event.target.value }))}
        />

        <input
          className="field"
          type="number"
          min="0"
          placeholder="Max price"
          value={filters.maxPrice}
          onChange={(event) => setFilters((current) => ({ ...current, maxPrice: event.target.value }))}
        />

        <select
          className="field"
          value={filters.sort}
          onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}
        >
          <option value="latest">Latest</option>
          <option value="price_asc">Price: Low to high</option>
          <option value="price_desc">Price: High to low</option>
        </select>
      </section>

      {error && <p className="status-banner error">{error}</p>}
      {loading && <p className="status-banner">Loading services...</p>}

      <section className="service-grid">
        {!loading && services.length === 0 && <p className="empty-state">No services matched the current filters.</p>}
        {services.map((service) => <ServiceCard key={service.id} service={service} />)}
      </section>
    </div>
  )
}

export default HomePage
