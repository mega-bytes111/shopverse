const dotenv = require("dotenv");
const connectDB = require("./config/db");

const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");

dotenv.config();

const slugify = (s) =>
  s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const IMG = [
  // 20 unique Unsplash URLs (direct images)
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=60", // watch
  "https://images.unsplash.com/photo-1518441902117-f0a4a35f18b7?w=1200&auto=format&fit=crop&q=60", // earbuds
  "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=1200&auto=format&fit=crop&q=60", // speaker
  "https://images.unsplash.com/photo-1612810436541-336d6f21f7ef?w=1200&auto=format&fit=crop&q=60", // keyboard
  "https://images.unsplash.com/photo-1527814050087-3793815479db?w=1200&auto=format&fit=crop&q=60", // mouse

  "https://images.unsplash.com/photo-1520975958221-5b7f4bbd9b3d?w=1200&auto=format&fit=crop&q=60", // tshirt
  "https://images.unsplash.com/photo-1520975682031-ae3f0c1b1c73?w=1200&auto=format&fit=crop&q=60", // hoodie
  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=1200&auto=format&fit=crop&q=60", // jeans
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=60", // sneakers
  "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200&auto=format&fit=crop&q=60", // sunglasses

  "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&auto=format&fit=crop&q=60", // cookware
  "https://images.unsplash.com/photo-1625944525533-473f1a3c3a9b?w=1200&auto=format&fit=crop&q=60", // airfryer
  "https://images.unsplash.com/photo-1586201375754-1421e0aa2ef1?w=1200&auto=format&fit=crop&q=60", // mixer
  "https://images.unsplash.com/photo-1616627983922-4c3fd7f7c0de?w=1200&auto=format&fit=crop&q=60", // bedsheet
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200&auto=format&fit=crop&q=60", // lamp

  "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=1200&auto=format&fit=crop&q=60", // yoga mat
  "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1200&auto=format&fit=crop&q=60", // dumbbell
  "https://images.unsplash.com/photo-1590487988256-9ed24133863d?w=1200&auto=format&fit=crop&q=60", // bands
  "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1200&auto=format&fit=crop&q=60", // football
  "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=1200&auto=format&fit=crop&q=60", // cricket
];

const PRODUCTS = [
  // Electronics (5)
  { categoryName: "Electronics", name: "Smart Watch Pulse Pro", price: 6999, discountPrice: 3999, brand: "TechPro", stock: 40, description: "AMOLED display, fitness tracking, water resistance." },
  { categoryName: "Electronics", name: "Wireless Earbuds ANC Lite", price: 3499, discountPrice: 1999, brand: "SoundWave", stock: 60, description: "ANC, deep bass, long battery backup." },
  { categoryName: "Electronics", name: "Bluetooth Speaker Boom Mini", price: 2499, discountPrice: 1499, brand: "BoomBeat", stock: 55, description: "Portable speaker with punchy bass." },
  { categoryName: "Electronics", name: "Mechanical Keyboard RGB TKL", price: 4999, discountPrice: 3299, brand: "KeyNova", stock: 30, description: "Tactile switches, RGB, TKL layout." },
  { categoryName: "Electronics", name: "Gaming Mouse RGB Pro", price: 1999, discountPrice: 1299, brand: "GameX", stock: 80, description: "High DPI, ergonomic grip, RGB." },

  // Fashion (5)
  { categoryName: "Fashion", name: "Men's Cotton T-Shirt Classic Fit", price: 999, discountPrice: 699, brand: "UrbanWear", stock: 120, description: "Soft breathable cotton for daily comfort." },
  { categoryName: "Fashion", name: "Women's Oversized Hoodie Winter", price: 2499, discountPrice: 1599, brand: "StreetMode", stock: 55, description: "Warm hoodie with premium fleece." },
  { categoryName: "Fashion", name: "Slim Fit Denim Jeans Stretch", price: 2699, discountPrice: 1899, brand: "DenimCo", stock: 75, description: "Stretchable jeans with premium stitching." },
  { categoryName: "Fashion", name: "Everyday Sneakers Comfort Walk", price: 3999, discountPrice: 2499, brand: "RunWay", stock: 65, description: "Lightweight sneakers with anti-slip sole." },
  { categoryName: "Fashion", name: "UV400 Sunglasses Polarized", price: 1499, discountPrice: 899, brand: "ShadePro", stock: 90, description: "UV400 protection polarized sunglasses." },

  // Home & Kitchen (5)
  { categoryName: "Home & Kitchen", name: "Non-stick Cookware Set 7pcs Premium", price: 4999, discountPrice: 3499, brand: "KitchenX", stock: 25, description: "Premium non-stick cookware set." },
  { categoryName: "Home & Kitchen", name: "Air Fryer Digital 4L", price: 8999, discountPrice: 6499, brand: "AirChef", stock: 18, description: "Healthy frying, presets, fast cooking." },
  { categoryName: "Home & Kitchen", name: "Mixer Grinder 750W Turbo", price: 4299, discountPrice: 2999, brand: "MixMate", stock: 22, description: "Powerful mixer grinder for daily use." },
  { categoryName: "Home & Kitchen", name: "Bedsheet Double Size Soft Microfiber", price: 1299, discountPrice: 799, brand: "HomeNest", stock: 100, description: "Soft microfiber bedsheet, long-lasting colors." },
  { categoryName: "Home & Kitchen", name: "LED Desk Lamp Touch Control", price: 1799, discountPrice: 1099, brand: "Brightly", stock: 45, description: "Adjustable brightness with touch controls." },

  // Sports & Fitness (5)
  { categoryName: "Sports & Fitness", name: "Yoga Mat Anti-slip 6mm", price: 999, discountPrice: 649, brand: "FitFlex", stock: 120, description: "Non-slip mat with comfortable cushioning." },
  { categoryName: "Sports & Fitness", name: "Adjustable Dumbbells Home Gym", price: 8999, discountPrice: 6999, brand: "PowerLift", stock: 20, description: "Adjustable dumbbells for strength training." },
  { categoryName: "Sports & Fitness", name: "Resistance Bands Pack (5 levels)", price: 799, discountPrice: 499, brand: "FlexBand", stock: 200, description: "5 resistance levels for full-body workout." },
  { categoryName: "Sports & Fitness", name: "Football Size 5 Training Ball", price: 1299, discountPrice: 899, brand: "GoalMax", stock: 60, description: "Durable football for training and play." },
  { categoryName: "Sports & Fitness", name: "Cricket Bat Kashmir Willow Practice", price: 2499, discountPrice: 1799, brand: "CrickPro", stock: 35, description: "Kashmir willow bat for practice." },
];

async function seedProducts() {
  try {
    await connectDB();

    const shouldReset = process.argv.includes("--reset");
    if (!shouldReset) {
      console.log("⚠️ Please run with --reset for clean unique catalog:");
      console.log("   npm run seed:products -- --reset");
      process.exit(0);
    }

    // ✅ Hard reset: Products clear (recommended for removing old repeated images)
    await Product.deleteMany({});
    console.log("🧹 Cleared old products");

    // Ensure admin seller exists
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
    }

    // Ensure categories exist
    const categoryNames = [...new Set(PRODUCTS.map((p) => p.categoryName))];
    const categoryMap = {};

    for (const name of categoryNames) {
      let cat = await Category.findOne({ name });
      if (!cat) {
        cat = await Category.create({ name, description: `${name} products` });
      }
      categoryMap[name] = cat;
    }

    // Insert all products with unique images
    for (let i = 0; i < PRODUCTS.length; i++) {
      const p = PRODUCTS[i];

      await Product.create({
        name: p.name,
        description: p.description,
        price: p.price,
        discountPrice: p.discountPrice,
        images: [
          {
            public_id: `seed_${slugify(p.name)}`,
            url: IMG[i], // ✅ unique per product by index
          },
        ],
        category: categoryMap[p.categoryName]._id,
        brand: p.brand,
        stock: p.stock,
        tags: [],
        specifications: [],
        seller: admin._id,
        isActive: true,
      });
    }

    console.log(`✅ Seed complete. Inserted: ${PRODUCTS.length} products (unique images).`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seedProducts();