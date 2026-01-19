import razorpayInstance from "../config/razorpay.js";
import Order from "../models/Order.js";
import { sendNotification } from "../utils/sendNotification.js";
import crypto from "crypto";


// ==============================
// STEP 4 — Create Razorpay Order
// ==============================
export const createPaymentOrder = async (req, res) => {
  try {
    if (!razorpayInstance) {
      return res.status(500).json({
        message: "Payment gateway not configured",
      });
    }

    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const options = {
      amount: order.totalAmount * 100, // paise
      currency: "INR",
      receipt: `receipt_${order._id}`,
    };

    const paymentOrder = await razorpayInstance.orders.create(options);

    res.json({
      message: "Payment order created",
      paymentOrder,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =====================================
// STEP 5 — Verify Payment
// =====================================
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(sign)
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order
    order.paymentStatus = "success";
    order.status = "paid";
    await order.save();

    // ⭐ Notify customer
    await sendNotification(
      order.customerId,
      "customer",
      "Payment Successful",
      "Your payment has been verified successfully.",
      "payment"
    );

    res.json({
      message: "Payment verified successfully",
      order,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =====================
// STEP 6 — Payment Failed
// =====================
export const paymentFailed = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.paymentStatus = "failed";
    order.status = "pending_payment";
    await order.save();

    res.json({
      message: "Payment failed",
      order,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
