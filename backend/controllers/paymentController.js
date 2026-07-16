const Razorpay = require("razorpay");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const crypto = require("crypto");

const Order = require("../models/Order");
const Product = require("../models/Product"); // ✅ needed for stock update

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order (amount DB se aayega)
// @route   POST /api/payment/razorpay
// @access  Private
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    console.log("AUTH HEADER:", req.headers.authorization);
    const { orderId } = req.body; // MongoDB orderId

    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required" });
    }

    const dbOrder = await Order.findById(orderId);

    if (!dbOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Optional: only allow owner/admin
    if (dbOrder.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // ✅ Amount from DB (tamper-proof)
    const options = {
      amount: Math.round(dbOrder.totalPrice * 100), // paise
      currency: "INR",
      receipt: `shopverse_${dbOrder._id}`,
      payment_capture: 1,
      notes: {
        mongoOrderId: String(dbOrder._id),
      },
    };

    const rpOrder = await razorpay.orders.create(options);

    // Save Razorpay order id as "created" state
    dbOrder.paymentInfo = {
      ...(dbOrder.paymentInfo || {}),
      razorpayOrderId: rpOrder.id,
      status: "created",
    };

    await dbOrder.save();

    res.status(200).json({
      success: true,
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // frontend needs keyId
      orderId: dbOrder._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment (signature verify + stock update + confirm order)
// @route   POST /api/payment/razorpay/verify
// @access  Private
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature are required",
      });
    }

    const dbOrder = await Order.findById(orderId);

    if (!dbOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Optional: only allow owner/admin
    if (dbOrder.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // ✅ Signature verification (HMAC SHA256)
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // ✅ Payment verified => confirm order
    dbOrder.paymentMethod = "Razorpay";
    dbOrder.paymentInfo = {
      id: razorpay_payment_id,
      status: "paid",
      paidAt: new Date(),
      razorpayOrderId: razorpay_order_id,
      signature: razorpay_signature,
    };
    dbOrder.orderStatus = "Confirmed";

    // ✅ Reduce stock only after successful online payment
    for (const item of dbOrder.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock -= item.quantity;
        product.sold += item.quantity;
        await product.save();
      }
    }

    await dbOrder.save();

    res.status(200).json({
      success: true,
      message: "Payment verified & order confirmed",
    });
  } catch (error) {
    next(error);
  }
};

// -------------------- Stripe (as-is) --------------------

// @desc    Create Stripe payment intent
// @route   POST /api/payment/stripe
// @access  Private
exports.createStripePaymentIntent = async (req, res, next) => {
  try {
    const { totalPrice, orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalPrice * 100,
      currency: "inr",
      metadata: {
        orderId: orderId,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm Stripe payment
// @route   POST /api/payment/stripe/confirm
// @access  Private
exports.confirmStripePayment = async (req, res, next) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      let order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      order.paymentInfo = {
        id: paymentIntentId,
        status: "paid",
        paidAt: new Date(),
      };
      order.orderStatus = "Confirmed";

      await order.save();

      res.status(200).json({
        success: true,
        message: "Payment confirmed successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment failed",
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment status
// @route   GET /api/payment/status/:orderId
// @access  Private
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      paymentInfo: order.paymentInfo,
    });
  } catch (error) {
    next(error);
  }
};