import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  options: [],
  loading: false,
  loaded: false,
  needsRefetch: true,
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
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    resetState: (state) => {
      state.loaded = false;
      state.needsRefetch = true; // Indicate need for refetch
    },
  },
});

export const { setVouchersOptions, setLoading, resetState } =
  vouchersSlice.actions;
export default vouchersSlice.reducer;
