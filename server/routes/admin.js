const express = require('express');
const router = express.Router();
const pool = require('../config/db.config');
const jwt = require('jsonwebtoken');

// Admin middleware
const isAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const decoded = jwt.verify(token, 'random-key');
        const [users] = await pool.execute('SELECT role FROM users WHERE id = ?', [decoded.userId]);

        if (users[0]?.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Get all users
router.get('/users', isAdmin, async (req, res) => {
    try {
        const [users] = await pool.execute('SELECT id, username, email, role FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Change user role
router.patch('/users/:id/role', isAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;

        await pool.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, userId]
        );
        res.json({ message: 'Role updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user
router.delete('/users/:id', isAdmin, async (req, res) => {
    try {
        await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Products management
router.post('/products', isAdmin, async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        await pool.execute(
            'INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)',
            [name, description, price, stock]
        );
        res.status(201).json({ message: 'Product added' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update product
router.put('/products/:id', isAdmin, async (req, res) => {
    try {
        const { name, description, price, stock } = req.body;
        await pool.execute(
            'UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?',
            [name, description, price, stock, req.params.id]
        );
        res.json({ message: 'Product updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete product
router.delete('/products/:id', isAdmin, async (req, res) => {
    try {
        await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/orders', isAdmin, async (req, res) => {
    try {
        const [orders] = await pool.execute(`
            SELECT orders.*, users.username 
            FROM orders 
            JOIN users ON orders.user_id = users.id
            ORDER BY orders.created_at DESC
        `);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.patch('/orders/:id', isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        await pool.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, req.params.id]
        );
        res.json({ message: 'Order status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get order details
router.get('/orders/:id', isAdmin, async (req, res) => {
    try {
        const [order] = await pool.execute(`
            SELECT orders.*, users.username,
                   order_items.product_id, products.name as product_name,
                   order_items.quantity, order_items.price
            FROM orders
            JOIN users ON orders.user_id = users.id
            JOIN order_items ON orders.id = order_items.order_id
            JOIN products ON order_items.product_id = products.id
            WHERE orders.id = ?
        `, [req.params.id]);
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;