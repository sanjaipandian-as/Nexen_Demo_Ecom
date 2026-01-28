import mongoose from "mongoose";

const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    // ==============================
    // 📦 BASIC INFORMATION
    // ==============================
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      index: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },

    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      index: true,
    },

    // ==============================
    // 📂 CATEGORIZATION
    // ==============================
    category: {
      main: {
        type: String,
        required: true,
        enum: [
          "Body Care",
          "Skin Care",
          "Face Care",
          "Hair Care",
          "Sarees",
          "Kurtis & Kurtas",
          "Lehenga & Party Wear",
          "Salwar & Suit Sets",
          "Ethnic Gowns & Anarkalis"
        ],
        index: true,
      },
      main_slug: { type: String, required: true, index: true },
      sub: { type: String, trim: true },
      sub_slug: { type: String },
    },

    // ==============================
    // 💰 PRICING
    // ==============================
    pricing: {
      mrp: {
        type: Number,
        required: [true, "MRP is required"],
        min: [0, "MRP cannot be negative"],
      },
      selling_price: {
        type: Number,
        required: [true, "Selling price is required"],
        min: [0, "Selling price cannot be negative"],
        validate: {
          validator: function (value) {
            if (this.pricing?.mrp != null) {
              return value <= this.pricing.mrp;
            }
            return true;
          },
          message: "Selling price cannot be greater than MRP",
        },
      },
      discount_percentage: { type: Number, default: 0 },
    },

    // ==============================
    // 🖼️ MEDIA
    // ==============================
    images: {
      type: [String],
      required: [true, "At least one product image is required"],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0 && v.length <= 5,
        message: "You must upload between 1 and 5 images",
      },
    },

    // ==============================
    // 📊 INVENTORY
    // ==============================
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
      index: true,
    },

    // ==============================
    // 🧪 SPECIFICATIONS
    // ==============================
    specifications: {
      type: [
        {
          key: { type: String, required: true, trim: true },
          value: { type: String, required: true, trim: true },
          _id: false,
        },
      ],
      default: [],
    },

    // ==============================
    // 🔍 METADATA
    // ==============================
    tags: {
      type: [String],
      default: [],
      index: true,
    },

    is_deleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    is_featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    views: { type: Number, default: 0 },
    sold_count: { type: Number, default: 0 },

    // ⭐ MISSING FIELDS ADDED
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* -------------------------------------------------------------------------- */
/* MIDDLEWARE                                                                 */
/* -------------------------------------------------------------------------- */

// Generate slug automatically
ProductSchema.pre("validate", async function () {
  if (this.isModified("name") || !this.slug) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      + `-${randomSuffix}`;
  }

  // Generate category slugs
  if (this.isModified("category.main")) {
    this.category.main_slug = this.category.main
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
  }

  if (this.category.sub && this.isModified("category.sub")) {
    this.category.sub_slug = this.category.sub
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
  }

  // Calculate discount percentage
  if (this.pricing.mrp && this.pricing.selling_price) {
    const discount = ((this.pricing.mrp - this.pricing.selling_price) / this.pricing.mrp) * 100;
    this.pricing.discount_percentage = Math.round(discount);
  }
});

// Handle duplicate slug errors
ProductSchema.post("save", async function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000 && error.keyPattern?.slug) {
    try {
      const newRandom = Math.floor(Math.random() * 100000);
      const newSlug = `${doc.slug}-${newRandom}`;
      await doc.constructor.updateOne({ _id: doc._id }, { $set: { slug: newSlug } });
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next(error);
  }
});

/* -------------------------------------------------------------------------- */
/* INDEXES                                                                    */
/* -------------------------------------------------------------------------- */

// Full text search
ProductSchema.index(
  { name: "text", description: "text", brand: "text", tags: "text" },
  { weights: { name: 10, brand: 5, tags: 3 } }
);

// Main browsing filter
ProductSchema.index(
  { "category.main_slug": 1, "pricing.selling_price": 1 },
  { partialFilterExpression: { is_deleted: false } }
);

// Stock availability
ProductSchema.index({ stock: 1, is_deleted: 1 });

export default mongoose.model("Product", ProductSchema);