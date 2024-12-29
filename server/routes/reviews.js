const express = require('express');
const router = express.Router();
const pool = require('../config/db.config');
const jwt = require('jsonwebtoken');

// Get reviews for a product
router.get('/product/:id', async (req, res) => {
    try {
        const [reviews] = await pool.execute(`
            SELECT reviews.*, users.username 
            FROM reviews 
            JOIN users ON reviews.user_id = users.id
            WHERE product_id = ?
            ORDER BY created_at DESC`,
            [req.params.id]
        );
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a review
router.post('/', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Not authorized' });

        const decoded = jwt.verify(token, 'random-key');
        const { product_id, rating, comment } = req.body;

        // Check if user has purchased the product
        const [orders] = await pool.execute(`
            SELECT orders.id FROM orders 
            JOIN order_items ON orders.id = order_items.order_id
            WHERE orders.user_id = ? AND order_items.product_id = ?`,
            [decoded.userId, product_id]
        );

        if (orders.length === 0) {
            return res.status(403).json({ message: 'You must purchase the product before reviewing' });
        }

        // Check if user already reviewed this product
        const [existingReview] = await pool.execute(
            'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
            [decoded.userId, product_id]
        );

        if (existingReview.length > 0) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        await pool.execute(
            'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
            [product_id, decoded.userId, rating, comment]
        );

        res.status(201).json({ message: 'Review added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;