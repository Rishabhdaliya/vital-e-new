"use client";

import { useGetUsersQuery } from "@/redux/features/users/usersApi";
import { columns } from "@/components/issues/columns";
import { DataTable } from "@/components/issues/data-table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { resetPersistedState } from "@/redux/resetPersistedState";
import { useToast } from "@/hooks/use-toast";
import SyncIcon from "@/lib/icons/syncIcon";
import type { User } from "@/components/types/schema";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelector } from "react-redux";
import { useDebounce } from "@/hooks/useDebounce";

export default function Admin() {
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();
  const currentUser = useSelector((state: any) => state.users.currentUser);

  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data,
    isLoading,
    refetch: refetchUsers,
  } = useGetUsersQuery({
    page,
    pageSize,
    search: debouncedSearchTerm,
    searchField,
    requesterId: currentUser?.id,
    requesterRole: currentUser?.role,
  });

  const handleRefetchData = async (type: string) => {
    try {
      setIsAnimating(type === "issues");
      let results: (User | unknown)[] = [];

      if (type === "all") {
        await resetPersistedState();
        results = await Promise.all([refetchUsers()]);
      }

      const allSuccess = results.every((result) => result !== undefined);
      if (type === "all") {
        toast({
          variant: allSuccess ? "success" : "destructive",
          title: allSuccess ? "Success" : "Error",
          description: allSuccess
            ? "All data (users) refetched successfully."
            : "Some data failed to refetch",
        });
      }
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          (error instanceof Error && error.message) ||
          "Error resetting and refetching data",
      });
    } finally {
      if (type === "issues") {
        setTimeout(() => setIsAnimating(false), 3000); // Stop animation after 3 seconds
      }
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: string) => {
    setPageSize(Number.parseInt(newSize));
    setPage(1); // Reset to first page when changing page size
  };

  // Handle search field change
  const handleSearchFieldChange = (value: string) => {
    setSearchField(value);
    setPage(1); // Reset to first page when changing search field
  };

  // Get pagination data
  const pagination = data?.pagination || {
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  };

  return (
    <>
      <div className=" h-full flex-1 flex-col mt-20 space-y-2 px-2 md:px-8 py-4  flex">
        <div className="flex items-center flex-col md:flex-row  justify-between space-y-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Welcome to Vital-E dashboard!
            </h2>
            <p className="text-muted-foreground text-sm">
              Here&apos;s a list of all registered Dealer, Retailers and
              Customers:
            </p>
          </div>
          <div className="flex  items-center space-x-2">
            <Button
              variant="outline"
              className={
                isAnimating
                  ? "bg-green-400 text-white"
                  : "border-[#f04d46] text-[#f04d46] group cursor-pointer"
              }
              onClick={() => handleRefetchData("issues")}
            >
              <SyncIcon isAnimating={isAnimating} />
              Fetch users
            </Button>
          </div>
        </div>

        {/* Search and filter controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="w-48">
            <Select value={searchField} onValueChange={handleSearchFieldChange}>
              <SelectTrigger>
                <SelectValue placeholder="Search in..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="phoneNo">Phone Number</SelectItem>
                <SelectItem value="city">City</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-32">
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pass the actual users to the DataTable */}
        <DataTable
          data={data?.data || []}
          isLoading={isLoading}
          columns={columns}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </>
  );
}
