import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { createNotification } from "../controllers/notificationController.js";  // ⭐ UPDATED
import { encrypt, decrypt } from "../utils/cryptoUtils.js";


// ==============================
// 0. CORE ORDER EXECUTION HELPER (For fulfillment after payment)
// ==============================
export const executeOrderPlacement = async (customerId, orderData) => {
  const {
    shippingAddress,
    paymentMethod,
    items,
    sourceCartItems = [],
    razorpayDetails = null
  } = orderData;

  // 1. Calculate final total (Security Check)
  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  // 2. ATOMIC STOCK DEDUCTION
  for (const item of items) {
    const product = await Product.findOneAndUpdate(
      {
        _id: item.productId,
        stock: { $gte: item.quantity }
      },
      {
        $inc: { stock: -item.quantity, sold_count: item.quantity }
      },
      { new: true }
    );

    if (!product) {
      throw new Error(`Insufficient stock for product: ${item.productId}`);
    }
  }

  // 3. Create E-com Order Record
  const order = await Order.create({
    customerId,
    items,
    totalAmount,
    shippingAddress,
    paymentMethod,
    status: paymentMethod === 'online' ? "paid" : "pending_payment",
    paymentStatus: paymentMethod === 'online' ? "success" : "pending",
    ...razorpayDetails // Spread razorpayOrderId, paymentId, signature if provided
  });

  // 4. NOTIFICATION
  await createNotification({
    userId: customerId,
    userType: "customer",
    title: paymentMethod === 'online' ? "Payment Received" : "Order Placed",
    message: paymentMethod === 'online'
      ? `Your payment of ₹${totalAmount} was successful. Order confirmed!`
      : "Your order has been initiated. Proceed with Cash on Delivery.",
    type: "order"
  });

  // 5. Remove items from Cart (if applicable)
  if (sourceCartItems.length > 0) {
    const itemIdsToRemove = sourceCartItems.map(item => item._id);
    await Cart.findOneAndUpdate(
      { customerId },
      { $pull: { items: { _id: { $in: itemIdsToRemove } } } }
    );
  }

  return await Order.findById(order._id).populate("items.productId");
};

export const createOrder = async (req, res) => {
  try {
    const customerId = req.user._id;
    const {
      shippingAddress,
      paymentMethod = "cod",
      cartItemIds = [],
      directItems = []
    } = req.body;

    // Online payments should not use this endpoint to 'initiate' orders anymore
    if (paymentMethod === 'online') {
      return res.status(400).json({
        message: "Online orders must be initiated through the payment gateway protocol."
      });
    }

    let orderItems = [];
    let sourceCartItems = [];

    // Resolve Items
    if (directItems && directItems.length > 0) {
      for (const item of directItems) {
        const product = await Product.findById(item.productId);
        if (!product) continue;
        orderItems.push({
          productId: product._id,
          quantity: item.quantity,
          price: product.pricing?.selling_price || product.price || 0,
        });
      }
    } else {
      const cart = await Cart.findOne({ customerId }).populate("items.productId");
      if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });

      sourceCartItems = cart.items.filter(item => {
        if (!item.productId) return false;
        if (cartItemIds.length > 0) {
          return cartItemIds.includes(item.productId._id.toString()) || cartItemIds.includes(item._id.toString());
        }
        return true;
      });

      if (sourceCartItems.length === 0) return res.status(400).json({ message: "No selected items found in cart." });

      orderItems = sourceCartItems.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.pricing?.selling_price || item.productId.price || 0,
      }));
    }

    if (orderItems.length === 0) return res.status(400).json({ message: "No valid products encountered." });

    // Execute placement for COD
    const order = await executeOrderPlacement(customerId, {
      shippingAddress,
      paymentMethod: "cod",
      items: orderItems,
      sourceCartItems
    });

    return res.json({ message: "Order placed successfully via COD protocol.", order });

  } catch (err) {
    console.error("Order Creation Error:", err);
    return res.status(500).json({ message: "Failed to place order", error: err.message });
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

    return res.json({
      count: orders.length,
      orders
    });

  } catch (err) {
    return res.status(500).json({
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

    // ⭐ Decrypt Bank Details for Admin Hub
    const decryptedOrders = orders.map(order => {
      const orderObj = order.toObject();
      if (orderObj.refundAccountDetails) {
        if (orderObj.refundAccountDetails.accountNumber) {
          orderObj.refundAccountDetails.accountNumber = decrypt(orderObj.refundAccountDetails.accountNumber);
        }
        if (orderObj.refundAccountDetails.upiId) {
          orderObj.refundAccountDetails.upiId = decrypt(orderObj.refundAccountDetails.upiId);
        }
        // IFSC is usually fine, but encrypting it doesn't hurt. 
        // For now let's stick to sensitive ones.
      }
      return orderObj;
    });

    return res.json(decryptedOrders);

  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch all orders",
      error: err.message
    });
  }
};

// ==============================
// ⭐ CANCEL ORDER (CUSTOMER / ADMIN)
// ==============================
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, refundAccountDetails } = req.body;
    const userId = req.user._id;
    const userType = req.user.role === 'admin' ? 'admin' : 'customer';

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Security: Ensure customer can only cancel their own order
    if (userType === 'customer' && order.customerId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to cancel this order" });
    }

    // Validation: Check if order can be cancelled
    const nonCancellableStatuses = ["shipped", "delivered", "cancelled", "returned", "return_requested"];
    if (nonCancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        message: `Order cannot be cancelled. Current status: ${order.status.replace('_', ' ')}`
      });
    }

    // Production Workflow: If already paid, handle refund logic
    if (order.paymentStatus === 'success') {
      order.status = 'cancellation_requested'; // Send to Admin for permission first
      order.deliveryAttempted = false; // Clearly indicate product stays in warehouse
      order.refundDetails = {
        refundStatus: 'pending',
        refundAmount: order.totalAmount,
        initiatedAt: new Date(),
        message: "Customer requested cancellation before delivery (Paid Online)"
      };
    } else {
      order.status = 'cancellation_requested'; // All cancellations now require admin approval
    }

    order.cancelReason = reason || "Cancelled by user";
    order.cancellationDate = new Date();

    // ⭐ REFD-DETAILS (For COD / Manual Online)
    if (refundAccountDetails) {
      try {
        let details = typeof refundAccountDetails === 'string'
          ? JSON.parse(refundAccountDetails)
          : refundAccountDetails;

        if (details.accountNumber) details.accountNumber = encrypt(details.accountNumber);
        if (details.upiId) details.upiId = encrypt(details.upiId);
        order.refundAccountDetails = details;
      } catch (err) {
        order.refundAccountDetails = refundAccountDetails;
      }
    }

    await order.save();

    // ⭐ STOCK REPLENISHMENT (Atomic)
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: {
          stock: item.quantity,
          sold_count: -item.quantity
        }
      });
    }

    // ⭐ NOTIFICATION
    await createNotification({
      userId: order.customerId,
      userType: "customer",
      title: "Order Cancelled",
      message: `Your order #${order._id.toString().slice(-6)} has been cancelled successfully.`,
      type: "order"
    });

    return res.json({
      message: "Order cancelled successfully",
      order
    });

  } catch (err) {
    console.error("Order Cancellation Error:", err);
    return res.status(500).json({ message: "Failed to cancel order", error: err.message });
  }
};

// ==============================
// ⭐ RETURN ORDER REQUEST (CUSTOMER)
// ==============================
export const returnOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, refundAccountDetails } = req.body;
    const customerId = req.user._id;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Security check
    if (order.customerId.toString() !== customerId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Validation: Must be delivered to return
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: "Only delivered orders can be returned" });
    }

    // Amazon/Flipkart Level: Check return window (e.g., 7 days)
    const deliveryDate = order.updatedAt; // Simplified for this demo
    const daysSinceDelivery = (new Date() - new Date(deliveryDate)) / (1000 * 60 * 60 * 24);

    if (daysSinceDelivery > 7) {
      return res.status(400).json({ message: "Return window (7 days) has expired" });
    }

    order.status = 'return_requested';
    order.returnReason = reason;
    order.returnRequestDate = new Date();

    // 📸 ⭐ HANDLE RETURN IMAGES (MULTER)
    if (req.files && req.files.length > 0) {
      order.returnImages = req.files.map((file) => file.path);
    }

    // ⭐ REFD-DETAILS (Encrypt Sensitive Data)
    if (refundAccountDetails) {
      try {
        let details = typeof refundAccountDetails === 'string'
          ? JSON.parse(refundAccountDetails)
          : refundAccountDetails;

        if (details.accountNumber) details.accountNumber = encrypt(details.accountNumber);
        if (details.upiId) details.upiId = encrypt(details.upiId);

        order.refundAccountDetails = details;
      } catch (err) {
        order.refundAccountDetails = refundAccountDetails;
      }
    }

    await order.save();

    // ⭐ NOTIFICATION (To Admin)
    // You would typically notify admin here too

    return res.json({
      message: "Return request submitted successfully",
      order
    });

  } catch (err) {
    return res.status(500).json({ message: "Failed to submit return request", error: err.message });
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
    const validStatuses = [
      "pending_payment",
      "paid",
      "packed",
      "shipped",
      "delivered",
      "cancelled",
      "return_requested",
      "return_approved",
      "return_rejected",
      "returned",
      "refund_initiated",
      "refunded"
    ];

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

    return res.json({
      message: "Order status updated successfully",
      order
    });

  } catch (err) {
    return res.status(500).json({
      message: "Failed to update order status",
      error: err.message
    });
  }
};
