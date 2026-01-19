import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './models/Category.js';

dotenv.config();

const beautyCategories = [
    { name: "Skin Care", icon: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800" },
    { name: "Hair Care", icon: "https://images.unsplash.com/photo-1527799822344-42b886001042?auto=format&fit=crop&q=80&w=800" },
    { name: "Makeup", icon: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800" },
    { name: "Fragrance", icon: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800" },
    { name: "Body Care", icon: "https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&q=80&w=800" },
    { name: "Natural & Organic", icon: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800" }
];

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing categories if any (safety check)
        // await Category.deleteMany({});

        for (const cat of beautyCategories) {
            const existing = await Category.findOne({ name: cat.name });
            if (!existing) {
                await Category.create(cat);
                console.log(`Created category: ${cat.name}`);
            } else {
                console.log(`Category exists: ${cat.name}`);
                // Update with icon if missing
                if (!existing.icon && cat.icon) {
                    existing.icon = cat.icon;
                }
                // Ensure it's active
                existing.isActive = true;
                await existing.save();
            }
        }

        console.log('Seeding complete');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
};

seedCategories();
