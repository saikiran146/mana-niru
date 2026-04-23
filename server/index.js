require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { initDb } = require('./db');
const ordersRouter = require('./routes/orders');
const paymentRouter = require('./routes/payment');
const adminRouter = require('./routes/admin');

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

app.use('/api/orders', ordersRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/admin', adminRouter);

const PORT = process.env.PORT || 3001;

initDb();

app.listen(PORT, () => {
  console.log(`Mana-Niru server running on http://localhost:${PORT}`);
});
