import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [], // Set to an empty array initially
  loaded: false,
  needsRefetch: false, // Add a needsRefetch flag
  loading: false, // Add a loading state to track the fetching process
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.data = action.payload.data; // Directly assuming payload is the data
      state.loaded = true;
      state.needsRefetch = false; // Reset the flag after successful data fetch
      state.loading = false; // Set loading to false after data fetch
    },
    setUsersLoaded: (state, action) => {
      state.loaded = action.payload;
    },
    resetState: (state) => {
      state.loaded = false;
      state.needsRefetch = true; // Set needsRefetch flag to true
      state.loading = false; // Reset loading state when reset
    },
    setLoading: (state, action) => {
      state.loading = action.payload; // Add a setLoading action to track loading state
    },
    updateUsers: (state, action) => {
      const { usersId, updatedUsers } = action.payload;

      // Directly update the users in state if it's an array
      if (Array.isArray(state.data)) {
        const usersIndex = state.data.findIndex(
          (users) => users.id === usersId
        );

        if (usersIndex !== -1) {
          // Update the users in the state
          state.data[usersIndex] = {
            ...state.data[usersIndex],
            ...updatedUsers,
          };
        } else {
          console.warn(`Users with ID ${usersId} not found.`);
        }
      } else {
        console.error("Data is not an array.");
      }
    },
  },
});

export const { setUsers, setUsersLoaded, resetState, updateUsers, setLoading } =
  usersSlice.actions;
export default usersSlice.reducer;
