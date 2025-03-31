import { api } from "../../api";
import { setVouchersOptions, setLoading, setVoucher } from "./vouchersSlice";

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
  useAddVoucherMutation,
  useClaimVoucherMutation,
} = vouchersApi;
