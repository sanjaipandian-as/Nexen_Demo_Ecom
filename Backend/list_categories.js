import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';

dotenv.config();

const listCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const categories = await Category.find({}).sort({ displayOrder: 1 });
        console.log(`📂 Total Categories: ${categories.length}\n`);

        categories.forEach((cat, index) => {
            console.log(`${index + 1}. ${cat.name}`);
            console.log(`   ID: ${cat._id}`);
            console.log(`   Active: ${cat.isActive}`);
            console.log('');
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

listCategories();
