const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const sendEmail = require("../utils/sendEmail");
const {
  orderPlacedTemplate,
  orderDeliveredTemplate,
} = require("../utils/orderEmailTemplates");

// ===============================
// ✅ CREATE ORDER
// ===============================
exports.createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items",
      });
    }

    const order = new Order({
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      user: req.user.id,
      orderStatus:
        paymentMethod === "Razorpay"
          ? "Payment Pending"
          : "Processing",
    });

    // ✅ Reduce stock ONLY for COD
    if (paymentMethod === "COD") {
      await Promise.all(
        orderItems.map(async (item) => {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock -= item.quantity;
            product.sold += item.quantity;
            await product.save();
          }
        })
      );
    }

    const createdOrder = await order.save();

    // ✅ SEND EMAIL (FIXED - no setImmediate)
    try {
      const dbUser = await User.findById(req.user.id).select("name email");

      const expectedDelivery = new Date(
        Date.now() + 5 * 24 * 60 * 60 * 1000
      );

      const html = orderPlacedTemplate({
        appName: process.env.APP_NAME || "ShopVerse",
        order: createdOrder,
        user: dbUser,
        frontendUrl: process.env.FRONTEND_URL,
        expectedDelivery,
      });

      await sendEmail({
        email: dbUser.email,
        subject: `✅ Order Placed - ${createdOrder._id}`,
        html: html, // 🔥 IMPORTANT FIX
      });

      console.log("✅ Order placed email sent");
    } catch (e) {
      console.log("❌ Order email failed:", e);
    }

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: createdOrder,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// ✅ GET MY ORDERS
// ===============================
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// ✅ GET SINGLE ORDER
// ===============================
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("orderItems.product")
      .populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// ✅ UPDATE ORDER (ADMIN)
// ===============================
exports.updateOrder = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const previousStatus = order.orderStatus;

    if (orderStatus === "Delivered") {
      order.deliveredAt = new Date();
    }

    order.orderStatus = orderStatus;
    await order.save();

    // ✅ SEND DELIVERED EMAIL (FIXED)
    if (
      orderStatus === "Delivered" &&
      previousStatus !== "Delivered"
    ) {
      try {
        const dbUser = await User.findById(order.user).select("name email");

        const html = orderDeliveredTemplate({
          appName: process.env.APP_NAME || "ShopVerse",
          order,
          user: dbUser,
          frontendUrl: process.env.FRONTEND_URL,
        });

        await sendEmail({
          email: dbUser.email,
          subject: `🎉 Delivered - Order ${order._id}`,
          html: html, // 🔥 IMPORTANT FIX
        });

        console.log("✅ Delivered email sent");
      } catch (e) {
        console.log("❌ Delivered email failed:", e);
      }
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// ✅ CANCEL ORDER
// ===============================
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason, note } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (
      !["Processing", "Payment Pending"].includes(order.orderStatus)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Can only cancel pending orders (Processing / Payment Pending)",
      });
    }

    // ✅ Restore stock ONLY for COD
    if (order.paymentMethod === "COD") {
      await Promise.all(
        order.orderItems.map(async (item) => {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock += item.quantity;
            product.sold -= item.quantity;
            await product.save();
          }
        })
      );
    }

    order.orderStatus = "Cancelled";
    order.cancelReason = reason;
    order.cancelNote = note || "";
    order.cancelledAt = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// ✅ GET ALL ORDERS (ADMIN)
// ===============================
exports.getAllOrders = async (req, res, next) => {
  try {
    const { orderStatus, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (orderStatus) filter.orderStatus = orderStatus;

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("orderItems.product", "name price")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip)
      .exec();

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};