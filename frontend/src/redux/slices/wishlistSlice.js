import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/users/wishlist"); // { success, count, data: products[] }
      return data.data || [];
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || "Failed to load wishlist");
    }
  }
);

export const addWishlist = createAsyncThunk(
  "wishlist/addWishlist",
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      await api.post(`/users/wishlist/${productId}`);
      dispatch(fetchWishlist());
      return productId;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || "Failed to add to wishlist");
    }
  }
);

export const removeWishlist = createAsyncThunk(
  "wishlist/removeWishlist",
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`/users/wishlist/${productId}`);
      dispatch(fetchWishlist());
      return productId;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || "Failed to remove from wishlist");
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    ids: [], // quick lookup for hearts
    loading: false,
    error: null,
  },
  reducers: {
    clearWishlistState: (state) => {
      state.items = [];
      state.ids = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.ids = action.payload.map((p) => p._id);
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load wishlist";
      });
  },
});

export const { clearWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;