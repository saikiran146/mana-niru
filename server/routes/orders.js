const express = require('express');
const { db } = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json(orders);
});

router.post('/', (req, res) => {
  const { customer_name, phone, address, bottle_size, quantity, total_amount, payment_intent_id } = req.body;

  const result = db.prepare(`
    INSERT INTO orders (customer_name, phone, address, bottle_size, quantity, total_amount, payment_status, payment_intent_id)
    VALUES (?, ?, ?, ?, ?, ?, 'paid', ?)
  `).run(customer_name, phone, address, bottle_size, quantity, total_amount, payment_intent_id);

  res.json({ id: result.lastInsertRowid });
});

router.put('/:id/status', auth, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE orders SET payment_status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
