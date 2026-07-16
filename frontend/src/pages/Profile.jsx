import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { logout } from "../redux/slices/authSlice";
import { clearWishlistState } from "../redux/slices/wishlistSlice";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((s) => s.auth);

  const onLogout = () => {
    dispatch(clearWishlistState());
    dispatch(logout());
    toast.success("Logged out");
    navigate("/login");
  };

  const firstLetter = (user?.name || "U").trim().charAt(0).toUpperCase();

  return (
    <>
      <Helmet>
        <title>ShopVerse | Profile</title>
      </Helmet>

      <div className="container max-w-6xl py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-600">Account</p>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              My Profile
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account and explore your activity.
            </p>
          </div>

          <button
            onClick={onLogout}
            className="w-full md:w-auto rounded-xl bg-red-50 text-red-700 px-5 py-2.5 font-semibold hover:bg-red-100"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile Card */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-extrabold">
                {firstLetter}
              </div>

              <div className="min-w-0">
                <p className="text-lg font-extrabold text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>

                <div className="mt-2">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                      user?.role === "admin"
                        ? "bg-purple-50 text-purple-700"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    {user?.role?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <Link
                to="/orders"
                className="rounded-xl border px-4 py-3 font-semibold hover:bg-gray-50"
              >
                My Orders →
              </Link>
              <Link
                to="/addresses"
                className="rounded-xl border px-4 py-3 font-semibold hover:bg-gray-50"
              >
                Manage Addresses →
              </Link>
              <Link
                to="/wishlist"
                className="rounded-xl border px-4 py-3 font-semibold hover:bg-gray-50"
              >
                Wishlist →
              </Link>

              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="rounded-xl bg-blue-600 text-white px-4 py-3 font-semibold hover:bg-blue-700"
                >
                  Go to Admin Panel →
                </Link>
              )}
            </div>
          </div>

          {/* Right: Account Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account info */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-gray-900">
                Account Information
              </h2>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border bg-gray-50 p-4">
                  <p className="text-xs font-bold text-gray-500">FULL NAME</p>
                  <p className="mt-1 font-extrabold text-gray-900">{user?.name}</p>
                </div>

                <div className="rounded-xl border bg-gray-50 p-4">
                  <p className="text-xs font-bold text-gray-500">EMAIL</p>
                  <p className="mt-1 font-extrabold text-gray-900">{user?.email}</p>
                </div>

                <div className="rounded-xl border bg-gray-50 p-4">
                  <p className="text-xs font-bold text-gray-500">ROLE</p>
                  <p className="mt-1 font-extrabold text-gray-900">
                    {user?.role}
                  </p>
                </div>

                <div className="rounded-xl border bg-gray-50 p-4">
                  <p className="text-xs font-bold text-gray-500">MEMBER SINCE</p>
                  <p className="mt-1 font-extrabold text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tips / Next actions */}
            <div className="rounded-2xl border bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-sm">
              <h2 className="text-lg font-extrabold">Quick Tip</h2>
              <p className="mt-2 text-sm text-white/90">
                Add a default address to speed up checkout, and keep your wishlist updated for faster purchases.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/addresses"
                  className="rounded-xl bg-white text-blue-700 px-4 py-2 font-extrabold hover:bg-blue-50"
                >
                  Set Default Address
                </Link>
                <Link
                  to="/products"
                  className="rounded-xl border border-white/30 px-4 py-2 font-extrabold hover:bg-white/10"
                >
                  Explore Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;