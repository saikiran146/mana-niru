require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { initDb } = require('./db');
const ordersRouter = require('./routes/orders');
const paymentRouter = require('./routes/payment');
const adminRouter = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/orders', ordersRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/admin', adminRouter);

// Serve built React frontend
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

// All non-API routes → React app (handles client-side routing)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

const PORT = process.env.PORT || 3001;

initDb();

app.listen(PORT, () => {
  console.log(`Mana-Niru running on http://localhost:${PORT}`);
});
