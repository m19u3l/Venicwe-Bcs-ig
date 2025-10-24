import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET all change orders
router.get('/', async (req, res) => {
  try {
    const orders = await db.all(`
      SELECT co.id, co.invoice AS invoice_id, co.date_created, co.total, co.description,
             i.client AS client_id, c.name AS client_name
      FROM change_orders co
      LEFT JOIN invoices i ON co.invoice = i.id
      LEFT JOIN clients c ON i.client = c.id
      ORDER BY co.date_created DESC
    `);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single change order with line items
router.get('/:id', async (req, res) => {
  try {
    const order = await db.get(`
      SELECT co.id, co.invoice AS invoice_id, co.date_created, co.total, co.description,
             i.client AS client_id, c.name AS client_name
      FROM change_orders co
      LEFT JOIN invoices i ON co.invoice = i.id
      LEFT JOIN clients c ON i.client = c.id
      WHERE co.id = ?
    `, req.params.id);

    if (!order) return res.status(404).json({ error: 'Change order not found' });

    const line_items = await db.all(`
      SELECT li.id, li.change_order AS change_order_id, li.service AS service_id, li.quantity, li.total,
             s.description AS service_description
      FROM line_items li
      LEFT JOIN services s ON li.service = s.id
      WHERE li.change_order = ?
    `, req.params.id);

    res.json({ order, line_items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE change order
router.post('/', async (req, res) => {
  try {
    const { invoice, total, description } = req.body;
    if (!invoice) return res.status(400).json({ error: 'Invoice ID is required' });

    const result = await db.run(`
      INSERT INTO change_orders (invoice, total, description)
      VALUES (?, ?, ?)
    `, [invoice, total || 0, description || '']);

    const newOrder = await db.get('SELECT * FROM change_orders WHERE id = ?', result.lastID);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE change order
router.put('/:id', async (req, res) => {
  try {
    const { invoice, total, description } = req.body;
    const order = await db.get('SELECT * FROM change_orders WHERE id = ?', req.params.id);
    if (!order) return res.status(404).json({ error: 'Change order not found' });

    await db.run(`
      UPDATE change_orders
      SET invoice = ?, total = ?, description = ?
      WHERE id = ?
    `, [invoice || order.invoice, total ?? order.total, description || order.description, req.params.id]);

    const updatedOrder = await db.get('SELECT * FROM change_orders WHERE id = ?', req.params.id);
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE change order with line items
router.delete('/:id', async (req, res) => {
  try {
    const order = await db.get('SELECT * FROM change_orders WHERE id = ?', req.params.id);
    if (!order) return res.status(404).json({ error: 'Change order not found' });

    await db.run('DELETE FROM line_items WHERE change_order = ?', req.params.id);
    await db.run('DELETE FROM change_orders WHERE id = ?', req.params.id);

    res.json({ message: 'Change order and related line items deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
