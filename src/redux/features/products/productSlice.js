import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [],
  loading: false,
  loaded: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  },
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    addProduct: (state, action) => {
      state.data.unshift(action.payload); // Add to the beginning of the array
    },
    updateProduct: (state, action) => {
      const index = state.data.findIndex(
        (product) => product.id === action.payload.id
      );
      if (index !== -1) {
        state.data[index] = {
          ...state.data[index],
          ...action.payload,
        };
      }
    },
    removeProduct: (state, action) => {
      // Remove product by id
      state.data = state.data.filter(
        (product) => product.id !== action.payload
      );
      // Update total count in pagination
      if (state.pagination.totalCount > 0) {
        state.pagination.totalCount -= 1;
        state.pagination.totalPages = Math.ceil(
          state.pagination.totalCount / state.pagination.pageSize
        );
      }
    },
    setProductsLoaded: (state, action) => {
      state.loaded = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  removeProduct,
  setProductsLoaded,
  setLoading,
  setError,
  setPagination,
} = productsSlice.actions;

export default productsSlice.reducer;
