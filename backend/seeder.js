const dotenv = require("dotenv");
const connectDB = require("./config/db");

const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // 1) Admin ensure (seller required for product)
    const adminEmail = "admin@shopverse.com";
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = await User.create({
        name: "ShopVerse Admin",
        email: adminEmail,
        password: "admin123",
        role: "admin",
      });
      console.log("✅ Admin created:", adminEmail, "/ admin123");
    } else {
      console.log("ℹ️ Admin already exists:", adminEmail);
    }

    // 2) Reset categories & products (users ko touch nahi karega)
    await Category.deleteMany({});
    await Product.deleteMany({});

    // 3) Create categories
    const categories = await Category.create([
      { name: "Electronics", description: "Electronic items" },
      { name: "Fashion", description: "Clothes & accessories" },
      { name: "Home & Kitchen", description: "Home essentials" },
    ]);

    // 4) Helper image (http url)
    const img = (id) => ({
      public_id: `seed_${id}`,
      url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60",
    });

    // 5) Create products
    await Product.insertMany([
      {
        name: "Smart Watch Pro",
        description: "Premium smartwatch with fitness tracking.",
        price: 5999,
        discountPrice: 3999,
        images: [img(1)],
        category: categories[0]._id,
        brand: "TechPro",
        stock: 25,
        seller: admin._id,
        tags: ["watch", "smartwatch"],
        specifications: [{ key: "Battery", value: "7 days" }],
      },
      {
        name: "Wireless Earbuds",
        description: "Noise cancelling earbuds with long battery.",
        price: 2999,
        discountPrice: 1999,
        images: [img(2)],
        category: categories[0]._id,
        brand: "SoundWave",
        stock: 40,
        seller: admin._id,
        tags: ["audio", "earbuds"],
        specifications: [{ key: "Bluetooth", value: "5.3" }],
      },
      {
        name: "Men's Casual T-Shirt",
        description: "Cotton t-shirt, comfortable fit.",
        price: 999,
        discountPrice: 699,
        images: [img(3)],
        category: categories[1]._id,
        brand: "UrbanWear",
        stock: 100,
        seller: admin._id,
        tags: ["tshirt", "fashion"],
        specifications: [{ key: "Fabric", value: "100% Cotton" }],
      },
      {
        name: "Non-stick Cookware Set",
        description: "7-piece non-stick cookware set.",
        price: 4999,
        discountPrice: 3499,
        images: [img(4)],
        category: categories[2]._id,
        brand: "KitchenX",
        stock: 15,
        seller: admin._id,
        tags: ["kitchen", "cookware"],
        specifications: [{ key: "Pieces", value: "7" }],
      },
    ]);

    console.log("✅ Categories & Products seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedData();