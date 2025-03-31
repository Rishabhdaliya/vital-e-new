"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Voucher } from "../types/schema";

interface VoucherTableProps {
  vouchers: Voucher[];
}

export default function VoucherTable({ vouchers }: VoucherTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Filter vouchers based on search term and status
  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch =
      voucher?.batchNo?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      voucher?.id?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      (voucher.productName &&
        voucher.productName?.toLowerCase().includes(searchTerm?.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "claimed" && voucher.status === "CLAIMED") ||
      (statusFilter === "unclaimed" && voucher.status === "UNCLAIMED");

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVouchers = filteredVouchers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Vouchers</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search vouchers..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <div className="w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <div className="flex items-center">
                  <SelectValue placeholder="All Statuses" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="claimed">Claimed</SelectItem>
                <SelectItem value="unclaimed">Not Claimed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-40">
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(Number.parseInt(value))}
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

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Voucher ID</TableHead>
              <TableHead>Batch NO</TableHead>
              <TableHead>Date of Issue</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentVouchers.length > 0 ? (
              currentVouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-medium">
                    {voucher.id.substring(0, 12)}...
                  </TableCell>
                  <TableCell>{voucher.batchNo}</TableCell>
                  <TableCell>
                    {new Date(
                      voucher.createdAt.seconds * 1000
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {voucher.productName || "No product assigned"}
                  </TableCell>
                  <TableCell>
                    {voucher.status === "CLAIMED" ? (
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Claimed
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
                    <Select>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Change Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="claimed">Set as Claimed</SelectItem>
                        <SelectItem value="unclaimed">
                          Set as Not Claimed
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
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
          <div>
            Showing {indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, filteredVouchers.length)} of{" "}
            {filteredVouchers.length} vouchers
          </div>

          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`px-3 py-1 rounded-md ${
                  currentPage === number
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {number}
              </button>
            ))}

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
