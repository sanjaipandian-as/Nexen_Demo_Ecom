import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

const sampleProducts = [
    {
        name: "Hydrating Face Moisturizer",
        description: "Deep hydration cream with hyaluronic acid for all skin types. Provides 24-hour moisture and improves skin texture.",
        brand: "GlowUp",
        category: {
            main: "Face Care",
            main_slug: "face-care",
            sub: "Moisturizers",
            sub_slug: "moisturizers"
        },
        pricing: {
            mrp: 1299,
            selling_price: 899,
            discount_percentage: 31
        },
        stock: 150,
        images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400"],
        tags: ["hydrating", "hyaluronic-acid", "moisturizer"],
        is_featured: true,
        specifications: [
            { key: "Volume", value: "50ml" },
            { key: "Skin Type", value: "All Types" },
            { key: "SPF", value: "No" }
        ]
    },
    {
        name: "Vitamin C Serum",
        description: "Brightening serum with 20% Vitamin C to reduce dark spots and improve skin radiance.",
        brand: "RadiantSkin",
        category: {
            main: "Face Care",
            main_slug: "face-care",
            sub: "Serums",
            sub_slug: "serums"
        },
        pricing: {
            mrp: 1999,
            selling_price: 1499,
            discount_percentage: 25
        },
        stock: 200,
        images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400"],
        tags: ["vitamin-c", "brightening", "serum"],
        is_featured: true,
        specifications: [
            { key: "Volume", value: "30ml" },
            { key: "Concentration", value: "20%" },
            { key: "Skin Type", value: "All Types" }
        ]
    },
    {
        name: "Nourishing Body Lotion",
        description: "Rich body lotion with shea butter and vitamin E for soft, smooth skin.",
        brand: "SilkTouch",
        category: {
            main: "Body Care",
            main_slug: "body-care",
            sub: "Lotions",
            sub_slug: "lotions"
        },
        pricing: {
            mrp: 799,
            selling_price: 599,
            discount_percentage: 25
        },
        stock: 300,
        images: ["https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400"],
        tags: ["body-lotion", "shea-butter", "moisturizing"],
        is_featured: false,
        specifications: [
            { key: "Volume", value: "200ml" },
            { key: "Fragrance", value: "Vanilla" },
            { key: "Skin Type", value: "Dry Skin" }
        ]
    },
    {
        name: "Anti-Aging Night Cream",
        description: "Advanced night cream with retinol to reduce fine lines and wrinkles while you sleep.",
        brand: "YouthRevive",
        category: {
            main: "Face Care",
            main_slug: "face-care",
            sub: "Night Creams",
            sub_slug: "night-creams"
        },
        pricing: {
            mrp: 2499,
            selling_price: 1799,
            discount_percentage: 28
        },
        stock: 100,
        images: ["https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400"],
        tags: ["anti-aging", "retinol", "night-cream"],
        is_featured: true,
        specifications: [
            { key: "Volume", value: "50ml" },
            { key: "Active Ingredient", value: "Retinol 0.5%" },
            { key: "Skin Type", value: "Mature Skin" }
        ]
    },
    {
        name: "Argan Oil Hair Serum",
        description: "Lightweight hair serum with pure argan oil for shine and frizz control.",
        brand: "HairLuxe",
        category: {
            main: "Hair Care",
            main_slug: "hair-care",
            sub: "Serums",
            sub_slug: "serums"
        },
        pricing: {
            mrp: 1499,
            selling_price: 999,
            discount_percentage: 33
        },
        stock: 180,
        images: ["https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400"],
        tags: ["argan-oil", "hair-serum", "frizz-control"],
        is_featured: false,
        specifications: [
            { key: "Volume", value: "100ml" },
            { key: "Hair Type", value: "All Types" },
            { key: "Fragrance", value: "Light Floral" }
        ]
    },
    {
        name: "Gentle Foaming Cleanser",
        description: "pH-balanced foaming cleanser that removes makeup and impurities without stripping skin.",
        brand: "PureClean",
        category: {
            main: "Face Care",
            main_slug: "face-care",
            sub: "Cleansers",
            sub_slug: "cleansers"
        },
        pricing: {
            mrp: 899,
            selling_price: 649,
            discount_percentage: 28
        },
        stock: 250,
        images: ["https://images.unsplash.com/photo-1556228852-80c3b5e37b48?w=400"],
        tags: ["cleanser", "gentle", "foaming"],
        is_featured: false,
        specifications: [
            { key: "Volume", value: "150ml" },
            { key: "pH Level", value: "5.5" },
            { key: "Skin Type", value: "Sensitive Skin" }
        ]
    },
    {
        name: "Exfoliating Body Scrub",
        description: "Natural coffee and coconut oil scrub for smooth, glowing skin.",
        brand: "NatureGlow",
        category: {
            main: "Body Care",
            main_slug: "body-care",
            sub: "Scrubs",
            sub_slug: "scrubs"
        },
        pricing: {
            mrp: 699,
            selling_price: 499,
            discount_percentage: 29
        },
        stock: 220,
        images: ["https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400"],
        tags: ["body-scrub", "exfoliating", "coffee"],
        is_featured: false,
        specifications: [
            { key: "Volume", value: "250g" },
            { key: "Main Ingredient", value: "Coffee Grounds" },
            { key: "Fragrance", value: "Coffee & Coconut" }
        ]
    },
    {
        name: "Repair Hair Mask",
        description: "Intensive repair mask with keratin and proteins for damaged hair.",
        brand: "HairRevive",
        category: {
            main: "Hair Care",
            main_slug: "hair-care",
            sub: "Masks",
            sub_slug: "masks"
        },
        pricing: {
            mrp: 1299,
            selling_price: 899,
            discount_percentage: 31
        },
        stock: 150,
        images: ["https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400"],
        tags: ["hair-mask", "repair", "keratin"],
        is_featured: true,
        specifications: [
            { key: "Volume", value: "200ml" },
            { key: "Hair Type", value: "Damaged Hair" },
            { key: "Treatment Time", value: "15-20 minutes" }
        ]
    }
];

async function seedProducts() {
    try {
        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');

        // Insert sample products
        const products = await Product.insertMany(sampleProducts);
        console.log(`✅ Successfully added ${products.length} products`);

        // Display added products
        products.forEach(product => {
            console.log(`   - ${product.name} (${product.category.main}) - ₹${product.pricing.selling_price}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error);
        process.exit(1);
    }
}

seedProducts();
