import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';

dotenv.config();

const seedOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Get some products and a customer
        const products = await Product.find({ is_deleted: false }).limit(5);
        const customer = await Customer.findOne();

        if (!products.length) {
            console.log('No products found. Please seed products first.');
            process.exit(1);
        }

        if (!customer) {
            console.log('No customers found. Please create a customer account first.');
            process.exit(1);
        }

        // Clear existing orders (optional)
        // await Order.deleteMany({});
        // console.log('Cleared existing orders');

        // Create sample orders over the last 30 days
        const orders = [];
        const today = new Date();

        for (let i = 0; i < 20; i++) {
            // Random date within last 30 days
            const daysAgo = Math.floor(Math.random() * 30);
            const orderDate = new Date(today);
            orderDate.setDate(orderDate.getDate() - daysAgo);

            // Random number of items (1-3)
            const numItems = Math.floor(Math.random() * 3) + 1;
            const orderItems = [];
            let totalAmount = 0;

            for (let j = 0; j < numItems; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                const price = product.pricing?.selling_price || 1000;

                orderItems.push({
                    productId: product._id,
                    quantity: quantity,
                    price: price
                });

                totalAmount += price * quantity;
            }

            // Random status
            const statuses = ['paid', 'shipped', 'delivered'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            orders.push({
                customerId: customer._id,
                items: orderItems,
                totalAmount: totalAmount,
                status: status,
                paymentStatus: 'success',
                shippingAddress: {
                    street: '123 Fashion Street',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zipCode: '400001',
                    country: 'India',
                    mobile: '9876543210'
                },
                createdAt: orderDate,
                updatedAt: orderDate
            });
        }

        // Insert orders
        await Order.insertMany(orders);
        console.log(`✅ Successfully created ${orders.length} sample orders`);

        // Show summary
        const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        console.log(`💰 Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`);
        console.log(`📦 Total Orders: ${orders.length}`);
        console.log(`📊 Average Order Value: ₹${Math.round(totalRevenue / orders.length).toLocaleString('en-IN')}`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding orders:', error);
        process.exit(1);
    }
};

seedOrders();
