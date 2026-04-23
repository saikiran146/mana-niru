import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

const STATUSES = ['paid', 'dispatched', 'delivered', 'cancelled']

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
}

function ChangePasswordModal({ onClose, onChanged }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.newPassword.length < 6) { setError('New password must be at least 6 characters.'); return }
    if (form.newPassword !== form.confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await axios.post('/api/admin/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }, { headers: authHeader() })
      onChanged()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>🔐 Change Password</h3>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
          </div>
          <div className="modal-actions">
            {onClose && <button type="button" className="btn btn-sm" onClick={onClose}>Cancel</button>}
            <button className="btn btn-blue btn-sm" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(!!state?.mustChangePassword)
  const [forcedChange] = useState(!!state?.mustChangePassword)

  async function fetchOrders() {
    try {
      const res = await axios.get('/api/orders', { headers: authHeader() })
      setOrders(res.data)
    } catch (err) {
      if (err.response?.status === 401) { localStorage.removeItem('adminToken'); navigate('/admin') }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  async function updateStatus(id, status) {
    await axios.put(`/api/orders/${id}/status`, { status }, { headers: authHeader() })
    setOrders(o => o.map(ord => ord.id === id ? { ...ord, payment_status: status } : ord))
  }

  async function deleteOrder(id) {
    if (!window.confirm('Delete this order?')) return
    await axios.delete(`/api/orders/${id}`, { headers: authHeader() })
    setOrders(o => o.filter(ord => ord.id !== id))
  }

  function logout() {
    localStorage.removeItem('adminToken')
    navigate('/admin')
  }

  const totalRevenue = orders.filter(o => o.payment_status !== 'cancelled').reduce((s, o) => s + o.total_amount, 0)
  const paidCount = orders.filter(o => o.payment_status === 'paid').length
  const deliveredCount = orders.filter(o => o.payment_status === 'delivered').length

  function badgeClass(status) {
    const map = { paid: 'badge-paid', dispatched: 'badge-dispatched', delivered: 'badge-delivered', pending: 'badge-pending', cancelled: 'badge-pending' }
    return map[status] || 'badge-pending'
  }

  return (
    <div className="admin-layout">
      {showPasswordModal && (
        <ChangePasswordModal
          onClose={forcedChange ? null : () => setShowPasswordModal(false)}
          onChanged={() => { setShowPasswordModal(false); alert('Password changed successfully!') }}
        />
      )}

      <div className="admin-topbar">
        <div className="admin-topbar-title">💧 Mana-Niru — Admin Dashboard</div>
        <div className="admin-topbar-right">
          <span className="admin-topbar-user">👤 admin</span>
          <button className="btn btn-sm btn-outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }} onClick={() => setShowPasswordModal(true)}>
            Change Password
          </button>
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }} onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{orders.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending Dispatch</div>
            <div className="stat-value">{paidCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Delivered</div>
            <div className="stat-value green">{deliveredCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="orders-table-wrap">
          <div className="orders-table-header">
            <h3>All Orders</h3>
            <button className="btn btn-blue btn-sm" onClick={fetchOrders}>↻ Refresh</button>
          </div>

          {loading ? (
            <div className="empty-state"><div>Loading orders...</div></div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <div>No orders yet. Share your store link to start receiving orders!</div>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Size</th>
                    <th>Qty</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td><strong>#{o.id}</strong></td>
                      <td>{o.customer_name}</td>
                      <td>{o.phone}</td>
                      <td style={{ maxWidth: 180, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{o.address}</td>
                      <td>{o.bottle_size === '500ml' ? '500ml' : '1 Litre'}</td>
                      <td>{o.quantity}</td>
                      <td><strong>₹{o.total_amount}</strong></td>
                      <td>
                        <span className={`badge ${badgeClass(o.payment_status)}`}>{o.payment_status}</span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <select
                            className="status-select"
                            value={o.payment_status}
                            onChange={e => updateStatus(o.id, e.target.value)}
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                          </select>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteOrder(o.id)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
