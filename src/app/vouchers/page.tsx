"use client";

import { Suspense } from "react";
import { notFound } from "next/navigation";
import VoucherTable from "@/components/profile/voucher-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useGetVouchersQuery } from "@/redux/features/vouchers/vouchersApi";
import VoucherGenerator from "@/components/VoucherGenerator";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { current } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

function BulkUploadDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Bulk Upload Voucher</Button>
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#f04d46] text-xl text-center">
            Bulk Upload Voucher
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-500 dark:text-gray-100">
            Choose a prefix and quantity to generate vouchers.
          </DialogDescription>
        </DialogHeader>
        <VoucherGenerator />
      </DialogContent>
    </Dialog>
  );
}

export default function VouchersPage() {
  const {
    data: vouchers,
    error,
    isLoading,
  } = useGetVouchersQuery("", {
    refetchOnMountOrArgChange: true, // Automatically refetch when arguments change
    refetchOnReconnect: true, // Refetch when the app reconnects
  });
  const { toast } = useToast();
  const currentUser = useSelector((state: any) => state.users.currentUser);

  if (error) {
    toast({ title: "Error", description: "Failed to load vouchers." });
    return null;
  }

  if (!vouchers && error) {
    notFound();
  }

  return (
    <div className="container mx-auto mt-20 py-6 px-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-[#f04d46] text-2xl font-bold">Vouchers</h1>
        <BulkUploadDialog />
      </div>

      <VoucherTable
        isLoading={isLoading}
        role={currentUser?.role}
        vouchers={vouchers?.data || []}
      />
    </div>
  );
}
