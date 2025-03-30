"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  ListFilter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import { Voucher, VoucherTableData } from "../types/schema";

export default function VoucherTable({
  vouchers: initialVouchers,
}: VoucherTableData) {
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const toast = useToast();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Filter vouchers based on search query and status filter
  const filteredVouchers = useMemo(() => {
    return vouchers.filter((voucher) => {
      const matchesSearch = voucher.id
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || voucher.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vouchers, searchQuery, statusFilter]);

  // Calculate pagination values
  const totalItems = filteredVouchers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredVouchers.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show at most 5 page numbers

    if (totalPages <= maxPagesToShow) {
      // If we have fewer pages than maxPagesToShow, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);

      // Calculate start and end of middle pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're at the start or end
      if (currentPage <= 2) {
        endPage = 3;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2;
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push("ellipsis1");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("ellipsis2");
      }

      // Always include last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  // Function to update voucher status
  const updateVoucherStatus = async (
    voucherId: string,
    newStatus: "CLAIMED" | "UNCLAIMED" | "EXPIRED"
  ) => {
    try {
      // This would be your actual API call
      // await fetch(`/api/users/${userId}/vouchers/${voucherId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus }),
      // })

      // For demo purposes, we'll just update the state directly
      setVouchers((prev) =>
        prev.map((v) => (v.id === voucherId ? { ...v, status: newStatus } : v))
      );

      toast.toast({
        title: "Status updated",
        description: `Voucher ${voucherId} status changed to ${newStatus}`,
      });
    } catch (error) {
      toast.toast({
        title: "Error updating status",
        description: "There was a problem updating the voucher status.",
        variant: "destructive",
      });
    }
  };

  // Function to get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CLAIMED":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Claimed
          </Badge>
        );
      case "UNCLAIMED":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            <Clock className="mr-1 h-3 w-3" />
            Not Claimed
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-800 hover:bg-red-100"
          >
            <AlertTriangle className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);

    // Scroll to top of table on page change
    const tableElement = document.getElementById("voucher-table");
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number.parseInt(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vouchers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4 items-center">
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Search vouchers..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="w-full"
            />
          </div>
          <div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="CLAIMED">Claimed</SelectItem>
                <SelectItem value="UNCLAIMED">Not Claimed</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full  ">
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger>
                <div className="flex items-center">
                  <ListFilter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Items per page" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="15">15 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border" id="voucher-table">
          <Table>
            <TableCaption>
              Showing {startIndex + 1}-{endIndex} of {totalItems} vouchers
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Voucher ID</TableHead>
                <TableHead>Batch NO</TableHead>
                <TableHead>Date of Issue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No vouchers found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-medium">{voucher.id}</TableCell>
                    <TableCell className="font-medium">
                      {voucher.batchNo}
                    </TableCell>
                    <TableCell>
                      {new Date(voucher.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Change Status{" "}
                            <ChevronDown className="ml-1 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              updateVoucherStatus(voucher.id, "CLAIMED")
                            }
                            disabled={voucher.status === "CLAIMED"}
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Mark as Claimed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateVoucherStatus(voucher.id, "UNCLAIMED")
                            }
                            disabled={voucher.status === "UNCLAIMED"}
                          >
                            <Clock className="mr-2 h-4 w-4 text-amber-500" />
                            Mark as Not Claimed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              updateVoucherStatus(voucher.id, "EXPIRED")
                            }
                            disabled={voucher.status === "EXPIRED"}
                          >
                            <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                            Mark as Expired
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {totalPages > 1 && (
        <CardFooter className="flex justify-between items-center border-t pt-6">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {getPageNumbers().map((page, index) => {
                if (page === "ellipsis1" || page === "ellipsis2") {
                  return (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={currentPage === page}
                      onClick={() => handlePageChange(page as number)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      )}
    </Card>
  );
}
