import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../utils/api";

// ✅ UPDATED: now supports filters + sort + price range
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (
    {
      page = 1,
      limit = 12,
      search = "",
      category = "",
      minPrice = "",
      maxPrice = "",
      sort = "newest",
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get("/products", {
        params: { page, limit, search, category, minPrice, maxPrice, sort },
      });
      // backend: { success, count, total, pages, currentPage, data: products }
      return data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to load products"
      );
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/products/${id}`);
      // backend: { success, data: product }
      return data.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to load product"
      );
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    total: 0,
    pages: 1,
    currentPage: 1,
    loading: false,
    error: null,

    single: null,
    singleLoading: false,
    singleError: null,
  },
  reducers: {
    clearSingle: (state) => {
      state.single = null;
      state.singleError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // list
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.total = action.payload.total || 0;
        state.pages = action.payload.pages || 1;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load products";
      })

      // single
      .addCase(fetchProductById.pending, (state) => {
        state.singleLoading = true;
        state.singleError = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.singleLoading = false;
        state.single = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.singleLoading = false;
        state.singleError = action.payload || "Failed to load product";
      });
  },
});

export const { clearSingle } = productSlice.actions;
export default productSlice.reducer;