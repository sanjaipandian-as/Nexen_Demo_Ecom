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

    // Calculate Growth (Current Month vs Last Month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(now);
    lastMonthDate.setMonth(now.getMonth() - 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    // -- Revenue Growth (based on successful payments)
    const currentMonthRevenue = orders
      .filter(o => o.paymentStatus === "success" && new Date(o.createdAt).getMonth() === currentMonth && new Date(o.createdAt).getFullYear() === currentYear)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const lastMonthRevenue = orders
      .filter(o => o.paymentStatus === "success" && new Date(o.createdAt).getMonth() === lastMonth && new Date(o.createdAt).getFullYear() === lastMonthYear)
      .reduce((sum, o) => sum + o.totalAmount, 0);

    let revenueGrowth = 0;
    if (lastMonthRevenue > 0) {
      revenueGrowth = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    } else if (currentMonthRevenue > 0) {
      revenueGrowth = 100;
    }

    // -- Order Growth (based on total order count)
    const currentMonthOrders = orders.filter(o => new Date(o.createdAt).getMonth() === currentMonth && new Date(o.createdAt).getFullYear() === currentYear).length;
    const lastMonthOrders = orders.filter(o => new Date(o.createdAt).getMonth() === lastMonth && new Date(o.createdAt).getFullYear() === lastMonthYear).length;

    let orderGrowth = 0;
    if (lastMonthOrders > 0) {
      orderGrowth = ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100;
    } else if (currentMonthOrders > 0) {
      orderGrowth = 100;
    }

    res.json({
      totalOrders,
      deliveredOrders,
      totalSales,
      totalSellers: 0,
      totalCustomers,
      totalProducts,
      revenueGrowth: Number(revenueGrowth.toFixed(1)),
      orderGrowth: Number(orderGrowth.toFixed(1))
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
      const day = order.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD

      // Format to "MMM DD" (e.g., "Feb 01")
      const dateDate = new Date(day);
      const formattedDate = dateDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

      if (!daily[formattedDate]) {
        daily[formattedDate] = { sales: 0, orders: 0, date: formattedDate };
      }
      daily[formattedDate].sales += order.totalAmount;
      daily[formattedDate].orders += 1;
    });

    // Convert to array and sort by date (optional, but good for charts)
    // For simplicity, we just return the values. 
    // Ideally we should sort by actual date, but the map keys are strings now.
    // Let's rely on the order of insertion if possible or just return as is.
    // To sort properly we might need to keep the original timestamp.

    // Better approach:
    // Create a map with YYYY-MM-DD keys first for sorting, then format.

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
    const products = await Product.find({ is_deleted: false }); // Only active products

    const distribution = {};

    products.forEach(product => {
      const cat = product.category?.main || "Uncategorized";
      distribution[cat] = (distribution[cat] || 0) + 1;
    });

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
    const orders = await Order.find({ paymentStatus: "success" });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate Growth (Current Month vs Last Month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(now);
    lastMonthDate.setMonth(now.getMonth() - 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const currentMonthRevenue = orders
      .filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const lastMonthRevenue = orders
      .filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      })
      .reduce((sum, o) => sum + o.totalAmount, 0);

    let revenueGrowth = 0;
    if (lastMonthRevenue > 0) {
      revenueGrowth = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    } else if (currentMonthRevenue > 0) {
      revenueGrowth = 100; // 100% growth if started from 0
    }

    res.json({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      revenueGrowth: Number(revenueGrowth.toFixed(1))
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