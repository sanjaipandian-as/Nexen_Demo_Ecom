import Order from "../models/Order.js";
import { createNotification } from "./notificationController.js";

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customerId")
      .populate("items.productId");

    res.json(orders);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    const orders = await Order.find({ status })
      .populate("customerId")
      .populate("items.productId");

    res.json(orders);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { orderId, id } = req.params; // Accept both parameter names
    const orderIdToUse = orderId || id; // Use whichever is provided
    const { status } = req.body;

    const allowedStatus = ["pending_payment", "paid", "packed", "shipped", "delivered", "cancelled"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      orderIdToUse,
      { status },
      { new: true, runValidators: false } // Disable validators to handle legacy data without sellerId
    ).populate("customerId");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Notify Customer about status update
    if (order.customerId) {
      await createNotification({
        userId: order.customerId._id,
        userType: "customer",
        title: "Order Status Updated",
        message: `Your order status has been updated to: ${status.replace('_', ' ')}`,
        type: "order"
      });
    }

    res.json({
      message: `Order status updated to ${status} by Admin`,
      order
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = "cancelled";
    order.paymentStatus = "failed";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};