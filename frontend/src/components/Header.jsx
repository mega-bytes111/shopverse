// src/components/Header.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import toast from "react-hot-toast";
import { clearWishlistState } from "../redux/slices/wishlistSlice";

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { totalQty } = useSelector((s) => s.cart);
  const { ids } = useSelector((s) => s.wishlist); // ✅ wishlist count

  const navClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${
      isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
    }`;

  const onLogout = () => {
    dispatch(clearWishlistState());
    dispatch(logout());
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="container max-w-6xl h-16 flex items-center justify-between gap-4">
        <Link to="/" className="text-xl font-extrabold text-blue-600">
          ShopVerse
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>

          <NavLink to="/products" className={navClass}>
            Products
          </NavLink>

          <NavLink to="/cart" className={navClass}>
            Cart{" "}
            <span className="ml-1 text-xs text-gray-500">({totalQty || 0})</span>
          </NavLink>

          {isAuthenticated ? (
            <>
              {/* ✅ Wishlist */}
              <NavLink to="/wishlist" className={navClass}>
                Wishlist{" "}
                <span className="ml-1 text-xs text-gray-500">
                  ({ids?.length || 0})
                </span>
              </NavLink>

              {user?.role === "admin" && (
                <NavLink to="/admin" className={navClass}>
                  Admin
                </NavLink>
              )}

              <NavLink to="/orders" className={navClass}>
                Orders
              </NavLink>

              <NavLink to="/addresses" className={navClass}>
                Addresses
              </NavLink>

              <NavLink to="/profile" className={navClass}>
                Profile
              </NavLink>

              <span className="ml-2 hidden md:inline text-sm text-gray-600">
                Hi, <b className="text-gray-900">{user?.name}</b>
              </span>

              <button
                onClick={onLogout}
                className="ml-2 px-3 py-2 rounded-md text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navClass}>
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;