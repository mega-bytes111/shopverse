import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { registerUser } from "../redux/slices/authSlice";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await dispatch(registerUser({ name, email, password, confirmPassword })).unwrap();
      toast.success("Account created");
      navigate("/");
    } catch (msg) {
      toast.error(msg || "Register failed");
    }
  };

  return (
    <>
      <Helmet>
        <title>ShopVerse | Register</title>
      </Helmet>

      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-indigo-50 to-white flex items-center">
        <div className="container max-w-6xl py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div className="hidden lg:block">
            <h1 className="text-4xl font-extrabold text-gray-900">
              Create your <span className="text-indigo-600">ShopVerse</span> account
            </h1>
            <p className="mt-3 text-gray-600">
              Save addresses, manage orders, wishlist (next), and much more.
            </p>

            <div className="mt-6 rounded-2xl border bg-white p-6">
              <p className="font-bold">Why join?</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600 list-disc pl-5">
                <li>Quick checkout with saved addresses</li>
                <li>Track orders + order details</li>
                <li>Write product reviews and ratings</li>
              </ul>
            </div>
          </div>

          {/* Right Card */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold text-gray-900">Get started</h2>
            <p className="text-sm text-gray-500 mt-1">Create account in seconds</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Your name"
                  className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
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
                  className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <button
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 text-white py-3 font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-600"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>

              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;