import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../utils/api";
import { fetchProducts } from "../redux/slices/productSlice";
import ProductCard from "../components/ProductCard";

const Products = () => {
  const dispatch = useDispatch();
  const { items, loading, error, pages } = useSelector((s) => s.products);

  const [categories, setCategories] = useState([]);

  // filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const limit = 12;

  // Load categories once
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/categories");
        setCategories(data.data || []);
      } catch {
        // silent
      }
    })();
  }, []);

  // Auto fetch on page/sort/category change
  useEffect(() => {
    dispatch(
      fetchProducts({
        page,
        limit,
        search,
        category,
        minPrice,
        maxPrice,
        sort,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, page, sort, category]);

  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    dispatch(fetchProducts({ page: 1, limit, search, category, minPrice, maxPrice, sort }));
  };

  const onApplyPrice = (e) => {
    e.preventDefault();
    setPage(1);
    dispatch(fetchProducts({ page: 1, limit, search, category, minPrice, maxPrice, sort }));
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
    dispatch(
      fetchProducts({
        page: 1,
        limit,
        search: "",
        category: "",
        minPrice: "",
        maxPrice: "",
        sort: "newest",
      })
    );
  };

  // ✅ Smart pagination buttons (first/last + current window)
  const pageButtons = useMemo(() => {
    const total = Number(pages) || 1;
    const current = Number(page) || 1;

    if (total <= 1) return [];

    const windowSize = 2;
    let start = Math.max(1, current - windowSize);
    let end = Math.min(total, current + windowSize);

    const btns = [];

    // Always show 1
    btns.push(1);

    // Left dots
    if (start > 2) btns.push("...");

    // Middle pages
    for (let p = start; p <= end; p++) {
      if (p !== 1 && p !== total) btns.push(p);
    }

    // Right dots
    if (end < total - 1) btns.push("...");

    // Always show last (if >1)
    if (total !== 1) btns.push(total);

    // Remove duplicates
    return btns.filter((v, idx, arr) => arr.indexOf(v) === idx);
  }, [pages, page]);

  return (
    <div className="container max-w-6xl py-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">Search, filter and sort items</p>
        </div>

        <button
          onClick={clearFilters}
          className="w-full md:w-auto rounded-xl border bg-white px-4 py-2 font-semibold hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>

      {/* Filters Row */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Search */}
        <form onSubmit={onSearch} className="lg:col-span-2 rounded-2xl border bg-white p-4">
          <p className="text-sm font-bold text-gray-900">Search</p>
          <div className="mt-2 flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button className="rounded-xl bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700">
              Go
            </button>
          </div>
        </form>

        {/* Category */}
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm font-bold text-gray-900">Category</p>
          <select
            value={category}
            onChange={(e) => {
              setPage(1);
              setCategory(e.target.value);
            }}
            className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm font-bold text-gray-900">Sort</p>
          <select
            value={sort}
            onChange={(e) => {
              setPage(1);
              setSort(e.target.value);
            }}
            className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Price Filter */}
      <form onSubmit={onApplyPrice} className="mt-4 rounded-2xl border bg-white p-4">
        <p className="text-sm font-bold text-gray-900">Price Range</p>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button className="rounded-xl bg-gray-900 text-white px-4 py-2 font-semibold hover:bg-black">
            Apply
          </button>
          <p className="text-xs text-gray-500">Tip: leave blank for no limit</p>
        </div>
      </form>

      {/* States */}
      {loading && <p className="mt-6 text-gray-600">Loading products...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      {/* Grid */}
      {!loading && !error && items.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((p) => (
            <ProductCard key={p._id} p={p} />
          ))}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="mt-10 rounded-2xl border bg-white p-8 text-center">
          <p className="font-semibold text-gray-800">No products found</p>
          <p className="mt-1 text-sm text-gray-500">Try changing filters.</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && (Number(pages) || 1) > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border bg-white px-3 py-2 font-semibold hover:bg-gray-50 disabled:opacity-50"
            disabled={page <= 1}
          >
            Prev
          </button>

          {pageButtons.map((pNo, idx) =>
            pNo === "..." ? (
              <span key={`dots-${idx}`} className="px-2 text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={pNo}
                onClick={() => setPage(pNo)}
                className={`rounded-lg px-3 py-2 font-semibold border ${
                  pNo === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-gray-50"
                }`}
              >
                {pNo}
              </button>
            )
          )}

          <button
            onClick={() => setPage((p) => Math.min(Number(pages) || 1, p + 1))}
            className="rounded-lg border bg-white px-3 py-2 font-semibold hover:bg-gray-50 disabled:opacity-50"
            disabled={page >= (Number(pages) || 1)}
          >
            Next
          </button>

          <span className="ml-3 text-sm text-gray-500">
            Page <b>{page}</b> of <b>{pages}</b>
          </span>
        </div>
      )}
    </div>
  );
};

export default Products;