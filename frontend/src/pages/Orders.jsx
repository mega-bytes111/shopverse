import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../utils/api";
import loadRazorpay from "../utils/loadRazorpay";

const CANCEL_REASONS = [
  "Ordered by mistake",
  "Found a better price elsewhere",
  "Delivery time is too long",
  "Change in delivery address",
  "Change of mind",
  "Other",
];

const statusBadgeClass = (status) => {
  switch (status) {
    case "Payment Pending":
      return "bg-orange-50 text-orange-800 border-orange-200";
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

const Orders = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  // cancel modal state
  const [showCancel, setShowCancel] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [note, setNote] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const [payLoadingId, setPayLoadingId] = useState(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/orders/myorders");
      setOrders(data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders]);

  const openCancelModal = (orderId) => {
    setCancelOrderId(orderId);
    setReason(CANCEL_REASONS[0]);
    setNote("");
    setShowCancel(true);
  };

  const submitCancel = async () => {
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }

    try {
      setCancelLoading(true);
      await api.put(`/orders/${cancelOrderId}/cancel`, { reason, note });
      toast.success("Order cancelled");
      setShowCancel(false);
      setCancelOrderId(null);
      await loadOrders();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Cancel failed");
    } finally {
      setCancelLoading(false);
    }
  };

  // ✅ Retry payment for pending Razorpay orders
  const payNow = async (mongoOrderId) => {
    setPayLoadingId(mongoOrderId);
    try {
      const sdkOk = await loadRazorpay();
      if (!sdkOk) {
        toast.error("Razorpay SDK failed to load");
        return;
      }

      const rp = await api.post("/payment/razorpay", { orderId: mongoOrderId });
      const { razorpayOrderId, amount, currency, keyId } = rp.data;

      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "ShopVerse",
        description: "Complete Payment",
        order_id: razorpayOrderId,
        theme: { color: "#2563eb" },
        handler: async function (response) {
          await api.post("/payment/razorpay/verify", {
            orderId: mongoOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          toast.success("Payment successful! Order confirmed.");
          await loadOrders();
        },
        modal: {
          ondismiss: function () {
            toast("Payment cancelled.", { icon: "ℹ️" });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (res) {
        console.log("Razorpay payment.failed:", res);
        toast.error(res?.error?.description || "Payment failed");
      });

      rzp.open();
    } catch (err) {
      console.log("PayNow error:", err);
      toast.error(err?.response?.data?.message || "Payment failed");
    } finally {
      setPayLoadingId(null);
    }
  };

  return (
    <div className="container max-w-6xl py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">My Orders</h1>
          <p className="text-sm text-gray-500">Track and manage your orders</p>
        </div>

        <Link
          to="/products"
          className="rounded-xl border bg-white px-4 py-2 font-semibold hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
      </div>

      {loading && <p className="mt-6 text-gray-600">Loading...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      {!loading && !error && sortedOrders.length === 0 && (
        <div className="mt-8 rounded-2xl border bg-white p-8 text-center">
          <p className="font-semibold text-gray-800">No orders found</p>
        </div>
      )}

      {!loading && !error && sortedOrders.length > 0 && (
        <div className="mt-6 space-y-4">
          {sortedOrders.map((o) => (
            <div key={o._id} className="rounded-2xl border bg-white p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-bold text-gray-900 break-all">{o._id}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 font-semibold ${statusBadgeClass(o.orderStatus)}`}>
                      {o.orderStatus}
                    </span>

                    <span className={`inline-flex items-center rounded-full border px-3 py-1 font-semibold ${paymentBadgeClass(o.paymentMethod)}`}>
                      {o.paymentMethod}
                      {o.paymentInfo?.status === "paid" ? " • Paid" : ""}
                    </span>

                    <span className="text-gray-600">
                      Placed: {new Date(o.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-extrabold">₹{o.totalPrice}</p>

                  <div className="mt-4 flex gap-2 justify-end flex-wrap">
                    <Link to={`/orders/${o._id}`}>
                      <button className="rounded-xl bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700">
                        View Details
                      </button>
                    </Link>

                    {/* ✅ Pay Now if pending */}
                    {o.orderStatus === "Payment Pending" && o.paymentMethod === "Razorpay" && (
                      <button
                        onClick={() => payNow(o._id)}
                        disabled={payLoadingId === o._id}
                        className="rounded-xl bg-indigo-600 text-white px-4 py-2 font-semibold hover:bg-indigo-700 disabled:bg-gray-300"
                      >
                        {payLoadingId === o._id ? "Opening..." : "Pay Now"}
                      </button>
                    )}

                    {/* ✅ Cancel allowed for Processing + Payment Pending */}
                    {["Processing", "Payment Pending"].includes(o.orderStatus) && (
                      <button
                        onClick={() => openCancelModal(o._id)}
                        className="rounded-xl bg-red-50 text-red-700 px-4 py-2 font-semibold hover:bg-red-100"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {o.orderStatus === "Cancelled" && (o.cancelReason || o.cancelNote) && (
                <div className="mt-4 rounded-xl border bg-red-50 p-4 text-sm">
                  <p className="font-semibold text-red-700">Cancellation</p>
                  <p className="mt-1 text-red-800">
                    <b>Reason:</b> {o.cancelReason || "—"}
                  </p>
                  {o.cancelNote ? (
                    <p className="mt-1 text-red-800">
                      <b>Note:</b> {o.cancelNote}
                    </p>
                  ) : null}
                  {o.cancelledAt ? (
                    <p className="mt-1 text-xs text-red-700/80">
                      Cancelled at: {new Date(o.cancelledAt).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6">
            <h3 className="text-lg font-extrabold">Cancel Order</h3>
            <p className="mt-1 text-sm text-gray-500">
              Please select a reason to cancel this order.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Reason *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {CANCEL_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Additional note (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Write short note..."
                  className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCancel(false)}
                  className="rounded-xl border px-4 py-2 font-semibold hover:bg-gray-50"
                  disabled={cancelLoading}
                >
                  Close
                </button>

                <button
                  onClick={submitCancel}
                  className="rounded-xl bg-red-600 text-white px-4 py-2 font-semibold hover:bg-red-700 disabled:bg-gray-300"
                  disabled={cancelLoading}
                >
                  {cancelLoading ? "Cancelling..." : "Submit & Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;