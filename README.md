# Mana-Niru 💧

A full-stack water bottle ordering web application for the **Mana-Niru** brand. Customers can browse products, place orders, and pay online. The built-in admin panel lets you manage orders, track revenue, and update delivery status.

---

## Features

**Customer Storefront**
- Product listing for 500ml and 1 Litre cases
- Order form — name, phone, delivery address, bottle size, quantity
- Secure payment via Stripe (INR)
- Order confirmation page

**Admin Panel**
- Protected login with JWT authentication
- Force password change on first login
- Dashboard with stats — total orders, pending, delivered, total revenue
- Full orders table with customer details
- Update order status: Paid → Dispatched → Delivered → Cancelled
- Delete orders

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Stripe Elements |
| Backend | Node.js, Express |
| Database | SQLite (via better-sqlite3) |
| Payments | Stripe (INR / ₹) |
| Auth | JWT + bcryptjs |
| Build tool | Vite |

---

## Project Structure

```
water-bottle/
├── client/                   # React frontend
│   ├── src/
│   │   ├── App.jsx           # Routes and protected route logic
│   │   ├── index.css         # Global styles (blue theme)
│   │   └── pages/
│   │       ├── Home.jsx          # Storefront with product cards
│   │       ├── Checkout.jsx      # Order form + Stripe payment
│   │       ├── Success.jsx       # Order confirmation
│   │       ├── AdminLogin.jsx    # Admin sign-in
│   │       └── AdminDashboard.jsx # Order management
│   ├── .env.example          # Client environment variable template
│   ├── vite.config.js        # Vite config with API proxy for dev
│   └── package.json
│
├── server/                   # Express backend
│   ├── routes/
│   │   ├── orders.js         # GET/POST/PUT/DELETE orders
│   │   ├── payment.js        # Stripe payment intent creation
│   │   └── admin.js          # Login and change-password
│   ├── middleware/
│   │   └── auth.js           # JWT verification middleware
│   ├── db.js                 # SQLite setup and admin seed
│   ├── index.js              # Express app entry point
│   ├── .env.example          # Server environment variable template
│   └── package.json
│
├── portal.html               # Local launcher page with links to all pages
└── .gitignore
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [Stripe account](https://dashboard.stripe.com/register) (free)

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/saikiran146/mana-niru.git
cd mana-niru
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Configure environment variables

**Server** — copy and fill in `server/.env`:

```bash
cp server/.env.example server/.env
```

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
JWT_SECRET=any-long-random-string
PORT=3001
```

**Client** — copy and fill in `client/.env`:

```bash
cp client/.env.example client/.env
```

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

> Get your Stripe API keys from [dashboard.stripe.com → Developers → API keys](https://dashboard.stripe.com/test/apikeys).  
> Use **test mode** keys (starting with `sk_test_` / `pk_test_`) during development.

### 4. Build the frontend

The Express server serves the React app as static files, so you need to build it once (and again any time you update `client/.env`):

```bash
cd client && npm run build
```

---

## Running the App

Start the server — it serves both the API and the website:

```bash
cd server && npm run dev
```

Open your browser and go to:

```
http://localhost:3001
```

Or open `portal.html` in your browser for a launch page with links to all pages and a live server status indicator.

---

## Pages

| Page | URL |
|---|---|
| Home / Storefront | `http://localhost:3001/` |
| Checkout | `http://localhost:3001/checkout` |
| Order Success | `http://localhost:3001/success` |
| Admin Login | `http://localhost:3001/admin` |
| Admin Dashboard | `http://localhost:3001/admin/dashboard` |

---

## Admin Panel

**Default credentials:**

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin` |

On first login you will be prompted to set a new password before accessing the dashboard. The prompt cannot be dismissed until the password is changed.

---

## Pricing

| Product | Price |
|---|---|
| 500ml Case | ₹80 per case |
| 1 Litre Case | ₹95 per case |

Prices can be updated in `client/src/pages/Home.jsx` and `client/src/pages/Checkout.jsx`. Rebuild the client after any price change.

---

## API Reference

All API routes are prefixed with `/api`.

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/orders` | No | Create a new order after payment |
| `GET` | `/api/orders` | Admin | List all orders |
| `PUT` | `/api/orders/:id/status` | Admin | Update order delivery status |
| `DELETE` | `/api/orders/:id` | Admin | Delete an order |

### Payment

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/payment/create-intent` | No | Create a Stripe PaymentIntent |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/admin/login` | No | Login and receive a JWT token |
| `POST` | `/api/admin/change-password` | Admin | Change admin password |
| `GET` | `/api/admin/me` | Admin | Verify token and return username |

---

## Order Status Flow

```
paid → dispatched → delivered
              ↘
           cancelled
```

Status can be updated at any stage from the admin dashboard.

---

## Development Mode

If you want hot-reload on the frontend during development, run both servers simultaneously:

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend (hot reload at localhost:5173)
cd client && npm run dev
```

The Vite dev server proxies all `/api` requests to `localhost:3001` automatically.

---

## Deployment Notes

- Set `NODE_ENV=production` in your server environment
- Replace test Stripe keys with live keys (`sk_live_` / `pk_live_`) in your production environment variables
- Never commit `.env` files — they are already listed in `.gitignore`
- The SQLite database file (`server/mananiru.db`) is also gitignored; back it up separately in production

---

## License

MIT
