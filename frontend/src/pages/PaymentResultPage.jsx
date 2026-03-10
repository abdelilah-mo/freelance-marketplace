import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiRequest } from '../lib/api.js'

function PaymentResultPage() {
  const { result } = useParams()
  const { token } = useAuth()
  const [searchParams] = useSearchParams()
  const [message, setMessage] = useState(result === 'cancel' ? 'Payment was canceled.' : 'Confirming payment...')
  const [error, setError] = useState('')
  const paymentId = searchParams.get('payment_id')
  const sessionId = searchParams.get('session_id')
  const missingContext = result === 'success' && (!paymentId || !token)

  useEffect(() => {
    if (result !== 'success' || missingContext) {
      return
    }

    apiRequest(`/payments/${paymentId}/confirm`, {
      method: 'POST',
      token,
      body: { session_id: sessionId },
    })
      .then((payload) => {
        setMessage(payload.message)
        setError('')
      })
      .catch((requestError) => setError(requestError.message))
  }, [missingContext, paymentId, result, sessionId, token])

  return (
    <section className="mx-auto max-w-2xl">
      <div className="surface-card p-8 text-center sm:p-10">
        <span className="section-kicker">Payment {result}</span>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-slate-950">
          {result === 'success' ? 'Checkout finished' : 'Checkout canceled'}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
          Your payment record is being synchronized with the marketplace so the correct order state appears in the dashboard.
        </p>

        <div className="mt-8">
          {missingContext ? (
            <p className="status-banner status-banner-error">Missing payment context or authentication token.</p>
          ) : error ? (
            <p className="status-banner status-banner-error">{error}</p>
          ) : (
            <p className="status-banner">{message}</p>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <Link className="btn-primary" to="/dashboard">Return to dashboard</Link>
        </div>
      </div>
    </section>
  )
}

export default PaymentResultPage
