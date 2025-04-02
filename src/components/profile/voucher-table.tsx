"use client";

import { useState, useCallback, type ChangeEvent } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
} from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";

// Define the Voucher interface
interface Voucher {
  id: string;
  batchNo?: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
  productName?: string;
  status?: "CLAIMED" | "UNCLAIMED" | "EXPIRED";
  barcodeImageUrl?: string;
  barcode?: string;
}

interface VoucherTableProps {
  vouchers: Voucher[];
}

export default function VoucherTable({ vouchers = [] }: VoucherTableProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(5);
  const { toast } = useToast();

  // Memoized filter function to improve performance
  const getFilteredVouchers = useCallback(() => {
    if (!vouchers || !Array.isArray(vouchers)) return [];

    return vouchers.filter((voucher) => {
      // Handle potential undefined values safely
      const batchNo = voucher?.batchNo || "";
      const id = voucher?.id || "";
      const productName = voucher?.productName || "";
      const status = voucher?.status || "";

      const searchTermLower = searchTerm.toLowerCase();

      const matchesSearch =
        batchNo.toLowerCase().includes(searchTermLower) ||
        id.toLowerCase().includes(searchTermLower) ||
        productName.toLowerCase().includes(searchTermLower);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "claimed" && status === "CLAIMED") ||
        (statusFilter === "unclaimed" && status === "UNCLAIMED") ||
        (statusFilter === "expired" && status === "EXPIRED");

      return matchesSearch && matchesStatus;
    });
  }, [vouchers, searchTerm, statusFilter]);

  // Get filtered vouchers
  const filteredVouchers = getFilteredVouchers();

  // Reset to first page when filters change
  const handleFilterChange = (newFilter: string) => {
    setStatusFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Handle status change
  const handleStatusChange = async (voucherId: string, newStatus: string) => {
    try {
      const voucherRef = doc(db, "vouchers", voucherId);
      await updateDoc(voucherRef, {
        status: newStatus,
        updatedAt: new Date(),
      });

      toast({
        title: "Status Updated",
        description: `Voucher status has been updated to ${newStatus}`,
      });

      // Force re-render
      setStatusFilter(statusFilter);
    } catch (error) {
      console.error("Error updating voucher status:", error);
      toast({
        title: "Error",
        description: "Failed to update voucher status",
        variant: "destructive",
      });
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVouchers = filteredVouchers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredVouchers.length / itemsPerPage)
  );

  // Format date safely
  const formatDate = (seconds: number): string => {
    try {
      return new Date(seconds * 1000).toLocaleDateString();
    } catch (error) {
      return "Invalid date";
    }
  };

  // Calculate visible page numbers for pagination
  const getVisiblePageNumbers = (): (number | string)[] => {
    const maxVisiblePages = 5;
    const pageNumbers: (number | string)[] = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are fewer than maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of visible pages
      let startPage = Math.max(
        2,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);

      // Adjust if we're near the end
      if (endPage - startPage < maxVisiblePages - 3) {
        startPage = Math.max(2, totalPages - maxVisiblePages + 2);
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always show last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search vouchers..."
            className="pl-10"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex gap-2  flex-wrap">
          <div className="w-48">
            <Select value={statusFilter} onValueChange={handleFilterChange}>
              <SelectTrigger>
                <div className="flex items-center">
                  <SelectValue placeholder="All Statuses" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="claimed">Claimed</SelectItem>
                <SelectItem value="unclaimed">Not Claimed</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-40 ">
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <SelectValue placeholder="5 per page" />
                </div>
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
      </div>

      <div className="overflow-x-auto border rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-200 ">
              <TableHead>Voucher ID</TableHead>
              <TableHead>Batch NO</TableHead>
              <TableHead>Date of Issue</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentVouchers.length > 0 ? (
              currentVouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-medium">
                    {voucher.id?.substring(0, 12) || ""}...
                  </TableCell>
                  <TableCell>{voucher.batchNo || ""}</TableCell>
                  <TableCell>
                    {voucher.createdAt?.seconds
                      ? formatDate(voucher.createdAt.seconds)
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {voucher.productName || "No product assigned"}
                  </TableCell>
                  <TableCell>
                    {voucher.barcodeImageUrl ? (
                      <div className="w-32 h-12 relative">
                        <img
                          src={voucher.barcodeImageUrl || "/placeholder.svg"}
                          alt={`Barcode for ${voucher.batchNo}`}
                          className="object-contain w-full h-full"
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">No barcode</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {voucher.status === "CLAIMED" ? (
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Claimed
                        </span>
                      </div>
                    ) : voucher.status === "EXPIRED" ? (
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <Clock className="mr-1 h-3 w-3" />
                          Expired
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Not Claimed
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {voucher.status === "CLAIMED" ? (
                      <Select
                        onValueChange={(value) =>
                          handleStatusChange(voucher.id, value)
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EXPIRED">
                            Set as Expired
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs text-gray-500">
                        {voucher.status === "EXPIRED"
                          ? "No actions available"
                          : "Must be claimed first"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  No vouchers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {filteredVouchers.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <div className="mb-4 sm:mb-0">
            Showing {indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, filteredVouchers.length)} of{" "}
            {filteredVouchers.length} vouchers
          </div>

          <div className="flex items-center flex-wrap justify-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex flex-wrap justify-center gap-1 max-w-[300px]">
              {getVisiblePageNumbers().map((number, index) =>
                number === "..." ? (
                  <span key={`ellipsis-${index}`} className="px-2 py-1">
                    ...
                  </span>
                ) : (
                  <button
                    key={`page-${number}`}
                    onClick={() =>
                      typeof number === "number" && setCurrentPage(number)
                    }
                    className={`px-3 py-1 rounded-md ${
                      currentPage === number
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {number}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
