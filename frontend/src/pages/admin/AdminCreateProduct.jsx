import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../utils/api";
import AdminSubNav from "../../components/admin/AdminSubNav";

const AdminCreateProduct = () => {
  const navigate = useNavigate();

  const [catLoading, setCatLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    brand: "",
    stock: "",
    tags: "",
    specifications: "",
  });

  const [files, setFiles] = useState([]);

  const loadCategories = async () => {
    try {
      setCatLoading(true);
      const { data } = await api.get("/categories");
      setCategories(data.data || []);
      if ((data.data || []).length > 0) setForm((p) => ({ ...p, category: data.data[0]._id }));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load categories");
    } finally {
      setCatLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const onFiles = (e) => setFiles(Array.from(e.target.files || []));

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.description || !form.price || !form.category || !form.brand || !form.stock) {
      toast.error("Please fill all required fields");
      return;
    }

    if (form.specifications.trim()) {
      try {
        JSON.parse(form.specifications);
      } catch {
        toast.error("Specifications must be valid JSON array");
        return;
      }
    }

    try {
      setLoading(true);

      const fd = new FormData();
      Object.entries({
        name: form.name,
        description: form.description,
        price: form.price,
        discountPrice: form.discountPrice || 0,
        category: form.category,
        brand: form.brand,
        stock: form.stock,
      }).forEach(([k, v]) => fd.append(k, v));

      if (form.tags.trim()) fd.append("tags", form.tags);
      if (form.specifications.trim()) fd.append("specifications", form.specifications);
      files.slice(0, 5).forEach((f) => fd.append("images", f));

      await api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });

      toast.success("Product created");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Create product failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl py-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Admin Panel</p>
          <h1 className="text-2xl font-extrabold">Create Product</h1>
          <p className="text-sm text-gray-500">Add new item to catalog</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <AdminSubNav />
          <Link to="/admin/products" className="text-sm font-semibold text-blue-600 hover:underline">
            Back to Products
          </Link>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Product Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="e.g. Smart Watch Pro"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={4}
              className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Write product description..."
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Price *</label>
            <input
              name="price"
              value={form.price}
              onChange={onChange}
              className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="e.g. 5999"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Discount Price</label>
            <input
              name="discountPrice"
              value={form.discountPrice}
              onChange={onChange}
              className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="e.g. 3999"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Brand *</label>
            <input
              name="brand"
              value={form.brand}
              onChange={onChange}
              className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="e.g. TechPro"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Stock *</label>
            <input
              name="stock"
              value={form.stock}
              onChange={onChange}
              className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="e.g. 20"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={onChange}
              disabled={catLoading}
              className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Tags</label>
            <input
              name="tags"
              value={form.tags}
              onChange={onChange}
              className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="comma separated e.g. watch, smartwatch"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Specifications (JSON)</label>
            <textarea
              name="specifications"
              value={form.specifications}
              onChange={onChange}
              rows={3}
              className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              placeholder='e.g. [{"key":"Battery","value":"7 days"}]'
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Images (max 5)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={onFiles}
              className="mt-2 block w-full text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Selected: <b>{files.length}</b>
            </p>
          </div>
        </div>

        <button
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600"
        >
          {loading ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
};

export default AdminCreateProduct;