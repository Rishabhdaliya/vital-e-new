import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [], // Set to an empty array initially
  currentUser: null, // Add currentUser to store the signed-in user
  loaded: false,
  needsRefetch: false, // Add a needsRefetch flag
  loading: false, // Add a loading state to track the fetching process
  pagination: {
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  },
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
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload; // Set the current authenticated user
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
    setPagination: (state, action) => {
      state.pagination = action.payload;
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
    updateUser: (state, action) => {
      const { userId, userData } = action.payload;

      // Update currentUser if it matches
      if (state.currentUser && state.currentUser.id === userId) {
        state.currentUser = {
          ...state.currentUser,
          ...userData,
        };
      }

      // Also update in the data array if present
      const userIndex = state.data.findIndex((user) => user.id === userId);
      if (userIndex !== -1) {
        state.data[userIndex] = {
          ...state.data[userIndex],
          ...userData,
        };
      }
    },
    logout: (state) => {
      state.currentUser = null; // Clear the current user on logout
    },
  },
});

export const {
  setUsers,
  setCurrentUser,
  setUsersLoaded,
  resetState,
  updateUsers,
  updateUser,
  setLoading,
  setPagination,
  logout,
} = usersSlice.actions;

export default usersSlice.reducer;
