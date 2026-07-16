import { NavLink } from "react-router-dom";
import { FaTachometerAlt, FaBoxOpen, FaPlusCircle, FaShoppingBag } from "react-icons/fa";

const AdminSidebar = ({ onNavigate }) => {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition ${
      isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <aside className="h-full w-72 bg-white border-r">
      <div className="h-16 px-5 flex items-center border-b">
        <div className="leading-tight">
          <p className="text-xs font-bold text-gray-500">ADMIN PANEL</p>
          <p className="text-lg font-extrabold text-blue-600">ShopVerse</p>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        <NavLink to="/admin" end className={linkClass} onClick={onNavigate}>
          <FaTachometerAlt />
          Dashboard
        </NavLink>

        <NavLink to="/admin/products" className={linkClass} onClick={onNavigate}>
          <FaBoxOpen />
          Products
        </NavLink>

        <NavLink to="/admin/products/new" className={linkClass} onClick={onNavigate}>
          <FaPlusCircle />
          Add Product
        </NavLink>

        <NavLink to="/admin/orders" className={linkClass} onClick={onNavigate}>
          <FaShoppingBag />
          Orders
        </NavLink>

        <div className="pt-3 mt-3 border-t">
          <NavLink to="/products" className={linkClass} onClick={onNavigate}>
            <FaBoxOpen />
            Go to Store
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;