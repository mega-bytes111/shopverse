import { NavLink } from "react-router-dom";

const AdminSubNav = () => {
  const tabClass = ({ isActive }) =>
    `px-4 py-2 rounded-xl text-sm font-semibold transition border ${
      isActive
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
    }`;

  return (
    <div className="flex flex-wrap gap-2">
      <NavLink to="/admin" className={tabClass}>
        Dashboard
      </NavLink>
      <NavLink to="/admin/products" className={tabClass}>
        Products
      </NavLink>
      <NavLink to="/admin/products/new" className={tabClass}>
        Add Product
      </NavLink>
      <NavLink to="/admin/orders" className={tabClass}>
        Orders
      </NavLink>
    </div>
  );
};

export default AdminSubNav;