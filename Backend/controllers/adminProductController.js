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

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    console.error("Create product error:", err);
    return res.status(500).json({ error: err.message });
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

    return res.json(products);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ⭐ UPDATE PRODUCT (ADMIN)
export const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Parse FormData fields
    const categoryData = {};
    const pricingData = {};
    const updates = {};

    // Handle category fields (category[main], category[sub])
    Object.keys(req.body).forEach(key => {
      if (key.startsWith('category[')) {
        const field = key.match(/category\[(.+)\]/)[1];
        categoryData[field] = req.body[key];
      } else if (key.startsWith('pricing[')) {
        const field = key.match(/pricing\[(.+)\]/)[1];
        pricingData[field] = req.body[key];
      } else if (key === 'specifications') {
        // Parse JSON string
        updates[key] = typeof req.body[key] === 'string' ? JSON.parse(req.body[key]) : req.body[key];
      } else if (key === 'tags' || key === 'colors' || key === 'sizes') {
        // Handle arrays - they come as tags[], colors[], sizes[]
        // Skip here, we'll handle them below
      } else if (key === 'existingImages' || key === 'existingImages[]') {
        // Skip, handled separately
      } else if (key === 'is_featured' || key === 'is_new_arrival') {
        updates[key] = req.body[key] === 'true' || req.body[key] === true;
      } else {
        updates[key] = req.body[key];
      }
    });

    // Handle array fields that come as field[]
    if (req.body['tags[]']) {
      updates.tags = Array.isArray(req.body['tags[]']) ? req.body['tags[]'] : [req.body['tags[]']];
    } else if (req.body.tags) {
      updates.tags = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags];
    }

    if (req.body['colors[]']) {
      updates.colors = Array.isArray(req.body['colors[]']) ? req.body['colors[]'] : [req.body['colors[]']];
    }

    if (req.body['sizes[]']) {
      updates.sizes = Array.isArray(req.body['sizes[]']) ? req.body['sizes[]'] : [req.body['sizes[]']];
    }

    // Set nested objects
    if (Object.keys(categoryData).length > 0) {
      updates.category = categoryData;
    }

    if (Object.keys(pricingData).length > 0) {
      updates.pricing = pricingData;
    }

    // Handle images
    let imageUrls = [];

    // Keep existing images
    if (req.body['existingImages[]']) {
      imageUrls = Array.isArray(req.body['existingImages[]'])
        ? req.body['existingImages[]']
        : [req.body['existingImages[]']];
    } else if (req.body.existingImages) {
      imageUrls = Array.isArray(req.body.existingImages)
        ? req.body.existingImages
        : [req.body.existingImages];
    }

    // Upload new images if provided
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
          resource_type: "auto",
        });
        imageUrls.push(result.secure_url);
      }
    }

    if (imageUrls.length > 0) {
      updates.images = imageUrls;
    }

    // Update the product
    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ message: "Product updated successfully", product });
  } catch (err) {
    console.error("Update product error:", err);
    return res.status(500).json({ error: err.message });
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

    return res.json({ message: "Product deleted successfully", product });
  } catch (err) {
    return res.status(500).json({ error: err.message });
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

    return res.json(product);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// ⭐ GET PRODUCTS COUNT
export const getAllProductsCount = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ is_deleted: false });
    return res.json({ totalProducts });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
