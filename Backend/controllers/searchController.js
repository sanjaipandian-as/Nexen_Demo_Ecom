import Product from "../models/Product.js";

export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;  // search query
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    if (!q || q.trim() === "") {
      return res.json({ products: [] });
    }

    // ⭐ Perform text search
    const products = await Product.find(
      {
        $text: { $search: q },
        is_deleted: false
      }
    )
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Count total results
    const total = await Product.countDocuments({
      $text: { $search: q },
      is_deleted: false
    });

    res.json({
      query: q,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      products
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.json([]);
    }

    const suggestions = await Product.find({
      name: { $regex: q, $options: "i" },
      is_deleted: false
    })
      .select("name")
      .limit(5);

    res.json(suggestions);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
