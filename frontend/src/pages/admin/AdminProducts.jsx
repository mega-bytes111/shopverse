import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../utils/api";
import { getImageUrl } from "../../utils/getImageUrl";
import AdminSubNav from "../../components/admin/AdminSubNav";

const AdminProducts = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/products", { params: { limit: 200, page: 1 } });
      setItems(data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const deleteProduct = async (id) => {
    const ok = confirm("Delete this product?");
    if (!ok) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="container max-w-6xl py-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Admin Panel</p>
          <h1 className="text-2xl font-extrabold">Products</h1>
          <p className="text-sm text-gray-500">View and manage your catalog</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <AdminSubNav />
          <Link to="/admin/products/new">
            <button className="rounded-xl bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700">
              + Add Product
            </button>
          </Link>
        </div>
      </div>

      {loading && <p className="mt-6 text-gray-600">Loading...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 overflow-x-auto rounded-2xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="p-4">Product</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                        <img
                          src={getImageUrl(p?.images?.[0]?.url)}
                          alt={p.name}
                          className="h-full w-full object-cover"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-500 break-all">{p._id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-gray-700">{p.brand}</td>
                  <td className="p-4 font-semibold">₹{p.price}</td>
                  <td className="p-4">
                    <span className={`font-semibold ${p.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                      {p.stock}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="inline-flex gap-2">
                      <Link to={`/products/${p._id}`}>
                        <button className="rounded-xl border px-3 py-2 font-semibold hover:bg-gray-50">
                          View
                        </button>
                      </Link>
                      <button
                        onClick={() => deleteProduct(p._id)}
                        className="rounded-xl bg-red-50 text-red-700 px-3 py-2 font-semibold hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td className="p-6 text-gray-600" colSpan={5}>
                    No products found.
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

export default AdminProducts;