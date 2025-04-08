import { api } from "../../api";
import { updateUser, setUsers, setUsersLoaded } from "./usersSlice";

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
    getUserById: builder.query({
      query: (id) => ({
        url: `/api/users/${id}`,
        method: "GET",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Dispatch an action to update the specific user in the Redux state
          dispatch(updateUser({ userId: id, userData: data.data }));
        } catch (error) {
          console.error("Failed to get user:", error);
        }
      },
    }),
    updateUserData: builder.mutation({
      query: ({ id, userData }) => ({
        url: `/api/users/${id}`,
        method: "PUT",
        body: userData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      async onQueryStarted({ id, userData }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          //Todo: Dispatch updateUser action with the correct payload structure
          dispatch(
            updateUser({
              userId: id,
              userData: data.data || userData, // Use response data if available, fallback to request data
            })
          );

          console.log("Dispatched updateUser action");
        } catch (error) {
          console.error("Failed to update user:", error);
        }
      },
    }),
    addUser: builder.mutation({
      query: (newUserPayload) => ({
        url: `/api/users`,
        method: "POST",
        body: newUserPayload,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Optionally, you can dispatch an action to add the new user to the Redux state
          dispatch(setUsers(data.data));
        } catch (error) {
          console.error("Failed to add user:", error);
        }
      },
    }),
  }),
  overrideExisting: true, // This flag allows overriding of existing endpoints
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserDataMutation,
  useAddUserMutation,
} = usersApi;
