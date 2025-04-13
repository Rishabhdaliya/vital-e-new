"use client";

import { useState, useEffect } from "react";
import {
  useGetUserVouchersQuery,
  useUpdateVoucherStatusMutation,
} from "@/redux/features/vouchers/vouchersApi";
import { useDebounce } from "./useDebounce";

interface UseUserVouchersOptions {
  userId: string;
  initialPage?: number;
  initialPageSize?: number;
  initialSearch?: string;
  initialSearchField?: string;
}

export function useUserVouchersRTK({
  userId,
  initialPage = 1,
  initialPageSize = 10,
  initialSearch = "",
  initialSearchField = "all",
}: UseUserVouchersOptions) {
  // State for search and pagination
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [search, setSearch] = useState(initialSearch);
  const [searchField, setSearchField] = useState(initialSearchField);

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 500);

  // RTK Query hooks
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetUserVouchersQuery({
      userId,
      page,
      pageSize,
      search: debouncedSearch,
      searchField,
    });

  const [updateVoucherStatus, updateStatus] = useUpdateVoucherStatusMutation();

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, searchField]);

  // Extract data and pagination
  const vouchers = data?.data || [];
  const pagination = data?.pagination || {
    page,
    pageSize,
    totalCount: 0,
    totalPages: 0,
  };

  return {
    // Data
    vouchers,
    pagination,

    // Loading states
    isLoading: isLoading || isFetching,
    isError,
    error,

    // Search controls
    search,
    setSearch,
    searchField,
    setSearchField,

    // Pagination controls
    page,
    setPage,
    pageSize,
    setPageSize,

    // Actions
    refetch,
    updateVoucherStatus,
    updateStatusLoading: updateStatus.isLoading,
  };
}
