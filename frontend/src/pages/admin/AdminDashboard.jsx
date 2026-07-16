import { Link } from "react-router-dom";
import AdminSubNav from "../../components/admin/AdminSubNav";

const AdminDashboard = () => {
  return (
    <div className="container max-w-6xl py-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">Admin Panel</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            ShopVerse Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage products, orders and store operations.
          </p>
        </div>

        <AdminSubNav />
      </div>

      {/* Top cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-xs font-bold text-gray-500">PRODUCTS</p>
          <h3 className="mt-2 text-lg font-extrabold">Manage Catalog</h3>
          <p className="mt-2 text-sm text-gray-600">
            Add, delete and view products.
          </p>
          <div className="mt-4 flex gap-2">
            <Link to="/admin/products" className="rounded-xl bg-gray-900 text-white px-4 py-2 font-semibold hover:bg-black">
              View
            </Link>
            <Link to="/admin/products/new" className="rounded-xl border px-4 py-2 font-semibold hover:bg-gray-50">
              Add
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-xs font-bold text-gray-500">ORDERS</p>
          <h3 className="mt-2 text-lg font-extrabold">Fulfillment</h3>
          <p className="mt-2 text-sm text-gray-600">
            Update order status and track deliveries.
          </p>
          <div className="mt-4">
            <Link to="/admin/orders" className="inline-block rounded-xl bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700">
              Manage Orders
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-sm">
          <p className="text-xs font-bold text-white/80">QUICK ACTION</p>
          <h3 className="mt-2 text-lg font-extrabold">Add New Product</h3>
          <p className="mt-2 text-sm text-white/90">
            Create a product with images & category.
          </p>
          <div className="mt-4">
            <Link to="/admin/products/new" className="inline-block rounded-xl bg-white text-blue-700 px-4 py-2 font-extrabold hover:bg-blue-50">
              + Create
            </Link>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-6 rounded-2xl border bg-white p-6">
        <p className="font-semibold text-gray-900">Tip</p>
        <p className="mt-1 text-sm text-gray-600">
          Admin orders page se status update karke shipping workflow manage karo.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;