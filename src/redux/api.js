import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    headers: {
      "Content-Type": "application/json",
    },
  }),
  tagTypes: ["Issue", "Users"],
  endpoints: () => ({}),
});

export default api;
