require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'electshop_secret_key_2024';

// ─── Middleware ────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
    'http://localhost:4200',
    'http://localhost:3000',
    'https://ecoomerc-lac.vercel.app',
    'https://ecoomerc.vercel.app',
    'https://ecoomerc-api.vercel.app',
    /\.vercel\.app$/
];
app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        const allowed = ALLOWED_ORIGINS.some(o =>
            typeof o === 'string' ? o === origin : o.test(origin)
        );
        callback(allowed ? null : new Error('CORS blocked'), allowed);
    },
    credentials: true
}));
app.use(express.json());

// ─── MongoDB Connection ────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI ||
    'mongodb+srv://adarshshukla4639_db_user:ovia1910@cluster0.46mletb.mongodb.net/ecommerce?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas — ecommerce database');
        console.log(`📦 Host: cluster0.46mletb.mongodb.net  |  DB: ecommerce`);
    })
    .catch(err => console.error('❌ MongoDB connection error:', err.message));

// Live connection events
mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('🔄 MongoDB reconnected'));

// ─── User Schema ───────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: 'United States' },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date }
}, { collection: 'user' });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const User = mongoose.model('User', userSchema);

// ─── Order Schema ──────────────────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema({
    productId: { type: String },
    name: { type: String, required: true },
    brand: { type: String, default: '' },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true }
}, { _id: false });

const shippingSchema = new mongoose.Schema({
    firstName: String, lastName: String, email: String, phone: String,
    address: String, city: String, state: String, zip: String,
    country: String, method: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userEmail: { type: String, required: true },
    items: [orderItemSchema],
    shipping: shippingSchema,
    payment: {
        method: { type: String, default: 'card' },   // card | paypal | applepay | cod
        cardLast4: { type: String, default: '' }
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: { type: String, enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
    trackingNumber: { type: String, default: '' },
    notes: { type: String, default: '' },
    placedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'orders' });

const Order = mongoose.model('Order', orderSchema);

// ─── Cart Schema ───────────────────────────────────────────────────────────────
const cartItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, default: '' },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    userEmail: { type: String, required: true },
    items: [cartItemSchema],
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'cart' });

const Cart = mongoose.model('Cart', cartSchema);

// ─── Product Schema ────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    rating: { type: Number, default: 4 },
    reviews: { type: Number, default: 0 },
    image: { type: String, default: '' },
    category: { type: String, required: true },
    badge: { type: String, default: null },
    inStock: { type: Boolean, default: true },
    description: { type: String, default: '' },
    features: [String]
}, { collection: 'products' });

productSchema.index({ category: 1 });
productSchema.index({ name: 'text', brand: 'text', description: 'text' });
productSchema.index({ discount: -1 });
productSchema.index({ rating: -1 });

const Product = mongoose.model('Product', productSchema);

// ─── Auth Middleware ───────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
    const userCount = await User.countDocuments().catch(() => -1);
    const orderCount = await Order.countDocuments().catch(() => -1);
    const cartCount = await Cart.countDocuments().catch(() => -1);
    const productCount = await Product.countDocuments().catch(() => -1);
    res.json({
        status: 'ok',
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        database: 'ecommerce',
        collections: { users: userCount, orders: orderCount, carts: cartCount, products: productCount },
        timestamp: new Date().toISOString()
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
//  PRODUCTS API
// ═══════════════════════════════════════════════════════════════════════════════

// GET all products (paginated, filtered, sorted)
// ?page=1&limit=24&category=Phones&sort=rating&search=samsung&badge=hot&minPrice=100&maxPrice=500
app.get('/api/products', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, parseInt(req.query.limit) || 24);
        const skip = (page - 1) * limit;
        const category = req.query.category;
        const search = req.query.search;
        const sort = req.query.sort || 'id';
        const badge = req.query.badge;
        const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
        const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;

        const filter = {};
        if (category) filter.category = category;
        if (badge) filter.badge = badge;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = minPrice;
            if (maxPrice) filter.price.$lte = maxPrice;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ];
        }

        const sortMap = {
            'price_asc': { price: 1 },
            'price_desc': { price: -1 },
            'rating': { rating: -1 },
            'discount': { discount: -1 },
            'reviews': { reviews: -1 },
            'newest': { id: -1 },
            'id': { id: 1 }
        };
        const sortObj = sortMap[sort] || { id: 1 };

        const [products, total] = await Promise.all([
            Product.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
            Product.countDocuments(filter)
        ]);

        res.json({ products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET featured products
app.get('/api/products/featured', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const products = await Product.find({ badge: { $in: ['hot', 'new'] } })
            .sort({ rating: -1 }).limit(limit).lean();
        res.json({ products });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// GET latest products
app.get('/api/products/latest', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const products = await Product.find({}).sort({ id: -1 }).limit(limit).lean();
        res.json({ products });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// GET deal products (discount >= 20%)
app.get('/api/products/deals', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 12;
        const products = await Product.find({ discount: { $gte: 20 } })
            .sort({ discount: -1 }).limit(limit).lean();
        res.json({ products });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// GET categories with product counts
app.get('/api/products/categories', async (req, res) => {
    try {
        const ICONS = { 'Phones': '📱', 'Laptops': '💻', 'Cameras': '📷', 'Headphones': '🎧', 'Smart Devices': '⌚', 'Gaming': '🎮', 'TV & Speaker': '📺', 'Chargers': '🔌' };
        const COLORS = { 'Phones': '#119EAE', 'Laptops': '#8e44ad', 'Cameras': '#e74c3c', 'Headphones': '#f39c12', 'Smart Devices': '#27ae60', 'Gaming': '#2c3e50', 'TV & Speaker': '#e67e22', 'Chargers': '#16a085' };
        const agg = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        const categories = agg.map((c, i) => ({
            id: i + 1, name: c._id, icon: ICONS[c._id] || '📦',
            color: COLORS[c._id] || '#119EAE', count: c.count, slug: c._id
        }));
        res.json({ categories });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// GET related products (same category)
app.get('/api/products/:id/related', async (req, res) => {
    try {
        const src = await Product.findOne({ id: Number(req.params.id) }).lean();
        if (!src) return res.status(404).json({ message: 'Not found' });
        const products = await Product.find({ category: src.category, id: { $ne: src.id } })
            .sort({ rating: -1 }).limit(4).lean();
        res.json({ products });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// GET single product by numeric id
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id: Number(req.params.id) }).lean();
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ product });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════════════════════

// ── REGISTER ───────────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !email || !password)
            return res.status(400).json({ message: 'First name, email and password are required' });

        const exists = await User.findOne({ email });
        if (exists) return res.status(409).json({ message: 'This email is already registered' });

        const user = await User.create({ firstName, lastName, email, password });
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        console.log(`✅ New user registered: ${email}`);
        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ── LOGIN ──────────────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Email and password are required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid email or password' });

        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        console.log(`✅ User logged in: ${email}`);
        res.json({
            message: 'Login successful',
            token,
            user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ── GET PROFILE ────────────────────────────────────────────────────────────────
app.get('/api/auth/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ── UPDATE PROFILE ─────────────────────────────────────────────────────────────
app.put('/api/auth/profile', authMiddleware, async (req, res) => {
    try {
        const { firstName, lastName, phone, address, city, country } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { firstName, lastName, phone, address, city, country },
            { new: true, runValidators: true }
        ).select('-password');
        res.json({ message: 'Profile updated', user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ── GET ALL USERS (admin) ──────────────────────────────────────────────────────
app.get('/api/users', authMiddleware, async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json({ count: users.length, users });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ── DELETE USER (admin) ────────────────────────────────────────────────────────
app.delete('/api/users/:id', authMiddleware, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  ORDERS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Place Order ────────────────────────────────────────────────────────────────
app.post('/api/orders', authMiddleware, async (req, res) => {
    try {
        const {
            items, shipping, payment,
            subtotal, shippingCost, tax, discount, grandTotal
        } = req.body;

        if (!items || !items.length)
            return res.status(400).json({ message: 'Order must have at least one item' });

        const orderId = 'ES-' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-3).toUpperCase();

        const order = await Order.create({
            orderId,
            userId: req.user.id,
            userEmail: req.user.email,
            items,
            shipping,
            payment: {
                method: payment?.method || 'card',
                cardLast4: payment?.cardLast4 || ''
            },
            subtotal: subtotal || 0,
            shippingCost: shippingCost || 0,
            tax: tax || 0,
            discount: discount || 0,
            grandTotal: grandTotal || 0,
            status: 'processing'
        });

        // Clear the user's saved cart on order placement
        await Cart.findOneAndUpdate(
            { userId: req.user.id },
            { items: [], updatedAt: new Date() }
        );

        console.log(`📦 New order placed: ${orderId} by ${req.user.email}  Total: $${grandTotal}`);
        res.status(201).json({ message: 'Order placed successfully', orderId: order.orderId, order });
    } catch (err) {
        console.error('Order error:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ── Get My Orders ──────────────────────────────────────────────────────────────
app.get('/api/orders/my', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ placedAt: -1 });
        res.json({ count: orders.length, orders });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ── Get Single Order ───────────────────────────────────────────────────────────
app.get('/api/orders/:orderId', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ order });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ── Get All Orders (admin) ─────────────────────────────────────────────────────
app.get('/api/orders', authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ placedAt: -1 })
            .populate('userId', 'firstName lastName email');
        res.json({ count: orders.length, orders });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ── Update Order Status (admin) ────────────────────────────────────────────────
app.put('/api/orders/:orderId/status', authMiddleware, async (req, res) => {
    try {
        const { status, trackingNumber } = req.body;
        const order = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            { status, trackingNumber: trackingNumber || '', updatedAt: new Date() },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order updated', order });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  CART (Persistent cart synced with MongoDB)
// ═══════════════════════════════════════════════════════════════════════════════

// ── Get Cart ───────────────────────────────────────────────────────────────────
app.get('/api/cart', authMiddleware, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) cart = { userId: req.user.id, userEmail: req.user.email, items: [] };
        res.json({ cart });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ── Save/Update Cart ───────────────────────────────────────────────────────────
app.put('/api/cart', authMiddleware, async (req, res) => {
    try {
        const { items } = req.body;
        const cart = await Cart.findOneAndUpdate(
            { userId: req.user.id },
            { userId: req.user.id, userEmail: req.user.email, items, updatedAt: new Date() },
            { upsert: true, new: true }
        );
        res.json({ message: 'Cart saved', cart });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ── Clear Cart ─────────────────────────────────────────────────────────────────
app.delete('/api/cart', authMiddleware, async (req, res) => {
    try {
        await Cart.findOneAndUpdate(
            { userId: req.user.id },
            { items: [], updatedAt: new Date() }
        );
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 Electshop API running on http://localhost:${PORT}`);
    console.log(`📦 Collections: user | orders | cart  —  Database: ecommerce`);
    console.log(`🔗 MongoDB Atlas: cluster0.46mletb.mongodb.net\n`);
});
