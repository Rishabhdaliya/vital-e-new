import api from "../../api";
import {
  setProducts,
  addProduct,
  updateProduct,
  setProductsLoaded,
  removeProduct,
  setPagination,
} from "./productSlice";

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params = {}) => {
        const {
          page = 1,
          pageSize = 10,
          search = "",
          sortBy = "createdAt",
          sortOrder = "desc",
        } = params;
        return {
          url: `/api/products`,
          method: "GET",
          params: { page, pageSize, search, sortBy, sortOrder },
        };
      },
      async onCacheEntryAdded(arg, { cacheDataLoaded, dispatch, getState }) {
        try {
          const state = getState().products;
          if (!state.loaded) {
            const response = await cacheDataLoaded;
            dispatch(setProducts(response.data.data));
            dispatch(setPagination(response.data.pagination));
            dispatch(setProductsLoaded(true)); // Mark as loaded
          }
        } catch (error) {
          console.error("Failed to load products:", error);
        }
      },
    }),
    getProductById: builder.query({
      query: (productId) => ({
        url: `/api/products?id=${productId}`,
        method: "GET",
      }),
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Dispatch an action to update the specific product in the Redux state
          dispatch(updateProduct({ id: productId, ...data }));
        } catch (error) {
          console.error("Failed to get product:", error);
        }
      },
    }),
    addProduct: builder.mutation({
      query: (newProductPayload) => ({
        url: `/api/products`,
        method: "POST",
        body: JSON.stringify(newProductPayload),
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled; // Get the response from the mutation
          // Add the new product to the Redux state
          dispatch(addProduct(data));
        } catch (error) {
          console.error("Failed to add product:", error);
        }
      },
    }),
    updateProduct: builder.mutation({
      query: ({ id, name, quantity }) => ({
        url: `/api/products`,
        method: "PUT",
        body: JSON.stringify({ id, name, quantity }),
      }),
      async onQueryStarted({ id, ...rest }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled; // Get the response from the mutation
          // Dispatch an action to update the specific product in the Redux state
          dispatch(updateProduct(data));
        } catch (error) {
          console.error("Failed to update product:", error);
        }
      },
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/api/products/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Remove the product from the Redux state
          dispatch(removeProduct(id));
        } catch (error) {
          console.error("Failed to delete product:", error);
        }
      },
    }),
  }),
  overrideExisting: true, // This flag allows overriding of existing endpoints
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;
