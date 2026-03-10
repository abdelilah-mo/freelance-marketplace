import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiRequest } from '../lib/api.js'

function CreateServicePage() {
  const { token } = useAuth()
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(serviceId)
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    delivery_days: '3',
    category_id: '',
    is_active: true,
    image: null,
  })

  useEffect(() => {
    const load = async () => {
      try {
        const categoriesPayload = await apiRequest('/categories')
        setCategories(categoriesPayload.data || [])

        if (isEditing) {
          const servicePayload = await apiRequest(`/services/${serviceId}`)
          const service = servicePayload.data

          setForm({
            title: service.title,
            description: service.description,
            price: service.price,
            delivery_days: String(service.delivery_days),
            category_id: String(service.category_id),
            is_active: service.is_active,
            image: null,
          })
        }
      } catch (requestError) {
        setError(requestError.message)
      }
    }

    load()
  }, [isEditing, serviceId])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      const payload = new FormData()
      payload.append('title', form.title)
      payload.append('description', form.description)
      payload.append('price', form.price)
      payload.append('delivery_days', form.delivery_days)
      payload.append('category_id', form.category_id)
      payload.append('is_active', form.is_active ? '1' : '0')

      if (form.image) {
        payload.append('image', form.image)
      }

      const endpoint = isEditing ? `/services/${serviceId}` : '/services'

      await apiRequest(endpoint, {
        method: 'POST',
        token,
        body: payload,
        isFormData: true,
      })

      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.25fr_0.8fr]">
      <div className="surface-card p-8">
        <div className="space-y-2">
          <span className="section-kicker">{isEditing ? 'Edit service' : 'Create service'}</span>
          <h1 className="section-title">{isEditing ? 'Update your service listing' : 'Publish a high-converting service page'}</h1>
          <p className="text-sm text-slate-500">
            Improve presentation without touching any backend endpoints. This form still uses the same API workflow.
          </p>
        </div>

        <form className="mt-8 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <input
            className="field-input sm:col-span-2"
            placeholder="Service title"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />
          <select
            className="field-input"
            value={form.category_id}
            onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value }))}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <input
            className="field-input"
            type="number"
            min="5"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
          />
          <textarea
            className="field-input min-h-40 sm:col-span-2"
            placeholder="Describe what the client gets"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
          <input
            className="field-input"
            type="number"
            min="1"
            max="60"
            placeholder="Delivery days"
            value={form.delivery_days}
            onChange={(event) => setForm((current) => ({ ...current, delivery_days: event.target.value }))}
          />
          <label className="flex min-h-[56px] items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-600">
            <span>Service image</span>
            <input type="file" accept="image/*" onChange={(event) => setForm((current) => ({ ...current, image: event.target.files?.[0] || null }))} />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 sm:col-span-2">
            <input
              checked={form.is_active}
              type="checkbox"
              onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
            />
            Visible to clients
          </label>

          {error && <p className="status-banner status-banner-error sm:col-span-2">{error}</p>}
          <button className="btn-primary w-full sm:col-span-2" disabled={submitting} type="submit">
            {submitting ? 'Saving...' : isEditing ? 'Update service' : 'Create service'}
          </button>
        </form>
      </div>

      <aside className="space-y-6">
        <div className="surface-card p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Preview summary</p>
          <h2 className="mt-3 font-display text-2xl font-semibold text-slate-950">
            {form.title || 'Your service title'}
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {form.description || 'Describe your offer clearly so clients understand deliverables, timing, and value.'}
          </p>
          <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Price</span>
              <strong className="text-slate-950">${form.price || '0.00'}</strong>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span>Delivery</span>
              <strong className="text-slate-950">{form.delivery_days || '0'} days</strong>
            </div>
          </div>
        </div>
      </aside>
    </section>
  )
}

export default CreateServicePage
