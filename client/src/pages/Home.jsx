import { Link, useNavigate } from 'react-router-dom'

const PRODUCTS = [
  {
    id: '500ml',
    name: '500ml Case',
    emoji: '💧',
    price: 80,
    description: 'Perfect for on-the-go hydration. Each case contains 24 bottles of pure Mana-Niru water.',
    badge: 'Best Seller',
  },
  {
    id: '1ltr',
    name: '1 Litre Case',
    emoji: '🫙',
    price: 95,
    description: 'Ideal for home and office use. Each case contains 12 bottles of refreshing Mana-Niru water.',
    badge: 'Family Pack',
  },
]

const FEATURES = [
  { icon: '💎', title: 'Pure & Clean', desc: 'Multi-stage purification process for the cleanest water.' },
  { icon: '🚚', title: 'Fast Delivery', desc: 'Delivered right to your doorstep within 24 hours.' },
  { icon: '✅', title: 'BIS Certified', desc: 'Meets all Indian quality standards and certifications.' },
  { icon: '💳', title: 'Secure Payment', desc: 'Safe and encrypted payments via Stripe.' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="page-container">
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">💧</div>
          <div>
            <div className="navbar-title">Mana-Niru</div>
            <div className="navbar-subtitle">Pure Water Delivered</div>
          </div>
        </Link>
        <nav className="navbar-nav">
          <Link to="/admin" className="nav-link">Admin</Link>
        </nav>
      </nav>

      <div className="hero">
        <div className="hero-content">
          <div className="hero-badge">🌊 Fresh &amp; Pure</div>
          <h1>Drink <span>Mana-Niru</span>,<br />Stay Hydrated</h1>
          <p>Premium quality water delivered to your home. Order by the case and save more.</p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}>
              Order Now
            </button>
            <Link to="/admin" className="btn btn-outline">Admin Panel</Link>
          </div>
        </div>
      </div>

      <section className="section" id="products">
        <div className="section-title">Our Products</div>
        <p className="section-sub">Choose your preferred bottle size — sold by the case</p>
        <div className="products-grid">
          {PRODUCTS.map(p => (
            <div className="product-card" key={p.id}>
              <div className="product-card-img">
                <span>{p.emoji}</span>
                <span className="product-badge">{p.badge}</span>
              </div>
              <div className="product-card-body">
                <div className="product-card-title">Mana-Niru {p.name}</div>
                <div className="product-card-desc">{p.description}</div>
                <div className="product-card-price">
                  ₹{p.price} <span>per case</span>
                </div>
                <button
                  className="btn btn-blue btn-full"
                  onClick={() => navigate('/checkout', { state: { size: p.id, price: p.price, name: p.name } })}
                >
                  Order This Size
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="section-title">Why Mana-Niru?</div>
        <p className="section-sub">Quality you can taste, service you can trust</p>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <strong>Mana-Niru</strong> — Pure Water Delivered &nbsp;|&nbsp; © {new Date().getFullYear()} All rights reserved.
      </footer>
    </div>
  )
}
