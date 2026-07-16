import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, removeFromCart, setQty } from "../redux/slices/cartSlice";
import { getImageUrl } from "../utils/getImageUrl";

const Cart = () => {
  const dispatch = useDispatch();
  const { items, totalQty, totalPrice } = useSelector((s) => s.cart);

  return (
    <div className="container max-w-6xl py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Cart</h1>
          <p className="text-sm text-gray-500">Review your items before checkout</p>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => dispatch(clearCart())}
            className="rounded-lg bg-red-50 text-red-700 px-4 py-2 font-semibold hover:bg-red-100"
          >
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border bg-white p-8 text-center">
          <p className="font-semibold text-gray-800">Your cart is empty</p>
          <p className="mt-1 text-sm text-gray-500">Add some products to continue.</p>
          <Link
            to="/products"
            className="inline-block mt-4 rounded-xl bg-blue-600 text-white px-5 py-2.5 font-semibold hover:bg-blue-700"
          >
            Go to Products
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((i) => (
              <div key={i.productId} className="rounded-2xl border bg-white p-4 flex gap-4">
                <div className="h-24 w-24 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  <img
                    src={getImageUrl(i.image)}
                    alt={i.name}
                    className="h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-gray-900">{i.name}</p>
                      <p className="mt-1 text-sm text-gray-600">₹{i.price}</p>
                    </div>

                    <button
                      onClick={() => dispatch(removeFromCart(i.productId))}
                      className="text-sm font-semibold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">Qty</span>
                      <input
                        type="number"
                        min={1}
                        value={i.qty}
                        onChange={(e) =>
                          dispatch(
                            setQty({ productId: i.productId, qty: Number(e.target.value) })
                          )
                        }
                        className="w-20 rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    <p className="font-extrabold text-gray-900">
                      Subtotal: ₹{i.price * i.qty}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-2xl border bg-white p-5 h-fit">
            <h2 className="text-lg font-extrabold">Summary</h2>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Items</span>
                <span className="font-bold">{totalQty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Price</span>
                <span className="font-bold">₹{totalPrice}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="block mt-5 text-center rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/products"
              className="block mt-3 text-center rounded-xl border py-3 font-semibold text-gray-800 hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;