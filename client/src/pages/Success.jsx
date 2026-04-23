import { useLocation, Link } from 'react-router-dom'

const SIZE_NAMES = { '500ml': '500ml Case', '1ltr': '1 Litre Case' }

export default function Success() {
  const { state } = useLocation()
  const order = state?.order

  return (
    <div className="success-container">
      <div className="success-icon">✅</div>
      <h1>Order Placed!</h1>
      <p>Thank you for choosing <strong>Mana-Niru</strong></p>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>We'll deliver your water soon.</p>

      {order && (
        <div className="success-card">
          <div style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>Order Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Name:</span> {order.customer_name}</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Phone:</span> {order.phone}</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Address:</span> {order.address}</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Product:</span> Mana-Niru {SIZE_NAMES[order.bottle_size]}</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Quantity:</span> {order.quantity} case(s)</div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.25rem', fontWeight: 700 }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Paid:</span> ₹{order.total_amount}
            </div>
          </div>
        </div>
      )}

      <Link to="/" className="btn btn-blue">Back to Home</Link>
    </div>
  )
}
