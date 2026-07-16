const Product = require('../models/Product');
const Category = require('../models/Category');
const { validationResult } = require('express-validator');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res, next) => {
    try {
        const { category, brand, minPrice, maxPrice, search, sort, page = 1, limit = 12 } = req.query;

        // Build filter object
        let filter = { isActive: true };

        if (category) filter.category = category;
        if (brand) filter.brand = brand;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = minPrice;
            if (maxPrice) filter.price.$lte = maxPrice;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Build sort object
        let sortObj = { createdAt: -1 };
        if (sort) {
            if (sort === 'price-low') sortObj = { price: 1 };
            if (sort === 'price-high') sortObj = { price: -1 };
            if (sort === 'rating') sortObj = { ratings: -1 };
            if (sort === 'newest') sortObj = { createdAt: -1 };
        }

        // Execute query
        const products = await Product.find(filter)
            .populate('category', 'name')
            .sort(sortObj)
            .limit(limit * 1)
            .skip(skip)
            .exec();

        // Total count
        const total = await Product.countDocuments(filter);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
            data: products
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('reviews.user', 'name avatar');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, description, price, discountPrice, category, brand, stock, specifications, tags } = req.body;

        // Check if product already exists
        let product = await Product.findOne({ name });
        if (product) {
            return res.status(400).json({
                success: false,
                message: 'Product already exists'
            });
        }

        // Handle image uploads
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => ({
                public_id: file.filename,
                url: `/uploads/${file.filename}`
            }));
        }

        product = new Product({
            name,
            description,
            price,
            discountPrice: discountPrice || 0,
            category,
            brand,
            stock,
            images,
            specifications: specifications ? JSON.parse(specifications) : [],
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            seller: req.user.id
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
    try {
        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const { name, description, price, discountPrice, category, brand, stock, specifications, tags } = req.body;

        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = price;
        if (discountPrice !== undefined) product.discountPrice = discountPrice;
        if (category) product.category = category;
        if (brand) product.brand = brand;
        if (stock !== undefined) product.stock = stock;
        if (specifications) product.specifications = JSON.parse(specifications);
        if (tags) product.tags = tags.split(',').map(tag => tag.trim());

        // Handle new images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => ({
                public_id: file.filename,
                url: `/uploads/${file.filename}`
            }));
            product.images = [...product.images, ...newImages];
        }

        await product.save();

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.addReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;

        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user already reviewed
        const existingReview = product.reviews.find(review => review.user.toString() === req.user.id);

        if (existingReview) {
            // Update existing review
            existingReview.rating = rating;
            existingReview.comment = comment;
        } else {
            // Add new review
            product.reviews.push({
                user: req.user.id,
                name: req.user.name,
                rating,
                comment
            });
        }

        // Calculate average rating
        product.calculateAverageRating();

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isFeatured: true, isActive: true })
            .limit(10)
            .populate('category', 'name');

        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
exports.getProductsByCategory = async (req, res, next) => {
    try {
        const products = await Product.find({ 
            category: req.params.categoryId,
            isActive: true 
        })
            .populate('category', 'name')
            .limit(20);

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        next(error);
    }
};