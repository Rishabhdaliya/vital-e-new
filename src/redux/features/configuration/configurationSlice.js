import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  loaded: false,
  needsRefetch: false,
  autoSyncEnabled: true,
};

const configurationSlice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {
    setConfiguration: (state, action) => {
      state.data = action.payload.data[0];
      state.loaded = true;
      state.needsRefetch = false;
      state.autoSyncEnabled = true; // Correct syntax
    },
    resetState: (state) => {
      state.loaded = false;
      state.needsRefetch = true; // Set needsRefetch flag to true
    },
    setAutoSync: (state, action) => {
      state.autoSyncEnabled = action.payload;
    },
  },
});

export const { setConfiguration, resetState, setAutoSync } =
  configurationSlice.actions;
export default configurationSlice.reducer;
