import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET all clients
router.get('/', async (req, res) => {
  try {
    const clients = await db.all('SELECT * FROM clients');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single client by ID
router.get('/:id', async (req, res) => {
  try {
    const client = await db.get('SELECT * FROM clients WHERE id = ?', req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a new client
router.post('/', async (req, res) => {
  try {
    const { name, email, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Client name is required' });

    const result = await db.run(
      'INSERT INTO clients (name, email, address) VALUES (?, ?, ?)',
      [name, email || '', address || '']
    );
    const newClient = await db.get('SELECT * FROM clients WHERE id = ?', result.lastID);
    res.status(201).json(newClient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a client
router.put('/:id', async (req, res) => {
  try {
    const { name, email, address } = req.body;
    const client = await db.get('SELECT * FROM clients WHERE id = ?', req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    await db.run(
      'UPDATE clients SET name = ?, email = ?, address = ? WHERE id = ?',
      [
        name || client.name,
        email ?? client.email,
        address ?? client.address,
        req.params.id
      ]
    );
    const updatedClient = await db.get('SELECT * FROM clients WHERE id = ?', req.params.id);
    res.json(updatedClient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a client
router.delete('/:id', async (req, res) => {
  try {
    const client = await db.get('SELECT * FROM clients WHERE id = ?', req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    await db.run('DELETE FROM clients WHERE id = ?', req.params.id);
    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
