import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'admin_sanjai' });
        if (existingAdmin) {
            console.log('⚠️  Admin already exists');
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('sanjai_admin_2026', 10);

        // Create admin
        const admin = new Admin({
            username: 'admin_sanjai',
            email: 'admin@demo-ecom.com',
            password: hashedPassword,
        });

        await admin.save();
        console.log('✅ Admin created successfully!');
        console.log('Username: admin_sanjai');
        console.log('Password: sanjai_admin_2026');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
