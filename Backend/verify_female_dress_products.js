import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const verifyFemaleDressProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const femaleDressCategories = [
            "Sarees",
            "Kurtis & Kurtas",
            "Lehenga Cholis",
            "Salwar Suits",
            "Ethnic Gowns & Anarkalis"
        ];

        console.log('🎀 FEMALE DRESS PRODUCTS VERIFICATION\n');
        console.log('='.repeat(80));

        let totalProducts = 0;

        for (const category of femaleDressCategories) {
            const products = await Product.find({
                'category.main': category,
                is_deleted: false
            }).sort({ name: 1 });

            console.log(`\n📂 ${category.toUpperCase()}`);
            console.log('-'.repeat(80));

            if (products.length === 0) {
                console.log('   ⚠️  No products found');
            } else {
                products.forEach((product, index) => {
                    console.log(`\n   ${index + 1}. ${product.name}`);
                    console.log(`      Brand: ${product.brand}`);
                    console.log(`      Price: ₹${product.pricing.selling_price} (MRP: ₹${product.pricing.mrp})`);
                    console.log(`      Discount: ${product.pricing.discount_percentage}%`);
                    console.log(`      Stock: ${product.stock} units`);
                    console.log(`      Featured: ${product.is_featured ? '⭐ Yes' : 'No'}`);
                });
                console.log(`\n   Total: ${products.length} products`);
                totalProducts += products.length;
            }
        }

        console.log('\n' + '='.repeat(80));
        console.log(`\n🎉 TOTAL FEMALE DRESS PRODUCTS: ${totalProducts}`);
        console.log(`📊 Expected: ${femaleDressCategories.length * 3} (3 products per category)`);

        if (totalProducts === femaleDressCategories.length * 3) {
            console.log('✅ All products seeded successfully!\n');
        } else {
            console.log('⚠️  Some products may be missing.\n');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

verifyFemaleDressProducts();
