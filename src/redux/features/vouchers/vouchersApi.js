import { api } from "../../api";
import {
  setVouchersOptions,
  setLoading,
  setVoucher,
  setUserVouchers,
  setPagination,
} from "./vouchersSlice";

export const vouchersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getVouchers: builder.query({
      query: () => ({
        url: `/api/vouchers`,
        method: "GET",
      }),
      async onCacheEntryAdded(arg, { cacheDataLoaded, dispatch }) {
        // Set loading to true when starting to fetch data
        dispatch(setLoading(true));

        try {
          // Wait for the data to load
          const { data } = await cacheDataLoaded;

          // Dispatch to store data in vouchers slice
          dispatch(setVouchersOptions(data));
        } catch (error) {
          console.error("Failed to load vouchers data:", error);
        } finally {
          // Set loading to false when fetching is complete
          dispatch(setLoading(false));
        }
      },
    }),

    // New endpoint for fetching user vouchers with search functionality
    getUserVouchers: builder.query({
      query: ({
        userId,
        page = 1,
        pageSize = 10,
        search = "",
        searchField = "all",
      }) => {
        // Get the current user ID from localStorage for authorization
        const currentUserId = localStorage.getItem("userId");
        const currentUserRole = localStorage.getItem("userRole");

        // Build the query parameters
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
          requesterId: currentUserId || "",
          requesterRole: currentUserRole || "",
        });

        // Add search parameters if provided
        if (search) {
          params.append("search", search);
          params.append("searchField", searchField);
        }

        return {
          url: `/api/users/${userId}/vouchers?${params.toString()}`,
          method: "GET",
        };
      },
      async onCacheEntryAdded(arg, { cacheDataLoaded, dispatch }) {
        // Set loading to true when starting to fetch data
        dispatch(setLoading(true));

        try {
          // Wait for the data to load
          const response = await cacheDataLoaded;

          // Dispatch to store data in vouchers slice
          dispatch(setUserVouchers(response.data));

          // Store pagination data if available
          if (response.pagination) {
            dispatch(setPagination(response.pagination));
          }
        } catch (error) {
          console.error("Failed to load user vouchers data:", error);
        } finally {
          // Set loading to false when fetching is complete
          dispatch(setLoading(false));
        }
      },
      // Provide tags for cache invalidation
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: "UserVoucher", id })),
              { type: "UserVoucher", id: arg.userId },
            ]
          : [{ type: "UserVoucher", id: arg.userId }],
    }),

    // Update voucher status
    updateVoucherStatus: builder.mutation({
      query: ({ voucherId, status }) => ({
        url: `/api/vouchers/update-status`,
        method: "POST",
        body: JSON.stringify({ voucherId, newStatus: status }),
      }),
      // Invalidate the user vouchers cache when a voucher is updated
      invalidatesTags: (result, error, { voucherId }) => [
        { type: "UserVoucher", id: voucherId },
      ],
    }),

    addVoucher: builder.mutation({
      query: (newVoucherPayload) => ({
        url: `/api/vouchers`,
        method: "POST",
        body: JSON.stringify(newVoucherPayload),
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled; // Get the response from the mutation
          // Optionally, you can dispatch an action to add the new voucher to the Redux state
          dispatch(setVoucher(data.data));
        } catch (error) {
          console.error("Failed to add voucher:", error);
        }
      },
    }),

    claimVoucher: builder.mutation({
      query: (claimData) => ({
        url: `/api/vouchers/claim`,
        method: "POST",
        body: JSON.stringify(claimData),
      }),
      // No need for onQueryStarted as we'll handle the response directly in the component
    }),
  }),
});

export const {
  useGetVouchersQuery,
  useGetUserVouchersQuery,
  useUpdateVoucherStatusMutation,
  useAddVoucherMutation,
  useClaimVoucherMutation,
} = vouchersApi;
