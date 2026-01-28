import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const checkProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const categories = [
            "Sarees",
            "Kurtis & Kurtas",
            "Lehenga & Party Wear",
            "Salwar & Suit Sets",
            "Ethnic Gowns & Anarkalis"
        ];

        console.log('Female Dress Products Summary:\n');

        for (const cat of categories) {
            const count = await Product.countDocuments({
                'category.main': cat,
                is_deleted: false
            });
            console.log(`${cat}: ${count} products`);
        }

        const total = await Product.countDocuments({
            'category.main': { $in: categories },
            is_deleted: false
        });

        console.log(`\nTotal: ${total} products`);
        console.log(`Expected: 15 products (3 per category)`);
        console.log(total === 15 ? '\nSuccess!' : '\nWarning: Count mismatch');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

checkProducts();
