import express from 'express';
import db from '../db.js';

const router = express.Router();

// =========================
// GET all invoices
// =========================
router.get('/', async (req, res) => {
  try {
    const invoices = await db.all(`
      SELECT i.id, i.client AS client_id, i.date_created, i.total,
             c.name AS client_name
      FROM invoices i
      LEFT JOIN clients c ON i.client = c.id
      ORDER BY i.date_created DESC
    `);
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// GET single invoice with line items
// =========================
router.get('/:id', async (req, res) => {
  try {
    const invoice = await db.get(`
      SELECT i.id, i.client AS client_id, i.date_created, i.total,
             c.name AS client_name
      FROM invoices i
      LEFT JOIN clients c ON i.client = c.id
      WHERE i.id = ?
    `, req.params.id);

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const line_items = await db.all(`
      SELECT li.id, li.invoice AS invoice_id, li.service AS service_id, li.quantity, li.total,
             s.description AS service_description
      FROM line_items li
      LEFT JOIN services s ON li.service = s.id
      WHERE li.invoice = ?
    `, req.params.id);

    res.json({ invoice, line_items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// CREATE invoice
// =========================
router.post('/', async (req, res) => {
  try {
    const { client, total } = req.body;
    if (!client) return res.status(400).json({ error: 'Client ID is required' });

    const result = await db.run(`
      INSERT INTO invoices (client, total)
      VALUES (?, ?)
    `, [client, total || 0]);

    const newInvoice = await db.get('SELECT * FROM invoices WHERE id = ?', result.lastID);
    res.status(201).json(newInvoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// UPDATE invoice
// =========================
router.put('/:id', async (req, res) => {
  try {
    const { client, total } = req.body;
    const invoice = await db.get('SELECT * FROM invoices WHERE id = ?', req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    await db.run(`
      UPDATE invoices
      SET client = ?, total = ?
      WHERE id = ?
    `, [client || invoice.client, total ?? invoice.total, req.params.id]);

    const updatedInvoice = await db.get('SELECT * FROM invoices WHERE id = ?', req.params.id);
    res.json(updatedInvoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// DELETE invoice
// =========================
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await db.get('SELECT * FROM invoices WHERE id = ?', req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // Delete related line items first
    await db.run('DELETE FROM line_items WHERE invoice = ?', req.params.id);

    // Delete invoice
    await db.run('DELETE FROM invoices WHERE id = ?', req.params.id);
    res.json({ message: 'Invoice and related line items deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
