const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true,
        maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Please provide product description']
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        min: 0
    },
    discountPrice: {
        type: Number,
        min: 0,
        default: 0
    },
    images: [{
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please provide product category']
    },
    brand: {
        type: String,
        required: [true, 'Please provide brand name']
    },
    stock: {
        type: Number,
        required: [true, 'Please provide stock quantity'],
        min: 0,
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    ratings: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [reviewSchema],
    specifications: [{
        key: String,
        value: String
    }],
    tags: [String],
    isFeatured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate average rating
productSchema.methods.calculateAverageRating = function() {
    if (this.reviews.length === 0) {
        this.ratings = 0;
        this.numOfReviews = 0;
    } else {
        const totalRating = this.reviews.reduce((acc, review) => acc + review.rating, 0);
        this.ratings = (totalRating / this.reviews.length).toFixed(1);
        this.numOfReviews = this.reviews.length;
    }
};

module.exports = mongoose.model('Product', productSchema);