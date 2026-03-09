import razorpayInstance from "../config/razorpay.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import { sendNotification } from "../utils/sendNotification.js";
import { executeOrderPlacement } from "./orderController.js";
import crypto from "crypto";


// ==============================
// 1. INITIATE PAYMENT ORDER (Before e-com Order exists)
// ==============================
export const createPaymentOrder = async (req, res) => {
  try {
    if (!razorpayInstance) return res.status(500).json({ message: "Payment gateway not configured" });

    const { items } = req.body;
    console.log("Initiating Payment for Items:", items);

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided for calculation." });
    }

    // Securely calculate total on server side
    let totalAmount = 0;
    for (const item of items) {
      try {
        const product = await Product.findById(item.productId);
        if (!product) {
          console.warn(`Product not found during payment initiation: ${item.productId}`);
          continue;
        }
        const price = product.pricing?.selling_price || product.price || 0;
        totalAmount += price * item.quantity;
        console.log(`- Resolved Product: ${product.name} | Price: ${price} | Qty: ${item.quantity}`);
      } catch (findErr) {
        console.error(`Invalid Product ID during initiation: ${item.productId}`, findErr.message);
        return res.status(400).json({ message: `Invalid product reference detected: ${item.productId}` });
      }
    }

    console.log("Calculated Total for Gateway:", totalAmount);
    if (totalAmount <= 0) return res.status(400).json({ message: "Transaction total is 0 or negative. Verify pricing." });

    const options = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `init_${Date.now()}`,
    };

    const paymentOrder = await razorpayInstance.orders.create(options);
    console.log("Razorpay Order Created:", paymentOrder.id);

    return res.json({
      message: "Gateway sequence initiated.",
      paymentOrder,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Initiation Error:", err);
    return res.status(500).json({ error: err.message });
  }
};


// =====================================
// 2. VERIFY & FINALIZE (Atomic Placement)
// =====================================
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData // items, address, cartSource
    } = req.body;

    const customerId = req.user._id;

    // 1. Signature Verification
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(sign)
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: "Security Violation: Invalid Payment Signature Detected." });
    }

    // 2. Fulfillment Logic - Now we create the order AFTER payment
    try {
      const order = await executeOrderPlacement(customerId, {
        ...orderData,
        paymentMethod: 'online',
        razorpayDetails: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature
        }
      });

      return res.json({
        message: "Payment verified. Fulfillment protocol executed.",
        order,
      });
    } catch (orderErr) {
      console.error("Placement error after payment:", orderErr);
      // Usually you'd initiate a refund here if stock deduction failed unexpectedly
      return res.status(500).json({
        message: "Payment received but fulfillment failed. Please contact protocol support for manual override.",
        error: orderErr.message
      });
    }

  } catch (err) {
    console.error("Verification logic error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// 3. ABORT SEQUENCE (User cancelled modal)
export const paymentFailed = async (req, res) => {
  // No order record existed yet, so we just log or notify.
  return res.json({ message: "Sequence aborted by user. No database records initiated." });
};
