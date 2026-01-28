import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const createSpecificAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const username = 'Nexen_Media';
        const email = 'nexen_Media@gmail.com';
        const passwordPlain = 'Nexen_Media@2026';

        // Check if admin already exists by email or username
        const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
        if (existingAdmin) {
            console.log('⚠️  Admin already exists with this email or username.');
            console.log('Existing detals:', existingAdmin.email, existingAdmin.username);
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(passwordPlain, 10);

        // Create admin
        const admin = new Admin({
            username,
            email,
            password: hashedPassword,
        });

        await admin.save();
        console.log('✅ Admin created successfully!');
        console.log(`Username: ${username}`);
        console.log(`Email: ${email}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createSpecificAdmin();
