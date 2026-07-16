const express = require("express");
const { getCategories, createCategory } = require("../controllers/categoryController");
const { protect, admin } = require("../middleware/auth");

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect, admin, createCategory);

module.exports = router;