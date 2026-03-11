import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

// ⭐ CREATE PRODUCT (ADMIN ONLY)
export const createProduct = async (req, res) => {
  try {
    const categoryData = {};
    const pricingData = {};
    let specificationsData = [];
    let tagsData = [];
    let isFeaturedData = false;

    // Handle various ways FormData can send nested data
    Object.keys(req.body).forEach(key => {
      if (key === 'category') {
        if (typeof req.body[key] === 'string') {
          try { Object.assign(categoryData, JSON.parse(req.body[key])); } catch (e) { }
        } else if (typeof req.body[key] === 'object') {
          Object.assign(categoryData, req.body[key]);
        }
      } else if (key.startsWith('category[')) {
        const field = key.match(/category\[(.+)\]/)[1];
        categoryData[field] = req.body[key];
      } else if (key === 'pricing') {
        if (typeof req.body[key] === 'string') {
          try { Object.assign(pricingData, JSON.parse(req.body[key])); } catch (e) { }
        } else if (typeof req.body[key] === 'object') {
          Object.assign(pricingData, req.body[key]);
        }
      } else if (key.startsWith('pricing[')) {
        const field = key.match(/pricing\[(.+)\]/)[1];
        pricingData[field] = req.body[key];
      } else if (key === 'specifications') {
        specificationsData = typeof req.body[key] === 'string' ? JSON.parse(req.body[key]) : req.body[key];
      } else if (key === 'tags') {
        tagsData = typeof req.body[key] === 'string' ? JSON.parse(req.body[key]) : req.body[key];
      } else if (key === 'is_featured') {
        isFeaturedData = req.body[key] === 'true' || req.body[key] === true;
      }
    });

    const {
      name,
      description,
      brand,
      stock,
    } = req.body;

    // Validate required fields
    console.log("Create Product Received Body:", JSON.stringify(req.body, null, 2));
    console.log("Category Data:", categoryData);
    console.log("Pricing Data:", pricingData);
    console.log("Req Files:", req.files ? req.files.length : 0);

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
        // If file.path is already a cloudinary URL (from multer-storage-cloudinary) 
        // we can just use it, or re-upload to a specific folder
        if (file.path && file.path.startsWith('http')) {
          imageUrls.push(file.path);
        } else {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "products",
            resource_type: "auto",
          });
          imageUrls.push(result.secure_url);
        }
      }
    } else if (req.body.images) {
      imageUrls = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    if (imageUrls.length < 2) {
      return res.status(400).json({ message: "At least 2 product images are required (Max 5)" });
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
        cost: pricingData.cost || 0,
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
        updates[`category.${field}`] = req.body[key];
      } else if (key.startsWith('pricing[')) {
        const field = key.match(/pricing\[(.+)\]/)[1];
        updates[`pricing.${field}`] = req.body[key];
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
      if (typeof req.body.tags === 'string' && req.body.tags.startsWith('[')) {
        updates.tags = JSON.parse(req.body.tags);
      } else {
        updates.tags = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags];
      }
    }

    if (req.body['colors[]']) {
      updates.colors = Array.isArray(req.body['colors[]']) ? req.body['colors[]'] : [req.body['colors[]']];
    }

    if (req.body['sizes[]']) {
      updates.sizes = Array.isArray(req.body['sizes[]']) ? req.body['sizes[]'] : [req.body['sizes[]']];
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

    // Manually generate slugs if category is being updated
    if (updates['category.main']) {
      updates['category.main_slug'] = updates['category.main']
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }
    if (updates['category.sub']) {
      updates['category.sub_slug'] = updates['category.sub']
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    } else if (updates['category.sub'] === "") {
      updates['category.sub_slug'] = "";
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

// ⭐ ACTIVATE PRODUCT
export const activateProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByIdAndUpdate(
      productId,
      { is_deleted: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ message: "Product activated successfully", product });
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
