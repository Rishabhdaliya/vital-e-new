import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  options: [],
  loading: false,
  loaded: false,
  needsRefetch: true,
  currentVoucher: null,
  userVouchers: [],
  pagination: {
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  },
};

const vouchersSlice = createSlice({
  name: "vouchers",
  initialState,
  reducers: {
    setVouchersOptions: (state, action) => {
      state.options = action.payload.data;
      state.loading = false;
      state.loaded = true;
      state.needsRefetch = false;
    },
    setVoucher: (state, action) => {
      state.currentVoucher = action.payload;
    },
    setUserVouchers: (state, action) => {
      state.userVouchers = action.payload;
      state.loading = false;
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    resetState: (state) => {
      state.loaded = false;
      state.needsRefetch = true; // Indicate need for refetch
    },
  },
});

export const {
  setVouchersOptions,
  setVoucher,
  setUserVouchers,
  setPagination,
  setLoading,
  resetState,
} = vouchersSlice.actions;

export default vouchersSlice.reducer;
