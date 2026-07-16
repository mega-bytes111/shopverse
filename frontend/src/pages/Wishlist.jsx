import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { fetchWishlist, removeWishlist } from "../redux/slices/wishlistSlice";
import { addToCart } from "../redux/slices/cartSlice";
import { getImageUrl } from "../utils/getImageUrl";
import RatingStars from "../components/RatingStars";

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, loading, error } = useSelector((s) => s.wishlist);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  const moveToCart = (p) => {
    const price = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;

    dispatch(
      addToCart({
        productId: p._id,
        name: p.name,
        image: p?.images?.[0]?.url || "",
        price,
        qty: 1,
      })
    );

    dispatch(removeWishlist(p._id));
    toast.success("Moved to cart");
    navigate("/cart");
  };

  const remove = (productId) => {
    dispatch(removeWishlist(productId));
    toast.success("Removed from wishlist");
  };

  return (
    <div className="container max-w-6xl py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Wishlist</h1>
          <p className="text-sm text-gray-500">Your saved products</p>
        </div>

        <Link
          to="/products"
          className="rounded-xl border bg-white px-4 py-2 font-semibold hover:bg-gray-50"
        >
          Browse Products
        </Link>
      </div>

      {loading && <p className="mt-6 text-gray-600">Loading...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div className="mt-8 rounded-2xl border bg-white p-8 text-center">
          <p className="font-semibold text-gray-800">Wishlist is empty</p>
          <p className="mt-1 text-sm text-gray-500">
            Tap the heart icon on products to save them.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((p) => {
            const price = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;

            return (
              <div key={p._id} className="rounded-2xl border bg-white p-4 flex gap-4">
                <Link to={`/products/${p._id}`} className="h-28 w-28 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  <img
                    src={getImageUrl(p?.images?.[0]?.url)}
                    alt={p.name}
                    className="h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </Link>

                <div className="flex-1">
                  <Link to={`/products/${p._id}`}>
                    <p className="font-extrabold text-gray-900">{p.name}</p>
                  </Link>

                  <p className="text-sm text-gray-500 mt-1">{p.brand}</p>

                  <div className="mt-2 flex items-center gap-2">
                    <RatingStars value={p.ratings} />
                    <span className="text-xs text-gray-500">({p.numOfReviews || 0})</span>
                  </div>

                  <p className="mt-2 text-lg font-extrabold">₹{price}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => moveToCart(p)}
                      className="rounded-xl bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700"
                    >
                      Move to Cart
                    </button>

                    <button
                      onClick={() => remove(p._id)}
                      className="rounded-xl bg-red-50 text-red-700 px-4 py-2 font-semibold hover:bg-red-100"
                    >
                      Remove
                    </button>

                    <Link
                      to={`/products/${p._id}`}
                      className="rounded-xl border bg-white px-4 py-2 font-semibold hover:bg-gray-50"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;