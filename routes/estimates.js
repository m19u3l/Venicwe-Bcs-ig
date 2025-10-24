import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET all estimates
router.get('/', async (req, res) => {
  try {
    const estimates = await db.all(`
      SELECT e.id, e.client AS client_id, e.date_created, e.total, e.expiry_date,
             c.name AS client_name
      FROM estimates e
      LEFT JOIN clients c ON e.client = c.id
      ORDER BY e.date_created DESC
    `);
    res.json(estimates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single estimate with line items
router.get('/:id', async (req, res) => {
  try {
    const estimate = await db.get(`
      SELECT e.id, e.client AS client_id, e.date_created, e.total, e.expiry_date,
             c.name AS client_name
      FROM estimates e
      LEFT JOIN clients c ON e.client = c.id
      WHERE e.id = ?
    `, req.params.id);

    if (!estimate) return res.status(404).json({ error: 'Estimate not found' });

    const line_items = await db.all(`
      SELECT li.id, li.estimate AS estimate_id, li.service AS service_id, li.quantity, li.total,
             s.description AS service_description
      FROM line_items li
      LEFT JOIN services s ON li.service = s.id
      WHERE li.estimate = ?
    `, req.params.id);

    res.json({ estimate, line_items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE estimate
router.post('/', async (req, res) => {
  try {
    const { client, total, expiry_date } = req.body;
    if (!client) return res.status(400).json({ error: 'Client ID is required' });

    const result = await db.run(`
      INSERT INTO estimates (client, total, expiry_date)
      VALUES (?, ?, ?)
    `, [client, total || 0, expiry_date || null]);

    const newEstimate = await db.get('SELECT * FROM estimates WHERE id = ?', result.lastID);
    res.status(201).json(newEstimate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE estimate
router.put('/:id', async (req, res) => {
  try {
    const { client, total, expiry_date } = req.body;
    const estimate = await db.get('SELECT * FROM estimates WHERE id = ?', req.params.id);
    if (!estimate) return res.status(404).json({ error: 'Estimate not found' });

    await db.run(`
      UPDATE estimates
      SET client = ?, total = ?, expiry_date = ?
      WHERE id = ?
    `, [client || estimate.client, total ?? estimate.total, expiry_date || estimate.expiry_date, req.params.id]);

    const updatedEstimate = await db.get('SELECT * FROM estimates WHERE id = ?', req.params.id);
    res.json(updatedEstimate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE estimate with line items
router.delete('/:id', async (req, res) => {
  try {
    const estimate = await db.get('SELECT * FROM estimates WHERE id = ?', req.params.id);
    if (!estimate) return res.status(404).json({ error: 'Estimate not found' });

    await db.run('DELETE FROM line_items WHERE estimate = ?', req.params.id);
    await db.run('DELETE FROM estimates WHERE id = ?', req.params.id);

    res.json({ message: 'Estimate and related line items deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
