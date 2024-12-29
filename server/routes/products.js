const express = require('express');
const router = express.Router();
const pool = require('../config/db.config');

router.get('/', async (req, res) => {
    try {
        const [products] = await pool.execute('SELECT * FROM products');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;