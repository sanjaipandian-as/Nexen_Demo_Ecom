import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

// Female Dress Products - 3 products per category
const femaleDressProducts = {
    "Sarees": [
        {
            name: "Elegant Silk Saree - Royal Blue",
            description: "Luxurious pure silk saree with intricate golden zari work. Perfect for weddings and festive occasions. Features traditional motifs and a rich pallu design.",
            brand: "Silk Heritage",
            pricing: {
                mrp: 8999,
                selling_price: 6499
            },
            stock: 45,
            images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800"],
            tags: ["saree", "silk", "wedding", "festive", "traditional"],
            is_featured: true,
            specifications: [
                { key: "Fabric", value: "Pure Silk" },
                { key: "Length", value: "6.3 meters" },
                { key: "Blouse Piece", value: "Included" },
                { key: "Occasion", value: "Wedding, Festive" },
                { key: "Care", value: "Dry Clean Only" }
            ]
        },
        {
            name: "Cotton Handloom Saree - Pastel Pink",
            description: "Soft and breathable cotton handloom saree with delicate border work. Ideal for daily wear and casual occasions. Comfortable all-day wear.",
            brand: "Handloom Treasures",
            pricing: {
                mrp: 2999,
                selling_price: 1999
            },
            stock: 80,
            images: ["https://images.unsplash.com/photo-1583391733981-5abe4e5dea0c?w=800"],
            tags: ["saree", "cotton", "handloom", "casual", "daily-wear"],
            is_featured: false,
            specifications: [
                { key: "Fabric", value: "Cotton" },
                { key: "Length", value: "5.5 meters" },
                { key: "Blouse Piece", value: "Included" },
                { key: "Occasion", value: "Casual, Daily Wear" },
                { key: "Care", value: "Machine Wash" }
            ]
        },
        {
            name: "Designer Georgette Saree - Emerald Green",
            description: "Contemporary georgette saree with modern prints and embellishments. Features sequin work and a stylish drape. Perfect for parties and evening events.",
            brand: "Modern Drapes",
            pricing: {
                mrp: 5499,
                selling_price: 3999
            },
            stock: 60,
            images: ["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800"],
            tags: ["saree", "georgette", "designer", "party", "embellished"],
            is_featured: true,
            specifications: [
                { key: "Fabric", value: "Georgette" },
                { key: "Length", value: "6 meters" },
                { key: "Blouse Piece", value: "Included" },
                { key: "Occasion", value: "Party, Evening" },
                { key: "Care", value: "Dry Clean Recommended" }
            ]
        }
    ],
    "Kurtis & Kurtas": [
        {
            name: "Floral Print A-Line Kurti - White",
            description: "Elegant A-line kurti with beautiful floral prints. Made from soft cotton blend fabric. Perfect for office wear and casual outings.",
            brand: "Ethnic Fusion",
            pricing: {
                mrp: 1499,
                selling_price: 999
            },
            stock: 120,
            images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800"],
            tags: ["kurti", "floral", "a-line", "casual", "cotton"],
            is_featured: true,
            specifications: [
                { key: "Fabric", value: "Cotton Blend" },
                { key: "Length", value: "42 inches" },
                { key: "Sleeve", value: "3/4 Sleeve" },
                { key: "Occasion", value: "Casual, Office" },
                { key: "Care", value: "Machine Wash" }
            ]
        },
        {
            name: "Embroidered Straight Kurta - Navy Blue",
            description: "Stylish straight kurta with intricate thread embroidery on the neckline and sleeves. Comfortable fit for all-day wear.",
            brand: "Desi Chic",
            pricing: {
                mrp: 1999,
                selling_price: 1499
            },
            stock: 95,
            images: ["https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?w=800"],
            tags: ["kurta", "embroidered", "straight", "ethnic", "festive"],
            is_featured: false,
            specifications: [
                { key: "Fabric", value: "Rayon" },
                { key: "Length", value: "44 inches" },
                { key: "Sleeve", value: "Full Sleeve" },
                { key: "Occasion", value: "Festive, Casual" },
                { key: "Care", value: "Hand Wash" }
            ]
        },
        {
            name: "Printed Anarkali Kurti - Multicolor",
            description: "Vibrant Anarkali style kurti with colorful prints. Flared silhouette for a graceful look. Ideal for festive occasions.",
            brand: "Royal Threads",
            pricing: {
                mrp: 2499,
                selling_price: 1799
            },
            stock: 70,
            images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800"],
            tags: ["kurti", "anarkali", "printed", "festive", "flared"],
            is_featured: true,
            specifications: [
                { key: "Fabric", value: "Georgette" },
                { key: "Length", value: "46 inches" },
                { key: "Sleeve", value: "3/4 Sleeve" },
                { key: "Occasion", value: "Festive, Party" },
                { key: "Care", value: "Dry Clean" }
            ]
        }
    ],
    "Lehenga & Party Wear": [
        {
            name: "Bridal Lehenga Choli - Maroon",
            description: "Stunning bridal lehenga choli with heavy embroidery and zari work. Includes lehenga, choli, and dupatta. Perfect for weddings.",
            brand: "Bridal Couture",
            pricing: {
                mrp: 25999,
                selling_price: 19999
            },
            stock: 25,
            images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"],
            tags: ["lehenga", "bridal", "wedding", "embroidered", "heavy-work"],
            is_featured: true,
            specifications: [
                { key: "Fabric", value: "Silk & Net" },
                { key: "Lehenga Length", value: "42 inches" },
                { key: "Set Includes", value: "Lehenga, Choli, Dupatta" },
                { key: "Occasion", value: "Wedding, Bridal" },
                { key: "Care", value: "Dry Clean Only" }
            ]
        },
        {
            name: "Festive Lehenga Choli - Pink & Gold",
            description: "Beautiful festive lehenga choli with sequin and mirror work. Lightweight and comfortable for long celebrations.",
            brand: "Festive Glamour",
            pricing: {
                mrp: 12999,
                selling_price: 8999
            },
            stock: 40,
            images: ["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800"],
            tags: ["lehenga", "festive", "sequin", "mirror-work", "celebration"],
            is_featured: true,
            specifications: [
                { key: "Fabric", value: "Georgette" },
                { key: "Lehenga Length", value: "40 inches" },
                { key: "Set Includes", value: "Lehenga, Choli, Dupatta" },
                { key: "Occasion", value: "Festive, Party" },
                { key: "Care", value: "Dry Clean" }
            ]
        },
        {
            name: "Contemporary Lehenga Choli - Teal Blue",
            description: "Modern lehenga choli with contemporary design and minimal embellishments. Perfect for sangeet and mehendi functions.",
            brand: "Modern Ethnic",
            pricing: {
                mrp: 8999,
                selling_price: 6499
            },
            stock: 55,
            images: ["https://images.unsplash.com/photo-1583391733981-5abe4e5dea0c?w=800"],
            tags: ["lehenga", "contemporary", "modern", "sangeet", "mehendi"],
            is_featured: false,
            specifications: [
                { key: "Fabric", value: "Crepe & Net" },
                { key: "Lehenga Length", value: "41 inches" },
                { key: "Set Includes", value: "Lehenga, Choli, Dupatta" },
                { key: "Occasion", value: "Sangeet, Mehendi" },
                { key: "Care", value: "Dry Clean" }
            ]
        }
    ],
    "Salwar & Suit Sets": [
        {
            name: "Cotton Salwar Suit Set - Yellow",
            description: "Comfortable cotton salwar suit with beautiful prints. Includes kurta, salwar, and dupatta. Perfect for daily wear.",
            brand: "Daily Comfort",
            pricing: {
                mrp: 2499,
                selling_price: 1699
            },
            stock: 100,
            images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800"],
            tags: ["salwar-suit", "cotton", "daily-wear", "printed", "comfortable"],
            is_featured: false,
            specifications: [
                { key: "Fabric", value: "Cotton" },
                { key: "Kurta Length", value: "42 inches" },
                { key: "Set Includes", value: "Kurta, Salwar, Dupatta" },
                { key: "Occasion", value: "Daily Wear, Casual" },
                { key: "Care", value: "Machine Wash" }
            ]
        },
        {
            name: "Embroidered Salwar Suit - Purple",
            description: "Elegant salwar suit with thread embroidery on kurta. Comes with matching salwar and chiffon dupatta.",
            brand: "Ethnic Elegance",
            pricing: {
                mrp: 3999,
                selling_price: 2999
            },
            stock: 75,
            images: ["https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?w=800"],
            tags: ["salwar-suit", "embroidered", "festive", "chiffon-dupatta"],
            is_featured: true,
            specifications: [
                { key: "Fabric", value: "Chanderi" },
                { key: "Kurta Length", value: "44 inches" },
                { key: "Set Includes", value: "Kurta, Salwar, Dupatta" },
                { key: "Occasion", value: "Festive, Party" },
                { key: "Care", value: "Dry Clean" }
            ]
        },
        {
            name: "Palazzo Suit Set - Mint Green",
            description: "Trendy palazzo suit with straight kurta and wide-leg palazzo pants. Modern and stylish ethnic wear.",
            brand: "Trendy Ethnic",
            pricing: {
                mrp: 2999,
                selling_price: 2199
            },
            stock: 85,
            images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800"],
            tags: ["salwar-suit", "palazzo", "trendy", "modern", "ethnic"],
            is_featured: true,
            specifications: [
                { key: "Fabric", value: "Rayon" },
                { key: "Kurta Length", value: "40 inches" },
                { key: "Set Includes", value: "Kurta, Palazzo, Dupatta" },
                { key: "Occasion", value: "Casual, Office" },
                { key: "Care", value: "Machine Wash" }
            ]
        }
    ],
    "Ethnic Gowns & Anarkalis": [
        {
            name: "Floor-Length Anarkali Gown - Red",
            description: "Majestic floor-length Anarkali gown with golden embroidery. Features a flared silhouette and elegant design.",
            brand: "Royal Anarkali",
            pricing: {
                mrp: 6999,
                selling_price: 4999
            },
            stock: 50,
            images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"],
            tags: ["anarkali", "gown", "floor-length", "embroidered", "festive"],
            is_featured: true,
            specifications: [
                { key: "Fabric", value: "Georgette" },
                { key: "Length", value: "56 inches" },
                { key: "Sleeve", value: "Full Sleeve" },
                { key: "Occasion", value: "Wedding, Festive" },
                { key: "Care", value: "Dry Clean" }
            ]
        },
        {
            name: "Indo-Western Gown - Black",
            description: "Contemporary Indo-Western gown with modern cuts and traditional embellishments. Perfect fusion wear.",
            brand: "Fusion Style",
            pricing: {
                mrp: 4999,
                selling_price: 3499
            },
            stock: 65,
            images: ["https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800"],
            tags: ["gown", "indo-western", "fusion", "modern", "party"],
            is_featured: true,
            specifications: [
                { key: "Fabric", value: "Crepe" },
                { key: "Length", value: "54 inches" },
                { key: "Sleeve", value: "Sleeveless" },
                { key: "Occasion", value: "Party, Cocktail" },
                { key: "Care", value: "Dry Clean" }
            ]
        },
        {
            name: "Jacket Style Anarkali - Peach",
            description: "Elegant jacket style Anarkali with detachable jacket. Versatile design for multiple styling options.",
            brand: "Style Studio",
            pricing: {
                mrp: 5499,
                selling_price: 3999
            },
            stock: 55,
            images: ["https://images.unsplash.com/photo-1583391733981-5abe4e5dea0c?w=800"],
            tags: ["anarkali", "jacket-style", "versatile", "ethnic", "designer"],
            is_featured: false,
            specifications: [
                { key: "Fabric", value: "Silk & Net" },
                { key: "Length", value: "52 inches" },
                { key: "Sleeve", value: "3/4 Sleeve" },
                { key: "Occasion", value: "Festive, Reception" },
                { key: "Care", value: "Dry Clean" }
            ]
        }
    ]
};

const seedFemaleDressProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Fetch all categories
        const categories = await Category.find({});
        console.log(`📂 Found ${categories.length} categories in database\n`);

        // Create a map of category names to IDs
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.name] = cat._id;
        });

        let totalProductsAdded = 0;
        let productsToInsert = [];

        // Process each category
        for (const [categoryName, products] of Object.entries(femaleDressProducts)) {
            if (!categoryMap[categoryName]) {
                console.log(`⚠️  Category "${categoryName}" not found in database. Skipping...`);
                continue;
            }

            console.log(`📦 Processing category: ${categoryName}`);

            for (const product of products) {
                // Check if product already exists
                const existingProduct = await Product.findOne({ name: product.name });

                if (existingProduct) {
                    console.log(`   ⏭️  Product "${product.name}" already exists. Skipping...`);
                    continue;
                }

                // Add category information
                const productData = {
                    ...product,
                    category: {
                        main: categoryName,
                        main_slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    }
                };

                productsToInsert.push(productData);
                console.log(`   ✅ Prepared: ${product.name}`);
            }
            console.log('');
        }

        if (productsToInsert.length > 0) {
            const insertedProducts = await Product.insertMany(productsToInsert);
            totalProductsAdded = insertedProducts.length;
            console.log(`\n🎉 Successfully added ${totalProductsAdded} female dress products!\n`);

            // Display summary by category
            console.log('📊 Summary by Category:');
            for (const [categoryName, products] of Object.entries(femaleDressProducts)) {
                const count = products.length;
                console.log(`   ${categoryName}: ${count} products`);
            }
        } else {
            console.log('ℹ️  No new products to add. All products already exist.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding products:', error.message);
        console.error(error);
        process.exit(1);
    }
};

seedFemaleDressProducts();
