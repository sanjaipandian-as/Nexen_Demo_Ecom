import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";

export const getAdminDashboard = async (req, res) => {
  try {
    // Overall order count
    const orders = await Order.find();

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === "delivered").length;

    // Count customers and products
    const totalCustomers = await Customer.countDocuments();
    const totalProducts = await Product.countDocuments({ is_deleted: false });

    // Total sales amount (sum of all paid orders)
    const totalSales = orders
      .filter(o => o.paymentStatus === "success")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({
      totalOrders,
      deliveredOrders,
      totalSales,
      totalSellers: 0, // No sellers in new system
      totalCustomers,
      totalProducts
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDailySales = async (req, res) => {
  try {
    const orders = await Order.find({
      paymentStatus: "success"
    });

    let daily = {};

    orders.forEach(order => {
      const day = order.createdAt.toISOString().split("T")[0];
      daily[day] = (daily[day] || 0) + order.totalAmount;
    });

    res.json(daily);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};