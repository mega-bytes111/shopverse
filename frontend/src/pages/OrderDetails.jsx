// src/pages/OrderDetails.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../utils/api";

const statusBadgeClass = (status) => {
  switch (status) {
    case "Processing":
      return "bg-yellow-50 text-yellow-800 border-yellow-200";
    case "Confirmed":
      return "bg-blue-50 text-blue-800 border-blue-200";
    case "Shipped":
      return "bg-purple-50 text-purple-800 border-purple-200";
    case "Delivered":
      return "bg-green-50 text-green-800 border-green-200";
    case "Cancelled":
      return "bg-red-50 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const paymentBadgeClass = (method) => {
  if (method === "Razorpay") return "bg-indigo-50 text-indigo-800 border-indigo-200";
  if (method === "COD") return "bg-gray-100 text-gray-800 border-gray-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
};

const OrderDetails = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  const itemsCount = useMemo(() => {
    return (order?.orderItems || []).reduce((acc, it) => acc + (it.quantity || 0), 0);
  }, [order]);

  if (loading) return <div className="container max-w-6xl py-10">Loading...</div>;
  if (error) return <div className="container max-w-6xl py-10 text-red-600">{error}</div>;
  if (!order) return null;

  return (
    <div className="container max-w-6xl py-6">
      <Link to="/orders" className="text-sm text-blue-600 hover:underline">
        ← Back to Orders
      </Link>

      <div className="mt-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Order Details</h1>
          <p className="text-sm text-gray-500 break-all">{order._id}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${statusBadgeClass(
              order.orderStatus
            )}`}
          >
            {order.orderStatus}
          </span>

          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${paymentBadgeClass(
              order.paymentMethod
            )}`}
          >
            {order.paymentMethod}
            {order.paymentInfo?.status === "paid" ? " • Paid" : ""}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary */}
        <div className="rounded-2xl border bg-white p-6 lg:col-span-2">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm text-gray-500">Placed</p>
              <p className="font-semibold text-gray-900">
                {new Date(order.createdAt).toLocaleString()}
              </p>

              <p className="mt-3 text-sm text-gray-500">Payment</p>
              <p className="font-semibold text-gray-900">
                Method: <b>{order.paymentMethod}</b>
              </p>

              {order.paymentInfo?.status && (
                <p className="mt-1 text-sm text-gray-700">
                  Status: <b>{order.paymentInfo.status}</b>
                </p>
              )}

              {order.paymentInfo?.id && (
                <p className="mt-1 text-xs text-gray-500 break-all">
                  Payment ID: {order.paymentInfo.id}
                </p>
              )}

              {order.paymentInfo?.paidAt && (
                <p className="mt-1 text-xs text-gray-500">
                  Paid At: {new Date(order.paymentInfo.paidAt).toLocaleString()}
                </p>
              )}

              {/* ✅ Cancellation details */}
              {order.orderStatus === "Cancelled" && (
                <div className="mt-4 rounded-xl border bg-red-50 p-4 text-sm">
                  <p className="font-semibold text-red-700">Cancellation</p>
                  <p className="mt-1 text-red-800">
                    <b>Reason:</b> {order.cancelReason || "—"}
                  </p>
                  {order.cancelNote ? (
                    <p className="mt-1 text-red-800">
                      <b>Note:</b> {order.cancelNote}
                    </p>
                  ) : null}
                  {order.cancelledAt ? (
                    <p className="mt-1 text-xs text-red-700/80">
                      Cancelled at:{" "}
                      {new Date(order.cancelledAt).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              )}
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-extrabold">₹{order.totalPrice}</p>
              <p className="mt-1 text-sm text-gray-600">
                Items: <b>{itemsCount}</b>
              </p>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            <h2 className="text-lg font-extrabold">Items</h2>

            <div className="mt-3 space-y-3">
              {order.orderItems.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-4 rounded-xl border p-4"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900">{it.name}</p>
                    <p className="text-sm text-gray-600">
                      Qty: <b>{it.quantity}</b> • Price: ₹{it.price}
                    </p>
                  </div>
                  <p className="font-extrabold">₹{it.price * it.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Address + Price breakdown */}
        <div className="rounded-2xl border bg-white p-6 h-fit">
          <h2 className="text-lg font-extrabold">Shipping Address</h2>

          <div className="mt-3 text-sm text-gray-700 space-y-1">
            <p className="font-bold text-gray-900">
              {order.shippingAddress.fullName} ({order.shippingAddress.phone})
            </p>
            <p>
              {order.shippingAddress.addressLine1}{" "}
              {order.shippingAddress.addressLine2}
            </p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
              {order.shippingAddress.pincode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>

          <div className="mt-6 border-t pt-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Items</span>
              <span className="font-bold">₹{order.itemsPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="font-bold">₹{order.taxPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-bold">₹{order.shippingPrice}</span>
            </div>
            <div className="h-px bg-gray-200" />
            <div className="flex justify-between text-base">
              <span className="font-extrabold">Total</span>
              <span className="font-extrabold">₹{order.totalPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;