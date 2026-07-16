import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaHeart, FaRegHeart } from "react-icons/fa";

import { fetchProductById, clearSingle } from "../redux/slices/productSlice";
import { addToCart } from "../redux/slices/cartSlice";
import { addWishlist, removeWishlist } from "../redux/slices/wishlistSlice";

import { getImageUrl } from "../utils/getImageUrl";
import api from "../utils/api";

import RatingStars from "../components/RatingStars";
import StarRatingInput from "../components/StarRatingInput";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { single, singleLoading, singleError } = useSelector((s) => s.products);
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { ids } = useSelector((s) => s.wishlist);

  const wished = isAuthenticated && ids?.includes(id);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => dispatch(clearSingle());
  }, [dispatch, id]);

  const myReview = useMemo(() => {
    if (!single?.reviews?.length || !user?._id) return null;

    return single.reviews.find((r) => {
      const reviewerId =
        (r.user && typeof r.user === "object" ? r.user._id : r.user) || null;
      return reviewerId?.toString() === user._id.toString();
    });
  }, [single, user]);

  useEffect(() => {
    if (myReview) {
      setReviewRating(Number(myReview.rating) || 5);
      setReviewComment(myReview.comment || "");
    }
  }, [myReview]);

  if (singleLoading) return <div className="container max-w-6xl py-10">Loading...</div>;
  if (singleError) return <div className="container max-w-6xl py-10 text-red-600">{singleError}</div>;
  if (!single) return null;

  const price =
    single.discountPrice && single.discountPrice > 0 ? single.discountPrice : single.price;

  const onAddToCart = () => {
    dispatch(
      addToCart({
        productId: single._id,
        name: single.name,
        image: single?.images?.[0]?.url || "",
        price,
        qty: 1,
      })
    );
    toast.success("Added to cart");
  };

  const onToggleWishlist = () => {
    if (!isAuthenticated) {
      toast.error("Login to use wishlist");
      navigate("/login");
      return;
    }

    if (wished) {
      dispatch(removeWishlist(single._id));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addWishlist(single._id));
      toast.success("Added to wishlist");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to write a review");
      navigate("/login");
      return;
    }

    if (!reviewComment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    try {
      setReviewLoading(true);
      await api.post(`/products/${id}/reviews`, {
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
      });

      toast.success(myReview ? "Review updated" : "Review added");
      setReviewComment("");
      dispatch(fetchProductById(id));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl py-6">
      <Link to="/products" className="text-sm text-blue-600 hover:underline">
        ← Back to Products
      </Link>

      {/* Top section */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div className="rounded-2xl border bg-white p-4">
          <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100 relative">
            <img
              src={getImageUrl(single?.images?.[0]?.url)}
              alt={single.name}
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />

            {/* ✅ Wishlist icon on image */}
            <button
              type="button"
              onClick={onToggleWishlist}
              className="absolute top-4 right-4 rounded-full bg-white/95 p-3 shadow hover:bg-white"
              aria-label="wishlist"
            >
              {wished ? (
                <FaHeart className="text-red-500" />
              ) : (
                <FaRegHeart className="text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-2xl border bg-white p-6">
          <p className="text-xs font-semibold text-gray-500">{single.brand}</p>

          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="text-3xl font-extrabold text-gray-900">{single.name}</h1>

            {/* ✅ Wishlist button (text) */}
            <button
              type="button"
              onClick={onToggleWishlist}
              className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold border transition ${
                wished
                  ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {wished ? <FaHeart /> : <FaRegHeart />}
              {wished ? "Wishlisted" : "Wishlist"}
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <RatingStars value={single.ratings} />
            <span className="text-sm text-gray-500">
              ({single.numOfReviews || 0} reviews)
            </span>
          </div>

          <div className="mt-4 flex items-end gap-3">
            <p className="text-3xl font-extrabold text-gray-900">₹{price}</p>
            {single.discountPrice && single.discountPrice > 0 && (
              <p className="text-sm text-gray-500 line-through">₹{single.price}</p>
            )}
          </div>

          <p className="mt-4 text-gray-700 leading-relaxed">{single.description}</p>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm font-semibold">Stock:</span>
            <span
              className={`text-sm font-semibold ${
                single.stock > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {single.stock > 0 ? `${single.stock} available` : "Out of stock"}
            </span>
          </div>

          <button
            onClick={onAddToCart}
            disabled={single.stock <= 0}
            className="mt-6 w-full rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
          >
            {single.stock <= 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* List */}
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-extrabold text-gray-900">Customer Reviews</h2>

          {!single.reviews || single.reviews.length === 0 ? (
            <p className="mt-4 text-gray-500">No reviews yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {single.reviews
                .slice()
                .reverse()
                .map((r, idx) => (
                  <div key={r._id || idx} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-gray-900">
                        {r.name || r.user?.name || "User"}
                      </p>
                      <RatingStars value={r.rating} />
                    </div>
                    <p className="mt-2 text-gray-700">{r.comment}</p>
                    {r.createdAt && (
                      <p className="mt-2 text-xs text-gray-500">
                        {new Date(r.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Form */}
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-extrabold text-gray-900">
            {myReview ? "Update your review" : "Write a review"}
          </h2>

          {!isAuthenticated ? (
            <p className="mt-4 text-gray-700">
              Please{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                login
              </Link>{" "}
              to write a review.
            </p>
          ) : (
            <form onSubmit={submitReview} className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Rating</p>
                <div className="mt-2">
                  <StarRatingInput value={reviewRating} onChange={setReviewRating} />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">Comment</p>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={5}
                  placeholder="Share your experience..."
                  className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <button
                disabled={reviewLoading}
                className="w-full rounded-xl bg-gray-900 text-white py-3 font-semibold hover:bg-black disabled:bg-gray-300 disabled:text-gray-600"
              >
                {reviewLoading ? "Submitting..." : myReview ? "Update Review" : "Submit Review"}
              </button>

              <p className="text-xs text-gray-500">
                Your review helps other customers to choose better.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;