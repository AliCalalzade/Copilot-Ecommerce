const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// View engine ayarları (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware'ler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session ayarları
app.use(
    session({
        secret: 'supersecretkey', // Gerçek projelerde güçlü bir secret kullanın!
        resave: false,
        saveUninitialized: false,
    })
);

// Örnek Ürün Listesi
const products = [
    {
        id: 1,
        name: 'Ürün 1',
        price: 100,
        description: 'Bu ürün 1 açıklaması',
        image: 'https://picsum.photos/500/500?random=1',
    },
    {
        id: 2,
        name: 'Ürün 2',
        price: 200,
        description: 'Bu ürün 2 açıklaması',
        image: 'https://picsum.photos/500/500?random=2',
    },
    {
        id: 3,
        name: 'Ürün 3',
        price: 300,
        description: 'Bu ürün 3 açıklaması',
        image: 'https://picsum.photos/500/500?random=3',
    },
];


// Ana sayfa: Ürünlerin listelendiği sayfa
app.get('/', (req, res) => {
    res.render('index', { products });
});

// Ürünü sepete ekleme
app.get('/add_to_cart/:id', (req, res) => {
    const productId = req.params.id;
    const product = products.find((p) => p.id === parseInt(productId));
    if (!product) {
        return res.status(404).send('Ürün bulunamadı');
    }

    if (!req.session.cart) {
        req.session.cart = {};
    }

    if (req.session.cart[productId]) {
        req.session.cart[productId] += 1;
    } else {
        req.session.cart[productId] = 1;
    }

    res.redirect('/');
});

// Sepet sayfası: Sepet detaylarının görüntülendiği sayfa
app.get('/cart', (req, res) => {
    const cart = req.session.cart || {};
    const cartDetails = [];
    let total = 0;

    for (const productId in cart) {
        const quantity = cart[productId];
        const product = products.find((p) => p.id === parseInt(productId));
        if (product) {
            const productTotal = product.price * quantity;
            total += productTotal;
            cartDetails.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity,
                total: productTotal,
                image: product.image,
            });
        }
    }

    res.render('cart', { cartDetails, total });
});

// --- Sepette Ürün Miktarını Artır, Azalt ve Silme İşlemleri ---

// Ürün miktarını artırma
app.get('/cart/increase/:id', (req, res) => {
    const productId = req.params.id;
    if (!req.session.cart) {
        req.session.cart = {};
    }
    if (req.session.cart[productId]) {
        req.session.cart[productId] += 1;
    } else {
        req.session.cart[productId] = 1;
    }
    res.redirect('/cart');
});

// Ürün miktarını azaltma
app.get('/cart/decrease/:id', (req, res) => {
    const productId = req.params.id;
    if (req.session.cart && req.session.cart[productId]) {
        req.session.cart[productId] -= 1;
        if (req.session.cart[productId] < 1) {
            delete req.session.cart[productId];
        }
    }
    res.redirect('/cart');
});

// Ürünü tamamen sepetten kaldırma
app.get('/cart/remove/:id', (req, res) => {
    const productId = req.params.id;
    if (req.session.cart && req.session.cart[productId]) {
        delete req.session.cart[productId];
    }
    res.redirect('/cart');
});

// Checkout - Sipariş formu sayfası (GET)
app.get('/checkout', (req, res) => {
    res.render('checkout');
});

// Checkout - Sipariş işlemi (POST)
app.post('/checkout', (req, res) => {
    const { name, address } = req.body;
    // Gerçek projelerde sipariş veritabanı Kaydı, ödeme entegrasyonu vb. yapılır.
    req.session.cart = {}; // İşlem sonrası sepeti temizle
    res.send(`Teşekkürler ${name}, siparişiniz hazırlanıyor!`);
});

// Sunucuyu başlatma
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server çalışıyor: http://localhost:${PORT}`);
});
