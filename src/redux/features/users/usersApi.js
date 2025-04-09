import { api } from "../../api";
import {
  updateUsers,
  setUsers,
  setUsersLoaded,
  setPagination,
} from "./usersSlice";

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params = {}) => {
        const {
          page = 1,
          pageSize = 10,
          search = "",
          searchField = "all",
        } = params;

        // Get current user from Redux store or localStorage
        let currentUserId, currentUserRole;

        // Try to get from params first
        if (params.requesterId && params.requesterRole) {
          currentUserId = params.requesterId;
          currentUserRole = params.requesterRole;
        } else {
          // Fallback to localStorage
          try {
            currentUserId = localStorage.getItem("userId");
            currentUserRole = localStorage.getItem("userRole");
          } catch (error) {
            console.error("Error accessing localStorage:", error);
          }
        }

        // Log the request parameters for debugging
        console.log("User API request params:", {
          page,
          pageSize,
          search,
          searchField,
          requesterId: currentUserId,
          requesterRole: currentUserRole,
        });

        return {
          url: `/api/users`,
          method: "GET",
          params: {
            page,
            pageSize,
            search,
            searchField,
            requesterId: currentUserId,
            requesterRole: currentUserRole,
          },
        };
      },
      async onCacheEntryAdded(arg, { cacheDataLoaded, dispatch, getState }) {
        try {
          const state = getState().users;
          const response = await cacheDataLoaded;

          console.log("API response:", response);

          if (response.data && response.data.data) {
            dispatch(setUsers({ data: response.data.data }));

            // Set pagination data if available
            if (response.data.pagination) {
              dispatch(setPagination(response.data.pagination));
            }

            dispatch(setUsersLoaded(true));
          } else {
            console.error("Invalid API response format:", response);
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
          dispatch(updateUsers({ usersId: id, updatedUsers: data.data }));
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
          console.log("API response:", data);

          // Dispatch updateUsers action with the correct payload structure
          dispatch(
            updateUsers({
              usersId: id,
              updatedUsers: data.data || userData, // Use response data if available, fallback to request data
            })
          );

          console.log("Dispatched updateUsers action");
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
