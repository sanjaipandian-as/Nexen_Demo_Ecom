// Helper to get date boundaries consistently
const getDates = (days) => {
  const limit = days === 'today' ? 1 : (parseInt(days) || 30);
  const now = new Date();

  const pastDate = new Date();
  if (limit === 1) {
    pastDate.setHours(0, 0, 0, 0);
  } else {
    pastDate.setDate(now.getDate() - limit);
  }

  const olderDate = new Date(pastDate);
  if (limit === 1) {
    olderDate.setDate(olderDate.getDate() - 1);
  } else {
    olderDate.setDate(olderDate.getDate() - limit);
  }

  return { pastDate, olderDate, limit };
};

import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Product from "../models/Product.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const { days } = req.query;
    const { pastDate, olderDate } = getDates(days);

    // Fetch all data for filtering
    const allOrders = await Order.find();
    const allCustomers = await Customer.find();
    const allProducts = await Product.find({ is_deleted: false });

    // Current period metrics
    const currentOrders = allOrders.filter(o => new Date(o.createdAt) >= pastDate);
    const currentCustomers = allCustomers.filter(c => new Date(c.createdAt) >= pastDate);
    const currentProducts = allProducts.filter(p => new Date(p.createdAt) >= pastDate);

    // Filter to only count successful payments for consistency with Finance page
    const successfulOrders = currentOrders.filter(o => o.paymentStatus === "success");

    const totalOrdersCount = successfulOrders.length;
    const totalCustomersCount = currentCustomers.length;
    const totalProductsCount = currentProducts.filter(p => new Date(p.createdAt) >= pastDate).length; // Products created in period

    const totalSales = successfulOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const deliveredOrders = successfulOrders.filter(o => o.status === "delivered").length;

    // Previous period metrics for growth
    const previousOrders = allOrders.filter(o => new Date(o.createdAt) >= olderDate && new Date(o.createdAt) < pastDate && o.paymentStatus === "success");
    const previousCustomers = allCustomers.filter(c => new Date(c.createdAt) >= olderDate && new Date(c.createdAt) < pastDate);

    const previousSales = previousOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Growth Math
    const calcGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    res.json({
      totalOrders: totalOrdersCount,
      deliveredOrders,
      totalSales,
      totalCustomers: totalCustomersCount,
      totalProducts: await Product.countDocuments({ is_deleted: false }), // Overall platform scale
      revenueGrowth: Number(calcGrowth(totalSales, previousSales).toFixed(1)),
      orderGrowth: Number(calcGrowth(totalOrdersCount, previousOrders.length).toFixed(1)),
      customerGrowth: Number(calcGrowth(currentCustomers.length, previousCustomers.length).toFixed(1))
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDailySales = async (req, res) => {
  try {
    const { days } = req.query;
    const { pastDate } = getDates(days);

    const orders = await Order.find({
      paymentStatus: "success",
      createdAt: { $gte: pastDate }
    });

    let dailyMap = {};
    orders.forEach(order => {
      const day = order.createdAt.toISOString().split("T")[0];
      if (!dailyMap[day]) {
        dailyMap[day] = { sales: 0, orders: 0, rawDate: day };
      }
      dailyMap[day].sales += order.totalAmount;
      dailyMap[day].orders += 1;
    });

    const sortedDays = Object.keys(dailyMap).sort();

    const chartData = sortedDays.map(day => {
      const dateDate = new Date(day);
      const formattedDate = dateDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      return {
        date: formattedDate,
        sales: dailyMap[day].sales,
        orders: dailyMap[day].orders
      };
    });

    res.json(chartData);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCategoryDistribution = async (req, res) => {
  try {
    // Only active products
    const { days } = req.query;
    const { pastDate } = getDates(days);

    // For more accurate tracking, instead of just returning available product categories,
    // let's tally categories from actual sales if `days` is provided
    const orders = await Order.find({
      paymentStatus: "success",
      createdAt: { $gte: pastDate }
    }).populate('items.productId');

    const distribution = {};

    if (orders && orders.length > 0) {
      // Analyze actual sales from the given period
      orders.forEach(order => {
        order.items.forEach(item => {
          if (item.productId && item.productId.category && item.productId.category.main) {
            const cat = item.productId.category.main;
            distribution[cat] = (distribution[cat] || 0) + item.quantity;
          }
        });
      });
    } else {
      // Fallback: Just show distribution of available products
      const products = await Product.find({ is_deleted: false });
      products.forEach(product => {
        const cat = product.category?.main || "Uncategorized";
        distribution[cat] = (distribution[cat] || 0) + 1;
      });
    }

    // Format for charts: [ { name: "Men", value: 10 }, ... ]
    const chartData = Object.keys(distribution).map(key => ({
      name: key,
      value: distribution[key]
    }));

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFinanceStats = async (req, res) => {
  try {
    const { days } = req.query;
    const { pastDate, olderDate } = getDates(days);

    // 1. Fetch current period orders
    const currentOrders = await Order.find({
      paymentStatus: "success",
      createdAt: { $gte: pastDate }
    });

    const totalRevenue = currentOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = currentOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 2. Fetch previous period orders to calculate growth
    const oldOrders = await Order.find({
      paymentStatus: "success",
      createdAt: { $gte: olderDate, $lt: pastDate }
    });

    const oldRevenue = oldOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const oldOrderCount = oldOrders.length;
    const oldAov = oldOrderCount > 0 ? oldRevenue / oldOrderCount : 0;

    const calcGrowth = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    res.json({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      revenueGrowth: Number(calcGrowth(totalRevenue, oldRevenue).toFixed(1)),
      orderGrowth: Number(calcGrowth(totalOrders, oldOrderCount).toFixed(1)),
      aovGrowth: Number(calcGrowth(averageOrderValue, oldAov).toFixed(1))
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMonthlySales = async (req, res) => {
  try {
    const orders = await Order.find({ paymentStatus: "success" });

    const monthlyData = {};

    orders.forEach(order => {
      const d = new Date(order.createdAt);
      const monthYear = d.toLocaleDateString("en-US", { month: "short", year: "numeric" }); // "Jan 2024"

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { revenue: 0, orders: 0 };
      }
      monthlyData[monthYear].revenue += order.totalAmount;
      monthlyData[monthYear].orders += 1;
    });

    // Convert to array
    const chartData = Object.keys(monthlyData).map(month => ({
      month: month.split(" ")[0], // Just "Jan", "Feb"
      revenue: monthlyData[month].revenue,
      // Simulate profit (70% of revenue) as per plan
      profit: Math.round(monthlyData[month].revenue * 0.7),
      expenses: Math.round(monthlyData[month].revenue * 0.3)
    }));

    res.json(chartData);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};