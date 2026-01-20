import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { createNotification } from "../controllers/notificationController.js";  // ⭐ UPDATED


export const createOrder = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { shippingAddress, paymentMethod = "online" } = req.body;

    // Fetch customer cart
    const cart = await Cart.findOne({ customerId }).populate("items.productId");

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Cart is empty" });

    // Filter out invalid items (where product might have been deleted)
    const validItems = cart.items.filter(item => item.productId);

    if (validItems.length === 0) {
      return res.status(400).json({ message: "Cart contains invalid items or products that no longer exist." });
    }

    // Prepare order items
    const orderItems = validItems.map((item) => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.pricing?.selling_price || item.productId.price || 0,
    }));

    // Calculate total price
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );


    // Deduct stock
    for (const item of validItems) {
      const product = await Product.findById(item.productId._id);
      if (!product) continue;

      const availableStock = product.stock_control?.available_pieces ?? product.stock ?? 0;

      if (availableStock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }

      if (product.stock_control) {
        product.stock_control.available_pieces -= item.quantity;
      } else {
        product.stock -= item.quantity;
      }
      await product.save();
    }

    console.log("Creating Order Payload:", JSON.stringify({
      customerId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod
    }, null, 2));

    // Create order with payment method
    const order = await Order.create({
      customerId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: paymentMethod === "cod" ? "pending_payment" : "pending_payment", // Default to pending until verified
      paymentStatus: "pending"
    });

    // ⭐ NOTIFICATION 1 — Notify Customer
    await createNotification({
      userId: customerId,
      userType: "customer",
      title: "Order Placed",
      message: "Your order has been created. Proceed to payment.",
      type: "order"
    });

    // Clear customer cart
    await Cart.findOneAndUpdate(
      { customerId },
      { $set: { items: [] } }
    );

    const populatedOrder = await Order.findById(order._id).populate("items.productId");

    res.json({
      message: "Order created successfully. Proceed to payment.",
      order: populatedOrder
    });

  } catch (err) {
    console.error("Order Creation Logic Error:", err);
    res.status(500).json({
      message: "Failed to create order",
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// ==============================
// ⭐ GET MY ORDERS (CUSTOMER)
// ==============================
export const getMyOrders = async (req, res) => {
  try {
    const customerId = req.user._id;

    const orders = await Order.find({ customerId })
      .populate("items.productId")
      .sort({ createdAt: -1 }); // Most recent first

    res.json({
      count: orders.length,
      orders
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: err.message
    });
  }
};

// ==============================
// ⭐ GET ALL ORDERS (ADMIN)
// ==============================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("customerId", "name email phone")
      .populate("items.productId", "name images")
      .sort({ createdAt: -1 }); // Most recent first

    res.json(orders);

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch all orders",
      error: err.message
    });
  }
};

// ==============================
// ⭐ UPDATE ORDER STATUS (ADMIN)
// ==============================
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["pending_payment", "paid", "packed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("customerId", "name email")
      .populate("items.productId", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ⭐ NOTIFICATION — Notify Customer about status update
    await createNotification({
      userId: order.customerId._id,
      userType: "customer",
      title: "Order Status Updated",
      message: `Your order status has been updated to: ${status.replace('_', ' ')}`,
      type: "order"
    });

    res.json({
      message: "Order status updated successfully",
      order
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to update order status",
      error: err.message
    });
  }
};
