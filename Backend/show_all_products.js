import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const showAllProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const categories = [
            "Sarees",
            "Kurtis & Kurtas",
            "Lehenga & Party Wear",
            "Salwar & Suit Sets",
            "Ethnic Gowns & Anarkalis"
        ];

        console.log('\n========================================');
        console.log('   FEMALE DRESS PRODUCTS DATABASE');
        console.log('========================================\n');

        let totalCount = 0;

        for (const cat of categories) {
            const products = await Product.find({
                'category.main': cat,
                is_deleted: false
            }).sort({ name: 1 });

            console.log(`\n${cat.toUpperCase()}`);
            console.log('-'.repeat(40));

            products.forEach((p, i) => {
                console.log(`${i + 1}. ${p.name}`);
                console.log(`   Brand: ${p.brand}`);
                console.log(`   Price: Rs.${p.pricing.selling_price} (MRP: Rs.${p.pricing.mrp})`);
                console.log(`   Stock: ${p.stock} units`);
                console.log('');
            });

            console.log(`Subtotal: ${products.length} products\n`);
            totalCount += products.length;
        }

        console.log('========================================');
        console.log(`TOTAL: ${totalCount} products`);
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

showAllProducts();
