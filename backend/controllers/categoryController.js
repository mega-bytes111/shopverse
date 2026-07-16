const Category = require("../models/Category");

// GET /api/categories (public)
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    next(err);
  }
};

// POST /api/categories (admin)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const category = await Category.create({ name, description });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};