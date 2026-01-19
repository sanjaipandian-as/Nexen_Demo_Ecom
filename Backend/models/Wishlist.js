import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// ⭐ Prevent same product being added twice by same customer
wishlistSchema.index({ customerId: 1, productId: 1 }, { unique: true });

export default mongoose.model("Wishlist", wishlistSchema);
