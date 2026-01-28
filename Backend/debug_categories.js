import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const debugProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Get all unique category names
        const allCategories = await Product.distinct('category.main');

        console.log('All categories in database:');
        allCategories.forEach(cat => {
            console.log(`- "${cat}"`);
        });

        console.log('\n---\n');

        // Count products by category
        for (const cat of allCategories) {
            const count = await Product.countDocuments({ 'category.main': cat });
            console.log(`${cat}: ${count}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

debugProducts();
