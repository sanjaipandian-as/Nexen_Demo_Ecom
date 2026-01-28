import Category from "../models/Category.js";

export const addCategory = async (req, res) => {
  try {
    const { name, displayOrder } = req.body;

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const icon = req.file ? req.file.path : null;

    const category = await Category.create({
      name,
      icon,
      displayOrder: displayOrder || 0
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
    // Sort by displayOrder ascending, then by name ascending
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    console.log(`Found ${categories.length} categories`);
    return res.json(categories);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, displayOrder } = req.body;

    const updated = await Category.findByIdAndUpdate(
      categoryId,
      {
        name,
        displayOrder,
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
