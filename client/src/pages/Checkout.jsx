import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import axios from 'axios'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const PRICES = { '500ml': 80, '1ltr': 95 }
const SIZE_NAMES = { '500ml': '500ml Case', '1ltr': '1 Litre Case' }

function PaymentForm({ orderData, clientSecret, paymentIntentId, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')

  async function handlePay(e) {
    e.preventDefault()
    if (!stripe || !elements) return
    setPaying(true)
    setError('')

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message)
      setPaying(false)
      return
    }

    try {
      await axios.post('/api/orders', { ...orderData, payment_intent_id: paymentIntentId })
      onSuccess()
    } catch {
      setError('Order saved but payment failed to record. Contact support.')
      setPaying(false)
    }
  }

  return (
    <form onSubmit={handlePay}>
      <div className="stripe-wrapper">
        <PaymentElement />
      </div>
      {error && <div className="error-msg">{error}</div>}
      <button className="btn btn-blue btn-full" type="submit" disabled={!stripe || paying}>
        {paying ? 'Processing...' : `Pay ₹${orderData.total_amount}`}
      </button>
    </form>
  )
}

export default function Checkout() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    customer_name: '',
    phone: '',
    address: '',
    bottle_size: state?.size || '500ml',
    quantity: 1,
  })

  const [step, setStep] = useState('form') // 'form' | 'payment'
  const [clientSecret, setClientSecret] = useState('')
  const [paymentIntentId, setPaymentIntentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const price = PRICES[form.bottle_size]
  const total = price * form.quantity

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: name === 'quantity' ? Math.max(1, parseInt(value) || 1) : value }))
  }

  async function handleProceed(e) {
    e.preventDefault()
    if (!form.customer_name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('Please fill all fields.')
      return
    }
    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError('Enter a valid 10-digit Indian mobile number.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await axios.post('/api/payment/create-intent', { amount: total })
      setClientSecret(res.data.clientSecret)
      setPaymentIntentId(res.data.id)
      setStep('payment')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate payment. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const orderData = {
    ...form,
    total_amount: total,
  }

  return (
    <div className="page-container" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">💧</div>
          <div>
            <div className="navbar-title">Mana-Niru</div>
            <div className="navbar-subtitle">Checkout</div>
          </div>
        </Link>
      </nav>

      <div className="form-wrapper">
        {step === 'form' && (
          <div className="card">
            <div className="card-header">
              <h2>Place Your Order</h2>
              <p>Fill in your details and we'll deliver to your door</p>
            </div>
            <div className="card-body">
              {error && <div className="error-msg">{error}</div>}

              <form onSubmit={handleProceed}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input name="customer_name" value={form.customer_name} onChange={handleChange} placeholder="Your full name" />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Delivery Address *</label>
                  <textarea name="address" value={form.address} onChange={handleChange} placeholder="House no, Street, City, State, PIN code" />
                </div>

                <div className="form-group">
                  <label>Bottle Size</label>
                  <div className="size-options">
                    {[['500ml', '500ml Case', 80], ['1ltr', '1 Litre Case', 95]].map(([val, label, p]) => (
                      <span key={val}>
                        <input type="radio" className="size-option" id={`size-${val}`} name="bottle_size" value={val} checked={form.bottle_size === val} onChange={handleChange} />
                        <label htmlFor={`size-${val}`}>
                          <div className="size-name">{label}</div>
                          <div className="size-price">₹{p} / case</div>
                        </label>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Number of Cases</label>
                  <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min={1} max={100} />
                </div>

                <div className="order-summary">
                  <div className="summary-row"><span>Size</span><span>{SIZE_NAMES[form.bottle_size]}</span></div>
                  <div className="summary-row"><span>Price per case</span><span>₹{price}</span></div>
                  <div className="summary-row"><span>Quantity</span><span>{form.quantity} case(s)</span></div>
                  <div className="summary-row summary-total"><span>Total</span><span>₹{total}</span></div>
                </div>

                <button className="btn btn-blue btn-full" type="submit" disabled={loading}>
                  {loading ? 'Please wait...' : `Proceed to Pay ₹${total}`}
                </button>
              </form>
            </div>
          </div>
        )}

        {step === 'payment' && clientSecret && (
          <div className="card">
            <div className="card-header">
              <h2>Secure Payment</h2>
              <p>Complete your payment of ₹{total} for {form.quantity} case(s) of {SIZE_NAMES[form.bottle_size]}</p>
            </div>
            <div className="card-body">
              <div className="order-summary" style={{ marginBottom: '1.5rem' }}>
                <div className="summary-row"><span>Customer</span><span>{form.customer_name}</span></div>
                <div className="summary-row"><span>Phone</span><span>{form.phone}</span></div>
                <div className="summary-row summary-total"><span>Amount to Pay</span><span>₹{total}</span></div>
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                <PaymentForm
                  orderData={orderData}
                  clientSecret={clientSecret}
                  paymentIntentId={paymentIntentId}
                  onSuccess={() => navigate('/success', { state: { order: { ...form, total_amount: total } } })}
                />
              </Elements>

              <button className="btn btn-sm" style={{ marginTop: '1rem', color: 'var(--text-muted)' }} onClick={() => setStep('form')}>
                ← Edit order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
