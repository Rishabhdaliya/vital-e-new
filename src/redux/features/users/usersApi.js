import { api } from "../../api";
import { setUsers, updateUser, setUsersLoaded } from "./usersSlice";

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => ({
        url: `/api/users`,
        method: "GET",
      }),
      async onCacheEntryAdded(arg, { cacheDataLoaded, dispatch, getState }) {
        try {
          const state = getState().users;
          if (!state.loaded) {
            const { data } = await cacheDataLoaded;
            dispatch(setUsers(data));
            dispatch(setUsersLoaded(true)); // Mark as loaded
          }
        } catch (error) {
          console.error("Failed to load users:", error);
        }
      },
    }),
    getUserById: builder.mutation({
      query: ({ userId }) => ({
        url: `/api/users/${userId}`,
        method: "GET",
      }),
      async onQueryStarted({ userId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled; // Get the response from the mutation
          // Dispatch an action to update the specific user in the Redux state
          dispatch(updateUser({ userId, updatedUser: data.data }));
        } catch (error) {
          console.error("Failed to update user:", error);
        }
      },
    }),
    addUser: builder.mutation({
      query: (newUserPayload) => ({
        url: `/api/users`,
        method: "POST",
        body: JSON.stringify(newUserPayload),
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled; // Get the response from the mutation
          // Optionally, you can dispatch an action to add the new user to the Redux state
          dispatch(setUsers(data.data));
        } catch (error) {
          console.error("Failed to add user:", error);
        }
      },
    }),
    updateUsers: builder.mutation({
      query: ({ userId, updatedUserPayload }) => ({
        url: `/api/users/${userId}`,
        method: "PUT",
        body: JSON.stringify(updatedUserPayload),
      }),
      async onQueryStarted({ userId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled; // Get the response from the mutation
          // Dispatch an action to update the specific user in the Redux state
          dispatch(updateUser({ userId, updatedUser: data.data }));
        } catch (error) {
          console.error("Failed to update user:", error);
        }
      },
    }),
  }),
  overrideExisting: true, // This flag allows overriding of existing endpoints
});

export const {
  useGetUsersQuery,
  useGetUserByIdMutation,
  useUpdateUsersMutation,
  useAddUserMutation,
} = usersApi;
