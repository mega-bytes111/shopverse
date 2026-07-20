const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const sendEmail = require("../utils/sendEmail");
const {
  orderPlacedTemplate,
  orderDeliveredTemplate,
} = require("../utils/orderEmailTemplates");

// 🟢 CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
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
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // 🔥 NON-BLOCKING EMAIL (FAST + RELIABLE)
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

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: createdOrder,
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// 🟢 MARK ORDER AS DELIVERED
exports.markOrderDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    // 🔥 NON-BLOCKING EMAIL
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

    return res.status(200).json({
      success: true,
      message: "Order marked as delivered",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Deliver order error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};