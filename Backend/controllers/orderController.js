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

    // Prepare order items
    const orderItems = cart.items.map((item) => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.pricing?.selling_price || item.productId.price || 0,
    }));

    // Calculate total price
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    // Firecrackers come from ONE seller → get sellerId from product
    const sellerId = cart.items[0].productId.sellerId;

    // Deduct stock
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
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

    // Create order with payment method
    const order = await Order.create({
      customerId,
      sellerId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: paymentMethod === "cod" ? "paid" : "pending_payment",
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending"
    });

    // ⭐ NOTIFICATION 1 — Notify Seller
    await createNotification({
      userId: sellerId,
      userType: "seller",
      title: "New Order Received",
      message: "A new order has been placed for your products.",
      type: "order"
    });

    // ⭐ NOTIFICATION 2 — Notify Customer
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
    res.status(500).json({ error: err.message });
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
      .populate({
        path: "sellerId",
        select: "businessName email phone"
      })
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
      .populate({
        path: "sellerId",
        select: "businessName email phone"
      })
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
