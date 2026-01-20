
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';

dotenv.config();

const checkOrder = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // Find the latest cancelled order
        const cancelledOrder = await Order.findOne({ status: 'cancelled' }).sort({ updatedAt: -1 });

        if (!cancelledOrder) {
            console.log('No cancelled orders found.');
        } else {
            console.log('Latest Cancelled Order:');
            console.log('ID:', cancelledOrder._id);
            console.log('Status:', cancelledOrder.status);
            console.log('PaymentStatus:', cancelledOrder.paymentStatus);
            console.log('TotalAmount:', cancelledOrder.totalAmount);
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkOrder();
