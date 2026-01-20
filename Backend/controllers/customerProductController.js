import mongoose from "mongoose";
import Product from "../models/Product.js";

// 1. Get all approved products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ is_deleted: false });
    return res.json(products);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 2. Get product by ID

export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    // ⭐ VALIDATE OBJECT ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid Product ID format" });
    }

    const product = await Product.findOne({
      _id: productId,
      is_deleted: false
    });

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    return res.json(product);

  } catch (err) {
    console.error("❌ Error in getProductById:", err);
    return res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};

// 3. Search products
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    const products = await Product.find({
      is_deleted: false,
      name: { $regex: q, $options: "i" }
    });

    res.json(products);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 4. Filter by category
export const filterByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const products = await Product.find({
      is_deleted: false,
      "category.main_slug": category
    });

    res.json(products);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 5. Pagination
export const getPaginatedProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ is_deleted: false })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments({ is_deleted: false });

    return res.json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      products
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Advanced Filter Products with Multiple Criteria
export const filterProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    // Build query object
    const query = { is_deleted: false };

    // Category Filter
    if (req.query.category) {
      query['category.main_slug'] = req.query.category;
    }

    // Price Range Filter
    if (req.query.minPrice || req.query.maxPrice) {
      query["pricing.selling_price"] = {};
      if (req.query.minPrice) {
        query["pricing.selling_price"].$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice && parseFloat(req.query.maxPrice) > 0) {
        query["pricing.selling_price"].$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Category Filter
    if (req.query.mainCategory) {
      query["category.main_slug"] = req.query.mainCategory;
    }

    if (req.query.subCategory) {
      query["category.sub_slug"] = req.query.subCategory;
    }

    // Brand Filter (multiple brands)
    if (req.query.brands) {
      const brands = Array.isArray(req.query.brands)
        ? req.query.brands
        : req.query.brands.split(',');
      if (brands.length > 0) {
        query.brand = { $in: brands };
      }
    }


    // Age Category Filter
    if (req.query.ageCategories) {
      const ageCategories = Array.isArray(req.query.ageCategories)
        ? req.query.ageCategories
        : req.query.ageCategories.split(',');

      const ageRanges = [];
      ageCategories.forEach(category => {
        switch (category) {
          case 'kids':
            ageRanges.push({ "safety.age_limit": { $lte: 12 } });
            break;
          case 'teens':
            ageRanges.push({ "safety.age_limit": { $gte: 13, $lte: 17 } });
            break;
          case 'adults':
            ageRanges.push({ "safety.age_limit": { $gte: 18, $lte: 60 } });
            break;
          case 'elders':
            ageRanges.push({ "safety.age_limit": { $gte: 60 } });
            break;
        }
      });

      if (ageRanges.length > 0) {
        query.$or = ageRanges;
      }
    }


    // Specification-based filters (Eco-Friendly, Green Crackers, and Tags)
    const specQueries = [];

    // Eco-Friendly Filter
    if (req.query.isEcoFriendly === 'true') {
      specQueries.push({
        specifications: {
          $elemMatch: {
            key_slug: "eco_friendly",
            value: { $regex: /yes|true/i }
          }
        }
      });
    }

    // Green Crackers Filter
    if (req.query.isGreenCrackers === 'true') {
      specQueries.push({
        specifications: {
          $elemMatch: {
            key_slug: "green_cracker",
            value: { $regex: /yes|true/i }
          }
        }
      });
    }

    // Tags Filter (can be specific predefined tags or any specification key_slug)
    if (req.query.tags) {
      const tags = Array.isArray(req.query.tags)
        ? req.query.tags
        : req.query.tags.split(',');

      tags.forEach(tag => {
        if (tag === 'thunder' || tag === 'sound') {
          specQueries.push({
            specifications: {
              $elemMatch: {
                key_slug: "sound_level",
                value: { $regex: /high|thunder|loud/i }
              }
            }
          });
        } else if (tag === 'blast') {
          specQueries.push({
            specifications: {
              $elemMatch: {
                key_slug: "blast_type"
              }
            }
          });
        } else {
          // Dynamic tag: treated as a specification key that must exist
          specQueries.push({
            specifications: {
              $elemMatch: {
                key_slug: tag
              }
            }
          });
        }
      });
    }

    if (specQueries.length > 0) {
      if (query.$or) {
        // If we already have $or (from ageCategories), we need to use $and to combine them
        query.$and = [{ $or: query.$or }, ...specQueries];
        delete query.$or;
      } else {
        // Otherwise combine all specification queries with $and
        if (specQueries.length === 1) {
          Object.assign(query, specQueries[0]);
        } else {
          query.$and = specQueries;
        }
      }
    }

    // Rating Filter (using a virtual field, so we'll filter after fetching)
    const minRating = req.query.minRating ? parseFloat(req.query.minRating) : null;

    // Sorting logic
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'new':
          sort = { createdAt: -1 };
          break;
        case 'price_asc':
          sort = { 'pricing.selling_price': 1 };
          break;
        case 'price_desc':
          sort = { 'pricing.selling_price': -1 };
          break;
        case 'rating':
          sort = { averageRating: -1 };
          break;
      }
    }

    // Execute query
    let products = await Product.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sort);

    // Filter by rating if specified (this would need a ratings collection in production)
    // For now, we'll assume all products have a default rating
    if (minRating) {
      // In production, you'd join with a ratings collection
      // For now, we'll keep all products as the rating system isn't implemented
    }

    const total = await Product.countDocuments(query);

    return res.json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      products,
      appliedFilters: {
        priceRange: {
          min: req.query.minPrice || 0,
          max: req.query.maxPrice || 'unlimited'
        },
        brands: req.query.brands || [],
        ageCategories: req.query.ageCategories || [],
        tags: req.query.tags || [],
        isEcoFriendly: req.query.isEcoFriendly === 'true',
        isGreenCrackers: req.query.isGreenCrackers === 'true',
        minRating: minRating || 0
      }
    });

  } catch (err) {
    console.error('Filter error:', err);
    res.status(500).json({ error: err.message });
  }
};

// 7. Get Available Filter Options
export const getFilterOptions = async (req, res) => {
  try {
    // Get unique brands
    const brands = await Product.distinct('brand', {
      is_deleted: false
    });

    // Get price range
    const priceStats = await Product.aggregate([
      { $match: { is_deleted: false } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$pricing.selling_price' },
          maxPrice: { $max: '$pricing.selling_price' },
          avgPrice: { $avg: '$pricing.selling_price' }
        }
      }
    ]);

    // Get unique age limits
    const ageLimits = await Product.distinct('safety.age_limit', {
      is_deleted: false
    });

    // Get unique specification keys (for tags)
    const specifications = await Product.aggregate([
      { $match: { is_deleted: false } },
      { $unwind: '$specifications' },
      {
        $group: {
          _id: '$specifications.key_slug',
          key: { $first: '$specifications.key' }
        }
      }
    ]);

    // Get unique categories with counts
    const categories = await Product.aggregate([
      { $match: { is_deleted: false } },
      {
        $group: {
          _id: {
            main: '$category.main',
            main_slug: '$category.main_slug'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Check for eco-friendly and green cracker products
    const ecoFriendlyCount = await Product.countDocuments({
      is_deleted: false,
      specifications: {
        $elemMatch: {
          key_slug: 'eco_friendly',
          value: { $regex: /yes|true/i }
        }
      }
    });

    const greenCrackerCount = await Product.countDocuments({
      is_deleted: false,
      specifications: {
        $elemMatch: {
          key_slug: 'green_cracker',
          value: { $regex: /yes|true/i }
        }
      }
    });

    // Get product counts by price ranges
    const priceRanges = await Product.aggregate([
      { $match: { is_deleted: false } },
      {
        $bucket: {
          groupBy: '$pricing.selling_price',
          boundaries: [0, 500, 1000, 5000, 10001],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    return res.json({
      brands: brands.filter(Boolean).sort(),
      priceRange: {
        min: priceStats[0]?.minPrice || 0,
        max: priceStats[0]?.maxPrice || 50000,
        average: Math.round(priceStats[0]?.avgPrice || 25000)
      },
      priceRanges: [
        { label: 'All Price', min: 0, max: null, count: await Product.countDocuments({ is_deleted: false }) },
        { label: 'Below ₹500', min: 0, max: 500, count: priceRanges.find(r => r._id === 0)?.count || 0 },
        { label: '₹1000 - ₹5000', min: 1000, max: 5000, count: priceRanges.find(r => r._id === 1000)?.count || 0 },
        { label: '₹5000 - ₹10000', min: 5000, max: 10000, count: priceRanges.find(r => r._id === 5000)?.count || 0 }
      ],
      ageCategories: [
        { label: 'Kids (5-12 years)', value: 'kids', available: ageLimits.some(age => age >= 5 && age <= 12) },
        { label: 'Teenagers (13-17 years)', value: 'teens', available: ageLimits.some(age => age >= 13 && age <= 17) },
        { label: 'Adults (18-60 years)', value: 'adults', available: ageLimits.some(age => age >= 18 && age <= 60) },
        { label: 'Elders (60+ years)', value: 'elders', available: ageLimits.some(age => age >= 60) }
      ],
      tags: specifications.map(spec => ({
        key: spec.key,
        key_slug: spec._id
      })),
      categories: categories.map(cat => ({
        name: cat._id.main,
        slug: cat._id.main_slug,
        count: cat.count
      })),
      specialFilters: {
        ecoFriendly: {
          available: ecoFriendlyCount > 0,
          count: ecoFriendlyCount
        },
        greenCracker: {
          available: greenCrackerCount > 0,
          count: greenCrackerCount
        }
      }
    });

  } catch (err) {
    console.error('Get filter options error:', err);
    res.status(500).json({ error: err.message });
  }
};

// 8. Get products by Seller ID (Public)
export const getProductsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const products = await Product.find({
      sellerId,
      is_deleted: false
    }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Get products by seller error:', err);
    res.status(500).json({ error: err.message });
  }
};
