import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import { Link } from "react-router-dom";
import AdminSubNav from "../../components/admin/AdminSubNav";

const STATUSES = ["Payment Pending", "Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const AdminOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/orders", { params: { limit: 50, page: 1 } });
      setOrders(data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (orderId, orderStatus) => {
    try {
      await api.put(`/orders/${orderId}`, { orderStatus });
      toast.success("Order updated");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="container max-w-6xl py-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Admin Panel</p>
          <h1 className="text-2xl font-extrabold">Orders</h1>
          <p className="text-sm text-gray-500">Update statuses and track fulfillment</p>
        </div>

        <AdminSubNav />
      </div>

      {loading && <p className="mt-6 text-gray-600">Loading...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-t">
                  <td className="p-4">
                    <p className="font-bold text-gray-900 break-all">{o._id}</p>
                  </td>

                  <td className="p-4">
                    <p className="font-semibold">{o.user?.name}</p>
                    <p className="text-xs text-gray-500">{o.user?.email}</p>
                  </td>

                  <td className="p-4 font-semibold">₹{o.totalPrice}</td>

                  <td className="p-4">
                    <select
                      value={o.orderStatus}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>

                  <td className="p-4 text-gray-600">
                    {new Date(o.createdAt).toLocaleString()}
                  </td>

                  <td className="p-4 text-right">
                    <Link to={`/orders/${o._id}`}>
                      <button className="rounded-xl border px-3 py-2 font-semibold hover:bg-gray-50">
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td className="p-6 text-gray-600" colSpan={6}>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;