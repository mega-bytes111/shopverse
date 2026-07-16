// src/components/ProductCard.jsx
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FaHeart, FaRegHeart } from "react-icons/fa";

import { addToCart } from "../redux/slices/cartSlice";
import { addWishlist, removeWishlist } from "../redux/slices/wishlistSlice";
import { getImageUrl } from "../utils/getImageUrl";
import RatingStars from "./RatingStars";

const ProductCard = ({ p }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((s) => s.auth);
  const { ids } = useSelector((s) => s.wishlist);

 const wished = isAuthenticated && ids?.includes(p._id); 

  const price = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;

  const onAdd = (e) => {
    e.preventDefault(); // card click navigation stop
    dispatch(
      addToCart({
        productId: p._id,
        name: p.name,
        image: p?.images?.[0]?.url || "",
        price,
        qty: 1,
      })
    );
    toast.success("Added to cart");
  };

  const onToggleWishlist = (e) => {
    e.preventDefault(); // card click navigation stop

    if (!isAuthenticated) {
      toast.error("Login to use wishlist");
      navigate("/login");
      return;
    }

    if (wished) {
      dispatch(removeWishlist(p._id));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addWishlist(p._id));
      toast.success("Added to wishlist");
    }
  };

  return (
    <Link
      to={`/products/${p._id}`}
      className="group block rounded-xl border bg-white shadow-sm hover:shadow-md transition overflow-hidden"
    >
      <div className="relative bg-gray-100">
        <img
          src={getImageUrl(p?.images?.[0]?.url)}
          alt={p.name}
          className="h-48 w-full object-cover group-hover:scale-[1.02] transition"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/600x600?text=No+Image";
          }}
        />

        {/* ✅ Wishlist Heart */}
        <button
          type="button"
          onClick={onToggleWishlist}
          className="absolute top-3 right-3 rounded-full bg-white/90 p-2 shadow hover:bg-white"
          aria-label="wishlist"
        >
          {wished ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-gray-700" />
          )}
        </button>

        {p.stock <= 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-500">{p.brand}</p>

        <h3 className="mt-1 font-semibold text-gray-900 line-clamp-2">
          {p.name}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <RatingStars value={p.ratings} />
          <span className="text-xs text-gray-500">({p.numOfReviews || 0})</span>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-extrabold text-gray-900">₹{price}</p>
            {p.discountPrice && p.discountPrice > 0 && (
              <p className="text-xs text-gray-500 line-through">₹{p.price}</p>
            )}
          </div>

          <button
            onClick={onAdd}
            disabled={p.stock <= 0}
            className="px-3 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;