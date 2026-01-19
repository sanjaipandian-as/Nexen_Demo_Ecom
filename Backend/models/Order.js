import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingAddress: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "pending_payment",
        "paid",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending_payment",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "online",
    },
  },
  { timestamps: true }
);

// Pre-save middleware to ensure totalAmount is always calculated correctly
orderSchema.pre("save", async function () {
  if (this.isModified("items") || this.isNew || this.totalAmount === 0) {
    if (this.items && this.items.length > 0) {
      const calculatedTotal = this.items.reduce((sum, item) => {
        return sum + ((item.price || 0) * (item.quantity || 0));
      }, 0);

      // Only overwrite if it's 0 or we explicitly want to recalculate
      if (this.totalAmount === 0 || this.isModified("items")) {
        this.totalAmount = calculatedTotal;
      }
    }
  }
});

export default mongoose.model("Order", orderSchema);
