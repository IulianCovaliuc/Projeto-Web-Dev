const express = require('express');
const router = express.Router();
const pool = require('../config/db.config');
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
    try {
        const { items, total_amount } = req.body;
        const token = req.headers.authorization?.split(' ')[1];
        const decoded = jwt.verify(token, 'random-key');

        const [result] = await pool.execute(
            'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)',
            [decoded.userId, total_amount]
        );

        const orderId = result.insertId;

        for (const item of items) {
            await pool.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.id, 1, item.price]
            );
        }

        res.status(201).json({ message: 'Order created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/my-orders', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        console.log('Received Token', token);
        const decoded = jwt.verify(token, 'random-key');

        const [orders] = await pool.execute(`
            SELECT orders.*, 
                   GROUP_CONCAT(order_items.product_id) as product_ids,
                   GROUP_CONCAT(products.name) as product_names
            FROM orders 
            LEFT JOIN order_items ON orders.id = order_items.order_id
            LEFT JOIN products ON order_items.product_id = products.id
            WHERE orders.user_id = ?
            GROUP BY orders.id
            ORDER BY orders.created_at DESC`,
            [decoded.userId]
        );

        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;