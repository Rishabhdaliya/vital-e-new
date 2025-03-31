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

function BulkUploadDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Bulk Upload Voucher</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Voucher</DialogTitle>
        </DialogHeader>
        <VoucherGenerator />
      </DialogContent>
    </Dialog>
  );
}

export default function VouchersPage() {
  const { data: vouchers, error, isLoading } = useGetVouchersQuery("");
  const { toast } = useToast();

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (error) {
    toast({ title: "Error", description: "Failed to load vouchers." });
    return null;
  }

  if (!vouchers) {
    notFound();
  }

  return (
    <div className="container mx-auto mt-20 py-6 px-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vouchers</h1>
        <BulkUploadDialog />
      </div>
      <Suspense fallback={<TableSkeleton />}>
        <VoucherTable vouchers={vouchers?.data || []} />
      </Suspense>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
