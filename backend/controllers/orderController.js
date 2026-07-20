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
exports.createOrder = async (req, res) => {
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
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      orderStatus:
        paymentMethod === "Razorpay"
          ? "Payment Pending"
          : "Processing",
    });

    // ✅ Reduce stock for COD
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

    // 🔥 NON-BLOCKING EMAIL
    (async () => {
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
          html,
        });

        console.log("✅ Order placed email sent");
      } catch (e) {
        console.log("❌ Email error:", e.message);
      }
    })();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: createdOrder,
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// ✅ GET MY ORDERS
// ===============================
exports.getMyOrders = async (req, res) => {
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
    console.error("❌ Get my orders error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// ✅ GET SINGLE ORDER
// ===============================
exports.getOrder = async (req, res) => {
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
        message: "Not authorized",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("❌ Get order error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// ✅ UPDATE ORDER (ADMIN)
// ===============================
exports.updateOrder = async (req, res) => {
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
    const updatedOrder = await order.save();

    // 🔥 NON-BLOCKING DELIVERED EMAIL
    if (orderStatus === "Delivered" && previousStatus !== "Delivered") {
      (async () => {
        try {
          const dbUser = await User.findById(order.user).select("name email");

          const html = orderDeliveredTemplate({
            appName: process.env.APP_NAME || "ShopVerse",
            order: updatedOrder,
            user: dbUser,
            frontendUrl: process.env.FRONTEND_URL,
          });

          await sendEmail({
            email: dbUser.email,
            subject: `🎉 Delivered - Order ${updatedOrder._id}`,
            html,
          });

          console.log("✅ Delivered email sent");
        } catch (e) {
          console.log("❌ Email error:", e.message);
        }
      })();
    }

    res.status(200).json({
      success: true,
      message: "Order updated",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Update order error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// ✅ CANCEL ORDER
// ===============================
exports.cancelOrder = async (req, res) => {
  try {
    const { reason, note } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason required",
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

    if (!["Processing", "Payment Pending"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel this order",
      });
    }

    // ✅ Restore stock (COD)
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
      message: "Order cancelled",
    });
  } catch (error) {
    console.error("❌ Cancel order error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// ✅ GET ALL ORDERS (ADMIN)
// ===============================
exports.getAllOrders = async (req, res) => {
  try {
    const { orderStatus, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (orderStatus) filter.orderStatus = orderStatus;

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("orderItems.product", "name price")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: orders,
    });
  } catch (error) {
    console.error("❌ Get all orders error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};