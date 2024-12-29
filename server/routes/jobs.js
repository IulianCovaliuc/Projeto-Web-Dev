const express = require('express');
const router = express.Router();
const pool = require('../config/db.config');
const jwt = require('jsonwebtoken');

// Get all jobs
router.get('/', async (req, res) => {
    try {
        const [jobs] = await pool.execute('SELECT * FROM jobs ORDER BY created_at DESC');
        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Create new job
router.post('/', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const decoded = jwt.verify(token, 'random-key');

        // Check if admin
        const [users] = await pool.execute('SELECT role FROM users WHERE id = ?', [decoded.userId]);
        if (users[0]?.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { title, description, requirements, location } = req.body;
        await pool.execute(
            'INSERT INTO jobs (title, description, requirements, location) VALUES (?, ?, ?, ?)',
            [title, description, requirements, location]
        );

        res.status(201).json({ message: 'Job created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Update job status
router.patch('/:id/status', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        const decoded = jwt.verify(token, 'random-key');

        // Check if admin
        const [users] = await pool.execute('SELECT role FROM users WHERE id = ?', [decoded.userId]);
        if (users[0]?.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { status } = req.body;
        await pool.execute(
            'UPDATE jobs SET status = ? WHERE id = ?',
            [status, req.params.id]
        );

        res.json({ message: 'Job status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;