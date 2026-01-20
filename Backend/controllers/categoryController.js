import Category from "../models/Category.js";

export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const icon = req.file ? req.file.path : null;

    const category = await Category.create({
      name,
      icon
    });

    return res.json({
      message: "Category created successfully",
      category
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    console.log("=== Hitting getCategories ===");
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    console.log(`Found ${categories.length} categories`);
    return res.json(categories);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;

    const updated = await Category.findByIdAndUpdate(
      categoryId,
      {
        name,
        icon: req.file ? req.file.path : undefined
      },
      { new: true }
    );

    return res.json({
      message: "Category updated",
      updated
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    await Category.findByIdAndUpdate(categoryId, { isActive: false });

    return res.json({
      message: "Category disabled"
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
