import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { loginUser } from "../redux/slices/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      toast.success("Login successful");
      navigate("/");
    } catch (msg) {
      toast.error(msg || "Login failed");
    }
  };

  return (
    <>
      <Helmet>
        <title>ShopVerse | Login</title>
      </Helmet>

      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-50 to-white flex items-center">
        <div className="container max-w-6xl py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div className="hidden lg:block">
            <h1 className="text-4xl font-extrabold text-gray-900">
              Login to <span className="text-blue-600">ShopVerse</span>
            </h1>
            <p className="mt-3 text-gray-600">
              Track orders, manage addresses, review products and enjoy a premium shopping flow.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border bg-white p-5">
                <p className="font-bold">Fast Checkout</p>
                <p className="text-sm text-gray-600 mt-1">Save address and order quickly</p>
              </div>
              <div className="rounded-2xl border bg-white p-5">
                <p className="font-bold">Secure Account</p>
                <p className="text-sm text-gray-600 mt-1">JWT protected routes</p>
              </div>
            </div>
          </div>

          {/* Right Card */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <button
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <p className="text-sm text-gray-600">
                New here?{" "}
                <Link to="/register" className="font-semibold text-blue-600 hover:underline">
                  Create an account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;