import { api } from "../../api";
import { setVouchersOptions, setLoading } from "./vouchersSlice";

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
          console.error("Failed to load defect status data:", error);
        } finally {
          // Set loading to false when fetching is complete
          dispatch(setLoading(false));
        }
      },
    }),
    addVoucher: builder.mutation({
      query: (newVoucherayload) => ({
        url: `/api/vouchers`,
        method: "POST",
        body: JSON.stringify(newVoucherayload),
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled; // Get the response from the mutation
          // Optionally, you can dispatch an action to add the new user to the Redux state
          dispatch(setVoucher(data.data));
        } catch (error) {
          console.error("Failed to add user:", error);
        }
      },
    }),
  }),
});

export const { useGetVouchersQuery, useAddVoucherMutation } = vouchersApi;
