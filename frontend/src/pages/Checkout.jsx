import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../utils/api";
import { clearCart } from "../redux/slices/cartSlice";
import { loadMe } from "../redux/slices/authSlice";
import loadRazorpay from "../utils/loadRazorpay";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items, totalPrice } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);

  const addresses = user?.addresses || [];

  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("new");

  // ✅ payment method
  const [paymentMethod, setPaymentMethod] = useState("COD"); // COD | Razorpay

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const pricing = useMemo(() => {
    const itemsPrice = totalPrice;
    const taxRate = 0.18;
    const taxPrice = Math.round(itemsPrice * taxRate);
    const shippingPrice = itemsPrice >= 500 ? 0 : 50;
    const total = itemsPrice + taxPrice + shippingPrice;
    return { itemsPrice, taxPrice, shippingPrice, total };
  }, [totalPrice]);

  if (!items || items.length === 0) return <Navigate to="/cart" replace />;

  useEffect(() => {
    dispatch(loadMe());
  }, [dispatch]);

  // auto select default address
  useEffect(() => {
    if (!addresses.length) {
      setSelectedAddressId("new");
      return;
    }

    const def = addresses.find((a) => a.isDefault) || addresses[0];
    setSelectedAddressId(def._id);

    setShippingAddress({
      fullName: def.fullName || user?.name || "",
      phone: def.phone || "",
      addressLine1: def.addressLine1 || "",
      addressLine2: def.addressLine2 || "",
      city: def.city || "",
      state: def.state || "",
      pincode: def.pincode || "",
      country: def.country || "India",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses.length]);

  const onChangeField = (e) => {
    const { name, value } = e.target;
    setShippingAddress((p) => ({ ...p, [name]: value }));
  };

  const onSelectAddress = (e) => {
    const value = e.target.value;
    setSelectedAddressId(value);

    if (value === "new") return;

    const found = addresses.find((a) => a._id === value);
    if (!found) return;

    setShippingAddress({
      fullName: found.fullName || user?.name || "",
      phone: found.phone || "",
      addressLine1: found.addressLine1 || "",
      addressLine2: found.addressLine2 || "",
      city: found.city || "",
      state: found.state || "",
      pincode: found.pincode || "",
      country: found.country || "India",
    });
  };

  const validate = () => {
    const a = shippingAddress;
    if (
      !a.fullName ||
      !a.phone ||
      !a.addressLine1 ||
      !a.city ||
      !a.state ||
      !a.pincode
    ) {
      toast.error("Please fill all required fields");
      return false;
    }
    return true;
  };

  // ✅ creates Mongo order (COD or Razorpay)
  const createMongoOrder = async () => {
    const payload = {
      orderItems: items.map((i) => ({
        product: i.productId,
        name: i.name,
        quantity: i.qty,
        image: i.image || "",
        price: i.price,
      })),
      shippingAddress,
      paymentMethod, // COD or Razorpay
      itemsPrice: pricing.itemsPrice,
      taxPrice: pricing.taxPrice,
      shippingPrice: pricing.shippingPrice,
      totalPrice: pricing.total,
    };

    const { data } = await api.post("/orders", payload);
    return data.data; // created order document
  };

  const placeOrderCOD = async () => {
    setLoading(true);
    try {
      await createMongoOrder();
      toast.success("Order placed successfully!");
      dispatch(clearCart());
      navigate("/orders");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const payWithRazorpay = async () => {
    setLoading(true);

    // ✅ explicit token for guaranteed auth
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      navigate("/login");
      setLoading(false);
      return;
    }

    try {
      const sdkOk = await loadRazorpay();
      if (!sdkOk) {
        toast.error("Razorpay SDK failed to load");
        return;
      }

      // 1) Create Mongo Order first (payment pending)
      const createdOrder = await createMongoOrder();

      // 2) Create Razorpay order from backend (amount DB se)
      const rp = await api.post(
        "/payment/razorpay",
        { orderId: createdOrder._id },
        { headers: { Authorization: `Bearer ${token}` } } // ✅ FIX
      );

      const { razorpayOrderId, amount, currency, keyId, orderId } = rp.data;

      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "ShopVerse",
        description: "Order Payment",
        order_id: razorpayOrderId,
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: shippingAddress.phone || "",
        },
        notes: {
          mongoOrderId: orderId,
        },
        theme: { color: "#2563eb" },

        handler: async function (response) {
          // 3) Verify payment on backend
          await api.post(
            "/payment/razorpay/verify",
            {
              orderId: createdOrder._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            { headers: { Authorization: `Bearer ${token}` } } // ✅ FIX
          );

          toast.success("Payment successful! Order confirmed.");
          dispatch(clearCart());
          navigate("/orders");
        },

        modal: {
          ondismiss: function () {
            toast("Payment cancelled. Order is still pending.", { icon: "ℹ️" });
            navigate("/orders");
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // ✅ Better error visibility
      rzp.on("payment.failed", function (res) {
        console.log("Razorpay payment.failed:", res);
        toast.error(res?.error?.description || "Payment failed");
      });

      rzp.open();
    } catch (err) {
      console.log("Razorpay error:", err);
      toast.error(err?.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const onPlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (paymentMethod === "COD") return placeOrderCOD();
    if (paymentMethod === "Razorpay") return payWithRazorpay();
  };

  return (
    <div className="container max-w-6xl py-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Checkout</h1>
          <p className="text-sm text-gray-500">
            Confirm shipping details and place your order
          </p>
        </div>

        <Link
          to="/addresses"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          Manage Addresses
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <form
          onSubmit={onPlaceOrder}
          className="lg:col-span-2 rounded-2xl border bg-white p-6 space-y-5"
        >
          {/* Saved address */}
          <div>
            <p className="text-sm font-bold text-gray-900">Use Saved Address</p>
            <select
              value={selectedAddressId}
              onChange={onSelectAddress}
              className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
            >
              {addresses.length === 0 ? (
                <option value="new">No saved addresses (Enter new)</option>
              ) : (
                <>
                  {addresses.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.fullName} - {a.city}, {a.state}{" "}
                      {a.isDefault ? "(Default)" : ""}
                    </option>
                  ))}
                  <option value="new">Enter a new address</option>
                </>
              )}
            </select>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">
                Full Name *
              </label>
              <input
                name="fullName"
                value={shippingAddress.fullName}
                onChange={onChangeField}
                className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Phone *
              </label>
              <input
                name="phone"
                value={shippingAddress.phone}
                onChange={onChangeField}
                className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Pincode *
              </label>
              <input
                name="pincode"
                value={shippingAddress.pincode}
                onChange={onChangeField}
                className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">
                Address Line 1 *
              </label>
              <input
                name="addressLine1"
                value={shippingAddress.addressLine1}
                onChange={onChangeField}
                className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">
                Address Line 2
              </label>
              <input
                name="addressLine2"
                value={shippingAddress.addressLine2}
                onChange={onChangeField}
                className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                City *
              </label>
              <input
                name="city"
                value={shippingAddress.city}
                onChange={onChangeField}
                className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                State *
              </label>
              <input
                name="state"
                value={shippingAddress.state}
                onChange={onChangeField}
                className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">
                Country
              </label>
              <input
                name="country"
                value={shippingAddress.country}
                onChange={onChangeField}
                className="mt-2 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Payment method selector */}
          <div className="rounded-xl border bg-gray-50 p-4">
            <p className="font-bold text-gray-900">Payment Method</p>

            <div className="mt-3 flex flex-col gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                Cash on Delivery (COD)
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Razorpay"
                  checked={paymentMethod === "Razorpay"}
                  onChange={() => setPaymentMethod("Razorpay")}
                />
                Pay Online (Razorpay)
              </label>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-600"
          >
            {loading
              ? "Processing..."
              : paymentMethod === "COD"
              ? "Place Order (COD)"
              : "Pay Now (Razorpay)"}
          </button>
        </form>

        {/* RIGHT - SUMMARY */}
        <div className="rounded-2xl border bg-white p-6 h-fit">
          <h2 className="text-lg font-extrabold">Order Summary</h2>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Items</span>
              <span className="font-bold">₹{pricing.itemsPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (18%)</span>
              <span className="font-bold">₹{pricing.taxPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-bold">₹{pricing.shippingPrice}</span>
            </div>
          </div>

          <div className="my-4 h-px bg-gray-200" />

          <div className="flex justify-between text-base">
            <span className="font-extrabold">Total</span>
            <span className="font-extrabold">₹{pricing.total}</span>
          </div>

          <div className="my-4 h-px bg-gray-200" />

          <div className="space-y-2">
            {items.map((i) => (
              <div key={i.productId} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {i.name} x {i.qty}
                </span>
                <span className="font-bold">₹{i.price * i.qty}</span>
              </div>
            ))}
          </div>

          <Link
            to="/cart"
            className="block mt-5 text-center rounded-xl border py-3 font-semibold text-gray-800 hover:bg-gray-50"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Checkout;