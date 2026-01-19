import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

// ⭐ CREATE PRODUCT (ADMIN ONLY)
export const createProduct = async (req, res) => {
  try {
    // Handle potential stringified JSON from FormData
    const categoryData = typeof req.body.category === "string" ? JSON.parse(req.body.category) : req.body.category;
    const pricingData = typeof req.body.pricing === "string" ? JSON.parse(req.body.pricing) : req.body.pricing;
    const specificationsData = typeof req.body.specifications === "string" ? JSON.parse(req.body.specifications) : req.body.specifications;
    const tagsData = typeof req.body.tags === "string" ? JSON.parse(req.body.tags) : req.body.tags;
    const isFeaturedData = req.body.is_featured === "true" || req.body.is_featured === true;

    const {
      name,
      description,
      brand,
      stock,
    } = req.body;

    // Validate required fields
    if (!name || !description || !brand || !categoryData?.main || !pricingData?.mrp || !pricingData?.selling_price) {
      return res.status(400).json({
        message: "Missing required fields",
        received: {
          name: !!name,
          description: !!description,
          brand: !!brand,
          category: !!categoryData?.main,
          mrp: !!pricingData?.mrp,
          selling_price: !!pricingData?.selling_price
        }
      });
    }

    // Handle image uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
          resource_type: "auto",
        });
        imageUrls.push(result.secure_url);
      }
    } else if (req.body.images) {
      // If images are provided as URLs (already uploaded)
      imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    if (imageUrls.length === 0) {
      return res.status(400).json({ message: "At least one product image is required" });
    }

    // Create product
    const product = new Product({
      name,
      description,
      brand,
      category: {
        main: categoryData.main,
        sub: categoryData.sub || "",
      },
      pricing: {
        mrp: pricingData.mrp,
        selling_price: pricingData.selling_price,
      },
      images: imageUrls,
      stock: stock || 0,
      specifications: specificationsData || [],
      tags: tagsData || [],
      is_featured: isFeaturedData,
    });

    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ⭐ GET ALL PRODUCTS (ADMIN)
export const getAllProducts = async (req, res) => {
  try {
    const { category, is_deleted } = req.query;

    let query = {};
    if (category) query["category.main"] = category;
    if (is_deleted !== undefined) query.is_deleted = is_deleted === "true";

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ⭐ UPDATE PRODUCT (ADMIN)
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ⭐ DELETE PRODUCT (SOFT DELETE)
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByIdAndUpdate(
      productId,
      { is_deleted: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ⭐ GET PRODUCT BY ID
export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ⭐ GET PRODUCTS COUNT
export const getAllProductsCount = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ is_deleted: false });
    res.json({ totalProducts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
