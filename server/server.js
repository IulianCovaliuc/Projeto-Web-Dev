const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');
const jobRoutes = require('./routes/jobs');
const reviewRoutes = require('./routes/reviews');

const app = express();

app.use((req, res, next) => {
    console.log('Request:', req.method, req.path, req.body);
    next();
});
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/reviews', reviewRoutes);

// Routes will go here
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running!' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/public/login.html'));
});

app.use(express.static(path.join(__dirname, '../client/public')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});