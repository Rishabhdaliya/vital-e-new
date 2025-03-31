import { api } from "../../api";
import { setProducts, updateUser, setProductsLoaded } from "./productSlice";

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => ({
        url: `/api/products`,
        method: "GET",
      }),
      async onCacheEntryAdded(arg, { cacheDataLoaded, dispatch, getState }) {
        try {
          const state = getState().products;
          if (!state.loaded) {
            const { data } = await cacheDataLoaded;
            dispatch(setProducts(data));
            dispatch(setProductsLoaded(true)); // Mark as loaded
          }
        } catch (error) {
          console.error("Failed to load products:", error);
        }
      },
    }),
    getUserById: builder.mutation({
      query: ({ productId }) => ({
        url: `/api/products/${productId}`,
        method: "GET",
      }),
      async onQueryStarted({ productId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled; // Get the response from the mutation
          // Dispatch an action to update the specific product in the Redux state
          dispatch(updateUser({ productId, updatedUser: data.data }));
        } catch (error) {
          console.error("Failed to update product:", error);
        }
      },
    }),
    addProduct: builder.mutation({
      query: (newUserPayload) => ({
        url: `/api/products`,
        method: "POST",
        body: JSON.stringify(newUserPayload),
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled; // Get the response from the mutation
          // Optionally, you can dispatch an action to add the new product to the Redux state
          dispatch(setProducts(data.data));
        } catch (error) {
          console.error("Failed to add product:", error);
        }
      },
    }),
    updateProducts: builder.mutation({
      query: ({ productId, updatedUserPayload }) => ({
        url: `/api/products/${productId}`,
        method: "PUT",
        body: JSON.stringify(updatedUserPayload),
      }),
      async onQueryStarted({ productId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled; // Get the response from the mutation
          // Dispatch an action to update the specific product in the Redux state
          dispatch(updateUser({ productId, updatedUser: data.data }));
        } catch (error) {
          console.error("Failed to update product:", error);
        }
      },
    }),
  }),
  overrideExisting: true, // This flag allows overriding of existing endpoints
});

export const { useGetProductsQuery, useAddProductMutation } = productsApi;
