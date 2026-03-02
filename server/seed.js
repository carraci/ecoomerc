require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI ||
    'mongodb+srv://adarshshukla4639_db_user:ovia1910@cluster0.46mletb.mongodb.net/ecommerce?retryWrites=true&w=majority';

// ─── Product Schema (matches frontend Product interface) ──────────────────────
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
    badge: { type: String, enum: ['new', 'hot', 'sale', null], default: null },
    inStock: { type: Boolean, default: true },
    description: { type: String, default: '' },
    features: [String]
}, { collection: 'products' });

const Product = mongoose.model('Product', productSchema);

// ─── Data Templates ─────────────────────────────────────────────────────────
const UNSPLASH = [
    '1610945264803-c22b62d2a7b3', '1592750475338-74b7b21085ab', '1517336714731-489689fd1ca8',
    '1603302576837-37561b2e2302', '1516035069371-29a1b244cc32', '1505740420928-5e560c06d30e',
    '1590658268037-6bf12165a8df', '1546868871-7041f2a55e12', '1544244015-0df4b3ffc6b0',
    '1606813907291-d86efa9b94db', '1593305841991-05c297ba4575', '1608043152269-423dbba4e7e1',
    '1473968512647-3e447244af8f', '1527443224154-c4a3942d3acf', '1611532736597-de2d4265fba3',
    '1622979135225-d2ba269cf1ac'
];
const img = (q) => `https://images.unsplash.com/photo-${q}?w=500&h=500&fit=crop`;

// ─── Categories with full config ─────────────────────────────────────────────
const CATEGORIES = {
    'Phones': {
        brands: ['Samsung', 'Apple', 'Google', 'OnePlus', 'Xiaomi', 'Motorola', 'Sony', 'Nokia', 'Oppo', 'Vivo', 'Realme', 'Honor', 'Huawei', 'LG', 'Asus'],
        lines: ['Galaxy', 'iPhone', 'Pixel', 'Nord', 'Redmi', 'Edge', 'Xperia', 'G-Series', 'Reno', 'V-Series', 'GT', 'Magic', 'Mate', 'K-Series', 'ROG Phone'],
        imgs: ['1610945264803-c22b62d2a7b3', '1592750475338-74b7b21085ab', '1611532736597-de2d4265fba3'],
        featurePool: ['6.7" AMOLED 120Hz Display', 'Snapdragon 8 Gen 3', '50MP Triple Camera', '5000mAh Battery', '5G Connectivity', 'Fast Charging', 'IP68 Rating', '12GB RAM', '256GB Storage', 'NFC Support', 'Wifi 6E', 'Bluetooth 5.3', 'Under-Display Fingerprint', 'LTPO Display', 'Satellite Connectivity'],
        priceMin: 149, priceMax: 1999
    },
    'Laptops': {
        brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Microsoft', 'Razer', 'MSI', 'Acer', 'Samsung', 'LG', 'Toshiba', 'Sony', 'Huawei', 'Framework'],
        lines: ['MacBook', 'XPS', 'Spectre', 'ThinkPad', 'ROG', 'Surface', 'Blade', 'Titan', 'Nitro', 'Galaxy Book', 'Gram', 'Portege', 'VAIO', 'MateBook', 'Laptop 13'],
        imgs: ['1517336714731-489689fd1ca8', '1603302576837-37561b2e2302', '1527443224154-c4a3942d3acf'],
        featurePool: ['M3 Pro Chip', 'Intel Core i9', 'RTX 4080 16GB', '32GB DDR5 RAM', '2TB NVMe SSD', '4K OLED Display', '18hr Battery', 'Thunderbolt 4', 'WiFi 6E', 'Backlit Keyboard', 'Fingerprint Reader', 'IR Face Login', '120Hz Refresh', 'Slim Design', 'Military Grade'],
        priceMin: 399, priceMax: 4999
    },
    'Cameras': {
        brands: ['Canon', 'Sony', 'Nikon', 'Fujifilm', 'Panasonic', 'Leica', 'Olympus', 'Pentax', 'Sigma', 'GoPro', 'DJI', 'Insta360', 'Polaroid', 'Hasselblad', 'Phase One'],
        lines: ['EOS', 'Alpha', 'Z-Series', 'X-Series', 'Lumix', 'M-System', 'OM-D', 'K-Series', 'FP', 'HERO', 'Mini', 'X3', 'Now+', 'X2D', 'XF IQ'],
        imgs: ['1516035069371-29a1b244cc32', '1473968512647-3e447244af8f'],
        featurePool: ['45MP Full-Frame Sensor', '8K RAW Video', '120fps 4K Shooting', '5-Axis IBIS', 'Real-Time Eye AF', 'Dual CFexpress Slots', 'Weather Sealed', 'Tilting Touchscreen', '360° Recording', 'Built-in ND Filter', 'Log Profiles', '10-Stop HDR', 'In-Body Flash', 'Remote Control App', 'AI Subject Detection'],
        priceMin: 99, priceMax: 6999
    },
    'Headphones': {
        brands: ['Sony', 'Apple', 'Bose', 'Sennheiser', 'JBL', 'Jabra', 'Samsung', 'Beats', 'Bang & Olufsen', 'AKG', 'Audio-Technica', 'Beyerdynamic', 'Philips', 'Anker', '1MORE'],
        lines: ['WH-1000XM', 'AirPods', 'QuietComfort', 'Momentum', 'Tour', 'Elite', 'Galaxy Buds', 'Studio', 'Beoplay', 'N-Series', 'ATH', 'DT', 'Fidelio', 'Soundcore', 'Evo'],
        imgs: ['1505740420928-5e560c06d30e', '1590658268037-6bf12165a8df'],
        featurePool: ['Active Noise Cancellation', '30hr Battery Life', 'LDAC Hi-Res Audio', 'Multipoint Connect', 'Transparency Mode', 'Personalized EQ', 'Spatial Audio', '8-Mic System', 'IPX5 Waterproof', 'Quick Charge', 'Wear Detection', 'Voice Assistant', 'Low Latency Gaming', 'Wireless Charging Case', 'HD Voice Calls'],
        priceMin: 29, priceMax: 699
    },
    'Smart Devices': {
        brands: ['Apple', 'Samsung', 'Garmin', 'Fitbit', 'Google', 'Amazon', 'Meta', 'Xiaomi', 'Huawei', 'Withings', 'Amazfit', 'Oura', 'Polar', 'Philips', 'Ring'],
        lines: ['Apple Watch', 'Galaxy Watch', 'Forerunner', 'Sense', 'Nest', 'Echo', 'Quest', 'Band', 'Watch GT', 'ScanWatch', 'GTR', 'Ring', 'Vantage', 'Hue', 'Video Doorbell'],
        imgs: ['1546868871-7041f2a55e12', '1544244015-0df4b3ffc6b0', '1622979135225-d2ba269cf1ac'],
        featurePool: ['Health Monitoring', 'GPS Navigation', '7-Day Battery', 'ECG Sensor', 'Blood Oxygen Monitor', 'Sleep Tracking', 'Crash Detection', 'NFC Payments', 'Always-On Display', 'Smart Home Control', 'Voice Assistant', 'IP68 Waterproof', 'Auto Workout Detection', 'Stress Monitoring', 'Menstrual Tracking'],
        priceMin: 29, priceMax: 1299
    },
    'Gaming': {
        brands: ['Sony', 'Microsoft', 'Nintendo', 'ASUS', 'Razer', 'SteelSeries', 'Corsair', 'Logitech', 'HyperX', 'Elgato', 'Alienware', 'MSI', 'BenQ', 'Astro', 'Turtle Beach'],
        lines: ['PlayStation', 'Xbox', 'Switch', 'ROG', 'DeathAdder', 'Arctis', 'K-Series', 'G-Pro', 'Cloud', 'Stream Deck', 'Aurora', 'Titan', 'ZOWIE', 'A-Series', 'Stealth'],
        imgs: ['1606813907291-d86efa9b94db', '1527443224154-c4a3942d3acf'],
        featurePool: ['120fps 4K Gaming', 'Ray Tracing', 'G-Sync Compatible', 'Mechanical Switches', 'Ultra-Light Design', 'RGB Lighting', 'Programmable Keys', 'Low Latency Wireless', 'Surround Sound', 'HD Streaming', 'High Refresh Display', 'Custom Drivers', 'Hot-Swap Battery', 'Quick Resume', 'Cross-Platform Play'],
        priceMin: 29, priceMax: 4999
    },
    'TV & Speaker': {
        brands: ['LG', 'Samsung', 'Sony', 'Philips', 'TCL', 'Hisense', 'Vizio', 'Panasonic', 'Sonos', 'Bose', 'JBL', 'Bang & Olufsen', 'Klipsch', 'Denon', 'Yamaha'],
        lines: ['OLED', 'Neo QLED', 'Bravia', 'The One', 'QLED', 'U-Series', 'P-Series', 'OLED65', 'Arc', 'Home Speaker', 'Boombox', 'Beosound', 'Reference', 'HEOS', 'MusicCast'],
        imgs: ['1593305841991-05c297ba4575', '1608043152269-423dbba4e7e1'],
        featurePool: ['4K OLED Display', '120Hz Refresh Rate', 'Dolby Atmos Sound', 'HDMI 2.1', 'Smart TV OS', 'Voice Remote', 'Game Mode', 'HDR10+ Support', 'WiFi 6', 'Bluetooth 5.0', 'AirPlay 2', 'Google Cast', 'Alexa Built-In', 'Auto Calibration', 'Multi-Room Audio'],
        priceMin: 89, priceMax: 6999
    },
    'Chargers': {
        brands: ['Anker', 'Apple', 'Samsung', 'Belkin', 'Mophie', 'UGREEN', 'Baseus', 'Spigen', 'Jackery', 'RAVPower', 'ESR', 'Aukey', 'Nekteck', 'Choetech', 'ZMI'],
        lines: ['PowerCore', 'MagSafe Adapter', 'Super Fast', 'Boost Charge', 'Snap+', 'Nexode', 'Bipow', 'ArcStation', 'Explorer', 'PD Pioneer', 'HaloLock', 'PA-Series', 'G-Power', 'T-Series', 'QB-Series'],
        imgs: ['1546868871-7041f2a55e12'],
        featurePool: ['65W GaN Technology', 'MagSafe 15W', 'USB-C PD 3.1', '3-Port Output', 'Solar Compatible', 'Foldable Plug', 'Universal Voltage', 'LED Indicator', 'Safety Protection', 'Compact Design', 'Fast Charge 5.0', '10000mAh Capacity', 'Pass-Through Charging', 'Wall-Mount Design', 'UL Certified'],
        priceMin: 9, priceMax: 1299
    }
};

const ADJECTIVES = [
    'Pro', 'Ultra', 'Max', 'Elite', 'Prime', 'Plus', 'Advanced', 'Premium', 'Lite', 'Neo',
    'Slim', 'Mini', 'Air', 'Edge', 'Turbo', 'Super', 'Mega', 'Hyper', 'Nano', 'Smart',
    'Essential', 'Classic', 'Studio', 'Creator', 'Business', 'Gaming', 'Sport', 'Active', 'Home', 'Office'
];

const SUFFIXES = [
    '5G', 'WiFi', 'LTE', '4K', '8K', 'HDR', 'RGB', 'ANC', 'TWS', 'OLED',
    'QLED', 'M2', 'M3', 'Gen 2', 'Gen 3', 'V2', 'EE', 'Special Edition', 'Bundle', 'Kit'
];

const badgePicker = (idx) => {
    const r = idx % 7;
    if (r === 0) return 'hot';
    if (r === 1 || r === 2) return 'sale';
    if (r === 3) return 'new';
    return null;
};

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);

// ─── Generate 5000 products ──────────────────────────────────────────────────
function generateProducts() {
    const products = [];
    const categoryNames = Object.keys(CATEGORIES);
    const perCat = Math.ceil(5000 / categoryNames.length); // ~625 each

    let idCounter = 1;

    for (const catName of categoryNames) {
        const cfg = CATEGORIES[catName];

        for (let i = 0; i < perCat && products.length < 5000; i++) {
            const brand = pick(cfg.brands);
            const line = pick(cfg.lines);
            const adj = pick(ADJECTIVES);
            const suffix = Math.random() > 0.5 ? (' ' + pick(SUFFIXES)) : '';
            const variant = rand(64, 512);
            const gen = rand(1, 5);

            // Build a unique product name
            const nameStyles = [
                `${brand} ${line} ${adj}${suffix}`,
                `${brand} ${line} ${gen} ${adj}${suffix}`,
                `${brand} ${line} ${variant}GB ${adj}`,
                `${brand} ${line} ${adj} ${variant}W${suffix}`,
                `${brand} ${line} ${adj} Series ${gen}`,
            ];
            const name = pick(nameStyles);

            const priceBase = rand(cfg.priceMin, cfg.priceMax);
            const discountPct = pick([0, 0, 5, 8, 10, 12, 15, 18, 20, 22, 25, 30, 40, 50]);
            const oldPrice = discountPct > 0 ? Math.round(priceBase / (1 - discountPct / 100)) : priceBase;
            const rating = parseFloat((rand(30, 50) / 10).toFixed(1));
            const reviews = rand(5, 9999);
            const imgKey = pick(cfg.imgs);
            const features = pickN(cfg.featurePool, rand(4, 8));

            products.push({
                id: idCounter++,
                name,
                brand,
                price: priceBase,
                oldPrice,
                discount: discountPct,
                rating,
                reviews,
                image: img(imgKey),
                category: catName,
                badge: badgePicker(idCounter),
                inStock: Math.random() > 0.05,   // 95% in stock
                description: `${brand} ${line} with advanced ${catName.toLowerCase()} features. Designed for performance and reliability with ${features[0].toLowerCase()} and ${features[1] ? features[1].toLowerCase() : 'premium build quality'}.`,
                features
            });
        }
    }

    return products;
}

// ─── Main seed function ──────────────────────────────────────────────────────
async function seed() {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to ecommerce database');

    console.log('🗑️  Clearing existing products collection...');
    await Product.deleteMany({});
    console.log('✅ Old products cleared');

    console.log('🏭 Generating 5,000 products...');
    const products = generateProducts();
    console.log(`✅ Generated ${products.length} products`);

    console.log('📤 Inserting into MongoDB Atlas in batches...');
    const BATCH_SIZE = 500;
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const batch = products.slice(i, i + BATCH_SIZE);
        await Product.insertMany(batch, { ordered: false });
        console.log(`   ✅ Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(products.length / BATCH_SIZE)} (${Math.min(i + BATCH_SIZE, products.length)} / ${products.length})`);
    }

    const total = await Product.countDocuments();
    console.log(`\n🎉 Done! Total products in Atlas: ${total}`);

    // Show category breakdown
    const cats = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
    console.log('\n📊 Category Breakdown:');
    cats.forEach(c => console.log(`   ${c._id.padEnd(20)} — ${c.count} products`));

    await mongoose.disconnect();
    console.log('\n✅ Disconnected. Seed complete!');
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
