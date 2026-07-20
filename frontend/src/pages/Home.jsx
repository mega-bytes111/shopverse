import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";

import { fetchProducts } from "../redux/slices/productSlice";
import ProductCard from "../components/ProductCard";

const Home = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((s) => s.products);

  useEffect(() => {
    // Home pe 8 products show karne ke liye
    dispatch(fetchProducts({ limit: 8, page: 1 }));
  }, [dispatch]);

  return (
    <>
      <Helmet>
        <title>ShopVerse | Your Shopping Universe</title>
      </Helmet>

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container max-w-6xl py-14 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-flex items-center rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                New Season Deals • Up to 60% off
              </p>

              <h1 className="mt-5 text-4xl md:text-5xl font-extrabold leading-tight">
                Welcome to <span className="text-yellow-300">ShopVerse</span>
              </h1>

              <p className="mt-4 text-white/90 text-base md:text-lg">
                Discover trending products, best prices, and a smooth shopping experience.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/products"
                  className="rounded-xl bg-white text-blue-700 px-6 py-3 font-bold hover:bg-blue-50 transition"
                >
                  Shop Now
                </Link>

                <Link
                  to="/orders"
                  className="rounded-xl border border-white/40 px-6 py-3 font-bold hover:bg-white/10 transition"
                >
                  Track Orders
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xl font-extrabold">10k+</p>
                  <p className="text-xs text-white/80">Customers</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xl font-extrabold">1k+</p>
                  <p className="text-xs text-white/80">Products</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xl font-extrabold">24/7</p>
                  <p className="text-xs text-white/80">Support</p>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="md:justify-self-end">
              <div className="rounded-3xl bg-white/10 border border-white/20 p-6 backdrop-blur">
                <p className="text-sm font-semibold text-white/90">Today’s Highlight</p>
                <h3 className="mt-2 text-2xl font-extrabold">Fast Delivery</h3>
                <p className="mt-2 text-white/85">
                  Get your products delivered quickly and securely at your doorstep.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="font-bold">Secure Payments</p>
                    <p className="text-white/80 text-xs mt-1">Protected checkout</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="font-bold">Easy Returns</p>
                    <p className="text-white/80 text-xs mt-1">Hassle-free</p>
                  </div>
                </div>

                <Link
                  to="/products"
                  className="block mt-6 text-center rounded-xl bg-yellow-300 text-gray-900 px-5 py-3 font-extrabold hover:bg-yellow-200 transition"
                >
                  Explore Products →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container max-w-6xl py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm font-bold text-blue-600">Wide Selection</p>
            <h3 className="mt-2 text-lg font-extrabold">Top brands & categories</h3>
            <p className="mt-2 text-sm text-gray-600">
              Electronics, fashion, home essentials — everything in one place.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm font-bold text-green-600">Trusted Quality</p>
            <h3 className="mt-2 text-lg font-extrabold">Ratings & reviews</h3>
            <p className="mt-2 text-sm text-gray-600">
              Real customer reviews help you buy confidently.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <p className="text-sm font-bold text-purple-600">Smooth Experience</p>
            <h3 className="mt-2 text-lg font-extrabold">Fast & responsive</h3>
            <p className="mt-2 text-sm text-gray-600">
              Built using MERN + Vite for speed and performance.
            </p>
          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="container max-w-6xl pb-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">Trending Products</h2>
            <p className="text-sm text-gray-500">Hand-picked items for you</p>
          </div>

          <Link
            to="/products"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-80 rounded-xl border bg-white animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {items?.slice(0, 8)?.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gray-900 text-white">
        <div className="container max-w-6xl py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-extrabold">Ready to shop smarter?</h3>
            <p className="mt-1 text-white/75 text-sm">
              Join ShopVerse and experience a premium ecommerce workflow.
            </p>
          </div>
          
        </div>
      </section>
    </>
  );
};

export default Home;