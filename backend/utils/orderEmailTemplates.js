const formatDate = (d) => new Date(d).toLocaleString("en-IN");
const formatINR = (n) => new Intl.NumberFormat("en-IN").format(Number(n || 0));

exports.orderPlacedTemplate = ({ appName, order, user, frontendUrl, expectedDelivery }) => {
  const itemsHtml = order.orderItems
    .map(
      (it) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${it.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">${it.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;">₹${formatINR(it.price)}</td>
      </tr>
    `
    )
    .join("");

  return `
  <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 16px;">
    <h2 style="margin:0;color:#111;">${appName} — Order Placed ✅</h2>
    <p style="color:#444;">Hi ${user.name}, your order has been placed successfully.</p>

    <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:12px;margin-top:12px;">
      <p style="margin:0;"><b>Order ID:</b> ${order._id}</p>
      <p style="margin:6px 0 0 0;"><b>Payment Method:</b> ${order.paymentMethod}</p>
      <p style="margin:6px 0 0 0;"><b>Order Status:</b> ${order.orderStatus}</p>
      <p style="margin:6px 0 0 0;"><b>Placed At:</b> ${formatDate(order.createdAt)}</p>
      <p style="margin:6px 0 0 0;"><b>Expected Delivery By:</b> ${formatDate(expectedDelivery)}</p>
    </div>

    <h3 style="margin-top:18px;">Items</h3>
    <table style="width:100%; border-collapse: collapse; border:1px solid #eee;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="text-align:left;padding:8px;">Product</th>
          <th style="text-align:left;padding:8px;">Qty</th>
          <th style="text-align:left;padding:8px;">Price</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div style="margin-top:14px;">
      <p style="margin:0;"><b>Total:</b> ₹${formatINR(order.totalPrice)}</p>
    </div>

    <div style="margin-top:18px;">
      <a href="${frontendUrl}/orders/${order._id}"
         style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:700;">
        View Order
      </a>
    </div>

    <p style="margin-top:18px;color:#6b7280;font-size:12px;">
      Thank you for shopping with ${appName}.
    </p>
  </div>
  `;
};

exports.orderDeliveredTemplate = ({ appName, order, user, frontendUrl }) => {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 16px;">
    <h2 style="margin:0;color:#111;">${appName} — Order Delivered 🎉</h2>
    <p style="color:#444;">Hi ${user.name}, your order has been delivered successfully.</p>

    <div style="background:#ecfdf5;border:1px solid #bbf7d0;border-radius:12px;padding:12px;margin-top:12px;">
      <p style="margin:0;"><b>Order ID:</b> ${order._id}</p>
      <p style="margin:6px 0 0 0;"><b>Delivered At:</b> ${formatDate(order.deliveredAt || new Date())}</p>
      <p style="margin:6px 0 0 0;"><b>Total:</b> ₹${formatINR(order.totalPrice)}</p>
    </div>

    <div style="margin-top:18px;">
      <a href="${frontendUrl}/orders/${order._id}"
         style="display:inline-block;background:#16a34a;color:white;text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:700;">
        View Order Details
      </a>
    </div>

    <p style="margin-top:18px;color:#6b7280;font-size:12px;">
      Thank you for shopping with ${appName}.
    </p>
  </div>
  `;
};