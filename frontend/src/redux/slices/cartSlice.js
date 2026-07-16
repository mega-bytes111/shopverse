import { createSlice } from "@reduxjs/toolkit";

const saved = localStorage.getItem("cart");
const initialItems = saved ? JSON.parse(saved) : [];

const calc = (items) => {
  const totalQty = items.reduce((a, i) => a + i.qty, 0);
  const totalPrice = items.reduce((a, i) => a + i.price * i.qty, 0);
  return { totalQty, totalPrice };
};

const initialTotals = calc(initialItems);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: initialItems, // [{productId,name,image,price,qty}]
    totalQty: initialTotals.totalQty,
    totalPrice: initialTotals.totalPrice,
  },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload; // {productId,name,image,price,qty}
      const exist = state.items.find((x) => x.productId === item.productId);

      if (exist) exist.qty += item.qty;
      else state.items.push(item);

      const t = calc(state.items);
      state.totalQty = t.totalQty;
      state.totalPrice = t.totalPrice;

      localStorage.setItem("cart", JSON.stringify(state.items));
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter((x) => x.productId !== action.payload);
      const t = calc(state.items);
      state.totalQty = t.totalQty;
      state.totalPrice = t.totalPrice;
      localStorage.setItem("cart", JSON.stringify(state.items));
    },

    setQty: (state, action) => {
      const { productId, qty } = action.payload;
      const exist = state.items.find((x) => x.productId === productId);
      if (!exist) return;

      exist.qty = qty <= 1 ? 1 : qty;

      const t = calc(state.items);
      state.totalQty = t.totalQty;
      state.totalPrice = t.totalPrice;
      localStorage.setItem("cart", JSON.stringify(state.items));
    },

    clearCart: (state) => {
      state.items = [];
      state.totalQty = 0;
      state.totalPrice = 0;
      localStorage.removeItem("cart");
    },
  },
});

export const { addToCart, removeFromCart, setQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;